'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductCard } from '@/components/store/product-card';
import { Product } from '@/types';
import { api } from '@/lib/api';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data: result } = await api.get('/favorites');
        setFavorites(Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []));
      } catch {
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await api.delete(`/favorites/${productId}`);
      setFavorites((prev) => prev.filter((p) => p.id !== productId));
      toast.success('Removido dos favoritos');
    } catch {
      toast.error('Erro ao remover dos favoritos');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus Favoritos</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl animate-pulse h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/conta" className="hover:text-green-600">Minha Conta</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">Favoritos</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus Favoritos</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={64} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhum favorito ainda</h2>
          <p className="text-gray-500 mb-6">
            Adicione produtos aos favoritos para encontrá-los facilmente depois.
          </p>
          <Link
            href="/produtos"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Explorar Produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <button
                onClick={() => handleRemove(product.id)}
                className="absolute top-2 right-2 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                title="Remover dos favoritos"
              >
                <Trash2 size={16} />
              </button>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
