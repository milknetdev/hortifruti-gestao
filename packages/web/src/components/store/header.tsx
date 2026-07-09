'use client';

import { useState, useEffect } from 'react';
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
  Leaf,
} from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { SearchBar } from '@/components/store/search-bar';
import { CartSidebar } from '@/components/store/cart-sidebar';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState({ storeName: 'HortiFruti', slogan: '', logo: '' });
  const { items } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: result } = await api.get('/settings/general');
        const data = result?.data || result || {};
        setStoreSettings({
          storeName: data.storeName || 'HortiFruti',
          slogan: data.slogan || '',
          logo: data.logo || '',
        });
      } catch {}
    };
    fetchSettings();
  }, []);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/produtos', label: 'Produtos' },
    { href: '/contato', label: 'Contato' },
    { href: '/politicas', label: 'Políticas' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-forest/10">
        {/* Top bar */}
        <div className="gradient-forest text-white text-center py-1.5 text-xs font-medium">
          <span className="hidden sm:inline">🥬 Frete grátis para pedidos acima de R$100 • Entrega no mesmo dia!</span>
          <span className="sm:hidden">🥬 Frete grátis acima de R$100!</span>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-earth-gray hover:text-forest transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl gradient-forest flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Leaf size={20} className="text-white" />
              </div>
              <span className="text-xl md:text-2xl font-heading font-bold">
                <span className="text-forest">{storeSettings.storeName || 'HortiFruti'}</span>
                
              </span>
            </Link>

            {/* Search bar - desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <SearchBar />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 md:gap-3">
              {/* User dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-1.5 p-2 text-earth-gray hover:text-forest transition-colors rounded-xl hover:bg-forest/5"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onMouseEnter={() => setUserMenuOpen(true)}
                  aria-label="Conta do usuário"
                >
                  <User size={22} />
                  <span className="hidden md:inline text-sm font-medium">
                    {isAuthenticated ? user?.name?.split(' ')[0] : 'Conta'}
                  </span>
                  <ChevronDown size={14} className="hidden md:block" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-forest/10 py-2 z-50 overflow-hidden"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-forest/5 to-leafy-green/5">
                            <p className="font-heading font-semibold text-sm text-forest">{user?.name}</p>
                            <p className="text-xs text-earth-gray/60">{user?.email}</p>
                          </div>
                          <Link
                            href="/conta"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-earth-gray hover:bg-forest/5 hover:text-forest transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User size={16} />
                            Minha Conta
                          </Link>
                          <Link
                            href="/conta/pedidos"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-earth-gray hover:bg-forest/5 hover:text-forest transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Package size={16} />
                            Meus Pedidos
                          </Link>
                          <Link
                            href="/conta/enderecos"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-earth-gray hover:bg-forest/5 hover:text-forest transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <MapPin size={16} />
                            Endereços
                          </Link>
                          <Link
                            href="/conta/favoritos"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-earth-gray hover:bg-forest/5 hover:text-forest transition-colors"
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
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={16} />
                            Sair
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-earth-gray hover:bg-forest/5 hover:text-forest transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <LogIn size={16} />
                            Entrar
                          </Link>
                          <Link
                            href="/cadastro"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-earth-gray hover:bg-forest/5 hover:text-forest transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <UserPlus size={16} />
                            Criar Conta
                          </Link>
                          <Link
                            href="/conta/pedidos"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-earth-gray hover:bg-forest/5 hover:text-forest transition-colors"
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
                className="relative p-2 text-earth-gray hover:text-forest transition-colors rounded-xl hover:bg-forest/5"
                onClick={() => setCartOpen(true)}
                aria-label="Carrinho de compras"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-harvest-gold text-earth-gray text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-sm"
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
          <nav className="hidden md:flex items-center gap-1 pb-3 border-t border-forest/5 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-heading font-medium text-earth-gray/70 hover:text-forest hover:bg-forest/5 rounded-xl transition-all"
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
              className="md:hidden bg-white border-t border-forest/10 overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="py-3 px-4 text-earth-gray hover:text-forest hover:bg-forest/5 font-heading font-medium rounded-xl transition-all"
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
// force deploy qui,  9 de jul de 2026 03:06:32
