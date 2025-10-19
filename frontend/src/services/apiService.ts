import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const INVENTORY_BASE_URL = process.env.NEXT_PUBLIC_INVENTORY_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Objeto contendo as funções de serviço
export const apiService = {
  signup: async (email: string, name: string, password: string, departmentId: number) => {
    const response = await api.post('/auth/signup', { email, name, password, departmentId });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Nova função para buscar ativos
  fetchAssets: async () => {
    const token = localStorage.getItem('access_token'); // Obtém o token do localStorage
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    const inventoryApi = axios.create({
      baseURL: INVENTORY_BASE_URL, // Usa a URL do Serviço de Inventário
    });

    // Adiciona o token no cabeçalho Authorization para esta requisição específica
    inventoryApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const response = await inventoryApi.get('/assets/'); // Faz a requisição GET para /assets/
      return response.data; // Retorna os dados recebidos (a lista de ativos)
    } catch (error: any) {
        // Verifica se o erro é de autenticação (401)
        if (error.response && error.response.status === 401) {
            // Opcional: Limpar o token inválido/local expirado
            localStorage.removeItem('access_token');
            // Opcional: Redirecionar para login
            // window.location.href = '/login';
        }
        // Lança o erro para que o componente possa lidar
        throw error;
    }
  }
};