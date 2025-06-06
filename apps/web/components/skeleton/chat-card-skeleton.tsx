'use client';

import { Card } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { motion } from 'framer-motion';

export default function ChatCardSkeleton() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="w-full"
		>
			<Card className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border-slate-800/50 hover:border-slate-700/50 transition-all duration-300">
				{/* Subtle animated gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-slate-500/5 opacity-50" />

				<div className="relative p-6 space-y-4">
					{/* Header skeleton */}
					<div className="flex items-start justify-between">
						<div className="flex items-center space-x-3 flex-1">
							{/* Icon skeleton */}
							<Skeleton className="w-10 h-10 rounded-lg bg-slate-800" />

							<div className="flex-1 space-y-2">
								{/* Title skeleton */}
								<Skeleton className="h-4 w-3/4 bg-slate-800" />
								{/* Date skeleton */}
								<Skeleton className="h-3 w-1/2 bg-slate-800" />
							</div>
						</div>

						{/* Action button skeleton */}
						<Skeleton className="w-8 h-8 rounded bg-slate-800" />
					</div>

					{/* Stats skeleton */}
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2">
							<Skeleton className="w-4 h-4 rounded bg-slate-800" />
							<Skeleton className="h-3 w-16 bg-slate-800" />
						</div>
						<Skeleton className="w-1 h-1 rounded-full bg-slate-700" />
						<Skeleton className="h-3 w-8 bg-slate-800" />
					</div>

					{/* Button skeleton */}
					<Skeleton className="w-full h-10 rounded-md bg-slate-800" />
				</div>

				{/* Animated shimmer effect */}
				<div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
			</Card>
		</motion.div>
	);
}
