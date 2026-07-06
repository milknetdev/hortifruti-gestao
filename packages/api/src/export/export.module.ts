import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExportController],
})
export class ExportModule {}
