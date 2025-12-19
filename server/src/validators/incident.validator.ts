import { body } from 'express-validator';

export const createIncidentValidator = [
  body('title').notEmpty().withMessage('El título es requerido').isString(),
  body('description').notEmpty().withMessage('La descripción es requerida').isString(),
  body('server_id').notEmpty().withMessage('El servidor es requerido').isInt(),
  body('type')
    .notEmpty()
    .withMessage('El tipo es requerido')
    .isIn([
      'performance',
      'availability',
      'data_corruption',
      'backup_restore',
      'replication',
      'security',
      'capacity',
      'slow_query',
      'deadlock',
      'other',
    ])
    .withMessage('Tipo inválido'),
  body('severity')
    .notEmpty()
    .withMessage('La severidad es requerida')
    .isIn(['critical', 'high', 'medium', 'low'])
    .withMessage('Severidad inválida'),
  body('detected_at').notEmpty().withMessage('La fecha de detección es requerida').isISO8601(),
  body('status')
    .optional()
    .isIn(['new', 'in_progress', 'waiting', 'resolved', 'closed'])
    .withMessage('Estado inválido'),
  body('assigned_to').optional().isInt(),
  body('impact').optional().isIn(['critical', 'high', 'medium', 'low']),
];

export const updateIncidentValidator = [
  body('title').optional().isString(),
  body('description').optional().isString(),
  body('server_id').optional().isInt(),
  body('type')
    .optional()
    .isIn([
      'performance',
      'availability',
      'data_corruption',
      'backup_restore',
      'replication',
      'security',
      'capacity',
      'slow_query',
      'deadlock',
      'other',
    ]),
  body('severity').optional().isIn(['critical', 'high', 'medium', 'low']),
  body('detected_at').optional().isISO8601(),
  body('status')
    .optional()
    .isIn(['new', 'in_progress', 'waiting', 'resolved', 'closed']),
  body('assigned_to').optional().isInt(),
  body('impact').optional().isIn(['critical', 'high', 'medium', 'low']),
  body('resolution_time_minutes').optional().isInt(),
  body('started_work_at').optional().isISO8601(),
  body('resolved_at').optional().isISO8601(),
  body('closed_at').optional().isISO8601(),
];
