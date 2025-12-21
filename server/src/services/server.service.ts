import Server from '../models/Server';
import notificationService from './notification.service';

export class ServerService {
  async findAll() {
    return await Server.findAll({
      order: [['name', 'ASC']],
    });
  }

  async findById(id: number) {
    return await Server.findByPk(id);
  }

  async create(data: any, userId: number) {
    return await Server.create({
      ...data,
      created_by: userId,
    });
  }

  async update(id: number, data: any) {
    const server = await Server.findByPk(id);
    if (!server) return null;
    return await server.update(data);
  }

  async delete(id: number) {
    const server = await Server.findByPk(id);
    if (!server) return null;

    // Delete associated notifications
    await notificationService.deleteNotificationsForEntity('server', id);

    return await server.destroy();
  }
}
