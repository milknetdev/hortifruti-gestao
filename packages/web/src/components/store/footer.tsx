'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Send, Phone, MapPin, Clock, Instagram, Facebook, Leaf, CreditCard, Banknote, QrCode, Heart, Mail } from 'lucide-react';
import { api } from '@/lib/api';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [whatsappLink, setWhatsappLink] = useState('');
  const [storeName, setStoreName] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('store-settings');
        if (cached) return JSON.parse(cached).storeName || 'HortiFruti';
      } catch {}
    }
    return 'HortiFruti';
  });
  const [storeEmail, setStoreEmail] = useState('contato@hortifruti.com.br');
  const [storeLogo, setStoreLogo] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('store-settings');
        if (cached) return JSON.parse(cached).logo || '';
      } catch {}
    }
    return '';
  });
  const [socialLinks, setSocialLinks] = useState({ phone: '', instagram: '', facebook: '' });
  const [quickLinks, setQuickLinks] = useState([
    { href: '/', label: 'Início' },
    { href: '/produtos', label: 'Produtos' },
    { href: '/contato', label: 'Contato' },
  ]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settingsRes, linksRes] = await Promise.allSettled([
          api.get('/settings/general'),
          api.get('/quick-links'),
        ]);

        if (settingsRes.status === 'fulfilled') {
          const data = settingsRes.value?.data?.data || settingsRes.value?.data || {};
          setWhatsappLink(data.whatsappGroupLink || '');
          setStoreName(data.storeName || 'HortiFruti');
          setStoreLogo(data.logo || '');
          setStoreEmail(data.email || 'contato@hortifruti.com.br');
          try { 
            const cached = JSON.parse(localStorage.getItem('store-settings') || '{}');
            localStorage.setItem('store-settings', JSON.stringify({ ...cached, storeName: data.storeName || 'HortiFruti', logo: data.logo || '' }));
          } catch {}
          setSocialLinks({
            phone: data.socialPhone || '',
            instagram: data.socialInstagram || '',
            facebook: data.socialFacebook || '',
          });
        }

        if (linksRes.status === 'fulfilled') {
          const links = linksRes.value?.data?.data || linksRes.value?.data || [];
          if (Array.isArray(links) && links.length > 0) {
            setQuickLinks(links.map(l => ({ href: l.href, label: l.label })));
          }
        }
      } catch {
        // ignore
      }
    };
    fetchSettings();
  }, []);

  const categories = [
    { href: '/produtos?category=frutas', label: 'Frutas' },
    { href: '/produtos?category=verduras', label: 'Verduras' },
    { href: '/produtos?category=legumes', label: 'Legumes' },
    { href: '/produtos?category=temperos', label: 'Temperos e Ervas' },
    { href: '/produtos?category=organicos', label: 'Orgânicos' },
    { href: '/produtos?category=cestas', label: 'Cestas Prontas' },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Newsletter CTA */}
      <div className="gradient-forest">
        <div className="container mx-auto px-4 py-12 md:py-16 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
            Receba Ofertas Frescas no WhatsApp
          </h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Entre no nosso grupo e ganhe 10% de desconto na primeira compra!
          </p>
          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-harvest-gold text-earth-gray font-heading font-semibold rounded-xl hover:bg-harvest-gold/90 transition-colors shadow-lg text-lg"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Entrar no Grupo
            </a>
          ) : (
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/20 text-white font-heading rounded-xl">
              <Phone size={20} />
              <span>Em breve nosso grupo de ofertas!</span>
            </div>
          )}
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-earth-gray text-gray-300">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                {storeLogo ? (
                  <img src={storeLogo} alt={storeName} className="h-10 w-auto max-w-[120px] object-contain" />
                ) : (
                  <div className="w-10 h-10 rounded-xl gradient-fresh flex items-center justify-center">
                    <Leaf size={22} className="text-white" />
                  </div>
                )}
                <span className="text-2xl font-heading font-bold">
                  <span className="text-white">{storeName}</span>
                  
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Somos sua hortifrúti online de confiança. Entregamos frutas, verduras e legumes
                frescos diretamente do produtor até a sua casa. Qualidade e frescor garantidos em
                cada pedido.
              </p>
              <div className="flex items-center gap-3">
                {socialLinks.phone && (
                  <a
                    href={`https://wa.me/${socialLinks.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-leafy-green transition-colors"
                    aria-label="WhatsApp"
                  >
                    <Phone size={18} />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-pink-600 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram size={18} />
                  </a>
                )}
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-5 text-lg">Links Rápidos</h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-leafy-green transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-5 text-lg">Categorias</h4>
              <ul className="space-y-2.5">
                {categories.map((cat) => (
                  <li key={cat.href}>
                    <Link
                      href={cat.href}
                      className="text-sm text-gray-400 hover:text-leafy-green transition-colors"
                    >
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-5 text-lg">Contato</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-leafy-green/20 flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-leafy-green" />
                  </div>
                  <span>Rua das Frutas, 123 - Centro, São Paulo - SP, 01234-567</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-leafy-green/20 flex items-center justify-center flex-shrink-0">
                    <Phone size={16} className="text-leafy-green" />
                  </div>
                  <span>(11) 99999-9999</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-leafy-green/20 flex items-center justify-center flex-shrink-0">
                    <Mail size={16} className="text-leafy-green" />
                  </div>
                  <span>{storeEmail}</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-leafy-green/20 flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-leafy-green" />
                  </div>
                  <span>
                    Seg a Sáb: 06:00 - 20:00
                    <br />
                    Dom: 07:00 - 14:00
                  </span>
                </li>
              </ul>

              {/* Payment methods */}
              <div className="mt-6">
                <h4 className="text-white font-heading font-semibold mb-3 text-sm">Formas de Pagamento</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { icon: QrCode, label: 'PIX', color: 'text-leafy-green' },
                    { icon: CreditCard, label: 'Cartão', color: 'text-blue-400' },
                    { icon: Banknote, label: 'Dinheiro', color: 'text-harvest-gold' },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                      <Icon size={14} className={color} />
                      <span className="text-xs text-gray-300">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-sm text-gray-500">
              © {currentYear} {storeName}. Todos os direitos reservados.
            </p>
            <p className="text-xs text-gray-600 flex items-center gap-1">
              Feito com <Heart size={12} className="text-red-500 fill-red-500" /> para levar frescor até você
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
