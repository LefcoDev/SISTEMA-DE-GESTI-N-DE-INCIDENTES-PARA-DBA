import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useNavigate } from 'react-router-dom';
import { incidentService } from '../../../services/incident.service';
import api from '../../../lib/axios';
import { AttachmentUpload } from './AttachmentUpload.tsx';
import { useModal } from '../../../context/ModalContext';

const incidentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  server_id: z.number({ required_error: 'Server is required' }).positive('Server is required'),
  type: z.enum(['performance', 'availability', 'data_corruption', 'backup_restore', 'replication', 'security', 'capacity', 'slow_query', 'deadlock', 'other']),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  impact: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  reported_by: z.string().optional(),
  detected_at: z.string(),
  tags: z.array(z.number()).optional(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

interface Server {
  id: number;
  name: string;
  host: string;
  environment: string;
}

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface IncidentFormProps {
  incidentId?: number;
  onSuccess?: () => void;
}

const incidentTypes = [
  { value: 'performance', label: 'Performance' },
  { value: 'availability', label: 'Availability' },
  { value: 'data_corruption', label: 'Data Corruption' },
  { value: 'backup_restore', label: 'Backup/Restore' },
  { value: 'replication', label: 'Replication' },
  { value: 'security', label: 'Security' },
  { value: 'capacity', label: 'Capacity' },
  { value: 'slow_query', label: 'Slow Query' },
  { value: 'deadlock', label: 'Deadlock' },
  { value: 'other', label: 'Other' },
];

const severityOptions = [
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'low', label: 'Low', color: 'bg-green-500' },
];

const impactOptions = [
  { value: 'critical', label: 'Critical - System Down' },
  { value: 'high', label: 'High - Functionality Affected' },
  { value: 'medium', label: 'Medium - Degraded Performance' },
  { value: 'low', label: 'Low - No Visible Impact' },
];

export const IncidentForm: React.FC<IncidentFormProps> = ({ incidentId, onSuccess }) => {
  const navigate = useNavigate();
  const { showModal } = useModal();
  const [servers, setServers] = useState<Server[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverSearch, setServerSearch] = useState('');

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      detected_at: new Date().toISOString().slice(0, 16),
      severity: 'medium',
      type: 'other',
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Describe the incident in detail...',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setValue('description', editor.getHTML());
    },
  });

  useEffect(() => {
    loadServers();
    loadTags();
    if (incidentId) {
      loadIncident();
    }
  }, [incidentId]);

  const loadServers = async () => {
    try {
      const response = await api.get('/servers');
      setServers(response.data);
    } catch (error) {
      console.error('Error loading servers:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await api.get('/tags');
      setTags(response.data);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const loadIncident = async () => {
    if (!incidentId) return;
    try {
      const incident = await incidentService.getById(incidentId);
      setValue('title', incident.title);
      setValue('server_id', incident.server_id);
      setValue('type', incident.type as any);
      setValue('severity', incident.severity as any);
      setValue('impact', incident.impact as any);
      setValue('reported_by', incident.reported_by || '');
      setValue('detected_at', incident.detected_at.slice(0, 16));
      
      if (editor && incident.description) {
        editor.commands.setContent(incident.description);
      }
    } catch (error) {
      console.error('Error loading incident:', error);
    }
  };

  const onSubmit = async (data: IncidentFormData) => {
    setLoading(true);
    try {
      // Para edición, usar JSON
      if (incidentId) {
        const payload = {
          ...data,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        };
        await api.put(`/incidents/${incidentId}`, payload);
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/incidents');
        }
        return;
      }

      // Para creación, usar FormData si hay archivos
      const formData = new FormData();
      
      // Append form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'tags' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Append tags
      if (selectedTags.length > 0) {
        formData.append('tags', JSON.stringify(selectedTags));
      }

      // Append files
      files.forEach((file) => {
        formData.append('attachments', file);
      });

      await api.post('/incidents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/incidents');
      }
    } catch (error: any) {
      console.error('Error saving incident:', error);
      showModal({
        title: 'Error',
        message: error.response?.data?.message || 'Error al guardar el incidente',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredServers = servers.filter(server =>
    server.name.toLowerCase().includes(serverSearch.toLowerCase()) ||
    server.host.toLowerCase().includes(serverSearch.toLowerCase())
  );

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register('title')}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Brief description of the incident"
          maxLength={200}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <div className="border border-gray-300 rounded-md">
          <EditorContent 
            editor={editor} 
            className="prose max-w-none p-3 min-h-[200px] focus:outline-none"
          />
        </div>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Server and Type Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Server */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Server <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Search servers..."
            value={serverSearch}
            onChange={(e) => setServerSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-1"
          />
          <Controller
            name="server_id"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a server</option>
                {filteredServers.map((server) => (
                  <option key={server.id} value={server.id}>
                    {server.name} ({server.host}) - {server.environment}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.server_id && (
            <p className="mt-1 text-sm text-red-600">{errors.server_id.message}</p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Incident Type <span className="text-red-500">*</span>
          </label>
          <select
            {...register('type')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            {incidentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>
      </div>

      {/* Severity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Severity <span className="text-red-500">*</span>
        </label>
        <Controller
          name="severity"
          control={control}
          render={({ field }) => (
            <div className="flex gap-4">
              {severityOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-all ${
                    field.value === option.value
                      ? `${option.color} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    {...field}
                    value={option.value}
                    checked={field.value === option.value}
                    className="sr-only"
                  />
                  <span className="font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        />
        {errors.severity && (
          <p className="mt-1 text-sm text-red-600">{errors.severity.message}</p>
        )}
      </div>

      {/* Impact and Reported By Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Impact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Impact
          </label>
          <select
            {...register('impact')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select impact level</option>
            {impactOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reported By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reported By
          </label>
          <input
            {...register('reported_by')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Name or email"
          />
        </div>
      </div>

      {/* Detected At */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Detected At <span className="text-red-500">*</span>
        </label>
        <input
          {...register('detected_at')}
          type="datetime-local"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.detected_at && (
          <p className="mt-1 text-sm text-red-600">{errors.detected_at.message}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedTags.includes(tag.id)
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined,
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Attachments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments
        </label>
        <AttachmentUpload files={files} onChange={setFiles} />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => navigate('/incidents')}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {loading ? 'Saving...' : incidentId ? 'Update Incident' : 'Create Incident'}
        </button>
      </div>
    </form>
  );
};
