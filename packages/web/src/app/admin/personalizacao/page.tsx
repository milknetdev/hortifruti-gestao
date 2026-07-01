'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Upload, Save, Loader2 } from 'lucide-react';

export default function PersonalizacaoPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
  };

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
          <TabsTrigger value="banners">Banners</TabsTrigger>
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
                  <Input defaultValue="HortiFruti" />
                </div>
                <div className="space-y-2">
                  <Label>Slogan</Label>
                  <Input defaultValue="Frutas e verduras frescas direto do produtor" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-[#16a34a] rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">HF</span>
                  </div>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Alterar Logo
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Favicon</Label>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#16a34a] rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">HF</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Alterar Favicon
                  </Button>
                </div>
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
                    <input type="color" defaultValue="#16a34a" className="w-10 h-10 rounded cursor-pointer" />
                    <Input defaultValue="#16a34a" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor Secundária</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" defaultValue="#f97316" className="w-10 h-10 rounded cursor-pointer" />
                    <Input defaultValue="#f97316" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor de Destaque</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" defaultValue="#3b82f6" className="w-10 h-10 rounded cursor-pointer" />
                    <Input defaultValue="#3b82f6" className="flex-1" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fonte Principal</Label>
                <select className="w-full px-3 py-2 border rounded-md text-sm">
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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="theme" value="light" defaultChecked />
                    <span className="text-sm">Claro</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="theme" value="dark" />
                    <span className="text-sm">Escuro</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="theme" value="auto" />
                    <span className="text-sm">Automático</span>
                  </label>
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
                <Input defaultValue="HortiFruti - Frutas e Verduras Frescas" />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea defaultValue="Compre frutas, verduras e legumes frescos com entrega rápida. HortiFruti - qualidade e frescor direto do produtor." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Palavras-chave</Label>
                <Input defaultValue="frutas, verduras, legumes, hortifruti, delivery, orgânicos" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Google Analytics ID</Label>
                <Input placeholder="G-XXXXXXXXXX" />
              </div>
              <div className="space-y-2">
                <Label>Facebook Pixel ID</Label>
                <Input placeholder="123456789012345" />
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
                  <Input defaultValue="(11) 3456-7890" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input defaultValue="(11) 99999-8888" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input defaultValue="contato@hortifruti.com" />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input defaultValue="@hortifruti" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Textarea defaultValue="Rua das Flores, 123 - Centro, São Paulo - SP, 01234-567" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Horário de Funcionamento</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-20">Seg-Sex:</span>
                    <Input defaultValue="07:00 - 20:00" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-20">Sábado:</span>
                    <Input defaultValue="07:00 - 18:00" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-20">Domingo:</span>
                    <Input defaultValue="08:00 - 14:00" />
                  </div>
                </div>
              </div>
              <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banners */}
        <TabsContent value="banners" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações de Banners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">Gerencie os banners da loja na página dedicada.</p>
              <Button variant="outline" onClick={() => window.location.href = '/banners'}>
                Ir para Banners
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
                <Textarea defaultValue="© 2026 HortiFruti. Todos os direitos reservados." rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Texto de Pagamento</Label>
                <Input defaultValue="Aceitamos PIX, Cartão de Crédito e Débito" />
              </div>
              <div className="space-y-2">
                <Label>Links Adicionais</Label>
                <div className="space-y-2">
                  <Input defaultValue="Termos de Uso" placeholder="Nome do link" />
                  <Input defaultValue="/termos" placeholder="URL" />
                </div>
              </div>
              <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}