import { API_CONFIG } from '../config/api';
import { NewProspectDto } from '../pages/ProspectionPage';

const handleUnauthorized = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_info');
  window.location.href = '/';
};

export interface ProspectFilter {
  states: string[];
  cities: string[];
  neighborhoodies: string[];
  export: boolean;
  quantity: number;
  plan: number;
  file_formatting: string;
}

export interface Prospect {
  id: number;
  userId: number;
  filter: ProspectFilter;
  externalId: number;
  status: number | string;
}

export const getProspectList = async (
  page: number,
  limit: number,
  filters: {
    id: string,
    user: string,
    state: string,
    quantity: string,
    format: string,
    status: string
  }
): Promise<{ data: Prospect[], total: number, totalPages: number }> => {
  const token = localStorage.getItem('access_token');
  let filterString = '';
  for(const [key, value] of Object.entries(filters)) {
    if(value) {
      filterString += `${key}=${value}&`;
    }
  }
  const response = await fetch(`${API_CONFIG.baseURL}/prospect/list?page=${page}&limit=${limit}&${filterString}`, {
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
    throw new Error('Failed to fetch prospect list');
  }

  const json = await response.json();
  const total = json.total;
  const totalPages = json.totalPages;

  return {
    data: json.data,
    total: total,
    totalPages: totalPages,
  };
};

export const createProspect = async (data: NewProspectDto) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_CONFIG.baseURL}/prospect`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Sessão expirada');
  }

  if (!response.ok) {
    throw new Error('Failed to create prospect');
  }
  const json = await response.json();
  return json.data;
};

export const downloadProspect = async (externalId: number): Promise<void> => {
  const token = localStorage.getItem('access_token');
  
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/prospect/${externalId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Arquivo não encontrado');
      }
      if (response.status === 401) {
        handleUnauthorized();
        throw new Error('Sessão expirada');
      }
      throw new Error('Erro ao baixar arquivo');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/csv')) {
      throw new Error('Formato de arquivo inválido');
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('Arquivo vazio');
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().getTime();
    const fileName = `prospect-${timestamp}.csv`;
    
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro inesperado ao baixar arquivo');
  }
};