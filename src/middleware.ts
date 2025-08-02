import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const url = request.nextUrl;

    // Redirect to dashboard if the user is authenticated and tries to access auth pages or the root page
    if (
        token &&
        (url.pathname.startsWith('/sign-in') ||
            url.pathname.startsWith('/sign-up'))
    ) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect to sign-in if the user is not authenticated and tries to access protected pages
    if (
        !token &&
        (url.pathname.startsWith('/dashboard') ||
            url.pathname.startsWith('/grocery') ||
            url.pathname.startsWith('/overview') ||
            url.pathname.startsWith('/family'))
    ) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/',
        '/sign-in',
        '/sign-up',
        '/dashboard/:path*',
        '/grocery/:path*',
        '/overview/:path*',
        '/family/:path*',
    ],
};