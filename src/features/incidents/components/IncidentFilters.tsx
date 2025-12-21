import React, { useState, useEffect } from 'react';
import { XMarkIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { serverService } from '../../../services/server.service';
import { tagService } from '../../../services/tag.service';

interface Server {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface FilterValues {
  search?: string;
  status?: string[];
  severity?: string[];
  type?: string;
  server_id?: number;
  date_from?: string;
  date_to?: string;
  tags?: number[];
}

interface IncidentFiltersProps {
  onFiltersChange: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
}

export const IncidentFilters: React.FC<IncidentFiltersProps> = ({
  onFiltersChange,
  initialFilters = {},
}) => {
  const [expanded, setExpanded] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);
  
  // Filter states
  const [search, setSearch] = useState(initialFilters.search || '');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialFilters.status || []);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(initialFilters.severity || []);
  const [selectedType, setSelectedType] = useState(initialFilters.type || '');
  const [selectedServerId, setSelectedServerId] = useState<number | undefined>(initialFilters.server_id);
  const [dateFrom, setDateFrom] = useState(initialFilters.date_from || '');
  const [dateTo, setDateTo] = useState(initialFilters.date_to || '');
  const [selectedTags, setSelectedTags] = useState<number[]>(initialFilters.tags || []);
  
  // Data
  const [servers, setServers] = useState<Server[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [serverSearch, setServerSearch] = useState('');

  const statuses = [
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
    { value: 'waiting', label: 'Waiting', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
    { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
  ];

  const severities = [
    { value: 'critical', label: 'Critical', color: 'bg-red-500 text-white' },
    { value: 'high', label: 'High', color: 'bg-orange-500 text-white' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500 text-white' },
    { value: 'low', label: 'Low', color: 'bg-green-500 text-white' },
  ];

  const types = [
    { value: 'hardware', label: 'Hardware' },
    { value: 'software', label: 'Software' },
    { value: 'network', label: 'Network' },
    { value: 'database', label: 'Database' },
    { value: 'security', label: 'Security' },
    { value: 'performance', label: 'Performance' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    loadServers();
    loadTags();
  }, []);

  useEffect(() => {
    // Debounce search input
    if (searchDebounce) clearTimeout(searchDebounce);
    
    const timeout = setTimeout(() => {
      applyFilters();
    }, 300);
    
    setSearchDebounce(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [search]);

  useEffect(() => {
    // Apply filters immediately for non-search changes
    applyFilters();
  }, [selectedStatuses, selectedSeverities, selectedType, selectedServerId, dateFrom, dateTo, selectedTags]);

  const loadServers = async () => {
    try {
      const data = await serverService.getAll();
      setServers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading servers:', error);
    }
  };

  const loadTags = async () => {
    try {
      const data = await tagService.getAll();
      setTags(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const applyFilters = () => {
    const filters: FilterValues = {};
    
    if (search.trim()) filters.search = search.trim();
    if (selectedStatuses.length > 0) filters.status = selectedStatuses;
    if (selectedSeverities.length > 0) filters.severity = selectedSeverities;
    if (selectedType) filters.type = selectedType;
    if (selectedServerId) filters.server_id = selectedServerId;
    if (dateFrom) filters.date_from = dateFrom;
    if (dateTo) filters.date_to = dateTo;
    if (selectedTags.length > 0) filters.tags = selectedTags;
    
    onFiltersChange(filters);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedStatuses([]);
    setSelectedSeverities([]);
    setSelectedType('');
    setSelectedServerId(undefined);
    setDateFrom('');
    setDateTo('');
    setSelectedTags([]);
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const toggleSeverity = (severity: string) => {
    setSelectedSeverities(prev =>
      prev.includes(severity) ? prev.filter(s => s !== severity) : [...prev, severity]
    );
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const activeFiltersCount = 
    (search ? 1 : 0) +
    selectedStatuses.length +
    selectedSeverities.length +
    (selectedType ? 1 : 0) +
    (selectedServerId ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0) +
    selectedTags.length;

  const filteredServers = servers.filter(server =>
    server.name.toLowerCase().includes(serverSearch.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      {/* Filter Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <XMarkIcon className="h-4 w-4" />
                Clear all
              </button>
            )}
          </div>
          
          {/* Search Bar (always visible) */}
          <div className="relative w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search incidents..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {expanded && (
        <div className="px-6 py-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {statuses.map((status) => (
                  <label key={status.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status.value)}
                      onChange={() => toggleStatus(status.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <div className="space-y-2">
                {severities.map((severity) => (
                  <label key={severity.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSeverities.includes(severity.value)}
                      onChange={() => toggleSeverity(severity.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${severity.color}`}>
                      {severity.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All types</option>
                {types.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Server Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Server
              </label>
              <input
                type="text"
                value={serverSearch}
                onChange={(e) => setServerSearch(e.target.value)}
                placeholder="Search servers..."
                className="mb-2 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <select
                value={selectedServerId || ''}
                onChange={(e) => setSelectedServerId(e.target.value ? Number(e.target.value) : undefined)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">All servers</option>
                {filteredServers.map((server) => (
                  <option key={server.id} value={server.id}>
                    {server.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date From
              </label>
              <input
                type="datetime-local"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date To
              </label>
              <input
                type="datetime-local"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                    selectedTags.includes(tag.id)
                      ? `${tag.color} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-gray-500">No tags available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
