'use client';

import { useState, useEffect } from 'react';
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
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CategoriasPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    categoriaPai: '',
    icone: '',
    ordem: '0',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: result } = await api.get('/categories?limit=100');
      setCategories(Array.isArray(result.data) ? result.data : []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (cat?: any) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        nome: cat.name || '',
        categoriaPai: cat.parentId || '',
        icone: cat.icon || '',
        ordem: String(cat.sortOrder || 0),
      });
    } else {
      setEditingCategory(null);
      setFormData({ nome: '', categoriaPai: '', icone: '', ordem: '0' });
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
        sortOrder: parseInt(formData.ordem) || 0,
      };
      if (formData.categoriaPai) payload.parentId = formData.categoriaPai;
      if (formData.icone) payload.icon = formData.icone;

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, payload);
        toast.success('Categoria atualizada!');
      } else {
        await api.post('/categories', payload);
        toast.success('Categoria criada!');
      }
      setDialogOpen(false);
      fetchCategories();
    } catch {
      toast.error('Erro ao salvar categoria');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta categoria?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Categoria removida!');
      fetchCategories();
    } catch {
      toast.error('Erro ao remover categoria');
    }
  };

  const parentCategories = categories.filter((c: any) => !c.parentCategory && !c.parentName);

  const columns: Column<any>[] = [
    {
      key: 'icon',
      label: '',
      className: 'w-12',
      render: (value) => value ? <span className="text-2xl">{value}</span> : (
        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">📁</div>
      ),
    },
    { key: 'name', label: 'Nome', sortable: true, render: (v, row) => v || row.nome },
    {
      key: 'parentCategory',
      label: 'Categoria Pai',
      render: (v, row) => v?.name || row.parentName || '—',
    },
    {
      key: 'productsCount',
      label: 'Produtos',
      sortable: true,
      render: (v, row) => v ?? row.produtos ?? 0,
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
            totalPages={Math.ceil(categories.length / 15) || 1}
            totalItems={categories.length}
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
                  {parentCategories.map((c: any) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
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
                <Input
                  value={formData.icone}
                  onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                  placeholder="Emoji ou URL da imagem"
                />
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
