'use client';

import { Suspense } from 'react';
import { Header } from '@/components/store/header';
import { Footer } from '@/components/store/footer';
import { ReferralTracker } from '@/components/store/referral-tracker';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50/50">
      <Suspense fallback={null}>
        <ReferralTracker />
      </Suspense>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
