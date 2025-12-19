import Solution from '../models/Solution';
import Incident from '../models/Incident';
import User from '../models/User';

export class SolutionService {
  async create(data: any) {
    return await Solution.create(data);
  }

  async findAll(filters: any = {}) {
    const where: any = {};
    if (filters.incident_id) where.incident_id = filters.incident_id;
    if (filters.is_template !== undefined) where.is_template = filters.is_template;
    if (filters.template_category) where.template_category = filters.template_category;

    return await Solution.findAll({
      where,
      include: [
        { model: Incident, as: 'incident', attributes: ['title', 'status'] },
        { model: User, as: 'applicator', attributes: ['full_name', 'email'] }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async findById(id: number) {
    return await Solution.findByPk(id, {
      include: [
        { model: Incident, as: 'incident' },
        { model: User, as: 'applicator', attributes: ['full_name', 'email'] }
      ]
    });
  }

  async update(id: number, data: any) {
    const solution = await this.findById(id);
    if (!solution) return null;
    return await solution.update(data);
  }

  async delete(id: number) {
    const solution = await this.findById(id);
    if (!solution) return null;
    await solution.destroy();
    return true;
  }

  async getTemplates() {
    return await Solution.findAll({
      where: { is_template: true },
      attributes: ['id', 'template_name', 'template_category', 'description', 'sql_scripts', 'system_commands']
    });
  }
}