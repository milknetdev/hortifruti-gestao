import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Finance')
@Controller('finance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Post()
  @ApiOperation({ summary: 'Criar lançamento' })
  create(@Body() data: any) {
    return this.financeService.create(data, '');
  }

  @Get()
  @ApiOperation({ summary: 'Listar lançamentos' })
  findAll(@Query() query: any) {
    return this.financeService.findAll('', query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumo financeiro' })
  getSummary() {
    return this.financeService.getSummary('');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar lançamento' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.financeService.update(id, data, '');
  }

  @Put(':id/pay')
  @ApiOperation({ summary: 'Marcar como pago' })
  markAsPaid(@Param('id') id: string) {
    return this.financeService.markAsPaid(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover lançamento' })
  remove(@Param('id') id: string) {
    return this.financeService.remove(id);
  }
}
