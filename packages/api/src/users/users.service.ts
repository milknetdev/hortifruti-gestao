import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private async resolveTenantId(tenantId: string): Promise<string> {
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      if (tenant) return tenant.id;
    }
    return tenantId;
  }

  async create(data: any, tenantId: string) {
    tenantId = await this.resolveTenantId(tenantId);
    const exists = await this.prisma.user.findFirst({ where: { email: data.email, tenantId } });
    if (exists) throw new ConflictException('Email já cadastrado nesta loja');
    const hashedPassword = await bcrypt.hash(data.password || '123456', 12);
    
    // Generate referral code
    const referralCode = this.generateReferralCode(data.name || 'User');
    
    return this.prisma.user.create({
      data: { ...data, password: hashedPassword, tenantId, referralCode },
      select: { id: true, email: true, name: true, role: true, active: true, referralCode: true, createdAt: true },
    });
  }

  private generateReferralCode(name: string): string {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const prefix = cleanName.substring(0, 4).padEnd(4, 'X');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${random}`;
  }

  async findAll(tenantId: string, query: { page?: number; limit?: number; search?: string; role?: string }) {
    tenantId = await this.resolveTenantId(tenantId);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (query.search) where.OR = [{ name: { contains: query.search } }, { email: { contains: query.search } }];
    if (query.role) where.role = query.role;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, email: true, name: true, role: true, active: true, phone: true, avatar: true, lastLoginAt: true, createdAt: true } }),
      this.prisma.user.count({ where }),
    ]);
    return { data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, tenantId: string) {
    tenantId = await this.resolveTenantId(tenantId);
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      include: { permissions: { include: { permission: true } } },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const { password, refreshToken, ...result } = user as any;
    return result;
  }

  async update(id: string, data: any, tenantId: string) {
    await this.findOne(id, tenantId);
    if (data.password) data.password = await bcrypt.hash(data.password, 12);
    return this.prisma.user.update({ where: { id }, data, select: { id: true, email: true, name: true, role: true, active: true } });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'Usuário removido' };
  }

  async updatePermissions(userId: string, permissionIds: string[]) {
    await this.prisma.userPermission.deleteMany({ where: { userId } });
    await this.prisma.userPermission.createMany({ data: permissionIds.map((pid) => ({ userId, permissionId: pid, granted: true })) });
    return { message: 'Permissões atualizadas' };
  }
}
