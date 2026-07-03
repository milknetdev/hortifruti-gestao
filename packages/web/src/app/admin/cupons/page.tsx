'use client';

import { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent } from '@/components/ui/card';
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
import { Plus, Pencil, Trash2, Copy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const typeColors: Record<string, string> = {
  'Percentual': 'bg-blue-100 text-blue-700',
  'Valor Fixo': 'bg-purple-100 text-purple-700',
  'Frete Grátis': 'bg-green-100 text-green-700',
  'PERCENTAGE': 'bg-blue-100 text-blue-700',
  'FIXED': 'bg-purple-100 text-purple-700',
  'FREE_SHIPPING': 'bg-green-100 text-green-700',
  'percentage': 'bg-blue-100 text-blue-700',
  'fixed': 'bg-purple-100 text-purple-700',
  'free_shipping': 'bg-green-100 text-green-700',
};

const typeLabels: Record<string, string> = {
  'PERCENTAGE': 'Porcentagem',
  'FIXED': 'Valor Fixo',
  'FREE_SHIPPING': 'Frete Grátis',
  'percentage': 'Porcentagem',
  'fixed': 'Valor Fixo',
  'free_shipping': 'Frete Grátis',
  'Valor Fixo': 'Valor Fixo',
  'Frete Grátis': 'Frete Grátis',
};

const statusColors: Record<string, string> = {
  'active': 'bg-green-100 text-green-700',
  'expired': 'bg-gray-100 text-gray-700',
  'exhausted': 'bg-yellow-100 text-yellow-700',
};

const statusLabels: Record<string, string> = {
  'active': 'Ativo',
  'expired': 'Expirado',
  'exhausted': 'Esgotado',
};

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    tipo: 'percentage',
    valor: '',
    limiteUso: '',
    validade: '',
    valorMinimo: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data: result } = await api.get('/coupons?limit=100');
      setCoupons(Array.isArray(result.data) ? result.data : []);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (coupon?: any) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        codigo: coupon.code || '',
        tipo: coupon.type || 'PERCENTAGE',
        valor: String(coupon.value || ''),
        limiteUso: String(coupon.usageLimit || ''),
        validade: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
        valorMinimo: String(coupon.minOrderValue || ''),
      });
    } else {
      setEditingCoupon(null);
      setFormData({ codigo: '', tipo: 'PERCENTAGE', valor: '', limiteUso: '', validade: '', valorMinimo: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.codigo.trim()) {
      toast.error('Código é obrigatório');
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const payload: any = {
        code: formData.codigo.toUpperCase(),
        type: formData.tipo,
        value: parseFloat(formData.valor) || 0,
        usageLimit: parseInt(formData.limiteUso) || 0,
        validFrom: now,
        validUntil: formData.validade ? new Date(formData.validade).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        minOrderValue: parseFloat(formData.valorMinimo) || 0,
      };
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon.id}`, payload);
        toast.success('Cupom atualizado!');
      } else {
        await api.post('/coupons', payload);
        toast.success('Cupom criado!');
      }
      setDialogOpen(false);
      fetchCoupons();
    } catch {
      toast.error('Erro ao salvar cupom');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este cupom?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Cupom removido!');
      fetchCoupons();
    } catch {
      toast.error('Erro ao remover cupom');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'code',
      label: 'Código',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono font-medium">{value || row.codigo}</code>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (value, row) => {
        const v = value || row.tipo;
        return <Badge className={cn('border-0', typeColors[v] || 'bg-gray-100 text-gray-700')}>{typeLabels[v] || v}</Badge>;
      },
    },
    {
      key: 'value',
      label: 'Valor',
      render: (v, row) => {
        const val = v ?? row.valor;
        const type = row.type || row.tipo;
        if (type === 'percentage' || type === 'Percentual') return `${val}%`;
        if (type === 'free_shipping' || type === 'Frete Grátis') return 'R$ 0,00';
        return `R$ ${Number(val || 0).toFixed(2)}`;
      },
    },
    {
      key: 'usage',
      label: 'Uso',
      render: (v, row) => `${row.currentUsage || v || 0}/${row.usageLimit || row.limiteUso || '∞'}`,
    },
    {
      key: 'expiresAt',
      label: 'Validade',
      render: (v, row) => v || row.validade || '-',
    },
    {
      key: 'active',
      label: 'Status',
      render: (value, row) => {
        const isActive = value !== undefined ? value : row.status === 'Ativo';
        return (
          <Badge className={cn('border-0', isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700')}>
            {isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        );
      },
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenDialog(row); }}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Cupons</h1>
          <p className="text-gray-500">Gerencie cupons de desconto</p>
        </div>
        <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cupom
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={coupons}
            searchable
            searchPlaceholder="Pesquisar por código..."
            page={page}
            totalPages={Math.ceil(coupons.length / 15) || 1}
            totalItems={coupons.length}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                placeholder="CUPOM10"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <option value="PERCENTAGE">Porcentagem</option>
                <option value="FIXED">Valor Fixo</option>
                <option value="FREE_SHIPPING">Frete Grátis</option>
              </select>
            </div>
            {formData.tipo !== 'FREE_SHIPPING' && (
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder={formData.tipo === 'percentage' ? '10' : '15.00'}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Limite de Uso</Label>
                <Input
                  type="number"
                  value={formData.limiteUso}
                  onChange={(e) => setFormData({ ...formData, limiteUso: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label>Validade</Label>
                <Input
                  type="date"
                  value={formData.validade}
                  onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valor Mínimo do Pedido (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valorMinimo}
                onChange={(e) => setFormData({ ...formData, valorMinimo: e.target.value })}
                placeholder="50.00"
              />
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
