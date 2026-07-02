'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const products = [
  { id: 1, imagem: '🍅', nome: 'Tomate Italiano', sku: 'TOM-001', preco: 'R$ 8,90/kg', estoque: 45, status: 'Ativo', categoria: 'Hortaliças' },
  { id: 2, imagem: '🍌', nome: 'Banana Prata', sku: 'BAN-001', preco: 'R$ 6,50/kg', estoque: 120, status: 'Ativo', categoria: 'Frutas' },
  { id: 3, imagem: '🍎', nome: 'Maçã Fuji', sku: 'MAC-001', preco: 'R$ 12,90/kg', estoque: 8, status: 'Ativo', categoria: 'Frutas' },
  { id: 4, imagem: '🥬', nome: 'Alface Americana', sku: 'ALA-001', preco: 'R$ 4,50/un', estoque: 30, status: 'Ativo', categoria: 'Hortaliças' },
  { id: 5, imagem: '🥕', nome: 'Cenoura', sku: 'CEN-001', preco: 'R$ 5,90/kg', estoque: 65, status: 'Ativo', categoria: 'Legumes' },
  { id: 6, imagem: '🍋', nome: 'Limão Tahiti', sku: 'LIM-001', preco: 'R$ 4,90/kg', estoque: 0, status: 'Inativo', categoria: 'Frutas' },
  { id: 7, imagem: '🥒', nome: 'Pepino', sku: 'PEP-001', preco: 'R$ 6,90/kg', estoque: 25, status: 'Ativo', categoria: 'Legumes' },
  { id: 8, imagem: '🌶️', nome: 'Pimentão Vermelho', sku: 'PIM-001', preco: 'R$ 14,90/kg', estoque: 15, status: 'Ativo', categoria: 'Legumes' },
];

const categories = ['Todas', 'Frutas', 'Hortaliças', 'Legumes', 'Temperos', 'Orgânicos'];

export default function ProdutosPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('Todas');

  const filteredProducts = category === 'Todas'
    ? products
    : products.filter((p) => p.categoria === category);

  const columns: Column<any>[] = [
    {
      key: 'imagem',
      label: '',
      className: 'w-12',
      render: (value) => <span className="text-2xl">{value}</span>,
    },
    { key: 'nome', label: 'Nome', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'preco', label: 'Preço', sortable: true },
    {
      key: 'estoque',
      label: 'Estoque',
      sortable: true,
      render: (value) => (
        <span className={cn(value <= 10 ? 'text-red-600 font-medium' : 'text-gray-700')}>
          {value} un
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge
          className={cn(
            'border-0',
            value === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'acoes',
      label: 'Ações',
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
            className="text-red-600 hover:text-red-700"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-500">Gerencie o catálogo de produtos</p>
        </div>
        <Button
          className="bg-[#16a34a] hover:bg-[#15803d]"
          onClick={() => router.push('/admin/produtos/novo')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={filteredProducts}
            searchable
            searchPlaceholder="Pesquisar por nome ou SKU..."
            page={page}
            totalPages={2}
            totalItems={filteredProducts.length * 2}
            onPageChange={setPage}
            onRowClick={(row) => router.push(`/admin/produtos/${row.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}