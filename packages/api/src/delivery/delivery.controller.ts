import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Delivery')
@Controller('delivery')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar zona de entrega' })
  create(@Body() data: any) {
    return this.deliveryService.create(data, '');
  }

  @Get()
  @ApiOperation({ summary: 'Listar zonas de entrega' })
  findAll() {
    return this.deliveryService.findAll('');
  }

  @Get('calculate')
  @ApiOperation({ summary: 'Calcular frete' })
  calculate(@Query() query: any) {
    return this.deliveryService.calculateDelivery('', query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da zona' })
  findOne(@Param('id') id: string) {
    return this.deliveryService.findOne(id, '');
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar zona' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.deliveryService.update(id, data, '');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover zona' })
  remove(@Param('id') id: string) {
    return this.deliveryService.remove(id, '');
  }

  @Get('settings')
  @ApiOperation({ summary: 'Configurações de entrega' })
  getSettings() {
    return this.deliveryService.getSettings('');
  }

  @Put('settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar configurações de entrega' })
  updateSettings(@Body() data: any) {
    return this.deliveryService.updateSettings('', data);
  }
}
