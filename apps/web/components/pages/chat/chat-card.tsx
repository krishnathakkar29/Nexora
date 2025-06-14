'use client';

import { Card } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { FileText, MessageCircle, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChatPdfWithCount } from './chats';

interface Chat {
	id: string;
	pdfName: string;
	pdfUrl: string;
	createdAt: Date;
	updatedAt: Date;
}

interface ChatCardProps {
	chat: ChatPdfWithCount;
}

export default function ChatCard({ chat }: ChatCardProps) {
	const [isHovered, setIsHovered] = useState(false);
	console.log(chat);
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}
		>
			<Card className="group relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
				{/* Gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

				<div className="relative p-6">
					{/* Header */}
					<div className="flex items-start justify-between mb-4">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
								<FileText className="w-5 h-5 text-white" />
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="text-white font-semibold truncate">{chat.pdfName.replace('.pdf', '')}</h4>
								<div className="flex items-center space-x-2 mt-1">
									<Calendar className="w-3 h-3 text-slate-400" />
									<span className="text-xs text-slate-400">
										{formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
									</span>
								</div>
							</div>
						</div>

						<Button
							variant="ghost"
							size="sm"
							className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-400 hover:bg-red-500/10"
						>
							<Trash2 className="w-4 h-4" />
						</Button>
					</div>

					{/* Stats */}
					<div className="flex items-center space-x-4 mb-6">
						<div className="flex items-center space-x-2">
							<MessageCircle className="w-4 h-4 text-slate-400" />
							<span className="text-sm text-slate-400">{chat._count.chatMessage} messages</span>
						</div>
						<div className="w-1 h-1 bg-slate-600 rounded-full" />
						<span className="text-sm text-slate-400">PDF</span>
					</div>

					{/* Action Button */}
					<Link href={`/chat/${chat.id}`}>
						<Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg shadow-blue-500/25 group/btn">
							<span className="flex items-center justify-center space-x-2">
								<span>Continue Chat</span>
								<ArrowRight
									className={`w-4 h-4 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`}
								/>
							</span>
						</Button>
					</Link>
				</div>

				{/* Animated border effect */}
				<div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
			</Card>
		</motion.div>
	);
}
