import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar produtos' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiQuery({ name: 'promotional', required: false, type: Boolean })
  @ApiQuery({ name: 'tenantId', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: boolean,
    @Query('promotional') promotional?: boolean,
    @Query('tenantId') tenantId?: string,
  ) {
    const query: any = {
      page: Math.max(1, Number(page) || 1),
      limit: Math.min(100, Math.max(1, Number(limit) || 20)),
    };
    if (category) query.category = category;
    if (search) query.search = search;
    if (featured) query.featured = featured;
    if (promotional) query.promotional = promotional;
    return this.productsService.findAll(tenantId || '', query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Produtos em destaque' })
  async findFeatured(@Query('limit') limit?: number) {
    return this.productsService.findFeatured('', limit || 8);
  }

  @Get('promotional')
  @ApiOperation({ summary: 'Produtos promocionais' })
  async findPromotional(@Query('limit') limit?: number) {
    return this.productsService.findPromotional('', limit || 8);
  }

  @Get('best-sellers')
  @ApiOperation({ summary: 'Mais vendidos' })
  async findBestSellers(@Query('limit') limit?: number) {
    return this.productsService.findBestSellers('', limit || 8);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Buscar produto por slug' })
  async findBySlug(@Param('slug') slug: string, @Query('tenantId') tenantId?: string) {
    return this.productsService.findBySlug(slug, tenantId || '');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar produto' })
  async create(@Body() dto: CreateProductDto, @Req() req: any) {
    return this.productsService.create(dto, req.tenant.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar produto' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Req() req: any) {
    return this.productsService.update(id, dto, req.tenant.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir produto' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.productsService.remove(id, req.tenant.id);
  }
}
