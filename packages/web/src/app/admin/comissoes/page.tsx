'use client';

import { useState, useEffect } from 'react';
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
import { DollarSign, Users, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ComissoesPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [periodFilter, setPeriodFilter] = useState('all');
  const [summary, setSummary] = useState({ total: 0, paid: 0, pending: 0, sellers: 0 });

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      const { data: result } = await api.get('/commissions?limit=100');
      const data = result?.data || [];
      const list = Array.isArray(data) ? data : (data.items || data.commissions || []);
      setCommissions(list);

      const total = list.reduce((sum: number, c: any) => sum + Number(c.commissionValue || c.orderValue || 0), 0);
      const paid = list.filter((c: any) => c.paid === true).reduce((sum: number, c: any) => sum + Number(c.commissionValue || c.orderValue || 0), 0);
      const sellerNames = new Set(list.map((c: any) => c.user?.name || ''));
      setSummary({ total, paid, pending: total - paid, sellers: sellerNames.size });
    } catch {
      setCommissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayPending = async () => {
    const pendingIds = commissions.filter((c: any) => !c.paid).map((c: any) => c.id);
    if (pendingIds.length === 0) {
      toast.error('Nenhuma comissão pendente');
      return;
    }
    try {
      await api.post('/commissions/batch-pay', { ids: pendingIds });
      toast.success('Comissões pendentes marcadas como pagas!');
      fetchCommissions();
    } catch {
      toast.error('Erro ao pagar comissões');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'user',
      label: 'Usuário',
      sortable: true,
      render: (v) => v?.name || '-',
    },
    {
      key: 'product',
      label: 'Produto',
      render: (v) => v?.name || '-',
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (v) => (
        <Badge className="bg-blue-100 text-blue-700 border-0">{v || 'Venda'}</Badge>
      ),
    },
    {
      key: 'commissionValue',
      label: 'Valor',
      sortable: true,
      render: (v, row) => `R$ ${Number(v || row.orderValue || 0).toFixed(2)}`,
    },
    {
      key: 'paid',
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
    {
      key: 'period',
      label: 'Período',
      render: (v, row) => v || row.periodo || '-',
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
          <h1 className="text-2xl font-bold text-gray-900">Comissões</h1>
          <p className="text-gray-500">Controle de comissões de vendedores</p>
        </div>
        <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handlePayPending}>
          <DollarSign className="w-4 h-4 mr-2" />
          Pagar Comissões Pendentes
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Comissões"
          value={`R$ ${summary.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Pagas"
          value={`R$ ${summary.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={CheckCircle}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Pendentes"
          value={`R$ ${summary.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={Clock}
          iconBgColor="bg-yellow-50"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Vendedores"
          value={String(summary.sellers)}
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
                <SelectItem value="all">Todos os Períodos</SelectItem>
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
            totalPages={Math.ceil(commissions.length / 15) || 1}
            totalItems={commissions.length}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
