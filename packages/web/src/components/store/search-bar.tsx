'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  promotionalPrice?: number | null;
  unit: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data: result } = await api.get(`/products?search=${encodeURIComponent(query)}&limit=6`);
        const items = Array.isArray(result.data) ? result.data : [];
        setResults(items);
        setOpen(items.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar frutas, verduras, legumes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
        />
        {loading ? (
          <Loader2
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
          />
        ) : (
          query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setOpen(false);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )
        )}
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-96 overflow-y-auto"
          >
            {results.map((product) => {
              const price = product.promotionalPrice || product.salePrice;
              const hasPromo =
                product.promotionalPrice != null && product.promotionalPrice < product.salePrice;

              return (
                <Link
                  key={product.id}
                  href={`/produtos/${product.slug}`}
                  onClick={() => {
                    setOpen(false);
                    setQuery('');
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={product.mainImage || '/images/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-500">{product.unit}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {hasPromo && (
                      <p className="text-xs text-gray-400 line-through">
                        {formatCurrency(price)}
                      </p>
                    )}
                    <p className="text-sm font-bold text-green-600">
                      {formatCurrency(price)}
                    </p>
                  </div>
                </Link>
              );
            })}

            <Link
              href={`/produtos?q=${encodeURIComponent(query)}`}
              onClick={() => {
                setOpen(false);
              }}
              className="block p-3 text-center text-sm text-green-600 font-medium hover:bg-green-50 transition-colors"
            >
              Ver todos os resultados para &quot;{query}&quot;
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
