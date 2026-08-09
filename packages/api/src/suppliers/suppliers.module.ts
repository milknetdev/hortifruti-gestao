import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SupplierPaymentsController } from './supplier-payments.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SuppliersController, SupplierPaymentsController],
  providers: [PrismaService],
})
export class SuppliersModule {}
