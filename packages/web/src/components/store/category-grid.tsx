'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Apple, Carrot, Leaf, Salad, Sprout, ShoppingBasket, Milk, Wheat, Package, Coffee, Egg, Croissant, Snowflake } from 'lucide-react';
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

const defaultIcons: Record<string, { icon: React.ElementType; bg: string; iconColor: string }> = {
  frutas: { icon: Apple, bg: 'from-red-400 to-orange-400', iconColor: 'text-white' },
  verduras: { icon: Salad, bg: 'from-green-400 to-emerald-500', iconColor: 'text-white' },
  legumes: { icon: Carrot, bg: 'from-orange-400 to-amber-500', iconColor: 'text-white' },
  temperos: { icon: Leaf, bg: 'from-emerald-400 to-teal-500', iconColor: 'text-white' },
  'temperos-e-ervas': { icon: Leaf, bg: 'from-emerald-400 to-teal-500', iconColor: 'text-white' },
  organicos: { icon: Sprout, bg: 'from-green-500 to-lime-500', iconColor: 'text-white' },
  cestas: { icon: ShoppingBasket, bg: 'from-amber-400 to-yellow-500', iconColor: 'text-white' },
  'cestas-prontas': { icon: ShoppingBasket, bg: 'from-amber-400 to-yellow-500', iconColor: 'text-white' },
  bebidas: { icon: Coffee, bg: 'from-blue-400 to-cyan-500', iconColor: 'text-white' },
  laticinios: { icon: Milk, bg: 'from-slate-300 to-slate-400', iconColor: 'text-white' },
  'ovos-e-laticinios': { icon: Egg, bg: 'from-yellow-300 to-amber-400', iconColor: 'text-white' },
  graos: { icon: Wheat, bg: 'from-yellow-400 to-amber-500', iconColor: 'text-white' },
  'graos-e-cereais': { icon: Wheat, bg: 'from-yellow-400 to-amber-500', iconColor: 'text-white' },
  panificacao: { icon: Croissant, bg: 'from-orange-300 to-amber-400', iconColor: 'text-white' },
  congelados: { icon: Snowflake, bg: 'from-sky-400 to-blue-500', iconColor: 'text-white' },
  outros: { icon: Package, bg: 'from-gray-400 to-gray-500', iconColor: 'text-white' },
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1 },
  };

  // Bento grid: first item spans 2 cols, first row has 3 items
  const bentoLayout = categories.length >= 6;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
      className={cn(
        'grid gap-3 md:gap-4',
        bentoLayout
          ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
          : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
      )}
    >
      {categories.map((category, index) => {
        const isHero = bentoLayout && index === 0;
        const iconInfo = defaultIcons[category.slug] || defaultIcons.outros;
        const IconComponent = iconInfo.icon;

        return (
          <motion.div
            key={category.id}
            variants={item}
            className={cn(isHero && 'md:col-span-2 md:row-span-2')}
          >
            <Link
              href={`/produtos?category=${category.slug}`}
              className="group block h-full"
            >
              <div
                className={cn(
                  'relative rounded-2xl overflow-hidden h-full',
                  'border border-forest/10 group-hover:border-forest/20',
                  'transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1',
                  isHero ? 'min-h-[200px] md:min-h-[280px]' : 'aspect-square'
                )}
              >
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes={isHero ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw'}
                  />
                ) : (
                  <div className={cn(
                    'w-full h-full bg-gradient-to-br flex items-center justify-center',
                    iconInfo.bg
                  )}>
                    <IconComponent
                      className={cn(
                        'drop-shadow-lg',
                        iconInfo.iconColor,
                        isHero ? 'w-20 h-20 md:w-28 md:h-28' : 'w-12 h-12 md:w-16 md:h-16'
                      )}
                      strokeWidth={1.5}
                    />
                  </div>
                )}

                {/* Glass overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Category info */}
                <div className={cn(
                  'absolute bottom-0 left-0 right-0',
                  isHero ? 'p-4 md:p-6' : 'p-3'
                )}>
                  <h3 className={cn(
                    'text-white font-heading font-bold leading-tight',
                    isHero ? 'text-lg md:text-2xl' : 'text-sm md:text-base'
                  )}>
                    {category.name}
                  </h3>
                  {category.productCount != null && (
                    <p className="text-white/70 text-xs mt-1">
                      {category.productCount} produtos
                    </p>
                  )}
                  {isHero && (
                    <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium group-hover:bg-white/30 transition-colors">
                      Explorar →
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
