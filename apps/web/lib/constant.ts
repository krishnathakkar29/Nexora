// Mock data - replace with actual data fetching
export const mockEmailData = [
	{
		id: '1',
		contactEmail: 'john.doe@acme.com',
		companyName: 'Acme Corporation',
		platform: 'Gmail',
		emailCount: 5,
		status: 'DONE' as const,
		lastSentAt: new Date('2024-01-15T10:30:00Z'),
	},
	{
		id: '2',
		contactEmail: 'sarah.wilson@techstart.io',
		companyName: 'TechStart',
		platform: 'Outlook',
		emailCount: 3,
		status: 'PENDING' as const,
		lastSentAt: new Date('2024-01-14T14:20:00Z'),
	},
	{
		id: '3',
		contactEmail: 'mike.chen@innovate.co',
		companyName: 'Innovate Co',
		platform: 'Gmail',
		emailCount: 8,
		status: 'FAILED' as const,
		lastSentAt: new Date('2024-01-13T09:15:00Z'),
	},
	{
		id: '4',
		contactEmail: 'lisa.brown@future.tech',
		companyName: 'Future Tech',
		platform: 'Apple Mail',
		emailCount: 2,
		status: 'DONE' as const,
		lastSentAt: new Date('2024-01-12T16:45:00Z'),
	},
	{
		id: '5',
		contactEmail: 'david.kim@startup.ventures',
		companyName: 'Startup Ventures',
		platform: 'Gmail',
		emailCount: 12,
		status: 'DONE' as const,
		lastSentAt: new Date('2024-01-11T11:30:00Z'),
	},
];

export type EmailData = (typeof mockEmailData)[0];
