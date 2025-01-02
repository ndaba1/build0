"use client";

import { useAuth } from "@/components/authenticator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useProject } from "@/hooks/use-project";
import { queryClient } from "@/lib/query-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Domain, DomainCard } from "./domain-card";

export function DomainsPageClient({ hasSubdomain }: { hasSubdomain: boolean }) {
  const { name } = useProject();
  const { idToken } = useAuth();

  const [domain, setDomain] = useState("");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["domains"],
    queryFn: async () => {
      const res = await fetch("/api/domains", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      return res.json();
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (domain: string) => {
      await fetch("/api/domains", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          domain,
          redirect: `${name}.buildzero.fyi`,
        }),
      });

      await queryClient.invalidateQueries({ queryKey: ["domains"] });

      setDomain("");
    },
  });

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

      <div className="space-y-2 p-1.5">
        <p className="text-lg font-semibold">Custom Domains</p>
        <p className="text-sm text-muted-foreground">
          Add a custom domain to your project to access the dashboard via your
          own domain. Enable project sub-domains before proceeding
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Input
          className="h-12"
          disabled={!hasSubdomain}
          placeholder="Add a custom domain to your project"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <Button
          size="lg"
          disabled={!hasSubdomain}
          loading={isPending}
          onClick={() => mutate(domain)}
        >
          Save
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          data.domains.map((domain: Domain) => (
            <DomainCard key={domain.domain} {...domain} />
          ))
        )}
      </div>
    </main>
  );
}
