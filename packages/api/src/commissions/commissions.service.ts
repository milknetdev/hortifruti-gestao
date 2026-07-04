import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService) {}

  private async resolveTenantId(tenantId: string): Promise<string> {
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      if (tenant) return tenant.id;
    }
    return tenantId;
  }

  async findAll(tenantId: string, query: any) {
    tenantId = await this.resolveTenantId(tenantId);
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (query?.userId) where.userId = query.userId;
    if (query?.paid !== undefined && query?.paid !== '') {
      where.paid = query.paid === true || query.paid === 'true';
    }
    if (query?.period) where.period = query.period;

    const [items, total] = await Promise.all([
      this.prisma.commission.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true } } } }),
      this.prisma.commission.count({ where }),
    ]);
    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getSummary(tenantId: string, period?: string) {
    tenantId = await this.resolveTenantId(tenantId);
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
    const commission = await this.prisma.commission.update({ 
      where: { id }, 
      data: { paid: true, paidAt: new Date() },
      include: { user: { select: { name: true } } },
    });

    // Criar despesa no financeiro
    if (commission.commissionValue && Number(commission.commissionValue) > 0) {
      await this.prisma.financialEntry.create({
        data: {
          tenantId: commission.tenantId,
          type: 'EXPENSE',
          category: 'Comissões',
          description: `Comissão - ${commission.user?.name || 'Vendedor'} - ${commission.notes || ''}`.trim(),
          amount: commission.commissionValue,
          paid: true,
          paidAt: new Date(),
          dueDate: new Date(),
        },
      });
    }

    return commission;
  }

  async markBatchAsPaid(ids: string[]) {
    const commissions = await this.prisma.commission.findMany({
      where: { id: { in: ids } },
      include: { user: { select: { name: true } } },
    });

    await this.prisma.commission.updateMany({ where: { id: { in: ids } }, data: { paid: true, paidAt: new Date() } });

    // Criar despesas no financeiro para cada comissão
    for (const commission of commissions) {
      if (commission.commissionValue && Number(commission.commissionValue) > 0) {
        await this.prisma.financialEntry.create({
          data: {
            tenantId: commission.tenantId,
            type: 'EXPENSE',
            category: 'Comissões',
            description: `Comissão - ${commission.user?.name || 'Vendedor'} - ${commission.notes || ''}`.trim(),
            amount: commission.commissionValue,
            paid: true,
            paidAt: new Date(),
            dueDate: new Date(),
          },
        });
      }
    }

    return { message: `${ids.length} comissões marcadas como pagas` };
  }
}
