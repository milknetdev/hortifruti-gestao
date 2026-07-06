import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Export')
@Controller('export')
export class ExportController {
  constructor(private prisma: PrismaService) {}

  private async resolveTenantId(): Promise<string> {
    const tenant = await this.prisma.tenant.findFirst();
    return tenant?.id || '';
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exportar pedidos por período' })
  async exportOrders(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const tenantId = await this.resolveTenantId();
    
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        createdAt: { gte: start, lte: end },
      },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        items: { include: { product: { select: { name: true, unit: true } } } },
        pickupPoint: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }

  @Get('harvest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exportar planilha de colheita por período' })
  async exportHarvest(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const tenantId = await this.resolveTenantId();
    
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const items = await this.prisma.orderItem.findMany({
      where: {
        order: {
          tenantId,
          createdAt: { gte: start, lte: end },
          status: { notIn: ['CANCELLED'] },
        },
      },
      include: {
        product: { select: { name: true, unit: true } },
      },
    });

    // Aggregate by product
    const productMap: Record<string, { name: string; quantity: number; unit: string }> = {};
    
    for (const item of items) {
      const key = item.productId;
      if (!productMap[key]) {
        productMap[key] = {
          name: item.product.name,
          quantity: 0,
          unit: item.product.unit || 'un',
        };
      }
      productMap[key].quantity += Number(item.quantity);
    }

    return Object.values(productMap).sort((a, b) => b.quantity - a.quantity);
  }
}
