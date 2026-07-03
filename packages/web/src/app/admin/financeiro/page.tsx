'use client';

import { useState, useEffect } from 'react';
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
import { TrendingUp, TrendingDown, DollarSign, Percent, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const typeColors: Record<string, string> = {
  'Receita': 'bg-green-100 text-green-700',
  'Despesa': 'bg-red-100 text-red-700',
  'income': 'bg-green-100 text-green-700',
  'expense': 'bg-red-100 text-red-700',
};

export default function FinanceiroPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState('todos');
  const [summary, setSummary] = useState({ revenue: 0, expenses: 0, profit: 0, margin: 0 });
  const [formData, setFormData] = useState({
    tipo: 'income',
    categoria: '',
    descricao: '',
    valor: '',
    data: '',
  });

  useEffect(() => {
    fetchFinance();
  }, []);

  const fetchFinance = async () => {
    try {
      const { data: result } = await api.get('/finance?limit=100');
      const data = result?.data || [];
      const list = Array.isArray(data) ? data : (data.entries || data.items || []);
      setEntries(list);

      // Calculate summary from entries
      const revenue = list.filter((e: any) => (e.type || e.tipo) === 'income' || (e.type || e.tipo) === 'Receita')
        .reduce((sum: number, e: any) => sum + Number(e.amount || e.valor || 0), 0);
      const expenses = list.filter((e: any) => (e.type || e.tipo) === 'expense' || (e.type || e.tipo) === 'Despesa')
        .reduce((sum: number, e: any) => sum + Number(e.amount || e.valor || 0), 0);
      setSummary({
        revenue,
        expenses,
        profit: revenue - expenses,
        margin: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0,
      });
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.descricao.trim() || !formData.valor) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    setSaving(true);
    try {
      await api.post('/finance', {
        type: formData.tipo,
        category: formData.categoria,
        description: formData.descricao,
        amount: parseFloat(formData.valor),
        date: formData.data,
      });
      toast.success('Lançamento criado!');
      setDialogOpen(false);
      fetchFinance();
    } catch {
      toast.error('Erro ao criar lançamento');
    } finally {
      setSaving(false);
    }
  };

  const filteredEntries = filterType === 'todos'
    ? entries
    : entries.filter((e) => {
        const t = (e.type || e.tipo || '').toLowerCase();
        return t === filterType || (filterType === 'receita' && t === 'income') || (filterType === 'despesa' && t === 'expense');
      });

  const columns: Column<any>[] = [
    {
      key: 'date',
      label: 'Data',
      sortable: true,
      render: (v, row) => v ? new Date(v).toLocaleDateString('pt-BR') : (row.data || '-'),
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (value, row) => {
        const v = value || row.tipo;
        return <Badge className={cn('border-0', typeColors[v] || 'bg-gray-100 text-gray-700')}>{v === 'income' ? 'Receita' : v === 'expense' ? 'Despesa' : v}</Badge>;
      },
    },
    {
      key: 'category',
      label: 'Categoria',
      render: (v, row) => v || row.categoria || '-',
    },
    {
      key: 'description',
      label: 'Descrição',
      render: (v, row) => v || row.descricao || '-',
    },
    {
      key: 'amount',
      label: 'Valor',
      sortable: true,
      render: (value, row) => {
        const v = Number(value ?? row.valor ?? 0);
        const isIncome = (row.type || row.tipo) === 'income' || (row.type || row.tipo) === 'Receita';
        return (
          <span className={cn('font-medium', isIncome ? 'text-green-600' : 'text-red-600')}>
            {isIncome ? '+' : '-'}R$ {v.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: 'paid',
      label: 'Status',
      render: (value) => (
        <Badge className={cn('border-0', value ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
          {value ? 'Pago' : 'Pendente'}
        </Badge>
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
          value={`R$ ${summary.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          trend={{ value: 15, isPositive: true }}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Despesas"
          value={`R$ ${summary.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingDown}
          trend={{ value: 5, isPositive: false }}
          iconBgColor="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          title="Lucro"
          value={`R$ ${summary.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend={{ value: 22, isPositive: true }}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Margem"
          value={`${summary.margin.toFixed(1)}%`}
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
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
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
            totalPages={Math.ceil(filteredEntries.length / 15) || 1}
            totalItems={filteredEntries.length}
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
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
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
              <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
