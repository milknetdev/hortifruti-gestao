import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Feature Banners')
@Controller('feature-banners')
export class FeatureBannersController {
  constructor(private prisma: PrismaService) {}

  private async resolveTenantId(tenantId: string): Promise<string> {
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      return tenant?.id || '';
    }
    return tenantId;
  }

  @Get()
  @ApiOperation({ summary: 'Listar banners de benefícios' })
  async findAll() {
    const tenantId = await this.resolveTenantId('');
    const banners = await this.prisma.featureBanner.findMany({
      where: { tenantId, active: true },
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, data: banners };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os banners (admin)' })
  async findAllAdmin() {
    const tenantId = await this.resolveTenantId('');
    const banners = await this.prisma.featureBanner.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, data: banners };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar banner de benefício' })
  async create(@Body() data: { title: string; description?: string; icon?: string; sortOrder?: number }) {
    const tenantId = await this.resolveTenantId('');
    const banner = await this.prisma.featureBanner.create({
      data: {
        tenantId,
        title: data.title,
        description: data.description,
        icon: data.icon || 'truck',
        sortOrder: data.sortOrder || 0,
      },
    });
    return { success: true, data: banner };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar banner de benefício' })
  async update(@Param('id') id: string, @Body() data: any) {
    const banner = await this.prisma.featureBanner.update({
      where: { id },
      data,
    });
    return { success: true, data: banner };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar banner de benefício' })
  async delete(@Param('id') id: string) {
    await this.prisma.featureBanner.delete({ where: { id } });
    return { success: true, message: 'Banner removido' };
  }
}
