"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { queryClient } from "@/lib/query-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTemplateSchema } from "@repo/database/schema";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { handle } from "typed-handlers";
import { z } from "zod";
import { Advanced } from "./advanced";
import { General } from "./general";

export default function CreateTemplate() {
  const router = useRouter();
  const form = useForm<z.infer<typeof createTemplateSchema>>({
    resolver: zodResolver(createTemplateSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof createTemplateSchema>) => {
      const cfg = handle("/api/v1/templates", {
        bodySchema: createTemplateSchema,
      });

      await axios.post(cfg.url, cfg.body(values));
      await queryClient.invalidateQueries({ queryKey: ["templates"] });

      router.replace("/templates");
    },
  });

  return (
    <div className="max-w-6xl mx-auto">
      <Form {...form}>
        <form
          className="space-y-8"
          onSubmit={form.handleSubmit((v) => mutate(v))}
        >
          <section className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList className="text-base">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/templates">Templates</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Create</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="inline-flex gap-4">
              <Button disabled={isPending} size="sm" variant="destructive">
                Cancel
              </Button>
              <Button
                disabled={isPending}
                type="submit"
                size="sm"
                variant="default"
              >
                Save
              </Button>
            </div>
          </section>

          <General form={form} />
          <Advanced form={form} />
        </form>
      </Form>
    </div>
  );
}
