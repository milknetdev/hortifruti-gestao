'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    link: '',
    dataInicio: '',
    dataFim: '',
    posicao: '',
    imagem: '',
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data: result } = await api.get('/banners?limit=100');
      setBanners(Array.isArray(result.data) ? result.data : []);
    } catch {
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (banner?: any) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        titulo: banner.title || banner.titulo || '',
        link: banner.link || '',
        dataInicio: banner.startDate || banner.dataInicio || '',
        dataFim: banner.endDate || banner.dataFim || '',
        posicao: banner.position || banner.posicao || '',
        imagem: banner.image || banner.imagem || '',
      });
    } else {
      setEditingBanner(null);
      setFormData({ titulo: '', link: '', dataInicio: '', dataFim: '', posicao: '', imagem: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.titulo.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        title: formData.titulo,
        link: formData.link,
        startDate: formData.dataInicio,
        endDate: formData.dataFim,
        position: formData.posicao,
        image: formData.imagem,
      };
      if (editingBanner) {
        await api.put(`/banners/${editingBanner.id}`, payload);
        toast.success('Banner atualizado!');
      } else {
        await api.post('/banners', payload);
        toast.success('Banner criado!');
      }
      setDialogOpen(false);
      fetchBanners();
    } catch {
      toast.error('Erro ao salvar banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Banner removido!');
      fetchBanners();
    } catch {
      toast.error('Erro ao remover banner');
    }
  };

  const handleToggleStatus = async (banner: any) => {
    try {
      const isActive = banner.status ?? banner.active ?? true;
      await api.put(`/banners/${banner.id}`, { active: !isActive });
      toast.success('Status atualizado!');
      fetchBanners();
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-500">Gerencie os banners da loja</p>
        </div>
        <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Banner
        </Button>
      </div>

      {/* Banner Grid */}
      {banners.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Nenhum banner cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => {
            const isActive = banner.status ?? banner.active ?? true;
            return (
              <Card key={banner.id} className="overflow-hidden">
                {/* Preview */}
                <div className="h-40 bg-gradient-to-r from-[#16a34a] to-[#22c55e] flex items-center justify-center">
                  {(banner.image || banner.imagem) ? (
                    <img src={banner.image || banner.imagem} alt={banner.title || banner.titulo} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl">🖼️</span>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{banner.title || banner.titulo}</h3>
                      <p className="text-sm text-gray-500">{banner.position || banner.posicao}</p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={() => handleToggleStatus(banner)} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{banner.startDate || banner.dataInicio || '-'}</span>
                    <span>→</span>
                    <span>{banner.endDate || banner.dataFim || '-'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className={cn('border-0', isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700')}>
                      {isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(banner)}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(banner.id)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Editar Banner' : 'Novo Banner'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Título do banner"
              />
            </div>
            <div className="space-y-2">
              <Label>URL da Imagem</Label>
              <Input
                value={formData.imagem}
                onChange={(e) => setFormData({ ...formData, imagem: e.target.value })}
                placeholder="https://..."
              />
              {formData.imagem && (
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <img 
                    src={formData.imagem} 
                    alt="Preview" 
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Link</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/promocoes/verao"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Posição</Label>
              <select
                value={formData.posicao}
                onChange={(e) => setFormData({ ...formData, posicao: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">Selecione</option>
                <option value="Home - Topo">Home - Topo</option>
                <option value="Home - Meio">Home - Meio</option>
                <option value="Home - Banner">Home - Banner</option>
                <option value="Sidebar">Sidebar</option>
                <option value="Footer">Footer</option>
              </select>
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
