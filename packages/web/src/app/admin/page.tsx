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
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

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

const statusLabels: Record<string, string> = {
  'PENDING': 'Pendente',
  'PAID': 'Pago',
  'PROCESSING': 'Separando',
  'OUT_FOR_DELIVERY': 'A Caminho',
  'DELIVERED': 'Entregue',
  'CANCELLED': 'Cancelado',
  'PICKUP_AVAILABLE': 'Pronto para Retirada',
  'PICKED_UP': 'Retirado',
};

interface DashboardData {
  todayOrders?: number;
  pendingOrders?: number;
  deliveredOrders?: number;
  outOfStock?: number;
  lowStock?: number;
  monthRevenue?: number;
  monthProfit?: number;
  totalCustomers?: number;
  totalEmployees?: number;
  salesChart?: Array<{ day: string; sales: number; orders: number }>;
  ordersByStatus?: Array<{ status: string; count: number }>;
  recentOrders?: Array<any>;
  lowStockAlerts?: Array<any>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData>({});
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data: result } = await api.get('/dashboard');
      const data = result?.data || result || {};
      setDashboard(data);
      setRecentOrders(Array.isArray(data.recentOrders) ? data.recentOrders : []);
      setLowStockAlerts(Array.isArray(data.lowStockAlerts) ? data.lowStockAlerts : []);
    } catch {
      setDashboard({});
      setRecentOrders([]);
      setLowStockAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const salesChart = dashboard.salesChart || [];
  const ordersByStatus = (dashboard.ordersByStatus || []).map(item => ({
    ...item,
    status: statusLabels[item.status] || item.status,
  }));

  const orderColumns: Column<any>[] = [
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
          {statusLabels[value] || value}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Data',
      sortable: true,
      render: (v) => v ? new Date(v).toLocaleDateString('pt-BR') : '-',
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (_, row) => (
        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/pedidos/${row.id}`)}>
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

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
          value={String(dashboard.todayOrders ?? 0)}
          icon={ShoppingBag}
          trend={{ value: 12, isPositive: true }}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Pendentes"
          value={String(dashboard.pendingOrders ?? 0)}
          icon={Clock}
          trend={{ value: 5, isPositive: false }}
          iconBgColor="bg-yellow-50"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Faturamento Mês"
          value={`R$ ${Number(dashboard.monthRevenue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend={{ value: 18, isPositive: true }}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Lucro Mês"
          value={`R$ ${Number(dashboard.monthProfit ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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
          data={salesChart}
          xKey="day"
          lines={[{ key: 'sales', color: '#16a34a', label: 'Vendas (R$)' }]}
          className="lg:col-span-2"
          height={320}
        />
        <AdminPieChart
          title="Pedidos por Status"
          data={ordersByStatus}
          nameKey="status"
          valueKey="count"
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
              {lowStockAlerts.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum alerta de estoque baixo</p>
              )}
              {lowStockAlerts.map((item: any) => (
                <div
                  key={item.id || item.productName}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900">{item.productName || item.name}</p>
                    <p className="text-xs text-gray-500">Mínimo: {item.minStock ?? item.minimum ?? 0} un</p>
                  </div>
                  <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                    {item.stock ?? item.current ?? 0} un
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
