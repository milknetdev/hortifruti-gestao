import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Stock')
@Controller('stock')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StockController {
  constructor(
    private stockService: StockService,
    private prisma: PrismaService,
  ) {}

  private async getTenantId(): Promise<string> {
    const tenant = await this.prisma.tenant.findFirst();
    if (!tenant) throw new Error('Nenhuma loja encontrada');
    return tenant.id;
  }

  @Get('movements')
  @ApiOperation({ summary: 'Movimentações de estoque' })
  async getMovements(@Query() query: any) {
    const tenantId = await this.getTenantId();
    return this.stockService.getMovements(tenantId, query);
  }

  @Post('add')
  @ApiOperation({ summary: 'Entrada de estoque' })
  async addStock(@Body() body: { productId: string; quantity: number; costPrice?: number; reason?: string }, @CurrentUser() user: any) {
    const tenantId = await this.getTenantId();
    return this.stockService.addStock(body.productId, body.quantity, tenantId, user?.id, body.costPrice, body.reason);
  }

  @Post('remove')
  @ApiOperation({ summary: 'Saída de estoque' })
  async removeStock(@Body() body: { productId: string; quantity: number; reason?: string }, @CurrentUser() user: any) {
    const tenantId = await this.getTenantId();
    return this.stockService.removeStock(body.productId, body.quantity, tenantId, user?.id, body.reason);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Ajustar estoque' })
  async adjustStock(@Body() body: { productId: string; newQuantity: number; reason?: string }, @CurrentUser() user: any) {
    const tenantId = await this.getTenantId();
    return this.stockService.adjustStock(body.productId, body.newQuantity, tenantId, user?.id, body.reason);
  }

  @Post('loss')
  @ApiOperation({ summary: 'Registrar perda' })
  async reportLoss(@Body() body: { productId: string; quantity: number; reason?: string }, @CurrentUser() user: any) {
    const tenantId = await this.getTenantId();
    return this.stockService.reportLoss(body.productId, body.quantity, tenantId, user?.id, body.reason);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Produtos com estoque baixo' })
  async getLowStock() {
    const tenantId = await this.getTenantId();
    return this.stockService.getLowStock(tenantId);
  }

  @Get('out-of-stock')
  @ApiOperation({ summary: 'Produtos sem estoque' })
  async getOutOfStock() {
    const tenantId = await this.getTenantId();
    return this.stockService.getOutOfStock(tenantId);
  }
}
