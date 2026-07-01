'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Eye, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  total: number;
  items: { name: string; quantity: number }[];
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
  preparing: { label: 'Preparando', color: 'bg-indigo-100 text-indigo-700' },
  shipping: { label: 'A Caminho', color: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Entregue', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(Array.isArray(data) ? data : data?.items || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus Pedidos</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/conta" className="hover:text-green-600">Minha Conta</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">Pedidos</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={64} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h2>
          <p className="text-gray-500 mb-6">Você ainda não fez nenhum pedido.</p>
          <Link
            href="/produtos"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Começar a Comprar
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const status = statusMap[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' };
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-5 md:p-6 shadow-sm border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Pedido #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'inline-flex px-3 py-1 rounded-full text-xs font-semibold w-fit',
                      status.color
                    )}
                  >
                    {status.label}
                  </span>
                </div>

                {order.items && order.items.length > 0 && (
                  <p className="text-sm text-gray-600 mb-3">
                    {order.items.slice(0, 3).map((i) => i.name).join(', ')}
                    {order.items.length > 3 && ` e mais ${order.items.length - 3} item(ns)`}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(order.total)}
                  </p>
                  <Link
                    href={`/conta/pedidos/${order.id}`}
                    className="flex items-center gap-1 text-sm text-green-600 font-medium hover:text-green-700"
                  >
                    Ver detalhes
                    <Eye size={16} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
