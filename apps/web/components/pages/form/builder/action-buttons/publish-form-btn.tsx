import { fetchAPI } from '@/lib/fetch-api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@workspace/ui/components/alert-dialog';
import { Button } from '@workspace/ui/components/button';
import { Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

function PublishFormBtn({ id }: { id: number }) {
	const [loading, startTransition] = useTransition();
	const router = useRouter();

	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			const response = await fetchAPI({
				url: '/form/publish',
				method: 'POST',
				body: {
					id,
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
		onSuccess(data, variables, context) {
			toast.success('Your form has been published successfully');

			queryClient.invalidateQueries({
				queryKey: ['forms-stats', id],
			});
		},
	});

	async function publishForm() {
		try {
			await mutate();
			router.refresh();
		} catch (error) {
			console.error(error);
			toast.error('Error publishing form');
		}
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button className="gap-2 text-white bg-gradient-to-r from-indigo-400 to-cyan-400">
					<Upload className="h-4 w-4" />
					Publish
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. After publishing you will not be able to edit this form. <br />
						<br />
						<span className="font-medium">
							By publishing this form you will make it available to the public and you will be able to collect
							submissions.
						</span>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						disabled={loading}
						onClick={(e) => {
							e.preventDefault();
							startTransition(publishForm);
						}}
					>
						Proceed {loading && <Loader2 className="animate-spin" />}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default PublishFormBtn;
