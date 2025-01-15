import React, { useState, useEffect } from 'react';
import { BarChart3, Search, Users, Database, Home, Settings, LogOut, Bell, FileText, Calendar } from 'lucide-react';
import ProspectionPage from './ProspectionPage';

function DashboardPage() {
  const [userName, setUserName] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      const { user } = JSON.parse(userInfo);
      setUserName(user);
    }
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
        return (
          <div className="p-6">
            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Daily Reports Card */}
              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-500 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900">Relatórios Diários</h3>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-gray-900">24</p>
                  <p className="text-sm text-gray-500 mt-1">Relatórios gerados hoje</p>
                </div>
                <div className="mt-4">
                  <span className="text-green-500 text-sm font-medium">↑ 12%</span>
                  <span className="text-gray-500 text-sm ml-2">desde ontem</span>
                </div>
              </div>

              {/* Monthly Reports Card */}
              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-purple-500 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900">Relatórios Mensais</h3>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-gray-900">547</p>
                  <p className="text-sm text-gray-500 mt-1">Relatórios este mês</p>
                </div>
                <div className="mt-4">
                  <span className="text-green-500 text-sm font-medium">↑ 8%</span>
                  <span className="text-gray-500 text-sm ml-2">desde último mês</span>
                </div>
              </div>

              {/* Users Card */}
              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-500 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900">Usuários</h3>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-gray-900">128</p>
                  <p className="text-sm text-gray-500 mt-1">Usuários ativos</p>
                </div>
                <div className="mt-4">
                  <span className="text-green-500 text-sm font-medium">↑ 4%</span>
                  <span className="text-gray-500 text-sm ml-2">desde última semana</span>
                </div>
              </div>
            </div>

            {/* Chart section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Volume diário</h3>
              {/* Chart would go here */}
            </div>
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