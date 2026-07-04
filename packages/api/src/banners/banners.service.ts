import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  private async resolveTenantId(tenantId: string): Promise<string> {
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      if (tenant) return tenant.id;
    }
    return tenantId;
  }

  async create(data: any, tenantId: string) {
    tenantId = await this.resolveTenantId(tenantId);
    return this.prisma.banner.create({ data: { ...data, tenantId } });
  }

  async findAll(tenantId: string, active?: boolean) {
    tenantId = await this.resolveTenantId(tenantId);
    const where: any = { tenantId };
    if (active !== undefined) where.active = active;
    return this.prisma.banner.findMany({ where, orderBy: { sortOrder: 'asc' } });
  }

  async findActive(tenantId: string) {
    tenantId = await this.resolveTenantId(tenantId);
    return this.prisma.banner.findMany({ where: { tenantId, active: true }, orderBy: { sortOrder: 'asc' } });
  }

  async findOne(id: string, tenantId: string) {
    tenantId = await this.resolveTenantId(tenantId);
    const banner = await this.prisma.banner.findFirst({ where: { id, tenantId } });
    if (!banner) throw new NotFoundException('Banner não encontrado');
    return banner;
  }

  async update(id: string, data: any, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.banner.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.banner.delete({ where: { id } });
    return { message: 'Banner removido' };
  }

  async reorder(tenantId: string, items: { id: string; sortOrder: number }[]) {
    tenantId = await this.resolveTenantId(tenantId);
    for (const item of items) {
      await this.prisma.banner.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } });
    }
    return { message: 'Ordem atualizada' };
  }
}
