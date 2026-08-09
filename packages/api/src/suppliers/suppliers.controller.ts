import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Fornecedores')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveTenantId(): Promise<string> {
    const tenant = await this.prisma.tenant.findFirst();
    return tenant?.id || '';
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar fornecedores' })
  async findAll() {
    const tenantId = await this.resolveTenantId();
    const suppliers = await this.prisma.supplier.findMany({
      where: { tenantId, active: true },
      orderBy: { name: 'asc' },
    });
    return { success: true, data: suppliers };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar fornecedor por ID' })
  async findOne(@Param('id') id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    return { success: true, data: supplier };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar fornecedor' })
  async create(@Body() data: { name: string; cnpj?: string; contact?: string; email?: string; phone?: string; address?: string; notes?: string }) {
    const tenantId = await this.resolveTenantId();
    const supplier = await this.prisma.supplier.create({
      data: { tenantId, ...data },
    });
    return { success: true, data: supplier };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar fornecedor' })
  async update(@Param('id') id: string, @Body() data: any) {
    const supplier = await this.prisma.supplier.update({
      where: { id },
      data,
    });
    return { success: true, data: supplier };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desativar fornecedor' })
  async delete(@Param('id') id: string) {
    await this.prisma.supplier.update({
      where: { id },
      data: { active: false },
    });
    return { success: true, message: 'Fornecedor desativado' };
  }
}
