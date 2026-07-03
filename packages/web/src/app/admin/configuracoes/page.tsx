'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Download, RefreshCw, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ConfiguracoesPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    currency: 'BRL',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/AAAA',
    smtpServer: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
    emailFromName: '',
    emailFromEmail: '',
    notifications: {
      newOrder: true,
      paymentConfirmed: true,
      lowStock: true,
      orderCancelled: true,
      newReview: false,
      dailyReport: false,
    },
    payments: {
      pix: true,
      creditCard: true,
      debitCard: true,
      cash: true,
      boleto: false,
    },
    autoBackup: true,
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

  const handleBackup = async () => {
    try {
      await api.post('/settings/backup');
      toast.success('Backup iniciado!');
    } catch {
      toast.error('Erro ao iniciar backup');
    }
  };

  const handleTestEmail = async () => {
    try {
      await api.post('/settings/test-email');
      toast.success('E-mail de teste enviado!');
    } catch {
      toast.error('Erro ao enviar e-mail de teste');
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateNotification = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const updatePayment = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      payments: { ...prev.payments, [key]: value },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  const notificationLabels = [
    { key: 'newOrder', label: 'Novo Pedido', desc: 'Receber notificação quando um novo pedido for realizado' },
    { key: 'paymentConfirmed', label: 'Pagamento Confirmado', desc: 'Receber notificação quando um pagamento for confirmado' },
    { key: 'lowStock', label: 'Estoque Baixo', desc: 'Receber alertas quando o estoque estiver abaixo do mínimo' },
    { key: 'orderCancelled', label: 'Pedido Cancelado', desc: 'Receber notificação quando um pedido for cancelado' },
    { key: 'newReview', label: 'Nova Avaliação', desc: 'Receber notificação quando um cliente deixar uma avaliação' },
    { key: 'dailyReport', label: 'Relatório Diário', desc: 'Receber resumo diário de vendas e pedidos' },
  ];

  const paymentLabels = [
    { key: 'pix', name: 'PIX', icon: '💳', desc: 'Pagamento instantâneo via PIX' },
    { key: 'creditCard', name: 'Cartão de Crédito', icon: '💳', desc: 'Visa, Mastercard, Elo' },
    { key: 'debitCard', name: 'Cartão de Débito', icon: '💳', desc: 'Visa Débito, Maestro' },
    { key: 'cash', name: 'Dinheiro', icon: '💵', desc: 'Pagamento na entrega' },
    { key: 'boleto', name: 'Boleto', icon: '📄', desc: 'Boleto bancário' },
  ];

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
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="BRL">BRL - Real Brasileiro (R$)</option>
                    <option value="USD">USD - Dólar Americano ($)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="America/Sao_Paulo">America/Sao_Paulo (GMT-3)</option>
                    <option value="America/Manaus">America/Manaus (GMT-4)</option>
                    <option value="America/Belem">America/Belem (GMT-3)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Formato de Data</Label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => updateSetting('dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="DD/MM/AAAA">DD/MM/AAAA</option>
                    <option value="MM/DD/AAAA">MM/DD/AAAA</option>
                    <option value="AAAA-MM-DD">AAAA-MM-DD</option>
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
                  <Input value={settings.smtpServer} onChange={(e) => updateSetting('smtpServer', e.target.value)} placeholder="smtp.gmail.com" />
                </div>
                <div className="space-y-2">
                  <Label>Porta</Label>
                  <Input value={settings.smtpPort} onChange={(e) => updateSetting('smtpPort', e.target.value)} placeholder="587" />
                </div>
                <div className="space-y-2">
                  <Label>Usuário</Label>
                  <Input value={settings.smtpUser} onChange={(e) => updateSetting('smtpUser', e.target.value)} placeholder="seu@email.com" />
                </div>
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <Input type="password" value={settings.smtpPassword} onChange={(e) => updateSetting('smtpPassword', e.target.value)} placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>De (Nome)</Label>
                  <Input value={settings.emailFromName} onChange={(e) => updateSetting('emailFromName', e.target.value)} placeholder="HortiFruti" />
                </div>
                <div className="space-y-2">
                  <Label>De (E-mail)</Label>
                  <Input value={settings.emailFromEmail} onChange={(e) => updateSetting('emailFromEmail', e.target.value)} placeholder="noreply@hortifruti.com" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleTestEmail}>
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
              {notificationLabels.map((item, i) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                      onCheckedChange={(v) => updateNotification(item.key, v)}
                    />
                  </div>
                  {i < notificationLabels.length - 1 && <Separator className="mt-4" />}
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
                    <p className="font-medium text-green-900">Backup disponível</p>
                    <p className="text-sm text-green-700">Clique para criar um novo backup</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">Pronto</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handleBackup}>
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
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(v) => updateSetting('autoBackup', v)}
                  />
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
              {paymentLabels.map((method, i) => (
                <div key={method.key}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.payments[method.key as keyof typeof settings.payments]}
                      onCheckedChange={(v) => updatePayment(method.key, v)}
                    />
                  </div>
                  {i < paymentLabels.length - 1 && <Separator className="mt-4" />}
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
