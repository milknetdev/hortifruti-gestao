import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Stock')
@Controller('stock')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class StockController {
  constructor(private stockService: StockService) {}

  @Get('movements')
  @ApiOperation({ summary: 'Movimentações de estoque' })
  getMovements(@Query() query: any, @CurrentTenant() tenant: any) {
    return this.stockService.getMovements(tenant.id, query);
  }

  @Post('add')
  @ApiOperation({ summary: 'Entrada de estoque' })
  addStock(@Body() body: { productId: string; quantity: number; costPrice?: number; reason?: string }, @CurrentTenant() tenant: any, @CurrentUser() user: any) {
    return this.stockService.addStock(body.productId, body.quantity, tenant.id, user?.id, body.costPrice, body.reason);
  }

  @Post('remove')
  @ApiOperation({ summary: 'Saída de estoque' })
  removeStock(@Body() body: { productId: string; quantity: number; reason?: string }, @CurrentTenant() tenant: any, @CurrentUser() user: any) {
    return this.stockService.removeStock(body.productId, body.quantity, tenant.id, user?.id, body.reason);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Ajustar estoque' })
  adjustStock(@Body() body: { productId: string; newQuantity: number; reason?: string }, @CurrentTenant() tenant: any, @CurrentUser() user: any) {
    return this.stockService.adjustStock(body.productId, body.newQuantity, tenant.id, user?.id, body.reason);
  }

  @Post('loss')
  @ApiOperation({ summary: 'Registrar perda' })
  reportLoss(@Body() body: { productId: string; quantity: number; reason?: string }, @CurrentTenant() tenant: any, @CurrentUser() user: any) {
    return this.stockService.reportLoss(body.productId, body.quantity, tenant.id, user?.id, body.reason);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Produtos com estoque baixo' })
  getLowStock(@CurrentTenant() tenant: any) {
    return this.stockService.getLowStock(tenant.id);
  }

  @Get('out-of-stock')
  @ApiOperation({ summary: 'Produtos sem estoque' })
  getOutOfStock(@CurrentTenant() tenant: any) {
    return this.stockService.getOutOfStock(tenant.id);
  }
}
