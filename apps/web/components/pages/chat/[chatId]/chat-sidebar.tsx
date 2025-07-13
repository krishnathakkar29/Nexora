'use client';

import { fetchAPI } from '@/lib/fetch-api';
import { useQuery } from '@tanstack/react-query';
import { Button, buttonVariants } from '@workspace/ui/components/button';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { cn } from '@workspace/ui/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, FileText, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo } from 'react';

function ChatSidebar({ chatId, onClose }: { chatId: string; onClose: () => void }) {
	// Fetch all user chats
	const { data: chats = [], isLoading } = useQuery({
		queryKey: ['chats'],
		queryFn: async () => {
			const response = await fetchAPI({
				url: '/chat/all',
				method: 'GET',
				requireAuth: true,
			});

			if (!response.success) {
				throw new Error(response.message || 'Failed to fetch chats');
			}

			return response.data.chats;
		},
		refetchOnMount: false,
	});

	const router = useRouter();

	return (
		<div className="h-full flex flex-col">
			{/* Header */}
			<div className="p-4 border-b border-slate-800 flex items-center justify-between">
				<ArrowLeft
					className={cn(
						buttonVariants({
							variant: 'ghost',
							size: 'icon',
							className: 'text-slate-400 hover:text-white',
						}),
						'h-5 w-5 cursor-pointer',
					)}
					onClick={() => {
						router.push('/chat');
					}}
				/>
				<h2 className="font-semibold text-white">Your PDFs</h2>
				<Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
					<X size={18} />
				</Button>
			</div>
			{/* Search */}
			{/* <div className="p-4">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
					<input
						type="text"
						placeholder="Search PDFs..."
						className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div> */}
			{/* New Chat Button */}
			{/* <div className="px-4 mb-4">
					<Link href="/chat">
						<Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-blue-500/25">
							<PlusCircle className="mr-2 h-4 w-4" />
							Upload New PDF
						</Button>
					</Link>
				</div> */}
			{/* Chat List */}
			<div className="flex-1 overflow-y-auto px-2">
				{isLoading ? (
					<div className="space-y-2 p-2">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="flex items-center space-x-3 p-2">
								<Skeleton className="h-10 w-10 rounded-lg bg-slate-800" />
								<div className="space-y-2 flex-1">
									<Skeleton className="h-4 w-3/4 bg-slate-800" />
									<Skeleton className="h-3 w-1/2 bg-slate-800" />
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="space-y-1 p-2">
						{/*eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
						{chats.map((chat: any) => (
							<Link key={chat.id} href={`/chat/${chat.id}`}>
								<div
									className={cn(
										'flex items-center space-x-3 p-2 rounded-lg transition-colors',
										chat.id === chatId ? 'bg-blue-500/20 text-white' : 'hover:bg-slate-800/70 text-slate-300',
									)}
								>
									<div
										className={cn(
											'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
											chat.id === chatId
												? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25'
												: 'bg-slate-800',
										)}
									>
										<FileText className="h-5 w-5 text-white" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-medium truncate">{chat.pdfName.replace(/\.pdf$/i, '')}</div>
										<div className="text-xs text-slate-400 truncate">
											{formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default memo(ChatSidebar);
