// Serviço para operações de usuário

import { API_CONFIG } from "@/config/api";

export async function getUserList(page = 1, limit = 10) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_CONFIG.baseURL}/auth/users?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar usuários');
  }
  const data = await response.json();
  // Retorna os dados de usuários e info de paginação
  return {
    users: data.result.data,
    total: data.result.total,
    totalPages: data.result.totalPages,
    currentPage: data.result.currentPage,
  };
}

export async function createUser({ username, email, password }: { username: string, email: string, password: string }) {
  const response = await fetch(`${API_CONFIG.baseURL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao criar usuário');
  }
  return data;
}

export async function editUser(id: number, body: { password?: string; email?: string; status?: number }) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_CONFIG.baseURL}/auth/edit?id=${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao editar usuário');
  }
  return data;
} 