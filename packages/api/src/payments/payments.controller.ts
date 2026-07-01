import { Controller, Get, Post, Put, Delete, Body, Param, Headers, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { Request } from 'express';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get('methods')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar métodos de pagamento' })
  getMethods(@CurrentTenant() tenant: any) {
    return this.paymentsService.getMethods(tenant.id);
  }

  @Post('methods')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar método de pagamento' })
  createMethod(@Body() data: any, @CurrentTenant() tenant: any) {
    return this.paymentsService.createMethod(data, tenant.id);
  }

  @Put('methods/:id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar método de pagamento' })
  updateMethod(@Param('id') id: string, @Body() data: any, @CurrentTenant() tenant: any) {
    return this.paymentsService.updateMethod(id, data, tenant.id);
  }

  @Delete('methods/:id')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover método de pagamento' })
  removeMethod(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.paymentsService.removeMethod(id, tenant.id);
  }

  @Post('webhook/:provider/:tenantId')
  @ApiOperation({ summary: 'Webhook de pagamento' })
  webhook(@Param('provider') provider: string, @Param('tenantId') tenantId: string, @Body() payload: any) {
    return this.paymentsService.processWebhook(provider, payload, tenantId);
  }
}
