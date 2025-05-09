'use server';
import { fetchAPI } from '@/lib/fetch-api';
import { COOKIE_NAME } from '@workspace/common/config';
import { cookies } from 'next/headers';


export async function register(formData: FormData) {
	const username = formData.get('username') as string;
	const email = formData.get('email') as string;
	const password = formData.get('password') as string;
	console.log({ username, email, password });
	const res = await fetchAPI({
		url: '/user/register',
		method: 'POST',
		body: {
			username,
			email,
			password,
		},
		throwOnError: true,
		requireAuth: false,
	});

	console.log('res', res);

	if (!res.success) throw new Error(res.message);

	(await cookies()).set({
		name: COOKIE_NAME,
		value: res.data.token!,
		httpOnly: true,
		maxAge: 24 * 60 * 60,
		path: '/',
		//  secure: process.env.NODE_ENV === 'production',
		// sameSite: 'lax',
	});

	return res.data.user;
}

export async function login(formData: FormData) {
	const email = formData.get('email') as string;
	const password = formData.get('password') as string;
	const res = await fetchAPI({
		url: '/user/login',
		method: 'POST',
		body: { email, password },
		throwOnError: true,
		requireAuth: false,
	});

	if (!res.success) {
		throw new Error(res.message);
	}

	(await cookies()).set({
		name: COOKIE_NAME,
		value: res.data.token!,
		httpOnly: true,
		maxAge: 24 * 60 * 60,
		path: '/',
		// secure: process.env.NODE_ENV === 'production',
		// sameSite: 'lax',
	});

	return res.data.user;
}

export async function logout() {
	const res = await fetchAPI({
		url: '/user/logout',
		method: 'POST',
		body: {},
		throwOnError: true,
		requireAuth: true,
	});
	if (!res.success) throw new Error(res.message);

	(await cookies()).delete(COOKIE_NAME);

	return {
		success: true,
		message: 'Logout successful',
	};
}
