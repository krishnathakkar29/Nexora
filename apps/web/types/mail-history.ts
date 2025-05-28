export type EmailSent = {
	platform: string;
	sentAt: string;
	status: 'PENDING' | 'DONE' | 'FAILED';
};

export type Contact = {
	id: string;
	email: string;
	companyName: string;
	createdAt: string;
	updatedAt: string;
	userId: string;
	emailsSent: EmailSent[];
};

export type EmailHistoryResponse = {
	contacts: Contact[];
};

// Transformed data type for UI display
export type EmailData = {
	id: string;
	contactEmail: string;
	companyName: string;
	platform: string | null;
	emailCount: number;
	status: 'PENDING' | 'DONE' | 'FAILED';
	lastSentAt: Date;
};
