import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Usuario nao autenticado');

    // Super admin bypasses tenant check
    if (user.role === 'SUPER_ADMIN') {
      // For super admin, allow optional tenantId from header
      const tenantId = request.headers['x-tenant-id'];
      if (tenantId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (tenant && tenant.active) request.tenant = tenant;
      }
      return true;
    }

    if (!user.tenantId) throw new ForbiddenException('Usuario sem loja vinculada');

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });

    if (!tenant || !tenant.active) {
      throw new ForbiddenException('Loja nao encontrada ou inativa');
    }

    request.tenant = tenant;
    return true;
  }
}
