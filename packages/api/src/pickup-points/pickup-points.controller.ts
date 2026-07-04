import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PickupPointsService } from './pickup-points.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Pickup Points')
@Controller('pickup-points')
export class PickupPointsController {
  constructor(private pickupPointsService: PickupPointsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar ponto de retirada' })
  create(@Body() data: any) {
    return this.pickupPointsService.create(data, '');
  }

  @Get()
  @ApiOperation({ summary: 'Listar pontos de retirada' })
  findAll() {
    return this.pickupPointsService.findAll('');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do ponto de retirada' })
  findOne(@Param('id') id: string) {
    return this.pickupPointsService.findOne(id, '');
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar ponto de retirada' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.pickupPointsService.update(id, data, '');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover ponto de retirada' })
  remove(@Param('id') id: string) {
    return this.pickupPointsService.remove(id, '');
  }
}
