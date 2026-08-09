'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Truck, DollarSign, Check, X, RefreshCw, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface SupplierPayment {
  id: string;
  supplierId: string;
  productId?: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  paid: boolean;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  supplier: { id: string; name: string };
  product?: { id: string; name: string };
}

interface Supplier {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  costPrice: number;
  supplierId?: string;
}

export default function PagamentosFornecedoresPage() {
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterPaid, setFilterPaid] = useState('all');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState({ totalPending: 0, totalPaid: 0, total: 0 });
  const [formData, setFormData] = useState({
    supplierId: '',
    productId: '',
    description: '',
    quantity: '1',
    unitCost: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [payRes, supRes, prodRes] = await Promise.all([
        api.get(`/supplier-payments?startDate=${startDate}&endDate=${endDate}`),
        api.get('/suppliers'),
        api.get('/products?limit=100'),
      ]);
      
      const payData = payRes.data?.data || payRes.data || [];
      setPayments(Array.isArray(payData) ? payData : []);
      setSummary(payRes.data?.summary || { totalPending: 0, totalPaid: 0, total: 0 });
      
      const supData = supRes.data?.data?.data || supRes.data?.data || supRes.data || [];
      setSuppliers(Array.isArray(supData) ? supData : []);
      
      const prodData = prodRes.data?.data || prodRes.data || [];
      setProducts(Array.isArray(prodData) ? prodData : []);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  const handleCreate = async () => {
    if (!formData.supplierId || !formData.description || !formData.unitCost) {
      toast.error('Preencha fornecedor, descrição e custo unitário');
      return;
    }

    try {
      await api.post('/supplier-payments', {
        supplierId: formData.supplierId,
        productId: formData.productId || null,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        unitCost: parseFloat(formData.unitCost),
        notes: formData.notes || null,
      });
      toast.success('Pagamento registrado!');
      setDialogOpen(false);
      setFormData({ supplierId: '', productId: '', description: '', quantity: '1', unitCost: '', notes: '' });
      fetchData();
    } catch {
      toast.error('Erro ao registrar pagamento');
    }
  };

  const handleTogglePaid = async (payment: SupplierPayment) => {
    try {
      if (payment.paid) {
        await api.put(`/supplier-payments/${payment.id}/unpay`);
        toast.success('Marcado como pendente!');
      } else {
        await api.put(`/supplier-payments/${payment.id}/pay`);
        toast.success('Marcado como pago!');
      }
      fetchData();
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pagamento?')) return;
    try {
      await api.delete(`/supplier-payments/${id}`);
      toast.success('Pagamento excluído!');
      fetchData();
    } catch {
      toast.error('Erro ao excluir pagamento');
    }
  };

  const handleSelectProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData({
        ...formData,
        productId: product.id,
        description: product.name,
        unitCost: String(product.costPrice),
        supplierId: product.supplierId || formData.supplierId,
      });
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchSupplier = !filterSupplier || p.supplierId === filterSupplier;
    const matchPaid = filterPaid === 'all' || (filterPaid === 'paid' && p.paid) || (filterPaid === 'pending' && !p.paid);
    return matchSupplier && matchPaid;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Pagamentos a Fornecedores</h1>
          <p className="text-gray-500">Controle de pagamentos por fornecedor</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Pagamento
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pendente</p>
                <p className="text-xl font-bold text-yellow-600">
                  R$ {summary.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pago</p>
                <p className="text-xl font-bold text-green-600">
                  R$ {summary.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold text-blue-600">
                  R$ {summary.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <div className="flex items-center gap-2">
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-36" />
                <span className="text-gray-400">até</span>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-36" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <select
                className="border rounded-md px-3 py-2 text-sm w-48"
                value={filterSupplier}
                onChange={(e) => setFilterSupplier(e.target.value)}
              >
                <option value="">Todos</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="border rounded-md px-3 py-2 text-sm w-36"
                value={filterPaid}
                onChange={(e) => setFilterPaid(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
              </select>
            </div>
            <Button variant="outline" onClick={handleRefresh}>Filtrar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Planilha de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 font-medium">Data</th>
                  <th className="pb-3 font-medium">Fornecedor</th>
                  <th className="pb-3 font-medium">Descrição</th>
                  <th className="pb-3 font-medium text-right">Qtd</th>
                  <th className="pb-3 font-medium text-right">Custo Unit.</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        {payment.supplier?.name || '-'}
                      </div>
                    </td>
                    <td className="py-3">
                      {payment.description}
                      {payment.product && (
                        <span className="text-xs text-gray-400 ml-1">({payment.product.name})</span>
                      )}
                    </td>
                    <td className="py-3 text-right">{payment.quantity}</td>
                    <td className="py-3 text-right">R$ {Number(payment.unitCost).toFixed(2)}</td>
                    <td className="py-3 text-right font-medium">
                      R$ {Number(payment.totalCost).toFixed(2)}
                    </td>
                    <td className="py-3">
                      <button onClick={() => handleTogglePaid(payment)} className="cursor-pointer">
                        <Badge className={cn(
                          'border-0 hover:opacity-80',
                          payment.paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        )}>
                          {payment.paid ? 'Pago' : 'Pendente'}
                        </Badge>
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(payment.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPayments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum pagamento encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Novo Pagamento a Fornecedor</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Fornecedor *</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                >
                  <option value="">Selecione um fornecedor</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Produto (opcional)</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={formData.productId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                >
                  <option value="">Selecione um produto (opcional)</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do pagamento"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custo Unitário (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas opcionais"
                />
              </div>
              {formData.quantity && formData.unitCost && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Total:</p>
                  <p className="text-lg font-bold text-green-600">
                    R$ {(parseInt(formData.quantity) * parseFloat(formData.unitCost)).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">Registrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
