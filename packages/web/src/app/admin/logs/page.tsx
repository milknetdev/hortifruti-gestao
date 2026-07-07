'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Search, Loader2, Filter, X } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldData?: string;
  newData?: string;
  ip?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const actionLabels: Record<string, string> = {
  'CREATE': 'Criou',
  'UPDATE': 'Atualizou',
  'DELETE': 'Deletou',
  'POST': 'Criou',
  'PUT': 'Atualizou',
  'PATCH': 'Atualizou',
};

const actionColors: Record<string, string> = {
  'CREATE': 'bg-green-100 text-green-700',
  'UPDATE': 'bg-blue-100 text-blue-700',
  'DELETE': 'bg-red-100 text-red-700',
  'POST': 'bg-green-100 text-green-700',
  'PUT': 'bg-blue-100 text-blue-700',
  'PATCH': 'bg-blue-100 text-blue-700',
};

const entityLabels: Record<string, string> = {
  'products': 'Produtos',
  'orders': 'Pedidos',
  'customers': 'Clientes',
  'categories': 'Categorias',
  'coupons': 'Cupons',
  'banners': 'Banners',
  'settings': 'Configurações',
  'users': 'Usuários',
  'pickup-points': 'Pontos de Retirada',
  'team': 'Equipe',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    entity: '',
    action: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '30');
      if (filters.entity) params.append('entity', filters.entity);
      if (filters.action) params.append('action', filters.action);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const { data: result } = await api.get(`/audit?${params.toString()}`);
      const data = result?.data || result;
      setLogs(data?.data || []);
      setTotalPages(data?.meta?.totalPages || 1);
      setTotal(data?.meta?.total || 0);
    } catch {
      toast.error('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setPage(1);
    fetchLogs();
  };

  const clearFilters = () => {
    setFilters({ entity: '', action: '', startDate: '', endDate: '' });
    setPage(1);
    setTimeout(() => fetchLogs(), 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  const getActionLabel = (action: string) => actionLabels[action] || action;
  const getActionColor = (action: string) => actionColors[action] || 'bg-gray-100 text-gray-700';
  const getEntityLabel = (entity: string) => entityLabels[entity] || entity;

  const formatChanges = (log: AuditLog) => {
    if (!log.newData) return null;
    try {
      const data = JSON.parse(log.newData);
      const keys = Object.keys(data).filter(k => !['password', 'token'].includes(k));
      if (keys.length === 0) return null;
      return keys.slice(0, 5).join(', ') + (keys.length > 5 ? '...' : '');
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs de Auditoria</h1>
          <p className="text-gray-500">Registro de todas as ações no painel</p>
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Módulo</Label>
                <Select value={filters.entity} onValueChange={(v) => setFilters({ ...filters, entity: v === 'all' ? '' : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(entityLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ação</Label>
                <Select value={filters.action} onValueChange={(v) => setFilters({ ...filters, action: v === 'all' ? '' : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="CREATE">Criou</SelectItem>
                    <SelectItem value="UPDATE">Atualizou</SelectItem>
                    <SelectItem value="DELETE">Deletou</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleFilter} className="bg-green-600 hover:bg-green-700">
                <Search className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="text-sm text-gray-500">
        {total} registro{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-green-600" size={32} />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum log encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Data/Hora</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Usuário</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ação</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Módulo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.user?.name || 'Sistema'}</p>
                          <p className="text-xs text-gray-500">{log.user?.email || '-'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getActionColor(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {getEntityLabel(log.entity)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                        {formatChanges(log) || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
