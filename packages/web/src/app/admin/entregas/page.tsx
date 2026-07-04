'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Loader2, Save } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function EntregasPage() {
  const [deliveryFee, setDeliveryFee] = useState('9.90');
  const [freeAbove, setFreeAbove] = useState('100');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: result } = await api.get('/delivery/settings');
      const settings = result?.data || result;
      setDeliveryFee(String(settings?.deliveryFee || 9.90));
      setFreeAbove(String(settings?.freeAbove || 100));
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/delivery/settings', {
        deliveryFee: parseFloat(deliveryFee),
        freeAbove: parseFloat(freeAbove),
      });
      toast.success('Configurações salvas!');
    } catch {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
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
      <div>
        <h1 className="text-2xl font-bold">Entregas</h1>
        <p className="text-gray-500">Configure as opções de entrega</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck size={20} />
            Configurações de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Valor do Frete (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Valor cobrado para entregas
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Frete Grátis Acima de (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={freeAbove}
                onChange={(e) => setFreeAbove(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pedidos acima deste valor terão frete grátis
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Resumo:</strong> O frete de <strong>R$ {parseFloat(deliveryFee).toFixed(2)}</strong> será cobrado para pedidos abaixo de <strong>R$ {parseFloat(freeAbove).toFixed(2)}</strong>. Pedidos acima deste valor terão <strong>frete grátis</strong>.
              </p>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-[#16a34a] hover:bg-[#15803d]"
            >
              {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
