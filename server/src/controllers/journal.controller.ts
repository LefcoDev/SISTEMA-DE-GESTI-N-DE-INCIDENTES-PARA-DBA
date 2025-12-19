import { Request, Response } from 'express';
import { JournalEntry } from '../models';
import { Op } from 'sequelize';

export const createOrUpdateEntry = async (req: Request, res: Response) => {
  try {
    const {
      entry_date, what_i_did, what_i_learned, problems_faced,
      pending_tomorrow, important_notes, mood, daily_tags,
      achievements, incidents_worked, scripts_executed, time_tracked_minutes
    } = req.body;
    const userId = req.user?.id;

    // Check if entry exists for this date
    let entry = await JournalEntry.findOne({
      where: {
        user_id: userId,
        entry_date: entry_date
      }
    });

    if (entry) {
      // Update
      await entry.update({
        what_i_did, what_i_learned, problems_faced,
        pending_tomorrow, important_notes, mood,
        daily_tags: daily_tags ? JSON.stringify(daily_tags) : undefined,
        achievements: achievements ? JSON.stringify(achievements) : undefined,
        incidents_worked,
        scripts_executed,
        time_tracked_minutes
      });
    } else {
      // Create
      entry = await JournalEntry.create({
        user_id: userId!,
        entry_date,
        what_i_did,
        what_i_learned,
        problems_faced,
        pending_tomorrow,
        important_notes,
        mood,
        daily_tags: daily_tags ? JSON.stringify(daily_tags) : undefined,
        achievements: achievements ? JSON.stringify(achievements) : undefined,
        incidents_worked,
        scripts_executed,
        time_tracked_minutes
      });
    }

    res.json(entry);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEntries = async (req: Request, res: Response) => {
  try {
    const { from_date, to_date } = req.query;
    const userId = req.user?.id;

    const where: any = {
      user_id: userId
    };

    if (from_date && to_date) {
      where.entry_date = {
        [Op.between]: [from_date, to_date]
      };
    }

    const entries = await JournalEntry.findAll({
      where,
      order: [['entry_date', 'DESC']]
    });

    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEntryByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const userId = req.user?.id;

    const entry = await JournalEntry.findOne({
      where: {
        user_id: userId,
        entry_date: date
      }
    });

    if (!entry) {
      // Return empty entry structure instead of 404, allowing frontend to create new entry
      return res.json(null);
    }

    res.json(entry);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
