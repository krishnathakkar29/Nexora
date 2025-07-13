'use client';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import React, { useEffect, useState } from 'react';
import { ImShare } from 'react-icons/im';
import { toast } from 'sonner';

function FormLinkShare({ shareUrl }: { shareUrl: string }) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null; // avoiding window not defined error
	}

	const shareLink = `${window.location.origin}/submit/${shareUrl}`;
	return (
		<div className="flex flex-grow gap-4 items-center">
			<Input value={shareLink} readOnly className="flex-2 overflow-x-auto" />
			<Button
				className="flex-1"
				onClick={() => {
					navigator.clipboard.writeText(shareLink);
					toast.success('Link copied to clipboard');
				}}
			>
				<ImShare className="mr-2 h-4 w-4" />
				Share link
			</Button>
		</div>
	);
}

export default FormLinkShare;
