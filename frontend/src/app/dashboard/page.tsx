'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Para redirecionamento se o token for inválido
import { apiService } from '../../services/apiService'; // Importa o serviço de API

interface Asset { // Define a interface para um ativo
  id: number;
  name: string;
  assetNumber: string;
  type: string;
  status: string;
  assignedTo: string | null; // Pode ser nulo se não estiver atribuído
  createdAt: string; // Ou Date, dependendo do formato recebido
  updatedAt: string;
  departmentId: number;
  // Adicione outros campos conforme definidos no seu backend
}

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]); // Estado para armazenar a lista de ativos
  const [loading, setLoading] = useState<boolean>(true); // Estado para indicar carregamento
  const [error, setError] = useState<string | null>(null); // Estado para armazenar erros
  const router = useRouter(); // Hook para navegação

  // Estados para o formulário de criação de ativo
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    assetNumber: '',
    type: '',
    status: 'available', // Valor padrão
    departmentId: 1, // Valor padrão, ajuste conforme necessário
  });
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssetsData = async () => {
      try {
        setLoading(true); // Inicia o carregamento
        const data = await apiService.fetchAssets(); // Chama a função para buscar ativos
        setAssets(data); // Atualiza o estado com os ativos recebidos
        setError(null); // Limpa erros anteriores
      } catch (err: any) {
        console.error("Erro ao buscar ativos:", err);
        // Verifica se o erro é de autenticação (401)
        if (err.response && err.response.status === 401) {
          setError('Sessão expirada ou inválida. Redirecionando para login...');
          // Opcional: Limpar o token local
          localStorage.removeItem('access_token');
          // Opcional: Redirecionar automaticamente após um tempo
          setTimeout(() => {
              router.push('/login');
          }, 2000); // Redireciona após 2 segundos
        } else {
            setError('Falha ao carregar os ativos. Por favor, tente novamente mais tarde.');
        }
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    };

    fetchAssetsData(); // Chama a função assim que o componente é montado
  }, [router]); // Adiciona router como dependência para o ESLint

  const handleLogout = () => {
    localStorage.removeItem('access_token'); // Limpa o token ao sair
    router.push('/login'); // Redireciona para a página de login
  };

  // Função para abrir o modal
  const openModal = () => {
    setIsModalOpen(true);
    setCreateError(null); // Limpa erro ao abrir
  };

  // Função para fechar o modal
  const closeModal = () => {
    setIsModalOpen(false);
    setNewAsset({ name: '', assetNumber: '', type: '', status: 'available', departmentId: 1 }); // Limpa o formulário
    setCreateError(null); // Limpa erro ao fechar
  };

  // Função para lidar com mudanças no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAsset(prev => ({ ...prev, [name]: value }));
  };

  // Função para lidar com o envio do formulário de criação
  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null); // Limpa erro anterior

    try {
      // Chama a função createAsset do apiService
      const createdAsset = await apiService.createAsset(newAsset);
      // Atualiza a lista de ativos adicionando o novo item
      setAssets(prevAssets => [...prevAssets, createdAsset]);
      // Limpa o formulário e fecha o modal
      setNewAsset({ name: '', assetNumber: '', type: '', status: 'available', departmentId: 1 });
      closeModal();
      alert('Ativo criado com sucesso!');
    } catch (err: any) {
      console.error("Erro ao criar ativo:", err);
      let errorMessage = 'Erro ao criar o ativo. Por favor, tente novamente.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setCreateError(errorMessage);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bem-vindo ao seu Dashboard</h2>
            <button
              onClick={openModal}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Novo Ativo
            </button>
          </div>

          {/* Bloco para exibir ativos ou mensagens de estado */}
          {loading && <p>Carregando ativos...</p>}
          {error && <p className="text-red-500">Erro: {error}</p>}
          {!loading && !error && (
            <div>
              <h3 className="text-lg font-medium mb-2">Lista de Ativos:</h3>
              {assets.length === 0 ? (
                <p>Nenhum ativo encontrado.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      {/* Adicione mais colunas conforme necessário */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assets.map((asset) => (
                      <tr key={asset.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{asset.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{asset.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{asset.assetNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{asset.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{asset.status}</td>
                        {/* Adicione mais células conforme necessári */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal para criar novo ativo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Novo Ativo</h3>
              {createError && <p className="text-red-500 text-sm mb-4">{createError}</p>}
              <form onSubmit={handleCreateAsset}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newAsset.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="assetNumber" className="block text-sm font-medium text-gray-700">Número *</label>
                  <input
                    type="text"
                    id="assetNumber"
                    name="assetNumber"
                    value={newAsset.assetNumber}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo *</label>
                  <input
                    type="text"
                    id="type"
                    name="type"
                    value={newAsset.type}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={newAsset.status}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="available">Disponível</option>
                    <option value="in_use">Em Uso</option>
                    <option value="maintenance">Manutenção</option>
                    <option value="retired">Aposentado</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">ID do Departamento *</label>
                  <input
                    type="number"
                    id="departmentId"
                    name="departmentId"
                    value={newAsset.departmentId}
                    onChange={handleInputChange}
                    required
                    min="1" // Ajuste o min/max conforme sua base de dados
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Criar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}