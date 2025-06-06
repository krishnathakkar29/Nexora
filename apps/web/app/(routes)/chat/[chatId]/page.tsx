import ChatInterface from '@/components/pages/chat/[chatId]/chat-interface';
import { fetchAPIServer } from '@/lib/fetch-api-server';
import { getQueryClient } from '@/lib/get-query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import React from 'react';

async function page({ params }: { params: Promise<{ chatId: string }> }) {
	const { chatId } = await params;
	const queryClient = getQueryClient();

	await queryClient.prefetchQuery({
		queryKey: ['chatId', chatId],
		queryFn: async () => {
			const response = await fetchAPIServer({
				url: `/chat/${chatId}`,
				method: 'GET',
				requireAuth: true,
				throwOnError: false,
			});

			if (!response.success) {
				throw new Error(response.message || 'Failed to fetch email history');
			}

			return response.data;
		},
	});
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ChatInterface chatId={chatId} />
		</HydrationBoundary>
	);
}

export default page;
