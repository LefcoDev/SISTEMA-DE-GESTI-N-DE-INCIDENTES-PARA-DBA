import { Request, Response } from 'express';
import { Incident, Tag, IncidentTag } from '../models';

export const addTagToIncident = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tagId } = req.body;

    const incident = await Incident.findByPk(id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const tag = await Tag.findByPk(tagId);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Check if already exists
    const existing = await IncidentTag.findOne({
      where: { incident_id: id, tag_id: tagId }
    });

    if (existing) {
      return res.status(400).json({ message: 'Tag already added to incident' });
    }

    await IncidentTag.create({ incident_id: Number(id), tag_id: tagId });
    
    // Increment usage count
    await tag.increment('usage_count');

    // Return updated incident with tags
    const updatedIncident = await Incident.findByPk(id, {
      include: [{ model: Tag, through: { attributes: [] } }]
    });

    res.json(updatedIncident);
  } catch (error) {
    console.error('Error adding tag to incident:', error);
    res.status(500).json({ message: 'Error adding tag to incident' });
  }
};

export const removeTagFromIncident = async (req: Request, res: Response) => {
  try {
    const { id, tagId } = req.params;

    const incidentTag = await IncidentTag.findOne({
      where: { incident_id: id, tag_id: tagId }
    });

    if (!incidentTag) {
      return res.status(404).json({ message: 'Tag not found on incident' });
    }

    await incidentTag.destroy();

    // Decrement usage count
    const tag = await Tag.findByPk(tagId);
    if (tag && tag.usage_count > 0) {
      await tag.decrement('usage_count');
    }

    // Return updated incident with tags
    const updatedIncident = await Incident.findByPk(id, {
      include: [{ model: Tag, through: { attributes: [] } }]
    });

    res.json(updatedIncident);
  } catch (error) {
    console.error('Error removing tag from incident:', error);
    res.status(500).json({ message: 'Error removing tag from incident' });
  }
};
