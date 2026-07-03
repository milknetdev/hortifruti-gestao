import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async resolveTenantId(tenantId: string): Promise<string> {
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      if (tenant) return tenant.id;
    }
    return tenantId;
  }

  async findCustomerByEmail(email: string, tenantId: string) {
    if (!email) return null;
    return this.prisma.customer.findFirst({ where: { email, tenantId } });
  }

  async create(data: any) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: data.items.map((i: any) => i.productId) }, tenantId: data.tenantId },
    });

    let subtotal = 0;
    const orderItems = data.items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new BadRequestException(`Produto ${item.productId} não encontrado`);
      if (product.stock < item.quantity) throw new BadRequestException(`Estoque insuficiente para ${product.name}`);
      const price = product.promotionalPrice || product.salePrice;
      const totalPrice = Number(price) * item.quantity;
      subtotal += totalPrice;
      return {
        productId: item.productId, productName: product.name, productImage: product.mainImage,
        quantity: item.quantity, unitPrice: price, totalPrice, costPrice: product.costPrice, weight: product.weight,
      };
    });

    // Apply coupon
    let discount = 0;
    let couponId = null;
    if (data.couponCode) {
      const coupon = await this.prisma.coupon.findFirst({
        where: { code: data.couponCode.toUpperCase(), tenantId: data.tenantId, active: true },
      });
      if (coupon && coupon.validFrom <= new Date() && coupon.validUntil >= new Date()) {
        if (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) {
          discount = coupon.type === 'PERCENTAGE' ? subtotal * Number(coupon.value) / 100 : Number(coupon.value);
          if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) discount = Number(coupon.maxDiscount);
          couponId = coupon.id;
        }
      }
    }

    const lastOrder = await this.prisma.order.findFirst({ where: { tenantId: data.tenantId }, orderBy: { orderNumber: 'desc' } });
    const orderNumber = (lastOrder?.orderNumber || 0) + 1;
    const total = subtotal - discount + Number(data.deliveryFee || 0);

    const order = await this.prisma.order.create({
      data: {
        tenantId: data.tenantId, customerId: data.customerId, addressId: data.addressId,
        userId: data.userId, orderNumber, status: 'PENDING',
        deliveryType: data.deliveryType || 'DELIVERY', paymentMethod: data.paymentMethod || 'PIX',
        subtotal, deliveryFee: data.deliveryFee || 0, discount, total,
        couponId, couponCode: data.couponCode, notes: data.notes,
        items: { create: orderItems },
        statusHistory: { create: { status: 'PENDING', notes: 'Pedido criado' } },
      },
      include: { items: true, statusHistory: true },
    });

    // Update stock
    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      await this.prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      await this.prisma.stockMovement.create({
        data: { tenantId: data.tenantId, productId: item.productId, userId: data.userId, type: 'SALE', quantity: -item.quantity, previousQty: product!.stock, newQty: product!.stock - item.quantity, reference: order.id },
      });
    }

    if (couponId) await this.prisma.coupon.update({ where: { id: couponId }, data: { usageCount: { increment: 1 } } });
    if (data.customerId) await this.prisma.customer.update({ where: { id: data.customerId }, data: { totalSpent: { increment: total }, lastOrderAt: new Date() } });

    // Criar lançamento financeiro
    await this.prisma.financialEntry.create({
      data: {
        tenantId: data.tenantId,
        type: 'INCOME',
        category: 'Vendas',
        description: `Pedido #${orderNumber}`,
        amount: total,
        paid: false,
        dueDate: new Date(),
        orderId: order.id,
      },
    });

    return order;
  }

  async findAll(tenantId: string, query: any) {
    tenantId = await this.resolveTenantId(tenantId);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (query.status) where.status = query.status;
    if (query.search) where.OR = [{ notes: { contains: query.search } }];

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { customer: { select: { id: true, name: true, email: true } }, items: true } }),
      this.prisma.order.count({ where }),
    ]);
    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId?: string) {
    tenantId = await this.resolveTenantId(tenantId || '');
    const where: any = { id };
    if (tenantId) where.tenantId = tenantId;
    const order = await this.prisma.order.findFirst({ where, include: { customer: true, address: true, items: true, statusHistory: { orderBy: { createdAt: 'asc' } } } });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return order;
  }

  async updateStatus(id: string, status: string, tenantId: string, userId?: string, notes?: string) {
    const order = await this.findOne(id, tenantId);
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status,
        deliveredAt: (status === 'DELIVERED' || status === 'PICKED_UP') ? new Date() : undefined,
        cancelledAt: status === 'CANCELLED' ? new Date() : undefined,
        cancelReason: status === 'CANCELLED' ? notes : undefined,
      },
    });
    await this.prisma.orderStatusHistory.create({ data: { orderId: id, status, notes, userId } });

    if (status === 'CANCELLED') {
      const items = await this.prisma.orderItem.findMany({ where: { orderId: id } });
      for (const item of items) {
        await this.prisma.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
      // Cancelar lançamento financeiro
      await this.prisma.financialEntry.updateMany({ where: { orderId: id }, data: { paid: false } });
    }

    // Marcar lançamento como pago quando o pedido for pago
    if (status === 'PAID' || status === 'DELIVERED' || status === 'PICKED_UP') {
      await this.prisma.financialEntry.updateMany({ where: { orderId: id, type: 'INCOME' }, data: { paid: true, paidAt: new Date() } });
    }

    return updated;
  }

  async getMyOrders(customerId: string, tenantId: string, page = 1) {
    const limit = 10;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({ where: { customerId, tenantId }, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { items: true } }),
      this.prisma.order.count({ where: { customerId, tenantId } }),
    ]);
    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findByCustomer(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: {
        items: true,
        customer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

}