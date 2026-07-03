'use client';

import { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/admin/data-table';
import { AdminLineChart, AdminBarChart, AdminPieChart } from '@/components/admin/charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileText, Table, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const reportTypes = [
  { value: 'vendas', label: 'Vendas' },
  { value: 'produtos', label: 'Produtos' },
  { value: 'clientes', label: 'Clientes' },
  { value: 'comissoes', label: 'Comissões' },
  { value: 'financeiro', label: 'Financeiro' },
];

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('vendas');
  const [dateFrom, setDateFrom] = useState('2026-06-01');
  const [dateTo, setDateTo] = useState('2026-06-28');
  const [page, setPage] = useState(1);
  const [reportData, setReportData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>({});
  const [summary, setSummary] = useState({ totalSales: 0, totalOrders: 0, avgTicket: 0, cancelled: 0 });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const { data: result } = await api.get('/dashboard');
      const data = result?.data || result || {};

      setChartData({
        salesChart: Array.isArray(data.salesChart) ? data.salesChart : [],
        topProducts: Array.isArray(data.topProducts) ? data.topProducts : [],
        ordersByCategory: Array.isArray(data.ordersByCategory) ? data.ordersByCategory : [],
      });

      setSummary({
        totalSales: data.monthlyRevenue || 0,
        totalOrders: data.totalOrders || 0,
        avgTicket: data.avgTicket || 0,
        cancelled: data.cancelledOrders || 0,
      });

      // Use recent orders as report data if available
      const dailyReport = Array.isArray(data.dailyReport) ? data.dailyReport : [];
      setReportData(dailyReport);
    } catch {
      setChartData({});
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'period',
      label: 'Período',
      sortable: true,
      render: (v, row) => v || row.periodo || '-',
    },
    {
      key: 'sales',
      label: 'Vendas',
      sortable: true,
      render: (v, row) => `R$ ${Number(v || row.vendas || 0).toFixed(2)}`,
    },
    {
      key: 'orders',
      label: 'Pedidos',
      sortable: true,
      render: (v, row) => v ?? row.pedidos ?? '-',
    },
    {
      key: 'avgTicket',
      label: 'Ticket Médio',
      render: (v, row) => `R$ ${Number(v || row.ticket || 0).toFixed(2)}`,
    },
    {
      key: 'cancelled',
      label: 'Cancelados',
      render: (v, row) => v ?? row.cancelados ?? 0,
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
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500">Análises e relatórios do negócio</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={fetchReportData}>Gerar Relatório</Button>
            <div className="ml-auto flex gap-2">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline">
                <Table className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminLineChart
          title="Vendas Mensais"
          data={chartData.salesChart || []}
          xKey="month"
          lines={[
            { key: 'sales', color: '#16a34a', label: 'Vendas (R$)' },
          ]}
          height={300}
        />
        <AdminBarChart
          title="Produtos Mais Vendidos"
          data={chartData.topProducts || []}
          xKey="name"
          yKey="sales"
          color="#f97316"
          height={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AdminPieChart
          title="Pedidos por Categoria"
          data={chartData.ordersByCategory || []}
          nameKey="category"
          valueKey="count"
          height={280}
        />
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Resumo do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Vendas</p>
                <p className="text-xl font-bold text-[#16a34a]">R$ {Number(summary.totalSales).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Pedidos</p>
                <p className="text-xl font-bold text-gray-900">{summary.totalOrders}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Ticket Médio</p>
                <p className="text-xl font-bold text-gray-900">R$ {Number(summary.avgTicket).toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Cancelados</p>
                <p className="text-xl font-bold text-red-600">{summary.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      {reportData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados Detalhados</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={reportData}
              searchable={false}
              page={page}
              totalPages={Math.ceil(reportData.length / 10) || 1}
              totalItems={reportData.length}
              onPageChange={setPage}
              pageSize={10}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
