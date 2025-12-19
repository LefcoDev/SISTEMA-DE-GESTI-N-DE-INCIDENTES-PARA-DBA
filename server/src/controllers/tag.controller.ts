import { Request, Response } from 'express';
import { Tag } from '../models';

export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await Tag.findAll({
      order: [['name', 'ASC']]
    });
    res.json(tags);
  } catch (error) {
    console.error('Error getting tags:', error);
    res.status(500).json({ message: 'Error getting tags' });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;
    const tag = await Tag.create({ name, color });
    res.status(201).json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ message: 'Error creating tag' });
  }
};

export const updateTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    await tag.update({ name, color });
    res.json(tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ message: 'Error updating tag' });
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tag = await Tag.findByPk(id);
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    if (tag.usage_count > 0) {
      return res.status(400).json({ message: 'Cannot delete tag that is in use' });
    }

    await tag.destroy();
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ message: 'Error deleting tag' });
  }
};
