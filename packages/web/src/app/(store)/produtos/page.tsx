'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/store/product-card';
import { Product } from '@/types';
import { api } from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const sortOptions = [
  { value: 'name', label: 'Nome (A-Z)' },
  { value: 'price-asc', label: 'Menor Preço' },
  { value: 'price-desc', label: 'Maior Preço' },
  { value: 'best-sellers', label: 'Mais Vendidos' },
  { value: 'newest', label: 'Mais Recentes' },
];

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'name';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSearch = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      if (updates.category || updates.sort || updates.minPrice || updates.maxPrice) {
        params.set('page', '1');
      }
      router.push(`/produtos?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(Array.isArray(data) ? data : data?.items || []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentCategory) params.set('category', currentCategory);
        if (currentSort) params.set('sort', currentSort);
        if (currentMinPrice) params.set('minPrice', currentMinPrice);
        if (currentMaxPrice) params.set('maxPrice', currentMaxPrice);
        if (currentSearch) params.set('q', currentSearch);
        params.set('page', String(currentPage));
        params.set('limit', '12');

        const { data } = await api.get(`/products?${params.toString()}`);
        setProducts(Array.isArray(data) ? data : data?.items || []);
        setTotalPages(data?.totalPages || Math.ceil((data?.total || 0) / 12) || 1);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentCategory, currentSort, currentMinPrice, currentMaxPrice, currentSearch, currentPage]);

  const FiltersPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Categorias</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateParams({ category: null })}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
              !currentCategory ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            Todas as categorias
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParams({ category: cat.slug })}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                currentCategory === cat.slug
                  ? 'bg-green-100 text-green-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Faixa de Preço</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={currentMinPrice}
            onChange={(e) => updateParams({ minPrice: e.target.value || null })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            min="0"
            step="0.01"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={currentMaxPrice}
            onChange={(e) => updateParams({ maxPrice: e.target.value || null })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            min="0"
            step="0.01"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { min: '0', max: '5', label: 'Até R$5' },
            { min: '5', max: '10', label: 'R$5 - R$10' },
            { min: '10', max: '20', label: 'R$10 - R$20' },
            { min: '20', max: '', label: 'Acima de R$20' },
          ].map((range) => (
            <button
              key={range.label}
              onClick={() =>
                updateParams({
                  minPrice: range.min || null,
                  maxPrice: range.max || null,
                })
              }
              className="px-3 py-1 text-xs border rounded-full text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {(currentCategory || currentMinPrice || currentMaxPrice) && (
        <button
          onClick={() =>
            updateParams({ category: null, minPrice: null, maxPrice: null })
          }
          className="w-full py-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <span>Início</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Produtos</span>
        {currentCategory && (
          <>
            <span className="mx-2">/</span>
            <span className="text-green-600 font-medium">
              {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
            </span>
          </>
        )}
      </nav>

      <div className="flex gap-8">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <FiltersPanel />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              {/* Mobile filters button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <SlidersHorizontal size={18} />
                Filtros
              </button>
              <p className="text-sm text-gray-500">
                {loading ? 'Carregando...' : `${products.length} produtos encontrados`}
              </p>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500 hidden sm:block">Ordenar:</label>
              <select
                value={currentSort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filters */}
          {(currentCategory || currentSearch) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {currentCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                  <button onClick={() => updateParams({ category: null })}>
                    <X size={14} />
                  </button>
                </span>
              )}
              {currentSearch && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Busca: {currentSearch}
                  <button onClick={() => updateParams({ q: null })}>
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-2">Nenhum produto encontrado</p>
              <p className="text-gray-400 text-sm">Tente ajustar seus filtros ou buscar por outro termo.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => updateParams({ page: String(currentPage - 1) })}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => updateParams({ page: String(page) })}
                    className={cn(
                      'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                      currentPage === page
                        ? 'bg-green-600 text-white'
                        : 'border hover:bg-gray-50 text-gray-700'
                    )}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-gray-400">...</span>}
              <button
                onClick={() => updateParams({ page: String(currentPage + 1) })}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <FiltersPanel />
          </motion.div>
        </div>
      )}
    </div>
  );
}
