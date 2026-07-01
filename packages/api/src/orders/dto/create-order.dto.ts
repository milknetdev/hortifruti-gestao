import { IsString, IsArray, IsNumber, IsOptional, IsEnum, ValidateNested, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'product-uuid' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1, { message: 'Quantidade minima e 1' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 'customer-uuid' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({ example: 'delivery', enum: ['delivery', 'pickup'] })
  @IsEnum(['delivery', 'pickup'], { message: 'Tipo de entrega invalido' })
  deliveryType: 'delivery' | 'pickup';

  @ApiPropertyOptional({ example: 'address-uuid' })
  @IsOptional()
  @IsString()
  deliveryAddressId?: string;

  @ApiProperty({ example: 'pix', enum: ['pix', 'credit_card', 'debit_card', 'cash', 'pay_on_delivery', 'pay_on_pickup'] })
  @IsEnum(['pix', 'credit_card', 'debit_card', 'cash', 'pay_on_delivery', 'pay_on_pickup'], { message: 'Metodo de pagamento invalido' })
  paymentMethod: string;

  @ApiPropertyOptional({ example: 'Cupom de desconto' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  couponCode?: string;

  @ApiPropertyOptional({ example: 'Sem cebola, por favor' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'PROCESSING', enum: ['PENDING', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'PICKUP_AVAILABLE', 'PICKED_UP'] })
  @IsEnum(['PENDING', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'PICKUP_AVAILABLE', 'PICKED_UP'])
  status: string;

  @ApiPropertyOptional({ example: 'Pedido cancelado pelo cliente' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
