'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, DollarSign, ShoppingBag, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function MinhasIndicacoesPage() {
  const [stats, setStats] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, commRes] = await Promise.all([
        api.get('/referral/stats'),
        api.get('/referral/my-commissions?limit=50'),
      ]);
      setStats(statsRes.data?.data || statsRes.data);
      setCommissions(commRes.data?.data || []);
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
          <p className="text-sm text-gray-600 mb-2">Seu link de indicação</p>
          <div className="flex items-center gap-2 bg-white p-3 rounded-lg border">
            <p className="flex-1 text-sm font-mono text-green-700 truncate">
              {stats?.referralLink || 'Gerando...'}
            </p>
            <Button onClick={copyLink} size="sm" className="bg-green-600 hover:bg-green-700 shrink-0">
              <Copy size={14} className="mr-1" />
              Copiar
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Comissão: <span className="font-bold">{stats?.commissionRate || 10}%</span> por pedido realizado
          </p>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingBag className="mx-auto text-blue-600 mb-2" size={24} />
            <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
            <p className="text-xs text-gray-500">Pedidos Indicados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="mx-auto text-green-600 mb-2" size={24} />
            <p className="text-2xl font-bold">{formatCurrency(stats?.totalCommissions || 0)}</p>
            <p className="text-xs text-gray-500">Total Comissões</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto text-purple-600 mb-2" size={24} />
            <p className="text-2xl font-bold">{formatCurrency(stats?.paidCommissions || 0)}</p>
            <p className="text-xs text-gray-500">Comissões Pagas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="mx-auto text-yellow-600 mb-2" size={24} />
            <p className="text-2xl font-bold">{formatCurrency(stats?.pendingCommissions || 0)}</p>
            <p className="text-xs text-gray-500">Pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico */}
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
            <div className="space-y-3">
              {commissions.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{c.notes || 'Comissão'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      +{formatCurrency(c.commissionValue || 0)}
                    </p>
                    <Badge className={cn('border-0 text-xs', c.paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                      {c.paid ? 'Pago' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
