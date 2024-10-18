import { DashboardPage } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";
import React from "react";

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardPage
      title="Jobs"
      description="A job is a task triggered to generate a document."
      header={
        <div className="flex items-center gap-4">
          <Button variant="default">
            Get Started
            <ExternalLinkIcon className="h-4 w-4 ml-2" />
          </Button>
        </div>
      }
    >
      {children}
    </DashboardPage>
  );
}
