import User from '../models/User';
import bcrypt from 'bcrypt';
import { AppError } from '../middlewares/error.middleware';

export class UserService {
  public async getAllUsers() {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });
    return users;
  }

  public async createUser(userData: any) {
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await User.create({
      ...userData,
      password: hashedPassword,
      is_active: true
    });

    const userResponse = user.toJSON();
    const { password, ...userWithoutPassword } = userResponse;

    return userWithoutPassword;
  }

  public async updateUser(id: number, userData: any) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if email is being changed and if it's already taken
    if (userData.email && userData.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new AppError('Email already in use', 400);
      }
    }

    const updateData: any = { ...userData };
    
    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    await user.update(updateData);

    const userResponse = user.toJSON();
    const { password, ...userWithoutPassword } = userResponse;

    return userWithoutPassword;
  }

  public async toggleUserStatus(id: number) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent deactivating self
    // This check should ideally be done in controller with req.user context, 
    // but we can do it here if we pass currentUserId. 
    // For now, we'll handle self-check in controller.

    await user.update({ is_active: !user.is_active });
    
    const userResponse = user.toJSON();
    const { password, ...userWithoutPassword } = userResponse;
    
    return userWithoutPassword;
  }

  public async deleteUser(id: number) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await user.destroy();
  }
}

export const userService = new UserService();
