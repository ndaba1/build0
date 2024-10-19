"use client";

import { Loader } from "@/components/loader";
import { useProject } from "@/hooks/use-project";
import { notFound } from "next/navigation";
import React from "react";

export function ProjectsAuth({ children }: { children: React.ReactNode }) {
  const { error, isLoading } = useProject();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    notFound();
  }

  return <>{children}</>;
}
