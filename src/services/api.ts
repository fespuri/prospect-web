import { API_CONFIG } from '../config/api';

const handleUnauthorized = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_info');
  window.location.href = '/';
};

export const getDashboardData = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_CONFIG.baseURL}/dashboard`, {
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
    throw new Error('Failed to fetch dashboard data');
  }

  const json = await response.json();
  return json;
}; 