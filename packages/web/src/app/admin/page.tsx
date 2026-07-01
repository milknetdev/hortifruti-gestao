'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/admin/stat-card';
import { DataTable, Column } from '@/components/admin/data-table';
import { AdminLineChart, AdminPieChart } from '@/components/admin/charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data
const vendasUltimos30Dias = Array.from({ length: 30 }, (_, i) => ({
  dia: `${i + 1}`,
  vendas: Math.floor(Math.random() * 5000) + 1000,
  pedidos: Math.floor(Math.random() * 30) + 5,
}));

const pedidosPorStatus = [
  { status: 'Pendentes', quantidade: 12 },
  { status: 'Pagos', quantidade: 28 },
  { status: 'Separando', quantidade: 8 },
  { status: 'Entregues', quantidade: 156 },
  { status: 'Cancelados', quantidade: 5 },
];

const recentOrders = [
  { id: '#1234', cliente: 'Maria Silva', itens: 5, total: 'R$ 127,50', status: 'Pendente', data: '28/06/2026' },
  { id: '#1233', cliente: 'João Santos', itens: 3, total: 'R$ 89,90', status: 'Pago', data: '28/06/2026' },
  { id: '#1232', cliente: 'Ana Oliveira', itens: 7, total: 'R$ 234,00', status: 'Separando', data: '27/06/2026' },
  { id: '#1231', cliente: 'Pedro Costa', itens: 2, total: 'R$ 45,80', status: 'Entregue', data: '27/06/2026' },
  { id: '#1230', cliente: 'Carla Mendes', itens: 4, total: 'R$ 156,30', status: 'Cancelado', data: '26/06/2026' },
];

const lowStockAlerts = [
  { produto: 'Tomate Italiano', estoque: 3, minimo: 10 },
  { produto: 'Banana Prata', estoque: 5, minimo: 15 },
  { produto: 'Maçã Fuji', estoque: 2, minimo: 8 },
  { produto: 'Alface Americana', estoque: 4, minimo: 12 },
];

const statusColors: Record<string, string> = {
  'Pendente': 'bg-yellow-100 text-yellow-700',
  'Pago': 'bg-blue-100 text-blue-700',
  'Separando': 'bg-purple-100 text-purple-700',
  'Entregue': 'bg-green-100 text-green-700',
  'Cancelado': 'bg-red-100 text-red-700',
};

const orderColumns: Column<any>[] = [
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
    render: () => (
      <Button variant="ghost" size="sm">
        <Eye className="w-4 h-4" />
      </Button>
    ),
  },
];

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral do seu negócio</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pedidos Hoje"
          value="24"
          icon={ShoppingBag}
          trend={{ value: 12, isPositive: true }}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Pendentes"
          value="8"
          icon={Clock}
          trend={{ value: 5, isPositive: false }}
          iconBgColor="bg-yellow-50"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Faturamento Mês"
          value="R$ 45.890"
          icon={DollarSign}
          trend={{ value: 18, isPositive: true }}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Lucro Mês"
          value="R$ 12.340"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AdminLineChart
          title="Vendas - Últimos 30 Dias"
          data={vendasUltimos30Dias}
          xKey="dia"
          lines={[{ key: 'vendas', color: '#16a34a', label: 'Vendas (R$)' }]}
          className="lg:col-span-2"
          height={320}
        />
        <AdminPieChart
          title="Pedidos por Status"
          data={pedidosPorStatus}
          nameKey="status"
          valueKey="quantidade"
          height={320}
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={orderColumns}
              data={recentOrders}
              searchable={false}
              page={1}
              totalPages={1}
            />
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <CardTitle className="text-base">Estoque Baixo</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockAlerts.map((item) => (
                <div
                  key={item.produto}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900">{item.produto}</p>
                    <p className="text-xs text-gray-500">Mínimo: {item.minimo} un</p>
                  </div>
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                    {item.estoque} un
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}