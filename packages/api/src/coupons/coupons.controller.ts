import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CurrentTenant } from '../common/decorators/tenant.decorator';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar cupom' })
  create(@Body() data: any, @CurrentTenant() tenant: any) {
    return this.couponsService.create(data, tenant.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar cupons' })
  findAll(@Query() query: any, @CurrentTenant() tenant: any) {
    return this.couponsService.findAll(tenant.id, query);
  }

  @Get('validate/:code')
  @ApiOperation({ summary: 'Validar cupom' })
  validate(@Param('code') code: string, @Query('total') total: number, @CurrentTenant() tenant: any) {
    return this.couponsService.validate(code, tenant?.id, total);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detalhes do cupom' })
  findOne(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.couponsService.findOne(id, tenant.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar cupom' })
  update(@Param('id') id: string, @Body() data: any, @CurrentTenant() tenant: any) {
    return this.couponsService.update(id, data, tenant.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover cupom' })
  remove(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.couponsService.remove(id, tenant.id);
  }
}
