import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: any, folder = 'uploads'): Promise<{ url: string; key: string }> {
    if (!file) throw new BadRequestException('Arquivo não fornecido');
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
    const filePath = path.join(this.uploadDir, key);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return { message: 'Arquivo removido' };
  }
}
