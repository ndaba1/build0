import { NextRequest, NextResponse } from "next/server";
import { runWithAmplifyServerContext } from "./lib/amplify";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth/server";

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

const PUBLIC_ROUTES = new Set(["/", "/teams", "/pricing"]);

const AUTH_ROUTES = new Set([
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
]);

const API_VERSION = "v1"; // current api version
const API_HOSTNAMES = new Set(["api.build0.dev", "api.build0.local:3000"]);

export default async function middleware(request: NextRequest) {
  const host = request.headers.get("host") as string;
  const domain = host.replace("www.", "").toLowerCase();

  // path is the path of the URL (e.g. dub.sh/stats/github -> /stats/github)
  const path = request.nextUrl.pathname;

  // fullPath is the full URL path (along with search params)
  const searchParams = request.nextUrl.searchParams.toString();
  const searchParamsString = searchParams.length > 0 ? `?${searchParams}` : "";
  const fullPath = `${path}${searchParamsString}`;

  if (API_HOSTNAMES.has(domain)) {
    return NextResponse.rewrite(
      new URL(`/api/${API_VERSION}${fullPath}`, request.url)
    );
  }

  const response = new NextResponse();
  const user = await getUser(request, response);

  // authenticated user trying to access auth routes
  if (AUTH_ROUTES.has(path) && user) {
    console.log("Authenticated user trying to access auth routes");
    return NextResponse.redirect(new URL("/", request.url));
  } else if (AUTH_ROUTES.has(path) && !user) {
    return;
  }
  // accessing protected routes
  else if (!PUBLIC_ROUTES.has(path)) {
    console.log(
      `Accessing protected route ${path} with authenticated status: ${user}`
    );
    if (user) {
      return;
    }

    return NextResponse.redirect(new URL(`/sign-in?next=${path}`, request.url));
  }
  // redirect auth user to dashboard by default
  else if (user && (!user.is_onboarded || !user.default_project)) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  } else if (user && user.default_project) {
    return NextResponse.redirect(new URL(`/${user.default_project}`, request.url));
  }
}

async function getUser(request: NextRequest, response: NextResponse) {
  console.time("getUser");
  const user = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const attributes = await fetchUserAttributes(contextSpec);
        return attributes;
      } catch (error) {
        console.log(error);
        return null;
      }
    },
  });
  console.timeEnd("getUser");

  return user;
}
