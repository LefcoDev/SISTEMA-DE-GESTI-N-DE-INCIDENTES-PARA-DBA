import { Request, Response } from 'express';
import KnowledgeTopic from '../models/KnowledgeTopic';
import User from '../models/User';

export const getAllTopics = async (req: Request, res: Response) => {
  try {
    const topics = await KnowledgeTopic.findAll({
      include: [{
        model: User,
        attributes: ['id', 'full_name']
      }],
      order: [['updated_at', 'DESC']]
    });
    res.json(topics);
  } catch (error) {
    console.error('Error getting topics:', error);
    res.status(500).json({ error: 'Failed to get topics' });
  }
};

export const getTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const topic = await KnowledgeTopic.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'full_name']
      }]
    });
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    res.json(topic);
  } catch (error) {
    console.error('Error getting topic:', error);
    res.status(500).json({ error: 'Failed to get topic' });
  }
};

export const createTopic = async (req: Request, res: Response) => {
  try {
    const { title, description, status, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const topic = await KnowledgeTopic.create({
      title,
      description,
      status: status || 'to_learn',
      tags: tags || [],
      created_by: userId
    });

    const topicWithUser = await KnowledgeTopic.findByPk(topic.id, {
      include: [{
        model: User,
        attributes: ['id', 'full_name']
      }]
    });

    res.status(201).json(topicWithUser);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
};

export const updateTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const topic = await KnowledgeTopic.findByPk(id);
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    if (topic.created_by !== userId) {
      return res.status(403).json({ error: 'You can only update your own topics' });
    }

    await topic.update({
      title: title !== undefined ? title : topic.title,
      description: description !== undefined ? description : topic.description,
      status: status !== undefined ? status : topic.status,
      tags: tags !== undefined ? tags : topic.tags
    });

    const updatedTopic = await KnowledgeTopic.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'full_name']
      }]
    });

    res.json(updatedTopic);
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const topic = await KnowledgeTopic.findByPk(id);
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    if (topic.created_by !== userId) {
      return res.status(403).json({ error: 'You can only delete your own topics' });
    }

    await topic.destroy();
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
};
