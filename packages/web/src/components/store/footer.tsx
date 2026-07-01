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
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-green-500">Horti</span>
              <span className="text-orange-500">Fruti</span>
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Somos sua hortifrúti online de confiança. Entregamos frutas, verduras e legumes
              frescos diretamente do produtor até a sua casa. Qualidade e frescor garantidos em
              cada pedido.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white hover:bg-green-500 transition-colors"
                aria-label="WhatsApp"
              >
                <Phone size={18} />
              </a>
              <a
                href="https://instagram.com/hortifruti"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white hover:bg-pink-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://facebook.com/hortifruti"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>Rua das Frutas, 123 - Centro, São Paulo - SP, 01234-567</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone size={18} className="text-green-500 flex-shrink-0" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail size={18} className="text-green-500 flex-shrink-0" />
                <span>contato@hortifruti.com.br</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Clock size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>
                  Seg a Sáb: 06:00 - 20:00
                  <br />
                  Dom: 07:00 - 14:00
                </span>
              </li>
            </ul>

            {/* Payment methods */}
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3">Formas de Pagamento</h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
                  <QrCode size={16} className="text-green-400" />
                  <span className="text-xs text-gray-300">PIX</span>
                </div>
                <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
                  <CreditCard size={16} className="text-blue-400" />
                  <span className="text-xs text-gray-300">Cartão</span>
                </div>
                <div className="flex items-center gap-1 bg-gray-800 rounded px-2 py-1">
                  <Banknote size={16} className="text-green-400" />
                  <span className="text-xs text-gray-300">Dinheiro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-sm text-gray-500">
            © {currentYear} HortiFruti. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-600">
            Feito com ❤️ para levar frescor até você
          </p>
        </div>
      </div>
    </footer>
  );
}
