'use client';

import { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

const coupons = [
  { id: 1, codigo: 'BEMVINDO10', tipo: 'Percentual', valor: '10%', uso: '45/100', validade: '31/07/2026', status: 'Ativo' },
  { id: 2, codigo: 'FRETEGRATIS', tipo: 'Frete Grátis', valor: 'R$ 0,00', uso: '120/200', validade: '30/06/2026', status: 'Expirado' },
  { id: 3, codigo: 'VERAO20', tipo: 'Percentual', valor: '20%', uso: '30/50', validade: '31/08/2026', status: 'Ativo' },
  { id: 4, codigo: 'R$15OFF', tipo: 'Valor Fixo', valor: 'R$ 15,00', uso: '8/100', validade: '31/12/2026', status: 'Ativo' },
  { id: 5, codigo: 'FRUTAS25', tipo: 'Percentual', valor: '25%', uso: '50/50', validade: '15/07/2026', status: 'Esgotado' },
  { id: 6, codigo: 'HORTA5', tipo: 'Valor Fixo', valor: 'R$ 5,00', uso: '10/500', validade: '31/12/2026', status: 'Ativo' },
];

const typeColors: Record<string, string> = {
  'Percentual': 'bg-blue-100 text-blue-700',
  'Valor Fixo': 'bg-purple-100 text-purple-700',
  'Frete Grátis': 'bg-green-100 text-green-700',
};

const statusColors: Record<string, string> = {
  'Ativo': 'bg-green-100 text-green-700',
  'Expirado': 'bg-gray-100 text-gray-700',
  'Esgotado': 'bg-yellow-100 text-yellow-700',
};

export default function CuponsPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    tipo: 'percentual',
    valor: '',
    limiteUso: '',
    validade: '',
    valorMinimo: '',
  });

  const handleOpenDialog = (coupon?: any) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        codigo: coupon.codigo,
        tipo: coupon.tipo.toLowerCase().replace(' ', '_'),
        valor: coupon.valor,
        limiteUso: coupon.uso.split('/')[1],
        validade: '',
        valorMinimo: '',
      });
    } else {
      setEditingCoupon(null);
      setFormData({ codigo: '', tipo: 'percentual', valor: '', limiteUso: '', validade: '', valorMinimo: '' });
    }
    setDialogOpen(true);
  };

  const columns: Column<any>[] = [
    {
      key: 'codigo',
      label: 'Código',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono font-medium">{value}</code>
          <button className="text-gray-400 hover:text-gray-600">
            <Copy className="w-3 h-3" />
          </button>
        </div>
      ),
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (value) => (
        <Badge className={cn('border-0', typeColors[value])}>{value}</Badge>
      ),
    },
    { key: 'valor', label: 'Valor' },
    { key: 'uso', label: 'Uso' },
    { key: 'validade', label: 'Validade' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge className={cn('border-0', statusColors[value])}>{value}</Badge>
      ),
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenDialog(row); }}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={(e) => e.stopPropagation()}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

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
            totalPages={2}
            totalItems={coupons.length * 2}
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
              <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentual">Percentual</SelectItem>
                  <SelectItem value="valor_fixo">Valor Fixo</SelectItem>
                  <SelectItem value="frete_gratis">Frete Grátis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.tipo !== 'frete_gratis' && (
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder={formData.tipo === 'percentual' ? '10' : '15.00'}
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
              <Button className="bg-[#16a34a] hover:bg-[#15803d]">Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}