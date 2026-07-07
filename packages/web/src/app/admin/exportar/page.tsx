'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, FileSpreadsheet, Users, Leaf, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ExportarPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const translatePayment = (method: string) => {
    const map: Record<string, string> = {
      'pix': 'PIX',
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito',
      'cash': 'Dinheiro',
      'pay_on_delivery': 'Pagar na Entrega',
      'pay_on_pickup': 'Pagar na Retirada',
    };
    return map[method] || method;
  };

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      'PENDING': 'Pendente',
      'AWAITING_PAYMENT': 'Aguardando Pagamento',
      'PAID': 'Pago',
      'PROCESSING': 'Preparando',
      'READY': 'Pronto',
      'OUT_FOR_DELIVERY': 'Saiu para Entrega',
      'DELIVERED': 'Entregue',
      'CANCELLED': 'Cancelado',
      'PICKUP_AVAILABLE': 'Pronto para Retirada',
      'PICKED_UP': 'Retirado',
    };
    return map[status] || status;
  };

  const downloadCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(';'),
      ...data.map(row => headers.map(h => {
        const val = row[h] ?? '';
        const str = String(val).replace(/"/g, '""');
        return str.includes(';') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
      }).join(';'))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportOrders = async () => {
    setLoading('orders');
    try {
      const { data: result } = await api.get(`/export/orders?startDate=${startDate}&endDate=${endDate}`);
      const orders = result?.data || result || [];

      if (!Array.isArray(orders) || orders.length === 0) {
        toast.error('Nenhum pedido encontrado no período');
        return;
      }

      const rows = orders.map((o: any) => ({
        'Pedido': '#' + o.orderNumber,
        'Data': new Date(o.createdAt).toLocaleDateString('pt-BR'),
        'Cliente': o.customer?.name || o.customerName || '-',
        'Email': o.customer?.email || '-',
        'Telefone': o.customer?.phone || '-',
        'Tipo': o.deliveryType === 'pickup' ? 'Retirada' : 'Entrega',
        'Endereço': o.address ? `${o.address.street}, ${o.address.number} - ${o.address.neighborhood}, ${o.address.city}/${o.address.state} - CEP: ${o.address.zipCode}` : (o.pickupPoint ? `Retirada: ${o.pickupPoint.name} - ${o.pickupPoint.address}, ${o.pickupPoint.city}/${o.pickupPoint.state}` : '-'),
        'Pagamento': translatePayment(o.paymentMethod || '-'),
        'Status': translateStatus(o.status),
        'Subtotal': Number(o.subtotal).toFixed(2),
        'Frete': Number(o.deliveryFee).toFixed(2),
        'Desconto': Number(o.discount).toFixed(2),
        'Total': Number(o.total).toFixed(2),
        'Itens': o.items?.map((i: any) => `${i.product?.name} (${i.quantity})`).join(', ') || '-',
      }));

      downloadCSV(rows, `pedidos_${startDate}_${endDate}.csv`, Object.keys(rows[0]));
      toast.success(`${orders.length} pedidos exportados!`);
    } catch {
      toast.error('Erro ao exportar pedidos');
    } finally {
      setLoading(null);
    }
  };

  const exportCustomers = async () => {
    setLoading('customers');
    try {
      const { data: result } = await api.get(`/export/orders?startDate=${startDate}&endDate=${endDate}`);
      const orders = result?.data || result || [];

      if (!Array.isArray(orders) || orders.length === 0) {
        toast.error('Nenhum pedido encontrado no período');
        return;
      }

      const rows: any[] = [];
      for (const order of orders) {
        for (const item of order.items || []) {
          rows.push({
            'Cliente': order.customer?.name || order.customerName || '-',
            'Email': order.customer?.email || '-',
            'Telefone': order.customer?.phone || '-',
            'Produto': item.product?.name || '-',
            'Quantidade': Number(item.quantity),
            'Unidade': item.product?.unit || 'un',
            'Preço Unitário': Number(item.price).toFixed(2),
            'Total': (Number(item.price) * Number(item.quantity)).toFixed(2),
            'Data Pedido': new Date(order.createdAt).toLocaleDateString('pt-BR'),
          });
        }
      }

      downloadCSV(rows, `compras_clientes_${startDate}_${endDate}.csv`, Object.keys(rows[0]));
      toast.success(`${rows.length} itens exportados!`);
    } catch {
      toast.error('Erro ao exportar compras');
    } finally {
      setLoading(null);
    }
  };

  const exportHarvest = async () => {
    setLoading('harvest');
    try {
      const { data: result } = await api.get(`/export/harvest?startDate=${startDate}&endDate=${endDate}`);
      const items = result?.data || result || [];

      if (!Array.isArray(items) || items.length === 0) {
        toast.error('Nenhum item encontrado no período');
        return;
      }

      const rows = items.map((item: any) => ({
        'Produto': item.name,
        'Quantidade Total': item.quantity,
        'Unidade': item.unit || 'un',
      }));

      downloadCSV(rows, `colheita_${startDate}_${endDate}.csv`, Object.keys(rows[0]));
      toast.success(`${items.length} produtos para colheita!`);
    } catch {
      toast.error('Erro ao exportar colheita');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exportar Dados</h1>
        <p className="text-gray-500">Exporte planilhas dos pedidos por período</p>
      </div>

      {/* Date Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selecionar Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="text-sm text-gray-500 pb-2">
              Período: {formatDate(startDate)} até {formatDate(endDate)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Orders */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Pedidos</CardTitle>
                <p className="text-xs text-gray-500">Dados completos dos pedidos</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Inclui: número do pedido, data, cliente, tipo de entrega, pagamento, status, total e itens.
            </p>
            <Button
              onClick={exportOrders}
              disabled={loading !== null}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading === 'orders' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Exportando...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" />Exportar Pedidos</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Customer Purchases */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base">Compras por Cliente</CardTitle>
                <p className="text-xs text-gray-500">O que cada cliente comprou</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Inclui: nome do cliente, email, telefone, produto comprado, quantidade, preço e total.
            </p>
            <Button
              onClick={exportCustomers}
              disabled={loading !== null}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading === 'customers' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Exportando...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" />Exportar Clientes</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Harvest */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base">Colheita</CardTitle>
                <p className="text-xs text-gray-500">Itens para colher</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Inclui: nome do produto, quantidade total somada de todos os pedidos e unidade de medida.
            </p>
            <Button
              onClick={exportHarvest}
              disabled={loading !== null}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading === 'harvest' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Exportando...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" />Exportar Colheita</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
