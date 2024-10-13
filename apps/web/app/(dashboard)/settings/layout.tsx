import React from "react";
import { SettingsNavigation } from "./navigation";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full">
      <main className="mx-auto grid max-w-6xl gap-4 pt-4 grid-cols-1 md:grid-cols-[2.4fr,9.6fr]">
        <SettingsNavigation />

        <div className="bg-white rounded-xl shadow">{children}</div>
      </main>
    </div>
  );
}
