import { DashboardPage } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function TemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardPage
      title="Templates"
      description=" Create re-usable templates with theming, custom variables and more."
      header={
        <Link
          href="/templates/new"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create
        </Link>
      }
    >
      {children}
    </DashboardPage>
  );
}
