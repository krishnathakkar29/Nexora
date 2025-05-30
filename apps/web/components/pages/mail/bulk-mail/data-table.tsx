'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { MailData } from './bulk-mail';

interface DataTableProps {
	data: MailData[];
	setData: React.Dispatch<React.SetStateAction<MailData[]>>;
}

export function DataTable({ data, setData }: DataTableProps) {
	// State for pagination
	const [currentPage, setCurrentPage] = useState(0);
	const [pageSize, setPageSize] = useState(10);

	// State for filtering
	const [searchTerm, setSearchTerm] = useState('');

	// State for header selection
	const [allSelected, setAllSelected] = useState(false);
	const [indeterminate, setIndeterminate] = useState(false);

	// Filter data based on search term
	const filteredData = data.filter((item) => item.email.toLowerCase().includes(searchTerm.toLowerCase()));

	// Calculate pagination
	const totalPages = Math.ceil(filteredData.length / pageSize);
	const startIndex = currentPage * pageSize;
	const endIndex = startIndex + pageSize;

	// Get current page data
	const currentPageData = filteredData.slice(startIndex, endIndex);

	// Handle page change
	const goToPage = (page: number) => {
		setCurrentPage(page);
	};

	// Handle page size change
	const handlePageSizeChange = (value: string) => {
		const newSize = Number.parseInt(value);
		setPageSize(newSize);
		setCurrentPage(0); // Reset to first page when changing page size
	};

	// Handle row selection
	const toggleRowSelection = (id: string, checked: boolean) => {
		const updatedData = data.map((item) => (item.id === id ? { ...item, selected: checked } : item));
		setData(updatedData);
	};

	// Handle header checkbox selection
	const toggleAllCurrentPage = (checked: boolean) => {
		const updatedData = [...data];

		currentPageData.forEach((pageItem) => {
			// find the actual object instead of using an index
			const item = updatedData.find((row) => row.id === pageItem.id);
			if (item) {
				item.selected = checked;
			}
		});

		setData(updatedData);
	};

	// Handle select all rows in the entire dataset
	const handleSelectAll = (checked: boolean) => {
		const updatedData = data.map((row) => ({
			...row,
			selected: checked,
		}));
		setData(updatedData);
	};

	// Update header checkbox state based on selections
	useEffect(() => {
		if (currentPageData.length === 0) {
			setAllSelected(false);
			setIndeterminate(false);
			return;
		}

		const selectedCount = currentPageData.filter((item) => item.selected).length;

		if (selectedCount === 0) {
			setAllSelected(false);
			setIndeterminate(false);
		} else if (selectedCount === currentPageData.length) {
			setAllSelected(true);
			setIndeterminate(false);
		} else {
			setAllSelected(false);
			setIndeterminate(true);
		}
	}, [currentPageData, data]);

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row justify-between gap-4">
				<div className="relative max-w-sm">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
					<Input
						placeholder="Search emails..."
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setCurrentPage(0); // Reset to first page when searching
						}}
						className="pl-8 bg-gray-800 border-gray-700"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleSelectAll(true)}
						className="border-gray-700 hover:bg-gray-800"
					>
						Select All
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleSelectAll(false)}
						className="border-gray-700 hover:bg-gray-800"
					>
						Deselect All
					</Button>
				</div>
			</div>

			<div className="rounded-md border border-gray-700 overflow-hidden">
				<Table>
					<TableHeader className="bg-gray-900">
						<TableRow className="border-gray-700 hover:bg-gray-800/50">
							<TableHead className="w-[50px]">
								<Checkbox
									checked={allSelected}
									className={indeterminate ? 'indeterminate' : ''}
									onCheckedChange={(checked: boolean) => {
										toggleAllCurrentPage(!!checked);
									}}
									aria-label="Select all"
								/>
							</TableHead>
							<TableHead className="text-gray-300">Email</TableHead>
							<TableHead className="text-gray-300">Name</TableHead>
							<TableHead className="text-gray-300">Company</TableHead>
							<TableHead className="text-gray-300">Subject</TableHead>
							<TableHead className="text-gray-300">Platform</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{currentPageData.length > 0 ? (
							currentPageData.map((row, i) => (
								<TableRow
									key={row.id}
									className={`border-gray-700 ${i % 2 === 0 ? 'bg-gray-850' : 'bg-gray-900'} hover:bg-gray-800`}
								>
									<TableCell>
										<Checkbox
											checked={row.selected}
											onCheckedChange={(checked: boolean) => toggleRowSelection(row.id, !!checked)}
											aria-label="Select row"
										/>
									</TableCell>
									<TableCell className="font-medium">{row.email}</TableCell>
									<TableCell>{row.name}</TableCell>
									<TableCell>{row.companyname}</TableCell>
									<TableCell>{row.subject}</TableCell>
									<TableCell>{row.platform}</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<p className="text-sm text-gray-400">
						Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredData.length)} of{' '}
						{filteredData.length} entries
					</p>
					<div className="flex items-center space-x-2">
						<p className="text-sm text-gray-400">Show</p>
						<Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
							<SelectTrigger className="h-8 w-[70px] bg-gray-800 border-gray-700">
								<SelectValue placeholder={pageSize} />
							</SelectTrigger>
							<SelectContent className="bg-gray-800 border-gray-700">
								{[10, 20, 50, 100].map((size) => (
									<SelectItem key={size} value={size.toString()}>
										{size}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="text-sm text-gray-400">entries</p>
					</div>
				</div>

				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => goToPage(currentPage - 1)}
						disabled={currentPage === 0}
						className="border-gray-700 hover:bg-gray-800"
					>
						<ChevronLeft className="h-4 w-4 mr-1" />
						Previous
					</Button>
					<div className="flex items-center">
						{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
							// Show pagination numbers based on current page
							let pageNum = 0;
							if (totalPages <= 5) {
								pageNum = i;
							} else if (currentPage < 3) {
								pageNum = i;
							} else if (currentPage > totalPages - 4) {
								pageNum = totalPages - 5 + i;
							} else {
								pageNum = currentPage - 2 + i;
							}

							return (
								<Button
									key={pageNum}
									variant={currentPage === pageNum ? 'default' : 'outline'}
									size="sm"
									onClick={() => goToPage(pageNum)}
									className={`mx-1 w-8 ${
										currentPage === pageNum ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-700 hover:bg-gray-800'
									}`}
								>
									{pageNum + 1}
								</Button>
							);
						})}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => goToPage(currentPage + 1)}
						disabled={currentPage >= totalPages - 1}
						className="border-gray-700 hover:bg-gray-800"
					>
						Next
						<ChevronRight className="h-4 w-4 ml-1" />
					</Button>
				</div>
			</div>
		</div>
	);
}
