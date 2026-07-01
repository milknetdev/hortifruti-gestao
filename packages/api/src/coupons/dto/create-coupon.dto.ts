import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsDateString, Min, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty({ example: 'BEMVINDO10' })
  @IsString()
  @MinLength(3, { message: 'Codigo muito curto' })
  @MaxLength(30)
  code: string;

  @ApiPropertyOptional({ example: 'Cupom de boas-vindas' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ example: 'PERCENTAGE', enum: ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING'] })
  @IsEnum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING'], { message: 'Tipo de cupom invalido' })
  type: string;

  @ApiProperty({ example: 10 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  usageLimit?: number;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
