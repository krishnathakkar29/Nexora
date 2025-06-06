import { Button } from '@workspace/ui/components/button';
import { FileText, Share2, MoreHorizontal, MessageCircle } from 'lucide-react';
import { Skeleton } from '@workspace/ui/components/skeleton';

function ChatHeader({
	isLoading,
	title,
	messageCount = 0,
}: {
	title: string;
	isLoading: boolean;
	messageCount?: number;
}) {
	return (
		<div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
						<FileText className="w-4 h-4 text-white" />
					</div>

					<div>
						{isLoading ? (
							<div className="space-y-1">
								<Skeleton className="h-5 w-40 bg-slate-800" />
								<Skeleton className="h-3 w-24 bg-slate-800" />
							</div>
						) : (
							<div>
								<h2 className="font-medium text-white truncate max-w-[200px]">{title.replace(/\.pdf$/i, '')}</h2>
								<div className="flex items-center space-x-1 text-xs text-slate-400">
									<MessageCircle className="w-3 h-3" />
									<span>{messageCount} messages</span>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="flex items-center space-x-2">
					<Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
						<Share2 size={18} />
					</Button>
					<Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
						<MoreHorizontal size={18} />
					</Button>
				</div>
			</div>
		</div>
	);
}

export default ChatHeader;
