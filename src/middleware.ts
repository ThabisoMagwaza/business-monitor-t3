import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/offline',
  '/manifest.webmanifest',
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  if (!userId && !isPublicRoute(request)) {
    await auth.protect();
  }

  if (request.nextUrl.pathname === '/' && userId) {
    const url = request.nextUrl.clone();
    url.pathname = '/overview';
    return NextResponse.rewrite(url);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
