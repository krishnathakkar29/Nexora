import { BACKEND_URL } from '@/config/config';
import { COOKIE_NAME } from '@workspace/common/config';
import { cookies } from 'next/headers';

export type TNoParams = Record<string, never>;

export type FetchRequestParams<
	ResponseDataT = TNoParams,
	UrlParamsT = TNoParams,
	BodyParamsT = TNoParams,
	QueryParamsT = TNoParams,
> = {
	url: string;
	baseUrl?: string;
	body?: BodyParamsT;
	headers?: Headers;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	onError?: (error: Error) => void;
	query?: QueryParamsT;
	throwOnError?: boolean;
	urlParams?: UrlParamsT;
	requireAuth?: boolean;
};

type ErrorResponse = {
	success: false;
	message: string;
	error?: {
		statusCode?: number;
		[key: string]: any;
	};
};

type SuccessResponse<DataT> = {
	success: true;
	message: string;
	data: DataT;
};

type FetchAPIResult<DataT> = ErrorResponse | SuccessResponse<DataT>;

export async function fetchAPI<
	ResponseDataT = any,
	ErrorBodyT = { success: false; message: string; error?: unknown },
	UrlParamsT = TNoParams,
	BodyParamsT = TNoParams,
	QueryParamsT = TNoParams,
>(
	params: FetchRequestParams<ResponseDataT, UrlParamsT, BodyParamsT, QueryParamsT>,
): Promise<FetchAPIResult<ResponseDataT>> {
	const {
		url,
		method,
		baseUrl,
		urlParams = {},
		query = {},
		body = {},
		headers = {},
		// onError,
		throwOnError,
		requireAuth = false,
	} = params;

	const BASE_URL = baseUrl ?? BACKEND_URL;

	if (!BASE_URL) {
		throw new Error('Backend URL not set in env!');
	}

	let resolvedUrl = BASE_URL + url;
	for (const key in urlParams as Record<string, string>) {
		const value = (urlParams as Record<string, string>)[key];
		if (value !== null && value !== undefined) {
			resolvedUrl = resolvedUrl
				.replace(`:${key}`, encodeURIComponent(value))
				.replace(`[${key}]`, encodeURIComponent(value));
		}
	}

	const queryStr = new URLSearchParams(query as Record<string, string>).toString();
	if (queryStr) {
		resolvedUrl += `?${queryStr}`;
	}

	const requestHeaders: Record<string, string> = {
		'Content-Type': 'application/json',
		...headers,
	};

	if (requireAuth) {
		const authToken = (await cookies()).get(COOKIE_NAME)?.value;

		requestHeaders['Cookie'] = `${COOKIE_NAME}=${authToken}`;
		requestHeaders['Authorization'] = `Bearer ${authToken}`;
	}

	try {
		const response = await fetch(resolvedUrl, {
			method,
			headers: requestHeaders,
			// Include body for non-GET/DELETE requests
			...(method !== 'GET' && method !== 'DELETE' && body ? { body: JSON.stringify(body) } : {}),
			credentials: 'include',
			// cache: "no-store", // Prevent caching of authenticated requests
		});

		const responseData = await response.json();

		if (!response.ok) {
			return {
				success: false,
				message: responseData.message ?? 'Request failed',
				error: responseData.error,
			};
		}

		return {
			success: true,
			message: responseData.message ?? 'Success',
			data: responseData.data as ResponseDataT,
		};
	} catch (error) {
		const errorInstance = error as Error;
		return {
			success: false,
			message: errorInstance.message,
		};
	}
}

export async function setAuthCookie(
	token: string,
	options?: {
		maxAge?: number;
		path?: string;
		secure?: boolean;
		sameSite?: 'strict' | 'lax' | 'none';
	},
) {
	const cookieStore = await cookies();

	cookieStore.set({
		name: COOKIE_NAME,
		value: token,
		httpOnly: true,
		secure: options?.secure ?? process.env.NODE_ENV === 'production',
		sameSite: options?.sameSite ?? 'lax',
		path: options?.path ?? '/',
		// Default to 7 days if not specified
		maxAge: options?.maxAge ?? 7 * 24 * 60 * 60,
	});
}
export async function clearAuthCookie() {
	const cookieStore = await cookies();
	cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
	try {
		const cookieStore = cookies();
		const token = (await cookieStore).get(COOKIE_NAME)?.value;
		return !!token;
	} catch {
		return false;
	}
}

export async function getAuthToken(): Promise<string | undefined> {
	try {
		const cookieStore = cookies();
		return (await cookieStore).get(COOKIE_NAME)?.value;
	} catch {
		return undefined;
	}
}
