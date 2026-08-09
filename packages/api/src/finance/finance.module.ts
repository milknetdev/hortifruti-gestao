import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { SupplierPaymentsController } from './supplier-payments.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FinanceController, SupplierPaymentsController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
