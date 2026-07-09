'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Info } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SobreNosPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    aboutTitle: '',
    aboutDescription: '',
    aboutStat1: '',
    aboutStat2: '',
    aboutStat3: '',
    aboutFeatureTitle: '',
    aboutFeatureDesc: '',
    aboutImage: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: result } = await api.get('/settings/about');
        const data = result?.data || result || {};
        setFormData({
          aboutTitle: data.aboutTitle || '',
          aboutDescription: data.aboutDescription || '',
          aboutStat1: data.aboutStat1 || '',
          aboutStat2: data.aboutStat2 || '',
          aboutStat3: data.aboutStat3 || '',
          aboutFeatureTitle: data.aboutFeatureTitle || '',
          aboutFeatureDesc: data.aboutFeatureDesc || '',
          aboutImage: data.aboutImage || '',
        });
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings/about', formData);
      toast.success('Configurações salvas!');
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Sobre Nós</h1>
          <p className="text-gray-500">Edite a seção "Sobre Nós" da página inicial</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4" />
              Conteúdo Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formData.aboutTitle}
                onChange={(e) => setFormData({ ...formData, aboutTitle: e.target.value })}
                placeholder="Frescor do Campo direto pra sua Mesa"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.aboutDescription}
                onChange={(e) => setFormData({ ...formData, aboutDescription: e.target.value })}
                placeholder="Texto sobre a empresa..."
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label>URL da Imagem (opcional)</Label>
              <Input
                value={formData.aboutImage}
                onChange={(e) => setFormData({ ...formData, aboutImage: e.target.value })}
                placeholder="https://..."
              />
              {formData.aboutImage && (
                <div className="mt-2 rounded-lg overflow-hidden border">
                  <img src={formData.aboutImage} alt="Preview" className="w-full h-32 object-cover" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats & Feature */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Estatística 1</Label>
                <Input
                  value={formData.aboutStat1}
                  onChange={(e) => setFormData({ ...formData, aboutStat1: e.target.value })}
                  placeholder="500+ Produtos"
                />
              </div>
              <div className="space-y-2">
                <Label>Estatística 2</Label>
                <Input
                  value={formData.aboutStat2}
                  onChange={(e) => setFormData({ ...formData, aboutStat2: e.target.value })}
                  placeholder="10k+ Clientes"
                />
              </div>
              <div className="space-y-2">
                <Label>Estatística 3</Label>
                <Input
                  value={formData.aboutStat3}
                  onChange={(e) => setFormData({ ...formData, aboutStat3: e.target.value })}
                  placeholder="5★ Avaliação"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Card de Destaque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título do Destaque</Label>
                <Input
                  value={formData.aboutFeatureTitle}
                  onChange={(e) => setFormData({ ...formData, aboutFeatureTitle: e.target.value })}
                  placeholder="Qualidade Garantida"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição do Destaque</Label>
                <Input
                  value={formData.aboutFeatureDesc}
                  onChange={(e) => setFormData({ ...formData, aboutFeatureDesc: e.target.value })}
                  placeholder="Selecionados com carinho"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-xl p-8">
            <div className="max-w-4xl mx-auto">
              <span className="inline-block px-3 py-1 bg-gray-200 rounded-full text-xs font-semibold text-gray-600 mb-4">Sobre Nós</span>
              <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-4 font-heading">{formData.aboutTitle || 'Título'}</h2>
              <p className="text-gray-600 mb-8">{formData.aboutDescription || 'Descrição...'}</p>
              <div className="grid grid-cols-3 gap-4">
                {[formData.aboutStat1, formData.aboutStat2, formData.aboutStat3].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div className="text-lg font-bold text-green-700">{stat || `Stat ${i + 1}`}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
