import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
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
    return this.prisma.financialEntry.create({ data: { ...data, tenantId } });
  }

  async findAll(tenantId: string, query: any) {
    tenantId = await this.resolveTenantId(tenantId);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (query.type) where.type = query.type;
    if (query.category) where.category = query.category;
    if (query.paid !== undefined) where.paid = query.paid === 'true';
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }
    const [items, total] = await Promise.all([
      this.prisma.financialEntry.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.financialEntry.count({ where }),
    ]);
    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getSummary(tenantId: string) {
    tenantId = await this.resolveTenantId(tenantId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const allEntries = await this.prisma.financialEntry.findMany({ where: { tenantId, paid: true } });
    const monthEntries = allEntries.filter((e) => e.createdAt >= startOfMonth);
    const dayEntries = allEntries.filter((e) => e.createdAt >= startOfDay);

    const monthIncome = monthEntries.filter((e) => e.type === 'INCOME').reduce((s, e) => s + Number(e.amount), 0);
    const monthExpenses = monthEntries.filter((e) => e.type === 'EXPENSE').reduce((s, e) => s + Number(e.amount), 0);
    const dayIncome = dayEntries.filter((e) => e.type === 'INCOME').reduce((s, e) => s + Number(e.amount), 0);

    const pending = await this.prisma.financialEntry.findMany({ where: { tenantId, paid: false } });
    const pendingReceivables = pending.filter((e) => e.type === 'INCOME').reduce((s, e) => s + Number(e.amount), 0);
    const pendingPayables = pending.filter((e) => e.type === 'EXPENSE').reduce((s, e) => s + Number(e.amount), 0);

    return { monthIncome, monthExpenses, monthProfit: monthIncome - monthExpenses, dayIncome, pendingReceivables, pendingPayables };
  }

  async update(id: string, data: any, tenantId: string) {
    return this.prisma.financialEntry.update({ where: { id }, data });
  }

  async markAsPaid(id: string) {
    return this.prisma.financialEntry.update({ where: { id }, data: { paid: true, paidAt: new Date() } });
  }

  async remove(id: string) {
    await this.prisma.financialEntry.delete({ where: { id } });
    return { message: 'Lançamento removido' };
  }
}
