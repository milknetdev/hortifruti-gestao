'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MapPin, Loader2, Store } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function PontosRetiradaPage() {
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    zipCode: '',
    city: '',
    state: '',
    neighborhood: '',
    complement: '',
    reference: '',
    phone: '',
    startTime: '08:00',
    endTime: '18:00',
  });

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      const { data: result } = await api.get('/pickup-points');
      const list = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
      setPoints(list);
    } catch {
      setPoints([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          address: data.logradouro || prev.address,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
          zipCode: cep,
        }));
        toast.success('Endereço encontrado!');
      }
    } catch {}
  };

  const handleOpenDialog = (point?: any) => {
    if (point) {
      setEditingPoint(point);
      setForm({
        name: point.name || '',
        address: point.address || '',
        zipCode: point.zipCode || '',
        city: point.city || '',
        state: point.state || '',
        neighborhood: point.neighborhood || '',
        complement: point.complement || '',
        reference: point.reference || '',
        phone: point.phone || '',
        startTime: point.startTime || '08:00',
        endTime: point.endTime || '18:00',
      });
    } else {
      setEditingPoint(null);
      setForm({ name: '', address: '', zipCode: '', city: '', state: '', neighborhood: '', complement: '', reference: '', phone: '', startTime: '08:00', endTime: '18:00' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim()) {
      toast.error('Preencha nome e endereço');
      return;
    }
    setSaving(true);
    try {
      if (editingPoint) {
        await api.put(`/pickup-points/${editingPoint.id}`, form);
        toast.success('Ponto de retirada atualizado!');
      } else {
        await api.post('/pickup-points', form);
        toast.success('Ponto de retirada criado!');
      }
      setDialogOpen(false);
      fetchPoints();
    } catch {
      toast.error('Erro ao salvar ponto de retirada');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      await api.delete(`/pickup-points/${id}`);
      toast.success('Ponto de retirada removido!');
      fetchPoints();
    } catch {
      toast.error('Erro ao remover ponto de retirada');
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
          <h1 className="text-2xl font-bold">Pontos de Retirada</h1>
          <p className="text-gray-500">Gerencie os locais de retirada</p>
        </div>
        <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={() => handleOpenDialog()}>
          <Plus size={16} className="mr-2" />
          Novo Ponto
        </Button>
      </div>

      {points.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Store size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Nenhum ponto de retirada cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {points.map((point: any) => (
            <Card key={point.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Store className="text-green-600" size={20} />
                    <h3 className="font-semibold">{point.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(point)}>
                      <Edit size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(point.id)}>
                      <Trash2 size={14} className="text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center gap-1">
                    <MapPin size={14} />
                    {point.address}
                  </p>
                  {point.neighborhood && <p>{point.neighborhood} - {point.city}/{point.state}</p>}
                  {point.zipCode && <p>CEP: {point.zipCode}</p>}
                  {point.phone && <p>Tel: {point.phone}</p>}
                  <p className="text-xs text-gray-400 mt-2">
                    Horário: {point.startTime} - {point.endTime}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingPoint ? 'Editar Ponto de Retirada' : 'Novo Ponto de Retirada'}
              </h3>
              <button onClick={() => setDialogOpen(false)} className="text-gray-400 hover:text-gray-600">X</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Loja Centro"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">CEP</label>
                <input
                  type="text"
                  value={form.zipCode}
                  onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                  onBlur={(e) => fetchAddressByCep(e.target.value)}
                  placeholder="00000-000"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Endereço *</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Rua, número"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Bairro</label>
                  <input
                    type="text"
                    value={form.neighborhood}
                    onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Cidade</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Estado</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Telefone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Complemento</label>
                <input
                  type="text"
                  value={form.complement}
                  onChange={(e) => setForm({ ...form, complement: e.target.value })}
                  placeholder="Apto, bloco, etc."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Referência</label>
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  placeholder="Próximo a..."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Horário Início</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Horário Fim</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
