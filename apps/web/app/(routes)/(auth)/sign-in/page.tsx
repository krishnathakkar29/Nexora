'use client';

import { login } from '@/actions/authAction';
import { toast } from '@workspace/ui/components/sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function page() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const result = await login(new FormData(e.currentTarget));

			if (!result.success) {
				toast.error(result.message);
				return;
			}

			toast.success('Login successful!');
			router.push('/dashboard');
		} catch (err: any) {
			if (err instanceof Error) {
				toast.error(err.message);
			}
			toast.error(err || 'Login failed');
		} finally {
			setLoading(false);
		}
	}
	return (
		<div className="max-w-md mx-auto">
			<h1 className="w-full text-center md:text-2xl my-4 md:my-8">SignIn</h1>
			<form onSubmit={onSubmit} className="space-y-4">
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
				<button
					type="submit"
					disabled={loading}
					className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
				>
					{loading ? 'Logging in...' : 'Login'}
				</button>
				{error && <p className="text-red-500">{error}</p>}
			</form>
		</div>
	);
}

export default page;
