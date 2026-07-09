'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Loader2, Truck, ShieldCheck, Leaf, Clock, ArrowRight } from 'lucide-react';
import { BannerCarousel } from '@/components/store/banner-carousel';
import { CategoryGrid } from '@/components/store/category-grid';
import { ProductCard } from '@/components/store/product-card';
import { Product } from '@/types';
import { api } from '@/lib/api';

function SectionSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-forest/5 overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-100" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
            <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
            <div className="h-10 bg-gray-100 rounded-xl mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ title, subtitle, href, linkLabel }: { title: string; subtitle?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle mt-1">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1.5 text-sm font-heading font-semibold text-forest hover:text-leafy-green transition-colors group"
        >
          {linkLabel || 'Ver todos'}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}

const features = [
  { icon: Truck, title: 'Entrega Rápida', desc: 'No mesmo dia para toda a cidade' },
  { icon: Leaf, title: '100% Frescos', desc: 'Direto do produtor para você' },
  { icon: ShieldCheck, title: 'Qualidade Garantida', desc: 'Satisfação ou devolvemos seu dinheiro' },
  { icon: Clock, title: 'Atendimento 7 dias', desc: 'Seg a Dom, sempre à disposição' },
];

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [promotional, setPromotional] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [aboutSettings, setAboutSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catData, featData, promoData, bestData, aboutData] = await Promise.allSettled([
          api.get('/categories'),
          api.get('/products/featured?limit=8'),
          api.get('/products/promotional?limit=8'),
          api.get('/products/best-sellers?limit=8'),
          api.get('/settings/about'),
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
        if (aboutData.status === 'fulfilled') {
          const about = aboutData.value?.data?.data || aboutData.value?.data || {};
          setAboutSettings(about);
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
    <div className="pb-16">
      {/* Hero Banner */}
      <section className="container mx-auto px-4 pt-4">
        <BannerCarousel />
      </section>

      {/* Features bar */}
      <section className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-forest/5 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center flex-shrink-0">
                <feat.icon size={20} className="text-forest" />
              </div>
              <div>
                <p className="font-heading font-semibold text-sm text-earth-gray">{feat.title}</p>
                <p className="text-xs text-earth-gray/50">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories Bento Grid */}
      <section className="container mx-auto px-4 mt-12">
        <SectionHeader title="Categorias" subtitle="Explore nossa variedade de produtos frescos" href="/produtos" linkLabel="Ver produtos" />
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
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
      <section className="container mx-auto px-4 mt-14">
        <SectionHeader title="Destaques" subtitle="Os produtos mais amados pelos nossos clientes" href="/produtos?sort=featured" />
        {loading ? (
          <SectionSkeleton />
        ) : featured.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
          >
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 rounded-2xl bg-white border border-forest/5">
            <Leaf size={40} className="mx-auto text-forest/20 mb-3" />
            <p className="text-earth-gray/60">Nenhum produto em destaque no momento.</p>
          </div>
        )}
      </section>

      {/* Promo Banner */}
      <section className="container mx-auto px-4 mt-14">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden gradient-warm p-8 md:p-12"
        >
          <div className="relative z-10 text-center">
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-heading font-semibold mb-4">
              🔥 Oferta Especial
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">
              Até 30% OFF em Orgânicos
            </h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Produtos orgânicos certificados com desconto especial. Aproveite frescor e qualidade incomparáveis.
            </p>
            <Link
              href="/produtos?category=organicos"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-earth-gray font-heading font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
            >
              Ver Orgânicos
              <ArrowRight size={18} />
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/10 blur-xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-white/10 blur-xl" />
        </motion.div>
      </section>

      {/* Promotional Products */}
      <section className="container mx-auto px-4 mt-14">
        <SectionHeader title="Promoções" subtitle="Aproveite nossas ofertas imperdíveis" href="/produtos?sort=promotional" linkLabel="Ver promoções" />
        {loading ? (
          <SectionSkeleton />
        ) : promotional.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
          >
            {promotional.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 rounded-2xl bg-white border border-forest/5">
            <p className="text-earth-gray/60">Nenhuma promoção ativa no momento.</p>
          </div>
        )}
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4 mt-14">
        <SectionHeader title="Mais Vendidos" subtitle="Os favoritos da nossa comunidade" href="/produtos?sort=best-sellers" />
        {loading ? (
          <SectionSkeleton />
        ) : bestSellers.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
          >
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 rounded-2xl bg-white border border-forest/5">
            <p className="text-earth-gray/60">Dados de mais vendidos indisponíveis.</p>
          </div>
        )}
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 items-center"
        >
          <div>
            <span className="inline-block px-4 py-1.5 bg-forest/10 text-forest rounded-full text-sm font-heading font-semibold mb-4">
              Sobre Nós
            </span>
            <h2 className="section-title mb-4">{aboutSettings.aboutTitle || 'Frescor do Campo direto pra sua Mesa'}</h2>
            <p className="text-earth-gray/70 leading-relaxed mb-6">
              {aboutSettings.aboutDescription || 'Na HortiFruti, acreditamos que alimentação saudável começa com ingredientes frescos e de qualidade. Trabalhamos diretamente com produtores locais para garantir que cada fruta, verdura e legume chegue à sua casa com todo o sabor e nutrição que você merece.'}
            </p>
            <div className="grid grid-cols-3 gap-4">
              {(aboutSettings.aboutStat1 || aboutSettings.aboutStat2 || aboutSettings.aboutStat3) ? [
                { value: aboutSettings.aboutStat1 },
                { value: aboutSettings.aboutStat2 },
                { value: aboutSettings.aboutStat3 },
              ].filter(s => s.value).map((stat, i) => {
                const parts = stat.value.split(' ');
                return (
                  <div key={i} className="text-center p-4 rounded-2xl bg-white border border-forest/5">
                    <p className="font-heading text-2xl font-bold text-forest">{parts[0]}</p>
                    <p className="text-xs text-earth-gray/50 mt-1">{parts.slice(1).join(' ')}</p>
                  </div>
                );
              }) : [
                { value: '500+', label: 'Produtos' },
                { value: '10k+', label: 'Clientes' },
                { value: '5★', label: 'Avaliação' },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-2xl bg-white border border-forest/5">
                  <p className="font-heading text-2xl font-bold text-forest">{stat.value}</p>
                  <p className="text-xs text-earth-gray/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-forest/10 to-leafy-green/10 flex items-center justify-center border border-forest/10 overflow-hidden">
              {aboutSettings.aboutImage ? (
                <img src={aboutSettings.aboutImage} alt="Sobre nós" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <span className="text-7xl mb-4 block">🥗</span>
                  <p className="font-heading font-bold text-forest text-xl">{aboutSettings.aboutFeatureTitle || 'Qualidade Garantida'}</p>
                  <p className="text-earth-gray/50 text-sm mt-1">{aboutSettings.aboutFeatureDesc || 'Selecionados com carinho'}</p>
                </div>
              )}
            </div>
            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-harvest-gold text-earth-gray px-4 py-2 rounded-2xl shadow-lg font-heading font-bold text-sm"
            >
              🌱 Orgânico
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
