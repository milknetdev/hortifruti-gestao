'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/admin-store';
import { loginAdmin } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, user, login, hydrate } = useAdminStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role && ['admin', 'ADMIN', 'SUPER_ADMIN', 'super_admin'].includes(user.role)) {
      router.push('/admin');
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha email e senha');
      return;
    }

    setLoading(true);
    try {
      const result = await loginAdmin(email, password);
      const data = result.data || result;
      login(data.user, data.accessToken, data.refreshToken);
      toast.success('Login realizado com sucesso!');
      // Use window.location for reliable redirect after login
      setTimeout(() => {
        window.location.href = '/admin';
      }, 300);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Credenciais invalidas';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <span className="text-3xl">🥬</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">HortiFruti Gestao</h1>
            <p className="text-gray-500 mt-1">Acesse o painel administrativo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="admin@hortifruti.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Sua senha"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Credenciais padrao:</p>
            <p className="font-mono text-xs mt-1">admin@hortifruti.com / Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
