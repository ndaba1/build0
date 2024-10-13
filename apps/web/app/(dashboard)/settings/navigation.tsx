"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    label: "General",
    href: "/settings/general",
  },
  {
    label: "Account",
    href: "/settings/account",
  },
  {
    label: "Members",
    href: "/settings/members",
  },
  {
    label: "Tokens",
    href: "/settings/tokens",
  },
  {
    label: "Variables",
    href: "/settings/variables",
  },
  {
    label: "Document Types",
    href: "/settings/document-types",
  },
  {
    label: "Integrations",
    href: "/settings/integrations",
  },
  {
    label: "Audit Log",
    href: "/settings/audit-log",
  },
];

export function SettingsNavigation() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (pathname === "/settings") {
      return pathname === href || href === "/settings/general";
    }

    return pathname === href;
  }

  return (
    <nav className="hidden md:block h-fit sticky top-10">
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              className={cn(
                "md:hover:bg-muted-foreground/10 block w-full border-b px-4 py-6 text-lg md:rounded-md md:border-none md:py-3 md:text-base",
                !isActive(link.href) ? "text-muted-foreground" : "font-medium"
              )}
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
