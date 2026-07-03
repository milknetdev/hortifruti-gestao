'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  ShoppingBag,
  DollarSign,
  Package,
  Users,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const iconMap: Record<string, any> = {
  order: ShoppingBag,
  payment: DollarSign,
  stock: AlertTriangle,
  package: Package,
  user: Users,
  check: CheckCircle,
  cancel: AlertTriangle,
  commission: DollarSign,
};

const iconBgMap: Record<string, string> = {
  order: 'bg-blue-100',
  payment: 'bg-green-100',
  stock: 'bg-orange-100',
  package: 'bg-purple-100',
  user: 'bg-cyan-100',
  check: 'bg-green-100',
  cancel: 'bg-red-100',
  commission: 'bg-green-100',
};

const iconColorMap: Record<string, string> = {
  order: 'text-blue-600',
  payment: 'text-green-600',
  stock: 'text-orange-600',
  package: 'text-purple-600',
  user: 'text-cyan-600',
  check: 'text-green-600',
  cancel: 'text-red-600',
  commission: 'text-green-600',
};

export default function NotificacoesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: result } = await api.get('/notifications?limit=50');
      const data = result?.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = items.filter((n) => !n.read && !n.lida).length;

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      // ignore
    }
    setItems(items.map((n) => n.id === id ? { ...n, read: true, lida: true } : n));
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      toast.success('Todas marcadas como lidas');
    } catch {
      // ignore
    }
    setItems(items.map((n) => ({ ...n, read: true, lida: true })));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

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

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhuma notificação</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {items.map((notification) => {
                const notifType = notification.type || 'order';
                const Icon = iconMap[notifType] || Bell;
                const iconBg = iconBgMap[notifType] || 'bg-gray-100';
                const iconColor = iconColorMap[notifType] || 'text-gray-600';
                const isRead = notification.read ?? notification.lida ?? false;

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer',
                      !isRead && 'bg-blue-50/50'
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className={cn('p-2 rounded-full', iconBg)}>
                      <Icon className={cn('w-5 h-5', iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn('text-sm', isRead ? 'font-medium text-gray-700' : 'font-semibold text-gray-900')}>
                          {notification.title || notification.titulo}
                        </p>
                        {!isRead && (
                          <span className="w-2 h-2 bg-[#16a34a] rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{notification.message || notification.mensagem}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.createdAt
                          ? new Date(notification.createdAt).toLocaleString('pt-BR')
                          : notification.tempo || ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
