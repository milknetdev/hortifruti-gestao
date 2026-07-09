import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('FAQ')
@Controller('faqs')
export class FaqsController {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveTenantId(tenantId: string): Promise<string> {
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      return tenant?.id || '';
    }
    return tenantId;
  }

  @Get()
  @ApiOperation({ summary: 'Listar FAQs ativos' })
  async findAll() {
    const tenantId = await this.resolveTenantId('');
    const faqs = await this.prisma.faq.findMany({
      where: { tenantId, active: true },
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, data: faqs };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os FAQs (admin)' })
  async findAllAdmin() {
    const tenantId = await this.resolveTenantId('');
    const faqs = await this.prisma.faq.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, data: faqs };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar FAQ' })
  async create(@Body() data: { question: string; answer: string; icon?: string; sortOrder?: number }) {
    const tenantId = await this.resolveTenantId('');
    const faq = await this.prisma.faq.create({
      data: {
        tenantId,
        question: data.question,
        answer: data.answer,
        icon: data.icon || 'help-circle',
        sortOrder: data.sortOrder || 0,
      },
    });
    return { success: true, data: faq };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar FAQ' })
  async update(@Param('id') id: string, @Body() data: any) {
    const faq = await this.prisma.faq.update({
      where: { id },
      data,
    });
    return { success: true, data: faq };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar FAQ' })
  async delete(@Param('id') id: string) {
    await this.prisma.faq.delete({ where: { id } });
    return { success: true, message: 'FAQ removido' };
  }
}
