import React, { useEffect, useState } from 'react';
import { getUserList, createUser, editUser } from '../services/user';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

interface User {
  id: number;
  username: string;
  email: string;
  status: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [editModal, setEditModal] = useState<{ open: boolean, user: User | null }>({ open: false, user: null });
  const [editForm, setEditForm] = useState({ password: '', status: 1, email: '' });
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchUsers(currentPage);
    // eslint-disable-next-line
  }, [currentPage]);

  async function fetchUsers(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserList(page, limit);
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validatePassword(password: string) {
    // 8 caracteres, 1 maiúscula, 1 especial
    return /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!form.username || !form.email || !form.password) {
      setFormError('Preencha todos os campos.');
      return;
    }
    if (!validatePassword(form.password)) {
      setFormError('A senha deve ter pelo menos 8 caracteres, uma letra maiúscula e um caractere especial.');
      return;
    }
    try {
      await createUser(form);
      setFormSuccess('Usuário criado com sucesso!');
      setForm({ username: '', email: '', password: '' });
      fetchUsers(currentPage);
      setTimeout(() => setShowModal(false), 1000);
    } catch (err: any) {
      setFormError(err.message);
    }
  }

  function handlePageChange(page: number) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }

  function openEditModal(user: User) {
    setEditForm({ password: '', status: user.status, email: user.email });
    setEditModal({ open: true, user });
  }

  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(null);
    setEditLoading(true);
    if (editForm.password && !validatePassword(editForm.password)) {
      setEditError('A senha deve ter pelo menos 8 caracteres, uma letra maiúscula e um caractere especial.');
      setEditLoading(false);
      return;
    }
    if (!editForm.email) {
      setEditError('O email não pode ser vazio.');
      setEditLoading(false);
      return;
    }
    try {
      await editUser(editModal.user!.id, {
        ...(editForm.password ? { password: editForm.password } : {}),
        status: editForm.status,
        email: editForm.email,
      });
      setEditSuccess('Usuário atualizado com sucesso!');
      fetchUsers(currentPage);
      setTimeout(() => setEditModal({ open: false, user: null }), 1000);
    } catch (err: any) {
      setEditError(err.message);
    }
    setEditLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#faf6f6] p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#4b2f82]">Usuários</h1>
        <button
          className="bg-[#e98a15] hover:bg-[#f7a845] text-white font-bold py-2 px-4 rounded shadow transition-colors"
          onClick={() => setShowModal(true)}
        >
          Novo Usuário
        </button>
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-[#4b2f82] rounded-t-lg">
          <CardTitle className="text-white">Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-[#4b2f82]">Carregando...</div>
          ) : error ? (
            <div className="text-[#e98a15]">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-[#4b2f82]">
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Usuário</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Criado em</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-[#fdebf8]">
                        <td className="px-4 py-2 text-sm text-gray-900">{user.id}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{user.username}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{user.email}</td>
                        <td className="px-4 py-2 text-sm">
                          {user.status === 1 ? (
                            <span className="bg-[#1aba47] text-[#4b2f82] px-2 py-1 rounded text-white font-semibold">Ativo</span>
                          ) : (
                            <span className="bg-[#870909] text-[#4b2f82] px-2 py-1 rounded text-white font-semibold">Inativo</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            className="bg-[#4b2f82] hover:bg-[#21153b] text-white px-3 py-1 rounded text-xs font-semibold"
                            onClick={() => openEditModal(user)}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Paginação */}
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-[#4b2f82]">Total: {total}</span>
                <div className="flex gap-2">
                  <button
                    className={`px-3 py-1 rounded font-bold transition-colors ${currentPage === 1 ? 'bg-[#fcddf2] text-[#4b2f82] opacity-50' : 'bg-[#4b2f82] text-white hover:bg-[#21153b]'}`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                  <span className="px-2 py-1 text-[#4b2f82] font-semibold">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    className={`px-3 py-1 rounded font-bold transition-colors ${currentPage === totalPages ? 'bg-[#fcddf2] text-[#4b2f82] opacity-50' : 'bg-[#4b2f82] text-white hover:bg-[#21153b]'}`}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de novo usuário */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative">
            <button
              className="absolute top-2 right-2 text-[#e98a15] hover:text-[#4b2f82] text-2xl font-bold"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-[#4b2f82] mb-4">Novo Usuário</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-[#4b2f82] font-semibold mb-1">Usuário</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleInputChange}
                  className="w-full border border-[#fcddf2] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e98a15]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#4b2f82] font-semibold mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="w-full border border-[#fcddf2] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e98a15]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#4b2f82] font-semibold mb-1">Senha</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  className="w-full border border-[#fcddf2] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e98a15]"
                  required
                />
              </div>
              {formError && <div className="text-[#af0f7c] text-sm">{formError}</div>}
              {formSuccess && <div className="text-[#4b2f82] text-sm">{formSuccess}</div>}
              <button
                type="submit"
                className="w-full bg-[#e98a15] hover:bg-[#f7a845] text-white font-bold py-2 px-4 rounded shadow transition-colors"
              >
                Criar Usuário
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de edição */}
      {editModal.open && editModal.user && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative">
            <button
              className="absolute top-2 right-2 text-[#e98a15] hover:text-[#4b2f82] text-2xl font-bold"
              onClick={() => setEditModal({ open: false, user: null })}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-[#4b2f82] mb-4">Editar Usuário</h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-[#4b2f82] font-semibold mb-1">Usuário</label>
                <input
                  type="text"
                  name="username"
                  value={editModal.user.username}
                  className="w-full border border-[#fcddf2] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e98a15]"
                  disabled
                />
              </div>
              <div>
                <label className="block text-[#4b2f82] font-semibold mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border border-[#fcddf2] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e98a15]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#4b2f82] font-semibold mb-1">Nova Senha</label>
                <input
                  type="password"
                  name="password"
                  value={editForm.password}
                  onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full border border-[#fcddf2] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e98a15]"
                  placeholder="Deixe em branco para não alterar"
                />
              </div>
              <div>
                <label className="block text-[#4b2f82] font-semibold mb-1">Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: Number(e.target.value) })}
                  className="w-full border border-[#fcddf2] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e98a15]"
                >
                  <option value={1}>Ativo</option>
                  <option value={0}>Inativo</option>
                </select>
              </div>
              {editError && <div className="text-[#af0f7c] text-sm">{editError}</div>}
              {editSuccess && <div className="text-[#4b2f82] text-sm">{editSuccess}</div>}
              <button
                type="submit"
                className={`w-full bg-[#e98a15] hover:bg-[#f7a845] text-white font-bold py-2 px-4 rounded shadow transition-colors flex items-center justify-center`}
                disabled={editLoading}
              >
                {editLoading && (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                Salvar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 