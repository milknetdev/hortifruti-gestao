import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeliveryService {
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
    return this.prisma.deliveryZone.create({ data: { ...data, tenantId } });
  }

  async findAll(tenantId: string) {
    tenantId = await this.resolveTenantId(tenantId);
    return this.prisma.deliveryZone.findMany({ where: { tenantId }, orderBy: { fee: 'asc' } });
  }

  async findOne(id: string, tenantId: string) {
    tenantId = await this.resolveTenantId(tenantId);
    const zone = await this.prisma.deliveryZone.findFirst({ where: { id, tenantId } });
    if (!zone) throw new NotFoundException('Zona de entrega não encontrada');
    return zone;
  }

  async calculateDelivery(tenantId: string, query: any) {
    tenantId = await this.resolveTenantId(tenantId);
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

  async getSettings(tenantId: string) {
    tenantId = await this.resolveTenantId(tenantId);
    const settings = await this.prisma.tenantSetting.findMany({
      where: { tenantId, group: 'delivery' },
    });
    
    const settingsMap: any = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });
    
    return {
      deliveryFee: Number(settingsMap.deliveryFee || 9.90),
      freeAbove: Number(settingsMap.freeAbove || 100),
      enabled: settingsMap.deliveryEnabled !== 'false',
    };
  }

  async updateSettings(tenantId: string, data: { deliveryFee?: number; freeAbove?: number; enabled?: boolean }) {
    tenantId = await this.resolveTenantId(tenantId);
    
    const updates = [];
    if (data.deliveryFee !== undefined) {
      updates.push(this.prisma.tenantSetting.upsert({
        where: { tenantId_key: { tenantId, key: 'deliveryFee' } },
        update: { value: String(data.deliveryFee) },
        create: { tenantId, key: 'deliveryFee', value: String(data.deliveryFee), group: 'delivery' },
      }));
    }
    if (data.freeAbove !== undefined) {
      updates.push(this.prisma.tenantSetting.upsert({
        where: { tenantId_key: { tenantId, key: 'freeAbove' } },
        update: { value: String(data.freeAbove) },
        create: { tenantId, key: 'freeAbove', value: String(data.freeAbove), group: 'delivery' },
      }));
    }
    if (data.enabled !== undefined) {
      updates.push(this.prisma.tenantSetting.upsert({
        where: { tenantId_key: { tenantId, key: 'deliveryEnabled' } },
        update: { value: String(data.enabled) },
        create: { tenantId, key: 'deliveryEnabled', value: String(data.enabled), group: 'delivery' },
      }));
    }
    
    await Promise.all(updates);
    return { message: 'Configurações atualizadas' };
  }
}
