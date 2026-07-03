import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
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
    const code = data.code.toUpperCase();
    const exists = await this.prisma.coupon.findFirst({ where: { code, tenantId } });
    if (exists) throw new ConflictException('Cupom já existe');
    return this.prisma.coupon.create({ data: { ...data, code, tenantId } });
  }

  async findAll(tenantId: string, query?: any) {
    tenantId = await this.resolveTenantId(tenantId);
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (query?.active !== undefined) where.active = query.active === 'true';
    const [items, total] = await Promise.all([
      this.prisma.coupon.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.coupon.count({ where }),
    ]);
    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    tenantId = await this.resolveTenantId(tenantId);
    const coupon = await this.prisma.coupon.findFirst({ where: { id, tenantId } });
    if (!coupon) throw new NotFoundException('Cupom não encontrado');
    return coupon;
  }

  async validate(code: string, tenantId: string, orderTotal: number = 0) {
    const coupon = await this.prisma.coupon.findFirst({ where: { code: code.toUpperCase(), tenantId, active: true } });
    if (!coupon) throw new NotFoundException('Cupom inválido');
    if (coupon.validFrom > new Date()) throw new ConflictException('Cupom ainda não válido');
    if (coupon.validUntil < new Date()) throw new ConflictException('Cupom expirado');
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) throw new ConflictException('Cupom esgotado');
    if (coupon.minOrderValue && orderTotal < Number(coupon.minOrderValue)) throw new ConflictException('Pedido mínimo: R$ ' + coupon.minOrderValue);
    let discount = coupon.type === 'PERCENTAGE' ? orderTotal * Number(coupon.value) / 100 : Number(coupon.value);
    if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) discount = Number(coupon.maxDiscount);
    return { valid: true, coupon, discount };
  }

  async update(id: string, data: any, tenantId: string) {
    await this.findOne(id, tenantId);
    if (data.code) data.code = data.code.toUpperCase();
    return this.prisma.coupon.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.coupon.delete({ where: { id } });
    return { message: 'Cupom removido' };
  }
}
