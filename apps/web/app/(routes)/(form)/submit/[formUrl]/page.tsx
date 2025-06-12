import { FormElementInstance } from '@/components/pages/form/builder/form-element';
import FormSubmitComponent from '@/components/pages/form/form-submit-component';
import { fetchAPIServer } from '@/lib/fetch-api-server';
import { toast } from 'sonner';

type FormContent = {
	content: string;
};

async function page({
	params,
}: {
	params: Promise<{
		formUrl: string;
	}>;
}) {
	const { formUrl } = await params;

	const form = await fetchAPIServer<FormContent>({
		url: `/form/url/${formUrl}`,
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

	if (!form) {
		throw new Error('form not found');
	}

	const formContent = JSON.parse(form.data.content) as FormElementInstance[];
	return <FormSubmitComponent formUrl={formUrl} content={formContent} />;
}

export default page;
