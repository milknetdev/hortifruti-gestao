import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Finance - Supplier Payments')
@Controller('finance/supplier-payments')
export class SupplierPaymentsController {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveTenantId(): Promise<string> {
    const tenant = await this.prisma.tenant.findFirst();
    return tenant?.id || '';
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pagamentos a fornecedores por período' })
  async getSupplierPayments(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const tenantId = await this.resolveTenantId();

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const whereClause: any = { tenantId };
    if (startDate || endDate) {
      whereClause.createdAt = dateFilter;
    }

    // Get all orders in the period
    const orders = await this.prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: {
              include: {
                supplier: true,
              },
            },
          },
        },
      },
    });

    // Calculate payments by supplier
    const supplierPayments: Record<string, {
      supplierId: string;
      supplierName: string;
      totalCost: number;
      totalSale: number;
      items: Array<{
        productName: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        orderId: string;
        orderDate: string;
      }>;
    }> = {};

    for (const order of orders) {
      for (const item of order.items) {
        const supplier = item.product?.supplier;
        if (!supplier) continue;

        const costPrice = Number(item.product.costPrice || 0);
        const quantity = Number(item.quantity || 0);
        const totalCost = costPrice * quantity;
        const totalSale = Number(item.unitPrice || 0) * quantity;

        if (!supplierPayments[supplier.id]) {
          supplierPayments[supplier.id] = {
            supplierId: supplier.id,
            supplierName: supplier.name,
            totalCost: 0,
            totalSale: 0,
            items: [],
          };
        }

        supplierPayments[supplier.id].totalCost += totalCost;
        supplierPayments[supplier.id].totalSale += totalSale;
        supplierPayments[supplier.id].items.push({
          productName: item.product.name,
          quantity,
          unitCost: costPrice,
          totalCost,
          orderId: order.id,
          orderDate: order.createdAt.toISOString(),
        });
      }
    }

    // Convert to array and sort by total cost
    const result = Object.values(supplierPayments).sort((a, b) => b.totalCost - a.totalCost);

    // Calculate totals
    const totalToPay = result.reduce((sum, s) => sum + s.totalCost, 0);
    const totalRevenue = result.reduce((sum, s) => sum + s.totalSale, 0);

    return {
      success: true,
      data: {
        suppliers: result,
        summary: {
          totalToPay,
          totalRevenue,
          profit: totalRevenue - totalToPay,
          supplierCount: result.length,
        },
      },
    };
  }
}
