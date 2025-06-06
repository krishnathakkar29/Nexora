import Forms from '@/components/pages/form/forms';
import StatsCard from '@/components/pages/form/stats-card';
import { fetchAPIServer } from '@/lib/fetch-api-server';
import { getQueryClient } from '@/lib/get-query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Separator } from '@workspace/ui/components/separator';
import { ChartColumnBig, ChartNoAxesColumn, MousePointerClick, Waypoints } from 'lucide-react';

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
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Forms />
		</HydrationBoundary>
	);
}

export default page;
