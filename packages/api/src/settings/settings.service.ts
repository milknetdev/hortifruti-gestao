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

  async getSettings(tenantId: string, group: string) {
    tenantId = await this.resolveTenantId(tenantId);
    const settings = await this.prisma.tenantSetting.findMany({
      where: { tenantId, group },
    });
    
    const settingsMap: any = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });
    return settingsMap;
  }

  async updateSettings(tenantId: string, group: string, data: Record<string, any>) {
    tenantId = await this.resolveTenantId(tenantId);
    
    const updates = Object.entries(data).map(([key, value]) => 
      this.prisma.tenantSetting.upsert({
        where: { tenantId_key: { tenantId, key } },
        update: { value: String(value) },
        create: { tenantId, key, value: String(value), group },
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
