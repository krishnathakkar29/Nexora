import { FormElementInstance } from '@/components/pages/form/builder/form-element';
import FormSubmitComponent from '@/components/pages/form/form-submit-component';
import { fetchAPIServer } from '@/lib/fetch-api-server';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

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
		return (
			<>
				<div className="flex flex-col items-center justify-center w-full h-full">
					<h2 className="text-lg font-semibold text-red-500">
						{form.message.startsWith('Prisma')
							? 'Invalid form URL, please check the form link again!'
							: form.message || 'Failed to load form'}
					</h2>
					<Link
						href="/" // Replace with your actual platform URL
						target="_blank"
						rel="noopener noreferrer"
						className="mt-6 flex flex-col items-center text-lg text-muted-foreground hover:text-foreground transition-colors group"
					>
						<div className="flex items-center gap-1.5">
							<span>Crafted with</span>
							<Sparkles className="h-3.5 w-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
							<span className="font-semibold">Nexora</span>
						</div>
						<span className="mt-0.5 text-[10px] opacity-80 group-hover:opacity-100 transition-opacity">
							Discover how!
						</span>
					</Link>
				</div>
			</>
		);
	}

	const formContent = JSON.parse(form.data.content) as FormElementInstance[];
	return <FormSubmitComponent formUrl={formUrl} content={formContent} />;
}

export default page;
