'use client';

import { useState, useEffect } from 'react';
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
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const roleColors: Record<string, string> = {
  'Administrador': 'bg-purple-100 text-purple-700',
  'Vendedor': 'bg-blue-100 text-blue-700',
  'Caixa': 'bg-green-100 text-green-700',
  'Estoquista': 'bg-orange-100 text-orange-700',
  'Entregador': 'bg-yellow-100 text-yellow-700',
  'admin': 'bg-purple-100 text-purple-700',
  'seller': 'bg-blue-100 text-blue-700',
  'cashier': 'bg-green-100 text-green-700',
  'stock': 'bg-orange-100 text-orange-700',
  'delivery': 'bg-yellow-100 text-yellow-700',
};

const statusColors: Record<string, string> = {
  'Ativo': 'bg-green-100 text-green-700',
  'Inativo': 'bg-red-100 text-red-700',
  'active': 'bg-green-100 text-green-700',
  'inactive': 'bg-red-100 text-red-700',
};

export default function EquipePage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role: '',
    senha: '',
  });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const { data: result } = await api.get('/users?limit=100');
      setTeam(Array.isArray(result.data) ? result.data : []);
    } catch {
      setTeam([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nome: user.name || user.nome || '',
        email: user.email || '',
        role: user.role || '',
        senha: '',
      });
    } else {
      setEditingUser(null);
      setFormData({ nome: '', email: '', role: '', senha: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome.trim() || !formData.email.trim()) {
      toast.error('Nome e email são obrigatórios');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: formData.nome,
        email: formData.email,
        role: formData.role,
      };
      if (formData.senha) payload.password = formData.senha;

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
        toast.success('Membro atualizado!');
      } else {
        await api.post('/users', payload);
        toast.success('Membro adicionado!');
      }
      setDialogOpen(false);
      fetchTeam();
    } catch {
      toast.error('Erro ao salvar membro');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este membro?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Membro removido!');
      fetchTeam();
    } catch {
      toast.error('Erro ao remover membro');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#16a34a] text-white text-xs">
              {(value || row.nome || '?').charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">{value || row.nome}</p>
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
        <Badge className={cn('border-0', roleColors[value] || 'bg-gray-100 text-gray-700')}>{value}</Badge>
      ),
    },
    {
      key: 'lastLoginAt',
      label: 'Último Login',
      render: (v) => v ? new Date(v).toLocaleString('pt-BR') : '-',
    },
    {
      key: 'active',
      label: 'Status',
      render: (value, row) => {
        const isActive = value !== undefined ? value : (row.status === 'Ativo');
        return (
          <Badge className={cn('border-0', isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
            {isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        );
      },
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenDialog(row); }}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>
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
            totalPages={Math.ceil(team.length / 15) || 1}
            totalItems={team.length}
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
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="seller">Vendedor</SelectItem>
                  <SelectItem value="cashier">Caixa</SelectItem>
                  <SelectItem value="stock">Estoquista</SelectItem>
                  <SelectItem value="delivery">Entregador</SelectItem>
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
              <Button className="bg-[#16a34a] hover:bg-[#15803d]" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
