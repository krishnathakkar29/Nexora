'use client';
import { fetchAPI } from '@/lib/fetch-api';
import { useQuery } from '@tanstack/react-query';
import { ChatMessage, ChatPdf } from '@workspace/db';
import { Button } from '@workspace/ui/components/button';
import { AnimatePresence, motion } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
	Panel as ResizablePanelPrimitive,
	PanelGroup as ResizablePanelGroupPrimitive,
	PanelResizeHandle as ResizableHandlePrimitive,
	type PanelProps,
	type PanelGroupProps,
	type PanelResizeHandleProps,
} from 'react-resizable-panels';
import type { FC } from 'react';
import type { Message } from '@ai-sdk/react';

const ResizablePanel: FC<PanelProps> = ResizablePanelPrimitive;
const ResizablePanelGroup: FC<PanelGroupProps> = ResizablePanelGroupPrimitive;
const ResizableHandle: FC<PanelResizeHandleProps> = ResizableHandlePrimitive;

const ChatSidebar = React.lazy(() => import('./chat-sidebar'));
const PDFViewer = React.lazy(() => import('./pdf-viewer'));
const ChatHeader = React.lazy(() => import('./chat-header'));
const ChatMessages = React.lazy(() => import('./chat-messages'));
const ChatInput = React.lazy(() => import('./chat-input'));

type ChatData = {
	chat: ChatPdf & {
		chatMessage: ChatMessage[];
	};
};

function ChatInterface({ chatId }: { chatId: string }) {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [isProcessing, setIsProcessing] = useState(false);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	const {
		data: chatData,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery<ChatData>({
		queryKey: ['chatId', chatId],
		queryFn: async () => {
			const response = await fetchAPI({
				url: `/chat/${chatId}`,
				method: 'GET',
				requireAuth: true,
				throwOnError: false,
			});

			if (!response.success) {
				throw new Error(response.message || 'Failed to fetch email history');
			}

			return response.data;
		},
	});

	// Handle input change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isProcessing) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			content: input.trim(),
			role: 'user',
			createdAt: new Date(),
		};

		// Add user message immediately
		setMessages((prev) => [...prev, userMessage]);
		setInput('');
		setIsProcessing(true);

		try {
			// Call your custom API
			const response = await fetchAPI({
				url: '/chat/message',
				method: 'POST',
				requireAuth: true,
				body: {
					chatId,
					message: input.trim(),
				},
				throwOnError: false,
			});

			console.log('API Response:', response);

			if (response.success && response.data?.reply) {
				// Add AI response
				const aiMessage: Message = {
					id: (Date.now() + 1).toString(),
					content: response.data.reply,
					role: 'assistant',
					createdAt: new Date(),
				};

				setMessages((prev) => [...prev, aiMessage]);
			} else {
				// Handle error - add error message
				const errorMessage: Message = {
					id: (Date.now() + 1).toString(),
					content: 'Sorry, I encountered an error while processing your request. Please try again.',
					role: 'assistant',
					createdAt: new Date(),
				};

				setMessages((prev) => [...prev, errorMessage]);
			}
		} catch (error) {
			console.error('Error sending message:', error);

			// Add error message
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: 'Sorry, I encountered an error while processing your request. Please try again.',
				role: 'assistant',
				createdAt: new Date(),
			};

			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsProcessing(false);
		}
	};

	useEffect(() => {
		if (chatData?.chat.chatMessage && messages.length === 0) {
			const transformedMessages = chatData.chat.chatMessage.map((msg) => ({
				id: msg.id,
				content: msg.content,
				role: msg.role.toLowerCase() as 'user' | 'assistant',
				createdAt: msg.createdAt,
			}));
			setMessages(transformedMessages);
		}
	}, [chatData, messages.length, setMessages]);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	if (isError) {
		return (
			<div className="h-screen bg-slate-950 flex items-center justify-center">
				<div className="text-center p-8">
					<div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
						<span className="text-red-500 text-2xl">!</span>
					</div>
					<h2 className="text-xl font-semibold text-white mb-2">Failed to load chat</h2>
					<p className="text-slate-400 mb-4">{error?.message || 'Something went wrong'}</p>
					<Button onClick={() => refetch()} className="bg-blue-500 hover:bg-blue-600">
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="h-screen bg-slate-950 flex items-center justify-center">
				<div className="text-white">Loading...</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-slate-950 text-white overflow-hidden">
			{/* Sidebar */}
			<AnimatePresence>
				{sidebarOpen && (
					<motion.div
						initial={{ width: 0, opacity: 0 }}
						animate={{ width: '250px', opacity: 1 }}
						exit={{ width: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
						className="h-full border-r border-slate-800 bg-slate-900/50 backdrop-blur-lg z-20"
					>
						<ChatSidebar chatId={chatId} onClose={() => setSidebarOpen(false)} />
					</motion.div>
				)}
			</AnimatePresence>

			{/* Main content area */}
			<div className="flex-1 h-full relative">
				{/* Sidebar toggle button */}
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setSidebarOpen(!sidebarOpen)}
					className="absolute top-4 left-4 z-30 bg-slate-900/50 backdrop-blur-lg border border-slate-800 hover:bg-slate-800"
				>
					{sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
				</Button>

				{/* Resizable panel group for PDF and Chat */}
				<ResizablePanelGroup direction="horizontal" className="h-full" id="chat-container">
					{/* PDF Panel */}
					<ResizablePanel
						defaultSize={60}
						minSize={30}
						maxSize={70}
						className="h-full overflow-hidden bg-slate-900/30 backdrop-blur-sm"
					>
						{isLoading ? (
							<div className="h-full flex items-center justify-center">
								<div className="text-center">
									<div className="w-16 h-16 border-4 border-t-blue-500 border-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
									<p className="text-slate-400">Loading PDF...</p>
								</div>
							</div>
						) : (
							<PDFViewer pdfUrl={chatData?.chat.pdfUrl ?? ''} />
						)}
					</ResizablePanel>

					{/* Resize Handle */}
					<ResizableHandle className="bg-slate-800 hover:bg-blue-500 transition-colors duration-150" />

					{/* Chat Panel */}
					<ResizablePanel defaultSize={40} minSize={30} maxSize={70} className="h-full flex flex-col bg-slate-950">
						<>
							<ChatHeader
								title={chatData?.chat.pdfName || 'Chat'}
								isLoading={isLoading}
								messageCount={chatData?.chat.chatMessage.length || 0}
							/>
							<ChatMessages
								messages={messages}
								isLoading={isLoading}
								isProcessing={isProcessing}
								messagesEndRef={messagesEndRef}
							/>
							<ChatInput
								input={input}
								handleInputChange={handleInputChange}
								handleSubmit={handleSubmit}
								isProcessing={isProcessing}
								disabled={isLoading}
							/>
						</>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</div>
	);
}

export default ChatInterface;
