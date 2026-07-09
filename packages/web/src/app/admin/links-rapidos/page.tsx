'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, Link2, GripVertical } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface QuickLink {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  active: boolean;
}

export default function LinksRapidosPage() {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<QuickLink | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    href: '',
    sortOrder: 0,
    active: true,
  });

  const fetchLinks = async () => {
    try {
      const { data: result } = await api.get('/quick-links/admin');
      const linksData = result?.data || result || [];
      setLinks(Array.isArray(linksData) ? linksData : []);
    } catch {
      toast.error('Erro ao carregar links');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleOpenDialog = (link?: QuickLink) => {
    if (link) {
      setEditingLink(link);
      setFormData({
        label: link.label,
        href: link.href,
        sortOrder: link.sortOrder,
        active: link.active,
      });
    } else {
      setEditingLink(null);
      setFormData({
        label: '',
        href: '',
        sortOrder: links.length,
        active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.label || !formData.href) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      if (editingLink) {
        await api.put(`/quick-links/${editingLink.id}`, formData);
        toast.success('Link atualizado!');
      } else {
        await api.post('/quick-links', formData);
        toast.success('Link criado!');
      }
      setIsDialogOpen(false);
      fetchLinks();
    } catch {
      toast.error('Erro ao salvar link');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este link?')) return;
    try {
      await api.delete(`/quick-links/${id}`);
      toast.success('Link removido!');
      fetchLinks();
    } catch {
      toast.error('Erro ao remover link');
    }
  };

  const handleToggleActive = async (link: QuickLink) => {
    try {
      await api.put(`/quick-links/${link.id}`, { active: !link.active });
      fetchLinks();
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Links Rápidos</h1>
          <p className="text-gray-500">Gerencie os links exibidos no rodapé do site</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Link
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {links.map((link) => (
              <div
                key={link.id}
                className={`flex items-center gap-4 p-4 ${!link.active ? 'opacity-50' : ''}`}
              >
                <GripVertical className="w-4 h-4 text-gray-300" />
                <Link2 className="w-4 h-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{link.label}</p>
                  <p className="text-sm text-gray-500 truncate">{link.href}</p>
                </div>
                <span className="text-xs text-gray-400">Ordem: {link.sortOrder}</span>
                <Switch
                  checked={link.active}
                  onCheckedChange={() => handleToggleActive(link)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDialog(link)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(link.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {links.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Nenhum link rápido cadastrado</p>
            <Button onClick={() => handleOpenDialog()} className="mt-4 bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro link
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLink ? 'Editar Link' : 'Novo Link'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome do Link *</Label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Ex: Início"
              />
            </div>
            <div className="space-y-2">
              <Label>URL / Caminho *</Label>
              <Input
                value={formData.href}
                onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                placeholder="/produtos"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ordem</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2 flex items-end">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(v) => setFormData({ ...formData, active: v })}
                  />
                  <Label>Ativo</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                {editingLink ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
