'use client'; // Indica que este é um componente do lado do cliente

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

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]); // Estado para armazenar a lista de ativos
  const [loading, setLoading] = useState<boolean>(true); // Estado para indicar carregamento
  const [error, setError] = useState<string | null>(null); // Estado para armazenar erros
  const router = useRouter(); // Hook para navegação

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
          <h2 className="text-xl font-semibold mb-4">Bem-vindo ao seu Dashboard</h2>
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
    </div>
  );
}