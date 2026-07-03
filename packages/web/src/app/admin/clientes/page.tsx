'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  totalSpent?: number;
  active: boolean;
  createdAt: string;
}

export default function ClientesPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data: result } = await api.get('/customers?limit=100');
      setCustomers(Array.isArray(result.data) ? result.data : []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<any>[] = [
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'email', label: 'E-mail' },
    { key: 'phone', label: 'Telefone', render: (value) => value || '-' },
    { key: 'cpf', label: 'CPF', render: (value) => value || '-' },
    {
      key: 'totalSpent',
      label: 'Total Gasto',
      sortable: true,
      render: (value) => `R$ ${Number(value || 0).toFixed(2)}`,
    },
    {
      key: 'active',
      label: 'Status',
      render: (value) => (
        <Badge
          className={cn(
            'border-0',
            value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          )}
        >
          {value ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/clientes/${row.id}`)}
        >
          <Eye className="w-4 h-4" />
        </Button>
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-sm text-gray-500">{customers.length} clientes cadastrados</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            data={customers}
            columns={columns}
            pageSize={15}
            currentPage={page}
            totalPages={Math.ceil(customers.length / 15)}
            totalItems={customers.length}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
