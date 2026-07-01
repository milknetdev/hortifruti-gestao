'use client';

import { useState } from 'react';
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
import { Plus, Minus, Settings, AlertTriangle, ArrowDown, ArrowUp, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

const movements = [
  { id: 1, data: '28/06/2026 14:30', produto: 'Tomate Italiano', tipo: 'Entrada', quantidade: '+50 kg', usuario: 'Admin' },
  { id: 2, data: '28/06/2026 10:15', produto: 'Banana Prata', tipo: 'Saída', quantidade: '-15 kg', usuario: 'Sistema' },
  { id: 3, data: '27/06/2026 16:45', produto: 'Maçã Fuji', tipo: 'Perda', quantidade: '-3 kg', usuario: 'João' },
  { id: 4, data: '27/06/2026 14:20', produto: 'Alface Americana', tipo: 'Entrada', quantidade: '+30 un', usuario: 'Admin' },
  { id: 5, data: '27/06/2026 09:00', produto: 'Cenoura', tipo: 'Ajuste', quantidade: '-2 kg', usuario: 'Admin' },
  { id: 6, data: '26/06/2026 17:30', produto: 'Limão Tahiti', tipo: 'Entrada', quantidade: '+40 kg', usuario: 'Admin' },
  { id: 7, data: '26/06/2026 11:00', produto: 'Pepino', tipo: 'Saída', quantidade: '-10 kg', usuario: 'Sistema' },
  { id: 8, data: '25/06/2026 15:45', produto: 'Pimentão Vermelho', tipo: 'Perda', quantidade: '-5 kg', usuario: 'Maria' },
];

const lowStock = [
  { id: 1, produto: 'Tomate Italiano', atual: 5, minimo: 10, status: 'Baixo' },
  { id: 2, produto: 'Maçã Fuji', atual: 3, minimo: 8, status: 'Baixo' },
  { id: 3, produto: 'Alface Americana', atual: 4, minimo: 12, status: 'Baixo' },
  { id: 4, produto: 'Cenoura', atual: 8, minimo: 15, status: 'Baixo' },
];

const outOfStock = [
  { id: 1, produto: 'Limão Tahiti', unidade: 'kg', ultimaVenda: '25/06/2026' },
  { id: 2, produto: 'Batata Doce', unidade: 'kg', ultimaVenda: '20/06/2026' },
];

const typeColors: Record<string, string> = {
  'Entrada': 'bg-green-100 text-green-700',
  'Saída': 'bg-blue-100 text-blue-700',
  'Ajuste': 'bg-yellow-100 text-yellow-700',
  'Perda': 'bg-red-100 text-red-700',
};

export default function EstoquePage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'entrada' | 'saida' | 'ajuste' | 'perda'>('entrada');
  const [formData, setFormData] = useState({ produto: '', quantidade: '', motivo: '' });

  const openDialog = (type: typeof dialogType) => {
    setDialogType(type);
    setFormData({ produto: '', quantidade: '', motivo: '' });
    setDialogOpen(true);
  };

  const dialogTitles = {
    entrada: 'Registrar Entrada',
    saida: 'Registrar Saída',
    ajuste: 'Registrar Ajuste',
    perda: 'Registrar Perda',
  };

  const movementColumns: Column<any>[] = [
    { key: 'data', label: 'Data', sortable: true },
    { key: 'produto', label: 'Produto', sortable: true },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (value) => (
        <Badge className={cn('border-0', typeColors[value])}>{value}</Badge>
      ),
    },
    {
      key: 'quantidade',
      label: 'Quantidade',
      render: (value) => (
        <span className={cn('font-medium', value.startsWith('+') ? 'text-green-600' : 'text-red-600')}>
          {value}
        </span>
      ),
    },
    { key: 'usuario', label: 'Usuário' },
  ];

  const lowStockColumns: Column<any>[] = [
    { key: 'produto', label: 'Produto', sortable: true },
    {
      key: 'atual',
      label: 'Atual',
      render: (value) => <span className="text-red-600 font-medium">{value}</span>,
    },
    { key: 'minimo', label: 'Mínimo' },
    {
      key: 'status',
      label: 'Status',
      render: () => <Badge className="bg-orange-100 text-orange-700 border-0">Estoque Baixo</Badge>,
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: () => (
        <Button variant="outline" size="sm" onClick={() => openDialog('entrada')}>
          <Plus className="w-4 h-4 mr-1" />
          Repor
        </Button>
      ),
    },
  ];

  const outOfStockColumns: Column<any>[] = [
    { key: 'produto', label: 'Produto', sortable: true },
    { key: 'unidade', label: 'Unidade' },
    { key: 'ultimaVenda', label: 'Última Venda' },
    {
      key: 'acoes',
      label: 'Ações',
      render: () => (
        <Button variant="outline" size="sm" onClick={() => openDialog('entrada')}>
          <Plus className="w-4 h-4 mr-1" />
          Registrar Entrada
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
          <p className="text-gray-500">Controle de estoque e movimentações</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openDialog('entrada')}>
            <ArrowDown className="w-4 h-4 mr-2 text-green-600" />
            Entrada
          </Button>
          <Button variant="outline" onClick={() => openDialog('saida')}>
            <ArrowUp className="w-4 h-4 mr-2 text-blue-600" />
            Saída
          </Button>
          <Button variant="outline" onClick={() => openDialog('ajuste')}>
            <Wrench className="w-4 h-4 mr-2 text-yellow-600" />
            Ajuste
          </Button>
          <Button variant="outline" onClick={() => openDialog('perda')}>
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
              <TabsTrigger value="estoque-baixo">Estoque Baixo</TabsTrigger>
              <TabsTrigger value="sem-estoque">Sem Estoque</TabsTrigger>
            </TabsList>

            <TabsContent value="movimentacoes">
              <DataTable
                columns={movementColumns}
                data={movements}
                searchable
                searchPlaceholder="Pesquisar movimentações..."
                page={page}
                totalPages={3}
                totalItems={movements.length * 3}
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
              <Select value={formData.produto} onValueChange={(v) => setFormData({ ...formData, produto: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {['Tomate Italiano', 'Banana Prata', 'Maçã Fuji', 'Alface Americana', 'Cenoura', 'Limão Tahiti', 'Pepino', 'Pimentão Vermelho'].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
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
            {(dialogType === 'ajuste' || dialogType === 'perda') && (
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
              <Button className="bg-[#16a34a] hover:bg-[#15803d]">Confirmar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}