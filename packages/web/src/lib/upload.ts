/**
 * Upload a file to Vercel Blob via Next.js API route
 * @param file - The file to upload
 * @returns The URL of the uploaded file
 */
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao enviar arquivo' }));
    throw new Error(error.message || 'Erro ao enviar arquivo');
  }

  const result = await response.json();
  return result.data?.url || result.url;
}
