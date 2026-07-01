'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Truck, RefreshCcw, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PolicySection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: string[];
}

const policySections: PolicySection[] = [
  {
    id: 'privacidade',
    title: 'Política de Privacidade',
    icon: ShieldCheck,
    content: [
      'A HortiFruti valoriza a privacidade dos seus clientes e está comprometida em proteger os dados pessoais coletados.',
      'Coletamos apenas as informações necessárias para processar pedidos e melhorar sua experiência de compra, incluindo: nome, email, telefone, CPF, endereço de entrega e dados de pagamento.',
      'Seus dados pessoais são armazenados em servidores seguros e criptografados. Não vendemos, compartilhados ou transferimos suas informações para terceiros, exceto quando necessário para o processamento de pagamentos e entrega.',
      'Utilizamos cookies para melhorar a navegação, personalizar conteúdo e analisar o tráfego do site. Você pode gerenciar as preferências de cookies nas configurações do seu navegador.',
      'Você tem o direito de acessar, corrigir ou solicitar a exclusão dos seus dados pessoais a qualquer momento, entrando em contato conosco.',
      'Ao utilizar nosso site, você concorda com esta política de privacidade. Alterações podem ser feitas a qualquer momento e serão publicadas nesta página.',
    ],
  },
  {
    id: 'termos',
    title: 'Termos de Uso',
    icon: FileText,
    content: [
      'Ao acessar e utilizar o site da HortiFruti, você concorda com os seguintes termos e condições.',
      'Os preços dos produtos estão sujeitos a alterações sem aviso prévio. Promoções são válidas enquanto durarem os estoques.',
      'O cadastro no site é pessoal e intransferível. O cliente é responsável pela veracidade das informações fornecidas e pela guarda de suas credenciais de acesso.',
      'A HortiFruti se reserva o direito de cancelar pedidos em caso de divergência de preços, indisponibilidade de produtos ou suspeita de fraude.',
      'As imagens dos produtos são meramente ilustrativas. Embora nos esforcemos para representar fielmente os produtos, pode haver variações de cor, formato e tamanho.',
      'Todo o conteúdo do site (textos, imagens, logotipos) é de propriedade da HortiFruti e não pode ser reproduzido sem autorização.',
      'Estes termos são regidos pelas leis brasileiras. Quaisquer disputas serão resolvidas no foro da comarca de São Paulo - SP.',
    ],
  },
  {
    id: 'entregas',
    title: 'Política de Entregas',
    icon: Truck,
    content: [
      'Realizamos entregas de segunda a sábado, das 07h às 20h, e aos domingos das 08h às 14h.',
      'O prazo de entrega é de até 2 horas após a confirmação do pedido para a região metropolitana de São Paulo.',
      'O valor do frete é calculado com base na distância e no valor do pedido. Compras acima de R$ 100,00 têm frete grátis dentro da região de entrega.',
      'Acompanhe seu pedido em tempo real pela seção "Meus Pedidos" no site ou aplicativo.',
      'Na entrega, o cliente ou pessoa autorizada deve estar presente para receber o pedido. Caso não haja ninguém, uma nova tentativa será agendada.',
      'Retirada na loja está disponível sem custo adicional. O pedido estará pronto para retirada em até 1 hora após a confirmação.',
      'Em caso de atraso superior ao prazo informado, entre em contato com nosso atendimento para acompanhamento.',
    ],
  },
  {
    id: 'trocas',
    title: 'Trocas e Devoluções',
    icon: RefreshCcw,
    content: [
      'Na HortiFruti, garantimos a qualidade e frescor dos nossos produtos. Se você receber um item em condições inadequadas, oferecemos as seguintes opções:',
      'Reembolso integral: o valor do produto será devolvido na mesma forma de pagamento utilizada na compra.',
      'Substituição: enviaremos um novo produto equivalente sem custo adicional.',
      'Crédito na loja: o valor será convertido em crédito para uso em próximas compras.',
      'Para solicitar troca ou devolução, entre em contato em até 24 horas após o recebimento, enviando fotos do produto e o número do pedido.',
      'Produtos perecíveis (frutas, verduras, legumes) devem ser avaliados no ato da entrega. Recusas devem ser feitas imediatamente ao entregador.',
      'Produtos não perecíveis podem ser devolvidos em até 7 dias após o recebimento, conforme o Código de Defesa do Consumidor.',
      'A HortiFruti se reserva o direito de analisar cada caso individualmente para garantir a justiça na resolução.',
    ],
  },
];

export default function PoliciesPage() {
  const [openSection, setOpenSection] = useState<string>('privacidade');

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Políticas e Termos
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Conheça nossas políticas de privacidade, termos de uso, entregas e trocas.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto space-y-4">
        {policySections.map((section, index) => {
          const Icon = section.icon;
          const isOpen = openSection === section.id;

          return (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setOpenSection(isOpen ? '' : section.id)}
                className="w-full flex items-center gap-4 p-5 md:p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                    isOpen ? 'bg-green-100' : 'bg-gray-100'
                  )}
                >
                  <Icon
                    size={24}
                    className={isOpen ? 'text-green-600' : 'text-gray-500'}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                  <p className="text-sm text-gray-500">
                    {section.content.length} tópicos
                  </p>
                </div>
                <ChevronDown
                  size={20}
                  className={cn(
                    'text-gray-400 transition-transform',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: isOpen ? 'auto' : 0,
                  opacity: isOpen ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 md:px-6 pb-6 space-y-4">
                  <div className="border-t border-gray-100 pt-4" />
                  {section.content.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-sm text-gray-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Contact CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto mt-12 bg-green-50 rounded-2xl p-8 text-center"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-2">Ficou com alguma dúvida?</h3>
        <p className="text-gray-600 mb-4">
          Nossa equipe está pronta para esclarecer qualquer questão.
        </p>
        <a
          href="/contato"
          className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Fale Conosco
        </a>
      </motion.div>
    </div>
  );
}
