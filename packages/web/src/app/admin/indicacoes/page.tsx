'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, DollarSign, ShoppingBag, Users, TrendingUp, CheckCircle, Clock, Loader2, Settings, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ReferralPage() {
  const [stats, setStats] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [commissionType, setCommissionType] = useState<string>('PERCENTAGE');
  const [commissionValue, setCommissionValue] = useState<string>('10');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, commRes] = await Promise.all([
        api.get('/referral/stats'),
        api.get('/referral/my-commissions?limit=50'),
      ]);
      
      // Handle double nesting: response.data.data.data || response.data.data || response.data
      const statsData = statsRes.data?.data?.data || statsRes.data?.data || statsRes.data;
      setStats(statsData);
      
      // Handle commissions - may also be nested
      const commData = commRes.data?.data?.data || commRes.data?.data || commRes.data;
      setCommissions(Array.isArray(commData) ? commData : []);
      
      // Initialize settings from stats
      if (statsData) {
        setCommissionType(statsData.commissionType || 'PERCENTAGE');
        setCommissionValue(String(statsData.commissionRate || 10));
      }
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink);
      toast.success('Link copiado!');
    }
  };

  const copyCode = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode);
      toast.success('Código copiado!');
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/referral/settings', {
        commissionRate: parseFloat(commissionValue),
        commissionType,
      });
      toast.success('Configurações salvas!');
      fetchData(); // Refresh data
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-2xl font-bold">Minhas Indicações</h1>
        <p className="text-gray-500">Compartilhe seu link e ganhe comissões</p>
      </div>

      {/* Link de indicação */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Seu link de indicação</p>
              <p className="text-lg font-mono font-semibold text-green-700">
                {stats?.referralLink || 'Gerando...'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Código: <span className="font-mono font-bold">{stats?.referralCode}</span> • 
                Comissão: <span className="font-bold">{stats?.commissionRate || 10}{stats?.commissionType === 'FIXED' ? '' : '%'}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyLink} className="bg-green-600 hover:bg-green-700">
                <Copy size={16} className="mr-2" />
                Copiar Link
              </Button>
              <Button onClick={copyCode} variant="outline">
                <Copy size={16} className="mr-2" />
                Copiar Código
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingBag className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pedidos Indicados</p>
                <p className="text-xl font-bold">{stats?.totalOrders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Faturamento Indicado</p>
                <p className="text-xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Comissões</p>
                <p className="text-xl font-bold">{formatCurrency(stats?.totalCommissions || 0)}</p>
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
                <p className="text-xl font-bold">{formatCurrency(stats?.pendingCommissions || 0)}</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Comissão
              </label>
              <select
                value={commissionType}
                onChange={(e) => setCommissionType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="PERCENTAGE">Porcentagem (%)</option>
                <option value="FIXED">Valor Fixo (R$)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor da Comissão
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {commissionType === 'FIXED' ? 'R$' : '%'}
                </span>
                <input
                  type="number"
                  min="0"
                  step={commissionType === 'FIXED' ? '0.01' : '1'}
                  value={commissionValue}
                  onChange={(e) => setCommissionValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de comissões */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Comissões</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Nenhuma comissão ainda</p>
              <p className="text-sm">Compartilhe seu link para ganhar comissões!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Data</th>
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
                      <td className="py-3 px-4 text-sm">{c.notes || 'Comissão'}</td>
                      <td className="py-3 px-4 text-sm">{formatCurrency(c.orderValue || 0)}</td>
                      <td className="py-3 px-4 text-sm font-medium text-green-600">
                        +{formatCurrency(c.commissionValue || 0)}
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
        </CardContent>
      </Card>
    </div>
  );
}
