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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const zones = [
  { id: 1, nome: 'Centro', bairros: 'Centro, Sé, República, Liberdade', taxa: 'R$ 8,00', gratisAcima: 'R$ 100,00', tempo: '30-45 min', status: 'Ativa' },
  { id: 2, nome: 'Zona Sul', bairros: 'Vila Mariana, Moema, Ibirapuera, Saúde', taxa: 'R$ 12,00', gratisAcima: 'R$ 150,00', tempo: '45-60 min', status: 'Ativa' },
  { id: 3, nome: 'Zona Norte', bairros: 'Santana, Tucuruvi, Jaçanã, Mandaqui', taxa: 'R$ 15,00', gratisAcima: 'R$ 200,00', tempo: '60-90 min', status: 'Ativa' },
  { id: 4, nome: 'Zona Leste', bairros: 'Tatuapé, Mooca, Itaquera, São Mateus', taxa: 'R$ 18,00', gratisAcima: 'R$ 200,00', tempo: '60-90 min', status: 'Ativa' },
  { id: 5, nome: 'Zona Oeste', bairros: 'Pinheiros, Butantã, Lapa, Perdizes', taxa: 'R$ 10,00', gratisAcima: 'R$ 120,00', tempo: '45-60 min', status: 'Ativa' },
  { id: 6, nome: 'Grande SP', bairros: 'Osasco, Guarulhos, São Caetano, Santo André', taxa: 'R$ 25,00', gratisAcima: 'R$ 300,00', tempo: '90-120 min', status: 'Inativa' },
];

const statusColors: Record<string, string> = {
  'Ativa': 'bg-green-100 text-green-700',
  'Inativa': 'bg-red-100 text-red-700',
};

export default function EntregasPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    bairros: '',
    taxa: '',
    gratisAcima: '',
    tempoMin: '',
    tempoMax: '',
  });

  const handleOpenDialog = (zone?: any) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        nome: zone.nome,
        bairros: zone.bairros,
        taxa: zone.taxa.replace('R$ ', ''),
        gratisAcima: zone.gratisAcima.replace('R$ ', ''),
        tempoMin: zone.tempo.split('-')[0],
        tempoMax: zone.tempo.split('-')[1].replace(' min', ''),
      });
    } else {
      setEditingZone(null);
      setFormData({ nome: '', bairros: '', taxa: '', gratisAcima: '', tempoMin: '', tempoMax: '' });
    }
    setDialogOpen(true);
  };

  const columns: Column<any>[] = [
    { key: 'nome', label: 'Zona', sortable: true },
    { key: 'bairros', label: 'Bairros' },
    { key: 'taxa', label: 'Taxa' },
    { key: 'gratisAcima', label: 'Grátis Acima' },
    { key: 'tempo', label: 'Tempo Estimado' },
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
            totalPages={2}
            totalItems={zones.length * 2}
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
              <Button className="bg-[#16a34a] hover:bg-[#15803d]">Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}