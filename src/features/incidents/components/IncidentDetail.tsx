import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';
import { incidentService, Incident } from '../../../services/incident.service';
import { useModal } from '../../../context/ModalContext';

const formatDate = (date: Date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${m} ${d}, ${y} ${h}:${min}`;
};

const severityColors = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-green-500 text-white',
};

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  waiting: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

export const IncidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showModal } = useModal();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadIncident(Number(id));
    }
  }, [id]);

  const loadIncident = async (incidentId: number) => {
    setLoading(true);
    try {
      const data = await incidentService.getById(incidentId);
      setIncident(data);
    } catch (error) {
      console.error('Error loading incident:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!incident) return;
    
    setStatusLoading(true);
    try {
      await incidentService.update(incident.id, { status: newStatus });
      setIncident({ ...incident, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      showModal({
        title: 'Error',
        message: 'Error al actualizar el estado',
        type: 'error'
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleClose = () => {
    if (!incident) return;
    
    showModal({
      title: 'Cerrar Incidente',
      message: '¿Estás seguro de que deseas cerrar este incidente?',
      type: 'confirm',
      confirmText: 'Cerrar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        setStatusLoading(true);
        try {
          await incidentService.update(incident.id, { status: 'closed' });
          setIncident({ ...incident, status: 'closed' });
        } catch (error) {
          console.error('Error closing incident:', error);
          showModal({
            title: 'Error',
            message: 'Error al cerrar el incidente',
            type: 'error'
          });
        } finally {
          setStatusLoading(false);
        }
      }
    });
  };

  const formatStatus = (status: string): string => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatType = (type: string): string => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatResolutionTime = (minutes?: number): string => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} minutes`;
    return `${hours} hours ${mins} minutes`;
  };

  const downloadAttachment = (attachmentId: number) => {
    // Implement download logic
    const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';
    const url = `${apiUrl}/incidents/${incident?.id}/attachments/${attachmentId}/download`;
    window.open(url, '_blank');
  };

  const previewAttachment = (attachmentId: number) => {
    // Implement preview logic
    const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';
    const url = `${apiUrl}/incidents/${incident?.id}/attachments/${attachmentId}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Incident not found</h3>
        <button
          onClick={() => navigate('/incidents')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Incidents
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/incidents')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Incidents
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/incidents/${incident.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <PencilIcon className="h-5 w-5" />
            Edit
          </button>
          {incident.status !== 'closed' && (
            <button
              onClick={handleClose}
              disabled={statusLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              <XCircleIcon className="h-5 w-5" />
              Close Incident
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-gray-500">#{incident.id}</span>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      severityColors[incident.severity as keyof typeof severityColors]
                    }`}
                  >
                    {incident.severity.toUpperCase()}
                  </span>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      statusColors[incident.status as keyof typeof statusColors]
                    }`}
                  >
                    {formatStatus(incident.status)}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{incident.title}</h1>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm mt-6">
              <div>
                <span className="font-medium text-gray-500">Type:</span>
                <span className="ml-2 text-gray-900">{formatType(incident.type)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Server:</span>
                <span className="ml-2 text-gray-900">{incident.server?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Impact:</span>
                <span className="ml-2 text-gray-900">{incident.impact || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Reported By:</span>
                <span className="ml-2 text-gray-900">{incident.reported_by || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Created:</span>
                <span className="ml-2 text-gray-900">
                  {incident.created_at
                    ? formatDate(new Date(incident.created_at))
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Incident Date:</span>
                <span className="ml-2 text-gray-900">
                  {incident.incident_date
                    ? formatDate(new Date(incident.incident_date))
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Resolution Time:</span>
                <span className="ml-2 text-gray-900">
                  {formatResolutionTime(incident.resolution_time_minutes)}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Creator:</span>
                <span className="ml-2 text-gray-900">
                  {incident.creator?.full_name || 'N/A'}
                </span>
              </div>
            </div>

            {/* Tags */}
            {incident.tags && incident.tags.length > 0 && (
              <div className="mt-6">
                <span className="font-medium text-gray-500 text-sm">Tags:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {incident.tags.map((tag: any) => (
                    <span
                      key={tag.id}
                      className={`px-3 py-1 text-sm font-medium rounded-full ${tag.color} text-white`}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <div
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: incident.description || 'No description provided' }}
            />
          </div>

          {/* Attachments */}
          {incident.attachments && incident.attachments.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PaperClipIcon className="h-5 w-5" />
                Attachments ({incident.attachments.length})
              </h2>
              <div className="space-y-3">
                {incident.attachments.map((attachment: any) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <PaperClipIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                        <p className="text-xs text-gray-500">
                          {(attachment.file_size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => previewAttachment(attachment.id)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                        title="Preview"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => downloadAttachment(attachment.id)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                        title="Download"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solutions */}
          {incident.solutions && incident.solutions.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5" />
                Solutions ({incident.solutions.length})
              </h2>
              <div className="space-y-4">
                {incident.solutions.map((solution: any) => (
                  <div key={solution.id} className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {solution.creator?.full_name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {solution.created_at
                          ? formatDate(new Date(solution.created_at))
                          : ''}
                      </span>
                    </div>
                    <div
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: solution.description }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Status Timeline
            </h2>
            <div className="space-y-3">
              {incident.status_history && incident.status_history.length > 0 ? (
                incident.status_history.map((history: any, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                      />
                      {incident.status_history && index < incident.status_history.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-gray-900">
                        {formatStatus(history.status)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {history.timestamp
                          ? formatDate(new Date(history.timestamp))
                          : ''}
                      </p>
                      {history.user && (
                        <p className="text-xs text-gray-500">by {history.user.full_name}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No status history available</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => handleStatusChange('in_progress')}
                disabled={statusLoading || incident.status === 'in_progress'}
                className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 bg-purple-50 hover:bg-purple-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as In Progress
              </button>
              <button
                onClick={() => handleStatusChange('waiting')}
                disabled={statusLoading || incident.status === 'waiting'}
                className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 bg-yellow-50 hover:bg-yellow-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Waiting
              </button>
              <button
                onClick={() => handleStatusChange('resolved')}
                disabled={statusLoading || incident.status === 'resolved'}
                className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 bg-green-50 hover:bg-green-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Resolved
              </button>
            </div>
          </div>

          {/* Similar Incidents */}
          {incident.similar_incidents && incident.similar_incidents.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Similar Incidents</h2>
              <div className="space-y-3">
                {incident.similar_incidents.map((similar: any) => (
                  <button
                    key={similar.id}
                    onClick={() => navigate(`/incidents/${similar.id}`)}
                    className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">
                      #{similar.id} - {similar.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Similarity: {(similar.similarity * 100).toFixed(0)}%
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
