'use client';

import { useState } from 'react';
import { StatCard } from '@/components/admin/stat-card';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, Percent, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const entries = [
  { id: 1, data: '28/06/2026', tipo: 'Receita', categoria: 'Vendas', descricao: 'Venda de produtos - Pedido #1234', valor: 'R$ 127,50', pago: true },
  { id: 2, data: '28/06/2026', tipo: 'Despesa', categoria: 'Fornecedores', descricao: 'Compra de frutas - Fazenda São João', valor: 'R$ 450,00', pago: true },
  { id: 3, data: '27/06/2026', tipo: 'Receita', categoria: 'Vendas', descricao: 'Venda de produtos - Pedido #1233', valor: 'R$ 89,90', pago: true },
  { id: 4, data: '27/06/2026', tipo: 'Despesa', categoria: 'Operacional', descricao: 'Conta de energia elétrica', valor: 'R$ 320,00', pago: false },
  { id: 5, data: '26/06/2026', tipo: 'Receita', categoria: 'Vendas', descricao: 'Venda de produtos - Pedido #1232', valor: 'R$ 234,00', pago: true },
  { id: 6, data: '26/06/2026', tipo: 'Despesa', categoria: 'Pessoal', descricao: 'Salário - Funcionário João', valor: 'R$ 2.500,00', pago: true },
  { id: 7, data: '25/06/2026', tipo: 'Receita', categoria: 'Vendas', descricao: 'Venda de produtos - Pedido #1231', valor: 'R$ 45,80', pago: true },
  { id: 8, data: '25/06/2026', tipo: 'Despesa', categoria: 'Marketing', descricao: 'Impressão de flyers', valor: 'R$ 150,00', pago: true },
];

const typeColors: Record<string, string> = {
  'Receita': 'bg-green-100 text-green-700',
  'Despesa': 'bg-red-100 text-red-700',
};

export default function FinanceiroPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState('todos');
  const [formData, setFormData] = useState({
    tipo: 'receita',
    categoria: '',
    descricao: '',
    valor: '',
    data: '',
    pago: false,
  });

  const filteredEntries = filterType === 'todos'
    ? entries
    : entries.filter((e) => e.tipo.toLowerCase() === filterType);

  const columns: Column<any>[] = [
    { key: 'data', label: 'Data', sortable: true },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (value) => (
        <Badge className={cn('border-0', typeColors[value])}>{value}</Badge>
      ),
    },
    { key: 'categoria', label: 'Categoria' },
    { key: 'descricao', label: 'Descrição' },
    {
      key: 'valor',
      label: 'Valor',
      sortable: true,
      render: (value, row) => (
        <span className={cn('font-medium', row.tipo === 'Receita' ? 'text-green-600' : 'text-red-600')}>
          {row.tipo === 'Receita' ? '+' : '-'}{value}
        </span>
      ),
    },
    {
      key: 'pago',
      label: 'Status',
      render: (value) => (
        <Badge className={cn('border-0', value ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
          {value ? 'Pago' : 'Pendente'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-500">Controle financeiro do negócio</p>
        </div>
        <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receitas"
          value="R$ 12.450"
          icon={TrendingUp}
          trend={{ value: 15, isPositive: true }}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Despesas"
          value="R$ 8.230"
          icon={TrendingDown}
          trend={{ value: 5, isPositive: false }}
          iconBgColor="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          title="Lucro"
          value="R$ 4.220"
          icon={DollarSign}
          trend={{ value: 22, isPositive: true }}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Margem"
          value="33.9%"
          icon={Percent}
          trend={{ value: 3, isPositive: true }}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Lançamentos</CardTitle>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredEntries}
            searchable
            searchPlaceholder="Pesquisar lançamentos..."
            page={page}
            totalPages={3}
            totalItems={filteredEntries.length * 3}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      {/* Add Entry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lançamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {['Vendas', 'Fornecedores', 'Operacional', 'Pessoal', 'Marketing', 'Outros'].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o lançamento"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-[#16a34a] hover:bg-[#15803d]">Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}