import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async getMethods(tenantId: string) {
    return this.prisma.paymentMethod.findMany({ where: { tenantId } });
  }

  async createMethod(data: any, tenantId: string) {
    return this.prisma.paymentMethod.create({ data: { ...data, tenantId } });
  }

  async updateMethod(id: string, data: any, tenantId: string) {
    const method = await this.prisma.paymentMethod.findFirst({ where: { id, tenantId } });
    if (!method) throw new NotFoundException('Método de pagamento não encontrado');
    return this.prisma.paymentMethod.update({ where: { id }, data });
  }

  async removeMethod(id: string, tenantId: string) {
    await this.prisma.paymentMethod.delete({ where: { id } });
    return { message: 'Método removido' };
  }

  async processWebhook(provider: string, payload: any, tenantId: string) {
    // Generic webhook handler - each provider has its own logic
    // This is a template that should be extended per provider
    const orderId = payload.external_reference || payload.order_id;
    if (!orderId) return { received: true };

    const order = await this.prisma.order.findFirst({ where: { id: orderId, tenantId } });
    if (!order) return { received: true, message: 'Order not found' };

    let newStatus = order.paymentStatus;
    let orderStatus = order.status;

    switch (payload.status || payload.type) {
      case 'approved':
      case 'payment.approved':
        newStatus = 'APPROVED';
        orderStatus = 'PAID';
        break;
      case 'rejected':
      case 'payment.rejected':
        newStatus = 'REJECTED';
        break;
      case 'refunded':
      case 'payment.refunded':
        newStatus = 'REFUNDED';
        break;
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: newStatus as any, status: orderStatus as any, paymentId: payload.payment_id || payload.id, paymentData: payload },
    });

    if (orderStatus === 'PAID') {
      await this.prisma.orderStatusHistory.create({
        data: { orderId, status: 'PAID', notes: `Pagamento aprovado via ${provider}` },
      });
      // Create financial entry
      await this.prisma.financialEntry.create({
        data: {
          tenantId,
          type: 'INCOME',
          category: 'SALE',
          description: `Pedido #${order.orderNumber}`,
          amount: order.total,
          orderId,
          paid: true,
          paidAt: new Date(),
        },
      });
    }

    return { received: true, orderId, paymentStatus: newStatus };
  }
}
