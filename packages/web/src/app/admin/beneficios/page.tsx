'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, RefreshCw, Truck, Leaf, Shield, Clock, Star, Heart, Zap, Award, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface FeatureBanner {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  sortOrder: number;
  active: boolean;
}

const iconOptions = [
  { value: 'truck', label: 'Caminhão', icon: Truck },
  { value: 'leaf', label: 'Folha', icon: Leaf },
  { value: 'shield', label: 'Escudo', icon: Shield },
  { value: 'clock', label: 'Relógio', icon: Clock },
  { value: 'star', label: 'Estrela', icon: Star },
  { value: 'heart', label: 'Coração', icon: Heart },
  { value: 'zap', label: 'Raio', icon: Zap },
  { value: 'award', label: 'Prêmio', icon: Award },
];

function getIcon(iconName: string) {
  const found = iconOptions.find(i => i.value === iconName);
  return found ? found.icon : Truck;
}

export default function FeatureBannersPage() {
  const [banners, setBanners] = useState<FeatureBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<FeatureBanner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'truck',
    sortOrder: 0,
    active: true,
  });

  const fetchBanners = async () => {
    try {
      const { data: result } = await api.get('/feature-banners/admin');
      const bannersData = result?.data?.data || result?.data || result || [];
      setBanners(Array.isArray(bannersData) ? bannersData : []);
    } catch {
      toast.error('Erro ao carregar banners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenDialog = (banner?: FeatureBanner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        description: banner.description || '',
        icon: banner.icon,
        sortOrder: banner.sortOrder,
        active: banner.active,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        description: '',
        icon: 'truck',
        sortOrder: banners.length,
        active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      if (editingBanner) {
        await api.put(`/feature-banners/${editingBanner.id}`, formData);
        toast.success('Banner atualizado!');
      } else {
        await api.post('/feature-banners', formData);
        toast.success('Banner criado!');
      }
      setIsDialogOpen(false);
      fetchBanners();
    } catch {
      toast.error('Erro ao salvar banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este banner?')) return;
    try {
      await api.delete(`/feature-banners/${id}`);
      toast.success('Banner removido!');
      fetchBanners();
    } catch {
      toast.error('Erro ao remover banner');
    }
  };

  const handleToggleActive = async (banner: FeatureBanner) => {
    try {
      await api.put(`/feature-banners/${banner.id}`, { active: !banner.active });
      fetchBanners();
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
          <h1 className="text-2xl font-bold text-gray-900">Banners de Benefícios</h1>
          <p className="text-gray-500">Gerencie os cards de benefícios exibidos na página inicial</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setIsLoading(true); fetchBanners(); }} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Banner
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner) => {
          const Icon = getIcon(banner.icon);
          return (
            <Card key={banner.id} className={`relative ${!banner.active ? 'opacity-50' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-green-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                    {banner.description && (
                      <p className="text-sm text-gray-500 mt-1">{banner.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-400">Ordem: {banner.sortOrder}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className={`text-xs ${banner.active ? 'text-green-600' : 'text-red-500'}`}>
                        {banner.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.active}
                      onCheckedChange={() => handleToggleActive(banner)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(banner)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(banner.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {banners.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Nenhum banner de benefício cadastrado</p>
            <Button onClick={() => handleOpenDialog()} className="mt-4 bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro banner
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Editar Banner' : 'Novo Banner'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Entrega Rápida"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: No mesmo dia para toda a cidade"
              />
            </div>
            <div className="space-y-2">
              <Label>Ícone</Label>
              <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
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
                {editingBanner ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Section */}
      {banners.length > 0 && (
        <Card className="border-dashed border-2 border-green-200 bg-green-50/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg">Preview</CardTitle>
            </div>
            <p className="text-sm text-gray-500">Assim vai aparecer no site</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {banners.filter(b => b.active).map((banner) => {
                const Icon = getIcon(banner.icon);
                return (
                  <div
                    key={banner.id}
                    className="bg-white rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow border"
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-green-700" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">{banner.title}</h4>
                    {banner.description && (
                      <p className="text-xs text-gray-500 mt-1">{banner.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
