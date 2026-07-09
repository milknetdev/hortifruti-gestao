'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Phone, Mail, MapPin, Clock, Loader2, ChevronDown, MessageCircle, Shield, Truck, RotateCcw, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const getContactInfo = (settings: any) => [
  {
    icon: Phone,
    title: 'WhatsApp',
    value: settings?.whatsapp || settings?.phone || '(11) 99999-9999',
    detail: 'Resposta em até 30 minutos',
    color: 'bg-green-500',
  },
  {
    icon: Mail,
    title: 'Email',
    value: settings?.email || 'contato@hortifruti.com.br',
    detail: 'Resposta em até 24 horas',
    color: 'bg-blue-500',
  },
  {
    icon: MapPin,
    title: 'Endereço',
    value: settings?.address || 'Rua das Frutas, 123',
    detail: settings?.address ? `${settings.city || ''} - ${settings.state || ''}` : 'Centro, São Paulo - SP',
    color: 'bg-forest',
  },
  {
    icon: Clock,
    title: 'Horário',
    value: settings?.weekdayHours ? `Seg a Sex: ${settings.weekdayHours}` : 'Seg a Sáb: 06:00 - 20:00',
    detail: settings?.saturdayHours ? `Sáb: ${settings.saturdayHours} • Dom: ${settings.sundayHours || 'Fechado'}` : 'Dom: 07:00 - 14:00',
    color: 'bg-harvest-gold',
  },
];

const faqItems = [
  {
    icon: Truck,
    question: 'Qual o prazo de entrega?',
    answer: 'Entregamos no mesmo dia para pedidos feitos até as 14h. Para pedidos após esse horário, a entrega é no próximo dia útil. Em dias de alta demanda, o prazo pode ser de até 2 dias úteis.',
  },
  {
    icon: RotateCcw,
    question: 'Como funciona a política de trocas?',
    answer: 'Se você não estiver satisfeito com a qualidade de algum produto, entre em contato em até 24 horas após o recebimento. Faremos a troca ou devolução do valor sem burocracia.',
  },
  {
    icon: Shield,
    question: 'Os orgânicos são certificados?',
    answer: 'Sim! Todos os nossos produtos orgânicos possuem certificação válida e são provenientes de produtores parceiros auditados. A qualidade e a procedência são prioridades para nós.',
  },
  {
    icon: HelpCircle,
    question: 'Posso agendar entregas?',
    answer: 'Sim, oferecemos a opção de agendar entregas para o dia e horário de sua preferência. Basta selecionar a opção durante o checkout ou entrar em contato pelo WhatsApp.',
  },
];

const iconMap: Record<string, any> = {
  'truck': Truck,
  'refresh-cw': RotateCcw,
  'shield': Shield,
  'calendar': Clock,
  'credit-card': Mail,
  'package': MapPin,
  'help-circle': HelpCircle,
};

function getIconComponent(iconName: string | any) {
  if (typeof iconName === 'string') {
    return iconMap[iconName] || HelpCircle;
  }
  return iconName;
}

function AccordionItem({ icon: iconName, question, answer, isOpen, onToggle }: {
  icon: any;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = getIconComponent(iconName);
  return (
    <div className={cn(
      'border rounded-2xl overflow-hidden transition-all',
      isOpen ? 'border-forest/20 bg-forest/5 shadow-sm' : 'border-forest/10 bg-white hover:border-forest/20'
    )}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 md:p-5 text-left"
      >
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
          isOpen ? 'bg-forest text-white' : 'bg-forest/10 text-forest'
        )}>
          <Icon size={20} />
        </div>
        <span className="flex-1 font-heading font-semibold text-sm md:text-base text-earth-gray">{question}</span>
        <ChevronDown
          size={18}
          className={cn(
            'text-earth-gray/40 transition-transform duration-200 flex-shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="px-4 md:px-5 pb-4 md:pb-5 pl-[68px] md:pl-[76px]">
          <p className="text-sm text-earth-gray/70 leading-relaxed">{answer}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqItems, setFaqItems] = useState([
    { icon: 'truck', question: 'Qual o prazo de entrega?', answer: 'Entregamos em ate 2 horas para toda a cidade.' },
    { icon: 'refresh-cw', question: 'Como funciona a politica de trocas?', answer: 'A troca pode ser solicitada em ate 24h.' },
    { icon: 'shield', question: 'Os organicos sao certificados?', answer: 'Sim! Todos possuem certificacao.' },
  ]);
  const [contactInfo, setContactInfo] = useState(getContactInfo({}));

  useEffect(() => {
    // Fetch contact settings
    const fetchSettings = async () => {
      try {
        const { data: result } = await api.get('/settings/general');
        const data = result?.data || result || {};
        setContactInfo(getContactInfo(data));
      } catch {}
    };
    fetchSettings();

    const fetchFaqs = async () => {
      try {
        const { data: result } = await api.get('/faqs');
        const faqs = result?.data?.data || result?.data || result || [];
        if (Array.isArray(faqs) && faqs.length > 0) {
          setFaqItems(faqs.map(f => ({ icon: f.icon, question: f.question, answer: f.answer })));
        }
      } catch {}
    };
    fetchFaqs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setLoading(true);
    try {
      await api.post('/contact', form);
      toast.success('Mensagem enviada com sucesso! Retornaremos em breve.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <span className="inline-block px-4 py-1.5 bg-forest/10 text-forest rounded-full text-sm font-heading font-semibold mb-4">
          Estamos Aqui
        </span>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-earth-gray mb-3">Fale Conosco</h1>
        <p className="text-earth-gray/50 max-w-lg mx-auto">
          Estamos aqui para ajudar! Envie sua dúvida, sugestão ou reclamação.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
        {/* Contact Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-forest/5 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-heading font-medium text-earth-gray mb-1.5">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Seu nome"
                className="w-full px-4 py-3 border border-forest/10 rounded-xl text-sm focus:ring-2 focus:ring-forest/30 focus:border-forest/30 outline-none bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-heading font-medium text-earth-gray mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border border-forest/10 rounded-xl text-sm focus:ring-2 focus:ring-forest/30 focus:border-forest/30 outline-none bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-heading font-medium text-earth-gray mb-1.5">Assunto</label>
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-3 border border-forest/10 rounded-xl text-sm focus:ring-2 focus:ring-forest/30 focus:border-forest/30 outline-none bg-white transition-all"
            >
              <option value="">Selecione um assunto</option>
              <option value="duvida">Dúvida</option>
              <option value="pedido">Sobre um pedido</option>
              <option value="reclamacao">Reclamação</option>
              <option value="sugestao">Sugestão</option>
              <option value="elogio">Elogio</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-heading font-medium text-earth-gray mb-1.5">
              Mensagem <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Escreva sua mensagem aqui..."
              rows={6}
              className="w-full px-4 py-3 border border-forest/10 rounded-xl text-sm focus:ring-2 focus:ring-forest/30 focus:border-forest/30 outline-none resize-none bg-white transition-all"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-forest text-white font-heading font-semibold rounded-xl hover:bg-forest/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-base"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send size={18} />
                Enviar Mensagem
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-4"
        >
          {contactInfo.map((info, i) => (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-forest/5 flex items-start gap-4 card-hover"
            >
              <div className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white',
                info.color
              )}>
                <info.icon size={20} />
              </div>
              <div>
                <p className="font-heading font-semibold text-sm text-earth-gray">{info.title}</p>
                <p className="text-sm text-earth-gray/70">{info.value}</p>
                <p className="text-xs text-earth-gray/40 mt-0.5">{info.detail}</p>
              </div>
            </motion.div>
          ))}

          {/* Map placeholder */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-forest/5">
            <div className="h-52 bg-gradient-to-br from-forest/5 to-leafy-green/5 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-forest/10 flex items-center justify-center mx-auto mb-3">
                  <MapPin size={28} className="text-forest/40" />
                </div>
                <p className="font-heading font-semibold text-sm text-earth-gray/60">Mapa interativo</p>
                <p className="text-xs text-earth-gray/30 mt-1">Rua das Frutas, 123 - Centro, São Paulo</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto mt-16"
      >
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-forest/10 text-forest rounded-full text-sm font-heading font-semibold mb-4">
            Dúvidas Frequentes
          </span>
          <h2 className="section-title">Perguntas & Respostas</h2>
          <p className="section-subtitle mx-auto mt-2">
            Encontre respostas para as dúvidas mais comuns dos nossos clientes
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              icon={item.icon}
              question={item.question}
              answer={item.answer}
              isOpen={openFaq === index}
              onToggle={() => setOpenFaq(openFaq === index ? null : index)}
            />
          ))}
        </div>

        {/* Still have questions? */}
        <div className="mt-8 text-center p-8 rounded-3xl gradient-forest text-white">
          <MessageCircle size={32} className="mx-auto mb-3 opacity-80" />
          <h3 className="font-heading font-bold text-xl mb-2">Ainda tem dúvidas?</h3>
          <p className="text-white/80 mb-4 text-sm">
            Entre em contato diretamente pelo WhatsApp. Respondemos rapidamente!
          </p>
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-forest font-heading font-semibold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
          >
            <Phone size={18} />
            Chamar no WhatsApp
          </a>
        </div>
      </motion.div>
    </div>
  );
}
