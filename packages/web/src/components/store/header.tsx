'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Package,
  MapPin,
  Heart,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { SearchBar } from '@/components/store/search-bar';
import { CartSidebar } from '@/components/store/cart-sidebar';
import { cn } from '@/lib/utils';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/produtos', label: 'Produtos' },
    { href: '/contato', label: 'Contato' },
    { href: '/politicas', label: 'Políticas' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-green-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-bold">
                <span className="text-green-600">Horti</span>
                <span className="text-orange-500">Fruti</span>
              </span>
            </Link>

            {/* Search bar - desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <SearchBar />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* User dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-1 p-2 text-gray-700 hover:text-green-600 transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onMouseEnter={() => setUserMenuOpen(true)}
                  aria-label="Conta do usuário"
                >
                  <User size={22} />
                  <span className="hidden md:inline text-sm">
                    {isAuthenticated ? user?.name?.split(' ')[0] : 'Conta'}
                  </span>
                  <ChevronDown size={14} className="hidden md:block" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="font-medium text-sm text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                          <Link
                            href="/conta"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User size={16} />
                            Minha Conta
                          </Link>
                          <Link
                            href="/conta/pedidos"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Package size={16} />
                            Meus Pedidos
                          </Link>
                          <Link
                            href="/conta/enderecos"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <MapPin size={16} />
                            Endereços
                          </Link>
                          <Link
                            href="/conta/favoritos"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Heart size={16} />
                            Favoritos
                          </Link>
                          <hr className="my-1 border-gray-100" />
                          <button
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={16} />
                            Sair
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <LogIn size={16} />
                            Entrar
                          </Link>
                          <Link
                            href="/cadastro"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <UserPlus size={16} />
                            Criar Conta
                          </Link>
                          <Link
                            href="/conta/pedidos"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Package size={16} />
                            Acompanhar Pedido
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <button
                className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
                onClick={() => setCartOpen(true)}
                aria-label="Carrinho de compras"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </button>
            </div>
          </div>

          {/* Search bar - mobile */}
          <div className="md:hidden pb-3">
            <SearchBar />
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 pb-3 border-t border-gray-100 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="py-2 text-gray-700 hover:text-green-600 font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
