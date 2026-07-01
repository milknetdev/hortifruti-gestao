import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommissionsService } from './commissions.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CurrentTenant } from '../common/decorators/tenant.decorator';

@ApiTags('Commissions')
@Controller('commissions')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class CommissionsController {
  constructor(private commissionsService: CommissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar comissões' })
  findAll(@Query() query: any, @CurrentTenant() tenant: any) {
    return this.commissionsService.findAll(tenant.id, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumo de comissões' })
  getSummary(@Query('period') period: string, @CurrentTenant() tenant: any) {
    return this.commissionsService.getSummary(tenant.id, period);
  }

  @Post()
  @ApiOperation({ summary: 'Criar comissão' })
  create(@Body() data: any, @CurrentTenant() tenant: any) {
    return this.commissionsService.create(data, tenant.id);
  }

  @Put(':id/pay')
  @ApiOperation({ summary: 'Marcar comissão como paga' })
  markAsPaid(@Param('id') id: string) {
    return this.commissionsService.markAsPaid(id);
  }

  @Post('batch-pay')
  @ApiOperation({ summary: 'Marcar múltiplas como pagas' })
  markBatchAsPaid(@Body() body: { ids: string[] }) {
    return this.commissionsService.markBatchAsPaid(body.ids);
  }
}
