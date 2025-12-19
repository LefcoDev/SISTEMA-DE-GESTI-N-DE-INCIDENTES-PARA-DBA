import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { 
  registerValidator, 
  loginValidator, 
  changePasswordValidator, 
  updateProfileValidator 
} from '../validators/auth.validator';

const router = Router();

router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, upload.single('avatar'), updateProfileValidator, authController.updateProfile);
router.put('/change-password', authenticate, changePasswordValidator, authController.changePassword);

export default router;
