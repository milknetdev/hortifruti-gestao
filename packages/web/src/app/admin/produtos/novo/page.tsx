'use client';

import { useState, useEffect } from 'react';
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
import { ArrowLeft, Upload, X, Loader2, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z.string().optional(),
  sku: z.string().optional(),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  costPrice: z.string().min(1, 'Preço de custo é obrigatório'),
  salePrice: z.string().min(1, 'Preço de venda é obrigatório'),
  promotionalPrice: z.string().optional(),
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

interface Category {
  id: string;
  name: string;
}

export default function NovoProdutoPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [searchImages, setSearchImages] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageResults, setImageResults] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      unit: 'KG',
      available: true,
      featured: false,
      promotional: false,
      minStock: '10',
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: result } = await api.get('/categories');
      const cats = result?.data || result || [];
      setCategories(Array.isArray(cats) ? cats : []);
    } catch {
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        costPrice: parseFloat(data.costPrice),
        salePrice: parseFloat(data.salePrice),
        promotionalPrice: data.promotionalPrice ? parseFloat(data.promotionalPrice) : null,
        stock: parseInt(data.stock),
        minStock: parseInt(data.minStock),
        weight: data.weight ? parseFloat(data.weight) : null,
        mainImage: images[0] || null,
        images: JSON.stringify(images),
      };

      await api.post('/products', payload);
      toast.success('Produto criado com sucesso!');
      router.push('/admin/produtos');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erro ao criar produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

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
                <Input id="name" {...register('name')} placeholder="Ex: Banana Prata" />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (gerado automaticamente)</Label>
                <Input id="slug" {...register('slug')} placeholder="banana-prata" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" {...register('sku')} placeholder="BAN-001" />
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={watch('categoryId')} onValueChange={(v) => setValue('categoryId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={categories.find(c => c.id === watch('categoryId'))?.name || 'Selecione uma categoria'} />
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
                <Label>Unidade *</Label>
                <Select value={watch('unit')} onValueChange={(v) => setValue('unit', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KG">Quilograma (kg)</SelectItem>
                    <SelectItem value="UN">Unidade (un)</SelectItem>
                    <SelectItem value="G">Grama (g)</SelectItem>
                    <SelectItem value="CX">Caixa (cx)</SelectItem>
                    <SelectItem value="L">Litro (L)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Imagens</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const name = watch('name');
                    if (!name) {
                      toast.error('Preencha o nome do produto primeiro');
                      return;
                    }
                    setSearchImages(true);
                    try {
                      const { data: result } = await api.get(`/images/search?query=${encodeURIComponent(name)}`);
                      if (result?.data?.length > 0) {
                        setImageResults(result.data);
                        setShowImageModal(true);
                      }
                    } catch {
                      toast.error('Erro ao buscar imagens');
                    } finally {
                      setSearchImages(false);
                    }
                  }}
                  disabled={searchImages}
                >
                  {searchImages ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Buscando...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />Buscar Automático</>
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
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
              <Textarea id="description" {...register('description')} rows={4} placeholder="Descreva o produto..." />
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
                <Input id="costPrice" {...register('costPrice')} type="number" step="0.01" placeholder="0.00" />
                {errors.costPrice && <p className="text-sm text-red-500">{errors.costPrice.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Preço de Venda *</Label>
                <Input id="salePrice" {...register('salePrice')} type="number" step="0.01" placeholder="0.00" />
                {errors.salePrice && <p className="text-sm text-red-500">{errors.salePrice.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotionalPrice">Preço Promocional</Label>
                <Input id="promotionalPrice" {...register('promotionalPrice')} type="number" step="0.01" placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Estoque Atual *</Label>
                <Input id="stock" {...register('stock')} type="number" placeholder="0" />
                {errors.stock && <p className="text-sm text-red-500">{errors.stock.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Estoque Mínimo *</Label>
                <Input id="minStock" {...register('minStock')} type="number" placeholder="10" />
                {errors.minStock && <p className="text-sm text-red-500">{errors.minStock.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso</Label>
                <Input id="weight" {...register('weight')} type="number" step="0.01" placeholder="0.00" />
              </div>
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
              <Switch checked={watch('available')} onCheckedChange={(v) => setValue('available', v)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Produto em Destaque</p>
                <p className="text-sm text-gray-500">Aparecerá na seção de destaque da loja</p>
              </div>
              <Switch checked={watch('featured')} onCheckedChange={(v) => setValue('featured', v)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Produto Promocional</p>
                <p className="text-sm text-gray-500">Aparecerá na seção de ofertas da loja</p>
              </div>
              <Switch checked={watch('promotional')} onCheckedChange={(v) => setValue('promotional', v)} />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" className="bg-[#16a34a] hover:bg-[#15803d]" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando...</> : 'Criar Produto'}
          </Button>
        </div>
      </form>

      {/* Image Selection Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Selecionar Imagem</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowImageModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-3 gap-4">
                {imageResults.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 border-transparent hover:border-green-500 transition-all"
                    onClick={() => {
                      setImages([...images, img.url]);
                      setShowImageModal(false);
                      toast.success('Imagem adicionada!');
                    }}
                  >
                    <img src={img.thumb} alt={img.alt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 bg-green-500 text-white rounded-full p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
