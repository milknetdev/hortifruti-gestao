'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Plus, Minus, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { useCartStore } from '@/stores/cart-store';
import { formatCurrency, cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [showQty, setShowQty] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const displayPrice = product.promotionalPrice || product.salePrice;
  const hasPromo = product.promotionalPrice != null && product.promotionalPrice < product.salePrice;

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`);
    setQuantity(1);
    setShowQty(false);
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { data: result } = await api.post(`/favorites/${product.id}`);
      const data = result?.data || result;
      setIsFavorited(data.favorited);
      toast.success(data.favorited ? 'Adicionado aos favoritos!' : 'Removido dos favoritos');
    } catch {
      toast.error('Faça login para favoritar produtos');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <Link href={`/produtos/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <Image
            src={product.mainImage || '/images/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {hasPromo && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              PROMO
            </span>
          )}
          <button
            onClick={handleFavorite}
            className={cn(
              'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all',
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-400 hover:text-red-500'
            )}
            aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>
      </Link>

      <div className="p-3 md:p-4">
        <Link href={`/produtos/${product.slug}`}>
          <h3 className="font-medium text-gray-900 text-sm md:text-base line-clamp-2 mb-1 group-hover:text-green-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.weight && (
          <p className="text-xs text-gray-500 mb-2">{product.weight}</p>
        )}

        <div className="flex items-baseline gap-2 mb-3">
          {hasPromo && (
            <span className="text-xs text-gray-400 line-through">
              {formatCurrency(product.salePrice)}
            </span>
          )}
          <span
            className={cn(
              'font-bold text-base md:text-lg',
              hasPromo ? 'text-green-600' : 'text-gray-900'
            )}
          >
            {formatCurrency(displayPrice)}
          </span>
          <span className="text-xs text-gray-500">/{product.unit}</span>
        </div>

        {/* Add to cart */}
        <div className="flex items-center gap-2">
          {showQty ? (
            <div className="flex items-center gap-1 flex-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Plus size={14} />
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                className="flex-1 ml-1 h-8 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Adicionar
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQty(true)}
              className="w-full h-9 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={16} />
              Adicionar
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
