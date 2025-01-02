"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useProject } from "@/hooks/use-project";

export function DomainsPageClient({ hasSubdomain }: { hasSubdomain: boolean }) {
  const { name } = useProject();

  return (
    <main className="space-y-6">
      <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
        <div className="space-y-0.5">
          <p className="font-medium">Project sub-domain</p>
          <p className="text-sm text-muted-foreground">
            Enable your project sub-domain to access dashboard via{" "}
            <code className="font-medium">{name}.buildzero.fyi</code>
          </p>
        </div>

        <Switch checked={hasSubdomain} disabled={hasSubdomain} />
      </div>

      <div className="flex items-center gap-4">
        <Input
          className="h-12"
          disabled={!hasSubdomain}
          placeholder="Add a custom domain to your project. Enable project sub-domains before proceeding"
        />
        <Button size="lg" disabled={!hasSubdomain}>
          Save
        </Button>
      </div>
    </main>
  );
}
