"use client";

import { cn } from "@/lib/utils";
import {
  Code2Icon,
  CogIcon,
  FileCog2Icon,
  GlobeIcon,
  LockKeyholeIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    label: "General",
    href: "/",
    icon: CogIcon,
  },
  {
    label: "Domains",
    href: "/domains",
    icon: GlobeIcon,
  },
  {
    label: "Members",
    href: "/members",
    icon: UsersIcon,
  },
  {
    label: "Tokens",
    href: "/tokens",
    icon: LockKeyholeIcon,
  },
  {
    label: "Variables",
    href: "/variables",
    disabled: true,
    icon: Code2Icon,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileCog2Icon,
  },
  // {
  //   label: "Integrations",
  //   href: "/integrations",
  // },
  // {
  //   label: "Audit Log",
  //   href: "/audit-log",
  // },
];

export function SettingsNavigation() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (pathname === `/settings`) {
      return pathname === href || href === `/settings`;
    }

    return pathname === href;
  }

  const normalizedLinks = links.map((link) => ({
    ...link,
    href: `/settings${link.href.replace(/\/$/, "")}`,
  }));

  return (
    <nav className="hidden md:block h-fit sticky top-20">
      <ul>
        {normalizedLinks.map((link) => (
          <li key={link.href}>
            <Link
              className={cn(
                "md:hover:bg-muted-foreground/10 flex items-center gap-2 w-full border-b px-4 py-6 text-lg md:rounded-md md:border-none md:py-3 md:text-base",
                !isActive(link.href) ? "text-muted-foreground" : "font-medium",
                link.disabled && "cursor-not-allowed pointer-events-none"
              )}
              href={link.href}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
