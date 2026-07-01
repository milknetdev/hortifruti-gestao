'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, Tag, Truck, Store, ShoppingCart, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/cart-store';
import { formatCurrency, cn } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, subtotal: getSubtotal } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedAddress, setSelectedAddress] = useState('default');

  const subtotal = getSubtotal();
  const deliveryFeeAmount = deliveryType === 'delivery' && subtotal < 100 ? 9.9 : 0;
  const total = subtotal - discount + deliveryFeeAmount;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Digite um cupom válido');
      return;
    }
    if (couponCode.toUpperCase() === 'FRUTAS10') {
      setDiscount(subtotal * 0.1);
      setCouponApplied(true);
      toast.success('Cupom aplicado! 10% de desconto');
    } else {
      toast.error('Cupom inválido ou expirado');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart size={64} className="mx-auto text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Seu carrinho está vazio</h1>
        <p className="text-gray-500 mb-6">Adicione produtos frescos ao seu carrinho!</p>
        <Link
          href="/produtos"
          className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Ver Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/produtos" className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600">
          <ArrowLeft size={16} />
          Continuar Comprando
        </Link>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Meu Carrinho</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <motion.div
              key={item.productId}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                <Image
                  src={item.product.mainImage || '/images/placeholder-product.jpg'}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/produtos/${item.productId}`}
                  className="font-medium text-gray-900 hover:text-green-600 transition-colors"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-gray-500">{item.product.unit}</p>
                <p className="text-lg font-bold text-green-600 mt-1">
                  {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remover item"
                >
                  <Trash2 size={18} />
                </button>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() =>
                      item.quantity === 1
                        ? removeItem(item.productId)
                        : updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <p className="font-bold text-gray-900">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </p>
              </div>
            </motion.div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700">
              Limpar carrinho
            </button>
            <p className="text-sm text-gray-500">{items.length} item(ns)</p>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="sticky top-24 bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-lg font-semibold">Resumo do Pedido</h2>

            {/* Coupon */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Cupom de Desconto</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Digite seu cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                    className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponApplied}
                  className={cn(
                    'px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    couponApplied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  )}
                >
                  {couponApplied ? '✓' : 'Aplicar'}
                </button>
              </div>
            </div>

            {/* Delivery Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Entrega</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors',
                    deliveryType === 'delivery'
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  <Truck size={16} />
                  Entrega
                </button>
                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors',
                    deliveryType === 'pickup'
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  <Store size={16} />
                  Retirada
                </button>
              </div>
            </div>

            {/* Address selector (delivery only) */}
            {deliveryType === 'delivery' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Endereço de Entrega</label>
                <select
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option value="default">Rua das Frutas, 123 - Centro</option>
                  <option value="new">+ Adicionar novo endereço</option>
                </select>
              </div>
            )}

            {/* Summary values */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frete</span>
                <span>
                  {deliveryType === 'pickup' ? (
                    'Grátis'
                  ) : deliveryFeeAmount > 0 ? (
                    formatCurrency(deliveryFeeAmount)
                  ) : (
                    <span className="text-green-600">Grátis</span>
                  )}
                </span>
              </div>
              {deliveryType === 'delivery' && subtotal < 100 && (
                <p className="text-xs text-orange-500">
                  Faltam {formatCurrency(100 - subtotal)} para frete grátis!
                </p>
              )}
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total</span>
                <span className="text-green-600">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-3.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-lg"
            >
              Finalizar Compra
            </button>

            <p className="text-xs text-gray-400 text-center">
              Pagamento seguro • Dados protegidos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
