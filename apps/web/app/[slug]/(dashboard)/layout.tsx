import logo from "@/assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ProjectsAuth } from "./auth";
import { DashboardNavigation } from "./navigation";
import { UserButton } from "./user-button";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function SlashSeparator() {
  return (
    <svg
      className="stroke-muted-foreground/40"
      height="28"
      shapeRendering="geometricPrecision"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1"
      viewBox="0 0 24 24"
      width="28"
    >
      <path d="M16.88 3.549L7.12 20.451" />
    </svg>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectsAuth>
      <main className="w-screen min-h-screen h-full bg-muted/30">
        <header className="w-full z-20 h-16 border-b bg-background sticky top-0">
          <div className="mx-auto max-w-7xl p-4 h-full flex items-center">
            <div className="inline-flex items-center justify-center">
              <Image src={logo} alt="Logo" width={36} height={36} />
            </div>

            <div className="mx-4">
              <SlashSeparator />
            </div>

            <DashboardNavigation />

            <div className="ml-auto flex items-center gap-8">
              <Link
                href="https://github.com/ndaba1/build0"
                className="flex items-center gap-2"
              >
                <GithubIcon className="w-5 h-5 dark:fill-white" />
                <span>Star on Github</span>
              </Link>
              <UserButton />
            </div>
          </div>
        </header>
        <div>{children}</div>
      </main>
    </ProjectsAuth>
  );
}
