import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  private async resolveTenantId(tenantId: string): Promise<string> {
    if (!tenantId) {
      const tenant = await this.prisma.tenant.findFirst();
      if (tenant) return tenant.id;
    }
    return tenantId;
  }

  private serializeValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  async getSettings(tenantId: string, group: string) {
    tenantId = await this.resolveTenantId(tenantId);
    const settings = await this.prisma.tenantSetting.findMany({
      where: { tenantId, group },
    });
    
    const settingsMap: any = {};
    settings.forEach(s => {
      // Try to parse JSON values back to objects
      try {
        if (s.value && s.value.startsWith('{')) {
          settingsMap[s.key] = JSON.parse(s.value);
        } else if (s.value === '[object Object]') {
          // Skip corrupted values
          settingsMap[s.key] = {};
        } else {
          settingsMap[s.key] = s.value;
        }
      } catch {
        settingsMap[s.key] = s.value;
      }
    });
    return settingsMap;
  }

  async updateSettings(tenantId: string, group: string, data: Record<string, any>) {
    tenantId = await this.resolveTenantId(tenantId);
    
    const updates = Object.entries(data)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => 
        this.prisma.tenantSetting.upsert({
          where: { tenantId_key: { tenantId, key } },
          update: { value: this.serializeValue(value) },
          create: { tenantId, key, value: this.serializeValue(value), group },
        })
      );
    
    await Promise.all(updates);
    return { message: 'Configurações atualizadas' };
  }

  async getProductDisplaySettings(tenantId: string) {
    const settings = await this.getSettings(tenantId, 'productDisplay');
    return {
      deliveryPromise: settings.deliveryPromise || 'Entrega rápida em até 2 horas',
      guarantee: settings.guarantee || 'Garantia de frescor ou devolvemos seu dinheiro',
      showStock: settings.showStock !== 'false',
      showDeliveryTime: settings.showDeliveryTime !== 'false',
    };
  }

  async updateProductDisplaySettings(tenantId: string, data: any) {
    return this.updateSettings(tenantId, 'productDisplay', data);
  }
}
