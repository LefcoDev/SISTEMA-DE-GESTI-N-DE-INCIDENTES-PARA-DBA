import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { AppError } from '../middlewares/error.middleware';

export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'secret';
  private readonly jwtExpiration = process.env.JWT_EXPIRATION || '24h';

  public async register(userData: any) {
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await User.create({
      ...userData,
      password: hashedPassword
    });

    const token = this.generateToken(user);

    // Remove password from response
    const userResponse = user.toJSON();
    const { password, ...userWithoutPassword } = userResponse;

    return { user: userWithoutPassword, token };
  }

  public async login(credentials: any) {
    const user = await User.findOne({ where: { email: credentials.email } });
    
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.is_active) {
      throw new AppError('Account suspended. Please contact administrator.', 403);
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await user.update({ last_login: new Date() });

    const token = this.generateToken(user);

    const userResponse = user.toJSON();
    const { password, ...userWithoutPassword } = userResponse;

    return { user: userWithoutPassword, token };
  }

  public async getUserById(id: number) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    const userResponse = user.toJSON();
    const { password, ...userWithoutPassword } = userResponse;
    
    return userWithoutPassword;
  }

  public async updateProfile(id: number, data: any) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await user.update(data);
    
    const userResponse = user.toJSON();
    const { password, ...userWithoutPassword } = userResponse;
    
    return userWithoutPassword;
  }

  public async changePassword(id: number, data: any) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(data.current_password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid current password', 400);
    }

    const hashedPassword = await bcrypt.hash(data.new_password, 10);
    await user.update({ password: hashedPassword });
  }

  private generateToken(user: User): string {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      this.jwtSecret as any,
      { expiresIn: this.jwtExpiration } as any
    );
  }
}

export const authService = new AuthService();
