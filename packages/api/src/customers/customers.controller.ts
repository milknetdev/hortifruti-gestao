import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cadastrar cliente' })
  create(@Body() data: any, @CurrentTenant() tenant: any) {
    return this.customersService.create(data, tenant.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar clientes' })
  findAll(@Query() query: any, @CurrentTenant() tenant: any) {
    return this.customersService.findAll(tenant.id, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detalhes do cliente' })
  findOne(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.customersService.findOne(id, tenant.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar cliente' })
  update(@Param('id') id: string, @Body() data: any, @CurrentTenant() tenant: any) {
    return this.customersService.update(id, data, tenant.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover cliente' })
  remove(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.customersService.remove(id, tenant.id);
  }

  // Addresses
  @Post(':id/addresses')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  addAddress(@Param('id') id: string, @Body() data: any) {
    return this.customersService.addAddress(id, data);
  }

  @Get(':id/addresses')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  getAddresses(@Param('id') id: string) {
    return this.customersService.getAddresses(id);
  }

  // Favorites
  @Post(':id/favorites/:productId')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  toggleFavorite(@Param('id') id: string, @Param('productId') productId: string) {
    return this.customersService.toggleFavorite(id, productId);
  }

  @Get(':id/favorites')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  getFavorites(@Param('id') id: string) {
    return this.customersService.getFavorites(id);
  }
}
