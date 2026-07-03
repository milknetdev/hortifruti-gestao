import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async getMovements(tenantId: string, query: any) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (query.productId) where.productId = query.productId;
    if (query.type) where.type = query.type;

    const [items, total] = await Promise.all([
      this.prisma.stockMovement.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { product: { select: { id: true, name: true, sku: true, mainImage: true, stock: true, minStock: true } } } }),
      this.prisma.stockMovement.count({ where }),
    ]);

    // Buscar usuários separadamente para evitar erro de relation
    const userIds = [...new Set(items.filter(i => i.userId).map(i => i.userId))];
    let usersMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const users = await this.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } });
      usersMap = Object.fromEntries(users.map(u => [u.id, u]));
    }

    const enrichedItems = items.map(item => ({
      ...item,
      user: item.userId ? usersMap[item.userId] || null : null,
    }));

    return { data: enrichedItems, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async addStock(productId: string, quantity: number, tenantId: string, userId?: string, costPrice?: number, reason?: string) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    if (quantity <= 0) throw new BadRequestException('Quantidade deve ser positiva');
    const previousQty = product.stock;
    const newQty = previousQty + quantity;
    await this.prisma.stockMovement.create({ data: { tenantId, productId, userId, type: 'ENTRY', quantity, previousQty, newQty, costPrice, reason: reason || 'Entrada manual' } });
    return this.prisma.product.update({ where: { id: productId }, data: { stock: newQty } });
  }

  async removeStock(productId: string, quantity: number, tenantId: string, userId?: string, reason?: string) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    if (product.stock < quantity) throw new BadRequestException('Estoque insuficiente');
    const previousQty = product.stock;
    const newQty = previousQty - quantity;
    await this.prisma.stockMovement.create({ data: { tenantId, productId, userId, type: 'EXIT', quantity: -quantity, previousQty, newQty, reason: reason || 'Saída manual' } });
    return this.prisma.product.update({ where: { id: productId }, data: { stock: newQty } });
  }

  async adjustStock(productId: string, newQuantity: number, tenantId: string, userId?: string, reason?: string) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    const diff = newQuantity - product.stock;
    await this.prisma.stockMovement.create({ data: { tenantId, productId, userId, type: 'ADJUSTMENT', quantity: diff, previousQty: product.stock, newQty: newQuantity, reason: reason || 'Ajuste' } });
    return this.prisma.product.update({ where: { id: productId }, data: { stock: newQuantity } });
  }

  async reportLoss(productId: string, quantity: number, tenantId: string, userId?: string, reason?: string) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    const newQty = Math.max(0, product.stock - quantity);
    await this.prisma.stockMovement.create({ data: { tenantId, productId, userId, type: 'LOSS', quantity: -quantity, previousQty: product.stock, newQty, reason: reason || 'Perda' } });
    return this.prisma.product.update({ where: { id: productId }, data: { stock: newQty } });
  }

  async getLowStock(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId, active: true, stock: { gt: 0 } },
      include: { category: { select: { name: true } } },
    });
    return products.filter((p) => p.stock <= p.minStock);
  }

  async getOutOfStock(tenantId: string) {
    return this.prisma.product.findMany({ where: { tenantId, active: true, stock: 0 }, include: { category: { select: { name: true } } } });
  }
}
