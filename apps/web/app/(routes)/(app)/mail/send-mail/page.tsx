'use client';
import React, { useCallback, useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/form';
import { Loader2, Paperclip, Send, X } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { useFieldArray, useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import MDEditor from '@uiw/react-md-editor';
import { Textarea } from '@workspace/ui/components/textarea';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendEmailSchema } from '@workspace/common/zod/schema/mail';
import { fetchAPI } from '@/lib/fetch-api';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
function page() {
	const [files, setFiles] = useState<File[]>([]);
	const [isMarkdown, setIsMarkdown] = useState(false);

	const queryClient = useQueryClient();

	const form = useForm<z.infer<typeof sendEmailSchema>>({
		resolver: zodResolver(sendEmailSchema),
		defaultValues: {
			recipients: [{ email: '' }],
			subject: '',
			platform: '',
			companyName: '',
			body: '',
		},
	});

	const { fields, append, remove } = useFieldArray({
		name: 'recipients',
		control: form.control,
	});

	const onDrop = useCallback((acceptedFiles: File[]) => {
		setFiles((prev) => [...prev, ...acceptedFiles]);
	}, []);

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: {
			'application/pdf': ['.pdf'],
			'image/*': ['.png', '.jpg', '.jpeg'],
			'application/msword': ['.doc', '.docx'],
		},
	});

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const { mutate: sendEmailMutation, isPending } = useMutation({
		mutationFn: async (data: any) => {
			try {
				const formData = new FormData();
				data.recipients.forEach((recipient: { email: string }) => {
					formData.append('recipients', recipient.email);
				});

				const formattedBody = data.body.replace(/\n/g, '<br>');
				formData.append('subject', data.subject);
				formData.append('platform', data.platform);
				formData.append('companyName', data.companyName);
				formData.append('body', formattedBody);

				files.forEach((file) => {
					formData.append('files', file);
				});

				const response = await fetchAPI({
					url: '/mail/send',
					method: 'POST',
					body: formData,
					throwOnError: true,
					requireAuth: false,
				});

				console.log('Response:', response);
				if (!response.success) {
					toast.error(response.message);
					return;
				}

				return response;
			} catch (error) {
				console.error('Error submitting form:', error);
			}
		},
		onSuccess: (data: any) => {
			console.log('Email sent successfully:', data);
			queryClient.invalidateQueries({ queryKey: ['mail-history'] });
			toast.success(data.message);
		},
		onError: (error: any) => {
			console.error('Error sending email:', error);
			toast.error(error.message || 'Failed to send email');
		},
	});

	const onSubmit = async (data: any) => {
		console.log('Form submitted:', data);
		sendEmailMutation(data);
	};
	return (
		<div className="w-full py-6 px-8 md:px-16 mx-auto  animate-in fade-in-50">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Left Column */}
						<div className="lg:col-span-1 space-y-8">
							{/* Recipients Section */}
							<div className="bg-card rounded-lg p-6 space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h2 className="text-lg font-semibold">Recipients</h2>
										<p className="text-sm text-muted-foreground">Add email recipients</p>
									</div>
									<Button type="button" variant="outline" size="sm" onClick={() => append({ email: '' })}>
										Add Recipient
									</Button>
								</div>

								<div className="space-y-3">
									{fields.map((field, index) => (
										<FormField
											key={field.id}
											control={form.control}
											name={`recipients.${index}.email`}
											render={({ field }) => (
												<FormItem>
													<div className="flex items-center space-x-2">
														<FormControl>
															<Input {...field} placeholder="email@example.com" type="email" />
														</FormControl>
														{fields.length > 1 && (
															<Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
																<X className="h-4 w-4" />
															</Button>
														)}
													</div>
													<FormMessage />
												</FormItem>
											)}
										/>
									))}
								</div>
							</div>

							{/* Email Details */}
							<div className="bg-card rounded-lg px-6 space-y-2">
								<div>
									<h2 className="text-lg font-semibold">Email Details</h2>
								</div>

								<div className="space-y-3">
									<FormField
										control={form.control}
										name="companyName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Company Name</FormLabel>
												<FormControl>
													<Input {...field} placeholder="Enter company name" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="platform"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Platform</FormLabel>
												<FormControl>
													<Input {...field} placeholder="Enter the platform" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						</div>

						{/* Right Column - Attachments */}
						<div className="space-y-4 lg:col-span-2">
							<div className="bg-card rounded-lg p-6 space-y-4">
								<div>
									<h2 className="text-lg font-semibold">Attachments</h2>
									<p className="text-sm text-muted-foreground">Add files to your email</p>
								</div>
								<div
									{...getRootProps()}
									className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
								>
									<input {...getInputProps()} />
									<div className="space-y-4">
										<Paperclip className="h-8 w-8 mx-auto text-muted-foreground" />
										<div>
											<p className="font-medium">Drop files here</p>
											<p className="text-sm text-muted-foreground mt-1">or click to select files</p>
										</div>
									</div>
								</div>
								{files.length > 0 && (
									<div className="space-y-2">
										<p className="text-sm font-medium">Selected Files</p>
										<div className="max-h-[200px] overflow-y-auto space-y-2">
											{files.map((file, index) => (
												<div key={index} className="flex items-center justify-between p-2 bg-accent/30 rounded-md">
													<div className="flex items-center space-x-2 min-w-0">
														<Paperclip className="h-4 w-4 shrink-0" />
														<span className="text-sm truncate">{file.name}</span>
													</div>
													<Button variant="ghost" size="icon" onClick={() => removeFile(index)} className="shrink-0">
														<X className="h-4 w-4" />
													</Button>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<FormField
							control={form.control}
							name="subject"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Subject</FormLabel>

									<div className="bg-card rounded-lg border min-h-[50px] overflow-hidden">
										<Textarea
											{...field}
											placeholder="Write your subject content here..."
											className="min-h-[50px] rounded-lg border-0 resize-none focus-visible:ring-0 p-4"
										/>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-lg font-semibold">Email Content</h2>
								<p className="text-sm text-muted-foreground">Write your email message</p>
							</div>
							<Tabs defaultValue="normal" onValueChange={(value) => setIsMarkdown(value === 'markdown')}>
								<TabsList>
									<TabsTrigger value="normal">Normal Editor</TabsTrigger>
									<TabsTrigger value="markdown">Markdown Editor</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>

						<FormField
							control={form.control}
							name="body"
							render={({ field }) => (
								<FormItem>
									<div className="bg-card rounded-lg border min-h-[600px] overflow-hidden">
										{isMarkdown ? (
											<div data-color-mode="dark">
												<MDEditor
													value={field.value}
													onChange={(val) => field.onChange(val || '')}
													preview="live"
													height={600}
													hideToolbar={false}
													visibleDragbar={false}
													enableScroll={true}
													style={{
														backgroundColor: 'transparent',
														borderRadius: 'inherit',
													}}
												/>
											</div>
										) : (
											<Textarea
												{...field}
												placeholder="Write your email content here..."
												className="min-h-[600px] rounded-lg border-0 resize-none focus-visible:ring-0 p-4"
											/>
										)}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="flex justify-end pt-4">
						<Button type="submit" disabled={isPending} size="lg" className="px-8 py-6 text-lg">
							{isPending ? (
								<>
									<Loader2 className="h-5 w-5 mr-2 animate-spin" />
									Sending...
								</>
							) : (
								<>
									<Send className="h-5 w-5 mr-2" />
									Send Email
								</>
							)}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

export default page;
