'use client';

import { useState } from 'react';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { id: 1, nome: 'Frutas', categoriaPai: '—', produtos: 24, status: 'Ativa', imagem: '🍎' },
  { id: 2, nome: 'Hortaliças', categoriaPai: '—', produtos: 18, status: 'Ativa', imagem: '🥬' },
  { id: 3, nome: 'Legumes', categoriaPai: '—', produtos: 15, status: 'Ativa', imagem: '🥕' },
  { id: 4, nome: 'Temperos', categoriaPai: '—', produtos: 10, status: 'Ativa', imagem: '🌿' },
  { id: 5, nome: 'Orgânicos', categoriaPai: '—', produtos: 8, status: 'Ativa', imagem: '🌱' },
  { id: 6, nome: 'Cítricos', categoriaPai: 'Frutas', produtos: 6, status: 'Ativa', imagem: '🍋' },
  { id: 7, nome: 'Tropicais', categoriaPai: 'Frutas', produtos: 8, status: 'Ativa', imagem: '🥭' },
  { id: 8, nome: 'Folhosos', categoriaPai: 'Hortaliças', produtos: 5, status: 'Inativa', imagem: '🥬' },
];

export default function CategoriasPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    categoriaPai: '',
    icone: '',
    ordem: '0',
  });

  const handleOpenDialog = (cat?: any) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        nome: cat.nome,
        categoriaPai: cat.categoriaPai === '—' ? '' : cat.categoriaPai,
        icone: cat.imagem,
        ordem: '0',
      });
    } else {
      setEditingCategory(null);
      setFormData({ nome: '', categoriaPai: '', icone: '', ordem: '0' });
    }
    setDialogOpen(true);
  };

  const columns: Column<any>[] = [
    {
      key: 'imagem',
      label: '',
      className: 'w-12',
      render: (value) => <span className="text-2xl">{value}</span>,
    },
    { key: 'nome', label: 'Nome', sortable: true },
    { key: 'categoriaPai', label: 'Categoria Pai' },
    { key: 'produtos', label: 'Produtos', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge
          className={cn(
            'border-0',
            value === 'Ativa' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}
        >
          {value}
        </Badge>
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
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-500">Organize os produtos em categorias</p>
        </div>
        <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={categories}
            searchable
            searchPlaceholder="Pesquisar categorias..."
            page={page}
            totalPages={2}
            totalItems={categories.length * 2}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome da categoria"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria Pai</Label>
              <Select value={formData.categoriaPai} onValueChange={(v) => setFormData({ ...formData, categoriaPai: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma (categoria raiz)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {categories.filter((c) => c.categoriaPai === '—').map((c) => (
                    <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ícone/Imagem</Label>
              <div className="flex items-center gap-4">
                {formData.icone && (
                  <span className="text-3xl">{formData.icone}</span>
                )}
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Imagem
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input
                type="number"
                value={formData.ordem}
                onChange={(e) => setFormData({ ...formData, ordem: e.target.value })}
                placeholder="0"
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