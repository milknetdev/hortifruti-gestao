import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  private async resolveTenantId(tenantId: string): Promise<string> {
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      if (tenant) return tenant.id;
    }
    return tenantId;
  }

  async getMovements(tenantId: string, query: any) {
    tenantId = await this.resolveTenantId(tenantId);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (query.productId) where.productId = query.productId;
    if (query.type) where.type = query.type;

    try {
      const items = await this.prisma.stockMovement.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } });
      const total = await this.prisma.stockMovement.count({ where });

      // Buscar produtos separadamente
      const productIds = Array.from(new Set(items.map(i => i.productId)));
      let productsMap: Record<string, any> = {};
      if (productIds.length > 0) {
        const products = await this.prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, sku: true, mainImage: true, stock: true, minStock: true } });
        productsMap = Object.fromEntries(products.map(p => [p.id, p]));
      }

      const enrichedItems = items.map(item => ({
        ...item,
        product: productsMap[item.productId] || null,
        user: null,
      }));

      return { data: enrichedItems, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    } catch (error: any) {
      return { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 0 }, error: error.message };
    }
  }

  async addStock(productId: string, quantity: number, tenantId: string, userId?: string, costPrice?: number, reason?: string) {
    tenantId = await this.resolveTenantId(tenantId);
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    if (quantity <= 0) throw new BadRequestException('Quantidade deve ser positiva');
    
    const previousQty = product.stock;
    const newQty = previousQty + quantity;
    await this.prisma.stockMovement.create({ data: { tenantId, productId, userId, type: 'ENTRY', quantity, previousQty, newQty, costPrice, reason: reason || 'Entrada manual' } });
    return this.prisma.product.update({ where: { id: productId }, data: { stock: newQty } });
  }

  async removeStock(productId: string, quantity: number, tenantId: string, userId?: string, reason?: string) {
    tenantId = await this.resolveTenantId(tenantId);
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    if (product.stock < quantity) throw new BadRequestException('Estoque insuficiente');
    const previousQty = product.stock;
    const newQty = previousQty - quantity;
    await this.prisma.stockMovement.create({ data: { tenantId, productId, userId, type: 'EXIT', quantity: -quantity, previousQty, newQty, reason: reason || 'Saída manual' } });
    return this.prisma.product.update({ where: { id: productId }, data: { stock: newQty } });
  }

  async adjustStock(productId: string, newQuantity: number, tenantId: string, userId?: string, reason?: string) {
    tenantId = await this.resolveTenantId(tenantId);
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    const diff = newQuantity - product.stock;
    await this.prisma.stockMovement.create({ data: { tenantId, productId, userId, type: 'ADJUSTMENT', quantity: diff, previousQty: product.stock, newQty: newQuantity, reason: reason || 'Ajuste' } });
    return this.prisma.product.update({ where: { id: productId }, data: { stock: newQuantity } });
  }

  async reportLoss(productId: string, quantity: number, tenantId: string, userId?: string, reason?: string) {
    tenantId = await this.resolveTenantId(tenantId);
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
    tenantId = await this.resolveTenantId(tenantId);
    return this.prisma.product.findMany({ where: { tenantId, active: true, stock: 0 }, include: { category: { select: { name: true } } } });
  }
}
