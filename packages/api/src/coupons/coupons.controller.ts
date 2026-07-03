import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Coupons')
@Controller('coupons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar cupom' })
  create(@Body() data: any) {
    return this.couponsService.create(data, '');
  }

  @Get()
  @ApiOperation({ summary: 'Listar cupons' })
  findAll(@Query() query: any) {
    return this.couponsService.findAll('', query);
  }

  @Get('validate/:code')
  @ApiOperation({ summary: 'Validar cupom' })
  validate(@Param('code') code: string, @Query('orderTotal') orderTotal?: string) {
    return this.couponsService.validate(code, '', Number(orderTotal) || 0);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do cupom' })
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id, '');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cupom' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.couponsService.update(id, data, '');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover cupom' })
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id, '');
  }
}
