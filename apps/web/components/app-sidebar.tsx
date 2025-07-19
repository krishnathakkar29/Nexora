'use client';

import * as React from 'react';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from '@workspace/ui/components/sidebar';
import Link from 'next/link';

const data = {
	versions: ['1.0.1'],
	navMain: [
		{
			title: 'Overview',
			url: '/dashboard',
			items: [
				{
					title: 'Dashboard',
					url: '/dashboard',
				},
			],
		},
		{
			title: 'Mails',
			url: '#',
			items: [
				{
					title: 'Send Mails',
					url: '/mail/send-mail',
				},
				{
					title: 'History',
					url: '/mail/history',
				},
				{
					title: 'Bulk Mails',
					url: '/mail/bulk-mail',
				},
			],
		},
		{
			title: 'Chat',
			url: '#',
			items: [
				{
					title: 'Chat Docs',
					url: '/chat',
				},
			],
		},
		{
			title: 'Forms',
			url: '#',
			items: [
				{
					title: 'Your forms',
					url: '/form',
				},
			],
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<Link href="/">
					<div className="flex gap-2 font-semibold text-lg items-end leading-none p-2">
						{/* <FramerLogoIcon className="size-6" /> */}
						{/* <img src="/logo.png" alt="Logo" className="h-6" /> */}
						Nexora
					</div>
				</Link>
			</SidebarHeader>
			<SidebarContent>
				{/* Projects Section */}

				{/* Rest of the sidebar menu */}
				{data.navMain.map((item) => (
					<SidebarGroup key={item.title}>
						<SidebarGroupLabel>{item.title}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{item.items.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild url={item.url}>
											<Link href={item.url}>{item.title}</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
