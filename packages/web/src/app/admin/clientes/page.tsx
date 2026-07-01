'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const customers = [
  { id: 1, nome: 'Maria Silva', email: 'maria@email.com', telefone: '(11) 99999-8888', cpf: '123.456.789-00', totalGasto: 'R$ 1.250,00', pedidos: 15, status: 'Ativo' },
  { id: 2, nome: 'João Santos', email: 'joao@email.com', telefone: '(11) 98888-7777', cpf: '987.654.321-00', totalGasto: 'R$ 890,50', pedidos: 10, status: 'Ativo' },
  { id: 3, nome: 'Ana Oliveira', email: 'ana@email.com', telefone: '(11) 97777-6666', cpf: '456.789.123-00', totalGasto: 'R$ 2.340,00', pedidos: 28, status: 'Ativo' },
  { id: 4, nome: 'Pedro Costa', email: 'pedro@email.com', telefone: '(11) 96666-5555', cpf: '321.654.987-00', totalGasto: 'R$ 456,80', pedidos: 5, status: 'Inativo' },
  { id: 5, nome: 'Carla Mendes', email: 'carla@email.com', telefone: '(11) 95555-4444', cpf: '789.123.456-00', totalGasto: 'R$ 3.120,00', pedidos: 35, status: 'Ativo' },
  { id: 6, nome: 'Roberto Alves', email: 'roberto@email.com', telefone: '(11) 94444-3333', cpf: '654.987.321-00', totalGasto: 'R$ 678,90', pedidos: 8, status: 'Ativo' },
  { id: 7, nome: 'Fernanda Lima', email: 'fernanda@email.com', telefone: '(11) 93333-2222', cpf: '147.258.369-00', totalGasto: 'R$ 1.890,00', pedidos: 22, status: 'Ativo' },
  { id: 8, nome: 'Carlos Souza', email: 'carlos@email.com', telefone: '(11) 92222-1111', cpf: '369.258.147-00', totalGasto: 'R$ 567,30', pedidos: 7, status: 'Inativo' },
];

export default function ClientesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const columns: Column<any>[] = [
    { key: 'nome', label: 'Nome', sortable: true },
    { key: 'email', label: 'E-mail' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'cpf', label: 'CPF' },
    { key: 'totalGasto', label: 'Total Gasto', sortable: true },
    { key: 'pedidos', label: 'Pedidos', sortable: true },
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
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/clientes/${row.id}`);
          }}
        >
          <Eye className="w-4 h-4 mr-1" />
          Ver
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-500">Gerencie os clientes da loja</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={customers}
            searchable
            searchPlaceholder="Pesquisar por nome, e-mail ou CPF..."
            page={page}
            totalPages={3}
            totalItems={customers.length * 3}
            onPageChange={setPage}
            onRowClick={(row) => router.push(`/clientes/${row.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}