import { Sequelize } from 'sequelize';
import Script from '../models/Script';
import User from '../models/User';
import Server from '../models/Server';
import Tag from '../models/Tag';
import ExecutionHistory from '../models/ExecutionHistory';

export class ScriptService {
  async create(data: any) {
    const { tags, ...scriptData } = data;
    const script = await Script.create(scriptData);

    if (tags && Array.isArray(tags)) {
      // tags ahora es array de IDs, no nombres
      const tagInstances = await Tag.findAll({ where: { id: tags } });
      await script.setTags(tagInstances);
      
      // Increment usage count for each tag
      for (const tag of tagInstances) {
        await tag.increment('usage_count');
      }
    }

    return this.findById(script.id);
  }

  async findAll(filters: any = {}) {
    const where: any = {};
    if (filters.language) where.language = filters.language;
    if (filters.category) where.category = filters.category;
    if (filters.engine_compatible) where.engine_compatible = filters.engine_compatible;

    return await Script.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'full_name', 'email'] },
        { model: Tag, through: { attributes: [] } }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async findById(id: number) {
    return await Script.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'full_name', 'email'] },
        { model: Tag, through: { attributes: [] } }
      ]
    });
  }

  async update(id: number, data: any) {
    const script = await Script.findByPk(id);
    if (!script) return null;

    const { tags, ...scriptData } = data;
    await script.update(scriptData);

    if (tags && Array.isArray(tags)) {
      // Get current tags to decrement usage
      const currentTags = await script.getTags();
      
      // tags ahora es array de IDs, no nombres
      const newTagInstances = await Tag.findAll({ where: { id: tags } });
      await script.setTags(newTagInstances);
      
      // Decrement usage count for removed tags
      for (const oldTag of currentTags) {
        if (!newTagInstances.find((t: Tag) => t.id === oldTag.id)) {
          if (oldTag.usage_count > 0) {
            await oldTag.decrement('usage_count');
          }
        }
      }
      
      // Increment usage count for new tags
      for (const newTag of newTagInstances) {
        if (!currentTags.find((t: Tag) => t.id === newTag.id)) {
          await newTag.increment('usage_count');
        }
      }
    }

    return this.findById(id);
  }

  async delete(id: number) {
    const script = await this.findById(id);
    if (!script) return null;
    
    // Decrement usage count for all tags before deleting
    const tags = await script.getTags();
    for (const tag of tags) {
      if (tag.usage_count > 0) {
        await tag.decrement('usage_count');
      }
    }
    
    await script.destroy();
    return true;
  }

  async incrementUsage(id: number) {
    const script = await this.findById(id);
    if (!script) return null;
    return await script.increment('usage_count');
  }

  async execute(scriptId: number, serverId: number, credentials: any, userId?: number) {
    const script = await this.findById(scriptId);
    if (!script) throw new Error('Script not found');

    const server = await Server.findByPk(serverId);
    if (!server) throw new Error('Server not found');

    if (script.language === 'sql') {
       // Create temporary connection
       // Note: This assumes the engine_type matches Sequelize dialect names
       // mysql, postgres, mssql (sqlserver), etc.
       let dialect = server.engine_type;
       if (dialect === 'sqlserver') dialect = 'mssql' as any;
       if (dialect === 'postgresql') dialect = 'postgres' as any;

       const tempSequelize = new Sequelize(
         'sys', // Default DB to connect to. Might need to be parameterized.
         credentials.username,
         credentials.password,
         {
           host: server.host,
           port: server.port,
           dialect: dialect as any,
           logging: false
         }
       );

       try {
         await tempSequelize.authenticate();
         const [results] = await tempSequelize.query(script.code);
         await tempSequelize.close();
         
         await this.incrementUsage(scriptId);
         
         // Log execution history
         if (userId) {
           await ExecutionHistory.create({
             script_id: scriptId,
             server_id: serverId,
             script_content: script.code,
             executed_by: userId,
             executed_at: new Date(),
             execution_status: 'success',
             rows_affected: Array.isArray(results) ? results.length : 0
           });
         }

         return results;
       } catch (error: any) {
         // Ensure connection is closed even on error
         try { await tempSequelize.close(); } catch (e) {}
         
         // Log failed execution
         if (userId) {
           await ExecutionHistory.create({
             script_id: scriptId,
             server_id: serverId,
             script_content: script.code,
             executed_by: userId,
             executed_at: new Date(),
             execution_status: 'failed',
             error_message: error.message
           });
         }
         
         throw error;
       }
    } else {
      throw new Error('Only SQL scripts are supported for execution at this moment');
    }
  }
}
