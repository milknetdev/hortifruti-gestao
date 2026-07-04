'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [summary, setSummary] = useState({ total: 0, paid: 0, pending: 0, sellers: 0 });

  const fetchCommissions = useCallback(async (currentPage = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: '15',
      });
      if (statusFilter === 'paid') params.set('paid', 'true');
      if (statusFilter === 'pending') params.set('paid', 'false');

      const { data: result } = await api.get(`/commissions?${params.toString()}`);

      // API returns { data: [...], meta: { total, page, limit, totalPages } }
      const list = Array.isArray(result?.data) ? result.data : [];
      const meta = result?.meta || {};

      setCommissions(list);
      setTotalPages(meta.totalPages || 1);
      setTotalItems(meta.total || list.length);
    } catch {
      setCommissions([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  const fetchSummary = useCallback(async () => {
    try {
      const { data: result } = await api.get('/commissions/summary');
      const total = Number(result?.totalCommissions || 0);
      const paid = Number(result?.paidCommissions || 0);
      const pending = Number(result?.unpaidCommissions || 0);
      setSummary({ total, paid, pending, sellers: 0 });
    } catch {
      // Fallback: compute from current list
    }
  }, []);

  const fetchSellers = useCallback(async () => {
    try {
      const { data: result } = await api.get('/commissions?limit=1000');
      const allItems = Array.isArray(result?.data) ? result.data : [];
      const sellerNames = new Set(allItems.map((c: any) => c.user?.name || '').filter(Boolean));
      setSummary((prev) => ({ ...prev, sellers: sellerNames.size }));
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchCommissions(page);
  }, [page, statusFilter, fetchCommissions]);

  useEffect(() => {
    fetchSummary();
    fetchSellers();
  }, [fetchSummary, fetchSellers]);

  const handlePayPending = async () => {
    try {
      // Get all pending commission IDs
      const { data: result } = await api.get('/commissions?limit=1000&paid=false');
      const pendingList = Array.isArray(result?.data) ? result.data : [];
      const pendingIds = pendingList.map((c: any) => c.id);

      if (pendingIds.length === 0) {
        toast.error('Nenhuma comissão pendente');
        return;
      }

      await api.post('/commissions/batch-pay', { ids: pendingIds });
      toast.success(`${pendingIds.length} comissões marcadas como pagas!`);
      fetchCommissions(page);
      fetchSummary();
      fetchSellers();
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
      render: (v, row) => `R$ ${Number(v || row.value || row.orderValue || 0).toFixed(2)}`,
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
      render: (v) => v || '-',
    },
    {
      key: 'createdAt',
      label: 'Data',
      render: (v) => v ? new Date(v).toLocaleDateString('pt-BR') : '-',
    },
  ];

  if (loading && commissions.length === 0) {
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
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
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
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
