import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar cliente' })
  create(@Body() data: any) {
    return this.customersService.create(data, '');
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes' })
  findAll(@Query() query: any) {
    return this.customersService.findAll('', query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do cliente' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id, '');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.customersService.update(id, data, '');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover cliente' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id, '');
  }

  // Addresses
  @Post(':id/addresses')
  @ApiOperation({ summary: 'Adicionar endereço' })
  addAddress(@Param('id') id: string, @Body() data: any) {
    return this.customersService.addAddress(id, data);
  }

  @Get(':id/addresses')
  @ApiOperation({ summary: 'Listar endereços' })
  getAddresses(@Param('id') id: string) {
    return this.customersService.getAddresses(id);
  }

  // Favorites
  @Post(':id/favorites/:productId')
  @ApiOperation({ summary: 'Toggle favorito' })
  toggleFavorite(@Param('id') id: string, @Param('productId') productId: string) {
    return this.customersService.toggleFavorite(id, productId);
  }

  @Get(':id/favorites')
  @ApiOperation({ summary: 'Listar favoritos' })
  getFavorites(@Param('id') id: string) {
    return this.customersService.getFavorites(id);
  }
}
