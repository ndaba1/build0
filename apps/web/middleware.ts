import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/ routes
     * 2. /_next/ (Next.js internals)
     * 3. /_proxy/ (proxies for third-party services)
     * 4. /_static (inside /public)
     * 5. /_vercel (Vercel internals)
     * 6. Static files (e.g. /favicon.ico, /sitemap.xml, /robots.txt, etc.)
     */
    "/((?!api/|_next/|_proxy/|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

const API_VERSION = "v1"; // current api version
const API_HOSTNAMES = new Set(["api.build0.dev", "api.build0.local:3000"]);

export default function middleware(req: NextRequest) {
  const host = req.headers.get("host") as string;
  const domain = host.replace("www.", "").toLowerCase();

  // path is the path of the URL (e.g. dub.sh/stats/github -> /stats/github)
  const path = req.nextUrl.pathname;

  // fullPath is the full URL path (along with search params)
  const searchParams = req.nextUrl.searchParams.toString();
  const searchParamsString = searchParams.length > 0 ? `?${searchParams}` : "";
  const fullPath = `${path}${searchParamsString}`;

  if (API_HOSTNAMES.has(domain)) {
    return NextResponse.rewrite(
      new URL(`/api/${API_VERSION}${fullPath}`, req.url)
    );
  }
}
