'use client';

import { login } from '@/actions/authAction';
import { toast } from '@workspace/ui/components/sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function page() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
	//   e.preventDefault();
	//   try {
	//     const res = await fetch(`${BACKEND_URL}/user/login`, {
	//       method: "POST",
	//       headers: {
	//         "Content-Type": "application/json",
	//       },
	//       body: JSON.stringify({ email, password }),
	//     });

	//     const result = await res.json();
	//     if (!res.ok) {
	//       throw new Error(result.error || "Login failed");
	//     }
	//     if (result.data.token) {
	//       setToken(result.data.token);
	//       toast.success("Login Successful!");
	//       router.push("/");
	//     }
	//   } catch (error) {
	//     console.error("Login error:", error);
	//     toast.error(error instanceof Error ? error.message : "Login failed");
	//   }
	// };

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const user = await login(new FormData(e.currentTarget));

			toast.success('Login successful!');
			router.push('/dashboard');
		} catch (err: any) {
			setError(err || 'Login failed');
			toast.error(err || 'Login failed');
		} finally {
			setLoading(false);
		}
	}
	return (
		<div className="max-w-md mx-auto">
			<form onSubmit={onSubmit} className="space-y-4">
				<input
					name="email"
					type="email"
					placeholder="Email"
					required
					className="w-full px-3 py-2 border rounded text-black"
				/>
				<input
					name="password"
					type="password"
					placeholder="Password"
					required
					className="w-full px-3 py-2 border rounded text-black"
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
