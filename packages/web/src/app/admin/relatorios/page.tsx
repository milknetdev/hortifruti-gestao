'use client';

import { useState } from 'react';
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
import { Download, FileText, Table } from 'lucide-react';

const reportTypes = [
  { value: 'vendas', label: 'Vendas' },
  { value: 'produtos', label: 'Produtos' },
  { value: 'clientes', label: 'Clientes' },
  { value: 'comissoes', label: 'Comissões' },
  { value: 'financeiro', label: 'Financeiro' },
];

// Mock data for charts
const vendasData = Array.from({ length: 12 }, (_, i) => ({
  mes: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
  vendas: Math.floor(Math.random() * 50000) + 20000,
  pedidos: Math.floor(Math.random() * 300) + 100,
}));

const produtosMaisVendidos = [
  { produto: 'Banana Prata', vendas: 234 },
  { produto: 'Tomate Italiano', vendas: 198 },
  { produto: 'Maçã Fuji', vendas: 167 },
  { produto: 'Cenoura', vendas: 145 },
  { produto: 'Alface', vendas: 123 },
];

const pedidosPorCategoria = [
  { categoria: 'Frutas', quantidade: 450 },
  { categoria: 'Hortaliças', quantidade: 320 },
  { categoria: 'Legumes', quantidade: 280 },
  { categoria: 'Orgânicos', quantidade: 150 },
  { categoria: 'Temperos', quantidade: 90 },
];

const reportData = [
  { periodo: '01/06/2026', vendas: 'R$ 1.250,00', pedidos: 15, ticket: 'R$ 83,33', cancelados: 1 },
  { periodo: '02/06/2026', vendas: 'R$ 980,00', pedidos: 12, ticket: 'R$ 81,67', cancelados: 0 },
  { periodo: '03/06/2026', vendas: 'R$ 1.450,00', pedidos: 18, ticket: 'R$ 80,56', cancelados: 2 },
  { periodo: '04/06/2026', vendas: 'R$ 1.100,00', pedidos: 14, ticket: 'R$ 78,57', cancelados: 0 },
  { periodo: '05/06/2026', vendas: 'R$ 1.670,00', pedidos: 20, ticket: 'R$ 83,50', cancelados: 1 },
];

export default function RelatoriosPage() {
  const [reportType, setReportType] = useState('vendas');
  const [dateFrom, setDateFrom] = useState('2026-06-01');
  const [dateTo, setDateTo] = useState('2026-06-28');
  const [page, setPage] = useState(1);

  const columns: Column<any>[] = [
    { key: 'periodo', label: 'Período', sortable: true },
    { key: 'vendas', label: 'Vendas', sortable: true },
    { key: 'pedidos', label: 'Pedidos', sortable: true },
    { key: 'ticket', label: 'Ticket Médio' },
    { key: 'cancelados', label: 'Cancelados' },
  ];

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
            <Button className="bg-[#16a34a] hover:bg-[#15803d]">Gerar Relatório</Button>
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
          data={vendasData}
          xKey="mes"
          lines={[
            { key: 'vendas', color: '#16a34a', label: 'Vendas (R$)' },
          ]}
          height={300}
        />
        <AdminBarChart
          title="Produtos Mais Vendidos"
          data={produtosMaisVendidos}
          xKey="produto"
          yKey="vendas"
          color="#f97316"
          height={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AdminPieChart
          title="Pedidos por Categoria"
          data={pedidosPorCategoria}
          nameKey="categoria"
          valueKey="quantidade"
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
                <p className="text-xl font-bold text-[#16a34a]">R$ 45.890</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Pedidos</p>
                <p className="text-xl font-bold text-gray-900">560</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Ticket Médio</p>
                <p className="text-xl font-bold text-gray-900">R$ 81,95</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Cancelados</p>
                <p className="text-xl font-bold text-red-600">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
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
            totalPages={5}
            totalItems={reportData.length * 5}
            onPageChange={setPage}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
}