import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private async resolveTenantId(tenantId: string): Promise<string> {
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      if (tenant) return tenant.id;
    }
    return tenantId;
  }

  async getStats(tenantId: string) {
    tenantId = await this.resolveTenantId(tenantId);
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayOrders, pendingOrders, deliveredOrders, totalCustomers, totalEmployees] = await Promise.all([
      this.prisma.order.count({ where: { tenantId, createdAt: { gte: startOfDay } } }),
      this.prisma.order.count({ where: { tenantId, status: { in: ['PENDING', 'AWAITING_PAYMENT', 'PAID'] } } }),
      this.prisma.order.count({ where: { tenantId, status: { in: ['DELIVERED', 'PICKED_UP'] }, deliveredAt: { gte: startOfDay } } }),
      this.prisma.customer.count({ where: { tenantId } }),
      this.prisma.user.count({ where: { tenantId, active: true } }),
    ]);

    const monthOrders = await this.prisma.order.findMany({
      where: { tenantId, status: { not: 'CANCELLED' }, createdAt: { gte: startOfMonth } },
      select: { total: true, items: { select: { costPrice: true, quantity: true, unitPrice: true } } },
    });
    const monthRevenue = monthOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const monthProfit = monthOrders.reduce((sum, o) => {
      const itemProfit = o.items.reduce((isum, item) => isum + (Number(item.unitPrice) - Number(item.costPrice || 0)) * item.quantity, 0);
      return sum + itemProfit;
    }, 0);

    const recentOrders = await this.prisma.order.findMany({
      where: { tenantId }, take: 10, orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true } }, items: { select: { productName: true, quantity: true } } },
    });

    // Vendas dos últimos 30 dias
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const salesData = await this.prisma.order.findMany({
      where: { tenantId, status: { not: 'CANCELLED' }, createdAt: { gte: last30Days } },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: 'asc' },
    });

    const salesChart: Array<{ day: string; sales: number; orders: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = salesData.filter(o => o.createdAt.toISOString().split('T')[0] === dateStr);
      salesChart.push({
        day: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        sales: dayOrders.reduce((sum, o) => sum + Number(o.total), 0),
        orders: dayOrders.length,
      });
    }

    // Pedidos por status
    const statusCounts = await this.prisma.order.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { id: true },
    });
    const ordersByStatus = statusCounts.map(s => ({ status: s.status, count: s._count.id }));

    const lowStockProducts = await this.prisma.product.findMany({
      where: { tenantId, active: true }, select: { id: true, name: true, stock: true, minStock: true },
    });
    const lowStock = lowStockProducts.filter((p) => p.stock <= p.minStock);

    return {
      todayOrders, pendingOrders, deliveredOrders,
      outOfStock: lowStockProducts.filter((p) => p.stock === 0).length,
      lowStock: lowStock.length,
      monthRevenue, monthProfit, totalCustomers, totalEmployees,
      salesChart, ordersByStatus,
      recentOrders, lowStockAlerts: lowStock.slice(0, 5),
    };
  }
}
