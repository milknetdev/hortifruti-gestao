import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar funcionário' })
  create(@Body() data: any) {
    return this.usersService.create(data, '');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar funcionários' })
  findAll(@Query() query: any) {
    return this.usersService.findAll('', query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detalhes do funcionário' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id, '');
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar funcionário' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data, '');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover funcionário' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id, '');
  }

  @Put(':id/permissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar permissões' })
  updatePermissions(@Param('id') id: string, @Body() body: { permissionIds: string[] }) {
    return this.usersService.updatePermissions(id, body.permissionIds);
  }
}
