'use client';

import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  CreditCard,
  Banknote,
  QrCode,
  Leaf,
  Heart,
  Send,
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: '/', label: 'Início' },
    { href: '/produtos', label: 'Produtos' },
    { href: '/contato', label: 'Contato' },
    { href: '/politicas', label: 'Políticas de Privacidade' },
    { href: '/politicas#termos', label: 'Termos de Uso' },
    { href: '/politicas#entregas', label: 'Políticas de Entrega' },
    { href: '/politicas#trocas', label: 'Trocas e Devoluções' },
  ];

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
            Receba Ofertas Frescas no seu Email
          </h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Cadastre-se e ganhe 10% de desconto na primeira compra!
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="seu@email.com"
              className="flex-1 px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-harvest-gold backdrop-blur-sm"
            />
            <button className="px-6 py-3 bg-harvest-gold text-earth-gray font-heading font-semibold rounded-xl hover:bg-harvest-gold/90 transition-colors shadow-md flex items-center gap-2">
              <Send size={18} />
              <span className="hidden sm:inline">Cadastrar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-earth-gray text-gray-300">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-fresh flex items-center justify-center">
                  <Leaf size={22} className="text-white" />
                </div>
                <span className="text-2xl font-heading font-bold">
                  <span className="text-white">Horti</span>
                  <span className="text-leafy-green">Fruti</span>
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Somos sua hortifrúti online de confiança. Entregamos frutas, verduras e legumes
                frescos diretamente do produtor até a sua casa. Qualidade e frescor garantidos em
                cada pedido.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-leafy-green transition-colors"
                  aria-label="WhatsApp"
                >
                  <Phone size={18} />
                </a>
                <a
                  href="https://instagram.com/hortifruti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-pink-600 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://facebook.com/hortifruti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </a>
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
                  <span>contato@hortifruti.com.br</span>
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
              © {currentYear} HortiFruti. Todos os direitos reservados.
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
