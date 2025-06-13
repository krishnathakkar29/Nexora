import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/mail(.*)', '/builder(.*)', '/forms(.*)', '/dashboard', '/chat(.*)', '/chat/[chatId]'];

const AUTH_PATHS = ['/sign-in', '/sign-up'];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const token = request.cookies.get(process.env.COOKIE_NAME!)?.value || null;
	const isAuthenticated = !!token;
	const isProtectedPath = PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

	// Determine if the path is for non-authenticated users only
	const isAuthPath = AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

	if (isProtectedPath && !isAuthenticated) {
		const url = new URL('/sign-in', request.url);
		// url.searchParams.set('from', pathname);
		return NextResponse.redirect(url);
	}

	if (isAuthPath && isAuthenticated) {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - API routes (/api/*)
		 * - Static files (_next/static/*, favicon.ico, etc.)
		 * - Public files (public/*)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|public).*)',
	],
};
