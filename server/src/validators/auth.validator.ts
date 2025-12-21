import { body } from 'express-validator';

export const registerValidator = [
  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ max: 255 }).withMessage('Full name must be less than 255 characters'),
    
  body('role')
    .optional()
    .isIn(['admin', 'senior_dba', 'junior_dba']).withMessage('Invalid role')
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required'),
    
  body('password')
    .notEmpty().withMessage('Password is required')
];

export const changePasswordValidator = [
  body('current_password')
    .notEmpty().withMessage('Current password is required'),
    
  body('new_password')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
];

export const updateProfileValidator = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Full name must be between 2 and 255 characters'),
    
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone_number')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Phone number must be less than 20 characters'),

  body('role')
    .optional()
    .isIn(['admin', 'senior_dba', 'junior_dba']).withMessage('Invalid role'),

  body('profile_picture')
    .optional()
    .isString().withMessage('Profile picture must be a string path')
];
