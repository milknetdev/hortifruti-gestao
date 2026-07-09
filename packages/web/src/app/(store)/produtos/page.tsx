'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, X, ChevronLeft, ChevronRight, Loader2, Search, Grid3X3, LayoutList } from 'lucide-react';
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

function ProductsContent() {
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
        const cats = data?.data || data || []; setCategories(Array.isArray(cats) ? cats : []);
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

        const { data: result } = await api.get(`/products?${params.toString()}`);
        setProducts(Array.isArray(result.data) ? result.data : []);
        setTotalPages(result.meta?.totalPages || Math.ceil((result.meta?.total || 0) / 12) || 1);
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
        <h3 className="font-heading font-semibold text-earth-gray mb-3 text-sm uppercase tracking-wider">Categorias</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateParams({ category: null })}
            className={cn(
              'w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all font-medium',
              !currentCategory
                ? 'bg-forest text-white shadow-sm'
                : 'text-earth-gray/70 hover:bg-forest/5 hover:text-forest'
            )}
          >
            Todas as categorias
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParams({ category: cat.slug })}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all',
                currentCategory === cat.slug
                  ? 'bg-forest text-white font-medium shadow-sm'
                  : 'text-earth-gray/70 hover:bg-forest/5 hover:text-forest'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-heading font-semibold text-earth-gray mb-3 text-sm uppercase tracking-wider">Faixa de Preço</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={currentMinPrice}
            onChange={(e) => updateParams({ minPrice: e.target.value || null })}
            className="w-full px-3 py-2.5 border border-forest/10 rounded-xl text-sm focus:ring-2 focus:ring-forest/30 focus:border-forest/30 outline-none bg-white"
            min="0"
            step="0.01"
          />
          <span className="text-earth-gray/30 font-medium">—</span>
          <input
            type="number"
            placeholder="Max"
            value={currentMaxPrice}
            onChange={(e) => updateParams({ maxPrice: e.target.value || null })}
            className="w-full px-3 py-2.5 border border-forest/10 rounded-xl text-sm focus:ring-2 focus:ring-forest/30 focus:border-forest/30 outline-none bg-white"
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
              className="px-3 py-1.5 text-xs border border-forest/10 rounded-full text-earth-gray/60 hover:border-forest hover:text-forest hover:bg-forest/5 transition-all font-medium"
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
          className="w-full py-2.5 text-sm text-red-600 hover:text-red-700 font-heading font-semibold rounded-xl hover:bg-red-50 transition-all"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-earth-gray/50 mb-6">
        <span className="hover:text-forest cursor-pointer transition-colors">Início</span>
        <span className="mx-2">/</span>
        <span className="text-earth-gray font-heading font-medium">Produtos</span>
        {currentCategory && (
          <>
            <span className="mx-2">/</span>
            <span className="text-forest font-heading font-medium">
              {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
            </span>
          </>
        )}
      </nav>

      <div className="flex gap-8">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-28 bg-white rounded-2xl p-5 shadow-sm border border-forest/5">
            <FiltersPanel />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 bg-white rounded-2xl p-4 shadow-sm border border-forest/5">
            <div className="flex items-center gap-4">
              {/* Mobile filters button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 text-sm font-heading font-medium text-earth-gray hover:text-forest transition-colors"
              >
                <SlidersHorizontal size={18} />
                Filtros
              </button>
              <p className="text-sm text-earth-gray/50">
                {loading ? 'Carregando...' : `${products.length} produtos encontrados`}
              </p>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-earth-gray/50 hidden sm:block font-medium">Ordenar:</label>
              <select
                value={currentSort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="px-3 py-2 border border-forest/10 rounded-xl text-sm bg-white focus:ring-2 focus:ring-forest/30 focus:border-forest/30 outline-none font-medium"
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-forest/10 text-forest rounded-full text-sm font-medium">
                  {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                  <button onClick={() => updateParams({ category: null })} className="hover:text-red-600 transition-colors">
                    <X size={14} />
                  </button>
                </span>
              )}
              {currentSearch && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-leafy-green/10 text-forest rounded-full text-sm font-medium">
                  Busca: {currentSearch}
                  <button onClick={() => updateParams({ q: null })} className="hover:text-red-600 transition-colors">
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm border border-forest/5 overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
                    <div className="h-10 bg-gray-100 rounded-xl mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-5"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 rounded-2xl bg-white border border-forest/5">
              <Search size={48} className="mx-auto text-forest/20 mb-4" />
              <p className="text-earth-gray/70 font-heading font-semibold text-lg mb-2">Nenhum produto encontrado</p>
              <p className="text-earth-gray/40 text-sm">Tente ajustar seus filtros ou buscar por outro termo.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => updateParams({ page: String(currentPage - 1) })}
                disabled={currentPage <= 1}
                className="p-2.5 rounded-xl border border-forest/10 hover:bg-forest/5 hover:border-forest/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-earth-gray"
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
                      'w-10 h-10 rounded-xl text-sm font-heading font-semibold transition-all',
                      currentPage === page
                        ? 'bg-forest text-white shadow-md'
                        : 'border border-forest/10 hover:bg-forest/5 text-earth-gray hover:border-forest/20'
                    )}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-earth-gray/30 font-medium">...</span>}
              <button
                onClick={() => updateParams({ page: String(currentPage + 1) })}
                disabled={currentPage >= totalPages}
                className="p-2.5 rounded-xl border border-forest/10 hover:bg-forest/5 hover:border-forest/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-earth-gray"
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white p-6 overflow-y-auto rounded-r-3xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-heading font-bold text-forest">Filtros</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 hover:bg-forest/5 rounded-xl transition-colors"
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-forest" size={32} /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
