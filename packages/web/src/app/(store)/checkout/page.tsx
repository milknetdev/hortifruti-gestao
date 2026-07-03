'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';

const paymentMethods = [
  { id: 'pix', label: 'PIX', icon: QrCode, description: 'Aprovação instantânea', color: 'text-green-600' },
  { id: 'credit_card', label: 'Cartão de Crédito', icon: CreditCard, description: 'Visa, Mastercard, Elo', color: 'text-blue-600' },
  { id: 'debit_card', label: 'Cartão de Débito', icon: CreditCard, description: 'Débito à vista', color: 'text-purple-600' },
  { id: 'cash', label: 'Dinheiro', icon: Banknote, description: 'Pagamento na entrega', color: 'text-yellow-600' },
  { id: 'pay_on_delivery', label: 'Pagar na Entrega', icon: CircleDollarSign, description: 'PIX ou dinheiro na entrega', color: 'text-orange-600' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal: getSubtotal, total: getTotalAmount, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showAddresses, setShowAddresses] = useState(false);

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

  const subtotal = getSubtotal();
  const deliveryFee = deliveryType === 'delivery' && subtotal < 100 ? 9.9 : 0;
  const total = subtotal + deliveryFee;

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

    setLoading(true);
    try {
      await api.post('/orders', {
        items: items.map((item) => ({ 
          productId: item.productId || item.id, 
          quantity: Number(item.quantity) || 1 
        })),
        deliveryType,
        paymentMethod,
        notes: notes || undefined,
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
      <div className="container mx-auto px-4 py-16 text-center">
        <PackageCheck size={64} className="mx-auto text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Carrinho vazio</h1>
        <p className="text-gray-500 mb-6">Adicione produtos antes de finalizar.</p>
        <button
          onClick={() => router.push('/produtos')}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
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
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 mb-6"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Finalizar Pedido</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Type */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Tipo de Entrega</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryType('delivery')}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                  deliveryType === 'delivery'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Truck size={24} className={deliveryType === 'delivery' ? 'text-green-600' : 'text-gray-400'} />
                <div className="text-left">
                  <p className="font-medium text-sm">Entrega</p>
                  <p className="text-xs text-gray-500">Receba em casa</p>
                </div>
              </button>
              <button
                onClick={() => setDeliveryType('pickup')}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                  deliveryType === 'pickup'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Store size={24} className={deliveryType === 'pickup' ? 'text-green-600' : 'text-gray-400'} />
                <div className="text-left">
                  <p className="font-medium text-sm">Retirada</p>
                  <p className="text-xs text-gray-500">Retire na loja</p>
                </div>
              </button>
            </div>
          </div>

          {/* Address */}
          {deliveryType === 'delivery' && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Endereço de Entrega</h2>
                {isAuthenticated && (
                  <button 
                    onClick={fetchSavedAddresses}
                    className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Usar endereço salvo
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">CEP</label>
                  <input
                    type="text"
                    value={address.zipCode}
                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                    placeholder="00000-000"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Rua</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="Nome da rua"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Número</label>
                  <input
                    type="text"
                    value={address.number}
                    onChange={(e) => setAddress({ ...address, number: e.target.value })}
                    placeholder="Nº"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Complemento</label>
                  <input
                    type="text"
                    value={address.complement}
                    onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                    placeholder="Apto, bloco, etc."
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Bairro</label>
                  <input
                    type="text"
                    value={address.neighborhood}
                    onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                    placeholder="Bairro"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Cidade</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="Cidade"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Forma de Pagamento</h2>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                      paymentMethod === method.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Icon
                      size={24}
                      className={paymentMethod === method.id ? method.color : 'text-gray-400'}
                    />
                    <div>
                      <p className="font-medium text-sm">{method.label}</p>
                      <p className="text-xs text-gray-500">{method.description}</p>
                    </div>
                    <div className="ml-auto">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                          paymentMethod === method.id ? 'border-green-500' : 'border-gray-300'
                        )}
                      >
                        {paymentMethod === method.id && (
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Observações</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alguma observação sobre o pedido? Ex: frutas bem maduras, sem cebola..."
              rows={3}
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="sticky top-24 bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-semibold">Resumo do Pedido</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                    <Image
                      src={item.product.mainImage || '/images/placeholder-product.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity}x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frete</span>
                <span>
                  {deliveryFee > 0 ? formatCurrency(deliveryFee) : (
                    <span className="text-green-600">Grátis</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total</span>
                <span className="text-green-600">{formatCurrency(total)}</span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              disabled={loading}
              className="w-full py-3.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Processando...' : 'Confirmar Pedido'}
            </motion.button>

            <p className="text-xs text-gray-400 text-center">
              Ao confirmar, você concorda com nossos termos de uso.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de endereços salvos */}
      {showAddresses && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Selecione um endereço</h3>
              <button onClick={() => setShowAddresses(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            {savedAddresses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum endereço salvo</p>
            ) : (
              <div className="space-y-3">
                {savedAddresses.map((addr: any) => (
                  <button
                    key={addr.id}
                    onClick={() => selectSavedAddress(addr)}
                    className="w-full text-left p-4 border rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    <p className="font-medium">{addr.label || 'Endereço'}</p>
                    <p className="text-sm text-gray-600">{addr.street}, {addr.number}</p>
                    {addr.complement && <p className="text-sm text-gray-500">{addr.complement}</p>}
                    <p className="text-sm text-gray-500">{addr.neighborhood} - {addr.city}/{addr.state}</p>
                    <p className="text-sm text-gray-500">CEP: {addr.zipCode}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
