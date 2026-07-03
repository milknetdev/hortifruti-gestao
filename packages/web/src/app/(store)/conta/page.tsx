'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, MapPin, Heart, User, ChevronRight, LogOut, Share2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

const quickLinks = [
  { href: '/conta/pedidos', label: 'Meus Pedidos', icon: Package, description: 'Acompanhe seus pedidos' },
  { href: '/conta/enderecos', label: 'Endereços', icon: MapPin, description: 'Gerencie seus endereços' },
  { href: '/conta/favoritos', label: 'Favoritos', icon: Heart, description: 'Seus produtos favoritos' },
  { href: '/conta/indicacoes', label: 'Indicações', icon: Share2, description: 'Ganhe comissões indicando' },
  { href: '/conta/perfil', label: 'Meu Perfil', icon: User, description: 'Edite seus dados pessoais' },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <User size={64} className="mx-auto text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Faça login</h1>
        <p className="text-gray-500 mb-6">Acesse sua conta para ver seus dados e pedidos.</p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Fazer Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 md:p-8 text-white mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Olá, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-green-100 text-sm">
          Bem-vindo à sua conta. Gerencie seus pedidos, endereços e preferências.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={link.href}
                className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Icon size={24} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{link.label}</h3>
                  <p className="text-sm text-gray-500">{link.description}</p>
                </div>
                <ChevronRight size={20} className="text-gray-400 group-hover:text-green-600 transition-colors" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          logout();
          router.push('/');
        }}
        className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
      >
        <LogOut size={18} />
        Sair da conta
      </button>
    </div>
  );
}
