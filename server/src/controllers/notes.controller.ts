import { Request, Response } from 'express';
import { Note, User, Tag, Attachment } from '../models';
import { Op } from 'sequelize';

export const createNote = async (req: Request, res: Response) => {
  try {
    const { title, content, color, type, priority, server_id, incident_id, script_id, is_private, expires_at, shared_with, tags } = req.body;
    const userId = req.user?.id;

    const note = await Note.create({
      title,
      content,
      color,
      type,
      priority,
      server_id,
      incident_id,
      script_id,
      is_private: is_private ?? true,
      expires_at,
      shared_with: shared_with ? JSON.stringify(shared_with) : undefined,
      created_by: userId!,
      kanban_column: 'todo',
      kanban_position: 0,
      views_count: 0,
      is_pinned: false,
      is_archived: false
    });

    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        const [tag] = await Tag.findOrCreate({ where: { name: tagName } });
        // @ts-ignore
        await note.addTag(tag);
      }
    }

    const noteWithTags = await Note.findByPk(note.id, {
      include: [
        { model: Tag, through: { attributes: [] } },
        { model: User, attributes: ['id', 'full_name', 'email'] }
      ]
    });

    res.status(201).json(noteWithTags);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getNotes = async (req: Request, res: Response) => {
  try {
    const { type, server_id, incident_id, script_id, is_archived, search } = req.query;
    const userId = req.user?.id;

    const where: any = {
      [Op.or]: [
        { created_by: userId },
        { is_private: false }
      ]
    };

    if (type) where.type = type;
    if (server_id) where.server_id = server_id;
    if (incident_id) where.incident_id = incident_id;
    if (script_id) where.script_id = script_id;
    
    if (is_archived !== undefined) {
      where.is_archived = is_archived === 'true';
    } else {
      where.is_archived = false; // Default to not showing archived
    }

    if (search) {
      where[Op.and] = [
        {
          [Op.or]: [
            { title: { [Op.like]: `%${search}%` } },
            { content: { [Op.like]: `%${search}%` } }
          ]
        }
      ];
    }

    const notes = await Note.findAll({
      where,
      include: [
        { model: User, attributes: ['id', 'full_name', 'email'] },
        { model: Tag, through: { attributes: [] } },
        { model: Attachment }
      ],
      order: [
        ['is_pinned', 'DESC'],
        ['created_at', 'DESC']
      ]
    });

    res.json(notes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getNoteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const note = await Note.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'full_name', 'email'] },
        { model: Tag, through: { attributes: [] } },
        { model: Attachment }
      ]
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Increment view count
    note.views_count += 1;
    note.last_viewed_at = new Date();
    await note.save();

    res.json(note);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tags, ...updateData } = req.body;
    const userId = req.user?.id;
    
    const note = await Note.findByPk(id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.created_by !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this note' });
    }

    await note.update(updateData);

    if (tags && Array.isArray(tags)) {
      const tagInstances = [];
      for (const tagName of tags) {
        const [tag] = await Tag.findOrCreate({ where: { name: tagName } });
        tagInstances.push(tag);
      }
      // @ts-ignore
      await note.setTags(tagInstances);
    }

    const updatedNote = await Note.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'full_name', 'email'] },
        { model: Tag, through: { attributes: [] } },
        { model: Attachment }
      ]
    });

    res.json(updatedNote);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const note = await Note.findByPk(id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.created_by !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }

    await note.destroy();
    res.json({ message: 'Note deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const togglePinNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const note = await Note.findByPk(id);

    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.is_pinned = !note.is_pinned;
    await note.save();

    res.json(note);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleArchiveNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const note = await Note.findByPk(id);

    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.is_archived = !note.is_archived;
    await note.save();

    res.json(note);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateKanbanPosition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { kanban_column, kanban_position } = req.body;
    const userId = req.user?.id;

    const note = await Note.findByPk(id);

    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.created_by !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (kanban_column) note.kanban_column = kanban_column;
    if (kanban_position !== undefined) note.kanban_position = kanban_position;
    await note.save();

    res.json(note);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const duplicateNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const originalNote = await Note.findByPk(id, {
      include: [{ model: Tag }]
    });

    if (!originalNote) return res.status(404).json({ message: 'Note not found' });

    // Create duplicate
    const duplicate = await Note.create({
      title: `${originalNote.title} (Copy)`,
      content: originalNote.content,
      color: originalNote.color,
      type: originalNote.type,
      priority: originalNote.priority,
      server_id: originalNote.server_id,
      incident_id: originalNote.incident_id,
      script_id: originalNote.script_id,
      is_private: originalNote.is_private,
      created_by: userId!,
      kanban_column: 'todo',
      kanban_position: 0,
      views_count: 0,
      is_pinned: false,
      is_archived: false
    });

    // Copy tags
    // @ts-ignore
    if (originalNote.Tags && originalNote.Tags.length > 0) {
      // @ts-ignore
      await duplicate.setTags(originalNote.Tags);
    }

    const duplicateWithTags = await Note.findByPk(duplicate.id, {
      include: [
        { model: Tag, through: { attributes: [] } },
        { model: User, attributes: ['id', 'full_name', 'email'] }
      ]
    });

    res.status(201).json(duplicateWithTags);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
