import { Module } from '@nestjs/common';
import { QuickLinksController } from './quick-links.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuickLinksController],
})
export class QuickLinksModule {}
