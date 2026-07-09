import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import toast, { Toaster, ToastBar } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HortiFruti - Frutas, Verduras e Legumes Frescos',
  description:
    'Sua hortifrúti online com as melhores frutas, verduras e legumes frescos entregues na sua porta. Qualidade garantida e preços imbatíveis.',
  keywords: [
    'hortifruti',
    'frutas',
    'verduras',
    'legumes',
    'orgânicos',
    'delivery',
    'online',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: '8px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#16a34a',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <span onClick={() => toast.dismiss(t.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {icon}
                  {message}
                  {t.type !== 'loading' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
                      style={{ background: 'none', border: 'none', padding: '0 0 0 8px', cursor: 'pointer', color: '#999', fontSize: '16px', lineHeight: 1 }}
                    >
                      ✕
                    </button>
                  )}
                </span>
              )}
            </ToastBar>
          )}
        </Toaster>
      </body>
    </html>
  );
}
