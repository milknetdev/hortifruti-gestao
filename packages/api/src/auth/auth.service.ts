import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new UnauthorizedException('Email e senha obrigatorios');
    }

    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase().trim() },
      include: { tenant: true },
    });

    if (!user) throw new UnauthorizedException('Credenciais invalidas');
    if (!user.active) throw new ForbiddenException('Conta desativada');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Credenciais invalidas');

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), refreshToken: tokens.refreshToken },
    });

    return {
      user: {
        id: user.id, email: user.email, name: user.name, role: user.role,
        avatar: user.avatar, tenantId: user.tenantId,
        tenant: user.tenant ? { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug } : null,
      },
      ...tokens,
    };
  }

  async customerLogin(email: string, password: string, tenantId?: string) {
    if (!email || !password) {
      throw new UnauthorizedException('Email e senha obrigatorios');
    }

    // Se não enviou tenantId, pega o primeiro tenant
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      if (!tenant) throw new UnauthorizedException('Nenhuma loja encontrada');
      tenantId = tenant.id;
    }

    const customer = await this.prisma.customer.findFirst({
      where: { email: email.toLowerCase().trim(), tenantId },
    });

    if (!customer) throw new UnauthorizedException('Credenciais invalidas');
    if (!customer.active) throw new ForbiddenException('Conta desativada');

    const passwordMatch = await bcrypt.compare(password, customer.password);
    if (!passwordMatch) throw new UnauthorizedException('Credenciais invalidas');

    const accessToken = this.jwt.sign(
      { sub: customer.id, email: customer.email, type: 'customer', tenantId },
      { secret: this.config.get('JWT_SECRET'), expiresIn: '24h' },
    );

    return {
      user: { id: customer.id, email: customer.email, name: customer.name, phone: customer.phone, cpf: customer.cpf, type: 'customer' },
      accessToken,
    };
  }

  async registerAdmin(data: { email: string; password: string; name: string; role?: string; tenantId?: string }) {
    if (!data.email || !data.password || !data.name) {
      throw new ConflictException('Email, senha e nome obrigatorios');
    }
    if (data.password.length < 8) {
      throw new ConflictException('Senha deve ter pelo menos 8 caracteres');
    }

    const email = data.email.toLowerCase().trim();
    const exists = await this.prisma.user.findFirst({ where: { email } });
    if (exists) throw new ConflictException('Email ja cadastrado');

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, name: data.name.trim(), role: data.role || 'ADMIN', tenantId: data.tenantId },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    };
  }

  async registerCustomer(data: { email: string; password: string; name: string; phone?: string; cpf?: string; tenantId?: string }) {
    if (!data.email || !data.password || !data.name) {
      throw new ConflictException('Email, senha e nome obrigatorios');
    }
    if (data.password.length < 6) {
      throw new ConflictException('Senha deve ter pelo menos 6 caracteres');
    }

    // Se não enviou tenantId, pega o primeiro tenant
    let tenantId = data.tenantId;
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      if (!tenant) throw new ConflictException('Nenhuma loja encontrada');
      tenantId = tenant.id;
    }

    const email = data.email.toLowerCase().trim();
    const exists = await this.prisma.customer.findFirst({ where: { email, tenantId } });
    if (exists) throw new ConflictException('Email ja cadastrado nesta loja');

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const customer = await this.prisma.customer.create({
      data: { email, password: hashedPassword, name: data.name.trim(), phone: data.phone?.trim(), cpf: data.cpf?.trim(), tenantId },
    });

    const accessToken = this.jwt.sign(
      { sub: customer.id, email: customer.email, type: 'customer', tenantId },
      { secret: this.config.get('JWT_SECRET'), expiresIn: '24h' },
    );

    return { user: { id: customer.id, email: customer.email, name: customer.name, phone: customer.phone, cpf: customer.cpf, type: 'customer' }, accessToken };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token necessario');

    try {
      const refreshSecret = this.config.get('JWT_REFRESH_SECRET');
      if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET nao configurado');

      const payload = this.jwt.verify(refreshToken, { secret: refreshSecret });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.refreshToken !== refreshToken) throw new UnauthorizedException('Refresh token invalido');
      if (!user.active) throw new ForbiddenException('Conta desativada');

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });

      return tokens;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Refresh token invalido ou expirado');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    return { message: 'Logout realizado com sucesso' };
  }

  async updateCustomerProfile(email: string, data: { name?: string; phone?: string; cpf?: string }) {
    const customer = await this.prisma.customer.findFirst({
      where: { email: email.toLowerCase().trim() },
    });
    if (!customer) throw new ConflictException('Cliente não encontrado');

    const updated = await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.phone && { phone: data.phone.trim() }),
        ...(data.cpf && { cpf: data.cpf.trim() }),
      },
    });

    return {
      user: { id: updated.id, email: updated.email, name: updated.name, phone: updated.phone, cpf: updated.cpf },
    };
  }

  async getCustomerByEmail(email: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { email: email.toLowerCase().trim() },
    });
    if (!customer) throw new ConflictException('Cliente não encontrado');

    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      cpf: customer.cpf,
      type: 'customer',
    };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const jwtSecret = this.config.get('JWT_SECRET');
    const refreshSecret = this.config.get('JWT_REFRESH_SECRET');

    if (!jwtSecret || !refreshSecret) throw new Error('JWT secrets nao configurados');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { secret: jwtSecret, expiresIn: this.config.get('JWT_EXPIRES_IN', '15m') }),
      this.jwt.signAsync(payload, { secret: refreshSecret, expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d') }),
    ]);

    return { accessToken, refreshToken };
  }
}
