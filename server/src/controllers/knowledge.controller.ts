import { Request, Response } from 'express';
import { KnowledgeNugget, User, Tag } from '../models';
import { Op } from 'sequelize';

// Helper function to parse JSON fields
const parseNuggetJsonFields = (nugget: any) => {
  const parsed = nugget.toJSON ? nugget.toJSON() : nugget;
  
  if (parsed.external_references && typeof parsed.external_references === 'string') {
    try {
      parsed.external_references = JSON.parse(parsed.external_references);
    } catch {
      parsed.external_references = [];
    }
  }
  
  if (parsed.applicable_to && typeof parsed.applicable_to === 'string') {
    try {
      parsed.applicable_to = JSON.parse(parsed.applicable_to);
    } catch {
      parsed.applicable_to = [];
    }
  }
  
  return parsed;
};

export const createNugget = async (req: Request, res: Response) => {
  try {
    const {
      title, category, content, code_example, expected_result,
      technology, complexity_level, external_references,
      incident_id, applicable_to, tags
    } = req.body;
    const userId = req.user?.id;

    const nugget = await KnowledgeNugget.create({
      title,
      category,
      content,
      code_example,
      expected_result,
      technology,
      complexity_level,
      external_references: external_references ? JSON.stringify(external_references) : undefined,
      incident_id,
      applicable_to: applicable_to ? JSON.stringify(applicable_to) : undefined,
      created_by: userId!,
      usage_count: 0,
      helpful_count: 0,
      rating_sum: 0,
      rating_count: 0,
      is_verified: false
    });

    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        const [tag] = await Tag.findOrCreate({ where: { name: tagName } });
        // @ts-ignore
        await nugget.addTag(tag);
      }
    }

    const nuggetWithTags = await KnowledgeNugget.findByPk(nugget.id, {
      include: [
        { model: Tag, through: { attributes: [] } },
        { model: User, attributes: ['id', 'full_name'] }
      ]
    });

    res.status(201).json(parseNuggetJsonFields(nuggetWithTags));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getNuggets = async (req: Request, res: Response) => {
  try {
    const { search, category, technology, complexity_level } = req.query;

    const where: any = {};

    if (category) where.category = category;
    if (technology) where.technology = technology;
    if (complexity_level) where.complexity_level = complexity_level;

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { code_example: { [Op.like]: `%${search}%` } }
      ];
    }

    const nuggets = await KnowledgeNugget.findAll({
      where,
      include: [
        { model: User, attributes: ['id', 'full_name'] },
        { model: Tag, through: { attributes: [] } }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(nuggets.map(n => parseNuggetJsonFields(n)));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getNuggetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const nugget = await KnowledgeNugget.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'full_name'] },
        { model: Tag, through: { attributes: [] } }
      ]
    });

    if (!nugget) return res.status(404).json({ message: 'Nugget not found' });

    // Increment usage count
    nugget.usage_count += 1;
    await nugget.save();

    res.json(parseNuggetJsonFields(nugget));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNugget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tags, ...updateData } = req.body;
    const userId = req.user?.id;
    const nugget = await KnowledgeNugget.findByPk(id);

    if (!nugget) return res.status(404).json({ message: 'Nugget not found' });

    if (nugget.created_by !== userId) {
      // TODO: Allow admins to edit
      return res.status(403).json({ message: 'Not authorized' });
    }

    await nugget.update(updateData);

    if (tags && Array.isArray(tags)) {
      const tagInstances = [];
      for (const tagName of tags) {
        const [tag] = await Tag.findOrCreate({ where: { name: tagName } });
        tagInstances.push(tag);
      }
      // @ts-ignore
      await nugget.setTags(tagInstances);
    }

    const updatedNugget = await KnowledgeNugget.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'full_name'] },
        { model: Tag, through: { attributes: [] } }
      ]
    });

    res.json(parseNuggetJsonFields(updatedNugget));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNugget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const nugget = await KnowledgeNugget.findByPk(id);

    if (!nugget) return res.status(404).json({ message: 'Nugget not found' });

    if (nugget.created_by !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await nugget.destroy();
    res.json({ message: 'Nugget deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyNugget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    // Check if user is admin or senior_dba
    if (userRole !== 'admin' && userRole !== 'senior_dba') {
      return res.status(403).json({ message: 'Only admins and senior DBAs can verify nuggets' });
    }
    
    const nugget = await KnowledgeNugget.findByPk(id);
    if (!nugget) return res.status(404).json({ message: 'Nugget not found' });

    nugget.is_verified = true;
    nugget.verified_by = userId;
    nugget.verified_at = new Date();
    await nugget.save();

    res.json(nugget);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markHelpful = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const nugget = await KnowledgeNugget.findByPk(id);

    if (!nugget) return res.status(404).json({ message: 'Nugget not found' });

    nugget.helpful_count += 1;
    await nugget.save();

    res.json(nugget);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const rateNugget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const nugget = await KnowledgeNugget.findByPk(id);
    if (!nugget) return res.status(404).json({ message: 'Nugget not found' });

    nugget.rating_sum += rating;
    nugget.rating_count += 1;
    await nugget.save();

    // Calculate average rating
    const averageRating = nugget.rating_sum / nugget.rating_count;

    res.json({ ...nugget.toJSON(), average_rating: averageRating });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
