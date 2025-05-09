'use client';
import React from 'react';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb';
import { usePathname } from 'next/navigation';
import { cn } from '@workspace/ui/lib/utils';

export default function DashboardBreadCrumb() {
	const pathname = usePathname();
	const path = pathname.split('/').filter(Boolean);
	const pathToTitle: Record<string, string> = {
		dashboard: 'Dashboard',
		documents: 'Documents',
		documenthosting: 'Cloud in a Minute',
		excelcsv: 'CSV & Excel Conversions',
		query: 'Query Your Documents',
		pdf: 'Pdf Functions',
		imageconversion: 'Image Manipulations',
		code: 'Code And Conquer',
		compiler: 'Web Compiler',
		formatter: 'Formatter',
		convertor: 'Code Language Converter',
		databaseoperations: 'Talk to DataBase',
		work: 'Work',
		mail: 'Mail',
		'send-mail': 'OutReact At Ease',
		'view-history': 'Mail History',
		qrgenerator: 'QR & Barcode Generator',
		todo: 'Todo List',
		everyday: 'Everyday Tools',
		clock: 'Converter Utilities',
		'color-pallete': 'Color Pallette At Ease',
		network: 'Network',
		security: 'Security',
	} as const;

	function getPath(i: number): string {
		return '/' + path.slice(0, i + 1).join('/');
	}

	function isActive(i: number): boolean {
		return getPath(i) === pathname;
	}

	function getTitleFromPath(p: string): string {
		return pathToTitle[p as keyof typeof pathToTitle] || p;
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{path.map((p, i) => (
					<React.Fragment key={i}>
						<BreadcrumbItem
							className={cn(isActive(i) && 'text-white', !isActive(i) && i < path.length - 1 && 'hidden md:block')}
						>
							<BreadcrumbLink href={getPath(i)}>{getTitleFromPath(p)}</BreadcrumbLink>
						</BreadcrumbItem>
						{i !== path.length - 1 && <BreadcrumbSeparator />}
					</React.Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
