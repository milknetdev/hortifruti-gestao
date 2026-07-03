'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      // Set cookie for 30 days
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `referral_code=${ref};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
      
      // Track the referral via API
      fetch(`https://hortifruti-gestao.onrender.com/api/v1/referral/track/${ref}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('Referral tracked:', data.data.sellerName);
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  return null;
}
