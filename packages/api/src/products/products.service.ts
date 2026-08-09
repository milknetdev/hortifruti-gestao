import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, tenantId: string) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const exists = await this.prisma.product.findFirst({ where: { slug, tenantId } });
    if (exists) throw new ConflictException('Produto com este slug já existe');
    if (data.costPrice && data.salePrice) {
      data.profitMargin = ((data.salePrice - data.costPrice) / data.costPrice * 100).toFixed(2);
    }
    return this.prisma.product.create({ data: { ...data, slug, tenantId } });
  }

  async findAll(tenantId: string, query: any) {
    // Se não enviou tenantId, pega o primeiro tenant
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      if (tenant) tenantId = tenant.id;
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const where: any = { tenantId, active: true };
    if (query.search) where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { sku: { contains: query.search, mode: 'insensitive' } },
    ];
    if (query.categoryId) where.categoryId = query.categoryId;
    
    // Filter by category slug
    if (query.category && !query.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { slug: query.category, tenantId },
      });
      if (category) where.categoryId = category.id;
    }
    
    if (query.featured !== undefined) where.featured = query.featured === 'true';
    if (query.promotional !== undefined) where.promotional = query.promotional === 'true';

    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'price_asc') orderBy = { salePrice: 'asc' };
    if (query.sort === 'price_desc') orderBy = { salePrice: 'desc' };
    if (query.sort === 'name') orderBy = { name: 'asc' };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({ where, skip, take: limit, orderBy, include: { category: { select: { id: true, name: true, slug: true } }, supplier: { select: { id: true, name: true } } } }),
      this.prisma.product.count({ where }),
    ]);
    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findFeatured(tenantId: string, limit = 8) {
    // Se não enviou tenantId, pega o primeiro tenant
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      if (tenant) tenantId = tenant.id;
    }

    return this.prisma.product.findMany({ where: { tenantId, featured: true, active: true, available: true }, take: limit, include: { category: true } });
  }

  async findPromotional(tenantId: string, limit = 8) {
    // Se não enviou tenantId, pega o primeiro tenant
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      if (tenant) tenantId = tenant.id;
    }

    return this.prisma.product.findMany({ where: { tenantId, promotional: true, active: true, available: true }, take: limit, include: { category: true } });
  }

  async findBestSellers(tenantId: string, limit = 8) {
    // Se não enviou tenantId, pega o primeiro tenant
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      if (tenant) tenantId = tenant.id;
    }

    return this.prisma.product.findMany({ where: { tenantId, active: true, available: true }, take: limit, include: { category: true } });
  }

  async findOne(id: string, tenantId?: string) {
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    const product = await this.prisma.product.findFirst({ where, include: { category: true, supplier: true } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  async findBySlug(slug: string, tenantId: string) {
    // Se não enviou tenantId, pega o primeiro tenant
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      if (tenant) tenantId = tenant.id;
    }

    const product = await this.prisma.product.findFirst({ where: { slug, tenantId, active: true }, include: { category: true } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  async update(id: string, data: any, tenantId: string) {
    // Resolve tenantId if empty
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      if (tenant) tenantId = tenant.id;
    }

    const product = await this.findOne(id, tenantId);
    
    // Calculate profit margin if both prices are provided
    if (data.costPrice && data.salePrice) {
      data.profitMargin = ((data.salePrice - data.costPrice) / data.costPrice * 100).toFixed(2);
    }

    // Track stock changes
    const newStock = typeof data.stock === 'string' ? parseInt(data.stock) : data.stock;
    if (newStock !== undefined && !isNaN(newStock) && newStock !== product.stock) {
      const diff = newStock - product.stock;
      const movementType = diff > 0 ? 'ENTRY' : 'EXIT';
      
      try {
        await this.prisma.stockMovement.create({
          data: {
            tenantId,
            productId: id,
            type: movementType,
            quantity: diff,
            previousQty: product.stock,
            newQty: newStock,
            reason: 'Atualização via edição de produto',
          },
        });
      } catch (e) {
        console.error('Erro ao criar movimentação de estoque:', e);
      }
    }

    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    const orderItems = await this.prisma.orderItem.count({ where: { productId: id } });
    if (orderItems > 0) return this.prisma.product.update({ where: { id }, data: { active: false } });
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Produto removido' };
  }

  async search(tenantId: string, query: string) {
    // Se não enviou tenantId, pega o primeiro tenant
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      if (tenant) tenantId = tenant.id;
    }

    return this.prisma.product.findMany({
      where: { tenantId, active: true, available: true, OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ] },
      take: 10,
      include: { category: { select: { name: true } } },
    });
  }
}
