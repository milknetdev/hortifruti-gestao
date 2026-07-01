import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number; userId?: string; paid?: boolean; period?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (query.userId) where.userId = query.userId;
    if (query.paid !== undefined) where.paid = query.paid;
    if (query.period) where.period = query.period;

    const [items, total] = await Promise.all([
      this.prisma.commission.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true } }, product: { select: { id: true, name: true } } } }),
      this.prisma.commission.count({ where }),
    ]);
    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getSummary(tenantId: string, period?: string) {
    const where: any = { tenantId };
    if (period) where.period = period;

    const [total, paid, unpaid] = await Promise.all([
      this.prisma.commission.aggregate({ where, _sum: { commissionValue: true }, _count: true }),
      this.prisma.commission.aggregate({ where: { ...where, paid: true }, _sum: { commissionValue: true } }),
      this.prisma.commission.aggregate({ where: { ...where, paid: false }, _sum: { commissionValue: true } }),
    ]);

    return {
      totalCommissions: Number(total._sum.commissionValue || 0),
      paidCommissions: Number(paid._sum.commissionValue || 0),
      unpaidCommissions: Number(unpaid._sum.commissionValue || 0),
      totalRecords: total._count,
    };
  }

  async create(data: any, tenantId: string) {
    return this.prisma.commission.create({ data: { ...data, tenantId } });
  }

  async markAsPaid(id: string) {
    return this.prisma.commission.update({ where: { id }, data: { paid: true, paidAt: new Date() } });
  }

  async markBatchAsPaid(ids: string[]) {
    await this.prisma.commission.updateMany({ where: { id: { in: ids } }, data: { paid: true, paidAt: new Date() } });
    return { message: `${ids.length} comissões marcadas como pagas` };
  }
}
