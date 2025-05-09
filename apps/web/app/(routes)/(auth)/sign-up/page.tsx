'use client';
import { register } from '@/actions/authAction';
import { toast } from '@workspace/ui/components/sonner';

import { useRouter } from 'next/navigation';
import React from 'react';

function page() {
	const router = useRouter();
	const [error, setError] = React.useState<string | null>(null);
	const [loading, setLoading] = React.useState(false);

	// const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
	//   e.preventDefault();

	//   try {
	//     const res = await fetch(`${BACKEND_URL}/user/register`, {
	//       method: "POST",
	//       headers: {
	//         "Content-Type": "application/json",
	//       },
	//       body: JSON.stringify({ email, password, username }),
	//     });

	//     const data = await res.json();

	//     if (!res.ok) {
	//       throw new Error(data.error || "Registration failed");
	//     }
	//     console.log(data);

	//     if (data.token) {
	//       setToken(data.token);
	//       toast.success("Registration successful! Please log in.");
	//       router.push("/");
	//     }
	//   } catch (error) {
	//     console.error("Registration error:", error);
	//     toast.error(
	//       error instanceof Error ? error.message : "Registration failed"
	//     );
	//   }
	// };

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const user = await register(new FormData(e.currentTarget));
			toast.success('Registration successful!');
			router.push('/sign-in');
		} catch (err: any) {
			setError(err.message || 'Registration failed');
			toast.error(err.message || 'Registration failed');
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
