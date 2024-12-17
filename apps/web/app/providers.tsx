"use client";

import { AuthenticatorProvider } from "@/components/authenticator";
import { env } from "@/env";
import { authConfig } from "@/lib/auth";
import { queryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Amplify } from "aws-amplify";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

Amplify.configure(authConfig, { ssr: true });

if (typeof window !== "undefined") {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "identified_only",
    autocapture: true,
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProvider>
      <div className="w-full h-full min-h-screen">
        <AuthenticatorProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </AuthenticatorProvider>
      </div>
    </AnalyticsProvider>
  );
}

function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
