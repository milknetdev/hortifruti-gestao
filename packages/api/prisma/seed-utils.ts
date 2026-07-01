import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Utilitarios para o script de seed do banco de dados.
 */

/**
 * Gera hash de uma senha usando bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verifica se uma senha corresponde ao hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Gera um SKU unico para produto.
 */
export function generateSku(prefix: string, sequence: number): string {
  return `${prefix}-${String(sequence).padStart(3, '0')}`;
}

/**
 * Gera uma data aleatória dentro de um intervalo.
 */
export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Formata valor em BRL.
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Gera slug a partir de um nome.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Cria ou atualiza um registro de forma segura (upsert genérico).
 */
export async function safeUpsert<T>(
  findFn: () => Promise<T | null>,
  createFn: () => Promise<T>,
  updateFn: (existing: T) => Promise<T>,
): Promise<T> {
  const existing = await findFn();
  if (existing) {
    return updateFn(existing);
  }
  return createFn();
}

/**
 * Log formatado para o seed.
 */
export function seedLog(entity: string, count: number, action: string = 'criado(s)'): void {
  console.log(`   ✅ ${count} ${entity} ${action}`);
}

/**
 * Valida se o banco esta acessível.
 */
export async function checkDatabaseConnection(prisma: PrismaClient): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    return false;
  }
}

/**
 * Executa seed de forma transacional.
 */
export async function withTransaction<T>(
  prisma: PrismaClient,
  callback: (tx: any) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return callback(tx);
  });
}

/**
 * Constantes usadas no seed.
 */
export const SEED_CONSTANTS = {
  DEFAULT_TENANT_SLUG: 'hortifruti-central',
  ADMIN_EMAIL: 'admin@hortifruti.com',
  ADMIN_PASSWORD: 'Admin@123',
  CUSTOMER_EMAIL: 'cliente@exemplo.com',
  CUSTOMER_PASSWORD: 'Cliente@123',
  CURRENCY: 'BRL',
  TIMEZONE: 'America/Sao_Paulo',
} as const;
