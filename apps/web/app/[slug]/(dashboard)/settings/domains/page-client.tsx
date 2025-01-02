"use client";

import { Switch } from "@/components/ui/switch";
import { useProject } from "@/hooks/use-project";

export function DomainsPageClient({ hasSubdomain }: { hasSubdomain: boolean }) {
  const { name } = useProject();

  return (
    <main>
      <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
        <div className="space-y-0.5">
          <p className="font-medium">Project sub-domain</p>
          <p className="text-sm text-muted-foreground">
            Enable your project sub-domain to access dashboard via{" "}
            <code className="font-medium">{name}.buildzero.fyi</code>
          </p>
        </div>

        <Switch checked={hasSubdomain} />
      </div>
    </main>
  );
}
