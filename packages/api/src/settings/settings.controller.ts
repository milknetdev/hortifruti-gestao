import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar todas as configurações' })
  getAllSettings() {
    return this.settingsService.getSettings('', 'general');
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar configurações gerais' })
  updateAllSettings(@Body() data: any) {
    // Separar productDisplay das outras configurações
    const { productDisplay, ...generalSettings } = data;
    
    const updates = [];
    if (productDisplay) {
      updates.push(this.settingsService.updateProductDisplaySettings('', productDisplay));
    }
    updates.push(this.settingsService.updateSettings('', 'general', generalSettings));
    
    return Promise.all(updates).then(() => ({ message: 'Configurações atualizadas' }));
  }

  @Get('product-display')
  @ApiOperation({ summary: 'Configurações de exibição de produto' })
  getProductDisplay() {
    return this.settingsService.getProductDisplaySettings('');
  }

  @Put('product-display')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar configurações de exibição de produto' })
  updateProductDisplay(@Body() data: any) {
    return this.settingsService.updateProductDisplaySettings('', data);
  }

  @Get(':group')
  @ApiOperation({ summary: 'Buscar configurações por grupo' })
  getSettings(@Param('group') group: string) {
    return this.settingsService.getSettings('', group);
  }

  @Put(':group')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar configurações por grupo' })
  updateSettings(@Param('group') group: string, @Body() data: any) {
    return this.settingsService.updateSettings('', group, data);
  }
}
