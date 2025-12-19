import { Request, Response } from 'express';
import KnowledgeResource from '../models/KnowledgeResource';

export const getResourcesByTopic = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const resources = await KnowledgeResource.findAll({
      where: { topic_id: topicId },
      order: [['created_at', 'DESC']]
    });
    res.json(resources);
  } catch (error) {
    console.error('Error getting resources:', error);
    res.status(500).json({ error: 'Failed to get resources' });
  }
};

export const createResource = async (req: Request, res: Response) => {
  try {
    const { topic_id, title, type, url } = req.body;

    if (!topic_id || !title || !type) {
      return res.status(400).json({ error: 'Topic ID, title, and type are required' });
    }

    const resource = await KnowledgeResource.create({
      topic_id,
      title,
      type,
      url: url || null
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
};

export const updateResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, type, url, is_completed } = req.body;

    const resource = await KnowledgeResource.findByPk(id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    await resource.update({
      title: title !== undefined ? title : resource.title,
      type: type !== undefined ? type : resource.type,
      url: url !== undefined ? url : resource.url,
      is_completed: is_completed !== undefined ? is_completed : resource.is_completed
    });

    res.json(resource);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
};

export const toggleResourceComplete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const resource = await KnowledgeResource.findByPk(id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    await resource.update({
      is_completed: !resource.is_completed
    });

    res.json(resource);
  } catch (error) {
    console.error('Error toggling resource completion:', error);
    res.status(500).json({ error: 'Failed to toggle resource completion' });
  }
};

export const deleteResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const resource = await KnowledgeResource.findByPk(id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    await resource.destroy();
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
};
