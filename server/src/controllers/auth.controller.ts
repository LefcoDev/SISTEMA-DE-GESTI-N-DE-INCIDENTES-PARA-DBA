import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { authService } from '../services/auth.service';
import { AppError } from '../middlewares/error.middleware';
import { AuditService } from '../services/audit.service';

const auditService = new AuditService();

export class AuthController {
  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
      }

      const result = await authService.register(req.body);
      
      // Log registration
      await auditService.log({
        user_id: result.user.id,
        action: 'REGISTER',
        entity_type: 'USER',
        entity_id: result.user.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
      }

      const result = await authService.login(req.body);

      // Log login
      await auditService.log({
        user_id: result.user.id,
        action: 'LOGIN',
        entity_type: 'AUTH',
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      // Log failed login attempt if we can identify the user (optional, but good for security)
      // For now, we skip it to avoid complexity with finding user by email again
      next(error);
    }
  }

  public async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new AppError('Not authenticated', 401));
      }

      const user = await authService.getUserById(req.user.id);
      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new AppError('Not authenticated', 401));
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
      }

      const updateData = { ...req.body };
      if (req.file) {
        // Solo guardamos el nombre del archivo, no la ruta completa
        // El servidor lo servirá desde UPLOAD_DIR/avatars/
        updateData.profile_picture = req.file.filename;
      }

      const user = await authService.updateProfile(req.user.id, updateData);
      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  public async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new AppError('Not authenticated', 401));
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
      }

      await authService.changePassword(req.user.id, req.body);

      // Log password change
      await auditService.log({
        user_id: req.user.id,
        action: 'CHANGE_PASSWORD',
        entity_type: 'USER',
        entity_id: req.user.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response) {
    // Since JWT is stateless, we just return success.
    // Client should remove the token.
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}

export const authController = new AuthController();
