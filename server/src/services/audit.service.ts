import AuditLog from '../models/AuditLog';
import User from '../models/User';

export class AuditService {
  async log(data: {
    user_id: number;
    action: string;
    entity_type: string;
    entity_id?: number;
    old_value?: any;
    new_value?: any;
    ip_address?: string;
    user_agent?: string;
  }) {
    try {
      await AuditLog.create({
        ...data,
        old_value: data.old_value ? JSON.stringify(data.old_value) : undefined,
        new_value: data.new_value ? JSON.stringify(data.new_value) : undefined,
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw error to prevent blocking main operation
    }
  }

  async findAll(filters: any = {}) {
    const where: any = {};
    if (filters.user_id) where.user_id = filters.user_id;
    if (filters.entity_type) where.entity_type = filters.entity_type;
    if (filters.action) where.action = filters.action;

    return await AuditLog.findAll({
      where,
      include: [
        { model: User, attributes: ['full_name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 100 // Limit to last 100 logs by default
    });
  }

  async delete(id: number) {
    return await AuditLog.destroy({
      where: { id }
    });
  }
}
