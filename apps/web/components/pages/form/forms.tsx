'use client';
import FormCardSkeleton from '@/components/skeleton/form-card-skeleton';
import { fetchAPI } from '@/lib/fetch-api';
import { useQuery } from '@tanstack/react-query';
import { Form } from '@workspace/db';
import { Badge } from '@workspace/ui/components/badge';
import { buttonVariants } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Separator } from '@workspace/ui/components/separator';
import { cn } from '@workspace/ui/lib/utils';
import { formatDistance } from 'date-fns';
import { ChartColumnBig, ChartNoAxesColumn, MousePointerClick, Waypoints } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { BiRightArrowAlt } from 'react-icons/bi';
import { FaWpforms } from 'react-icons/fa';
import { LuView } from 'react-icons/lu';
import CreateFormButton from './create-form-button';
import StatsCard from './stats-card';

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

	const {
		data: allForms,
		isLoading: isAllFormsLoading,
		isError: allFormsIsError,
		error: allFormsError,
		refetch: allFormsRefetch,
	} = useQuery<Form[]>({
		queryKey: ['all-forms-key'],
		queryFn: async () => {
			const response = await fetchAPI({
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
				<Suspense
					fallback={[1, 2, 3, 4].map((el) => (
						<FormCardSkeleton key={el} />
					))}
				>
					{isAllFormsLoading ? (
						<>
							{[1, 2, 3, 4].map((el) => (
								<FormCardSkeleton key={el} />
							))}
						</>
					) : allFormsIsError ? (
						<>
							<div className="col-span-3 text-red-500">Failed to load forms: {allFormsError.message}</div>
							<button onClick={() => allFormsRefetch()} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">
								Retry
							</button>
						</>
					) : allForms && allForms.length > 0 ? (
						<>
							{allForms.map((form) => (
								<FormCard key={form.id} form={form} />
							))}
						</>
					) : (
						<>
							<div className="col-span-3 text-gray-500">No forms found. Create a new form to get started.</div>
						</>
					)}
				</Suspense>
			</div>
		</div>
	);
}

export function FormCard({ form }: { form: Form }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 justify-between">
					<span className="truncate font-bold">{form.name}</span>
					{form.published && <Badge>Published</Badge>}
					{!form.published && <Badge variant={'destructive'}>Draft</Badge>}
				</CardTitle>
				<CardDescription className="flex items-center justify-between text-muted-foreground text-sm">
					{formatDistance(form.createdAt, new Date(), {
						addSuffix: true,
					})}
					{form.published && (
						<span className="flex items-center gap-2">
							<LuView className="text-muted-foreground" />
							<span>{form.visits.toLocaleString()}</span>
							<FaWpforms className="text-muted-foreground" />
							<span>{form.submissions.toLocaleString()}</span>
						</span>
					)}
				</CardDescription>
			</CardHeader>
			<CardContent className="h-[20px] truncate text-sm text-muted-foreground">
				{form.description || 'No description'}
			</CardContent>
			<CardFooter>
				{form.published && (
					<Link
						href={`/form/forms/${form.id}`}
						className={cn(
							buttonVariants({
								variant: 'secondary',
								className: 'w-full mt-2 text-md gap-4',
							}),
						)}
					>
						View submissions <BiRightArrowAlt />
					</Link>
				)}
				{!form.published && (
					<Link
						href={`/builder/${form.id}`}
						className={cn(
							buttonVariants({
								variant: 'default',
								className: 'w-full mt-2 text-md gap-4',
							}),
						)}
					>
						Edit form
					</Link>
				)}
			</CardFooter>
		</Card>
	);
}
export default Forms;
