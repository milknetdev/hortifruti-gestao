import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CurrentTenant } from '../common/decorators/tenant.decorator';

@ApiTags('Delivery')
@Controller('delivery')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar zona de entrega' })
  create(@Body() data: any, @CurrentTenant() tenant: any) {
    return this.deliveryService.create(data, tenant.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar zonas de entrega' })
  findAll(@CurrentTenant() tenant: any) {
    return this.deliveryService.findAll(tenant?.id);
  }

  @Get('calculate')
  @ApiOperation({ summary: 'Calcular frete' })
  calculate(@Query() query: any, @CurrentTenant() tenant: any) {
    return this.deliveryService.calculateDelivery(tenant?.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da zona' })
  findOne(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.deliveryService.findOne(id, tenant?.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar zona' })
  update(@Param('id') id: string, @Body() data: any, @CurrentTenant() tenant: any) {
    return this.deliveryService.update(id, data, tenant.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover zona' })
  remove(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.deliveryService.remove(id, tenant.id);
  }
}
