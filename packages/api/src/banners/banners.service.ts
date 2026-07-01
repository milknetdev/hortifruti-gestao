import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, tenantId: string) {
    return this.prisma.banner.create({ data: { ...data, tenantId } });
  }

  async findAll(tenantId: string, active?: boolean) {
    const where: any = { tenantId };
    if (active !== undefined) where.active = active;
    return this.prisma.banner.findMany({ where, orderBy: { sortOrder: 'asc' } });
  }

  async findActive(tenantId: string) {
    return this.prisma.banner.findMany({ where: { tenantId, active: true }, orderBy: { sortOrder: 'asc' } });
  }

  async findOne(id: string, tenantId: string) {
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
    for (const item of items) {
      await this.prisma.banner.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } });
    }
    return { message: 'Ordem atualizada' };
  }
}
