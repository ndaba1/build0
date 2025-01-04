"use client";

import { AuthenticatorProvider } from "@/components/authenticator";
import { env } from "@/env";
import { authConfig } from "@/lib/auth";
import { queryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { CookieStorage } from "aws-amplify/utils";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

Amplify.configure(authConfig, { ssr: true });

cognitoUserPoolsTokenProvider.setKeyValueStorage(
  new CookieStorage({
    sameSite: "lax",
    domain: ".buildzero.fyi",
  })
);

if (typeof window !== "undefined") {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
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
