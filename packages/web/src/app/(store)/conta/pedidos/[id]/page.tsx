'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  unit: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  items: OrderItem[];
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  deliveryType: string;
  notes?: string;
}

const statusSteps = [
  { key: 'pending', label: 'Pendente', icon: Clock },
  { key: 'confirmed', label: 'Confirmado', icon: CheckCircle2 },
  { key: 'preparing', label: 'Preparando', icon: Package },
  { key: 'shipping', label: 'A Caminho', icon: Truck },
  { key: 'delivered', label: 'Entregue', icon: CheckCircle2 },
];

const paymentLabels: Record<string, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  cash: 'Dinheiro',
  pay_on_delivery: 'Pagar na Entrega',
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-40 bg-gray-200 rounded-xl" />
          <div className="h-60 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package size={64} className="mx-auto text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedido não encontrado</h1>
        <Link href="/conta/pedidos" className="text-green-600 hover:underline">
          Voltar para meus pedidos
        </Link>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1 flex-wrap">
        <Link href="/conta" className="hover:text-green-600">Minha Conta</Link>
        <ChevronRight size={14} />
        <Link href="/conta/pedidos" className="hover:text-green-600">Pedidos</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">
          #{order.orderNumber || order.id.slice(-8).toUpperCase()}
        </span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Pedido #{order.orderNumber || order.id.slice(-8).toUpperCase()}
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Realizado em{' '}
        {new Date(order.createdAt).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>

      {/* Status Timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-900 mb-6">Acompanhe seu pedido</h2>
          <div className="flex items-center justify-between relative">
            {/* Progress bar */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${currentStepIndex >= 0 ? (currentStepIndex / (statusSteps.length - 1)) * 100 : 0}%`,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-green-500 rounded"
              />
            </div>
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step.key} className="relative flex flex-col items-center z-10">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                      isActive
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <p
                    className={cn(
                      'text-xs mt-2 font-medium text-center',
                      isCurrent ? 'text-green-600' : isActive ? 'text-gray-900' : 'text-gray-400'
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 font-medium">Este pedido foi cancelado.</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Itens do Pedido</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.imageUrl || '/images/placeholder-product.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-500">{item.quantity}x {formatCurrency(item.price)}</p>
                  </div>
                  <p className="font-medium text-sm">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          {order.address && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-green-600" />
                Endereço de Entrega
              </h2>
              <p className="text-sm text-gray-600">
                {order.address.street}, {order.address.number}
                {order.address.complement ? ` - ${order.address.complement}` : ''}
              </p>
              <p className="text-sm text-gray-600">
                {order.address.neighborhood} - {order.address.city}/{order.address.state}
              </p>
              <p className="text-sm text-gray-600">CEP: {order.address.zipCode}</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-3">
            <h2 className="font-semibold text-gray-900 mb-2">Resumo</h2>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Frete</span>
              <span>{order.deliveryFee > 0 ? formatCurrency(order.deliveryFee) : 'Grátis'}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-3 border-t">
              <span>Total</span>
              <span className="text-green-600">{formatCurrency(order.total)}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard size={18} className="text-green-600" />
              Pagamento
            </h2>
            <p className="text-sm text-gray-600">
              {paymentLabels[order.paymentMethod] || order.paymentMethod}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {order.deliveryType === 'delivery' ? 'Entrega' : 'Retirada na loja'}
            </p>
          </div>

          {order.notes && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-2">Observações</h2>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
