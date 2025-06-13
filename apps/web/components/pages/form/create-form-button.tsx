'use client';
import { fetchAPI } from '@/lib/fetch-api';
import { formSchema } from '@/types/form/create-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

function CreateFormButton() {
	const queryClient = useQueryClient();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});
	const router = useRouter();

	const { mutate: mutateCreateForm, isPending: isCreatingForm } = useMutation({
		mutationKey: ['create-form'],
		mutationFn: async (data: z.infer<typeof formSchema>) => {
			const response = await fetchAPI({
				url: '/form/create',
				body: data,
				method: 'POST',
				requireAuth: true,
			});
			if (!response.success) {
				throw new Error(response.message || 'Failed to create form');
			}

			return response.data;
		},
	});

	const handleSubmit = async (data: z.infer<typeof formSchema>) => {
		mutateCreateForm(data, {
			onSuccess: ({ formId }) => {
				toast.success('Form created successfully. Redirecting to builder.....', {
					duration: 2000,
				});
				queryClient.invalidateQueries({ queryKey: ['all-forms-key'] });
				queryClient.invalidateQueries({ queryKey: ['forms-stats'] });
				router.push(`/builder/${formId}`);
			},
			onError: (err) => {
				toast.error('Error creating chat');
				console.error('on error wala part', err);
			},
		});
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant={'outline'}
					className="group border border-primary/20 h-[190px] items-center justify-center flex flex-col hover:border-primary hover:cursor-pointer border-dashed gap-4"
				>
					<Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
					<p className="font-bold text-xl text-muted-foreground group-hover:text-primary">Create new form</p>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create form</DialogTitle>
					<DialogDescription>Create a new form to start collecting responses</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea rows={5} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>
				<DialogFooter>
					<Button
						onClick={form.handleSubmit(handleSubmit)}
						disabled={form.formState.isSubmitting || isCreatingForm}
						className="w-full mt-4"
					>
						{!form.formState.isSubmitting && !isCreatingForm && <span>Save</span>}
						{form.formState.isSubmitting && !isCreatingForm && <Loader2 className="animate-spin" />}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default CreateFormButton;
