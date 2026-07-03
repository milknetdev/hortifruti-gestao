import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar pedidos' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    const query: any = {
      page: Math.max(1, Number(page) || 1),
      limit: Math.min(100, Math.max(1, Number(limit) || 20)),
    };
    if (status) query.status = status;
    return this.ordersService.findAll('', query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Meus pedidos' })
  async findMyOrders(@Req() req: any) {
    const email = req.user?.email;
    const tenantId = await this.ordersService.resolveTenantId('');
    const customer = await this.ordersService.findCustomerByEmail(email, tenantId);
    if (!customer) return [];
    return this.ordersService.findByCustomer(customer.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detalhes do pedido' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id, '');
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar pedido' })
  async create(@Body() dto: CreateOrderDto, @Req() req: any) {
    const tenantId = await this.ordersService.resolveTenantId('');
    const email = req.user?.email;
    
    // Buscar customer pelo email
    let customerId = dto.customerId;
    if (!customerId && email) {
      const customer = await this.ordersService.findCustomerByEmail(email, tenantId);
      if (customer) customerId = customer.id;
    }
    
    return this.ordersService.create({ 
      ...dto, 
      tenantId, 
      customerId,
    });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @Req() req: any) {
    return this.ordersService.updateStatus(id, dto.status, '', req.user?.id, dto.reason);
  }
}
