'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

const customerData = {
  id: 1,
  nome: 'Maria Silva',
  email: 'maria@email.com',
  telefone: '(11) 99999-8888',
  cpf: '123.456.789-00',
  dataNascimento: '15/03/1990',
  dataCadastro: '10/01/2025',
  status: 'Ativo',
  totalGasto: 'R$ 1.250,00',
  totalPedidos: 15,
  enderecos: [
    { id: 1, principal: true, rua: 'Rua das Flores, 123', bairro: 'Centro', cidade: 'São Paulo', cep: '01234-567', complemento: 'Apto 42' },
    { id: 2, principal: false, rua: 'Av. Paulista, 1000', bairro: 'Bela Vista', cidade: 'São Paulo', cep: '01310-100', complemento: 'Sala 501' },
  ],
  pedidosRecentes: [
    { id: '#1234', data: '28/06/2026', total: 'R$ 127,50', status: 'Pago' },
    { id: '#1220', data: '20/06/2026', total: 'R$ 89,90', status: 'Entregue' },
    { id: '#1205', data: '12/06/2026', total: 'R$ 234,00', status: 'Entregue' },
    { id: '#1190', data: '05/06/2026', total: 'R$ 56,70', status: 'Entregue' },
  ],
  favoritos: [
    { nome: 'Tomate Italiano', preco: 'R$ 8,90/kg' },
    { nome: 'Banana Prata', preco: 'R$ 6,50/kg' },
    { nome: 'Maçã Fuji', preco: 'R$ 12,90/kg' },
  ],
};

const statusColors: Record<string, string> = {
  'Pago': 'bg-blue-100 text-blue-700',
  'Entregue': 'bg-green-100 text-green-700',
  'Pendente': 'bg-yellow-100 text-yellow-700',
  'Cancelado': 'bg-red-100 text-red-700',
};

export default function ClienteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: customerData.nome,
    email: customerData.email,
    telefone: customerData.telefone,
    cpf: customerData.cpf,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{customerData.nome}</h1>
          <p className="text-gray-500">Cliente desde {customerData.dataCadastro}</p>
        </div>
        <Badge className="ml-auto bg-green-100 text-green-700 border-0">{customerData.status}</Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Total Gasto</p>
            <p className="text-2xl font-bold text-[#16a34a]">{customerData.totalGasto}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Total de Pedidos</p>
            <p className="text-2xl font-bold text-gray-900">{customerData.totalPedidos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-500">Ticket Médio</p>
            <p className="text-2xl font-bold text-gray-900">R$ 83,33</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="enderecos">Endereços</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Dados Pessoais</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editing ? setEditing(false) : setEditing(true)}
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
                    <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
                  ) : (
                    <p className="text-gray-900">{customerData.nome}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  {editing ? (
                    <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{customerData.email}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  {editing ? (
                    <Input value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{customerData.telefone}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <p className="text-gray-900">{customerData.cpf}</p>
                </div>
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <p className="text-gray-900">{customerData.dataNascimento}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enderecos" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerData.enderecos.map((end) => (
              <Card key={end.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{end.rua}</p>
                        <p className="text-sm text-gray-500">{end.complemento}</p>
                        <p className="text-sm text-gray-500">{end.bairro} - {end.cidade}</p>
                        <p className="text-sm text-gray-500">CEP: {end.cep}</p>
                      </div>
                    </div>
                    {end.principal && (
                      <Badge className="bg-[#16a34a]/10 text-[#16a34a] border-0">Principal</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pedidos" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">#</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Data</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerData.pedidosRecentes.map((pedido) => (
                    <tr key={pedido.id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{pedido.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{pedido.data}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{pedido.total}</td>
                      <td className="px-4 py-3">
                        <Badge className={cn('border-0', statusColors[pedido.status])}>
                          {pedido.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favoritos" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customerData.favoritos.map((fav, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                  <div>
                    <p className="font-medium text-gray-900">{fav.nome}</p>
                    <p className="text-sm text-gray-500">{fav.preco}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}