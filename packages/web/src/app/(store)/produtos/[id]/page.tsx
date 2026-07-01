'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Minus, Plus, ShoppingCart, Heart, Share2, Truck, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/cart-store';
import { ProductCard } from '@/components/store/product-card';
import { Product } from '@/types';
import { api } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  salePrice: number;
  costPrice?: number;
  promotionalPrice?: number | null;
  unit: string;
  weight?: string;
  stock: number;
  mainImage?: string;
  images?: string[];
  category: { id: string; name: string; slug: string };
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.id as string;
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get(`/products/slug/${slug}`); const data = res?.data || res;
        setProduct(data);

        // Fetch related products
        if (data?.category?.slug) {
          try {
            const relatedData = await api.get(
              `/products?category=${data.category.slug}&limit=4&exclude=${data.id}`
            );
            const relRes = relatedData?.data?.data || relatedData?.data || []; setRelated(Array.isArray(relRes) ? relRes : []);
          } catch {
            setRelated([]);
          }
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    const cartProduct: any = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      salePrice: displayPrice,
      mainImage: product.mainImage,
      unit: product.unit,
      stock: product.stock,
      minStock: 0,
      minQuantity: 1,
      incrementStep: 1,
      available: true,
      featured: false,
      promotional: !!product.promotionalPrice,
      active: true,
      sortOrder: 0,
      categoryId: product.category?.id || '',
      tenantId: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addItem(cartProduct, quantity);
    toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`);
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Produto não encontrado</h1>
        <p className="text-gray-500 mb-6">O produto que você procura não está disponível.</p>
        <Link
          href="/produtos"
          className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Ver Produtos
        </Link>
      </div>
    );
  }

  const displayPrice = product.promotionalPrice || product.salePrice;
  const hasPromo = product.promotionalPrice != null && product.promotionalPrice < product.salePrice;
  const allImages = product.images?.length ? product.images : [product.mainImage];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center flex-wrap gap-1">
        <Link href="/" className="hover:text-green-600">Início</Link>
        <ChevronRight size={14} />
        <Link href="/produtos" className="hover:text-green-600">Produtos</Link>
        {product.category && (
          <>
            <ChevronRight size={14} />
            <Link
              href={`/produtos?category=${product.category.slug}`}
              className="hover:text-green-600"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
            <Image
              src={allImages[selectedImage] || '/images/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {hasPromo && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                PROMO
              </span>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    'relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors',
                    selectedImage === index ? 'border-green-500' : 'border-gray-200'
                  )}
                >
                  <Image
                    src={img || "/images/placeholder-product.jpg"}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

          {product.category && (
            <Link
              href={`/produtos?category=${product.category.slug}`}
              className="text-sm text-green-600 hover:underline"
            >
              {product.category.name}
            </Link>
          )}

          {/* Price */}
          <div className="mt-4 mb-6">
            {hasPromo && (
              <p className="text-lg text-gray-400 line-through mb-1">
                {formatCurrency(product.salePrice)}
              </p>
            )}
            <p className={cn('text-3xl font-bold', hasPromo ? 'text-green-600' : 'text-gray-900')}>
              {formatCurrency(displayPrice)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Preço por {product.unit}
              {product.weight ? ` (${product.weight})` : ''}
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Stock */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="text-sm text-green-600 font-medium">✓ Em estoque</span>
            ) : (
              <span className="text-sm text-red-500 font-medium">✕ Fora de estoque</span>
            )}
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-gray-100 transition-colors"
              >
                <Minus size={18} />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-gray-100 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={20} />
              Adicionar ao Carrinho
            </motion.button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors',
                isFavorited
                  ? 'border-red-300 bg-red-50 text-red-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
              {isFavorited ? 'Favoritado' : 'Favoritar'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:border-gray-300 transition-colors">
              <Share2 size={16} />
              Compartilhar
            </button>
          </div>

          {/* Benefits */}
          <div className="space-y-3 p-4 bg-green-50 rounded-xl">
            <div className="flex items-center gap-3 text-sm text-green-700">
              <Truck size={18} />
              <span>Entrega rápida em até 2 horas</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-green-700">
              <ShieldCheck size={18} />
              <span>Garantia de frescor ou devolvemos seu dinheiro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
