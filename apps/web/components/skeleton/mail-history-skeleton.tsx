import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';

export default function MailHistorySkeleton() {
	return (
		<div className="space-y-6">
			{/* Stats Cards Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i} className="bg-card/50 border-border/50">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<div className="h-4 w-24 bg-muted rounded animate-pulse" />
							<div className="h-4 w-4 bg-muted rounded animate-pulse" />
						</CardHeader>
						<CardContent>
							<div className="h-8 w-16 bg-muted rounded animate-pulse" />
						</CardContent>
					</Card>
				))}
			</div>

			{/* Filters Skeleton */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="h-10 flex-1 bg-muted rounded animate-pulse" />
				<div className="h-10 w-full sm:w-[180px] bg-muted rounded animate-pulse" />
				<div className="h-10 w-full sm:w-[180px] bg-muted rounded animate-pulse" />
				<div className="h-10 w-20 bg-muted rounded animate-pulse" />
			</div>

			{/* Table Skeleton */}
			<Card className="bg-card/30 border-border/50">
				<CardContent className="p-0">
					<div className="p-6">
						<div className="space-y-4">
							<div className="flex justify-between">
								{Array.from({ length: 6 }).map((_, i) => (
									<div key={i} className="h-4 w-20 bg-muted rounded animate-pulse" />
								))}
							</div>
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="h-16 w-full bg-muted/30 rounded animate-pulse" />
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
