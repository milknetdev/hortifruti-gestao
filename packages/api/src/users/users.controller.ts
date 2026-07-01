import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CurrentTenant } from '../common/decorators/tenant.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar funcionário' })
  create(@Body() data: any, @CurrentTenant() tenant: any) {
    return this.usersService.create(data, tenant.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar funcionários' })
  findAll(@Query() query: any, @CurrentTenant() tenant: any) {
    return this.usersService.findAll(tenant.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do funcionário' })
  findOne(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.usersService.findOne(id, tenant.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar funcionário' })
  update(@Param('id') id: string, @Body() data: any, @CurrentTenant() tenant: any) {
    return this.usersService.update(id, data, tenant.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover funcionário' })
  remove(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.usersService.remove(id, tenant.id);
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: 'Atualizar permissões' })
  updatePermissions(@Param('id') id: string, @Body() body: { permissionIds: string[] }) {
    return this.usersService.updatePermissions(id, body.permissionIds);
  }
}
