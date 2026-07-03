import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommissionsService } from './commissions.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Commissions')
@Controller('commissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommissionsController {
  constructor(private commissionsService: CommissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar comissões' })
  findAll(@Query() query: any) {
    return this.commissionsService.findAll('', query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumo de comissões' })
  getSummary(@Query('period') period: string) {
    return this.commissionsService.getSummary('', period);
  }

  @Post()
  @ApiOperation({ summary: 'Criar comissão' })
  create(@Body() data: any) {
    return this.commissionsService.create(data, '');
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
