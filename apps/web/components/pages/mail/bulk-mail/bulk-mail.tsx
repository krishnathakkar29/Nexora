'use client';

import { useState } from 'react';

import { Button } from '@workspace/ui/components/button';
import { toast } from 'sonner';
import { DataTable } from './data-table';
import ExcelExtract from './excel-extract';
import { MailComposer } from './mail-composer';
import { fetchAPI } from '@/lib/fetch-api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type MailData = {
	id: string;
	email: string;
	companyname: string;
	name: string;
	subject: string;
	platform: string;
	selected: boolean;
};

export default function BulkEmailSender() {
	const [emailData, setEmailData] = useState<MailData[]>([]);
	const [emailBody, setEmailBody] = useState('');
	const [attachments, setAttachments] = useState<File[]>([]);

	const queryClient = useQueryClient();

	const handleDataExtracted = (data: MailData[]) => {
		setEmailData(data);
		toast.error('Please review the data and select recipients before composing your email.');
	};

	const { mutate: sendBulkMailMutation, isPending } = useMutation({
		mutationFn: async (data: MailData[]) => {
			try {
				const selectedRecipients = emailData.filter((row) => row.selected);

				if (selectedRecipients.length === 0) {
					toast.error('No recipients selected');

					return;
				}

				if (!emailBody.trim()) {
					toast.error('Email body is empty');

					return;
				}

				console.log('Sending emails to the following recipients:');

				const emailObjects = selectedRecipients.map((recipient) => {
					// Replace variables in the email body
					const personalizedBody = emailBody
						.replace(/{{name}}/g, recipient.name)
						.replace(/{{companyname}}/g, recipient.companyname)
						.replace(/{{platform}}/g, recipient.platform);

					// Format the email body by replacing newlines with <br> tags
					const formattedBody = personalizedBody.replace(/\n/g, '<br>');

					return {
						name: recipient.name,
						companyname: recipient.companyname,
						email: recipient.email,
						subject: recipient.subject,
						platform: recipient.platform,
						body: formattedBody,
					};
				});

				// Create FormData object for backend processing
				const formData = new FormData();
				formData.append('emails', JSON.stringify(emailObjects));

				// Add attachments using the specified format
				attachments.forEach((file) => {
					formData.append('files', file);
				});

				const response = await fetchAPI({
					url: '/mail/bulk-send',
					method: 'POST',
					body: formData,
					throwOnError: true,
					requireAuth: false,
				});
				console.log('Response from bulk send:', response);

				if (!response.success) {
					toast.error(response.message);
					return;
				}

				return response;
			} catch (error) {
				console.error('Error sending emails:', error);
				toast.error('An error occurred while sending emails. Please try again later.');
			}
		},
		onSuccess: (data: any) => {
			console.log('Email sent successfully:', data);
			queryClient.invalidateQueries({ queryKey: ['mail-history'] });
			toast.success(data.message);
		},
		onError: (error: any) => {
			console.error('Error sending email:', error);
			toast.error(error.message || 'Failed to send email');
		},
	});

	const handleSendEmails = async () => {
		sendBulkMailMutation(emailData);
	};

	return (
		<div className="space-y-8">
			<div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
				<h2 className="text-xl font-semibold mb-4">1. Upload Your Data</h2>
				<ExcelExtract onDataExtracted={handleDataExtracted} />
			</div>

			{emailData.length > 0 && (
				<div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
					<h2 className="text-xl font-semibold mb-4">2. Select Recipients</h2>
					<DataTable data={emailData} setData={setEmailData} />
				</div>
			)}

			{emailData.length > 0 && (
				<div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
					<h2 className="text-xl font-semibold mb-4">3. Compose Email</h2>
					<MailComposer
						emailBody={emailBody}
						setEmailBody={setEmailBody}
						attachments={attachments}
						setAttachments={setAttachments}
					/>
				</div>
			)}

			{emailData.length > 0 && (
				<div className="flex justify-end">
					<Button
						onClick={handleSendEmails}
						className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
						disabled={isPending}
					>
						{isPending ? 'Processing...' : 'Send Emails'}
					</Button>
				</div>
			)}
		</div>
	);
}
