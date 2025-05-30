'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

import { Upload, FileText } from 'lucide-react';

import { toast } from 'sonner';
import { MailData } from './bulk-mail';

interface FileUploaderProps {
	onDataExtracted: (data: MailData[]) => void;
}

function ExcelExtract({ onDataExtracted }: FileUploaderProps) {
	const [isUploading, setIsUploading] = useState(false);

	const processFile = async (file: File) => {
		setIsUploading(true);

		try {
			const data = await readFileAsync(file);
			const requiredHeaders = ['email', 'companyname', 'name', 'subject', 'platform'];

			// Check if all required headers are present
			const headers = Object.keys(data[0] || {}).map((h) => h.toLowerCase());
			const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h.toLowerCase()));

			if (missingHeaders.length > 0) {
				toast.error('The uploaded file is missing required columns: ' + missingHeaders.join(', '));
				setIsUploading(false);
				return;
			}

			// Transform data to match our EmailData type
			const transformedData: MailData[] = data.map((row: any) => ({
				id: Math.random().toString(36).substring(2, 15),
				email: row.email || '',
				companyname: row.companyname || '',
				name: row.name || '',
				subject: row.subject || '',
				platform: row.platform || '',
				selected: true,
			}));

			onDataExtracted(transformedData);
		} catch (error) {
			console.error('Error processing file:', error);
			toast.error('Failed to process the uploaded file. Please ensure it is a valid Excel or CSV file.');
		} finally {
			setIsUploading(false);
		}
	};

	const readFileAsync = (file: File): Promise<any[]> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					const data = e.target?.result;
					const workbook = XLSX.read(data, { type: 'binary' });

					// pick the first sheet name (or bail to empty)
					const sheetName = workbook.SheetNames[0];
					if (!sheetName) {
						resolve([]); // ← no sheets, so just return empty
						return;
					}

					const worksheet = workbook.Sheets[sheetName];
					if (!worksheet) {
						resolve([]); // ← sheet name exists but no sheet? still bail
						return;
					}

					// now TS knows worksheet is defined
					const json = XLSX.utils.sheet_to_json(worksheet);
					resolve(json);
				} catch (error) {
					reject(error);
				}
			};

			reader.onerror = (error) => reject(error);
			reader.readAsBinaryString(file);
		});
	};

	const onDrop = useCallback((acceptedFiles: File[]) => {
		const file = acceptedFiles[0];
		if (file) {
			processFile(file);
		}
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
			'text/csv': ['.csv'],
		},
		maxFiles: 1,
	});

	return (
		<div
			{...getRootProps()}
			className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-950/20' : 'border-gray-700 hover:border-gray-500'}`}
		>
			<input {...getInputProps()} />
			<div className="flex flex-col items-center justify-center space-y-4">
				{isUploading ? (
					<div className="flex flex-col items-center">
						<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
						<p className="text-gray-400">Processing file...</p>
					</div>
				) : (
					<>
						<div className="bg-gray-800 p-3 rounded-full">
							{isDragActive ? (
								<Upload className="h-8 w-8 text-blue-500" />
							) : (
								<FileText className="h-8 w-8 text-gray-400" />
							)}
						</div>
						<div>
							<p className="text-lg font-medium">
								{isDragActive ? 'Drop the file here' : 'Drag & drop your file here'}
							</p>
							<p className="text-sm text-gray-400 mt-1">
								Upload an Excel (.xlsx) or CSV file with email, companyname, name, subject, and platform columns
							</p>
						</div>
						<button type="button" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm font-medium">
							Browse Files
						</button>
					</>
				)}
			</div>
		</div>
	);
}

export default ExcelExtract;
