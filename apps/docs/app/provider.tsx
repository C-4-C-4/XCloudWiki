'use client';

import { RootProvider } from 'fumadocs-ui/provider/base';
import dynamic from 'next/dynamic';
import { type ReactNode, useEffect } from 'react';
import { TooltipProvider } from '@radix-ui/react-tooltip';

const SearchDialog = dynamic(() => import('@/components/layouts/search'), {
  ssr: false,
});

export function Provider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const uwuParam = urlParams.get("uwu");

    if (typeof uwuParam === 'string') {
      localStorage.setItem('uwu', uwuParam);
    }

    const item = localStorage.getItem('uwu');

    if (item === 'true') {
      document.documentElement.classList.add("uwu");
    }
  }, []);

  return (
    <RootProvider
      search={{
        SearchDialog,
      }}
    >
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </RootProvider>
  );
}
