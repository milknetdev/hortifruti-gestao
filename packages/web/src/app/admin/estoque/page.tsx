'use client';

import { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, Settings, AlertTriangle, ArrowDown, ArrowUp, Wrench, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const typeColors: Record<string, string> = {
  'ENTRY': 'bg-green-100 text-green-700',
  'EXIT': 'bg-blue-100 text-blue-700',
  'SALE': 'bg-orange-100 text-orange-700',
  'ADJUSTMENT': 'bg-yellow-100 text-yellow-700',
  'LOSS': 'bg-red-100 text-red-700',
};

const typeLabels: Record<string, string> = {
  'ENTRY': 'Entrada',
  'EXIT': 'Saída',
  'SALE': 'Venda',
  'ADJUSTMENT': 'Ajuste',
  'LOSS': 'Perda',
};

export default function EstoquePage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'entry' | 'exit' | 'adjustment' | 'loss'>('entry');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ productId: '', quantidade: '', motivo: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [movRes, prodRes] = await Promise.all([
        api.get('/stock/movements?limit=100'),
        api.get('/products?limit=100'),
      ]);
      const movData = movRes.data?.data || [];
      setMovements(Array.isArray(movData) ? movData : (movData.movements || []));
      const prodData = prodRes.data?.data || [];
      setProducts(Array.isArray(prodData) ? prodData : []);
    } catch {
      setMovements([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (type: typeof dialogType) => {
    setDialogType(type);
    setFormData({ productId: '', quantidade: '', motivo: '' });
    setDialogOpen(true);
  };

  const dialogTitles: Record<string, string> = {
    entry: 'Registrar Entrada',
    exit: 'Registrar Saída',
    adjustment: 'Registrar Ajuste',
    loss: 'Registrar Perda',
  };

  const handleSave = async () => {
    if (!formData.productId || !formData.quantidade) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    setSaving(true);
    try {
      const endpoint = dialogType === 'entry' ? '/stock/add' : '/stock/remove';
      await api.post(endpoint, {
        productId: formData.productId,
        quantity: parseFloat(formData.quantidade),
        reason: formData.motivo,
        type: dialogType,
      });
      toast.success('Movimentação registrada!');
      setDialogOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('ERRO ESTOQUE:', err?.message, err?.response?.data);
      toast.error('Erro ao registrar movimentação');
    } finally {
      setSaving(false);
    }
  };

  const lowStock = products.filter((p: any) => p.stock !== undefined && p.minStock !== undefined && p.stock <= p.minStock);
  const outOfStock = products.filter((p: any) => p.stock !== undefined && p.stock === 0);

  const movementColumns: Column<any>[] = [
    {
      key: 'createdAt',
      label: 'Data',
      sortable: true,
      render: (v) => v ? new Date(v).toLocaleString('pt-BR') : '-',
    },
    {
      key: 'product',
      label: 'Produto',
      render: (v) => v?.name || '-',
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (value) => {
        const label = typeLabels[value] || value;
        return <Badge className={cn('border-0', typeColors[value] || 'bg-gray-100 text-gray-700')}>{label}</Badge>;
      },
    },
    {
      key: 'quantity',
      label: 'Quantidade',
      render: (value) => {
        const prefix = value >= 0 ? '+' : '';
        return (
          <span className={cn('font-medium', value >= 0 ? 'text-green-600' : 'text-red-600')}>
            {prefix}{value}
          </span>
        );
      },
    },
    {
      key: 'user',
      label: 'Usuário',
      render: (v) => v?.name || 'Sistema',
    },
  ];

  const lowStockColumns: Column<any>[] = [
    { key: 'name', label: 'Produto', sortable: true },
    {
      key: 'stock',
      label: 'Atual',
      render: (value) => <span className="text-red-600 font-medium">{value}</span>,
    },
    { key: 'minStock', label: 'Mínimo' },
    {
      key: 'status',
      label: 'Status',
      render: () => <Badge className="bg-orange-100 text-orange-700 border-0">Estoque Baixo</Badge>,
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (_, row) => (
        <Button variant="outline" size="sm" onClick={() => openDialog('entry')}>
          <Plus className="w-4 h-4 mr-1" />
          Repor
        </Button>
      ),
    },
  ];

  const outOfStockColumns: Column<any>[] = [
    { key: 'name', label: 'Produto', sortable: true },
    {
      key: 'unit',
      label: 'Unidade',
      render: (v, row) => v || row.unitType || '-',
    },
    {
      key: 'updatedAt',
      label: 'Última Atualização',
      render: (v) => v ? new Date(v).toLocaleDateString('pt-BR') : '-',
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: () => (
        <Button variant="outline" size="sm" onClick={() => openDialog('entry')}>
          <Plus className="w-4 h-4 mr-1" />
          Registrar Entrada
        </Button>
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
          <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
          <p className="text-gray-500">Controle de estoque e movimentações</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openDialog('entry')}>
            <ArrowDown className="w-4 h-4 mr-2 text-green-600" />
            Entrada
          </Button>
          <Button variant="outline" onClick={() => openDialog('exit')}>
            <ArrowUp className="w-4 h-4 mr-2 text-blue-600" />
            Saída
          </Button>
          <Button variant="outline" onClick={() => openDialog('adjustment')}>
            <Wrench className="w-4 h-4 mr-2 text-yellow-600" />
            Ajuste
          </Button>
          <Button variant="outline" onClick={() => openDialog('loss')}>
            <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
            Perda
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="movimentacoes">
            <TabsList className="mb-6">
              <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
              <TabsTrigger value="estoque-baixo">Estoque Baixo ({lowStock.length})</TabsTrigger>
              <TabsTrigger value="sem-estoque">Sem Estoque ({outOfStock.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="movimentacoes">
              <DataTable
                columns={movementColumns}
                data={movements}
                searchable
                searchPlaceholder="Pesquisar movimentações..."
                page={page}
                totalPages={Math.ceil(movements.length / 15) || 1}
                totalItems={movements.length}
                onPageChange={setPage}
              />
            </TabsContent>

            <TabsContent value="estoque-baixo">
              <DataTable
                columns={lowStockColumns}
                data={lowStock}
                searchable={false}
                page={1}
                totalPages={1}
              />
            </TabsContent>

            <TabsContent value="sem-estoque">
              <DataTable
                columns={outOfStockColumns}
                data={outOfStock}
                searchable={false}
                page={1}
                totalPages={1}
                emptyMessage="Nenhum produto sem estoque"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Movement Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitles[dialogType]}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select value={formData.productId} onValueChange={(v) => setFormData({ ...formData, productId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.stock ?? 0} un)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                placeholder="0"
              />
            </div>
            {(dialogType === 'adjustment' || dialogType === 'loss') && (
              <div className="space-y-2">
                <Label>Motivo</Label>
                <Textarea
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  placeholder="Descreva o motivo..."
                  rows={3}
                />
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
