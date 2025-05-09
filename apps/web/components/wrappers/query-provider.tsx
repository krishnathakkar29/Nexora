'use client';
import React from 'react';

import { getQueryClient } from '@/lib/get-query-client';
import { QueryClientProvider } from '@tanstack/react-query';

export default function QueryProviderWrapper({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
