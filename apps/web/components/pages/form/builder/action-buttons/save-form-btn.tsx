'use client';
import useDesigner from '@/hooks/use-designer';
import { fetchAPI } from '@/lib/fetch-api';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Loader2, Save } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';

function SaveFormBtn({ id }: { id: number }) {
	const { elements } = useDesigner();
	const [loading, startTransition] = useTransition();

	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			const response = await fetchAPI({
				url: '/form/update',
				method: 'POST',
				body: {
					id,
					content: JSON.stringify(elements),
				},
				requireAuth: true,
				throwOnError: false,
			});
			if (!response.success) {
				toast.error(response.message || 'Failed to upload file');
				return;
			}

			return response.data;
		},
		onSuccess() {
			toast.success('Form saved successfully');
		},
	});

	const updateFormContent = async () => {
		try {
			await mutate();
		} catch (error) {
			console.error(error);
			toast.error('Error saving form');
		}
	};

	return (
		<Button
			variant={'outline'}
			className="gap-2"
			disabled={loading}
			onClick={() => {
				startTransition(updateFormContent);
			}}
		>
			<Save className="h-4 w-4" />
			Save
			{isPending && <Loader2 className="animate-spin" />}
		</Button>
	);
}

export default SaveFormBtn;
