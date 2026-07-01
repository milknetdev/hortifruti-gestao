import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CurrentTenant } from '../common/decorators/tenant.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar categoria' })
  create(@Body() data: any, @CurrentTenant() tenant: any) {
    return this.categoriesService.create(data, tenant.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorias' })
  findAll(@Query() query: any, @CurrentTenant() tenant: any) {
    return this.categoriesService.findAll(tenant?.id, query);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Árvore de categorias' })
  findTree(@CurrentTenant() tenant: any) {
    return this.categoriesService.findTree(tenant?.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da categoria' })
  findOne(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.categoriesService.findOne(id, tenant?.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar categoria' })
  update(@Param('id') id: string, @Body() data: any, @CurrentTenant() tenant: any) {
    return this.categoriesService.update(id, data, tenant.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover categoria' })
  remove(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.categoriesService.remove(id, tenant.id);
  }
}
