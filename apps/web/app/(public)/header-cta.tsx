"use client";

import { useAuth } from "@/components/authenticator";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UserButton } from "../[slug]/(dashboard)/user-button";

export function HeaderCTA() {
  const { loading, userAttributes } = useAuth();

  return (
    <section
      className={cn(
        "z-10 flex items-center gap-5 col-span-3 justify-end transition-all duration-150",
        loading ? "invisible" : "visible"
      )}
    >
      {!userAttributes?.sub ? (
        <>
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({
                className: "rounded-3xl text-base",
                variant: "ghost",
              })
            )}
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({
                variant: "default",
                className: "rounded-3xl",
              })
            )}
          >
            Get Started
          </Link>
        </>
      ) : (
        <>
          <Link
            href={`/${userAttributes?.["custom:default_project"]}`}
            className={cn(
              buttonVariants({
                className: "rounded-lg text-base",
                variant: "outline",
              })
            )}
          >
            Dashboard
          </Link>
          <UserButton className="h-10 w-10" />
        </>
      )}
    </section>
  );
}
