'use server';
import { BACKEND_URL } from '@/config/config';
import { cookies } from 'next/headers';

export type TNoParams = Record<string, never>;

export type FetchRequestParams<
	// eslint-disable-next-line  @typescript-eslint/no-unused-vars
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
		// eslint-disable-next-line  @typescript-eslint/no-explicit-any
		[key: string]: any;
	};
};

type SuccessResponse<DataT> = {
	success: true;
	message: string;
	data: DataT;
};

type FetchAPIResult<DataT> = ErrorResponse | SuccessResponse<DataT>;

export async function fetchAPIServer<
	ResponseDataT = any,
	// eslint-disable-next-line  @typescript-eslint/no-unused-vars
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
		throwOnError = false,
		requireAuth = true,
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
		// 'Content-Type': 'application/json',
		...headers,
	};

	if (!(body instanceof FormData)) {
		requestHeaders['Content-Type'] = 'application/json';
	}

	if (requireAuth) {
		const authToken = (await cookies()).get(process.env.COOKIE_NAME!)?.value;

		requestHeaders['Cookie'] = `${process.env.COOKIE_NAME!}=${authToken}`;
		requestHeaders['Authorization'] = `Bearer ${authToken}`;
	}

	let requestBody: string | FormData | null = null;
	if (body instanceof FormData) {
		requestBody = body;
	} else {
		requestBody = JSON.stringify(body);
	}

	try {
		const response = await fetch(resolvedUrl, {
			method,
			headers: requestHeaders,
			// Include body for non-GET/DELETE requests
			...(method != 'GET' && method != 'DELETE' && body ? { body: requestBody } : {}),
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
		if (throwOnError) {
			throw errorInstance;
		}
		return {
			success: false,
			message: errorInstance.message,
		};
	}
}
