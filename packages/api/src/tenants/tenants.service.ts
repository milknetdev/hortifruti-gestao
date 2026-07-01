import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const exists = await this.prisma.tenant.findFirst({ where: { slug } });
    if (exists) throw new ConflictException('Loja com este slug já existe');
    return this.prisma.tenant.create({ data: { ...data, slug } });
  }

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const where = query.search ? { name: { contains: query.search } } : {};

    const [items, total] = await Promise.all([
      this.prisma.tenant.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.tenant.count({ where }),
    ]);
    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Loja não encontrada');
    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Loja não encontrada');
    return tenant;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.tenant.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.tenant.delete({ where: { id } });
    return { message: 'Loja removida' };
  }

  async getSettings(tenantId: string) {
    return this.prisma.tenantSetting.findMany({ where: { tenantId } });
  }

  async updateSetting(tenantId: string, key: string, value: string, group?: string) {
    return this.prisma.tenantSetting.upsert({
      where: { tenantId_key: { tenantId, key } },
      update: { value },
      create: { tenantId, key, value, group: group || 'general' },
    });
  }

  async bulkUpdateSettings(tenantId: string, settings: { key: string; value: string; group?: string }[]) {
    for (const s of settings) {
      await this.prisma.tenantSetting.upsert({
        where: { tenantId_key: { tenantId, key: s.key } },
        update: { value: s.value },
        create: { tenantId, key: s.key, value: s.value, group: s.group || 'general' },
      });
    }
    return { message: 'Configurações atualizadas' };
  }
}
