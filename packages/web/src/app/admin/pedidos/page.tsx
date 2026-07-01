'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const orders = [
  { id: '#1234', cliente: 'Maria Silva', itens: 5, total: 'R$ 127,50', status: 'Pendente', data: '28/06/2026 14:30' },
  { id: '#1233', cliente: 'João Santos', itens: 3, total: 'R$ 89,90', status: 'Pago', data: '28/06/2026 13:15' },
  { id: '#1232', cliente: 'Ana Oliveira', itens: 7, total: 'R$ 234,00', status: 'Separando', data: '27/06/2026 18:45' },
  { id: '#1231', cliente: 'Pedro Costa', itens: 2, total: 'R$ 45,80', status: 'Entregue', data: '27/06/2026 10:20' },
  { id: '#1230', cliente: 'Carla Mendes', itens: 4, total: 'R$ 156,30', status: 'Cancelado', data: '26/06/2026 16:00' },
  { id: '#1229', cliente: 'Roberto Alves', itens: 6, total: 'R$ 198,70', status: 'Pago', data: '26/06/2026 11:30' },
  { id: '#1228', cliente: 'Fernanda Lima', itens: 3, total: 'R$ 67,40', status: 'Pendente', data: '26/06/2026 09:15' },
  { id: '#1227', cliente: 'Carlos Souza', itens: 8, total: 'R$ 312,00', status: 'Entregue', data: '25/06/2026 17:45' },
  { id: '#1226', cliente: 'Juliana Rocha', itens: 2, total: 'R$ 38,50', status: 'Separando', data: '25/06/2026 14:20' },
  { id: '#1225', cliente: 'Marcos Pereira', itens: 5, total: 'R$ 145,90', status: 'Entregue', data: '25/06/2026 08:30' },
];

const statusColors: Record<string, string> = {
  'Pendente': 'bg-yellow-100 text-yellow-700',
  'Pago': 'bg-blue-100 text-blue-700',
  'Separando': 'bg-purple-100 text-purple-700',
  'Entregue': 'bg-green-100 text-green-700',
  'Cancelado': 'bg-red-100 text-red-700',
};

const statusTabs = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'pago', label: 'Pagos' },
  { value: 'separando', label: 'Separando' },
  { value: 'entregue', label: 'Entregues' },
  { value: 'cancelado', label: 'Cancelados' },
];

export default function PedidosPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('todos');
  const [page, setPage] = useState(1);

  const filteredOrders = activeTab === 'todos'
    ? orders
    : orders.filter((o) => o.status.toLowerCase() === activeTab);

  const columns: Column<any>[] = [
    { key: 'id', label: '#', sortable: true },
    { key: 'cliente', label: 'Cliente', sortable: true },
    { key: 'itens', label: 'Itens', sortable: true },
    { key: 'total', label: 'Total', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge className={cn('border-0', statusColors[value] || 'bg-gray-100 text-gray-700')}>
          {value}
        </Badge>
      ),
    },
    { key: 'data', label: 'Data', sortable: true },
    {
      key: 'acoes',
      label: 'Ações',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/pedidos/${row.id.replace('#', '')}`);
          }}
        >
          <Eye className="w-4 h-4 mr-1" />
          Ver
        </Button>
      ),
    },
  ];

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
              totalPages={3}
              totalItems={filteredOrders.length * 3}
              onPageChange={setPage}
              onRowClick={(row) => router.push(`/pedidos/${row.id.replace('#', '')}`)}
            />
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}