'use client';
import type React from 'react';
import type { Message } from 'ai';
import { useEffect, useState } from 'react';
import { Bot, User, Loader2 } from 'lucide-react';

import { motion } from 'framer-motion';
import { Skeleton } from '@workspace/ui/components/skeleton';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@workspace/ui/lib/utils';

interface ChatMessagesProps {
	messages: Message[];
	isLoading: boolean;
	isProcessing: boolean;
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

function ChatMessages({ messages, isLoading, isProcessing, messagesEndRef }: ChatMessagesProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;
	return (
		<div className="flex-1 overflow-y-auto p-4 space-y-6" id="message-container">
			{isLoading ? (
				// Loading skeletons
				<div className="space-y-6">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className={cn('flex', i % 2 === 0 ? 'justify-end' : '')}>
							<div className={cn('flex gap-3 max-w-[80%]', i % 2 === 0 ? 'flex-row-reverse' : '')}>
								<Skeleton className={cn('h-8 w-8 rounded-full', i % 2 === 0 ? 'bg-blue-500/20' : 'bg-slate-700')} />
								<div className="space-y-2">
									<Skeleton className="h-4 w-20 bg-slate-700" />
									<Skeleton className="h-16 w-[300px] bg-slate-800 rounded-lg" />
								</div>
							</div>
						</div>
					))}
				</div>
			) : messages.length === 0 ? (
				// Empty state
				<div className="h-full flex flex-col items-center justify-center text-center p-8">
					<div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
						<Bot className="h-8 w-8 text-blue-500" />
					</div>
					<h3 className="text-xl font-semibold mb-2">Start the conversation</h3>
					<p className="text-slate-400 max-w-md">
						Ask questions about the PDF document or request specific information from its contents.
					</p>
				</div>
			) : (
				// Messages
				<div className="space-y-6">
					{messages.map((message, index) => (
						<motion.div
							key={message.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.1 }}
							className={cn('flex', message.role === 'user' ? 'justify-end' : '')}
						>
							<div className={cn('flex gap-3 max-w-[85%]', message.role === 'user' ? 'flex-row-reverse' : '')}>
								<div
									className={cn(
										'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
										message.role === 'user'
											? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25'
											: 'bg-slate-700',
									)}
								>
									{message.role === 'user' ? (
										<User className="h-4 w-4 text-white" />
									) : (
										<Bot className="h-4 w-4 text-white" />
									)}
								</div>

								<div>
									<div className="flex items-center space-x-2 mb-1">
										<span className="text-xs text-slate-400">{message.role === 'user' ? 'You' : 'AI Assistant'}</span>
										{message.createdAt && (
											<span className="text-xs text-slate-500">
												{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
											</span>
										)}
									</div>

									<div
										className={cn(
											'rounded-2xl p-4',
											message.role === 'user'
												? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
												: 'bg-slate-800 text-slate-100',
										)}
									>
										{message.role === 'assistant' ? (
											<ReactMarkdown>{message.content}</ReactMarkdown>
										) : (
											<p className="whitespace-pre-wrap">{message.content}</p>
										)}
									</div>
								</div>
							</div>
						</motion.div>
					))}

					{/* Processing message */}
					{isProcessing && (
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex">
							<div className="flex gap-3 max-w-[85%]">
								<div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
									<Bot className="h-4 w-4 text-white" />
								</div>

								<div>
									<div className="text-xs text-slate-400 mb-1">AI Assistant</div>

									<div className="bg-slate-800 text-slate-100 rounded-2xl p-4">
										<div className="flex items-center space-x-2">
											<Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
											<span className="text-slate-400">Thinking...</span>
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					)}

					{/* Invisible element to scroll to */}
					<div ref={messagesEndRef} />
				</div>
			)}
		</div>
	);
}

export default ChatMessages;
