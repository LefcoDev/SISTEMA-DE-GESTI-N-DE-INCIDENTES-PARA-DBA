import { Op } from 'sequelize';
import Incident from '../models/Incident';
import Server from '../models/Server';
import Solution from '../models/Solution';
import Tag from '../models/Tag';
import User from '../models/User';
import logger from '../utils/logger';

interface SimilarityFactors {
  textScore: number;
  typeScore: number;
  serverScore: number;
  tagScore: number;
  severityScore: number;
}

interface SimilarIncidentResult {
  id: number;
  title: string;
  similarity_score: number;
  type: string;
  status: string;
  severity: string;
  resolved_at: Date | null;
  server: {
    id: number;
    name: string;
    engine_type: string;
  } | null;
  solutions: Array<{
    id: number;
    description: string;
    sql_scripts: string | null;
    system_commands: string | null;
    time_spent_minutes: number | null;
    result_obtained: string | null;
  }>;
  tags: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}

export class SimilarityService {
  private readonly STOPWORDS = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
    'de', 'del', 'en', 'con', 'por', 'para', 'al', 'a',
    'es', 'son', 'esta', 'este', 'estan', 'fue', 'ser',
    'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'of', 'to', 'in',
    'on', 'at', 'by', 'for', 'with', 'from', 'as', 'and', 'or',
    'but', 'if', 'then', 'than', 'that', 'this', 'these', 'those'
  ]);

  private readonly TECHNICAL_TERMS = new Set([
    'query', 'select', 'insert', 'update', 'delete', 'index', 'table',
    'database', 'connection', 'timeout', 'error', 'performance', 'slow',
    'lento', 'tablespace', 'datafile', 'backup', 'restore', 'replication',
    'deadlock', 'lock', 'transaction', 'commit', 'rollback', 'cpu', 'memory',
    'disk', 'space', 'full', 'lleno', 'conexion', 'consulta', 'servidor'
  ]);

  /**
   * Find similar incidents based on advanced similarity algorithm
   */
  async findSimilarIncidents(incidentId: number, limit: number = 5): Promise<SimilarIncidentResult[]> {
    try {
      const incident = await Incident.findByPk(incidentId, {
        include: [
          { model: Server, as: 'server' },
          { model: Tag, through: { attributes: [] } }
        ]
      });

      if (!incident) {
        throw new Error('Incident not found');
      }

      const keywords = this.extractKeywords(incident.title, incident.description);
      const candidates = await this.findCandidates(keywords, incident);
      
      if (candidates.length === 0) {
        return [];
      }

      const scoredIncidents = await Promise.all(
        candidates.map(async (candidate) => {
          const score = await this.calculateSimilarityScore(incident, candidate, keywords);
          return { candidate, score };
        })
      );

      const sortedIncidents = scoredIncidents
        .filter(item => item.score > 20)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return sortedIncidents.map(item => this.formatResult(item.candidate, item.score));
    } catch (error) {
      logger.error('Error finding similar incidents:', error);
      throw error;
    }
  }

  /**
   * Extract keywords from text using TF-IDF-like approach
   */
  private extractKeywords(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    
    const words = text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.STOPWORDS.has(word));

    const wordFrequency = new Map<string, number>();
    words.forEach(word => {
      const count = wordFrequency.get(word) || 0;
      wordFrequency.set(word, count + 1);
    });

    const weightedWords = Array.from(wordFrequency.entries())
      .map(([word, freq]) => ({
        word,
        weight: freq * (this.TECHNICAL_TERMS.has(word) ? 2 : 1)
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 15)
      .map(item => item.word);

    return weightedWords;
  }

  /**
   * Find candidate incidents for comparison
   */
  private async findCandidates(keywords: string[], incident: any): Promise<any[]> {
    const searchConditions = [];

    if (keywords.length > 0) {
      const keywordPattern = keywords.join('|');
      searchConditions.push({
        [Op.or]: [
          { title: { [Op.regexp]: keywordPattern } },
          { description: { [Op.regexp]: keywordPattern } }
        ]
      });
    }

    searchConditions.push({ type: incident.type });

    if (incident.server?.engine_type) {
      const serversWithSameEngine = await Server.findAll({
        where: { engine_type: incident.server.engine_type },
        attributes: ['id']
      });
      const serverIds = serversWithSameEngine.map(s => s.id);
      
      if (serverIds.length > 0) {
        searchConditions.push({ server_id: { [Op.in]: serverIds } });
      }
    }

    const candidates = await Incident.findAll({
      where: {
        id: { [Op.ne]: incident.id },
        status: { [Op.in]: ['resolved', 'closed'] },
        [Op.or]: searchConditions
      },
      include: [
        { 
          model: Server, 
          as: 'server',
          attributes: ['id', 'name', 'engine_type']
        },
        {
          model: Solution,
          as: 'solutions',
          attributes: ['id', 'description', 'sql_scripts', 'system_commands', 'time_spent_minutes', 'result_obtained']
        },
        {
          model: Tag,
          through: { attributes: [] },
          attributes: ['id', 'name', 'color']
        }
      ],
      limit: 50
    });

    return candidates;
  }

  /**
   * Calculate similarity score between two incidents
   */
  private async calculateSimilarityScore(
    incident: any,
    candidate: any,
    incidentKeywords: string[]
  ): Promise<number> {
    const candidateKeywords = this.extractKeywords(candidate.title, candidate.description);

    const factors: SimilarityFactors = {
      textScore: this.calculateTextSimilarity(incidentKeywords, candidateKeywords),
      typeScore: this.calculateTypeScore(incident.type, candidate.type),
      serverScore: this.calculateServerScore(incident, candidate),
      tagScore: await this.calculateTagScore(incident.id, candidate.id),
      severityScore: this.calculateSeverityScore(incident.severity, candidate.severity)
    };

    const finalScore = this.calculateFinalScore(factors);

    logger.debug(`Similarity scores for incident ${candidate.id}: ${JSON.stringify(factors)} = ${finalScore}`);

    return finalScore;
  }

  /**
   * Calculate text similarity using Jaccard coefficient
   */
  private calculateTextSimilarity(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 || keywords2.length === 0) {
      return 0;
    }

    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    const jaccardIndex = intersection.size / union.size;
    
    return jaccardIndex * 40;
  }

  /**
   * Calculate type similarity score
   */
  private calculateTypeScore(type1: string, type2: string): number {
    return type1 === type2 ? 25 : 0;
  }

  /**
   * Calculate server similarity score
   */
  private calculateServerScore(incident1: any, incident2: any): number {
    if (!incident1.server || !incident2.server) {
      return 0;
    }

    if (incident1.server_id === incident2.server_id) {
      return 15;
    }

    if (incident1.server.engine_type === incident2.server.engine_type) {
      return 7;
    }

    return 0;
  }

  /**
   * Calculate tag similarity score
   */
  private async calculateTagScore(incidentId1: number, incidentId2: number): Promise<number> {
    try {
      const incident1 = await Incident.findByPk(incidentId1, {
        include: [{ model: Tag, through: { attributes: [] } }]
      });

      const incident2 = await Incident.findByPk(incidentId2, {
        include: [{ model: Tag, through: { attributes: [] } }]
      });

      const tags1 = (incident1 as any)?.Tags?.map((t: any) => t.id) || [];
      const tags2 = (incident2 as any)?.Tags?.map((t: any) => t.id) || [];

      if (tags1.length === 0 || tags2.length === 0) {
        return 0;
      }

      const set1 = new Set(tags1);
      const set2 = new Set(tags2);
      
      const intersection = new Set([...set1].filter(x => set2.has(x)));
      const union = new Set([...set1, ...set2]);

      const jaccardIndex = intersection.size / union.size;
      
      return jaccardIndex * 15;
    } catch (error) {
      logger.error('Error calculating tag score:', error);
      return 0;
    }
  }

  /**
   * Calculate severity similarity score
   */
  private calculateSeverityScore(severity1: string, severity2: string): number {
    return severity1 === severity2 ? 5 : 0;
  }

  /**
   * Calculate final weighted score
   */
  private calculateFinalScore(factors: SimilarityFactors): number {
    const total = 
      factors.textScore +
      factors.typeScore +
      factors.serverScore +
      factors.tagScore +
      factors.severityScore;

    return Math.round(Math.min(total, 100));
  }

  /**
   * Format result for API response
   */
  private formatResult(incident: any, score: number): SimilarIncidentResult {
    return {
      id: incident.id,
      title: incident.title,
      similarity_score: score,
      type: incident.type,
      status: incident.status,
      severity: incident.severity,
      resolved_at: incident.resolved_at,
      server: incident.server ? {
        id: incident.server.id,
        name: incident.server.name,
        engine_type: incident.server.engine_type
      } : null,
      solutions: incident.solutions?.map((solution: any) => ({
        id: solution.id,
        description: solution.description,
        sql_scripts: solution.sql_scripts,
        system_commands: solution.system_commands,
        time_spent_minutes: solution.time_spent_minutes,
        result_obtained: solution.result_obtained
      })) || [],
      tags: incident.Tags?.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color
      })) || []
    };
  }
}

export default new SimilarityService();
