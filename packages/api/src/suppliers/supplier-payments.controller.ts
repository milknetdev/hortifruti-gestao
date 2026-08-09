import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Supplier Payments')
@Controller('supplier-payments')
export class SupplierPaymentsController {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveTenantId(): Promise<string> {
    const tenant = await this.prisma.tenant.findFirst();
    return tenant?.id || '';
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar pagamentos a fornecedores' })
  async findAll(@Req() req: any) {
    const tenantId = await this.resolveTenantId();
    const { supplierId, paid, startDate, endDate } = req.query;
    
    const where: any = { tenantId };
    if (supplierId) where.supplierId = supplierId;
    if (paid === 'true') where.paid = true;
    if (paid === 'false') where.paid = false;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const payments: any[] = await this.prisma.supplierPayment.findMany({
      where,
      include: { supplier: true, product: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalPending = payments.filter((p: any) => !p.paid).reduce((sum: number, p: any) => sum + Number(p.totalCost), 0);
    const totalPaid = payments.filter((p: any) => p.paid).reduce((sum: number, p: any) => sum + Number(p.totalCost), 0);

    return { success: true, data: payments, summary: { totalPending, totalPaid, total: totalPending + totalPaid } };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar pagamento a fornecedor' })
  async create(@Body() data: any) {
    const tenantId = await this.resolveTenantId();
    const payment: any = await this.prisma.supplierPayment.create({
      data: {
        tenantId,
        supplierId: data.supplierId,
        productId: data.productId || null,
        description: data.description,
        quantity: Number(data.quantity),
        unitCost: Number(data.unitCost),
        totalCost: Number(data.quantity) * Number(data.unitCost),
        notes: data.notes || null,
      },
    });
    return { success: true, data: payment };
  }

  @Put(':id/pay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar como pago' })
  async markAsPaid(@Param('id') id: string) {
    const payment: any = await this.prisma.supplierPayment.update({
      where: { id },
      data: { paid: true, paidAt: new Date() },
    });
    return { success: true, data: payment };
  }

  @Put(':id/unpay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar como pendente' })
  async markAsPending(@Param('id') id: string) {
    const payment: any = await this.prisma.supplierPayment.update({
      where: { id },
      data: { paid: false, paidAt: null },
    });
    return { success: true, data: payment };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir pagamento' })
  async delete(@Param('id') id: string) {
    await this.prisma.supplierPayment.delete({ where: { id } });
    return { success: true, message: 'Pagamento excluído' };
  }
}
