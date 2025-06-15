import { API_CONFIG } from '../config/api';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  id: number;
  user: string;
}

interface User {
  id: number;
  username: string;
}

const handleUnauthorized = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_info');
  window.location.href = '/';
};

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  console.log(credentials);
  const response = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Authentication failed');
  }

  return response.json();
};

export const getUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_CONFIG.baseURL}/auth/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Sessão expirada');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  const json = await response.json();
  return json.result.data;
};