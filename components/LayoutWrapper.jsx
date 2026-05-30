'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // Determine if the current route is an administrative route
  const isAdminRoute = pathname && pathname.startsWith('/admin');

  return (
    <main className={`flex-grow overflow-hidden ${isAdminRoute ? '' : 'pt-[88px]'}`}>
      {children}
    </main>
  );
}
