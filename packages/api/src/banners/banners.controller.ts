import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private bannersService: BannersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar banner' })
  create(@Body() data: any) {
    return this.bannersService.create(data, '');
  }

  @Get()
  @ApiOperation({ summary: 'Listar banners' })
  findAll(@Query('active') active: string) {
    return this.bannersService.findAll('', active === 'true' ? true : active === 'false' ? false : undefined);
  }

  @Get('active')
  @ApiOperation({ summary: 'Banners ativos (público)' })
  findActive() {
    return this.bannersService.findActive('');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do banner' })
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id, '');
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar banner' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.bannersService.update(id, data, '');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover banner' })
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id, '');
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reordenar banners' })
  reorder(@Body() body: { items: { id: string; sortOrder: number }[] }) {
    return this.bannersService.reorder('', body.items);
  }
}
