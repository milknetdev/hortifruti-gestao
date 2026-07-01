import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, tenantId: string) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const exists = await this.prisma.category.findFirst({ where: { slug, tenantId } });
    if (exists) throw new ConflictException('Categoria já existe');
    return this.prisma.category.create({ data: { ...data, slug, tenantId } });
  }

  async findAll(tenantId: string, query?: any) {
    const where: any = { tenantId };
    if (query?.active !== undefined) where.active = query.active === 'true';
    if (query?.featured !== undefined) where.featured = query.featured === 'true';
    return this.prisma.category.findMany({ where, include: { _count: { select: { products: true, children: true } } }, orderBy: { sortOrder: 'asc' } });
  }

  async findTree(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId, parentId: null, active: true },
      include: { children: { where: { active: true }, include: { _count: { select: { products: true } } }, orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const cat = await this.prisma.category.findFirst({ where: { id, tenantId }, include: { parent: true, children: true } });
    if (!cat) throw new NotFoundException('Categoria não encontrada');
    return cat;
  }

  async update(id: string, data: any, tenantId: string) {
    await this.findOne(id, tenantId);
    if (data.name && !data.slug) data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    const products = await this.prisma.product.count({ where: { categoryId: id } });
    if (products > 0) throw new ConflictException('Categoria possui produtos');
    await this.prisma.category.delete({ where: { id } });
    return { message: 'Categoria removida' };
  }
}
