import { IsString, IsNumber, IsBoolean, IsOptional, Min, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Tomate Orgânico' })
  @IsString()
  @MinLength(2, { message: 'Nome muito curto' })
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'TOM-001' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @ApiPropertyOptional({ example: '7891234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  barcode?: string;

  @ApiProperty({ example: 'category-uuid' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ example: 'supplier-uuid' })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'Tomate organico fresco' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiProperty({ example: 3.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Preco de custo nao pode ser negativo' })
  costPrice: number;

  @ApiProperty({ example: 6.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Preco de venda nao pode ser negativo' })
  salePrice: number;

  @ApiPropertyOptional({ example: 5.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  promotionalPrice?: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0, { message: 'Estoque nao pode ser negativo' })
  stock: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  minStock: number;

  @ApiPropertyOptional({ example: 0.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 'KG', enum: ['KG', 'UN', 'G', 'CX', 'L', 'PCT', 'DUZIA', 'MACO'] })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  promotional?: boolean;

  @ApiPropertyOptional({ example: 'tomate-organico' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  images?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  images?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  promotionalPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  promotional?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierId?: string;
}
