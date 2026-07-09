'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Plus, Minus, Heart, Scale } from 'lucide-react';
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

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = addItem(product, quantity);
    if (result.success) {
      toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`);
      setQuantity(1);
      setShowQty(false);
    } else {
      toast.error(result.message || 'Erro ao adicionar ao carrinho');
    }
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
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative bg-white rounded-2xl overflow-hidden card-hover border border-forest/5"
    >
      <Link href={`/produtos/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={product.mainImage || '/images/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasPromo && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wide">
                Promo
              </span>
            )}
            {product.featured && !hasPromo && (
              <span className="bg-forest text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wide">
                Destaque
              </span>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFavorite}
            className={cn(
              'absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm',
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white'
            )}
            aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/produtos/${product.slug}`}>
          <h3 className="font-heading font-semibold text-earth-gray text-sm md:text-base line-clamp-2 mb-1 group-hover:text-forest transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.weight && (
          <p className="text-xs text-earth-gray/50 mb-2 flex items-center gap-1">
            <Scale size={12} />
            {product.weight}
          </p>
        )}

        <div className="flex items-baseline gap-2 mb-3">
          {hasPromo && (
            <span className="text-xs text-gray-400 line-through">
              {formatCurrency(product.salePrice)}
            </span>
          )}
          <span
            className={cn(
              'font-heading font-bold text-lg',
              hasPromo ? 'text-forest' : 'text-earth-gray'
            )}
          >
            {formatCurrency(displayPrice)}
          </span>
          <span className="text-xs text-earth-gray/50">/{product.unit}</span>
        </div>

        {/* Add to cart */}
        <div className="flex items-center gap-2">
          {showQty ? (
            <div className="flex items-center gap-1.5 flex-1">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(Math.max(1, quantity - 1)); }}
                className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center hover:bg-forest/20 transition-colors text-forest"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-heading font-bold text-earth-gray">{quantity}</span>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(quantity + 1); }}
                className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center hover:bg-forest/20 transition-colors text-forest"
              >
                <Plus size={14} />
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                className="flex-1 ml-1 h-9 bg-forest text-white text-sm font-heading font-semibold rounded-xl hover:bg-forest/90 transition-colors shadow-md"
              >
                Adicionar
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQty(true); }}
              className="w-full h-10 bg-forest text-white text-sm font-heading font-semibold rounded-xl hover:bg-forest/90 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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
