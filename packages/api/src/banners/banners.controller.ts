import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CurrentTenant } from '../common/decorators/tenant.decorator';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private bannersService: BannersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar banner' })
  create(@Body() data: any, @CurrentTenant() tenant: any) {
    return this.bannersService.create(data, tenant.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar banners' })
  findAll(@Query('active') active: string, @CurrentTenant() tenant: any) {
    return this.bannersService.findAll(tenant?.id, active === 'true' ? true : active === 'false' ? false : undefined);
  }

  @Get('active')
  @ApiOperation({ summary: 'Banners ativos (público)' })
  findActive(@CurrentTenant() tenant: any) {
    return this.bannersService.findActive(tenant?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do banner' })
  findOne(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.bannersService.findOne(id, tenant?.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar banner' })
  update(@Param('id') id: string, @Body() data: any, @CurrentTenant() tenant: any) {
    return this.bannersService.update(id, data, tenant.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover banner' })
  remove(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.bannersService.remove(id, tenant.id);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reordenar banners' })
  reorder(@Body() body: { items: { id: string; sortOrder: number }[] }, @CurrentTenant() tenant: any) {
    return this.bannersService.reorder(tenant.id, body.items);
  }
}
