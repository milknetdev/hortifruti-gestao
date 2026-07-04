'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Users, CheckCircle, Clock, Loader2, Settings, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ComissoesPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [summary, setSummary] = useState({ total: 0, paid: 0, pending: 0, sellers: 0 });
  
  // Commission settings
  const [commissionRate, setCommissionRate] = useState(10);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchCommissions = useCallback(async (currentPage = page) => {
    try {
      setLoading(true);
      let url = `/commissions?page=${currentPage}&limit=15`;
      if (statusFilter === 'paid') url += '&paid=true';
      if (statusFilter === 'pending') url += '&paid=false';

      const { data: result } = await api.get(url);
      const list = Array.isArray(result?.data) ? result.data : [];
      const meta = result?.meta || {};

      setCommissions(list);
      setTotalPages(meta.totalPages || 1);
    } catch {
      setCommissions([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  const fetchSummary = useCallback(async () => {
    try {
      const { data: result } = await api.get('/commissions/summary');
      const data = result?.data || result;
      setSummary({
        total: Number(data?.totalCommissions || 0),
        paid: Number(data?.paidCommissions || 0),
        pending: Number(data?.unpaidCommissions || 0),
        sellers: 0,
      });
    } catch {}
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const { data: result } = await api.get('/referral/stats');
      const data = result?.data?.data || result?.data || result;
      setCommissionRate(Number(data?.commissionRate || 10));
    } catch {}
  }, []);

  useEffect(() => {
    fetchCommissions(page);
  }, [page, statusFilter, fetchCommissions]);

  useEffect(() => {
    fetchSummary();
    fetchSettings();
  }, [fetchSummary, fetchSettings]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.put('/referral/settings', { commissionRate });
      toast.success('Configurações salvas!');
    } catch {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePayPending = async () => {
    try {
      const { data: result } = await api.get('/commissions?limit=1000&paid=false');
      const pendingList = Array.isArray(result?.data) ? result.data : [];
      const pendingIds = pendingList.map((c: any) => c.id);

      if (pendingIds.length === 0) {
        toast.error('Nenhuma comissão pendente');
        return;
      }

      await api.post('/commissions/batch-pay', { ids: pendingIds });
      toast.success(`${pendingIds.length} comissão(ões) marcada(s) como paga(s)!`);
      fetchCommissions(page);
      fetchSummary();
    } catch {
      toast.error('Erro ao pagar comissões');
    }
  };

  const statusColors: Record<string, string> = {
    'Pendente': 'bg-yellow-100 text-yellow-700',
    'Pago': 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comissões</h1>
          <p className="text-gray-500">Controle de comissões de vendedores</p>
        </div>
        <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handlePayPending}>
          <DollarSign size={16} className="mr-2" />
          Pagar Comissões Pendentes
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <DollarSign className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Comissões</p>
                <p className="text-xl font-bold">R$ {summary.total.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pagas</p>
                <p className="text-xl font-bold">R$ {summary.paid.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pendentes</p>
                <p className="text-xl font-bold">R$ {summary.pending.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Vendedores</p>
                <p className="text-xl font-bold">{summary.sellers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações de Comissão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            Configurações de Comissão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Taxa de Comissão (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Atual: {commissionRate}% por venda indicada
              </p>
            </div>
            <Button 
              onClick={handleSaveSettings} 
              disabled={savingSettings}
              className="bg-[#16a34a] hover:bg-[#15803d]"
            >
              {savingSettings ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de comissões */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Comissões</CardTitle>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="all">Todos os Status</option>
              <option value="paid">Pagos</option>
              <option value="pending">Pendentes</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nenhuma comissão encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Vendedor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Descrição</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Valor Pedido</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Comissão</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c: any) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-3 px-4 text-sm">
                        {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">{c.user?.name || '-'}</td>
                      <td className="py-3 px-4 text-sm">{c.notes || 'Comissão'}</td>
                      <td className="py-3 px-4 text-sm">R$ {Number(c.orderValue || 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm font-medium text-green-600">
                        +R$ {Number(c.commissionValue || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={cn('border-0', c.paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                          {c.paid ? 'Pago' : 'Pendente'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
