'use client';
import { register } from '@/actions/authAction';
import { toast } from '@workspace/ui/components/sonner';

import { useRouter } from 'next/navigation';
import React from 'react';

function page() {
	const router = useRouter();
	const [error, setError] = React.useState<string | null>(null);
	const [loading, setLoading] = React.useState(false);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const result = await register(new FormData(e.currentTarget));
			if (!result.success) {
				toast.error(result.message);
				return;
			}

			toast.success('Registration successful!');
			router.push('/sign-in');
		} catch (err: any) {
			if (err instanceof Error) {
				toast.error(err.message);
			}
			toast.error(err || 'Registration failed');
		} finally {
			setLoading(false);
		}
	}
	return (
		<form onSubmit={onSubmit} className="space-y-4">
			<input name="username" placeholder="Username" required className="w-full px-3 py-2 border rounded text-white" />
			<input
				name="email"
				type="email"
				placeholder="Email"
				required
				className="w-full px-3 py-2 border rounded text-white"
			/>
			<input
				name="password"
				type="password"
				placeholder="Password"
				required
				className="w-full px-3 py-2 border rounded text-white"
			/>
			<button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
				{loading ? 'Registering...' : 'Register'}
			</button>
			{error && <p className="text-red-500">{error}</p>}
		</form>
	);
}

export default page;
