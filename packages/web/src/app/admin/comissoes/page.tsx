'use client';

import { useState } from 'react';
import { StatCard } from '@/components/admin/stat-card';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Users, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const commissions = [
  { id: 1, usuario: 'João Vendedor', produto: 'Tomate Italiano', tipo: 'Venda', valor: 'R$ 4,45', pago: true, periodo: 'Jun/2026' },
  { id: 2, usuario: 'Maria Vendedora', produto: 'Banana Prata', tipo: 'Venda', valor: 'R$ 3,25', pago: true, periodo: 'Jun/2026' },
  { id: 3, usuario: 'João Vendedor', produto: 'Maçã Fuji', tipo: 'Venda', valor: 'R$ 6,45', pago: false, periodo: 'Jun/2026' },
  { id: 4, usuario: 'Pedro Vendedor', produto: 'Alface Americana', tipo: 'Venda', valor: 'R$ 2,25', pago: false, periodo: 'Jun/2026' },
  { id: 5, usuario: 'Maria Vendedora', produto: 'Cenoura', tipo: 'Venda', valor: 'R$ 2,95', pago: true, periodo: 'Jun/2026' },
  { id: 6, usuario: 'João Vendedor', produto: 'Pepino', tipo: 'Venda', valor: 'R$ 3,45', pago: false, periodo: 'Jun/2026' },
  { id: 7, usuario: 'Pedro Vendedor', produto: 'Pimentão Vermelho', tipo: 'Venda', valor: 'R$ 7,45', pago: true, periodo: 'Jun/2026' },
  { id: 8, usuario: 'Maria Vendedora', produto: 'Tomate Italiano', tipo: 'Venda', valor: 'R$ 4,45', pago: false, periodo: 'Jun/2026' },
];

export default function ComissoesPage() {
  const [page, setPage] = useState(1);
  const [periodFilter, setPeriodFilter] = useState('jun-2026');

  const columns: Column<any>[] = [
    { key: 'usuario', label: 'Usuário', sortable: true },
    { key: 'produto', label: 'Produto' },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (value) => (
        <Badge className="bg-blue-100 text-blue-700 border-0">{value}</Badge>
      ),
    },
    { key: 'valor', label: 'Valor', sortable: true },
    {
      key: 'pago',
      label: 'Status',
      render: (value) => (
        <Badge
          className={cn(
            'border-0',
            value ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          )}
        >
          {value ? 'Pago' : 'Pendente'}
        </Badge>
      ),
    },
    { key: 'periodo', label: 'Período' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comissões</h1>
          <p className="text-gray-500">Controle de comissões de vendedores</p>
        </div>
        <Button className="bg-[#16a34a] hover:bg-[#15803d]">
          <DollarSign className="w-4 h-4 mr-2" />
          Pagar Comissões Pendentes
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Comissões"
          value="R$ 3.450"
          icon={DollarSign}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Pagas"
          value="R$ 2.100"
          icon={CheckCircle}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Pendentes"
          value="R$ 1.350"
          icon={Clock}
          iconBgColor="bg-yellow-50"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Vendedores"
          value="3"
          icon={Users}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Comissões</CardTitle>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jun-2026">Junho 2026</SelectItem>
                <SelectItem value="mai-2026">Maio 2026</SelectItem>
                <SelectItem value="abr-2026">Abril 2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={commissions}
            searchable
            searchPlaceholder="Pesquisar por usuário ou produto..."
            page={page}
            totalPages={2}
            totalItems={commissions.length * 2}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}