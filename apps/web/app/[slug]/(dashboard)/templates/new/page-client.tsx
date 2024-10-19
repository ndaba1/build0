"use client";

import { useAuth } from "@/components/authenticator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useProject } from "@/hooks/use-project";
import { queryClient } from "@/lib/query-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTemplateSchema } from "@repo/database/schema";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { handle } from "typed-handlers";
import { z } from "zod";
import { Advanced } from "./advanced";
import { General } from "./general";
import { formSchema } from "./utils";

export function CreateTemplateForm() {
  const router = useRouter();
  const { idToken } = useAuth();
  const { id: projectId, slug } = useProject();
  const [redirecting, setRedirecting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const cfg = handle("/api/v1/templates", {
        bodySchema: createTemplateSchema,
      });

      const { data } = await axios.post(
        cfg.url,
        cfg.body({ ...values, projectId: projectId! }),
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      await queryClient.invalidateQueries({ queryKey: ["templates"] });

      setRedirecting(true);
      router.replace(`/${slug}/editor/${data.template.id}`);
    },
  });

  return (
    <div>
      <Form {...form}>
        <form
          className="space-y-8"
          onSubmit={form.handleSubmit((v) => mutate(v))}
        >
          <div className="bg-white border-b z-10 sticky top-16">
            <section className="flex max-w-6xl p-4 py-8 mx-auto items-center justify-between">
              <Breadcrumb>
                <BreadcrumbList className="text-base">
                  <BreadcrumbItem>
                    <Link href="/">Home</Link>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <Link href="/templates">Templates</Link>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Create</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="inline-flex gap-4">
                <Button
                  onClick={() => router.back()}
                  disabled={isPending || redirecting}
                  size="sm"
                  variant="destructive"
                >
                  Cancel
                </Button>
                <Button
                  loading={isPending || redirecting}
                  type="submit"
                  size="sm"
                  variant="default"
                >
                  Save
                </Button>
              </div>
            </section>
          </div>

          <div className="max-w-6xl mx-auto p-4 space-y-8">
            <General form={form} />
            <Advanced form={form} />
          </div>
        </form>
      </Form>
    </div>
  );
}
