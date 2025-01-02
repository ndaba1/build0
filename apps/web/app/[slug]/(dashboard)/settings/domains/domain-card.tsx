"use client";

import { useAuth } from "@/components/authenticator";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { queryClient } from "@/lib/query-client";
import { CheckCircleIcon, XIcon } from "lucide-react";
import { useState } from "react";

export interface Domain {
  domain: string;
  config: {
    configuredBy: string;
    nameservers: string[];
    serviceType: string;
    cnames: string[];
    aValues: string[];
    conflicts: string[];
    acceptedChallenges: string[];
    misconfigured: boolean;
  };
}

export function DomainCard({ domain, config }: Domain) {
  const { idToken } = useAuth();
  const [isFetching, setIsFetching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleRefresh() {
    setIsFetching(true);
    await queryClient.invalidateQueries({ queryKey: ["domains"] });
    setIsFetching(false);
  }

  async function handleDelete() {
    setIsDeleting(true);
    await fetch("/api/domains", {
      method: "DELETE",
      body: JSON.stringify({ domain }),
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    await queryClient.invalidateQueries({ queryKey: ["domains"] });
    setIsDeleting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex justify-between">
          {domain}
          <div className="flex gap-4 items-center">
            <Button
              loading={isFetching}
              onClick={handleRefresh}
              size="sm"
              variant="outline"
              className="text-sm font-normal"
            >
              Refresh
            </Button>
            <Button
              loading={isDeleting}
              onClick={handleDelete}
              size="sm"
              variant="destructive"
              className="text-sm font-normal"
            >
              Delete
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          {config.misconfigured ? (
            <p className="inline-flex items-center text-red-500">
              <XIcon className="w-4 h-4 mr-1" />
              Invalid Domain Configuration
            </p>
          ) : (
            <p className="inline-flex items-center text-green-500">
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Valid Domain Configuration
            </p>
          )}
        </CardDescription>
      </CardHeader>

      {config.misconfigured ? (
        <CardContent className="border-t grid pt-6 grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-5 space-y-4">
            <p>Set the nameservers of {domain} to:</p>
            <Card className="p-4 shadow-none text-sm">
              <p>ns1.vercel-dns.com</p>
              <p>ns2.vercel-dns.com</p>
            </Card>
            {config.nameservers.length ? (
              <>
                <p>Current nameservers:</p>
                <Card className="p-4 text-red-500 shadow-none text-sm">
                  {config.nameservers.map((ns) => (
                    <p key={ns}>{ns}</p>
                  ))}
                </Card>
              </>
            ) : null}
          </div>

          <div className="flex flex-col gap-1 items-center col-span-1 h-full">
            <div className="border-r h-[48%] flex-grow" />
            <span>OR</span>
            <div className="border-r h-[48%] flex-grow" />
          </div>

          <div className="col-span-12 md:col-span-6 space-y-4">
            <p>Set the following record on your DNS provider to continue:</p>
            <Card className="p-4 shadow-none text-sm">
              <p>Type: A Record</p>
              <p>Name: @</p>
              <p>Value: 76.76.21.21</p>
            </Card>
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}
