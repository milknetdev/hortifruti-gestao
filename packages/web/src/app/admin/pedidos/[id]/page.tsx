'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  CreditCard as CreditCardIcon,
  PackageCheck,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const orderData = {
  id: '#1234',
  status: 'Pago',
  data: '28/06/2026 às 14:30',
  cliente: {
    nome: 'Maria Silva',
    email: 'maria@email.com',
    telefone: '(11) 99999-8888',
    cpf: '123.456.789-00',
  },
  itens: [
    { nome: 'Tomate Italiano (kg)', quantidade: 2, preco: 'R$ 8,90', subtotal: 'R$ 17,80' },
    { nome: 'Banana Prata (kg)', quantidade: 1.5, preco: 'R$ 6,50', subtotal: 'R$ 9,75' },
    { nome: 'Maçã Fuji (kg)', quantidade: 1, preco: 'R$ 12,90', subtotal: 'R$ 12,90' },
    { nome: 'Alface Americana (un)', quantidade: 2, preco: 'R$ 4,50', subtotal: 'R$ 9,00' },
    { nome: 'Cenoura (kg)', quantidade: 0.8, preco: 'R$ 5,90', subtotal: 'R$ 4,72' },
  ],
  endereco: {
    rua: 'Rua das Flores, 123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    cep: '01234-567',
    complemento: 'Apto 42',
  },
  pagamento: {
    metodo: 'Cartão de Crédito',
    bandeira: 'Visa',
    final: '4321',
    parcelas: 3,
    total: 'R$ 127,50',
    frete: 'R$ 8,00',
    desconto: 'R$ 0,00',
  },
  timeline: [
    { status: 'Pedido Realizado', data: '28/06/2026 14:30', icon: Package, done: true },
    { status: 'Pagamento Confirmado', data: '28/06/2026 14:32', icon: CreditCardIcon, done: true },
    { status: 'Separando Pedido', data: '', icon: Clock, done: false },
    { status: 'Saiu para Entrega', data: '', icon: Truck, done: false },
    { status: 'Entregue', data: '', icon: CheckCircle2, done: false },
  ],
};

const statusOptions = ['Pendente', 'Pago', 'Separando', 'Saiu para Entrega', 'Entregue', 'Cancelado'];

export default function PedidoDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(orderData.status);
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedido {orderData.id}</h1>
          <p className="text-gray-500">{orderData.data}</p>
        </div>
        <Badge className="ml-auto bg-blue-100 text-blue-700 border-0 text-sm">
          {currentStatus}
        </Badge>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
            {orderData.timeline.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        step.done
                          ? 'bg-[#16a34a] text-white'
                          : 'bg-gray-100 text-gray-400'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className={cn('text-xs mt-2 text-center max-w-[100px]', step.done ? 'text-gray-900' : 'text-gray-400')}>
                      {step.status}
                    </p>
                    {step.data && <p className="text-xs text-gray-500">{step.data}</p>}
                  </div>
                  {i < orderData.timeline.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 w-16 mx-2 mt-[-20px]',
                        step.done ? 'bg-[#16a34a]' : 'bg-gray-200'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Atualizar Status:</span>
            <Select value={currentStatus} onValueChange={setCurrentStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="bg-[#16a34a] hover:bg-[#15803d]">Salvar</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Itens do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Produto</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">Qtd</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Preço</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orderData.itens.map((item, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 text-sm text-gray-900">{item.nome}</td>
                    <td className="py-3 text-sm text-gray-600 text-center">{item.quantidade}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">{item.preco}</td>
                    <td className="py-3 text-sm font-medium text-gray-900 text-right">{item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Separator className="my-4" />

            <div className="space-y-2 text-right">
              <div className="flex justify-end gap-8">
                <span className="text-sm text-gray-500">Subtotal:</span>
                <span className="text-sm font-medium">R$ 54,17</span>
              </div>
              <div className="flex justify-end gap-8">
                <span className="text-sm text-gray-500">Frete:</span>
                <span className="text-sm font-medium">{orderData.pagamento.frete}</span>
              </div>
              <div className="flex justify-end gap-8">
                <span className="text-sm text-gray-500">Desconto:</span>
                <span className="text-sm font-medium text-green-600">{orderData.pagamento.desconto}</span>
              </div>
              <Separator />
              <div className="flex justify-end gap-8">
                <span className="text-base font-bold text-gray-900">Total:</span>
                <span className="text-base font-bold text-[#16a34a]">{orderData.pagamento.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium text-gray-900">{orderData.cliente.nome}</p>
              <p className="text-sm text-gray-500">{orderData.cliente.email}</p>
              <p className="text-sm text-gray-500">{orderData.cliente.telefone}</p>
              <p className="text-sm text-gray-500">CPF: {orderData.cliente.cpf}</p>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <CardTitle className="text-base">Endereço de Entrega</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{orderData.endereco.rua}</p>
              <p className="text-sm text-gray-500">{orderData.endereco.complemento}</p>
              <p className="text-sm text-gray-500">{orderData.endereco.bairro} - {orderData.endereco.cidade}</p>
              <p className="text-sm text-gray-500">CEP: {orderData.endereco.cep}</p>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <CardTitle className="text-base">Pagamento</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm text-gray-700">{orderData.pagamento.metodo}</p>
              <p className="text-sm text-gray-500">
                {orderData.pagamento.bandeira} •••• {orderData.pagamento.final}
              </p>
              <p className="text-sm text-gray-500">{orderData.pagamento.parcelas}x sem juros</p>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Adicione observações sobre este pedido..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
              <Button variant="outline" size="sm" className="mt-2">
                Salvar Observação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}