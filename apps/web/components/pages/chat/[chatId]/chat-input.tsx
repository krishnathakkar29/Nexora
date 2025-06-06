'use client';

import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { Loader2, Send } from 'lucide-react';
import type React from 'react';
import { type FormEvent, useState } from 'react';

interface ChatInputProps {
	input: string;
	// handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	handleInputChange: any;
	handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
	isProcessing: boolean;
	disabled?: boolean;
}

export default function ChatInput({
	input,
	handleInputChange,
	handleSubmit,
	isProcessing,
	disabled = false,
}: ChatInputProps) {
	const [isFocused, setIsFocused] = useState(false);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			if (input.trim() && !disabled && !isProcessing) {
				const form = e.currentTarget.form;
				if (form) form.requestSubmit();
			}
		}
	};

	const isSubmitDisabled = !input.trim() || disabled || isProcessing;

	return (
		<div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
			<form onSubmit={handleSubmit} className="relative">
				<div
					className={cn(
						'relative rounded-2xl transition-all duration-300 bg-slate-800 border',
						isFocused && !disabled ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-slate-700',
						disabled && 'opacity-50',
					)}
				>
					<textarea
						value={input}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						placeholder={disabled ? 'Loading chat...' : 'Ask about the PDF...'}
						rows={1}
						className="w-full bg-transparent text-white resize-none py-3 px-4 pr-16 focus:outline-none disabled:cursor-not-allowed"
						style={{
							minHeight: '56px',
							maxHeight: '150px',
						}}
						disabled={disabled || isProcessing}
					/>

					<div className="absolute right-2 bottom-2 flex items-center space-x-1">
						{isProcessing ? (
							<div className="p-2">
								<Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
							</div>
						) : (
							<Button
								type="submit"
								size="icon"
								disabled={isSubmitDisabled}
								className={cn(
									'rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25',
									isSubmitDisabled && 'opacity-50 cursor-not-allowed',
								)}
							>
								<Send className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>

				<div className="flex items-center justify-between mt-2 text-xs text-slate-500">
					<div>Press Shift + Enter for a new line</div>
					<div className="flex items-center space-x-2">
						{disabled && <span className="text-amber-500">Loading...</span>}
						<span>Powered by AI</span>
					</div>
				</div>
			</form>
		</div>
	);
}
