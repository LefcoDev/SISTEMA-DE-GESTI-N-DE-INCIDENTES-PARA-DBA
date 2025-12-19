import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { solutionService, Solution } from '../../services/solution.service';
import { incidentService, Incident } from '../../services/incident.service';

export default function SolutionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    incident_id: '',
    description: '',
    sql_scripts: '',
    system_commands: '',
    external_references: '',
    time_spent_minutes: 0,
    result_obtained: '',
    is_template: false,
    template_name: '',
    template_category: ''
  });

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [templates, setTemplates] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadIncidents();
    loadTemplates();
    if (isEditMode) {
      loadSolution();
    }
  }, [id]);

  const loadIncidents = async () => {
    try {
      const data = await incidentService.getAll();
      setIncidents(data);
    } catch (err) {
      console.error('Error loading incidents:', err);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await solutionService.getAll({ is_template: true });
      setTemplates(data);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const loadSolution = async () => {
    try {
      const solution = await solutionService.getById(Number(id));
      setFormData({
        incident_id: solution.incident_id?.toString() || '',
        description: solution.description,
        sql_scripts: solution.sql_scripts || '',
        system_commands: solution.system_commands || '',
        external_references: solution.external_references || '',
        time_spent_minutes: solution.time_spent_minutes || 0,
        result_obtained: solution.result_obtained || '',
        is_template: solution.is_template,
        template_name: solution.template_name || '',
        template_category: solution.template_category || ''
      });
    } catch (err) {
      setError('Error al cargar la solución');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.is_template && !formData.incident_id) {
      setError('Debe seleccionar un incidente para registrar una solución.');
      setLoading(false);
      return;
    }

    if (formData.is_template && !formData.template_name) {
      setError('Debe proporcionar un nombre para la plantilla.');
      setLoading(false);
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        incident_id: formData.incident_id ? Number(formData.incident_id) : undefined,
        time_spent_minutes: Number(formData.time_spent_minutes)
      };

      if (isEditMode) {
        await solutionService.update(Number(id), dataToSubmit);
      } else {
        await solutionService.create(dataToSubmit);
      }
      navigate('/solutions');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar la solución');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = Number(e.target.value);
    if (!templateId) return;

    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        description: template.description,
        sql_scripts: template.sql_scripts || '',
        system_commands: template.system_commands || '',
        external_references: template.external_references || '',
        result_obtained: template.result_obtained || '',
        // Don't copy incident_id, time_spent, or template metadata
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {isEditMode ? 'Editar Solución' : 'Nueva Solución'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow sm:rounded-lg p-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          {!isEditMode && templates.length > 0 && (
            <div className="col-span-full bg-gray-50 p-4 rounded-md border border-gray-200">
              <label htmlFor="template_select" className="block text-sm font-medium leading-6 text-gray-900">
                Cargar desde Plantilla
              </label>
              <div className="mt-2">
                <select
                  id="template_select"
                  onChange={handleTemplateChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Seleccione una plantilla para autocompletar...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.template_name} ({template.template_category})
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Al seleccionar una plantilla, se rellenarán los campos de descripción y scripts automáticamente.
              </p>
            </div>
          )}

          <div className="sm:col-span-4">
            <label htmlFor="incident_id" className="block text-sm font-medium leading-6 text-gray-900">
              Incidente Relacionado
            </label>
            <div className="mt-2">
              <select
                id="incident_id"
                name="incident_id"
                value={formData.incident_id}
                onChange={(e) => setFormData({ ...formData, incident_id: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">Seleccione un incidente (opcional)</option>
                {incidents.map((incident) => (
                  <option key={incident.id} value={incident.id}>
                    #{incident.id} - {incident.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-span-full">
            <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
              Descripción de la Solución
            </label>
            <div className="mt-2">
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="col-span-full">
            <label htmlFor="sql_scripts" className="block text-sm font-medium leading-6 text-gray-900">
              Scripts SQL
            </label>
            <div className="mt-2">
              <textarea
                id="sql_scripts"
                name="sql_scripts"
                rows={4}
                value={formData.sql_scripts}
                onChange={(e) => setFormData({ ...formData, sql_scripts: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 font-mono text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="col-span-full">
            <label htmlFor="system_commands" className="block text-sm font-medium leading-6 text-gray-900">
              Comandos del Sistema
            </label>
            <div className="mt-2">
              <textarea
                id="system_commands"
                name="system_commands"
                rows={4}
                value={formData.system_commands}
                onChange={(e) => setFormData({ ...formData, system_commands: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 font-mono text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="time_spent_minutes" className="block text-sm font-medium leading-6 text-gray-900">
              Tiempo Invertido (minutos)
            </label>
            <div className="mt-2">
              <input
                type="number"
                id="time_spent_minutes"
                name="time_spent_minutes"
                value={formData.time_spent_minutes}
                onChange={(e) => setFormData({ ...formData, time_spent_minutes: Number(e.target.value) })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="col-span-full">
            <div className="relative flex gap-x-3">
              <div className="flex h-6 items-center">
                <input
                  id="is_template"
                  name="is_template"
                  type="checkbox"
                  checked={formData.is_template}
                  onChange={(e) => setFormData({ ...formData, is_template: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div className="text-sm leading-6">
                <label htmlFor="is_template" className="font-medium text-gray-900">
                  Guardar como plantilla
                </label>
                <p className="text-gray-500">Esta solución podrá ser reutilizada en futuros incidentes.</p>
              </div>
            </div>
          </div>

          {formData.is_template && (
            <>
              <div className="sm:col-span-3">
                <label htmlFor="template_name" className="block text-sm font-medium leading-6 text-gray-900">
                  Nombre de la Plantilla
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="template_name"
                    name="template_name"
                    value={formData.template_name}
                    onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="template_category" className="block text-sm font-medium leading-6 text-gray-900">
                  Categoría
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="template_category"
                    name="template_category"
                    value={formData.template_category}
                    onChange={(e) => setFormData({ ...formData, template_category: e.target.value })}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            onClick={() => navigate('/solutions')}
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
