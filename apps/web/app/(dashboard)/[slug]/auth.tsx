"use client";

import { useAuth } from "@/components/authenticator";
import { Loader } from "@/components/loader";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { notFound, useParams } from "next/navigation";
import React from "react";
import { handle } from "typed-handlers";

export function ProjectsAuth({ children }: { children: React.ReactNode }) {
  const { idToken } = useAuth();
  const { slug } = useParams() as { slug: string };
  const { error, isLoading } = useQuery({
    queryKey: ["project-layout"],
    queryFn: async () => {
      const cfg = handle("/api/v1/projects/[slug]", {
        params: { slug },
      });

      const { status, data } = await axios.get(cfg.url, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (status !== 200) {
        throw new Error(data.message);
      }

      return data;
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    notFound();
  }

  return <>{children}</>;
}
