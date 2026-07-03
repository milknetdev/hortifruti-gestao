import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar favoritos do cliente' })
  async findAll(@CurrentUser() user: any) {
    const customer = await this.prisma.customer.findFirst({
      where: { email: user.email },
    });
    if (!customer) return [];

    const favorites = await this.prisma.favorite.findMany({
      where: { customerId: customer.id },
      include: { product: true },
    });

    return favorites.map((f) => f.product);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Adicionar aos favoritos' })
  async toggle(@CurrentUser() user: any, @Param('productId') productId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { email: user.email },
    });
    if (!customer) throw new Error('Cliente não encontrado');

    const existing = await this.prisma.favorite.findFirst({
      where: { customerId: customer.id, productId },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await this.prisma.favorite.create({
      data: { customerId: customer.id, productId },
    });
    return { favorited: true };
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remover dos favoritos' })
  async remove(@CurrentUser() user: any, @Param('productId') productId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { email: user.email },
    });
    if (!customer) throw new Error('Cliente não encontrado');

    const existing = await this.prisma.favorite.findFirst({
      where: { customerId: customer.id, productId },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
    }

    return { message: 'Removido dos favoritos' };
  }
}
