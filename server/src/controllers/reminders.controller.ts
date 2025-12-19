import { Request, Response } from 'express';
import { Reminder, User } from '../models';
import { Op } from 'sequelize';

export const createReminder = async (req: Request, res: Response) => {
  try {
    const {
      title, description, scheduled_at, type, recurrence_pattern,
      priority, notification_channels, advance_notice_minutes,
      server_id, incident_id, script_id, note_id
    } = req.body;
    const userId = req.user?.id;

    // Validation
    if (!title || !scheduled_at || !type) {
      return res.status(400).json({ message: 'Title, scheduled_at, and type are required' });
    }

    const scheduledDate = new Date(scheduled_at);
    if (scheduledDate < new Date()) {
      return res.status(400).json({ message: 'Scheduled date must be in the future' });
    }

    if (type === 'recurring' && !recurrence_pattern) {
      return res.status(400).json({ message: 'Recurrence pattern is required for recurring reminders' });
    }

    const reminder = await Reminder.create({
      title,
      description,
      scheduled_at,
      type,
      recurrence_pattern,
      priority,
      notification_channels,
      advance_notice_minutes,
      server_id,
      incident_id,
      script_id,
      note_id,
      created_by: userId!,
      status: 'pending',
      is_auto_generated: false
    });

    res.status(201).json(reminder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getReminders = async (req: Request, res: Response) => {
  try {
    const { status, from_date, to_date } = req.query;
    const userId = req.user?.id;

    const where: any = {
      created_by: userId
    };

    if (status) {
      where.status = status;
    }

    if (from_date && to_date) {
      where.scheduled_at = {
        [Op.between]: [from_date, to_date]
      };
    }

    const reminders = await Reminder.findAll({
      where,
      order: [['scheduled_at', 'ASC']]
    });

    res.json(reminders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const reminder = await Reminder.findByPk(id);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (reminder.created_by !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await reminder.update(req.body);
    res.json(reminder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const reminder = await Reminder.findByPk(id);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (reminder.created_by !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await reminder.destroy();
    res.json({ message: 'Reminder deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const completeReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reminder = await Reminder.findByPk(id);

    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });

    reminder.status = 'completed';
    reminder.completed_at = new Date();
    await reminder.save();

    res.json(reminder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const snoozeReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { snooze_until } = req.body;
    
    if (!snooze_until) {
      return res.status(400).json({ message: 'snooze_until is required' });
    }

    const snoozeDate = new Date(snooze_until);
    if (snoozeDate < new Date()) {
      return res.status(400).json({ message: 'Snooze date must be in the future' });
    }

    const reminder = await Reminder.findByPk(id);

    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });

    reminder.status = 'snoozed';
    reminder.snooze_until = snooze_until;
    await reminder.save();

    res.json(reminder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
