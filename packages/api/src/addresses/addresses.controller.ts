import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar endereços do cliente logado' })
  async findAll(@CurrentUser() user: any) {
    // Busca o cliente pelo email do token
    const customer = await this.prisma.customer.findFirst({
      where: { email: user.email },
    });
    if (!customer) return [];

    return this.prisma.address.findMany({
      where: { customerId: customer.id },
      orderBy: { isDefault: 'desc' },
    });
  }

  @Post()
  @ApiOperation({ summary: 'Adicionar endereço' })
  async create(@CurrentUser() user: any, @Body() data: any) {
    const customer = await this.prisma.customer.findFirst({
      where: { email: user.email },
    });
    if (!customer) throw new Error('Cliente não encontrado');

    // Se for o primeiro endereço, define como padrão
    const count = await this.prisma.address.count({
      where: { customerId: customer.id },
    });

    return this.prisma.address.create({
      data: {
        ...data,
        customerId: customer.id,
        isDefault: count === 0,
      },
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar endereço' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.prisma.address.update({
      where: { id },
      data,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover endereço' })
  async remove(@Param('id') id: string) {
    return this.prisma.address.delete({
      where: { id },
    });
  }

  @Put(':id/default')
  @ApiOperation({ summary: 'Definir endereço como padrão' })
  async setDefault(@CurrentUser() user: any, @Param('id') id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { email: user.email },
    });
    if (!customer) throw new Error('Cliente não encontrado');

    // Remove padrão de todos
    await this.prisma.address.updateMany({
      where: { customerId: customer.id },
      data: { isDefault: false },
    });

    // Define o selecionado como padrão
    return this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}
