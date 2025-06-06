'use client';

import { fetchAPI } from '@/lib/fetch-api';
import { useQuery } from '@tanstack/react-query';
import { ChatPdf } from '@workspace/db';
import FileUpload from './file-upload';
import ChatCard from './chat-card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import ChatCardSkeleton from '@/components/skeleton/chat-card-skeleton';

function Chats() {
	const {
		data: userChats = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery<ChatPdf[]>({
		queryKey: ['mail-history'],
		queryFn: async () => {
			const response = await fetchAPI({
				url: '/chat/pdfs',
				method: 'GET',
				requireAuth: true,
				throwOnError: false,
			});

			if (!response.success) {
				throw new Error(response.message || 'Failed to fetch email history');
			}

			return response.data.chatPdfs;
		},
	});

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
			{/* Header */}
			<div className="relative z-10 border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center space-x-4">
							<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
								<span className="text-white font-bold text-sm">AI</span>
							</div>
							<h1 className="text-xl font-semibold text-white">ChatPDF</h1>
						</div>
					</div>
				</div>
			</div>

			<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Upload Section */}
				<div className="text-center mb-12">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-6 shadow-lg shadow-blue-500/25">
						<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
							/>
						</svg>
					</div>
					<h2 className="text-3xl font-bold text-white mb-4">Upload a new PDF</h2>
					<p className="text-slate-400 mb-8 max-w-md mx-auto">Drop your PDF here to start a new conversation with AI</p>
					<div className="flex justify-center">
						<FileUpload />
					</div>
				</div>

				{/* Chat Sessions */}
				<div className="space-y-8">
					<div className="flex items-center justify-between">
						<h3 className="text-2xl font-bold text-white">Your Conversations</h3>
						{isLoading ? (
							<Skeleton className="h-5 w-24 bg-slate-800" />
						) : (
							<div className="text-sm text-slate-400">
								{userChats.length} {userChats.length === 1 ? 'conversation' : 'conversations'}
							</div>
						)}
					</div>

					{isLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{Array.from({ length: 6 }).map((_, index) => (
								<ChatCardSkeleton key={index} />
							))}
						</div>
					) : userChats.length === 0 ? (
						<div className="text-center py-16">
							<div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700/50">
								<svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
							</div>
							<h4 className="text-xl font-semibold text-white mb-2">No conversations yet</h4>
							<p className="text-slate-400">Upload your first PDF to get started</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{userChats.map((chat) => (
								<ChatCard key={chat.id} chat={chat} />
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Chats;
