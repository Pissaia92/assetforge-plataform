import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const INVENTORY_BASE_URL = process.env.NEXT_PUBLIC_INVENTORY_BASE_URL || 'http://localhost:8000';
// Adicione uma variável de ambiente para o lifecycle-service
const LIFECYCLE_BASE_URL = process.env.NEXT_PUBLIC_LIFECYCLE_BASE_URL || 'http://localhost:3003'; // URL do lifecycle-service

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
    return response.data; // Retorna { access_token, user }
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
  },

  // Nova função para criar um ativo
  createAsset: async (assetData: { name: string; assetNumber: string; type: string; status: string; departmentId: number }) => {
    const token = localStorage.getItem('access_token'); // Obtém o token do localStorage
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    const inventoryApi = axios.create({
      baseURL: INVENTORY_BASE_URL, // Usa a URL do Serviço de Inventário
    });

    // Adiciona o token no cabeçalho Authorization e o Content-Type
    inventoryApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    inventoryApi.defaults.headers.post['Content-Type'] = 'application/json'; // Define o tipo de conteúdo como JSON

    try {
      const response = await inventoryApi.post('/assets/', assetData); // Faz a requisição POST para /assets/
      return response.data; // Retorna os dados do ativo recém-criado
    } catch (error: any) {
        // Verifica se o erro é de autenticação (401) ou de validação (422, 400)
        if (error.response && (error.response.status === 401 || error.response.status === 422 || error.response.status === 400)) {
            // Opcional: Limpar o token inválido/local expirado
            if (error.response.status === 401) {
                localStorage.removeItem('access_token');
                // Opcional: Redirecionar para login
                // window.location.href = '/login';
            }
            // Lança o erro original para que o componente possa lidar com mensagens específicas
            throw error;
        }
        // Lança outros erros genéricos
        throw error;
    }
  },

  // --- NOVA FUNÇÃO: Checkout de Ativo ---
  checkoutAsset: async (checkoutData: { assetId: number; employeeId: number }) => {
    // O checkout NÃO requer o token JWT do usuário logado para autenticação no lifecycle-service,
    // pois o lifecycle-service apenas publica o evento. A autorização da ação (checkout)
    // pode ser feita internamente no lifecycle-service ou no consumidor (inventory-service).
    // Para este exemplo, vamos assumir que o lifecycle-service apenas aceita o evento.
    // Se o lifecycle-service exigir autenticação, adicione a lógica de token aqui também.

    const lifecycleApi = axios.create({
      baseURL: LIFECYCLE_BASE_URL, // Usa a URL do Serviço de Ciclo de Vida
    });

    // Define o Content-Type
    lifecycleApi.defaults.headers.post['Content-Type'] = 'application/json';

    try {
      const response = await lifecycleApi.post('/checkout', checkoutData); // Faz a requisição POST para /checkout
      return response.data; // Retorna a resposta do lifecycle-service
    } catch (error: any) {
        // Lança o erro para que o componente possa lidar
        throw error;
    }
  }
};