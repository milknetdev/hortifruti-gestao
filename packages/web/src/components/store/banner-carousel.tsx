'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  imageUrl: string;
  link?: string;
  backgroundColor?: string;
}

const fallbackBanners: Banner[] = [
  {
    id: '1',
    title: 'Frutas Frescas Todo Dia',
    subtitle: 'Direto do produtor para a sua mesa. Entrega rápida e garantia de frescor!',
    imageUrl: '/images/banner-frutas.jpg',
    backgroundColor: '#16a34a',
  },
  {
    id: '2',
    title: 'Promoções da Semana',
    subtitle: 'Até 30% de desconto em frutas e verduras selecionadas.',
    imageUrl: '/images/banner-promo.jpg',
    backgroundColor: '#f97316',
  },
  {
    id: '3',
    title: 'Orgânicos Certificados',
    subtitle: 'Produtos orgânicos com certificação e qualidade garantida.',
    imageUrl: '/images/banner-organicos.jpg',
    backgroundColor: '#15803d',
  },
];

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data: result } = await api.get('/banners/active');
        const bannerList = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
        if (bannerList.length > 0) {
          setBanners(bannerList);
        } else {
          setBanners(fallbackBanners);
        }
      } catch {
        setBanners(fallbackBanners);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  if (loading) {
    return (
      <div className="w-full h-[200px] md:h-[360px] lg:h-[420px] bg-gray-200 animate-pulse rounded-xl" />
    );
  }

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
    <div className="relative w-full h-[200px] md:h-[360px] lg:h-[420px] rounded-xl overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center"
          style={{
            backgroundColor: banner.backgroundColor || '#16a34a',
          }}
        >
          {/* Background image overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${banner.image || banner.imageUrl})` }}
          />

          {/* Content */}
          <div className="relative container mx-auto px-6 md:px-12 z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4 max-w-lg"
            >
              {banner.title}
            </motion.h2>
            {banner.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-sm md:text-lg text-white/90 max-w-md"
              >
                {banner.subtitle}
              </motion.p>
            )}
            {banner.link && (
              <motion.a
                href={banner.link}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="inline-block mt-4 px-6 py-2 bg-white text-green-700 font-semibold rounded-full hover:bg-gray-100 transition-colors text-sm md:text-base"
              >
                Ver Ofertas
              </motion.a>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
            aria-label="Banner anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
            aria-label="Próximo banner"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all duration-300',
                index === current
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/75'
              )}
              aria-label={`Ir para banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
