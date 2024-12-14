"use client";

import { useAuth } from "@/components/authenticator";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { UserButton } from "../[slug]/(dashboard)/user-button";

export function HeaderCTA() {
  const { loading, userAttributes } = useAuth();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: loading ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "z-10 flex items-center gap-5 col-span-3 justify-end transition-all duration-150"
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
                className: "rounded-lg",
                variant: "outline",
                size: "sm"
              })
            )}
          >
            Dashboard
          </Link>
          <UserButton className="h-10 w-10" />
        </>
      )}
    </motion.section>
  );
}
