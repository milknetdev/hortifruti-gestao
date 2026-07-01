'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  ShoppingBag,
  DollarSign,
  Package,
  Users,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const notifications = [
  {
    id: 1,
    icon: ShoppingBag,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    titulo: 'Novo Pedido #1234',
    mensagem: 'Maria Silva realizou um pedido no valor de R$ 127,50',
    tempo: '5 minutos atrás',
    lida: false,
  },
  {
    id: 2,
    icon: DollarSign,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    titulo: 'Pagamento Confirmado',
    mensagem: 'Pagamento do pedido #1233 foi confirmado via PIX',
    tempo: '15 minutos atrás',
    lida: false,
  },
  {
    id: 3,
    icon: AlertTriangle,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    titulo: 'Estoque Baixo',
    mensagem: 'Tomate Italiano está com estoque abaixo do mínimo (5 un)',
    tempo: '1 hora atrás',
    lida: false,
  },
  {
    id: 4,
    icon: Package,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    titulo: 'Pedido Separado',
    mensagem: 'Pedido #1232 foi separado e está pronto para entrega',
    tempo: '2 horas atrás',
    lida: true,
  },
  {
    id: 5,
    icon: Users,
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    titulo: 'Novo Cliente',
    mensagem: 'Roberto Alves se cadastrou na loja',
    tempo: '3 horas atrás',
    lida: true,
  },
  {
    id: 6,
    icon: CheckCircle,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    titulo: 'Pedido Entregue',
    mensagem: 'Pedido #1231 foi entregue com sucesso',
    tempo: '5 horas atrás',
    lida: true,
  },
  {
    id: 7,
    icon: AlertTriangle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    titulo: 'Pedido Cancelado',
    mensagem: 'Pedido #1230 foi cancelado pelo cliente',
    tempo: '6 horas atrás',
    lida: true,
  },
  {
    id: 8,
    icon: DollarSign,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    titulo: 'Comissão Paga',
    mensagem: 'Comissão de João Vendedor no valor de R$ 45,00 foi paga',
    tempo: '1 dia atrás',
    lida: true,
  },
];

export default function NotificacoesPage() {
  const [items, setItems] = useState(notifications);
  const unreadCount = items.filter((n) => !n.lida).length;

  const markAsRead = (id: number) => {
    setItems(items.map((n) => n.id === id ? { ...n, lida: true } : n));
  };

  const markAllAsRead = () => {
    setItems(items.map((n) => ({ ...n, lida: true })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-500">
            {unreadCount > 0 ? `${unreadCount} não lida(s)` : 'Todas as notificações foram lidas'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {items.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer',
                    !notification.lida && 'bg-blue-50/50'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={cn('p-2 rounded-full', notification.iconBg)}>
                    <Icon className={cn('w-5 h-5', notification.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('text-sm', notification.lida ? 'font-medium text-gray-700' : 'font-semibold text-gray-900')}>
                        {notification.titulo}
                      </p>
                      {!notification.lida && (
                        <span className="w-2 h-2 bg-[#16a34a] rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{notification.mensagem}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.tempo}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}