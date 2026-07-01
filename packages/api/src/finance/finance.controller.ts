import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CurrentTenant } from '../common/decorators/tenant.decorator';

@ApiTags('Finance')
@Controller('finance')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Post()
  @ApiOperation({ summary: 'Criar lançamento' })
  create(@Body() data: any, @CurrentTenant() tenant: any) {
    return this.financeService.create(data, tenant.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar lançamentos' })
  findAll(@Query() query: any, @CurrentTenant() tenant: any) {
    return this.financeService.findAll(tenant.id, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumo financeiro' })
  getSummary(@CurrentTenant() tenant: any) {
    return this.financeService.getSummary(tenant.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar lançamento' })
  update(@Param('id') id: string, @Body() data: any, @CurrentTenant() tenant: any) {
    return this.financeService.update(id, data, tenant.id);
  }

  @Put(':id/pay')
  @ApiOperation({ summary: 'Marcar como pago' })
  markAsPaid(@Param('id') id: string) {
    return this.financeService.markAsPaid(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover lançamento' })
  remove(@Param('id') id: string) {
    return this.financeService.remove(id);
  }
}
