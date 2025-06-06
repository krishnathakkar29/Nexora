'use client';
import { fetchAPI } from '@/lib/fetch-api';
import StatsCard from './stats-card';
import { ChartColumnBig, ChartNoAxesColumn, MousePointerClick, Waypoints } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Separator } from '@workspace/ui/components/separator';
import CreateFormButton from './create-form-button';

type FormStatsType = {
	visits: number;
	submissions: number;
	submissionRate: string;
	bounceRate: string;
};

function Forms() {
	const { data, isLoading, isError, error, refetch } = useQuery<FormStatsType>({
		queryKey: ['forms-stats'],
		queryFn: async () => {
			const response = await fetchAPI({
				url: '/form/get-stats',
				method: 'POST',
				requireAuth: true,
				throwOnError: false,
			});

			if (!response.success) {
				throw new Error(response.message || 'Failed to fetch email history');
			}

			return response.data;
		},
	});

	if (isError) {
		console.error('Error fetching form stats:', error);
		return (
			<div className="flex items-center justify-center w-full h-full p-4 bg-red-100 text-red-800 rounded-md">
				<span className="text-red-500">Failed to load form stats</span>
				<button onClick={() => refetch()} className="ml-2 text-blue-500 underline">
					Retry
				</button>
			</div>
		);
	}

	return (
		<div className="w-full mx-auto container pt-4">
			<div className="w-full pt-8 gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
				<StatsCard
					title="Total visits"
					icon={<ChartNoAxesColumn className="text-blue-600" />}
					helperText="All time form visits"
					loading={isLoading}
					value={data?.visits.toLocaleString() || ''}
					className="shadow-md shadow-blue-600"
				/>
				<StatsCard
					title="Total submissions"
					icon={<ChartColumnBig className="text-yellow-600" />}
					loading={isLoading}
					helperText="All time form submissions"
					value={data?.submissions.toLocaleString() || ''}
					className="shadow-md shadow-yellow-600"
				/>

				<StatsCard
					title="Submission rate"
					icon={<MousePointerClick className="text-green-600" />}
					loading={isLoading}
					helperText="Visits that result in form submission"
					value={data?.submissionRate.toLocaleString() + '%' || ''}
					className="shadow-md shadow-green-600"
				/>

				<StatsCard
					title="Bounce rate"
					icon={<Waypoints className="text-red-600" />}
					loading={isLoading}
					helperText="Visits that leaves without interacting"
					value={data?.submissionRate.toLocaleString() + '%' || ''}
					className="shadow-md shadow-red-600"
				/>
			</div>
			<Separator className="my-6" />
			<h2 className="text-4xl font-bold col-span-2">Your forms</h2>
			<Separator className="my-6" />
			<div className="grid gric-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<CreateFormButton />
				{/*<Suspense
					fallback={[1, 2, 3, 4].map((el) => (
						<FormCardSkeleton key={el} />
					))}
				>
					<FormCards />
				</Suspense> */}
			</div>
		</div>
	);
}

export default Forms;
