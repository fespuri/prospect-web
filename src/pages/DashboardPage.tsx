import React, { useState, useEffect } from 'react';
import { BarChart3, Search, Users, Database, Home, Settings, LogOut, Bell, FileText, Calendar } from 'lucide-react';
import ProspectionPage from './ProspectionPage';
import { getDashboardData } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardData {
  UsersData: {
    totalUsers: number;
    totalActive: number;
    totalInactive: number;
    totalCreatedToday: number;
    totalCreatedThisMonth: number;
    averageUsersPerDay: number;
    userGrowthRate: string;
  };
  ProspectData: {
    totalProspects: number;
    totalProspectsAtivos: number;
    totalProspectsCriadosHoje: number;
    totalProspectsCriadosMes: number;
    detailsByUser: Array<{
      totalProspects: number;
      totalProspectsAtivos: number;
      totalProspectsCriadosHoje: number;
      totalProspectsCriadosMes: number;
      userId: number;
    }>;
    averageCompaniesPerProspect: number;
    conversionRate: string;
  };
  CompaniesData: {
    topStates: Array<{ state: string; count: string }>;
    topCities: Array<{ city: string; count: string }>;
    topCnaeCodes: Array<{ code: number; description: string; count: string }>;
    companiesByJuridicalType: Array<{ type: string; count: string }>;
    companiesBySize: Array<{ size: string; count: string }>;
    companiesByCreationDate: Array<{ year: number; count: string }>;
    revenueStats: {
      totalRevenue: number;
      averageRevenue: number;
    };
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];

function DashboardPage() {
  const [userName, setUserName] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      const { user } = JSON.parse(userInfo);
      setUserName(user);
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboardData();
        setDashboardData(response.result);
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar dados do dashboard');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    window.location.reload();
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'prospection':
        return <ProspectionPage />;
      case 'dashboard':
      default:
        if (loading) {
          return (
            <div className="flex items-center justify-center h-screen bg-[#faf6f6]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4b2f82]"></div>
            </div>
          );
        }

        if (error) {
          return (
            <div className="flex items-center justify-center h-screen bg-[#faf6f6]">
              <div className="text-[#e98a15] text-xl">{error}</div>
            </div>
          );
        }

        if (!dashboardData) {
          return (
            <div className="flex items-center justify-center h-screen bg-[#faf6f6]">
              <div className="text-[#4b2f82] text-xl">Nenhum dado disponível</div>
            </div>
          );
        }

        return (
          <div className="min-h-screen bg-[#faf6f6] p-8">
            {/* Seção de Usuários */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-[#4b2f82] rounded-t-lg">
                  <CardTitle className="text-white">Total de Usuários</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-[#4b2f82]">{dashboardData.UsersData.totalUsers}</p>
                  <p className="text-sm text-gray-500 mt-2">Ativos: {dashboardData.UsersData.totalActive}</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-[#4b2f82] rounded-t-lg">
                  <CardTitle className="text-white">Novos Usuários</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-[#4b2f82]">{dashboardData.UsersData.totalCreatedToday}</p>
                  <p className="text-sm text-gray-500 mt-2">Hoje</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-[#4b2f82] rounded-t-lg">
                  <CardTitle className="text-white">Usuários do Mês</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-[#4b2f82]">{dashboardData.UsersData.totalCreatedThisMonth}</p>
                  <p className="text-sm text-gray-500 mt-2">Este mês</p>
                </CardContent>
              </Card>
            </div>

            {/* Seção de Prospecções */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-[#e98a15] rounded-t-lg">
                  <CardTitle className="text-white">Total de Prospecções</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-[#e98a15]">{dashboardData.ProspectData.totalProspects}</p>
                  <p className="text-sm text-gray-500 mt-2">Ativas: {dashboardData.ProspectData.totalProspectsAtivos}</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-[#e98a15] rounded-t-lg">
                  <CardTitle className="text-white">Novas Prospecções</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-[#e98a15]">{dashboardData.ProspectData.totalProspectsCriadosHoje}</p>
                  <p className="text-sm text-gray-500 mt-2">Hoje</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-[#e98a15] rounded-t-lg">
                  <CardTitle className="text-white">Prospecções do Mês</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-4xl font-bold text-[#e98a15]">{dashboardData.ProspectData.totalProspectsCriadosMes}</p>
                  <p className="text-sm text-gray-500 mt-2">Este mês</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabelas de Empresas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Estados */}
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-[#e98a15] rounded-t-lg">
                  <CardTitle className="text-white">Top Estados</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dashboardData.CompaniesData.topStates.map((state, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{state.state}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{state.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Top Cidades */}
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-[#e98a15] rounded-t-lg">
                  <CardTitle className="text-white">Top Cidades</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dashboardData.CompaniesData.topCities.map((city, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{city.city}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{city.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Distribuição por Tamanho */}
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-[#4b2f82] rounded-t-lg">
                  <CardTitle className="text-white">Distribuição por Tamanho</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dashboardData.CompaniesData.companiesBySize.map((size, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{size.size}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{size.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Empresas por Ano de Criação */}
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-[#4b2f82] rounded-t-lg">
                  <CardTitle className="text-white">Empresas por Ano de Criação</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ano</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dashboardData.CompaniesData.companiesByCreationDate.map((year, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{year.year}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{year.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top CNAEs */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8">
              <CardHeader className="bg-[#e98a15] rounded-t-lg">
                <CardTitle className="text-white">Top CNAEs</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dashboardData.CompaniesData.topCnaeCodes.map((cnae, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{cnae.code}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{cnae.description}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{cnae.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6 flex items-center">
          <div className="bg-[#4B2F82] p-3 rounded">
            <span className="text-white text-2xl font-bold">inohub</span>
          </div>
        </div>
        <nav className="mt-6">
          <div className="px-3 space-y-1">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === 'dashboard'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('search')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === 'search'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Search className="mr-3 h-5 w-5" />
              Consulta
            </button>
            <button
              onClick={() => setCurrentPage('prospection')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === 'prospection'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="mr-3 h-5 w-5" />
              Prospecção
            </button>
            <button
              onClick={() => setCurrentPage('enrichment')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === 'enrichment'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Database className="mr-3 h-5 w-5" />
              Enriquecimento
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-2">
            <h1 className="text-lg font-semibold text-gray-900">
              {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
            </h1>
            <div className="flex items-center space-x-6">
              {/* Notification Bell */}
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                  3
                </span>
              </div>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-700">{userName}</span>
                  <button 
                    onClick={handleLogout}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Sair
                  </button>
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}

export default DashboardPage;