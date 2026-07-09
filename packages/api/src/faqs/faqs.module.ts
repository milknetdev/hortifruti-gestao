import { Module } from '@nestjs/common';
import { FaqsController } from './faqs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FaqsController],
})
export class FaqsModule {}
