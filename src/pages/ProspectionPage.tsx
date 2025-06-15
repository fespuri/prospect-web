import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet, Download, X, AlertCircle, Filter, RefreshCcw,
  ChevronRight, ChevronLeft, PlusCircle
} from 'lucide-react';
import {
  getProspectList,
  // createProspect, // A função antiga pode ser removida ou atualizada
  downloadProspect,
  type Prospect,
  createProspect
} from '../services/prospect';
import { getUsers } from '../services/auth';

// Tipagem baseada no DTO do backend
export interface NewProspectDto {
  userId?: number; // Opcional no frontend, pode ser definido no backend
  name: string;
  states: string[];
  cities: string[];
  neighborhoodies: string[];
  cbo_codes: string[];
  estimated_employees: { lower: number; upper: number }[];
  cnae_codes: string[];
  estimated_created: { lower: string; upper: string }[];
  revenues: { lower: string; upper: string }[];
  headquarter_type: string;
  export: boolean;
  quantity: number;
  callback_email: string;
  plan: number;
  contact_channels: string[];
  file_formatting: string;
  capitals: { lower: string; upper: string }[];
  sector_codes: string[];
  sector_cnae: string;
  nature_codes: string[];
  vehicles: { lower: string; upper: string }[];
  company_type: string[];
  mei_type: string;
  simple_type: string;
  import_export: string;
}

interface User {
  id: number;
  username: string;
}

const ESTADOS_BRASILEIROS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Estado inicial para o formulário do modal
const initialFormData: NewProspectDto = {
    name: '',
    states: [],
    cities: [],
    neighborhoodies: [],
    cbo_codes: [],
    estimated_employees: [],
    cnae_codes: [],
    estimated_created: [],
    revenues: [],
    headquarter_type: 'Matriz',
    export: false,
    quantity: 1000,
    callback_email: '',
    plan: 3,
    contact_channels: [],
    file_formatting: 'csv',
    capitals: [],
    sector_codes: [],
    sector_cnae: '',
    nature_codes: [],
    vehicles: [],
    company_type: [],
    mei_type: 'Todos',
    simple_type: 'Todos',
    import_export: 'Todos',
};


function ProspectionPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [users, setUsers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // --- Estados do Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProspectData, setNewProspectData] = useState<NewProspectDto>(initialFormData);
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

  // Estados do filtro avançado
  const [advFilterName, setAdvFilterName] = useState('');
  const [advFilterStates, setAdvFilterStates] = useState<string[]>([]);
  const [advFilterCities, setAdvFilterCities] = useState<string[]>([]);
  const [advFilterNeighborhoodies, setAdvFilterNeighborhoodies] = useState<string[]>([]);
  const [advFilterCboCodes, setAdvFilterCboCodes] = useState<string[]>([]);
  const [advFilterEstimatedEmployees, setAdvFilterEstimatedEmployees] = useState<string[]>([]);
  const [advFilterCnaeCodes, setAdvFilterCnaeCodes] = useState<string[]>([]);
  const [advFilterEstimatedCreated, setAdvFilterEstimatedCreated] = useState<string[]>([]);
  const [advFilterRevenues, setAdvFilterRevenues] = useState<string[]>([]);
  const [advFilterHeadquarterType, setAdvFilterHeadquarterType] = useState('');
  const [advFilterExport, setAdvFilterExport] = useState(true);
  const [advFilterQuantity, setAdvFilterQuantity] = useState(10);
  const [advFilterCallbackEmail, setAdvFilterCallbackEmail] = useState('');
  const [advFilterPlan, setAdvFilterPlan] = useState(3);
  const [advFilterContactChannels, setAdvFilterContactChannels] = useState<string[]>([]);
  const [advFilterFileFormatting, setAdvFilterFileFormatting] = useState('csv');
  const [advFilterCapitals, setAdvFilterCapitals] = useState<string[]>([]);
  const [advFilterSectorCodes, setAdvFilterSectorCodes] = useState<string[]>([]);
  const [advFilterSectorCnae, setAdvFilterSectorCnae] = useState('');
  const [advFilterNatureCodes, setAdvFilterNatureCodes] = useState<string[]>([]);
  const [advFilterVehicles, setAdvFilterVehicles] = useState<string[]>([]);
  const [advFilterCompanyType, setAdvFilterCompanyType] = useState<string[]>([]);
  const [advFilterMeiType, setAdvFilterMeiType] = useState('');
  const [advFilterSimpleType, setAdvFilterSimpleType] = useState('');
  const [advFilterImportExport, setAdvFilterImportExport] = useState('');

  // Adicionar estados para ranges
  const [employeeMin, setEmployeeMin] = useState('');
  const [employeeMax, setEmployeeMax] = useState('');
  const [createdMin, setCreatedMin] = useState('');
  const [createdMax, setCreatedMax] = useState('');
  const [revenueMin, setRevenueMin] = useState('');
  const [revenueMax, setRevenueMax] = useState('');
  const [capitalMin, setCapitalMin] = useState('');
  const [capitalMax, setCapitalMax] = useState('');
  const [vehicleMin, setVehicleMin] = useState('');
  const [vehicleMax, setVehicleMax] = useState('');

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

  // Nova função para criar prospecção a partir do modal
  const createNewProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      console.log('Dados a serem enviados para a API:', JSON.stringify(newProspectData));

      await createProspect(newProspectData);

      // Simulação de sucesso
      await new Promise(resolve => setTimeout(resolve, 1000)); 

      await fetchData(); // Atualiza a lista
      setIsModalOpen(false); // Fecha o modal
      setNewProspectData(initialFormData); // Reseta o formulário

    } catch (err) {
      console.error('Error creating prospect:', err);
      setError('Erro ao criar prospecção. Verifique os campos e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Lida com mudanças nos inputs do formulário do modal
  const handleModalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    if (type === 'checkbox') {
        processedValue = (e.target as HTMLInputElement).checked;
    }
    if (name === 'states' || name.endsWith('_codes') || name.endsWith('channels') || name.endsWith('type')) {
        processedValue = value.split(',').map(item => item.trim()).filter(Boolean);
    }
    
    setNewProspectData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
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

  const handleFilterSubmit = () => {
    const body = {
      name: advFilterName,
      states: advFilterStates,
      cities: advFilterCities,
      neighborhoodies: advFilterNeighborhoodies,
      cbo_codes: advFilterCboCodes,
      estimated_employees: advFilterEstimatedEmployees,
      cnae_codes: advFilterCnaeCodes,
      estimated_created: advFilterEstimatedCreated,
      revenues: advFilterRevenues,
      headquarter_type: advFilterHeadquarterType,
      export: advFilterExport,
      quantity: advFilterQuantity,
      callback_email: advFilterCallbackEmail,
      plan: advFilterPlan,
      contact_channels: advFilterContactChannels,
      file_formatting: advFilterFileFormatting,
      capitals: advFilterCapitals,
      sector_codes: advFilterSectorCodes,
      sector_cnae: advFilterSectorCnae,
      nature_codes: advFilterNatureCodes,
      vehicles: advFilterVehicles,
      company_type: advFilterCompanyType,
      mei_type: advFilterMeiType,
      simple_type: advFilterSimpleType,
      import_export: advFilterImportExport
    };
    // Aqui você pode chamar a API ou setar o filtro na listagem
  };

  // A filtragem do lado do cliente foi removida para usar apenas a do servidor.
  // A tabela agora mapeia 'prospects' diretamente.

  if (loading && !isModalOpen) { // Não mostrar loading de tela inteira se o modal estiver aberto
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* --- MODAL DE NOVA PROSPECÇÃO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Nova Prospecção</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              const body = {
                name: advFilterName,
                states: advFilterStates,
                cities: advFilterCities,
                neighborhoodies: advFilterNeighborhoodies,
                cbo_codes: advFilterCboCodes,
                estimated_employees: (employeeMin || employeeMax) ? [{ lower: Number(employeeMin) || 0, upper: Number(employeeMax) || 0 }] : [],
                cnae_codes: advFilterCnaeCodes,
                estimated_created: (createdMin || createdMax) ? [{ lower: createdMin, upper: createdMax }] : [],
                revenues: (revenueMin || revenueMax) ? [{ lower: revenueMin, upper: revenueMax }] : [],
                headquarter_type: advFilterHeadquarterType,
                export: advFilterExport,
                quantity: advFilterQuantity,
                callback_email: advFilterCallbackEmail,
                plan: advFilterPlan,
                contact_channels: advFilterContactChannels,
                file_formatting: advFilterFileFormatting,
                capitals: (capitalMin || capitalMax) ? [{ lower: capitalMin, upper: capitalMax }] : [],
                sector_codes: advFilterSectorCodes,
                sector_cnae: advFilterSectorCnae,
                nature_codes: advFilterNatureCodes,
                vehicles: (vehicleMin || vehicleMax) ? [{ lower: vehicleMin, upper: vehicleMax }] : [],
                company_type: advFilterCompanyType,
                mei_type: advFilterMeiType,
                simple_type: advFilterSimpleType,
                import_export: advFilterImportExport
              };
              setSubmitting(true);
              setError(null);
              createProspect(body)
                .then(() => {
                  fetchData();
                  setIsModalOpen(false);
                })
                .catch(err => {
                  setError('Erro ao criar prospecção. Verifique os campos e tente novamente.');
                  console.error('Error creating prospect:', err);
                })
                .finally(() => setSubmitting(false));
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Prospecção</label>
                  <input type="text" className="w-full p-2 border rounded-md mb-2" value={advFilterName} onChange={e => setAdvFilterName(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail de Callback</label>
                  <input type="email" className="w-full p-2 border rounded-md mb-2" value={advFilterCallbackEmail} onChange={e => setAdvFilterCallbackEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estados</label>
                  <select className="w-full p-2 border rounded-md mb-2" value={advFilterStates} onChange={e => setAdvFilterStates(Array.from(e.target.selectedOptions, option => option.value))}>
                    {/* para cada item dentro de Estados brasileiros criar um option */}
                    {ESTADOS_BRASILEIROS.map((estado) => (
                      <option value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidades</label>
                  <input type="text" className="w-full p-2 border rounded-md mb-2" value={advFilterCities.join(', ')} onChange={e => setAdvFilterCities(e.target.value.split(',').map(s => s.trim()))} placeholder="Separe por vírgula" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairros</label>
                  <input type="text" className="w-full p-2 border rounded-md mb-2" value={advFilterNeighborhoodies.join(', ')} onChange={e => setAdvFilterNeighborhoodies(e.target.value.split(',').map(s => s.trim()))} placeholder="Separe por vírgula" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Matriz</label>
                  <select className="w-full p-2 border rounded-md mb-2" value={advFilterHeadquarterType} onChange={e => setAdvFilterHeadquarterType(e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="H">Matriz</option>
                    <option value="F">Filial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Empresa</label>
                  <select multiple className="w-full p-2 border rounded-md mb-2" value={advFilterCompanyType} onChange={e => setAdvFilterCompanyType(Array.from(e.target.selectedOptions, option => option.value))}>
                    <option value="ME">ME</option>
                    <option value="EPP">EPP</option>
                    <option value="">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MEI</label>
                  <select className="w-full p-2 border rounded-md mb-2" value={advFilterMeiType} onChange={e => setAdvFilterMeiType(e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="SIM">SIM</option>
                    <option value="NAO">NÃO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Simples Nacional</label>
                  <select className="w-full p-2 border rounded-md mb-2" value={advFilterSimpleType} onChange={e => setAdvFilterSimpleType(e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="SIM">SIM</option>
                    <option value="NAO">NÃO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Importação/Exportação</label>
                  <select className="w-full p-2 border rounded-md mb-2" value={advFilterImportExport} onChange={e => setAdvFilterImportExport(e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="IMPORTA">Importa</option>
                    <option value="EXPORTA">Exporta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <input type="number" className="w-full p-2 border rounded-md mb-2" value={advFilterQuantity} onChange={e => setAdvFilterQuantity(Number(e.target.value))} min={1} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formato do Arquivo</label>
                  <select className="w-full p-2 border rounded-md mb-2" value={advFilterFileFormatting} onChange={e => setAdvFilterFileFormatting(e.target.value)}>
                    <option value="csv">CSV</option>
                    <option value="xlsx">XLSX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Funcionários (mínimo/máximo)</label>
                  <div className="flex gap-2">
                    <input type="number" className="w-full p-2 border rounded-md mb-2" placeholder="Mínimo" value={employeeMin} onChange={e => setEmployeeMin(e.target.value)} />
                    <input type="number" className="w-full p-2 border rounded-md mb-2" placeholder="Máximo" value={employeeMax} onChange={e => setEmployeeMax(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Criação (mínimo/máximo)</label>
                  <div className="flex gap-2">
                    <input type="date" className="w-full p-2 border rounded-md mb-2" placeholder="Mínimo" value={createdMin} onChange={e => setCreatedMin(e.target.value)} />
                    <input type="date" className="w-full p-2 border rounded-md mb-2" placeholder="Máximo" value={createdMax} onChange={e => setCreatedMax(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Faturamento (mínimo/máximo)</label>
                  <div className="flex gap-2">
                    <input type="number" className="w-full p-2 border rounded-md mb-2" placeholder="Mínimo" value={revenueMin} onChange={e => setRevenueMin(e.target.value)} />
                    <input type="number" className="w-full p-2 border rounded-md mb-2" placeholder="Máximo" value={revenueMax} onChange={e => setRevenueMax(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capital Social (mínimo/máximo)</label>
                  <div className="flex gap-2">
                    <input type="number" className="w-full p-2 border rounded-md mb-2" placeholder="Mínimo" value={capitalMin} onChange={e => setCapitalMin(e.target.value)} />
                    <input type="number" className="w-full p-2 border rounded-md mb-2" placeholder="Máximo" value={capitalMax} onChange={e => setCapitalMax(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Veículos (mínimo/máximo)</label>
                  <div className="flex gap-2">
                    <input type="number" className="w-full p-2 border rounded-md mb-2" placeholder="Mínimo" value={vehicleMin} onChange={e => setVehicleMin(e.target.value)} />
                    <input type="number" className="w-full p-2 border rounded-md mb-2" placeholder="Máximo" value={vehicleMax} onChange={e => setVehicleMax(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="bg-yellow-400 text-white px-6 py-2 rounded-md hover:bg-yellow-500 flex items-center">
                  {submitting ? 'Enviando...' : 'Seguir ➔'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* --- Restante da UI da Página (Filtros e Tabela) --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        <input type="text" className="p-2 border rounded-md" placeholder="ID" value={filterId} onChange={(e) => setFilterId(e.target.value)} />
        <input type="text" className="p-2 border rounded-md" placeholder="Usuário" value={filterUser} onChange={(e) => setFilterUser(e.target.value)} />
        <input type="text" className="p-2 border rounded-md" placeholder="Estado" value={filterState} onChange={(e) => setFilterState(e.target.value)} />
        <input type="text" className="p-2 border rounded-md" placeholder="Quantidade" value={filterQuantity} onChange={(e) => setFilterQuantity(e.target.value)} />
        <input type="text" className="p-2 border rounded-md" placeholder="Formato" value={filterFormat} onChange={(e) => setFilterFormat(e.target.value)} />
        <input type="text" className="p-2 border rounded-md" placeholder="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} />
      </div>

       <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <label htmlFor="limit">Itens por página:</label>
          <input
            type="number"
            id="limit"
            className="w-20 p-2 border rounded-md"
            value={limit}
            min={1}
            max={50}
            onChange={(e) => setLimit(Math.min(50, Math.max(1, Number(e.target.value))))}
          />
          <button onClick={() => fetchData()} className="flex items-center px-3 py-2 bg-gray-100 border rounded hover:bg-gray-200">
            <RefreshCcw className="w-4 h-4 mr-1" /> Recarregar
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="flex items-center px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
          </button>
          <span className="text-sm text-gray-600">Página {page} de {totalPages} ({total} resultados)</span>
          <button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages}
            className="flex items-center px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Próxima <ChevronRight className="w-4 h-4 ml-1" />
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
              {prospects.map((prospect) => (
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