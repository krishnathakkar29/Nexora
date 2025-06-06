'use client';

import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import { ZoomIn, ZoomOut, RotateCw, Download, Loader2 } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

interface PDFViewerProps {
	pdfUrl: string;
}

export default function PDFViewer({ pdfUrl }: PDFViewerProps) {
	const [scale, setScale] = useState(1);
	const [rotation, setRotation] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (pdfUrl) {
			setIsLoading(true);
			setError(null);

			// Reset zoom and rotation when PDF changes
			setScale(1);
			setRotation(0);

			// Simulate checking if PDF loaded correctly
			const timer = setTimeout(() => {
				setIsLoading(false);
			}, 1500);

			return () => clearTimeout(timer);
		}
	}, [pdfUrl]);

	const handleZoomIn = () => {
		setScale((prev) => Math.min(prev + 0.25, 3));
	};

	const handleZoomOut = () => {
		setScale((prev) => Math.max(prev - 0.25, 0.5));
	};

	const handleRotate = () => {
		setRotation((prev) => (prev + 90) % 360);
	};

	const handleDownload = () => {
		if (pdfUrl) {
			window.open(pdfUrl, '_blank');
		}
	};

	if (error) {
		return (
			<div className="h-full flex flex-col items-center justify-center p-8 text-center">
				<div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
					<span className="text-red-500 text-2xl">!</span>
				</div>
				<h3 className="text-xl font-semibold mb-2">Failed to load PDF</h3>
				<p className="text-slate-400 mb-4">{error}</p>
				<Button onClick={() => window.location.reload()} variant="outline">
					Try Again
				</Button>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col">
			{/* PDF Controls */}
			<div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="icon"
						onClick={handleZoomIn}
						className="bg-slate-800/50 border-slate-700 hover:bg-slate-700"
					>
						<ZoomIn size={16} />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={handleZoomOut}
						className="bg-slate-800/50 border-slate-700 hover:bg-slate-700"
					>
						<ZoomOut size={16} />
					</Button>
					<span className="text-sm text-slate-300">{Math.round(scale * 100)}%</span>
				</div>

				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="icon"
						onClick={handleRotate}
						className="bg-slate-800/50 border-slate-700 hover:bg-slate-700"
					>
						<RotateCw size={16} />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={handleDownload}
						className="bg-slate-800/50 border-slate-700 hover:bg-slate-700"
					>
						<Download size={16} />
					</Button>
				</div>
			</div>

			{/* PDF Content */}
			<div className="flex-1 overflow-auto bg-slate-900/30 p-4">
				{isLoading ? (
					<div className="h-full flex flex-col items-center justify-center">
						<Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
						<p className="text-slate-400">Loading PDF...</p>
					</div>
				) : (
					<div className="min-h-full flex items-center justify-center">
						<div
							className={cn(
								'transition-transform duration-300 shadow-2xl',
								rotation === 90 || rotation === 270 ? 'origin-center' : '',
							)}
							style={{
								transform: `scale(${scale}) rotate(${rotation}deg)`,
								transformOrigin: 'center center',
							}}
						>
							<iframe
								src={pdfUrl ? `${pdfUrl}#view=FitH&toolbar=0&navpanes=0` : 'about:blank'}
								className="bg-white rounded-lg border border-slate-700"
								style={{
									width: rotation === 90 || rotation === 270 ? '80vh' : '100%',
									height: rotation === 90 || rotation === 270 ? '80vw' : '85vh',
								}}
								onError={() => setError('Failed to load the PDF. Please try again.')}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
