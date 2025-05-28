'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { format } from 'date-fns';
import { Building2, CheckCircle, Clock, Filter, Mail, Search, Send, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import MailHistorySkeleton from '@/components/skeleton/mail-history-skeleton';
import { fetchAPI } from '@/lib/fetch-api';
import { EmailData, EmailHistoryResponse } from '@/types/mail-history';
import { useQuery } from '@tanstack/react-query';

const statusConfig = {
	PENDING: {
		label: 'Pending',
		icon: Clock,
		className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
	},
	DONE: {
		label: 'Sent',
		icon: CheckCircle,
		className: 'bg-green-500/10 text-green-500 border-green-500/20',
	},
	FAILED: {
		label: 'Failed',
		icon: XCircle,
		className: 'bg-red-500/10 text-red-500 border-red-500/20',
	},
};

function MailSentTable() {
	const {
		data: emailHistory,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery<EmailHistoryResponse>({
		queryKey: ['mail-history'],
		queryFn: async () => {
			const response = await fetchAPI({
				url: '/mail/history',
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

	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [platformFilter, setPlatformFilter] = useState<string>('all');
	const [sortBy, setSortBy] = useState<'lastSent' | 'emailCount' | 'company'>('lastSent');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

	const transformedData = useMemo<EmailData[]>(() => {
		if (!emailHistory?.contacts) return [];

		return emailHistory.contacts.map((contact) => {
			// Get the latest email sent (assuming they're sorted by date)
			const latestEmail = contact.emailsSent[0] || null;

			return {
				id: contact.id,
				contactEmail: contact.email,
				companyName: contact.companyName,
				platform: latestEmail?.platform || null,
				emailCount: contact.emailsSent.length,
				status: latestEmail?.status || 'PENDING',
				lastSentAt: latestEmail ? new Date(latestEmail.sentAt) : new Date(),
			};
		});
	}, [emailHistory]);

	// Apply filtering and sorting to the transformed data
	const filteredAndSortedData = useMemo(() => {
		const filtered = transformedData.filter((email) => {
			const matchesSearch =
				email.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
				email.companyName.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
			const matchesPlatform =
				platformFilter === 'all' || (email.platform && email.platform.toLowerCase() === platformFilter.toLowerCase());

			return matchesSearch && matchesStatus && matchesPlatform;
		});

		// Sort the filtered data
		filtered.sort((a, b) => {
			let comparison = 0;

			switch (sortBy) {
				case 'lastSent':
					comparison = a.lastSentAt.getTime() - b.lastSentAt.getTime();
					break;
				case 'emailCount':
					comparison = a.emailCount - b.emailCount;
					break;
				case 'company':
					comparison = a.companyName.localeCompare(b.companyName);
					break;
			}

			return sortOrder === 'desc' ? -comparison : comparison;
		});

		return filtered;
	}, [transformedData, searchTerm, statusFilter, platformFilter, sortBy, sortOrder]);

	// Get unique platforms for the filter dropdown
	const platforms = useMemo(() => {
		const platformSet = new Set<string>();
		transformedData.forEach((email) => {
			if (email.platform) platformSet.add(email.platform);
		});
		return Array.from(platformSet);
	}, [transformedData]);

	const handleSort = (field: typeof sortBy) => {
		if (sortBy === field) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(field);
			setSortOrder('desc');
		}
	};

	const handleRowClick = (email: EmailData) => {
		// Handle row click - could navigate to detail page or open dialog
		console.log('Clicked email:', email);
	};

	// Calculate stats for the cards
	const totalContacts = transformedData.length;
	const totalEmailsSent = transformedData.reduce((sum, email) => sum + email.emailCount, 0);
	const successRate =
		totalEmailsSent > 0
			? Math.round((transformedData.filter((e) => e.status === 'DONE').length / transformedData.length) * 100)
			: 0;
	const activePlatforms = platforms.length;

	if (isLoading) {
		return <MailHistorySkeleton />;
	}

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<XCircle className="h-12 w-12 text-red-500 mb-4" />
				<h3 className="text-lg font-semibold mb-2">Failed to load email history</h3>
				<p className="text-muted-foreground mb-4">
					{error instanceof Error ? error.message : 'An unknown error occurred'}
				</p>
				<Button onClick={() => refetch()}>Try Again</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="bg-card/50 border-border/50">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
						<Mail className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalContacts}</div>
					</CardContent>
				</Card>

				<Card className="bg-card/50 border-border/50">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
						<Send className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalEmailsSent}</div>
					</CardContent>
				</Card>

				<Card className="bg-card/50 border-border/50">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Success Rate</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{successRate}%</div>
					</CardContent>
				</Card>

				<Card className="bg-card/50 border-border/50">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Platforms</CardTitle>
						<Building2 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activePlatforms}</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters and Search */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by email or company..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 bg-background/50 border-border/50"
					/>
				</div>

				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						<SelectItem value="PENDING">Pending</SelectItem>
						<SelectItem value="DONE">Sent</SelectItem>
						<SelectItem value="FAILED">Failed</SelectItem>
					</SelectContent>
				</Select>

				<Select value={platformFilter} onValueChange={setPlatformFilter}>
					<SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50">
						<SelectValue placeholder="Filter by platform" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Platforms</SelectItem>
						{platforms.map((platform) => (
							<SelectItem key={platform} value={platform}>
								{platform}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="bg-background/50 border-border/50">
							<Filter className="h-4 w-4 mr-2" />
							Sort
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Sort by</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => handleSort('lastSent')}>
							Last Sent {sortBy === 'lastSent' && (sortOrder === 'desc' ? '↓' : '↑')}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleSort('emailCount')}>
							Email Count {sortBy === 'emailCount' && (sortOrder === 'desc' ? '↓' : '↑')}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleSort('company')}>
							Company {sortBy === 'company' && (sortOrder === 'desc' ? '↓' : '↑')}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Table */}
			<Card className="bg-card/30 border-border/50">
				<CardContent className="p-0">
					{filteredAndSortedData.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<Mail className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">No emails found</h3>
							<p className="text-muted-foreground">
								{searchTerm || statusFilter !== 'all' || platformFilter !== 'all'
									? 'Try adjusting your filters or search terms.'
									: "You haven't sent any emails yet."}
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow className="border-border/50 hover:bg-muted/30">
									<TableHead className="font-semibold">Contact</TableHead>
									<TableHead className="font-semibold">Company</TableHead>
									<TableHead className="font-semibold">Platform</TableHead>
									<TableHead className="font-semibold text-center">Emails Sent</TableHead>
									<TableHead className="font-semibold">Status</TableHead>
									<TableHead className="font-semibold">Last Sent</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredAndSortedData.map((email) => {
									const StatusIcon = statusConfig[email.status].icon;
									return (
										<TableRow
											key={email.id}
											className="border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
											onClick={() => handleRowClick(email)}
										>
											<TableCell className="font-medium">
												<div className="flex items-center space-x-2">
													<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
														<Mail className="h-4 w-4 text-primary" />
													</div>
													<span className="text-foreground">{email.contactEmail}</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center space-x-2">
													<Building2 className="h-4 w-4 text-muted-foreground" />
													<span>{email.companyName}</span>
												</div>
											</TableCell>
											<TableCell>
												{email.platform ? (
													<Badge variant="secondary" className="bg-secondary/50">
														{email.platform}
													</Badge>
												) : (
													<span className="text-muted-foreground">-</span>
												)}
											</TableCell>
											<TableCell className="text-center">
												<Badge variant="outline" className="bg-background/50">
													{email.emailCount}
												</Badge>
											</TableCell>
											<TableCell>
												<Badge className={statusConfig[email.status].className}>
													<StatusIcon className="h-3 w-3 mr-1" />
													{statusConfig[email.status].label}
												</Badge>
											</TableCell>
											<TableCell className="text-muted-foreground">
												<div className="flex flex-col">
													<span className="text-sm">{format(email.lastSentAt, 'MMM dd, yyyy')}</span>
													<span className="text-xs text-muted-foreground">{format(email.lastSentAt, 'HH:mm')}</span>
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Results count */}
			{filteredAndSortedData.length > 0 && (
				<div className="text-sm text-muted-foreground text-center">
					Showing {filteredAndSortedData.length} of {transformedData.length} contacts
				</div>
			)}
		</div>
	);
}

export default MailSentTable;
