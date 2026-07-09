import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { StockModule } from './stock/stock.module';
import { FinanceModule } from './finance/finance.module';
import { CommissionsModule } from './commissions/commissions.module';
import { ReferralModule } from './referral/referral.module';
import { CouponsModule } from './coupons/coupons.module';
import { DeliveryModule } from './delivery/delivery.module';
import { PickupPointsModule } from './pickup-points/pickup-points.module';
import { SettingsModule } from './settings/settings.module';
import { ExportModule } from './export/export.module';
import { AuditModule } from './audit/audit.module';
import { FeatureBannersModule } from './feature-banners/feature-banners.module';
import { ImagesModule } from './images/images.module';
import { PaymentsModule } from './payments/payments.module';
import { BannersModule } from './banners/banners.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadModule } from './upload/upload.module';
import { AddressesModule } from './addresses/addresses.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    RedisModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    CustomersModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    StockModule,
    FinanceModule,
    CommissionsModule,
    ReferralModule,
    CouponsModule,
    DeliveryModule,
    PickupPointsModule,
    SettingsModule,
    ExportModule,
    AuditModule,
    FeatureBannersModule,
    ImagesModule,
    PaymentsModule,
    BannersModule,
    DashboardModule,
    NotificationsModule,
    UploadModule,
    AddressesModule,
    FavoritesModule,
  ],
})
export class AppModule {}
