'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  sku: z.string().min(1, 'SKU é obrigatório'),
  barcode: z.string().optional(),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  supplierId: z.string().optional(),
  costPrice: z.string().min(1, 'Preço de custo é obrigatório'),
  salePrice: z.string().min(1, 'Preço de venda é obrigatório'),
  promotionalPrice: z.string().optional(),
  commissionValue: z.string().optional(),
  stock: z.string().min(1, 'Estoque é obrigatório'),
  minStock: z.string().min(1, 'Estoque mínimo é obrigatório'),
  weight: z.string().optional(),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  description: z.string().optional(),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
  promotional: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

const categories = [
  { id: '1', name: 'Frutas' },
  { id: '2', name: 'Hortaliças' },
  { id: '3', name: 'Legumes' },
  { id: '4', name: 'Temperos' },
  { id: '5', name: 'Orgânicos' },
];

const suppliers = [
  { id: '1', name: 'Fazenda São João' },
  { id: '2', name: 'Distribuidora Verde' },
  { id: '3', name: 'Horta Orgânica SP' },
];

const units = [
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 'g', label: 'Grama (g)' },
  { value: 'un', label: 'Unidade (un)' },
  { value: 'cx', label: 'Caixa (cx)' },
  { value: 'dz', label: 'Dúzia (dz)' },
  { value: 'maço', label: 'Maço' },
  { value: 'litro', label: 'Litro (L)' },
];

export default function NovoProdutoPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      available: true,
      featured: false,
      promotional: false,
      unit: 'kg',
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Product data:', data);
      router.push('/admin/produtos');
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Produto</h1>
          <p className="text-gray-500">Adicione um novo produto ao catálogo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input id="name" {...register('name')} placeholder="Ex: Tomate Italiano" />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" {...register('slug')} placeholder="tomate-italiano" />
                {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" {...register('sku')} placeholder="TOM-001" />
                {errors.sku && <p className="text-sm text-red-500">{errors.sku.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input id="barcode" {...register('barcode')} placeholder="7891234567890" />
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select onValueChange={(v) => setValue('categoryId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Select onValueChange={(v) => setValue('supplierId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>Imagens</Label>
              <div className="flex items-center gap-4">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                    <img src={img} alt={`Imagem ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        const { data: result } = await api.post('/upload', formData, {
                          headers: { 'Content-Type': 'multipart/form-data' },
                        });
                        if (result?.data?.url) {
                          setImages([...images, result.data.url]);
                          toast.success('Imagem enviada!');
                        }
                      } catch {
                        toast.error('Erro ao enviar imagem');
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descreva o produto..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preços e Estoque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Preço de Custo *</Label>
                <Input id="costPrice" {...register('costPrice')} placeholder="0.00" type="number" step="0.01" />
                {errors.costPrice && <p className="text-sm text-red-500">{errors.costPrice.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Preço de Venda *</Label>
                <Input id="salePrice" {...register('salePrice')} placeholder="0.00" type="number" step="0.01" />
                {errors.salePrice && <p className="text-sm text-red-500">{errors.salePrice.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotionalPrice">Preço Promocional</Label>
                <Input id="promotionalPrice" {...register('promotionalPrice')} placeholder="0.00" type="number" step="0.01" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Estoque Atual *</Label>
                <Input id="stock" {...register('stock')} placeholder="0" type="number" />
                {errors.stock && <p className="text-sm text-red-500">{errors.stock.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Estoque Mínimo *</Label>
                <Input id="minStock" {...register('minStock')} placeholder="0" type="number" />
                {errors.minStock && <p className="text-sm text-red-500">{errors.minStock.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso</Label>
                <Input id="weight" {...register('weight')} placeholder="0.00" type="number" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label>Unidade *</Label>
                <Select onValueChange={(v) => setValue('unit', v)} defaultValue="kg">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionValue">Valor de Comissão</Label>
              <Input id="commissionValue" {...register('commissionValue')} placeholder="0.00" type="number" step="0.01" className="max-w-[200px]" />
            </div>
          </CardContent>
        </Card>

        {/* Toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Produto Disponível</p>
                <p className="text-sm text-gray-500">O produto estará visível e disponível para compra</p>
              </div>
              <Switch
                checked={watch('available')}
                onCheckedChange={(v) => setValue('available', v)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Produto em Destaque</p>
                <p className="text-sm text-gray-500">Aparecerá na seção de destaque da loja</p>
              </div>
              <Switch
                checked={watch('featured')}
                onCheckedChange={(v) => setValue('featured', v)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Produto Promocional</p>
                <p className="text-sm text-gray-500">Aparecerá na seção de ofertas da loja</p>
              </div>
              <Switch
                checked={watch('promotional')}
                onCheckedChange={(v) => setValue('promotional', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-[#16a34a] hover:bg-[#15803d]" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Produto'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}