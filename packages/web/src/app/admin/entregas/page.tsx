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
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  'Ativa': 'bg-green-100 text-green-700',
  'Inativa': 'bg-red-100 text-red-700',
  'active': 'bg-green-100 text-green-700',
  'inactive': 'bg-red-100 text-red-700',
};

export default function EntregasPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    bairros: '',
    taxa: '',
    gratisAcima: '',
    tempoMin: '',
    tempoMax: '',
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const { data: result } = await api.get('/delivery?limit=100');
      setZones(Array.isArray(result.data) ? result.data : []);
    } catch {
      setZones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (zone?: any) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        nome: zone.name || zone.nome || '',
        bairros: zone.neighborhoods || zone.bairros || '',
        taxa: String(zone.deliveryFee || zone.taxa || '').replace('R$ ', ''),
        gratisAcima: String(zone.freeAbove || zone.gratisAcima || '').replace('R$ ', ''),
        tempoMin: String(zone.minTime || zone.tempoMin || ''),
        tempoMax: String(zone.maxTime || zone.tempoMax || ''),
      });
    } else {
      setEditingZone(null);
      setFormData({ nome: '', bairros: '', taxa: '', gratisAcima: '', tempoMin: '', tempoMax: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: formData.nome,
        neighborhoods: formData.bairros,
        deliveryFee: parseFloat(formData.taxa) || 0,
        freeAbove: parseFloat(formData.gratisAcima) || 0,
        minTime: parseInt(formData.tempoMin) || 0,
        maxTime: parseInt(formData.tempoMax) || 0,
      };
      if (editingZone) {
        await api.put(`/delivery/${editingZone.id}`, payload);
        toast.success('Zona atualizada!');
      } else {
        await api.post('/delivery', payload);
        toast.success('Zona criada!');
      }
      setDialogOpen(false);
      fetchZones();
    } catch {
      toast.error('Erro ao salvar zona');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta zona?')) return;
    try {
      await api.delete(`/delivery/${id}`);
      toast.success('Zona removida!');
      fetchZones();
    } catch {
      toast.error('Erro ao remover zona');
    }
  };

  const columns: Column<any>[] = [
    { key: 'name', label: 'Zona', sortable: true, render: (v, row) => v || row.nome },
    {
      key: 'neighborhoods',
      label: 'Bairros',
      render: (v, row) => v || row.bairros || '-',
    },
    {
      key: 'deliveryFee',
      label: 'Taxa',
      render: (v, row) => `R$ ${Number(v || row.taxa || 0).toFixed(2)}`,
    },
    {
      key: 'freeAbove',
      label: 'Grátis Acima',
      render: (v, row) => `R$ ${Number(v || row.gratisAcima || 0).toFixed(2)}`,
    },
    {
      key: 'tempo',
      label: 'Tempo Estimado',
      render: (_, row) => `${row.minTime || row.tempoMin || '?'}-${row.maxTime || row.tempoMax || '?'} min`,
    },
    {
      key: 'active',
      label: 'Status',
      render: (value, row) => {
        const isActive = value !== undefined ? value : (row.status === 'Ativa');
        return (
          <Badge className={cn('border-0', isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
            {isActive ? 'Ativa' : 'Inativa'}
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
          <h1 className="text-2xl font-bold text-gray-900">Entregas</h1>
          <p className="text-gray-500">Gerencie zonas de entrega e taxas</p>
        </div>
        <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Zona
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={zones}
            searchable
            searchPlaceholder="Pesquisar zonas..."
            page={page}
            totalPages={Math.ceil(zones.length / 15) || 1}
            totalItems={zones.length}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingZone ? 'Editar Zona' : 'Nova Zona de Entrega'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Zona</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Centro"
              />
            </div>
            <div className="space-y-2">
              <Label>Bairros (separados por vírgula)</Label>
              <Input
                value={formData.bairros}
                onChange={(e) => setFormData({ ...formData, bairros: e.target.value })}
                placeholder="Centro, Sé, República"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Taxa de Entrega (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.taxa}
                  onChange={(e) => setFormData({ ...formData, taxa: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Grátis Acima de (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.gratisAcima}
                  onChange={(e) => setFormData({ ...formData, gratisAcima: e.target.value })}
                  placeholder="100.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tempo Mínimo (min)</Label>
                <Input
                  type="number"
                  value={formData.tempoMin}
                  onChange={(e) => setFormData({ ...formData, tempoMin: e.target.value })}
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <Label>Tempo Máximo (min)</Label>
                <Input
                  type="number"
                  value={formData.tempoMax}
                  onChange={(e) => setFormData({ ...formData, tempoMax: e.target.value })}
                  placeholder="45"
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
