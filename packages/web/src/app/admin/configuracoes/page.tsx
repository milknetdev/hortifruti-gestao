'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Download, RefreshCw, CheckCircle } from 'lucide-react';

export default function ConfiguracoesPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500">Configurações gerais do sistema</p>
      </div>

      <Tabs defaultValue="geral">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="email">E-mail</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
        </TabsList>

        {/* Geral */}
        <TabsContent value="geral" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Moeda</Label>
                  <select className="w-full px-3 py-2 border rounded-md text-sm">
                    <option>BRL - Real Brasileiro (R$)</option>
                    <option>USD - Dólar Americano ($)</option>
                    <option>EUR - Euro (€)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <select className="w-full px-3 py-2 border rounded-md text-sm">
                    <option>Português (Brasil)</option>
                    <option>English</option>
                    <option>Español</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <select className="w-full px-3 py-2 border rounded-md text-sm">
                    <option>America/Sao_Paulo (GMT-3)</option>
                    <option>America/Manaus (GMT-4)</option>
                    <option>America/Belem (GMT-3)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Formato de Data</Label>
                  <select className="w-full px-3 py-2 border rounded-md text-sm">
                    <option>DD/MM/AAAA</option>
                    <option>MM/DD/AAAA</option>
                    <option>AAAA-MM-DD</option>
                  </select>
                </div>
              </div>
              <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* E-mail */}
        <TabsContent value="email" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações de E-mail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Servidor SMTP</Label>
                  <Input placeholder="smtp.gmail.com" />
                </div>
                <div className="space-y-2">
                  <Label>Porta</Label>
                  <Input placeholder="587" />
                </div>
                <div className="space-y-2">
                  <Label>Usuário</Label>
                  <Input placeholder="seu@email.com" />
                </div>
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>De (Nome)</Label>
                  <Input placeholder="HortiFruti" />
                </div>
                <div className="space-y-2">
                  <Label>De (E-mail)</Label>
                  <Input placeholder="noreply@hortifruti.com" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Testar Conexão
                </Button>
                <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notificacoes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tipos de Notificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Novo Pedido', desc: 'Receber notificação quando um novo pedido for realizado' },
                { label: 'Pagamento Confirmado', desc: 'Receber notificação quando um pagamento for confirmado' },
                { label: 'Estoque Baixo', desc: 'Receber alertas quando o estoque estiver abaixo do mínimo' },
                { label: 'Pedido Cancelado', desc: 'Receber notificação quando um pedido for cancelado' },
                { label: 'Nova Avaliação', desc: 'Receber notificação quando um cliente deixar uma avaliação' },
                { label: 'Relatório Diário', desc: 'Receber resumo diário de vendas e pedidos' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={i < 4} />
                  </div>
                  {i < 5 && <Separator className="mt-4" />}
                </div>
              ))}
              <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="backup" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Backup do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Último backup realizado</p>
                    <p className="text-sm text-green-700">28/06/2026 às 03:00</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">Sucesso</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Button className="bg-[#16a34a] hover:bg-[#15803d]">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Fazer Backup Agora
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Último Backup
                </Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Backup Automático</Label>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Backup Diário</p>
                    <p className="text-sm text-gray-500">Realizar backup automaticamente todos os dias às 03:00</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pagamentos */}
        <TabsContent value="pagamentos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Métodos de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'PIX', icon: '💳', status: true, desc: 'Pagamento instantâneo via PIX' },
                { name: 'Cartão de Crédito', icon: '💳', status: true, desc: 'Visa, Mastercard, Elo' },
                { name: 'Cartão de Débito', icon: '💳', status: true, desc: 'Visa Débito, Maestro' },
                { name: 'Dinheiro', icon: '💵', status: true, desc: 'Pagamento na entrega' },
                { name: 'Boleto', icon: '📄', status: false, desc: 'Boleto bancário' },
              ].map((method, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.desc}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={method.status} />
                  </div>
                  {i < 4 && <Separator className="mt-4" />}
                </div>
              ))}
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