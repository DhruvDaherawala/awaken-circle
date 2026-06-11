'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // Determine if the current route is an administrative route
  const isAdminRoute = pathname && pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdminRoute) {
      document.documentElement.classList.add('admin-mode');
      document.body.classList.add('admin-mode');
    } else {
      document.documentElement.classList.remove('admin-mode');
      document.body.classList.remove('admin-mode');
    }
    return () => {
      document.documentElement.classList.remove('admin-mode');
      document.body.classList.remove('admin-mode');
    };
  }, [isAdminRoute]);

  return (
    <main 
      className={`flex-grow ${isAdminRoute ? 'h-screen overflow-y-auto' : 'overflow-hidden pt-[88px]'}`}
      style={isAdminRoute ? { backgroundColor: '#0D0D0D' } : undefined}
    >
      {children}
    </main>
  );
}

