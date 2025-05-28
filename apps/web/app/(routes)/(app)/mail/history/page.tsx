import MailSentTable from '@/components/pages/mail/history/mail-sent-table';
import { fetchAPIServer } from '@/lib/fetch-api-server';
import { getQueryClient } from '@/lib/get-query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

async function page() {
	const queryClient = getQueryClient();

	await queryClient.prefetchQuery({
		queryKey: ['mail-history'],
		queryFn: async () => {
			const response = await fetchAPIServer({
				url: '/mail/history',
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
		<div className="container mx-auto py-8 px-4">
			<div className="space-y-6">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Sent Emails</h1>
					<p className="text-muted-foreground">View and manage all emails you've sent to your contacts.</p>
				</div>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<MailSentTable />
				</HydrationBoundary>
			</div>
		</div>
	);
}

export default page;
