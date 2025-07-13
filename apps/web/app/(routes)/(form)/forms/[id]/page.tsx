import { ElementsType, FormElementInstance } from '@/components/pages/form/builder/form-element';
import FormLinkShare from '@/components/pages/form/form-link-share';
import StatsCard from '@/components/pages/form/stats-card';
import VisitBtn from '@/components/pages/form/visit-btn';
import { fetchAPIServer } from '@/lib/fetch-api-server';
import { Form } from '@workspace/db';
import { buttonVariants } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import { formatDistance } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';
import { FaWpforms } from 'react-icons/fa';
import { HiCursorClick } from 'react-icons/hi';
import { LuView } from 'react-icons/lu';
import { TbArrowBounce } from 'react-icons/tb';

async function page({
	params,
}: {
	params: Promise<{
		id: string;
	}>;
}) {
	const { id } = await params;
	const form = await fetchAPIServer<Form>({
		url: `/form/get/${id}`,
		method: 'GET',
		requireAuth: true,
		throwOnError: false,
	});

	if (!form.success) {
		console.log('Error fetching form:', form.message);
		return (
			<>
				<div className="flex flex-col items-center justify-center w-full h-full">
					<h2 className="text-lg font-semibold text-red-500">{form.message}</h2>
					<button
						className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
						// onClick={() => toast.error('Failed to load form. Try Reloading....')}
					>
						Retry
					</button>
				</div>
			</>
		);
	}

	const { visits, submissions } = form.data;

	let submissionRate = 0;

	if (visits > 0) {
		submissionRate = (submissions / visits) * 100;
	}

	const bounceRate = 100 - submissionRate;

	return (
		<>
			<div className="py-5 border-b border-muted">
				<Link href="/form">
					<ArrowLeft
						className={cn(
							buttonVariants({
								size: 'icon',
								variant: 'ghost',
							}),
							'my-4',
						)}
					/>
				</Link>
				<div className="flex justify-between container">
					<h1 className="text-4xl font-bold truncate">{form.data.name}</h1>
					<VisitBtn shareUrl={form.data.shareUrl} />
				</div>
			</div>
			<div className="py-4 border-b border-muted">
				<div className="container flex gap-2 items-center justify-between">
					<FormLinkShare shareUrl={form.data.shareUrl} />
				</div>
			</div>
			<div className="w-full pt-8 gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 container">
				<StatsCard
					title="Total visits"
					icon={<LuView className="text-blue-600" />}
					helperText="All time form visits"
					value={visits.toLocaleString() || ''}
					loading={false}
					className="shadow-md shadow-blue-600"
				/>

				<StatsCard
					title="Total submissions"
					icon={<FaWpforms className="text-yellow-600" />}
					helperText="All time form submissions"
					value={submissions.toLocaleString() || ''}
					loading={false}
					className="shadow-md shadow-yellow-600"
				/>

				<StatsCard
					title="Submission rate"
					icon={<HiCursorClick className="text-green-600" />}
					helperText="Visits that result in form submission"
					value={submissionRate.toLocaleString() + '%' || ''}
					loading={false}
					className="shadow-md shadow-green-600"
				/>

				<StatsCard
					title="Bounce rate"
					icon={<TbArrowBounce className="text-red-600" />}
					helperText="Visits that leaves without interacting"
					value={bounceRate.toLocaleString() + '%' || ''}
					loading={false}
					className="shadow-md shadow-red-600"
				/>
			</div>

			<div className="container pt-10">
				<SubmissionsTable id={form.data.id} />
			</div>
		</>
	);
}

type Row = { [key: string]: string } & {
	submittedAt: Date;
};

async function SubmissionsTable({ id }: { id: number }) {
	const form = await fetchAPIServer<
		Form & {
			FormSubmission: {
				id: number;
				createdAt: Date;
				content: string;
				formId: number;
			}[];
		}
	>({
		url: `/form/form-submissions/${id}`,
		method: 'GET',
		requireAuth: true,
		throwOnError: false,
	});
	if (!form.success) {
		throw new Error('form not found');
	}

	const formElements = JSON.parse(form.data.content) as FormElementInstance[];
	const columns: {
		id: string;
		label: string;
		required: boolean;
		type: ElementsType;
	}[] = [];

	formElements.forEach((element) => {
		switch (element.type) {
			case 'TextField':
			case 'NumberField':
			case 'TextAreaField':
			// case 'DateField':
			case 'SelectField':
			case 'CheckboxField':
				columns.push({
					id: element.id,
					label: element.extraAttributes?.label,
					required: element.extraAttributes?.required,
					type: element.type,
				});
				break;
			default:
				break;
		}
	});

	const rows: Row[] = [];
	form.data.FormSubmission.forEach((submission) => {
		const content = JSON.parse(submission.content);
		rows.push({
			...content,
			submittedAt: submission.createdAt,
		});
	});

	return (
		<>
			<h1 className="text-2xl font-bold my-4">Submissions</h1>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map((column) => (
								<TableHead key={column.id} className="uppercase">
									{column.label}
								</TableHead>
							))}
							<TableHead className="text-muted-foreground text-right uppercase">Submitted at</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((row, index) => (
							<TableRow key={index}>
								{columns.map((column) => (
									<RowCell key={column.id} type={column.type} value={row[column.id]!} />
								))}
								<TableCell className="text-muted-foreground text-right">
									{formatDistance(row.submittedAt, new Date(), {
										addSuffix: true,
									})}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</>
	);
}

function RowCell({ type, value }: { type: ElementsType; value: string }) {
	let node: ReactNode = value;

	switch (type) {
		case 'CheckboxField':
			const checked = value === 'true';
			node = <Checkbox checked={checked} disabled />;
			break;
	}

	return <TableCell>{String(node)}</TableCell>;
}

export default page;
