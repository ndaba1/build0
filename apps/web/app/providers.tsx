"use client";

import { authConfig } from "@/lib/auth";
import { queryClient } from "@/lib/query-client";
import { Authenticator, Theme, ThemeProvider } from "@aws-amplify/ui-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Amplify } from "aws-amplify";

Amplify.configure(authConfig, { ssr: true });

export function Providers({ children }: { children: React.ReactNode }) {
  const theme: Theme = {
    tokens: {
      components: {
        authenticator: {
          router: {
            boxShadow: "none",
            borderColor: "#eaeaea",
          },
        },
      },
    },
    name: "custom",
  };

  return (
    <div className="w-full h-full min-h-screen bg-muted">
      <ThemeProvider>
        <Authenticator hideSignUp>
          {() => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          )}
        </Authenticator>
      </ThemeProvider>
    </div>
  );
}
