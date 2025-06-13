import Forms from '@/components/pages/form/forms';
import { fetchAPIServer } from '@/lib/fetch-api-server';
import { getQueryClient } from '@/lib/get-query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

async function page() {
	const queryClient = getQueryClient();

	await queryClient.prefetchQuery({
		queryKey: ['forms-stats'],
		queryFn: async () => {
			const response = await fetchAPIServer({
				url: `/form/get-stats`,
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

	await queryClient.prefetchQuery({
		queryKey: ['all-forms-key'],
		queryFn: async () => {
			const response = await fetchAPIServer({
				url: '/form/get-all',
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
			<Forms />
		</HydrationBoundary>
	);
}

export default page;
