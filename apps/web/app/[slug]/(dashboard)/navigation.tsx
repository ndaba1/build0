"use client";

import { useProject } from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { SparklesIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNavigation() {
  const pathname = usePathname();
  const { slug } = useProject();
  const links = [
    {
      name: "Dashboard",
      href: "/",
    },
    {
      name: "Jobs",
      href: "/jobs",
    },
    {
      name: "Documents",
      href: "/documents",
    },
    {
      name: "Templates",
      href: "/templates",
    },
    {
      name: "Settings",
      href: "/settings",
    },
    {
      name: (
        <div className="inline-flex items-center gap-2">
          <span
            className={cn(
              `underline-offset-[24px] decoration-[2px] cursor-pointer transition-colors`,
              isActive(`/${slug}/prompts`)
                ? "underline font-medium text-foreground decoration-primary"
                : "hover:underline decoration-muted-foreground/40 hover:text-foreground"
            )}
          >
            Prompts
          </span>
          <SparklesIcon className="w-4 h-4 text-yellow-500" />
        </div>
      ),
      href: "/prompts",
    },
  ];

  function isActive(href: string) {
    if (href === `/${slug}`) {
      return pathname === `/${slug}`;
    }

    return pathname.startsWith(href);
  }

  const normalizedLinks = links.map((link) => ({
    ...link,
    href: `/${slug}${link.href.replace(/\/$/, "")}`,
  }));

  return (
    <nav className="flex items-center gap-8 text-muted-foreground/80">
      {normalizedLinks.map((link) => (
        <Link
          href={link.href}
          key={link.href}
          className={cn(
            `underline-offset-[24px] decoration-[2px] cursor-pointer transition-colors`,
            isActive(link.href)
              ? "underline font-medium text-foreground decoration-primary"
              : "hover:underline decoration-muted-foreground/40 hover:text-foreground"
          )}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
}
