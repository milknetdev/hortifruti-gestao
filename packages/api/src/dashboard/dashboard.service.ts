import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(tenantId: string) {
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
      select: { total: true },
    });
    const monthRevenue = monthOrders.reduce((sum, o) => sum + Number(o.total), 0);

    const recentOrders = await this.prisma.order.findMany({
      where: { tenantId }, take: 10, orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true } }, items: { select: { productName: true, quantity: true } } },
    });

    const lowStockProducts = await this.prisma.product.findMany({
      where: { tenantId, active: true }, select: { id: true, name: true, stock: true, minStock: true },
    });
    const lowStock = lowStockProducts.filter((p) => p.stock <= p.minStock);

    return {
      todayOrders, pendingOrders, deliveredOrders,
      outOfStock: lowStockProducts.filter((p) => p.stock === 0).length,
      lowStock: lowStock.length,
      monthRevenue, totalCustomers, totalEmployees,
      recentOrders, lowStockAlerts: lowStock.slice(0, 5),
    };
  }
}
