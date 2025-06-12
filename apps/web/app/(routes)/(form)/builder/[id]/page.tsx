import FormBuider from '@/components/pages/form/builder/form-buider';
import { fetchAPIServer } from '@/lib/fetch-api-server';
import { Form } from '@workspace/db';
import { toast } from 'sonner';

async function page({
	params,
}: {
	params: Promise<{
		id: string;
	}>;
}) {
	const { id } = await params;

	const form = await fetchAPIServer<Form>({
		url: `/form/${id}`,
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
						onClick={() => toast.error('Failed to load form. Try Reloading....')}
					>
						Retry
					</button>
				</div>
			</>
		);
	}

	return <FormBuider form={form.data} />;
}

export default page;
