'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  MapPin,
  Truck,
  Store,
  QrCode,
  CreditCard,
  Banknote,
  CircleDollarSign,
  PackageCheck,
  ArrowLeft,
  Plus,
  X,
  Tag,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const paymentMethods = [
  { id: 'pix', label: 'PIX', icon: QrCode, description: 'Aprovação instantânea', color: 'text-forest' },
  { id: 'credit_card', label: 'Cartão de Crédito', icon: CreditCard, description: 'Visa, Mastercard, Elo', color: 'text-blue-600' },
  { id: 'debit_card', label: 'Cartão de Débito', icon: CreditCard, description: 'Débito à vista', color: 'text-purple-600' },
  { id: 'cash', label: 'Dinheiro', icon: Banknote, description: 'Pagamento na entrega', color: 'text-harvest-gold' },
  { id: 'pay_on_delivery', label: 'Pagar na Entrega', icon: CircleDollarSign, description: 'PIX ou dinheiro na entrega', color: 'text-orange-500' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, subtotal: getSubtotal, total: getTotalAmount, clearCart, deliveryType: storeDeliveryType, setDeliveryType: setStoreDeliveryType } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showAddresses, setShowAddresses] = useState(false);
  const [pickupPoints, setPickupPoints] = useState<any[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string>('');
  const [deliveryType, setDeliveryTypeLocal] = useState<'delivery' | 'pickup'>(storeDeliveryType === 'pickup' ? 'pickup' : 'delivery');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const fetchSavedAddresses = async () => {
    try {
      const userStr = localStorage.getItem('hortifruti-auth');
      if (!userStr) return;
      const parsed = JSON.parse(userStr);
      const userId = parsed?.state?.user?.id;
      if (!userId) return;
      const { data: result } = await api.get(`/addresses`);
      const addresses = result?.data || result || [];
      setSavedAddresses(Array.isArray(addresses) ? addresses : []);
      setShowAddresses(true);
    } catch {
      toast.error('Erro ao carregar endereços');
    }
  };

  const selectSavedAddress = (addr: any) => {
    setAddress({
      street: addr.street || '',
      number: addr.number || '',
      complement: addr.complement || '',
      neighborhood: addr.neighborhood || '',
      city: addr.city || '',
      state: addr.state || '',
      zipCode: addr.zipCode || '',
    });
    setShowAddresses(false);
    toast.success('Endereço selecionado!');
  };

  const saveAddress = async (): Promise<string | undefined> => {
    try {
      if (!address.street || !address.number || !address.city) return undefined;
      
      const { data: result } = await api.post('/addresses', {
        ...address,
        label: 'Principal',
        isDefault: true,
      });
      
      return result?.data?.id || result?.id;
    } catch {
      return undefined;
    }
  };

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setAddress((prev) => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
          zipCode: cep,
        }));
        toast.success('Endereço encontrado!');
      }
    } catch {
      // Ignore errors
    }
  };

  const subtotal = getSubtotal();
  const [deliverySettings, setDeliverySettings] = useState({ deliveryFee: 9.90, freeAbove: 100 });
  const deliveryFee = deliveryType === 'delivery' && subtotal < deliverySettings.freeAbove ? deliverySettings.deliveryFee : 0;
  const total = subtotal - discount + deliveryFee;

  // Fetch delivery settings
  useEffect(() => {
    const loadDeliverySettings = async () => {
      try {
        const { data: result } = await api.get('/delivery/settings');
        const settings = result?.data || result;
        setDeliverySettings({
          deliveryFee: Number(settings?.deliveryFee || 9.90),
          freeAbove: Number(settings?.freeAbove || 100),
        });
      } catch {}
    };
    loadDeliverySettings();
  }, []);

  // Fetch pickup points
  useEffect(() => {
    const loadPickupPoints = async () => {
      try {
        const { data: result } = await api.get('/pickup-points');
        const list = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
        setPickupPoints(list);
      } catch {}
    };
    loadPickupPoints();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Digite um cupom válido');
      return;
    }
    try {
      const { data: result } = await api.get(`/coupons/validate/${couponCode.toUpperCase()}?orderTotal=${subtotal}`);
      const data = result?.data || result;
      if (data.valid) {
        const couponType = data.coupon?.type;
        if (couponType === 'FREE_SHIPPING' || couponType === 'free_shipping') {
          setDiscount(0);
        } else {
          setDiscount(Number(data.discount) || 0);
        }
        setCouponApplied(true);
        toast.success('Cupom aplicado!');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Cupom inválido ou expirado';
      toast.error(message);
    }
  };

  const handleConfirm = async () => {
    if (!isAuthenticated) {
      toast.error('Faça login para finalizar o pedido');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }

    if (deliveryType === 'delivery' && !address.street) {
      toast.error('Preencha o endereço de entrega');
      return;
    }

    if (deliveryType === 'pickup' && !selectedPickupPoint) {
      toast.error('Selecione um ponto de retirada');
      return;
    }

    setLoading(true);
    try {
      // Get referral code from cookie
      const referralCode = document.cookie
        .split('; ')
        .find(row => row.startsWith('referral_code='))
        ?.split('=')[1];

      await api.post('/orders', {
        items: items
          .filter((item) => item.productId && item.productId.length === 36) // Valid UUID
          .map((item) => ({ 
            productId: item.productId, 
            quantity: Number(item.quantity) || 1 
          })),
        deliveryType,
        paymentMethod,
        deliveryFee: deliveryFee || 0,
        deliveryAddressId: deliveryType === 'delivery' ? await saveAddress() : undefined,
        pickupPointId: deliveryType === 'pickup' && selectedPickupPoint ? selectedPickupPoint : undefined,
        notes: notes || undefined,
        couponCode: couponApplied && couponCode ? couponCode : undefined,
        referralCode: referralCode || undefined,
      });
      clearCart();
      toast.success('Pedido realizado com sucesso!');
      router.push('/conta/pedidos');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-3xl bg-forest/10 flex items-center justify-center mx-auto mb-6">
          <PackageCheck size={48} className="text-forest/40" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-earth-gray mb-2">Carrinho vazio</h1>
        <p className="text-earth-gray/50 mb-8">Adicione produtos antes de finalizar.</p>
        <button
          onClick={() => router.push('/produtos')}
          className="px-8 py-3.5 bg-forest text-white rounded-xl hover:bg-forest/90 font-heading font-semibold shadow-md hover:shadow-lg transition-all"
        >
          Ver Produtos
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-earth-gray/50 hover:text-forest mb-6 font-medium transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <h1 className="text-2xl md:text-3xl font-heading font-bold text-earth-gray mb-8">Finalizar Pedido</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Type */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest/5">
            <h2 className="text-lg font-heading font-semibold text-earth-gray mb-4">Tipo de Entrega</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setDeliveryTypeLocal('delivery'); setStoreDeliveryType('delivery'); }}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-2xl border-2 transition-all',
                  deliveryType === 'delivery'
                    ? 'border-forest bg-forest/5 shadow-sm'
                    : 'border-forest/10 hover:border-forest/20'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  deliveryType === 'delivery' ? 'bg-forest text-white' : 'bg-forest/10 text-earth-gray/40'
                )}>
                  <Truck size={24} />
                </div>
                <div className="text-left">
                  <p className="font-heading font-semibold text-sm text-earth-gray">Entrega</p>
                  <p className="text-xs text-earth-gray/50">Receba em casa</p>
                </div>
              </button>
              <button
                onClick={() => { setDeliveryTypeLocal('pickup'); setStoreDeliveryType('pickup'); }}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-2xl border-2 transition-all',
                  deliveryType === 'pickup'
                    ? 'border-forest bg-forest/5 shadow-sm'
                    : 'border-forest/10 hover:border-forest/20'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  deliveryType === 'pickup' ? 'bg-forest text-white' : 'bg-forest/10 text-earth-gray/40'
                )}>
                  <Store size={24} />
                </div>
                <div className="text-left">
                  <p className="font-heading font-semibold text-sm text-earth-gray">Retirada</p>
                  <p className="text-xs text-earth-gray/50">Retire na loja</p>
                </div>
              </button>
            </div>
          </div>

          {/* Pickup Points */}
          {deliveryType === 'pickup' && pickupPoints.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest/5">
              <h2 className="text-lg font-heading font-semibold text-earth-gray mb-4">Escolha o ponto de retirada</h2>
              <div className="space-y-3">
                {pickupPoints.map((point: any) => (
                  <button
                    key={point.id}
                    onClick={() => setSelectedPickupPoint(point.id)}
                    className={cn(
                      'w-full text-left p-4 rounded-2xl border-2 transition-all',
                      selectedPickupPoint === point.id
                        ? 'border-forest bg-forest/5 shadow-sm'
                        : 'border-forest/10 hover:border-forest/20'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        selectedPickupPoint === point.id ? 'bg-forest text-white' : 'bg-forest/10 text-earth-gray/40'
                      )}>
                        <Store size={20} />
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-earth-gray">{point.name}</p>
                        <p className="text-sm text-earth-gray/60">{point.address}</p>
                        {point.neighborhood && (
                          <p className="text-xs text-earth-gray/40">{point.neighborhood} - {point.city}/{point.state}</p>
                        )}
                        <p className="text-xs text-earth-gray/40">Horário: {point.startTime} - {point.endTime}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Address */}
          {deliveryType === 'delivery' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest/5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-semibold text-earth-gray">Endereço de Entrega</h2>
                {isAuthenticated && (
                  <button 
                    onClick={fetchSavedAddresses}
                    className="text-sm text-forest hover:text-leafy-green flex items-center gap-1 font-heading font-semibold transition-colors"
                  >
                    <Plus size={14} />
                    Usar endereço salvo
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-heading font-medium text-earth-gray mb-1.5 block">CEP</label>
                  <input
                    type="text"
                    value={address.zipCode}
                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                    onBlur={(e) => fetchAddressByCep(e.target.value)}
                    placeholder="00000-000"
                    className="w-full px-4 py-3 border border-forest/10 rounded-xl text-sm focus:ring-2 focus:ring-forest/30 focus:border-forest/30 outline-none bg-white transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-heading font-medium text-earth-gray mb-1.5 block">Rua</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="Nome da rua"
                    className="w-full px-4 py-3 border border-forest/10 rounded-xl text-sm focus:ring-2 focus:ring-forest/30 focus:border-forest/30 outline-none bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-heading font-medium text-earth-gray mb-1.5 block">Número</label>
                  <input
                    type="text"
                    value={address.number}
                    onChange={(e) => setAddress({ ...address, number: e.target.value })}
                    placeholder="Nº"
                    className="w-full px-4 py-3 border border-forest/10 rounded-xl text-sm focus:ring-2 focus:ring-forest/30 focus:border-forest/30 outline-none bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-heading font-medium text-earth-gray mb-1.5 block">Complemento</label>
                  <input
                    type="text"
                    value={address.complement}
                    onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                    placeholder="Apto, bloco, etc."
                    className="w-full px-4 py-3 border border-forest/10 rounded-xl text-sm focus:ring-2 focus:ring-forest/30 focus:border-forest/30 outline-none bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-heading font-medium text-earth-gray mb-1.5 block">Bairro</label>
                  <input
                    type="text"
                    value={address.neighborhood}
                    onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                    placeholder="Bairro"
                    className="w-full px-4 py-3 border border-forest/10 rounded-xl text-sm focus:ring-2 focus:ring-forest/30 focus:border-forest/30 outline-none bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-heading font-medium text-earth-gray mb-1.5 block">Cidade</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="Cidade"
                    className="w-full px-4 py-3 border border-forest/10 rounded-xl text-sm focus:ring-2 focus:ring-forest/30 focus:border-forest/30 outline-none bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest/5">
            <h2 className="text-lg font-heading font-semibold text-earth-gray mb-4">Forma de Pagamento</h2>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                      paymentMethod === method.id
                        ? 'border-forest bg-forest/5 shadow-sm'
                        : 'border-forest/10 hover:border-forest/20'
                    )}
                  >
                    <div className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                      paymentMethod === method.id ? 'bg-forest text-white' : 'bg-forest/10 text-earth-gray/40'
                    )}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-sm text-earth-gray">{method.label}</p>
                      <p className="text-xs text-earth-gray/50">{method.description}</p>
                    </div>
                    <div className="ml-auto">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                          paymentMethod === method.id ? 'border-forest' : 'border-forest/20'
                        )}
                      >
                        {paymentMethod === method.id && (
                          <div className="w-3 h-3 rounded-full bg-forest" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest/5">
            <h2 className="text-lg font-heading font-semibold text-earth-gray mb-4">Observações</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alguma observação sobre o pedido? Ex: frutas bem maduras, sem cebola..."
              rows={3}
              className="w-full px-4 py-3 border border-forest/10 rounded-xl text-sm focus:ring-2 focus:ring-forest/30 focus:border-forest/30 outline-none resize-none bg-white transition-all"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Coupon */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest/5">
            <h2 className="text-lg font-heading font-semibold text-earth-gray mb-4">Cupom de Desconto</h2>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-earth-gray/30" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Digite seu cupom"
                  disabled={couponApplied}
                  className="w-full pl-10 pr-3 py-2.5 border border-forest/10 rounded-xl text-sm focus:ring-2 focus:ring-forest/30 focus:border-forest/30 outline-none disabled:bg-gray-50 transition-all"
                />
              </div>
              <Button
                onClick={handleApplyCoupon}
                disabled={couponApplied || !couponCode.trim()}
                variant="outline"
                className={cn(
                  'rounded-xl font-heading font-semibold border-forest/20',
                  couponApplied
                    ? 'bg-forest/10 text-forest border-forest/20'
                    : 'hover:bg-forest/5'
                )}
              >
                {couponApplied ? 'Aplicado' : 'Aplicar'}
              </Button>
            </div>
            {couponApplied && (
              <button
                onClick={() => { setCouponApplied(false); setCouponCode(''); setDiscount(0); }}
                className="text-sm text-red-500 hover:text-red-700 mt-2 font-medium transition-colors"
              >
                Remover cupom
              </button>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-28 bg-white rounded-2xl p-6 shadow-sm border border-forest/5 space-y-4">
              <h2 className="text-lg font-heading font-semibold text-earth-gray">Resumo do Pedido</h2>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-forest/5">
                      <Image
                        src={item.product.mainImage || '/images/placeholder-product.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-heading font-semibold text-earth-gray truncate">{item.product.name}</p>
                      <p className="text-xs text-earth-gray/50">
                        {item.quantity}x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="text-sm font-heading font-bold text-earth-gray">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 pt-4 border-t border-forest/5 text-sm">
                <div className="flex justify-between">
                  <span className="text-earth-gray/60">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-forest">
                    <span className="font-medium">Desconto</span>
                    <span className="font-medium">-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-earth-gray/60">Frete</span>
                  <span>
                    {deliveryFee > 0 ? formatCurrency(deliveryFee) : (
                      <span className="text-forest font-medium">Grátis</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-heading font-bold pt-3 border-t border-forest/5">
                  <span className="text-earth-gray">Total</span>
                  <span className="text-forest">{formatCurrency(total)}</span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={loading}
                className="w-full py-4 bg-forest text-white font-heading font-semibold rounded-xl hover:bg-forest/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl"
              >
                {loading ? 'Processando...' : 'Confirmar Pedido'}
              </motion.button>

              <div className="flex items-center justify-center gap-2 text-xs text-earth-gray/40">
                <Lock size={12} />
                <span>Pagamento seguro e protegido</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de endereços salvos */}
      {showAddresses && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-heading font-bold text-earth-gray">Selecione um endereço</h3>
              <button onClick={() => setShowAddresses(false)} className="p-2 hover:bg-forest/5 rounded-xl transition-colors text-earth-gray/50 hover:text-earth-gray">
                <X size={20} />
              </button>
            </div>
            {savedAddresses.length === 0 ? (
              <div className="text-center py-10">
                <MapPin size={40} className="mx-auto text-forest/20 mb-3" />
                <p className="text-earth-gray/50">Nenhum endereço salvo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedAddresses.map((addr: any) => (
                  <button
                    key={addr.id}
                    onClick={() => selectSavedAddress(addr)}
                    className="w-full text-left p-4 border border-forest/10 rounded-2xl hover:border-forest hover:bg-forest/5 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0">
                        <MapPin size={16} className="text-forest" />
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-sm text-earth-gray">{addr.label || 'Endereço'}</p>
                        <p className="text-sm text-earth-gray/60">{addr.street}, {addr.number}</p>
                        {addr.complement && <p className="text-sm text-earth-gray/50">{addr.complement}</p>}
                        <p className="text-sm text-earth-gray/50">{addr.neighborhood} - {addr.city}/{addr.state}</p>
                        <p className="text-xs text-earth-gray/40">CEP: {addr.zipCode}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
