import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, tenantId: string) {
    return this.prisma.deliveryZone.create({ data: { ...data, tenantId } });
  }

  async findAll(tenantId: string) {
    return this.prisma.deliveryZone.findMany({ where: { tenantId }, orderBy: { fee: 'asc' } });
  }

  async findOne(id: string, tenantId: string) {
    const zone = await this.prisma.deliveryZone.findFirst({ where: { id, tenantId } });
    if (!zone) throw new NotFoundException('Zona de entrega não encontrada');
    return zone;
  }

  async calculateDelivery(tenantId: string, query: any) {
    const zones = await this.prisma.deliveryZone.findMany({ where: { tenantId, active: true } });
    const matching = zones.filter((z) => {
      try {
        const neighborhoods = JSON.parse(z.neighborhoods || '[]');
        const cities = JSON.parse(z.cities || '[]');
        const zipCodes = JSON.parse(z.zipCodes || '[]');
        return (query.neighborhood && neighborhoods.includes(query.neighborhood)) ||
               (query.city && cities.includes(query.city)) ||
               (query.zipCode && zipCodes.includes(query.zipCode));
      } catch { return false; }
    });

    if (matching.length === 0) return { available: false, message: 'Entrega não disponível para esta região' };
    const zone = matching[0];
    const orderTotal = Number(query.orderTotal || 0);
    const fee = zone.freeAbove && orderTotal >= Number(zone.freeAbove) ? 0 : Number(zone.fee);

    return { available: true, zone: { id: zone.id, name: zone.name }, fee, freeDelivery: fee === 0, estimatedDays: zone.estimatedDays, estimatedMinutes: zone.estimatedMinutes };
  }

  async update(id: string, data: any, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.deliveryZone.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.deliveryZone.delete({ where: { id } });
    return { message: 'Zona removida' };
  }
}
