'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingCart, Tag, Truck, Store } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { formatCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function CartSidebar({ open, onClose }: CartSidebarProps) {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, cleanInvalidItems, subtotal: getSubtotal } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    cleanInvalidItems();
  }, []);

  const subtotal = getSubtotal();
  const deliveryFeeAmount = deliveryType === 'delivery' && subtotal < 100 ? 9.90 : 0;
  const total = subtotal - discount + deliveryFeeAmount;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Digite um cupom válido');
      return;
    }
    // Simulated coupon logic
    if (couponCode.toUpperCase() === 'FRUTAS10') {
      setDiscount(subtotal * 0.1);
      setCouponApplied(true);
      toast.success('Cupom aplicado! 10% de desconto');
    } else {
      toast.error('Cupom inválido ou expirado');
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }
    onClose();
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-green-600" />
                <h2 className="text-lg font-semibold">Meu Carrinho</h2>
                <span className="text-sm text-gray-500">({items.length})</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Fechar carrinho"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ShoppingCart size={48} className="mb-4" />
                  <p className="text-lg font-medium mb-1">Carrinho vazio</p>
                  <p className="text-sm text-center">
                    Adicione produtos frescos ao seu carrinho!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.product.mainImage || '/images/placeholder-product.jpg'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-gray-500">{item.product.unit}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm font-bold text-green-600">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                item.quantity === 1
                                  ? removeItem(item.productId)
                                  : updateQuantity(item.productId, item.quantity - 1)
                              }
                              className="w-6 h-6 rounded bg-white border flex items-center justify-center hover:bg-gray-100"
                            >
                              {item.quantity === 1 ? (
                                <Trash2 size={12} className="text-red-500" />
                              ) : (
                                <Minus size={12} />
                              )}
                            </button>
                            <span className="w-6 text-center text-xs font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-white border flex items-center justify-center hover:bg-gray-100"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      Limpar carrinho
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer - coupon + summary */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-4">
                {/* Coupon */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Cupom de desconto"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={couponApplied}
                      className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none disabled:bg-gray-100"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponApplied}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      couponApplied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {couponApplied ? 'Aplicado' : 'Aplicar'}
                  </button>
                </div>

                {/* Delivery toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeliveryType('delivery')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-colors',
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
                      'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-colors',
                      deliveryType === 'pickup'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    <Store size={16} />
                    Retirada
                  </button>
                </div>

                {/* Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  {deliveryFeeAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frete</span>
                      <span>{formatCurrency(deliveryFeeAmount)}</span>
                    </div>
                  )}
                  {deliveryType === 'delivery' && subtotal >= 100 && (
                    <div className="flex justify-between text-green-600">
                      <span>Frete</span>
                      <span>Grátis</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 border-t">
                    <span>Total</span>
                    <span className="text-green-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Finalizar Compra
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
