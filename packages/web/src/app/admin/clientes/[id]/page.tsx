'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Heart,
  Pencil,
  Save,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ClienteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', cpf: '' });

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      const { data: result } = await api.get(`/customers/${customerId}`);
      const data = result?.data || result;
      setCustomer(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        cpf: data.cpf || '',
      });

      // Fetch addresses
      try {
        const { data: addrResult } = await api.get(`/customers/${customerId}/addresses`);
        setAddresses(Array.isArray(addrResult?.data) ? addrResult.data : (Array.isArray(addrResult) ? addrResult : []));
      } catch {
        setAddresses([]);
      }
    } catch {
      toast.error('Erro ao carregar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/customers/${customerId}`, formData);
      toast.success('Cliente atualizado!');
      setEditing(false);
      fetchCustomer();
    } catch {
      toast.error('Erro ao atualizar cliente');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Cliente não encontrado</h2>
        <Button onClick={() => router.back()}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-500">Cliente desde {new Date(customer.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
        <Badge className={cn('ml-auto border-0', customer.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
          {customer.active ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Total Gasto</p>
            <p className="text-2xl font-bold text-[#16a34a]">R$ {Number(customer.totalSpent || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Total de Pedidos</p>
            <p className="text-2xl font-bold text-gray-900">{customer._count?.orders || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Ticket Médio</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ {customer._count?.orders ? (Number(customer.totalSpent || 0) / customer._count.orders).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="enderecos">Endereços</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Dados Pessoais</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editing ? handleSave() : setEditing(true)}
                >
                  {editing ? <><Save className="w-4 h-4 mr-2" />Salvar</> : <><Pencil className="w-4 h-4 mr-2" />Editar</>}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  {editing ? (
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  ) : (
                    <p className="text-gray-900">{customer.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  {editing ? (
                    <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{customer.email}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  {editing ? (
                    <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{customer.phone || '-'}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <p className="text-gray-900">{customer.cpf || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enderecos" className="mt-6">
          {addresses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum endereço cadastrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr: any) => (
                <Card key={addr.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">{addr.label || 'Endereço'}</p>
                          <p className="text-sm text-gray-500">{addr.street}, {addr.number}</p>
                          {addr.complement && <p className="text-sm text-gray-500">{addr.complement}</p>}
                          <p className="text-sm text-gray-500">{addr.neighborhood} - {addr.city}/{addr.state}</p>
                          <p className="text-sm text-gray-500">CEP: {addr.zipCode}</p>
                        </div>
                      </div>
                      {addr.isDefault && (
                        <Badge className="bg-[#16a34a]/10 text-[#16a34a] border-0">Principal</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
