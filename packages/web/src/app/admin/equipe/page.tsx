'use client';

import { useState } from 'react';
import { DataTable, Column } from '@/components/admin/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const team = [
  { id: 1, nome: 'Admin Master', email: 'admin@hortifruti.com', role: 'Administrador', ultimoLogin: '28/06/2026 14:30', status: 'Ativo' },
  { id: 2, nome: 'João Vendedor', email: 'joao@hortifruti.com', role: 'Vendedor', ultimoLogin: '28/06/2026 10:15', status: 'Ativo' },
  { id: 3, nome: 'Maria Caixa', email: 'maria@hortifruti.com', role: 'Caixa', ultimoLogin: '27/06/2026 18:00', status: 'Ativo' },
  { id: 4, nome: 'Pedro Estoque', email: 'pedro@hortifruti.com', role: 'Estoquista', ultimoLogin: '26/06/2026 09:30', status: 'Ativo' },
  { id: 5, nome: 'Ana Entregadora', email: 'ana@hortifruti.com', role: 'Entregador', ultimoLogin: '25/06/2026 16:45', status: 'Inativo' },
];

const roleColors: Record<string, string> = {
  'Administrador': 'bg-purple-100 text-purple-700',
  'Vendedor': 'bg-blue-100 text-blue-700',
  'Caixa': 'bg-green-100 text-green-700',
  'Estoquista': 'bg-orange-100 text-orange-700',
  'Entregador': 'bg-yellow-100 text-yellow-700',
};

const statusColors: Record<string, string> = {
  'Ativo': 'bg-green-100 text-green-700',
  'Inativo': 'bg-red-100 text-red-700',
};

export default function EquipePage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role: '',
    senha: '',
  });

  const handleOpenDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setFormData({ nome: user.nome, email: user.email, role: user.role.toLowerCase(), senha: '' });
    } else {
      setEditingUser(null);
      setFormData({ nome: '', email: '', role: '', senha: '' });
    }
    setDialogOpen(true);
  };

  const columns: Column<any>[] = [
    {
      key: 'nome',
      label: 'Nome',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#16a34a] text-white text-xs">
              {value.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', label: 'E-mail', className: 'hidden' },
    {
      key: 'role',
      label: 'Cargo',
      render: (value) => (
        <Badge className={cn('border-0', roleColors[value])}>{value}</Badge>
      ),
    },
    { key: 'ultimoLogin', label: 'Último Login' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge className={cn('border-0', statusColors[value])}>{value}</Badge>
      ),
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenDialog(row); }}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={(e) => e.stopPropagation()}>
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
          <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
          <p className="text-gray-500">Gerencie os membros da equipe</p>
        </div>
        <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Membro
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={team}
            searchable
            searchPlaceholder="Pesquisar por nome ou e-mail..."
            page={page}
            totalPages={2}
            totalItems={team.length * 2}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Membro' : 'Novo Membro'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@hortifruti.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="caixa">Caixa</SelectItem>
                  <SelectItem value="estoquista">Estoquista</SelectItem>
                  <SelectItem value="entregador">Entregador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{editingUser ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}</Label>
              <Input
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-[#16a34a] hover:bg-[#15803d]">Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}