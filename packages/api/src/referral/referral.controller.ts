import { Controller, Get, Param, Query, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralService } from './referral.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Referral')
@Controller('referral')
export class ReferralController {
  constructor(private referralService: ReferralService) {}

  @Get('track/:code')
  @ApiOperation({ summary: 'Rastrear código de indicação' })
  async trackReferral(@Param('code') code: string, @Res() res: any) {
    const user = await this.referralService.findByReferralCode(code);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Código inválido' });
    }
    
    res.cookie('referral_code', code, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    
    return res.json({ 
      success: true, 
      data: { 
        sellerName: user.name,
        message: `Você foi indicado por ${user.name}!` 
      } 
    });
  }

  @Get('my-code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter código de indicação do vendedor' })
  async getMyCode(@CurrentUser() user: any) {
    return this.referralService.getOrCreateReferralCode(user.id, user.tenantId);
  }

  @Get('my-commissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ver comissões do vendedor' })
  async getMyCommissions(@CurrentUser() user: any, @Query() query: any) {
    return this.referralService.getMyCommissions(user.id, query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Estatísticas de indicações' })
  async getMyStats(@CurrentUser() user: any) {
    return this.referralService.getMyStats(user.id);
  }

  @Put('settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar configurações de comissão' })
  async updateSettings(@CurrentUser() user: any, @Body() data: { commissionRate?: number }) {
    return this.referralService.updateCommissionSettings(user.id, data);
  }

  @Get('sellers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar vendedores' })
  async getSellers(@CurrentUser() user: any) {
    return this.referralService.getAllSellers(user.tenantId);
  }
}
