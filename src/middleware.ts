import { NextResponse, type NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\..*).*)'],
};

export function middleware(request: NextRequest) {
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  if (!isMaintenanceMode) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === '/maintenance-mode') {
    return NextResponse.next();
  }

  const maintenanceUrl = request.nextUrl.clone();
  maintenanceUrl.pathname = '/maintenance-mode';
  return NextResponse.redirect(maintenanceUrl);
}
