import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: any = null;
  private memoryCache = new Map<string, { value: string; expires?: number }>();
  private logger = new Logger('RedisService');

  constructor(private config: ConfigService) {
    // Try to connect to Redis, fall back to in-memory cache
    try {
      const Redis = require('ioredis');
      this.client = new Redis({
        host: this.config.get('REDIS_HOST', 'localhost'),
        port: this.config.get('REDIS_PORT', 6379),
        password: this.config.get('REDIS_PASSWORD'),
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Don't retry - fail fast
      });
      this.client.on('error', () => {
        this.logger.warn('Redis indisponível - usando cache em memória');
        this.client = null;
      });
    } catch {
      this.logger.warn('Redis não instalado - usando cache em memória');
    }
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit().catch(() => {});
  }

  async get(key: string): Promise<string | null> {
    if (this.client) {
      try { return await this.client.get(key); } catch { /* fall through */ }
    }
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    if (entry.expires && Date.now() > entry.expires) {
      this.memoryCache.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (this.client) {
      try {
        if (ttl) await this.client.set(key, value, 'EX', ttl);
        else await this.client.set(key, value);
        return;
      } catch { /* fall through */ }
    }
    this.memoryCache.set(key, {
      value,
      expires: ttl ? Date.now() + ttl * 1000 : undefined,
    });
  }

  async del(key: string): Promise<void> {
    if (this.client) {
      try { await this.client.del(key); return; } catch { /* fall through */ }
    }
    this.memoryCache.delete(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (this.client) {
      try {
        const keys = await this.client.keys(pattern);
        if (keys.length) await this.client.del(...keys);
        return;
      } catch { /* fall through */ }
    }
    // For in-memory, do simple glob match
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) this.memoryCache.delete(key);
    }
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setJSON(key: string, value: any, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }
}
