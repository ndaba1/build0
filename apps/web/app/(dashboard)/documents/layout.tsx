import { DashboardPage } from "@/components/layout";
import React from "react";

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardPage
      title="Documents"
      description="View and manage all your documents."
    >
      {children}
    </DashboardPage>
  );
}
