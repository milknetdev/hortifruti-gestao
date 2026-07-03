'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const statusColors: Record<string, string> = {
  'Pendente': 'bg-yellow-100 text-yellow-700',
  'Pago': 'bg-blue-100 text-blue-700',
  'Separando': 'bg-purple-100 text-purple-700',
  'Entregue': 'bg-green-100 text-green-700',
  'Cancelado': 'bg-red-100 text-red-700',
  'pending': 'bg-yellow-100 text-yellow-700',
  'paid': 'bg-blue-100 text-blue-700',
  'processing': 'bg-purple-100 text-purple-700',
  'delivered': 'bg-green-100 text-green-700',
  'cancelled': 'bg-red-100 text-red-700',
};

const statusTabs = [
  { value: 'todos', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'paid', label: 'Pagos' },
  { value: 'processing', label: 'Separando' },
  { value: 'delivered', label: 'Entregues' },
  { value: 'cancelled', label: 'Cancelados' },
];

export default function PedidosPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todos');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: result } = await api.get('/orders?limit=100');
      setOrders(Array.isArray(result.data) ? result.data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = activeTab === 'todos'
    ? orders
    : orders.filter((o) => (o.status || '').toLowerCase() === activeTab);

  const columns: Column<any>[] = [
    { key: 'id', label: '#', sortable: true, render: (v) => `#${v}` },
    {
      key: 'customerName',
      label: 'Cliente',
      sortable: true,
      render: (v, row) => v || row.customer?.name || '-',
    },
    {
      key: 'itemsCount',
      label: 'Itens',
      sortable: true,
      render: (v, row) => v ?? row.items?.length ?? '-',
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (v) => `R$ ${Number(v || 0).toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge className={cn('border-0', statusColors[value] || 'bg-gray-100 text-gray-700')}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Data',
      sortable: true,
      render: (v) => v ? new Date(v).toLocaleString('pt-BR') : '-',
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/pedidos/${row.id}`);
          }}
        >
          <Eye className="w-4 h-4 mr-1" />
          Ver
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-500">Gerencie todos os pedidos da loja</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              {statusTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <DataTable
              columns={columns}
              data={filteredOrders}
              searchable
              searchPlaceholder="Pesquisar por #, cliente..."
              page={page}
              totalPages={Math.ceil(filteredOrders.length / 15) || 1}
              totalItems={filteredOrders.length}
              onPageChange={setPage}
              onRowClick={(row) => router.push(`/admin/pedidos/${row.id}`)}
            />
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
