import { fetchUserAttributes } from "aws-amplify/auth/server";
import { NextRequest, NextResponse } from "next/server";
import { runWithAmplifyServerContext } from "./lib/amplify";
import { getDomainProject } from "./lib/domains";

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
    "/((?!api/|_next/|blog/|_proxy/|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

const PUBLIC_ROUTES = new Set([
  "/",
  "/docs",
  "/home",
  "/changelog",
  "/pricing",
  "/blog",
]);

const AUTH_ROUTES = new Set([
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
]);

const API_VERSION = "v1"; // current api version
const API_HOSTNAMES = new Set([
  "api.buildzero.fyi",
  "api.buildzero.local:3000",
]);
const FILE_SERVER_HOSTNAMES = new Set([
  "files.buildzero.fyi",
  "files.buildzero.local:3000",
]);

function isSubdomain(domain: string) {
  // matches sub-domain pattern like terminus.buildzero.fyi
  return domain.match(/^[a-z0-9-]+\.buildzero\.fyi$/);
}

export default async function middleware(request: NextRequest) {
  const host = request.headers.get("host") as string;
  const domain = host.replace("www.", "").toLowerCase();

  // path is the path of the URL
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

  if (FILE_SERVER_HOSTNAMES.has(domain)) {
    return NextResponse.rewrite(
      new URL(`/api/${API_VERSION}/files${fullPath}`, request.url)
    );
  }

  const response = NextResponse.next();
  const user = await getUser(request, response);

  // going through custom domains
  if (host !== "www.buildzero.fyi") {
    // if no user, always force redirect to sign-in
    if (!user && !path.includes("/sign-in")) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // use default project on localhost
    if (user && host.includes("localhost") && !path.includes("/sign-in")) {
      const slug = user["custom:default_project"];
      return NextResponse.rewrite(new URL(`/${slug}${fullPath}`, request.url));
    }

    const projectSlug = await getAssociatedProject(domain);
    const isProjectMember =
      user && user["custom:default_project"] === projectSlug;

    // has access to project
    if (user && isProjectMember) {
      return NextResponse.rewrite(
        new URL(`/${projectSlug}${fullPath}`, request.url)
      );
    }

    // user signed-in but not member of project
    if (user && !isProjectMember && !path.includes("/sign-in")) {
      // force sign-in infinitely - dont allow them to proceed
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // authenticated user trying to access auth routes
  if (AUTH_ROUTES.has(path)) {
    if (!user) {
      return;
    }

    console.log("Authenticated user trying to access auth routes");
    return NextResponse.redirect(new URL("/", request.url));
  }
  // accessing protected routes
  else if (!PUBLIC_ROUTES.has(path) && !user) {
    if (user) {
      return;
    }

    return NextResponse.redirect(new URL(`/sign-in?next=${path}`, request.url));
  } else if (user && !user["custom:is_onboarded"] && path !== "/onboarding") {
    console.log("Redirecting to onboarding");
    return NextResponse.redirect(new URL("/onboarding", request.url));
  } else if (user && user["custom:default_project"] && path === "/") {
    console.log("Redirecting to default project");
    return NextResponse.redirect(
      new URL(`/${user["custom:default_project"]}`, request.url)
    );
  }
}

async function getUser(request: NextRequest, response: NextResponse) {
  try {
    const user = await runWithAmplifyServerContext({
      nextServerContext: { request, response },
      operation: async (contextSpec) => {
        try {
          const attributes = await fetchUserAttributes(contextSpec);
          return attributes;
        } catch (error) {
          return null;
        }
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}

async function getAssociatedProject(domain: string) {
  let projectSlug = undefined;

  // if sub-domain, get project slug from sub-domain
  if (isSubdomain(domain)) {
    const slug = domain.split(".")[0];
    projectSlug = slug;
  }
  // if not sub-domain, tis a custom domain
  else {
    const target = await getDomainProject(domain);
    projectSlug = target;
  }

  return projectSlug;
}
