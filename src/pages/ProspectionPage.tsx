import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Download, X, AlertCircle } from 'lucide-react';
import { getProspectList, createProspect, downloadProspect, type Prospect } from '../services/prospect';
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setError(null);
    setLoading(true);
    try {
      const [prospectsData, usersData] = await Promise.all([
        getProspectList(),
        getUsers()
      ]);
      
      if (!Array.isArray(prospectsData)) {
        throw new Error('Dados de prospecção inválidos');
      }
      
      const usersLookup = Array.isArray(usersData) 
        ? usersData.reduce((acc, user) => {
            acc[user.id] = user.username;
            return acc;
          }, {} as Record<number, string>)
        : {};
      
      setProspects(prospectsData);
      setUsers(usersLookup);
    } catch (err) {
      setError('Erro ao carregar dados. Por favor, tente novamente.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: number) => {
    return users[userId] || 'Usuário Desconhecido';
  };

  const handleSubmit = async () => {
    if (!selectedState) {
      return;
    }

    setSubmitting(true);
    try {
      await createProspect({
        name: 100,
        states: [selectedState],
        export: true,
        quantity: 10,
        plan: 3,
        file_formatting: "csv"
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
      await downloadProspect(prospect.externalId);
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
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Nova Prospecção
        </button>
      </div>

      {downloadError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {downloadError}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Nova Prospecção</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-2 border rounded-md mb-2"
                  placeholder="Buscar estado..."
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                />
                <div className="max-h-48 overflow-y-auto border rounded-md">
                  {filteredStates.map((state) => (
                    <button
                      key={state}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                        selectedState === state ? 'bg-indigo-50 text-indigo-600' : ''
                      }`}
                      onClick={() => setSelectedState(state)}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!selectedState || submitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prospects.map((prospect) => (
                <tr key={prospect.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{prospect.externalId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {getUserName(prospect.userId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prospect.filter.quantity} registros
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                    {prospect.filter.file_formatting}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      onClick={() => handleDownload(prospect)}
                      disabled={downloading === prospect.id}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
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