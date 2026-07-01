'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Loader2 } from 'lucide-react';
import { BannerCarousel } from '@/components/store/banner-carousel';
import { CategoryGrid } from '@/components/store/category-grid';
import { ProductCard } from '@/components/store/product-card';
import { Product } from '@/types';
import { api } from '@/lib/api';

function SectionSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-8 bg-gray-200 rounded mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          Ver todos
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [promotional, setPromotional] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catData, featData, promoData, bestData] = await Promise.allSettled([
          api.get('/categories'),
          api.get('/products/featured?limit=8'),
          api.get('/products/promotional?limit=8'),
          api.get('/products/best-sellers?limit=8'),
        ]);

        if (catData.status === 'fulfilled') {
          const res = catData.value?.data?.data || catData.value?.data || [];
          setCategories(Array.isArray(res) ? res : []);
        }
        if (featData.status === 'fulfilled') {
          const res = featData.value?.data?.data || featData.value?.data || [];
          setFeatured(Array.isArray(res) ? res : []);
        }
        if (promoData.status === 'fulfilled') {
          const res = promoData.value?.data?.data || promoData.value?.data || [];
          setPromotional(Array.isArray(res) ? res : []);
        }
        if (bestData.status === 'fulfilled') {
          const res = bestData.value?.data?.data || bestData.value?.data || [];
          setBestSellers(Array.isArray(res) ? res : []);
        }
      } catch {
        // handled by Promise.allSettled
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="pb-12">
      {/* Hero Banner */}
      <section className="container mx-auto px-4 pt-4">
        <BannerCarousel />
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 mt-12">
        <SectionHeader title="Categorias" href="/produtos" />
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <CategoryGrid categories={categories} />
        ) : (
          <CategoryGrid
            categories={[
              { id: '1', name: 'Frutas', slug: 'frutas' },
              { id: '2', name: 'Verduras', slug: 'verduras' },
              { id: '3', name: 'Legumes', slug: 'legumes' },
              { id: '4', name: 'Temperos', slug: 'temperos' },
              { id: '5', name: 'Orgânicos', slug: 'organicos' },
              { id: '6', name: 'Cestas', slug: 'cestas' },
            ]}
          />
        )}
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 mt-12">
        <SectionHeader title="Destaques" href="/produtos?sort=featured" />
        {loading ? (
          <SectionSkeleton />
        ) : featured.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <p className="text-gray-500 text-center py-8">Nenhum produto em destaque no momento.</p>
        )}
      </section>

      {/* Promotional Products */}
      <section className="container mx-auto px-4 mt-12">
        <SectionHeader title="🔥 Promoções" href="/produtos?sort=promotional" />
        {loading ? (
          <SectionSkeleton />
        ) : promotional.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {promotional.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <p className="text-gray-500 text-center py-8">Nenhuma promoção ativa no momento.</p>
        )}
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4 mt-12">
        <SectionHeader title="🏆 Mais Vendidos" href="/produtos?sort=best-sellers" />
        {loading ? (
          <SectionSkeleton />
        ) : bestSellers.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <p className="text-gray-500 text-center py-8">Dados de mais vendidos indisponíveis.</p>
        )}
      </section>
    </div>
  );
}
