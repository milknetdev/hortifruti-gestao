import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
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
    const exists = await this.prisma.customer.findFirst({ where: { email: data.email, tenantId } });
    if (exists) throw new ConflictException('Email já cadastrado');
    const hashedPassword = await bcrypt.hash(data.password, 12);
    return this.prisma.customer.create({ data: { ...data, password: hashedPassword, tenantId } });
  }

  async findAll(tenantId: string, query: { page?: number; limit?: number; search?: string }) {
    tenantId = await this.resolveTenantId(tenantId);
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (query.search) where.OR = [{ name: { contains: query.search, mode: 'insensitive' } }, { email: { contains: query.search, mode: 'insensitive' } }];

    try {
      const [items, total] = await Promise.all([
        this.prisma.customer.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        this.prisma.customer.count({ where }),
      ]);
      return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    } catch (error: any) {
      return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 }, error: error.message };
    }
  }

  async findOne(id: string, tenantId: string) {
    tenantId = await this.resolveTenantId(tenantId);
    const customer = await this.prisma.customer.findFirst({ where: { id, tenantId }, include: { addresses: true } });
    if (!customer) throw new NotFoundException('Cliente não encontrado');
    const { password, ...result } = customer as any;
    return result;
  }

  async update(id: string, data: any, tenantId: string) {
    await this.findOne(id, tenantId);
    if (data.password) data.password = await bcrypt.hash(data.password, 12);
    return this.prisma.customer.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.customer.delete({ where: { id } });
    return { message: 'Cliente removido' };
  }

  async addAddress(customerId: string, data: any) {
    if (data.isDefault) await this.prisma.address.updateMany({ where: { customerId }, data: { isDefault: false } });
    return this.prisma.address.create({ data: { ...data, customerId } });
  }

  async getAddresses(customerId: string) {
    return this.prisma.address.findMany({ where: { customerId }, orderBy: { isDefault: 'desc' } });
  }

  async updateAddress(id: string, data: any, customerId: string) {
    if (data.isDefault) await this.prisma.address.updateMany({ where: { customerId }, data: { isDefault: false } });
    return this.prisma.address.update({ where: { id }, data });
  }

  async removeAddress(id: string) {
    await this.prisma.address.delete({ where: { id } });
    return { message: 'Endereço removido' };
  }

  async toggleFavorite(customerId: string, productId: string) {
    const existing = await this.prisma.favorite.findFirst({ where: { customerId, productId } });
    if (existing) { await this.prisma.favorite.delete({ where: { id: existing.id } }); return { favorited: false }; }
    await this.prisma.favorite.create({ data: { customerId, productId } });
    return { favorited: true };
  }

  async getFavorites(customerId: string) {
    return this.prisma.favorite.findMany({ where: { customerId }, include: { product: true } });
  }
}
