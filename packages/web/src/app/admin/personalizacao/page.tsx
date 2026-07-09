'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Upload, Save, Loader2, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function PersonalizacaoPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    storeName: 'HortiFruti',
    slogan: 'Frutas e verduras frescas direto do produtor',
    logo: '',
    favicon: '',
    primaryColor: '#16a34a',
    secondaryColor: '#f97316',
    accentColor: '#3b82f6',
    fontFamily: 'Inter',
    theme: 'light',
    metaTitle: 'HortiFruti - Frutas e Verduras Frescas',
    metaDescription: 'Compre frutas, verduras e legumes frescos com entrega rápida.',
    keywords: 'frutas, verduras, legumes, hortifruti, delivery, orgânicos',
    googleAnalyticsId: '',
    facebookPixelId: '',
    phone: '',
    whatsapp: '',
    email: '',
    instagram: '',
    address: '',
    weekdayHours: '07:00 - 20:00',
    saturdayHours: '07:00 - 18:00',
    sundayHours: '08:00 - 14:00',
    footerText: '© 2026 HortiFruti. Todos os direitos reservados.',
    paymentText: 'Aceitamos PIX, Cartão de Crédito e Débito',
    footerLinks: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: result } = await api.get('/settings');
      const data = result?.data || result || {};
      setSettings((prev) => ({ ...prev, ...data }));
    } catch {
      // Use defaults
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Configurações salvas!');
    } catch {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Personalização</h1>
        <p className="text-gray-500">Personalize a aparência da loja</p>
      </div>

      <Tabs defaultValue="geral">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="contato">Contato</TabsTrigger>
          <TabsTrigger value="rodape">Rodapé</TabsTrigger>
        </TabsList>

        {/* Geral */}
        <TabsContent value="geral" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações da Loja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Loja</Label>
                  <Input
                    value={settings.storeName}
                    onChange={(e) => updateSetting('storeName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slogan</Label>
                  <Input
                    value={settings.slogan}
                    onChange={(e) => updateSetting('slogan', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  value={settings.logo}
                  onChange={(e) => updateSetting('logo', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aparência */}
        <TabsContent value="aparencia" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cores e Tema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Cor Primária</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={settings.primaryColor} onChange={(e) => updateSetting('primaryColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                    <Input value={settings.primaryColor} onChange={(e) => updateSetting('primaryColor', e.target.value)} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor Secundária</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={settings.secondaryColor} onChange={(e) => updateSetting('secondaryColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                    <Input value={settings.secondaryColor} onChange={(e) => updateSetting('secondaryColor', e.target.value)} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor de Destaque</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={settings.accentColor} onChange={(e) => updateSetting('accentColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                    <Input value={settings.accentColor} onChange={(e) => updateSetting('accentColor', e.target.value)} className="flex-1" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fonte Principal</Label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => updateSetting('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option>Inter</option>
                  <option>Roboto</option>
                  <option>Open Sans</option>
                  <option>Poppins</option>
                  <option>Montserrat</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="flex gap-4">
                  {['light', 'dark', 'auto'].map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="theme" value={t} checked={settings.theme === t} onChange={(e) => updateSetting('theme', e.target.value)} />
                      <span className="text-sm">{t === 'light' ? 'Claro' : t === 'dark' ? 'Escuro' : 'Automático'}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações de SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input
                  value={settings.metaTitle}
                  onChange={(e) => updateSetting('metaTitle', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={settings.metaDescription}
                  onChange={(e) => updateSetting('metaDescription', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Palavras-chave</Label>
                <Input
                  value={settings.keywords}
                  onChange={(e) => updateSetting('keywords', e.target.value)}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Google Analytics ID</Label>
                <Input
                  value={settings.googleAnalyticsId}
                  onChange={(e) => updateSetting('googleAnalyticsId', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>Facebook Pixel ID</Label>
                <Input
                  value={settings.facebookPixelId}
                  onChange={(e) => updateSetting('facebookPixelId', e.target.value)}
                  placeholder="123456789012345"
                />
              </div>
              <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contato */}
        <TabsContent value="contato" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={settings.phone} onChange={(e) => updateSetting('phone', e.target.value)} placeholder="(11) 3456-7890" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input value={settings.whatsapp} onChange={(e) => updateSetting('whatsapp', e.target.value)} placeholder="(11) 99999-8888" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input value={settings.email} onChange={(e) => updateSetting('email', e.target.value)} placeholder="contato@hortifruti.com" />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input value={settings.instagram} onChange={(e) => updateSetting('instagram', e.target.value)} placeholder="@hortifruti" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Textarea value={settings.address} onChange={(e) => updateSetting('address', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Horário de Funcionamento</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-20">Seg-Sex:</span>
                    <Input value={settings.weekdayHours} onChange={(e) => updateSetting('weekdayHours', e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-20">Sábado:</span>
                    <Input value={settings.saturdayHours} onChange={(e) => updateSetting('saturdayHours', e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-20">Domingo:</span>
                    <Input value={settings.sundayHours} onChange={(e) => updateSetting('sundayHours', e.target.value)} />
                  </div>
                </div>
              </div>
              <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rodapé */}
        <TabsContent value="rodape" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações do Rodapé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Texto do Rodapé</Label>
                <Textarea value={settings.footerText} onChange={(e) => updateSetting('footerText', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Texto de Pagamento</Label>
                <Input value={settings.paymentText} onChange={(e) => updateSetting('paymentText', e.target.value)} />
              </div>
              <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      <Card className="mt-6 border-dashed border-2 border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-600" />
            Preview
            <span className="text-sm font-normal text-gray-500">— Assim vai aparecer no site</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Header Preview */}
          <div className="bg-white rounded-t-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.logo ? (
                  <img src={settings.logo} alt="Logo" className="w-8 h-8 rounded" />
                ) : (
                  <div className="w-8 h-8 rounded bg-green-600 flex items-center justify-center text-white font-bold text-sm">
                    {settings.storeName?.charAt(0) || 'H'}
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-gray-900" style={{ color: settings.primaryColor }}>{settings.storeName || 'HortiFruti'}</h2>
                  <p className="text-xs text-gray-500">{settings.slogan || 'Frutas e verduras frescas'}</p>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>Início</span>
                <span>Produtos</span>
                <span>Contato</span>
              </div>
            </div>
          </div>

          {/* Colors Preview */}
          <div className="bg-gray-50 border-x border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-2">Cores do tema:</p>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: settings.primaryColor }}></div>
                <span className="text-xs">Primária</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: settings.secondaryColor }}></div>
                <span className="text-xs">Secundária</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: settings.accentColor }}></div>
                <span className="text-xs">Destaque</span>
              </div>
            </div>
          </div>

          {/* Footer Preview */}
          <div className="bg-gray-900 rounded-b-xl p-4 text-gray-300 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-green-400">{settings.storeName || 'HortiFruti'}</span>
              <span>{settings.footerText || '© 2026 HortiFruti'}</span>
            </div>
            {settings.paymentText && (
              <p className="mt-1 text-gray-500">{settings.paymentText}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
