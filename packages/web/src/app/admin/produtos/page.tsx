'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  sku?: string;
  salePrice: number;
  stock: number;
  active: boolean;
  category?: { name: string };
  supplier?: { id: string; name: string };
  mainImage?: string;
}

export default function ProdutosPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('Todas');
  const [categories, setCategories] = useState<string[]>(['Todas']);
  const [selectedSupplier, setSelectedSupplier] = useState('Todos');
  const [suppliers, setSuppliers] = useState<string[]>(['Todos']);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: result } = await api.get('/products?limit=100');
      setProducts(Array.isArray(result.data) ? result.data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data: result } = await api.get('/suppliers');
      const data = result?.data?.data || result?.data || [];
      const supps = Array.isArray(data) ? data : [];
      setSuppliers(['Todos', ...supps.map((s: any) => s.name)]);
    } catch {
      setSuppliers(['Todos']);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data: result } = await api.get('/categories');
      const cats = Array.isArray(result.data) ? result.data : [];
      setCategories(['Todas', ...cats.map((c: any) => c.name)]);
    } catch {
      setCategories(['Todas']);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Produto removido!');
      fetchProducts();
    } catch {
      toast.error('Erro ao remover produto');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCategory = category === 'Todas' || p.category?.name === category;
    const matchSupplier = selectedSupplier === 'Todos' || p.supplier?.name === selectedSupplier;
    return matchCategory && matchSupplier;
  });

  const columns: Column<any>[] = [
    {
      key: 'mainImage',
      label: '',
      className: 'w-12',
      render: (value, row) => value ? (
        <img src={value} alt={row.name} className="w-10 h-10 rounded object-cover" />
      ) : (
        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">📷</div>
      ),
    },
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    {
      key: 'salePrice',
      label: 'Preço',
      sortable: true,
      render: (value) => `R$ ${Number(value).toFixed(2)}`,
    },
    {
      key: 'stock',
      label: 'Estoque',
      sortable: true,
      render: (value) => (
        <span className={cn(value <= 10 ? 'text-red-600 font-medium' : 'text-gray-700')}>
          {value} un
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'} className={value ? 'bg-green-100 text-green-700' : ''}>
          {value ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/produtos/${row.id}`);
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-500">{products.length} produtos cadastrados</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((sup) => (
                <SelectItem key={sup} value={sup}>{sup}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="bg-[#16a34a] hover:bg-[#15803d]"
            onClick={() => router.push('/admin/produtos/novo')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            data={filteredProducts}
            columns={columns}
            pageSize={15}
            page={page}
            totalPages={Math.ceil(filteredProducts.length / 15)}
            totalItems={filteredProducts.length}
            onPageChange={setPage}
            onRowClick={(row) => router.push(`/admin/produtos/${row.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
