'use client';

import { useState } from 'react';
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
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const banners = [
  { id: 1, titulo: 'Promoção de Verão', imagem: '🏖️', link: '/promocoes/verao', dataInicio: '01/06/2026', dataFim: '31/08/2026', status: true, posicao: 'Home - Topo' },
  { id: 2, titulo: 'Frutas Orgânicas', imagem: '🌿', link: '/categorias/organicos', dataInicio: '15/05/2026', dataFim: '15/07/2026', status: true, posicao: 'Home - Meio' },
  { id: 3, titulo: 'Frete Grátis', imagem: '🚚', link: '/info/frete-gratis', dataInicio: '01/06/2026', dataFim: '30/06/2026', status: false, posicao: 'Home - Topo' },
  { id: 4, titulo: 'Semana do Cliente', imagem: '🎉', link: '/promocoes/cliente', dataInicio: '01/07/2026', dataFim: '07/07/2026', status: true, posicao: 'Home - Banner' },
  { id: 5, titulo: 'Hortaliças Frescas', imagem: '🥬', link: '/categorias/hortalicas', dataInicio: '10/06/2026', dataFim: '10/07/2026', status: true, posicao: 'Sidebar' },
];

export default function BannersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    link: '',
    dataInicio: '',
    dataFim: '',
    posicao: '',
  });

  const handleOpenDialog = (banner?: any) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        titulo: banner.titulo,
        link: banner.link,
        dataInicio: '',
        dataFim: '',
        posicao: banner.posicao,
      });
    } else {
      setEditingBanner(null);
      setFormData({ titulo: '', link: '', dataInicio: '', dataFim: '', posicao: '' });
    }
    setDialogOpen(true);
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <Card key={banner.id} className="overflow-hidden">
            {/* Preview */}
            <div className="h-40 bg-gradient-to-r from-[#16a34a] to-[#22c55e] flex items-center justify-center">
              <span className="text-6xl">{banner.imagem}</span>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{banner.titulo}</h3>
                  <p className="text-sm text-gray-500">{banner.posicao}</p>
                </div>
                <Switch checked={banner.status} />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{banner.dataInicio}</span>
                <span>→</span>
                <span>{banner.dataFim}</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge className={cn('border-0', banner.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700')}>
                  {banner.status ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(banner)}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
              <Label>Imagem</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Clique para fazer upload</p>
                <p className="text-xs text-gray-400">PNG, JPG até 2MB</p>
              </div>
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
              <Button className="bg-[#16a34a] hover:bg-[#15803d]">Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}