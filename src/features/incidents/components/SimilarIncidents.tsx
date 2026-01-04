import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LightBulbIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import api from '../../../lib/axios';

interface Solution {
  id: number;
  description: string;
  sql_scripts: string | null;
  system_commands: string | null;
  time_spent_minutes: number | null;
  result_obtained: string | null;
}

interface SimilarIncident {
  id: number;
  title: string;
  similarity_score: number;
  type: string;
  status: string;
  severity: string;
  resolved_at: string | null;
  server: {
    id: number;
    name: string;
    engine_type: string;
  } | null;
  solutions: Solution[];
  tags: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}

interface SimilarIncidentsProps {
  incidentId: number;
  onApplySolution?: (solution: Solution) => void;
}

export default function SimilarIncidents({ incidentId, onApplySolution }: SimilarIncidentsProps) {
  const [similarIncidents, setSimilarIncidents] = useState<SimilarIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSimilarIncidents();
  }, [incidentId]);

  const fetchSimilarIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/incidents/${incidentId}/similar`);
      setSimilarIncidents(response.data);
    } catch (err: any) {
      console.error('Error fetching similar incidents:', err);
      setError('No se pudieron cargar los incidentes similares');
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity: string): string => {
    const colors = {
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    };
    return colors[severity as keyof typeof colors] || 'text-gray-600';
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTimeSpent = (minutes: number | null): string => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <LightBulbIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Incidentes Similares</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <LightBulbIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Incidentes Similares</h3>
        </div>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (similarIncidents.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <LightBulbIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Incidentes Similares</h3>
        </div>
        <p className="text-sm text-gray-500">
          No se encontraron incidentes similares resueltos previamente.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <LightBulbIcon className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">Incidentes Similares</h3>
        <span className="ml-auto text-xs text-gray-500">
          {similarIncidents.length} encontrado{similarIncidents.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {similarIncidents.map((incident) => (
          <div 
            key={incident.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    to={`/incidents/${incident.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    #{incident.id} - {incident.title}
                  </Link>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className={getSeverityColor(incident.severity)}>
                    {incident.severity}
                  </span>
                  <span>•</span>
                  <span>{incident.type}</span>
                  {incident.server && (
                    <>
                      <span>•</span>
                      <span>{incident.server.name}</span>
                    </>
                  )}
                  <span>•</span>
                  <CheckCircleIcon className="h-3 w-3 text-green-600 inline" />
                  <span className="text-green-600">Resuelto</span>
                </div>
              </div>

              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSimilarityColor(incident.similarity_score)}`}>
                {incident.similarity_score}% similar
              </span>
            </div>

            {incident.tags && incident.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {incident.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs"
                    style={{ 
                      backgroundColor: `${tag.color}20`,
                      color: tag.color 
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {incident.solutions && incident.solutions.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  Soluciones aplicadas ({incident.solutions.length})
                </div>
                
                {incident.solutions.map((solution) => (
                  <div 
                    key={solution.id}
                    className="bg-green-50 border border-green-200 rounded p-3"
                  >
                    <p className="text-sm text-gray-700 mb-2">
                      {solution.description}
                    </p>

                    {solution.result_obtained && (
                      <p className="text-xs text-gray-600 mb-2">
                        <span className="font-medium">Resultado:</span> {solution.result_obtained}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {solution.time_spent_minutes && (
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>Tiempo: {formatTimeSpent(solution.time_spent_minutes)}</span>
                        </div>
                      )}

                      {onApplySolution && (
                        <button
                          onClick={() => onApplySolution(solution)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          Usar esta solución
                          <ChevronRightIcon className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {solution.sql_scripts && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                          Ver scripts SQL
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-800 text-gray-100 rounded text-xs overflow-x-auto">
                          {solution.sql_scripts}
                        </pre>
                      </details>
                    )}

                    {solution.system_commands && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                          Ver comandos de sistema
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-800 text-gray-100 rounded text-xs overflow-x-auto">
                          {solution.system_commands}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Resuelto el {formatDate(incident.resolved_at)}
              </span>
              
              <Link
                to={`/incidents/${incident.id}`}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                Ver detalle completo
                <ChevronRightIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
