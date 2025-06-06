'use client';

import { fetchAPI } from '@/lib/fetch-api';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

const FileUpload = () => {
	const router = useRouter();
	const [uploading, setUploading] = React.useState(false);
	const [dragActive, setDragActive] = React.useState(false);

	const { mutate, isPending } = useMutation({
		mutationFn: async (file: File) => {
			const formData = new FormData();
			formData.append('file', file!);
			const response = await fetchAPI({
				url: '/chat/upload',
				method: 'POST',
				body: formData,
				requireAuth: true,
				throwOnError: false,
			});
			if (!response.success) {
				toast.error(response.message || 'Failed to upload file');
				return;
			}

			return response.data;
		},
	});

	const { getInputProps, getRootProps, isDragActive } = useDropzone({
		accept: { 'application/pdf': ['.pdf'] },
		maxFiles: 1,
		onDragEnter: () => setDragActive(true),
		onDragLeave: () => setDragActive(false),
		onDrop: async (acceptedFiles) => {
			setDragActive(false);
			const file = acceptedFiles[0];
			if (file) {
				if (file.size > 10 * 1024 * 1024) {
					// bigger than 10mb!
					toast.error('File too large');
					return;
				}
			}

			try {
				setUploading(true);
				mutate(file!, {
					onSuccess: ({ chatDoc }) => {
						toast.success('Chat created!');
						router.push(`/chat/${chatDoc.id}`);
					},
					onError: (err) => {
						toast.error('Error creating chat');
						console.error('on error wala part', err);
					},
				});
			} catch (error) {
				toast.error('Error uploading file');
				console.error('Upload error:', error);
			} finally {
				setUploading(false);
			}
		},
	});

	const isLoading = uploading || isPending;

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3 }}
			className="w-full max-w-md mx-auto"
		>
			<div
				{...getRootProps({
					className: `relative group cursor-pointer transition-all duration-300 ${
						isDragActive || dragActive ? 'scale-105' : 'hover:scale-102'
					}`,
				})}
			>
				<input {...getInputProps()} />

				{/* Main upload area */}
				<div
					className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300
          ${
						isDragActive || dragActive
							? 'border-blue-400 bg-blue-500/10'
							: 'border-slate-600 hover:border-slate-500 bg-slate-900/50'
					}
          backdrop-blur-xl p-8
        `}
				>
					{/* Background gradient */}
					<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

					<div className="relative z-10 flex flex-col items-center text-center space-y-4">
						{isLoading ? (
							<>
								<div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
									<Loader2 className="h-8 w-8 text-white animate-spin" />
								</div>
								<div className="space-y-2">
									<p className="text-white font-medium">{uploading ? 'Uploading...' : 'Creating chat...'}</p>
									<p className="text-sm text-slate-400">This may take a moment</p>
								</div>
							</>
						) : (
							<>
								<motion.div
									animate={{
										scale: isDragActive || dragActive ? 1.1 : 1,
										rotate: isDragActive || dragActive ? 5 : 0,
									}}
									transition={{ duration: 0.2 }}
									className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25"
								>
									{isDragActive || dragActive ? (
										<FileText className="h-8 w-8 text-white" />
									) : (
										<Upload className="h-8 w-8 text-white" />
									)}
								</motion.div>

								<div className="space-y-2">
									<p className="text-white font-medium">
										{isDragActive || dragActive ? 'Drop your PDF here' : 'Upload PDF Document'}
									</p>
									<p className="text-sm text-slate-400">Drag & drop or click to browse • Max 10MB</p>
								</div>

								<div className="flex items-center space-x-2 text-xs text-slate-500">
									<FileText className="w-3 h-3" />
									<span>PDF files only</span>
								</div>
							</>
						)}
					</div>

					{/* Animated border */}
					<div
						className={`
            absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 opacity-0 transition-opacity duration-300 -z-10 blur-xl
            ${isDragActive || dragActive ? 'opacity-100' : 'group-hover:opacity-50'}
          `}
					></div>
				</div>
			</div>
		</motion.div>
	);
};

export default FileUpload;
