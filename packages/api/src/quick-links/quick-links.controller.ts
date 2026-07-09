import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Quick Links')
@Controller('quick-links')
export class QuickLinksController {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveTenantId(tenantId: string): Promise<string> {
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      return tenant?.id || '';
    }
    return tenantId;
  }

  @Get()
  @ApiOperation({ summary: 'Listar links rapidos ativos' })
  async findAll() {
    const tenantId = await this.resolveTenantId('');
    const links = await this.prisma.quickLink.findMany({
      where: { tenantId, active: true },
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, data: links };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os links rapidos (admin)' })
  async findAllAdmin() {
    const tenantId = await this.resolveTenantId('');
    const links = await this.prisma.quickLink.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, data: links };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar link rapido' })
  async create(@Body() data: { label: string; href: string; sortOrder?: number }) {
    const tenantId = await this.resolveTenantId('');
    const link = await this.prisma.quickLink.create({
      data: {
        tenantId,
        label: data.label,
        href: data.href,
        sortOrder: data.sortOrder || 0,
      },
    });
    return { success: true, data: link };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar link rapido' })
  async update(@Param('id') id: string, @Body() data: any) {
    const link = await this.prisma.quickLink.update({
      where: { id },
      data,
    });
    return { success: true, data: link };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar link rapido' })
  async delete(@Param('id') id: string) {
    await this.prisma.quickLink.delete({ where: { id } });
    return { success: true, message: 'Link removido' };
  }
}
