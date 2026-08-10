import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Stock')
@Controller('stock')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StockController {
  constructor(private stockService: StockService, private prisma: PrismaService) {}

  @Get('movements')
  @ApiOperation({ summary: 'Movimentações de estoque' })
  getMovements(@Query() query: any) {
    return this.stockService.getMovements('', query);
  }

  @Post('add')
  @ApiOperation({ summary: 'Entrada de estoque' })
  async addStock(@Body() body: { productId: string; quantity: number; costPrice?: number; reason?: string }, @CurrentUser() user: any) {
    // First, add the stock
    const result = await this.stockService.addStock(body.productId, body.quantity, '', user?.id, body.costPrice, body.reason);
    
    // Then, create supplier payment if applicable
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: body.productId },
        include: { supplier: true },
      });
      
      if (product?.supplierId && product?.supplier) {
        const unitCost = body.costPrice || Number(product.costPrice) || 0;
        if (unitCost > 0) {
          await this.prisma.supplierPayment.create({
            data: {
              tenantId: product.tenantId,
              supplierId: product.supplierId,
              productId: body.productId,
              description: product.name,
              quantity: body.quantity,
              unitCost: unitCost,
              totalCost: body.quantity * unitCost,
              notes: 'Gerado automaticamente pela entrada de estoque',
            },
          });
        }
      }
    } catch (error) {
      console.error('Erro ao criar pagamento ao fornecedor:', error);
    }
    
    return result;
  }

  @Post('remove')
  @ApiOperation({ summary: 'Saída de estoque' })
  removeStock(@Body() body: { productId: string; quantity: number; reason?: string }, @CurrentUser() user: any) {
    return this.stockService.removeStock(body.productId, body.quantity, '', user?.id, body.reason);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Ajustar estoque' })
  adjustStock(@Body() body: { productId: string; newQuantity: number; reason?: string }, @CurrentUser() user: any) {
    return this.stockService.adjustStock(body.productId, body.newQuantity, '', user?.id, body.reason);
  }

  @Post('loss')
  @ApiOperation({ summary: 'Registrar perda' })
  reportLoss(@Body() body: { productId: string; quantity: number; reason?: string }, @CurrentUser() user: any) {
    return this.stockService.reportLoss(body.productId, body.quantity, '', user?.id, body.reason);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Produtos com estoque baixo' })
  getLowStock() {
    return this.stockService.getLowStock('');
  }

  @Get('out-of-stock')
  @ApiOperation({ summary: 'Produtos sem estoque' })
  getOutOfStock() {
    return this.stockService.getOutOfStock('');
  }
}
