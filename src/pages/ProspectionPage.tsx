// Updated ProspectionPage.tsx pagination logic
import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet, Download, X, AlertCircle, Filter, RefreshCcw,
  ChevronRight, ChevronLeft
} from 'lucide-react';
import {
  getProspectList,
  createProspect,
  downloadProspect,
  type Prospect
} from '../services/prospect';
import { getUsers } from '../services/auth';

interface User {
  id: number;
  username: string;
}

const ESTADOS_BRASILEIROS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

function ProspectionPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [users, setUsers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [filterId, setFilterId] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterQuantity, setFilterQuantity] = useState('');
  const [filterFormat, setFilterFormat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const fetchData = async () => {
    setError(null);
    setLoading(true);
    try {
      const [prospectResponse, usersData] = await Promise.all([
        getProspectList(page, limit, {
          id: filterId,
          user: filterUser,
          state: filterState,
          quantity: filterQuantity,
          format: filterFormat,
          status: filterStatus
        }),
        getUsers()
      ]);

      const usersLookup = Array.isArray(usersData)
        ? usersData.reduce((acc, user) => {
            acc[user.id] = user.username;
            return acc;
          }, {} as Record<number, string>)
        : {};

      setProspects(prospectResponse.data);
      setUsers(usersLookup);
      setTotal(prospectResponse.total);
      setTotalPages(prospectResponse.totalPages);
    } catch (err) {
      setError('Erro ao carregar dados. Por favor, tente novamente.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: number) => users[userId] || 'Usuário Desconhecido';

  const handleSubmit = async () => {
    if (!selectedState) return;
    setSubmitting(true);
    try {
      await createProspect({
        name: 100,
        states: [selectedState],
        export: true,
        quantity: 10,
        plan: 3,
        file_formatting: 'csv'
      });
      await fetchData();
      setIsModalOpen(false);
      setSelectedState('');
    } catch (err) {
      console.error('Error creating prospect:', err);
      setError('Erro ao criar prospecção. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (prospect: Prospect) => {
    setDownloading(prospect.id);
    setDownloadError(null);
    try {
      await downloadProspect(prospect.id);
    } catch (err) {
      console.error('Error downloading prospect:', err);
      setDownloadError('Erro ao baixar arquivo. Por favor, tente novamente.');
    } finally {
      setDownloading(null);
    }
  };

  const filteredStates = ESTADOS_BRASILEIROS.filter(state =>
    state.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const filteredProspects = prospects.filter(p => {
    return (
      (!filterId || p.id.toString() === filterId) &&
      (!filterUser || getUserName(p.userId).toLowerCase().includes(filterUser.toLowerCase())) &&
      (!filterState || p.filter.states?.includes(filterState)) &&
      (!filterQuantity || p.filter.quantity?.toString() === filterQuantity) &&
      (!filterFormat || p.filter.file_formatting === filterFormat) &&
      (!filterStatus || p.status.toString() === filterStatus)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Prospecções</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Nova Prospecção
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4 mb-4">
        <input type="text" className="p-2 border rounded-md" placeholder="ID" value={filterId} onChange={(e) => setFilterId(e.target.value)} />
        <input type="text" className="p-2 border rounded-md" placeholder="Usuário" value={filterUser} onChange={(e) => setFilterUser(e.target.value)} />
        <input type="text" className="p-2 border rounded-md" placeholder="Estado" value={filterState} onChange={(e) => setFilterState(e.target.value)} />
        <input type="text" className="p-2 border rounded-md" placeholder="Quantidade" value={filterQuantity} onChange={(e) => setFilterQuantity(e.target.value)} />
        <input type="text" className="p-2 border rounded-md" placeholder="Formato" value={filterFormat} onChange={(e) => setFilterFormat(e.target.value)} />
        <input type="text" className="p-2 border rounded-md" placeholder="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} />
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <label htmlFor="limit">Limite por página:</label>
          <input
            type="number"
            id="limit"
            className="w-20 p-2 border rounded-md"
            value={limit}
            min={1}
            max={50}
            onChange={(e) => setLimit(Math.min(50, Math.max(1, Number(e.target.value))))}
          />
          <button onClick={fetchData} className="flex items-center px-3 py-2 bg-gray-100 border rounded hover:bg-gray-200">
            <RefreshCcw className="w-4 h-4 mr-1" /> Recarregar
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`flex items-center px-3 py-2 rounded hover:bg-indigo-700 disabled:opacity-50
              ${page === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white'}`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Página Anterior
          </button>
          <span className="text-sm text-gray-600">Página {page} de {totalPages} ({total} resultados)</span>
          <button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages}
            className={`flex items-center px-3 py-2 rounded hover:bg-indigo-700 disabled:opacity-50
              ${page >= totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white'}`}
          >
            Próxima Página <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {downloadError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {downloadError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProspects.map((prospect) => (
                <tr key={prospect.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{prospect.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{getUserName(prospect.userId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prospect.filter.quantity} registros</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">{prospect.filter.file_formatting}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDownload(prospect)}
                      disabled={downloading === prospect.id || !(prospect.status === 1 || prospect.status === '1')}
                      className={`flex items-center px-2 py-1 rounded-md transition-colors
                        ${(prospect.status === 1 || prospect.status === '1') ? 'text-indigo-600 hover:text-indigo-900 bg-white' : 'text-gray-400 bg-gray-100 cursor-not-allowed'}
                        ${downloading === prospect.id ? 'opacity-50' : ''}`}
                    >
                      <Download className={`w-4 h-4 mr-1 ${downloading === prospect.id ? 'animate-spin' : ''}`} />
                      {downloading === prospect.id ? 'Baixando...' : 'Download'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProspectionPage;
