import { Controller, Post, Put, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LoginDto, CustomerLoginDto, RegisterDto, CustomerRegisterDto, RefreshTokenDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login administrativo' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo administrador' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.registerAdmin(dto);
  }

  @Post('customer/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login do cliente na loja' })
  async customerLogin(@Body() dto: CustomerLoginDto) {
    return this.authService.customerLogin(dto.email, dto.password, dto.tenantId);
  }

  @Post('customer/register')
  @ApiOperation({ summary: 'Registrar novo cliente' })
  async customerRegister(@Body() dto: CustomerRegisterDto) {
    return this.authService.registerCustomer(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout' })
  async logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dados do usuario logado' })
  async me(@CurrentUser() user: any) {
    // Se for cliente, busca dados completos do banco
    if (user.type === 'customer') {
      const customer = await this.authService.getCustomerByEmail(user.email);
      return { user: customer };
    }
    return { user };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar perfil do cliente' })
  async updateProfile(@CurrentUser() user: any, @Body() data: any) {
    return this.authService.updateCustomerProfile(user.email, data);
  }
}
