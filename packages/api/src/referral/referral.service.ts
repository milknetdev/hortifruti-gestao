import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class ReferralService {
  constructor(private prisma: PrismaService) {}

  async findByReferralCode(code: string) {
    return this.prisma.user.findFirst({ where: { referralCode: code, active: true } });
  }

  async getOrCreateReferralCode(userId: string, tenantId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuário não encontrado');

    if (user.referralCode) {
      return { 
        success: true, 
        data: { 
          referralCode: user.referralCode,
          referralLink: `https://hortifruti-gestao.vercel.app/?ref=${user.referralCode}`,
          commissionRate: user.commissionRate,
        } 
      };
    }

    // Generate unique code
    const code = randomBytes(4).toString('hex').toUpperCase();
    
    await this.prisma.user.update({
      where: { id: userId },
      data: { referralCode: code },
    });

    return { 
      success: true, 
      data: { 
        referralCode: code,
        referralLink: `https://hortifruti-gestao.vercel.app/?ref=${code}`,
        commissionRate: user.commissionRate || 10,
      } 
    };
  }

  async getMyCommissions(userId: string, query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.commission.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { id: true, name: true } } },
      }),
      this.prisma.commission.count({ where: { userId } }),
    ]);

    return { success: true, data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getMyStats(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuário não encontrado');

    const totalOrders = await this.prisma.order.count({ where: { referredBy: userId } });
    const totalRevenue = await this.prisma.order.aggregate({
      where: { referredBy: userId, status: { not: 'CANCELLED' } },
      _sum: { total: true },
    });

    const totalCommissions = await this.prisma.commission.aggregate({
      where: { userId },
      _sum: { commissionValue: true },
      _count: true,
    });

    const paidCommissions = await this.prisma.commission.aggregate({
      where: { userId, paid: true },
      _sum: { commissionValue: true },
    });

    const pendingCommissions = await this.prisma.commission.aggregate({
      where: { userId, paid: false },
      _sum: { commissionValue: true },
    });

    return {
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink: user.referralCode ? `https://hortifruti-gestao.vercel.app/?ref=${user.referralCode}` : null,
        commissionRate: user.commissionRate,
        commissionType: user.commissionType || 'PERCENTAGE',
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalCommissions: totalCommissions._sum.commissionValue || 0,
        paidCommissions: paidCommissions._sum.commissionValue || 0,
        pendingCommissions: pendingCommissions._sum.commissionValue || 0,
        totalCommissionCount: totalCommissions._count,
      },
    };
  }

  async updateCommissionSettings(userId: string, data: { commissionRate?: number; commissionType?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuário não encontrado');

    const updateData: any = {};
    if (data.commissionRate !== undefined) updateData.commissionRate = data.commissionRate;
    if (data.commissionType !== undefined) updateData.commissionType = data.commissionType;

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return { success: true, message: 'Configurações atualizadas' };
  }

  async getAllSellers(tenantId: string) {
    const sellers = await this.prisma.user.findMany({
      where: { tenantId, active: true, role: { in: ['SELLER', 'EMPLOYEE', 'ADMIN'] } },
      select: { id: true, name: true, email: true, referralCode: true, commissionRate: true },
    });
    return { success: true, data: sellers };
  }

  async getCustomerReferralCode(customerId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new Error('Cliente não encontrado');

    if (customer.referralCode) {
      return {
        success: true,
        data: {
          referralCode: customer.referralCode,
          referralLink: `https://hortifruti-gestao.vercel.app/?ref=${customer.referralCode}`,
          commissionRate: 10,
        },
      };
    }

    // Generate code if not exists
    const code = this.generateCode(customer.name);
    await this.prisma.customer.update({
      where: { id: customerId },
      data: { referralCode: code },
    });

    return {
      success: true,
      data: {
        referralCode: code,
        referralLink: `https://hortifruti-gestao.vercel.app/?ref=${code}`,
        commissionRate: 10,
      },
    };
  }

  async getCustomerStats(customerId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new Error('Cliente não encontrado');

    // Ensure referral code exists
    let referralCode = customer.referralCode;
    if (!referralCode) {
      referralCode = this.generateCode(customer.name);
      await this.prisma.customer.update({
        where: { id: customerId },
        data: { referralCode },
      });
    }

    const referredOrders = await this.prisma.order.count({
      where: { notes: { contains: referralCode } },
    });

    return {
      success: true,
      data: {
        referralCode,
        referralLink: `https://hortifruti-gestao.vercel.app/?ref=${referralCode}`,
        commissionRate: 10,
        totalReferrals: referredOrders,
      },
    };
  }

  private generateCode(name: string): string {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const prefix = cleanName.substring(0, 4).padEnd(4, 'X');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${random}`;
  }
}
