import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MagnifyingGlassIcon, ServerIcon, ExclamationTriangleIcon, CodeBracketIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { searchService, SearchResults } from '../../services/search.service';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    if (query.length >= 2) {
      handleSearch(query);
    }
  }, [query]);

  const handleSearch = async (q: string) => {
    setLoading(true);
    try {
      const data = await searchService.search(q);
      setResults(data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchTerm });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Búsqueda Global</h1>

      <form onSubmit={onSearchSubmit} className="mb-8">
        <div className="relative rounded-md shadow-sm max-w-2xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3"
            placeholder="Buscar incidentes, servidores, scripts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </form>

      {loading && <div className="text-gray-500">Buscando...</div>}

      {!loading && results && (
        <div className="space-y-8">
          {/* Incidents */}
          {results.incidents.length > 0 && (
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                Incidentes ({results.incidents.length})
              </h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {results.incidents.map((incident) => (
                    <li key={incident.id}>
                      <Link to={`/incidents`} className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">{incident.title}</p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                {incident.severity}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {incident.description.substring(0, 100)}...
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Servers */}
          {results.servers.length > 0 && (
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ServerIcon className="h-5 w-5 mr-2 text-blue-500" />
                Servidores ({results.servers.length})
              </h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {results.servers.map((server) => (
                    <li key={server.id}>
                      <Link to={`/servers`} className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">{server.name}</p>
                            <p className="text-sm text-gray-500">{server.host}</p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Scripts */}
          {results.scripts.length > 0 && (
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CodeBracketIcon className="h-5 w-5 mr-2 text-green-500" />
                Scripts ({results.scripts.length})
              </h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {results.scripts.map((script) => (
                    <li key={script.id}>
                      <Link to={`/scripts`} className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">{script.name}</p>
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {script.language}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Solutions */}
          {results.solutions.length > 0 && (
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
                Soluciones ({results.solutions.length})
              </h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {results.solutions.map((solution) => (
                    <li key={solution.id}>
                      <Link to={`/solutions/${solution.id}`} className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">{solution.title}</p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {results.incidents.length === 0 && results.servers.length === 0 && 
           results.scripts.length === 0 && results.solutions.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              No se encontraron resultados para "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
