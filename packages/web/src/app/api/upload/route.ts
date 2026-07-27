import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Arquivo muito grande. Máximo 5MB.' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(`uploads/${file.name}`, file, {
      access: 'public',
    });

    return NextResponse.json({
      success: true,
      data: {
        url: blob.url,
        pathname: blob.pathname,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao enviar arquivo' },
      { status: 500 }
    );
  }
}
