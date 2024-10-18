"use client";

import { AuthenticatorProvider } from "@/components/authenticator";
import { authConfig } from "@/lib/auth";
import { queryClient } from "@/lib/query-client";
import { Theme } from "@aws-amplify/ui-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Amplify } from "aws-amplify";

Amplify.configure(authConfig, { ssr: true });

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full min-h-screen bg-muted/30">
      <AuthenticatorProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AuthenticatorProvider>
    </div>
  );
}
