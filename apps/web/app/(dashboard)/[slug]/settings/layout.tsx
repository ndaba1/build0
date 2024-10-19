import { DashboardPage } from "@/components/layout";
import React from "react";
import { SettingsNavigation } from "./navigation";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardPage title="Settings" description="Configure your project settings">
      <main className="grid gap-4 pt-12 grid-cols-1 md:grid-cols-[2.4fr,9.6fr]">
        <SettingsNavigation />

        <div className="mt-2 pb-20">{children}</div>
      </main>
    </DashboardPage>
  );
}
