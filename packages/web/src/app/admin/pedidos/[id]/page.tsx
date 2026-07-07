'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  Loader2,
  Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
const statusOptions = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'PAID', label: 'Pago' },
  { value: 'PROCESSING', label: 'Separando' },
  { value: 'OUT_FOR_DELIVERY', label: 'Saiu para Entrega' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'PICKUP_AVAILABLE', label: 'Pronto para Retirada' },
  { value: 'PICKED_UP', label: 'Retirado' },
];

const statusColors: Record<string, string> = {
  'PENDING': 'bg-yellow-100 text-yellow-700',
  'PAID': 'bg-blue-100 text-blue-700',
  'PROCESSING': 'bg-purple-100 text-purple-700',
  'OUT_FOR_DELIVERY': 'bg-orange-100 text-orange-700',
  'DELIVERED': 'bg-green-100 text-green-700',
  'CANCELLED': 'bg-red-100 text-red-700',
  'PICKUP_AVAILABLE': 'bg-cyan-100 text-cyan-700',
  'PICKED_UP': 'bg-green-100 text-green-700',
};

const timelineIcons = [Package, CreditCard, Clock, Truck, CheckCircle2];

export default function PedidoDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const { data: result } = await api.get(`/orders/${params.id}`);
      const orderData = result?.data || result;
      setOrder(orderData);
      setCurrentStatus(orderData.status || '');
    } catch {
      toast.error('Erro ao carregar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!currentStatus) return;
    setSaving(true);
    try {
      await api.patch(`/orders/${params.id}/status`, { status: currentStatus });
      toast.success('Status atualizado!');
      fetchOrder();
    } catch {
      toast.error('Erro ao atualizar status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pedido não encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Voltar</Button>
      </div>
    );
  }

  const items = order.items || order.orderItems || [];
  const customer = order.customer || order.customerInfo || {};
  const address = order.address || order.shippingAddress || {};
  const payment = order.payment || order.paymentInfo || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedido #{order.id}</h1>
          <p className="text-gray-500">
            {order.createdAt ? new Date(order.createdAt).toLocaleString('pt-BR') : '-'}
          </p>
        </div>
        <Badge className={cn('ml-auto border-0 text-sm', statusColors[currentStatus] || 'bg-gray-100 text-gray-700')}>
          {statusOptions.find(s => s.value === currentStatus)?.label || currentStatus}
        </Badge>
      </div>

      {/* Status Update */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Atualizar Status:</span>
            <select
              className="w-[200px] border rounded-md px-3 py-2 text-sm"
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value)}
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handleUpdateStatus} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Itens do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Produto</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">Qtd</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Preço</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, i: number) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 text-sm text-gray-900">{item.productName || item.name || item.product?.name}</td>
                    <td className="py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">R$ {Number(item.price || item.unitPrice || 0).toFixed(2)}</td>
                    <td className="py-3 text-sm font-medium text-gray-900 text-right">
                      R$ {Number(item.subtotal || item.total || (item.quantity * (item.price || item.unitPrice || 0))).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Separator className="my-4" />

            <div className="space-y-2 text-right">
              <div className="flex justify-end gap-8">
                <span className="text-sm text-gray-500">Subtotal:</span>
                <span className="text-sm font-medium">R$ {Number(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-end gap-8">
                <span className="text-sm text-gray-500">Frete:</span>
                <span className="text-sm font-medium">R$ {Number(order.deliveryFee || order.shipping || order.freight || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-end gap-8">
                <span className="text-sm text-gray-500">Desconto:</span>
                <span className="text-sm font-medium text-green-600">R$ {Number(order.discount || 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-end gap-8">
                <span className="text-base font-bold text-gray-900">Total:</span>
                <span className="text-base font-bold text-[#16a34a]">R$ {Number(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium text-gray-900">{customer.name || order.customerName || '-'}</p>
              <p className="text-sm text-gray-500">{customer.email || '-'}</p>
              <p className="text-sm text-gray-500">{customer.phone || '-'}</p>
              {customer.cpf && <p className="text-sm text-gray-500">CPF: {customer.cpf}</p>}
            </CardContent>
          </Card>

          {/* Address */}
          {order.deliveryType === 'pickup' ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-500" />
                  <CardTitle className="text-base">Ponto de Retirada</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  {order.pickupPoint?.name || 'Retirada na loja'}
                </p>
                {order.pickupPoint?.address && (
                  <p className="text-sm text-gray-500">{order.pickupPoint.address}</p>
                )}
                {order.pickupPoint?.neighborhood && (
                  <p className="text-sm text-gray-500">
                    {order.pickupPoint.neighborhood} - {order.pickupPoint.city}/{order.pickupPoint.state}
                  </p>
                )}
                {order.pickupPoint?.zipCode && (
                  <p className="text-sm text-gray-500">CEP: {order.pickupPoint.zipCode}</p>
                )}
                {order.pickupPoint?.startTime && (
                  <p className="text-xs text-gray-400 mt-2">
                    Horário: {order.pickupPoint.startTime} - {order.pickupPoint.endTime}
                  </p>
                )}
              </CardContent>
            </Card>
          ) : address && (address.street || address.rua) ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <CardTitle className="text-base">Endereço de Entrega</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{address.street || address.rua} {address.number || ''}</p>
                {address.complement && <p className="text-sm text-gray-500">{address.complement}</p>}
                <p className="text-sm text-gray-500">{address.neighborhood || address.bairro} - {address.city || address.cidade}</p>
                <p className="text-sm text-gray-500">CEP: {address.zipCode || address.cep}</p>
              </CardContent>
            </Card>
          ) : order.deliveryType === 'delivery' ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-500" />
                  <CardTitle className="text-base">Tipo de Entrega</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">Entrega em domicílio</p>
                <p className="text-xs text-gray-400">Endereço não informado</p>
              </CardContent>
            </Card>
          ) : null}

          {/* Payment */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <CardTitle className="text-base">Pagamento</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm text-gray-700">{payment.method || payment.paymentMethod || order.paymentMethod || '-'}</p>
              {payment.brand && <p className="text-sm text-gray-500">{payment.brand} •••• {payment.lastDigits}</p>}
              {payment.installments && <p className="text-sm text-gray-500">{payment.installments}x sem juros</p>}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Adicione observações sobre este pedido..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
              <Button variant="outline" size="sm" className="mt-2">
                Salvar Observação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
