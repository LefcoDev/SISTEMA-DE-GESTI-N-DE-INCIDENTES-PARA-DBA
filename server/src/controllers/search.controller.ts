import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Incident from '../models/Incident';
import Server from '../models/Server';
import Script from '../models/Script';
import Solution from '../models/Solution';

export const searchGlobal = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.length < 2) {
      return res.json({
        incidents: [],
        servers: [],
        scripts: [],
        solutions: []
      });
    }

    const searchTerm = `%${query}%`;

    const [incidents, servers, scripts, solutions] = await Promise.all([
      Incident.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: searchTerm } },
            { description: { [Op.like]: searchTerm } }
          ]
        } as any,
        limit: 5,
        include: ['server']
      }),
      Server.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: searchTerm } },
            { host: { [Op.like]: searchTerm } }
          ]
        } as any,
        limit: 5
      }),
      Script.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: searchTerm } },
            { description: { [Op.like]: searchTerm } },
            { code: { [Op.like]: searchTerm } }
          ]
        } as any,
        limit: 5
      }),
      Solution.findAll({
        where: {
          [Op.or]: [
            { description: { [Op.like]: searchTerm } },
            { result_obtained: { [Op.like]: searchTerm } }
          ]
        } as any,
        limit: 5
      })
    ]);

    res.json({
      incidents,
      servers,
      scripts,
      solutions
    });
  } catch (error) {
    console.error('Error performing global search:', error);
    res.status(500).json({ message: 'Error performing search' });
  }
};
