'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Hook para navegação
// Importa o OBJETO apiService, não a função signup isoladamente
import { apiService } from '@/services/apiService';

export default function SignupPage() {
  const router = useRouter(); // Inicializa o router
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [error, setError] = useState<string | null>(null); // Estado para guardar mensagens de erro

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpa erros antigos

    try {
      // Chama a função signup DENTRO do objeto apiService
      // A função espera os parâmetros separados: email, name, password, departmentId
      await apiService.signup(email, name, password, Number(departmentId)); // Converte departmentId para número
      alert('Cadastro realizado com sucesso! Redirecionando para o login...');
      router.push('/login'); // Redireciona para a página de login
    } catch (err: any) {
      console.error(err);
      // Tenta obter a mensagem de erro do backend
      let errorMessage = 'Erro ao realizar cadastro. Por favor, tente novamente.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Cadastro - AssetForge
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos do formulário */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">ID do Departamento</label>
            <input
              id="departmentId"
              type="number"
              required
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Exibe a mensagem de erro, se houver */}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </main>
  );
}