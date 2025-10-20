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
  // Adicione outros campos conforme definidos no backend
}

// Defina também uma interface para o funcionário, se necessário
interface Employee {
  id: number;
  name: string;
  email: string;
}

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]); // Estado para armazenar a lista de ativos
  const [loading, setLoading] = useState<boolean>(true); // Estado para indicar carregamento
  const [error, setError] = useState<string | null>(null); // Estado para armazenar erros
  const router = useRouter(); // Hook para navegação

  // --- ESTADOS PARA DESIGNAÇÃO DE ATIVO ---
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [checkoutData, setCheckoutData] = useState({
    assetId: 0,
    employeeId: 0, 
  });
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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

  // --- FUNÇÕES PARA DESIGNAÇÃO DE ATIVO ---
  const openCheckoutModal = () => {
    setIsCheckoutModalOpen(true);
    setCheckoutError(null);
    // Pode-se pré-selecionar o primeiro ativo ou funcionário, se desejado
  };

  const closeCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
    setCheckoutData({ assetId: 0, employeeId: 0 }); // Limpa o formulário
    setCheckoutError(null);
  };

  const handleCheckoutAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (checkoutData.assetId <= 0 || checkoutData.employeeId <= 0) {
      setCheckoutError("Por favor, selecione um ativo e insira um ID de funcionário válidos.");
      return;
    }

    try {
      // Chama a nova função no apiService para checkout
      await apiService.checkoutAsset(checkoutData);
      alert('Ativo designado com sucesso!');
      closeCheckoutModal();
      fetchAssetsData(); // Descomente se quiser atualizar automaticamente
    } catch (err: any) {
      console.error("Erro ao designar ativo:", err);
      let errorMessage = 'Erro ao designar o ativo. Por favor, tente novamente.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setCheckoutError(errorMessage);
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
            <div className="space-x-2">
              <button
                onClick={openCheckoutModal} // Abre o modal de checkout
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                Designar Ativo
              </button>
              <button
                onClick={() => router.push('/dashboard/create-asset')} // Exemplo de link para criar ativo
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Novo Ativo
              </button>
            </div>
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atribuído a</th>
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
                        <td className="px-6 py-4 whitespace-nowrap">{asset.assignedTo || 'N/A'}</td> {/* Mostra 'N/A' se não estiver atribuído */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal para Designar Ativo (AJUSTADO) */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Designar Ativo</h3>
              {checkoutError && <p className="text-red-500 text-sm mb-4">{checkoutError}</p>}
              <form onSubmit={handleCheckoutAsset}>
                <div className="mb-4">
                  <label htmlFor="assetId" className="block text-sm font-medium text-gray-700">Ativo *</label>
                  <select
                    id="assetId"
                    name="assetId"
                    value={checkoutData.assetId}
                    onChange={(e) => setCheckoutData(prev => ({ ...prev, assetId: Number(e.target.value) }))}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value={0}>Selecione um ativo</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({asset.assetNumber})
                      </option>
                    ))}
                  </select>
                </div>
                {/* CAMPO PARA EMPLOYEE ID MANUAL */}
                <div className="mb-4">
                  <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">ID do Funcionário *</label>
                  <input
                    id="employeeId"
                    name="employeeId"
                    type="number"
                    min="1" // Ajuste o min/max conforme base de dados
                    value={checkoutData.employeeId}
                    onChange={(e) => setCheckoutData(prev => ({ ...prev, employeeId: Number(e.target.value) }))}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeCheckoutModal}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Designar
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