'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, HelpCircle, RefreshCw, Truck, Shield, Calendar, CreditCard, Package, ChevronDown, ChevronUp, Eye } from 'lucide-react';

import toast from 'react-hot-toast';

interface Faq {
  id: string;
  question: string;
  answer: string;
  icon: string;
  sortOrder: number;
  active: boolean;
}

const iconOptions = [
  { value: 'help-circle', label: 'Ajuda', icon: HelpCircle },
  { value: 'truck', label: 'Entrega', icon: Truck },
  { value: 'refresh-cw', label: 'Troca', icon: RefreshCw },
  { value: 'shield', label: 'Seguranca', icon: Shield },
  { value: 'calendar', label: 'Agendamento', icon: Calendar },
  { value: 'credit-card', label: 'Pagamento', icon: CreditCard },
  { value: 'package', label: 'Pacote', icon: Package },
];

function getIcon(iconName: string) {
  const found = iconOptions.find(i => i.value === iconName);
  return found ? found.icon : HelpCircle;
}

export default function SacPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    icon: 'help-circle',
    sortOrder: 0,
    active: true,
  });

  const fetchFaqs = async () => {
    try {
      const { data: result } = await api.get('/faqs/admin');
      const faqsData = result?.data?.data || result?.data || result || [];
      setFaqs(Array.isArray(faqsData) ? faqsData : []);
    } catch {
      toast.error('Erro ao carregar FAQ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenDialog = (faq?: Faq) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        icon: faq.icon,
        sortOrder: faq.sortOrder,
        active: faq.active,
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: '',
        answer: '',
        icon: 'help-circle',
        sortOrder: faqs.length,
        active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.question || !formData.answer) {
      toast.error('Preencha pergunta e resposta');
      return;
    }

    try {
      if (editingFaq) {
        await api.put(`/faqs/${editingFaq.id}`, formData);
        toast.success('FAQ atualizado!');
      } else {
        await api.post('/faqs', formData);
        toast.success('FAQ criado!');
      }
      setIsDialogOpen(false);
      fetchFaqs();
    } catch {
      toast.error('Erro ao salvar FAQ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este FAQ?')) return;
    try {
      await api.delete(`/faqs/${id}`);
      toast.success('FAQ removido!');
      fetchFaqs();
    } catch {
      toast.error('Erro ao remover FAQ');
    }
  };

  const handleToggleActive = async (faq: Faq) => {
    try {
      await api.put(`/faqs/${faq.id}`, { active: !faq.active });
      fetchFaqs();
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  if (isLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">SAC / FAQ</h1>
          <p className="text-gray-500">Gerencie as perguntas frequentes exibidas na página de contato</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setIsLoading(true); fetchFaqs(); }} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Pergunta
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => {
          const Icon = getIcon(faq.icon);
          return (
            <Card key={faq.id} className={`${!faq.active ? 'opacity-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-green-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{faq.answer}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">Ordem: {faq.sortOrder}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className={`text-xs ${faq.active ? 'text-green-600' : 'text-red-500'}`}>
                        {faq.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={faq.active}
                      onCheckedChange={() => handleToggleActive(faq)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(faq)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(faq.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {faqs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma pergunta cadastrada</p>
            <Button onClick={() => handleOpenDialog()} className="mt-4 bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira pergunta
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Editar Pergunta' : 'Nova Pergunta'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Pergunta *</Label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Ex: Qual o prazo de entrega?"
              />
            </div>
            <div className="space-y-2">
              <Label>Resposta *</Label>
              <Textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Digite a resposta completa..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Ícone</Label>
                <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ordem</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2 flex items-end">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(v) => setFormData({ ...formData, active: v })}
                  />
                  <Label>Ativo</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                {editingFaq ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Section */}
      {faqs.length > 0 && (
        <Card className="border-dashed border-2 border-green-200 bg-green-50/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg">Preview</CardTitle>
            </div>
            <p className="text-sm text-gray-500">Assim vai aparecer na página de contato</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-w-2xl">
              {faqs.filter(f => f.active).sort((a, b) => a.sortOrder - b.sortOrder).map((faq) => {
                const Icon = getIcon(faq.icon);
                const isExpanded = expandedPreview === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-lg border overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedPreview(isExpanded ? null : faq.id)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-green-700" />
                      </div>
                      <span className="flex-1 font-medium text-gray-900 text-sm">{faq.question}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 pl-15">
                        <p className="text-sm text-gray-600 leading-relaxed ml-11">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
