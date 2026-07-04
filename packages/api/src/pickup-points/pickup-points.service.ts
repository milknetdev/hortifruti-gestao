import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PickupPointsService {
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
    return this.prisma.pickupPoint.create({
      data: {
        tenantId,
        name: data.name,
        address: data.address,
        zipCode: data.zipCode,
        city: data.city,
        state: data.state,
        neighborhood: data.neighborhood,
        complement: data.complement,
        reference: data.reference,
        phone: data.phone,
        startTime: data.startTime || '08:00',
        endTime: data.endTime || '18:00',
        availableDays: data.availableDays || '[1,2,3,4,5]',
      },
    });
  }

  async findAll(tenantId: string) {
    tenantId = await this.resolveTenantId(tenantId);
    return this.prisma.pickupPoint.findMany({
      where: { tenantId, active: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    tenantId = await this.resolveTenantId(tenantId);
    return this.prisma.pickupPoint.findFirst({ where: { id, tenantId } });
  }

  async update(id: string, data: any, tenantId: string) {
    tenantId = await this.resolveTenantId(tenantId);
    return this.prisma.pickupPoint.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    tenantId = await this.resolveTenantId(tenantId);
    return this.prisma.pickupPoint.delete({ where: { id } });
  }
}
