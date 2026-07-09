import { Module } from '@nestjs/common';
import { FeatureBannersController } from './feature-banners.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FeatureBannersController],
})
export class FeatureBannersModule {}
