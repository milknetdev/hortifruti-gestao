'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  icon?: string;
  productCount?: number;
}

interface CategoryGridProps {
  categories: Category[];
}

const defaultIcons: Record<string, string> = {
  frutas: '🍎',
  verduras: '🥬',
  legumes: '🥕',
  temperos: '🌿',
  organicos: '🌱',
  cestas: '🧺',
  bebidas: '🥤',
  laticinios: '🥛',
  grãos: '🌾',
  outros: '📦',
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4"
    >
      {categories.map((category) => (
        <motion.div key={category.id} variants={item}>
          <Link
            href={`/produtos?category=${category.slug}`}
            className="group block"
          >
            <div
              className={cn(
                'relative aspect-square rounded-xl overflow-hidden',
                'bg-gradient-to-br from-green-50 to-green-100',
                'border border-green-100 group-hover:border-green-300',
                'transition-all duration-300 group-hover:shadow-md'
              )}
            >
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl md:text-5xl">
                    {category.icon || defaultIcons[category.slug] || '📦'}
                  </span>
                </div>
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Category info */}
              <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                <h3 className="text-white font-semibold text-xs md:text-sm leading-tight">
                  {category.name}
                </h3>
                {category.productCount != null && (
                  <p className="text-white/70 text-[10px] md:text-xs mt-0.5">
                    {category.productCount} produtos
                  </p>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
