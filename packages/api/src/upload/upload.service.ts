import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private supabase: any;
  private uploadDir: string;

  constructor(private config: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    const supabaseUrl = this.config.get('SUPABASE_URL');
    const supabaseKey = this.config.get('SUPABASE_SERVICE_KEY') || this.config.get('SUPABASE_ANON_KEY');

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async upload(file: any, folder = 'uploads'): Promise<{ url: string; key: string }> {
    if (!file) throw new BadRequestException('Arquivo não fornecido');

    // Se Supabase estiver configurado, usa Supabase Storage
    if (this.supabase) {
      const ext = file.originalname.split('.').pop();
      const key = folder + '/' + uuid() + '.' + ext;

      const { data, error } = await this.supabase.storage
        .from('uploads')
        .upload(key, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) throw new BadRequestException('Erro ao fazer upload: ' + error.message);

      const { data: urlData } = this.supabase.storage
        .from('uploads')
        .getPublicUrl(key);

      return { url: urlData.publicUrl, key };
    }

    // Fallback: salva localmente (apenas desenvolvimento)
    const ext = file.originalname.split('.').pop();
    const key = folder + '/' + uuid() + '.' + ext;
    const filePath = path.join(this.uploadDir, key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, file.buffer);
    return { url: '/uploads/' + key, key };
  }

  async uploadMultiple(files: any[], folder = 'uploads') {
    return Promise.all(files.map((file) => this.upload(file, folder)));
  }

  async delete(key: string) {
    if (this.supabase) {
      const { error } = await this.supabase.storage
        .from('uploads')
        .remove([key]);

      if (error) throw new BadRequestException('Erro ao remover arquivo: ' + error.message);
      return { message: 'Arquivo removido' };
    }

    // Fallback: remove localmente
    const filePath = path.join(this.uploadDir, key);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return { message: 'Arquivo removido' };
  }
}
