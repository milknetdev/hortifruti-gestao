import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { tenantId: string; userId?: string; type: string; title: string; message: string; data?: any }) {
    return this.prisma.notification.create({ data });
  }

  async findAll(tenantId: string, userId?: string, unreadOnly = false) {
    const where: any = { tenantId };
    if (userId) where.userId = userId;
    if (unreadOnly) where.read = false;
    return this.prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { read: true, readAt: new Date() } });
  }

  async markAllAsRead(tenantId: string, userId?: string) {
    const where: any = { tenantId, read: false };
    if (userId) where.userId = userId;
    await this.prisma.notification.updateMany({ where, data: { read: true, readAt: new Date() } });
    return { message: 'Notificações marcadas como lidas' };
  }

  async getUnreadCount(tenantId: string, userId?: string) {
    const where: any = { tenantId, read: false };
    if (userId) where.userId = userId;
    const count = await this.prisma.notification.count({ where });
    return { count };
  }
}
