'use client';
import { useDropzone } from 'react-dropzone';
import { Paperclip, X, Bold, Italic, Link, List, Code } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { toast } from 'sonner';

interface EmailComposerProps {
	emailBody: string;
	setEmailBody: (value: string) => void;
	attachments: File[];
	setAttachments: (files: File[]) => void;
}

export function MailComposer({ emailBody, setEmailBody, attachments, setAttachments }: EmailComposerProps) {
	const { getRootProps, getInputProps } = useDropzone({
		onDrop: (acceptedFiles) => {
			// Limit total attachments to 5
			if (attachments.length + acceptedFiles.length > 5) {
				toast.error('You can only attach up to 5 files.');
				return;
			}

			// Limit file size to 5MB each
			const validFiles = acceptedFiles.filter((file) => {
				if (file.size > 5 * 1024 * 1024) {
					toast.error(`File ${file.name} exceeds the 5MB size limit.`);
					return false;
				}
				return true;
			});

			setAttachments([...attachments, ...validFiles]);
		},
	});

	const removeAttachment = (index: number) => {
		const newAttachments = [...attachments];
		newAttachments.splice(index, 1);
		setAttachments(newAttachments);
	};

	const insertVariable = (variable: string) => {
		const currentValue = emailBody || '';
		setEmailBody(currentValue + variable);
	};

	const insertMarkdown = (syntax: string, placeholder = '') => {
		const currentValue = emailBody || '';
		const newValue = currentValue + syntax.replace('{text}', placeholder);
		setEmailBody(newValue);
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-2 mb-4">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => insertVariable('{{name}}')}
					className="border-gray-700 hover:bg-gray-800"
				>
					Insert {`{{name}}`}
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => insertVariable('{{companyname}}')}
					className="border-gray-700 hover:bg-gray-800"
				>
					Insert {`{{companyname}}`}
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => insertVariable('{{platform}}')}
					className="border-gray-700 hover:bg-gray-800"
				>
					Insert {`{{platform}}`}
				</Button>
			</div>

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h4 className="text-sm font-medium text-gray-300">Email Content</h4>
					<div className="flex gap-1">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => insertMarkdown('**{text}**', 'bold text')}
							className="border-gray-700 hover:bg-gray-800 p-2"
							title="Bold"
						>
							<Bold className="h-4 w-4" />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => insertMarkdown('*{text}*', 'italic text')}
							className="border-gray-700 hover:bg-gray-800 p-2"
							title="Italic"
						>
							<Italic className="h-4 w-4" />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => insertMarkdown('[{text}](url)', 'link text')}
							className="border-gray-700 hover:bg-gray-800 p-2"
							title="Link"
						>
							<Link className="h-4 w-4" />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => insertMarkdown('\n* {text}', 'list item')}
							className="border-gray-700 hover:bg-gray-800 p-2"
							title="List"
						>
							<List className="h-4 w-4" />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => insertMarkdown('`{text}`', 'code')}
							className="border-gray-700 hover:bg-gray-800 p-2"
							title="Code"
						>
							<Code className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<Textarea
					value={emailBody}
					onChange={(e) => setEmailBody(e.target.value)}
					placeholder="Compose your email here... Use Markdown for formatting and {{name}}, {{companyname}}, {{platform}} for variables.

Examples:
# Header
**Bold text**
*Italic text*
[Link text](https://example.com)
* List item
`code`"
					className="min-h-[300px] bg-gray-800 border-gray-700 text-gray-100 resize-none"
				/>
			</div>

			<div className="mt-6">
				<p className="text-sm font-medium mb-2">Attachments ({attachments.length}/5)</p>
				<div className="flex flex-wrap gap-2 mb-4">
					{attachments.map((file, index) => (
						<div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-full text-sm">
							<span className="truncate max-w-[150px]">{file.name}</span>
							<button
								type="button"
								onClick={() => removeAttachment(index)}
								className="text-gray-400 hover:text-gray-200"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					))}
				</div>

				<div
					{...getRootProps()}
					className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-gray-500 transition-colors"
				>
					<input {...getInputProps()} />
					<div className="flex flex-col items-center justify-center space-y-2">
						<Paperclip className="h-6 w-6 text-gray-400" />
						<p className="text-sm text-gray-400">Drag & drop files here, or click to select files</p>
						<p className="text-xs text-gray-500">Max 5 files, 5MB each</p>
					</div>
				</div>
			</div>
		</div>
	);
}
