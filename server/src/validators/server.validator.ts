import { body } from 'express-validator';

export const createServerValidator = [
  body('name').notEmpty().withMessage('El nombre es requerido').isString(),
  body('host').notEmpty().withMessage('El host es requerido').isString(),
  body('port').notEmpty().withMessage('El puerto es requerido').isInt({ min: 1, max: 65535 }),
  body('engine_type')
    .notEmpty()
    .withMessage('El tipo de motor es requerido')
    .isIn([
      'mysql', 'postgresql', 'sqlserver', 'oracle', 'mongodb',
      'ubuntu', 'debian', 'centos', 'redhat', 'windows', 'other'
    ])
    .withMessage('Tipo de motor o sistema operativo inválido'),
  body('environment')
    .notEmpty()
    .withMessage('El ambiente es requerido')
    .isIn(['development', 'qa', 'staging', 'production'])
    .withMessage('Ambiente inválido'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance'])
    .withMessage('Estado inválido'),
  body('engine_version').optional().isString(),
  body('description').optional().isString(),
];

export const updateServerValidator = [
  body('name').optional().isString(),
  body('host').optional().isString(),
  body('port').optional().isInt({ min: 1, max: 65535 }),
  body('engine_type')
    .optional()
    .isIn([
      'mysql', 'postgresql', 'sqlserver', 'oracle', 'mongodb',
      'ubuntu', 'debian', 'centos', 'redhat', 'windows', 'other'
    ]),
  body('environment')
    .optional()
    .isIn(['development', 'qa', 'staging', 'production']),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance']),
  body('engine_version').optional().isString(),
  body('description').optional().isString(),
];
