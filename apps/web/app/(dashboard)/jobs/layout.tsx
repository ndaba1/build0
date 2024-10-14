import { DashboardPage } from "@/components/layout";
import React from "react";

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardPage
      title="Jobs"
      description="A job is a task triggered via the API to generate a document from a
      template."
    >
      {children}
    </DashboardPage>
  );
}
