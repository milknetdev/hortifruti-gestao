import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@hortifruti.com' })
  @IsEmail({}, { message: 'Email invalido' })
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  @MaxLength(100, { message: 'Senha muito longa' })
  password: string;
}

export class CustomerLoginDto extends LoginDto {
  @ApiProperty({ example: 'tenant-id' })
  @IsString()
  tenantId: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'admin@hortifruti.com' })
  @IsEmail({}, { message: 'Email invalido' })
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'Joao Silva' })
  @IsString()
  @MinLength(2, { message: 'Nome muito curto' })
  @MaxLength(100)
  name: string;
}

export class CustomerRegisterDto {
  @ApiProperty({ example: 'cliente@email.com' })
  @IsEmail({}, { message: 'Email invalido' })
  email: string;

  @ApiProperty({ example: 'Cliente@123' })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'Maria Santos' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '(11) 99999-9999', required: false })
  @IsString()
  phone?: string;

  @ApiProperty({ example: '123.456.789-00', required: false })
  @IsString()
  cpf?: string;

  @ApiProperty({ example: 'tenant-id' })
  @IsString()
  tenantId: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
