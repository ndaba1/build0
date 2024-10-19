"use client";

import { useAuth } from "@/components/authenticator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useProject } from "@/hooks/use-project";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDocumentTypeSchema } from "@repo/database/schema";
import slugify from "@sindresorhus/slugify";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { handle } from "typed-handlers";
import { z } from "zod";

const formSchema = createDocumentTypeSchema.extend({
  projectId: z.string().optional(),
});

export function DocumentTypeDialog() {
  const router = useRouter();
  const { idToken } = useAuth();
  const { id: projectId } = useProject();
  const [showDialog, setShowDialog] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const cfg = handle("/api/v1/document-types", {
        bodySchema: formSchema,
      });

      await axios.post(
        cfg.url,
        cfg.body({
          ...values,
          projectId: projectId!,
        }),
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      router.refresh();
      setShowDialog(false);
      form.reset();
    },
  });

  const watch = form.watch();
  const formRef = useRef(form);

  useEffect(() => {
    formRef.current.setValue("s3PathPrefix", slugify(watch.name || ""));
  }, [watch.name]);

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Type
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="border-b p-6">
          <DialogTitle>Create Document Type</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutate(v))}>
            <div className="px-6 pb-6 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="invoice,quotation,etc."
                        {...field}
                        value={slugify(field.value || "")}
                      />
                    </FormControl>
                    <FormDescription>
                      Must be unique, lowercase and contain no spaces
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="What is this document type used for?"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>Optional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="s3PathPrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>S3 Prefix</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="invoices"
                        {...field}
                        value={slugify(field.value || "")}
                      />
                    </FormControl>
                    <FormDescription>
                      Cannot contain spaces or special characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="border-t p-6 py-4 flex items-center justify-end gap-4">
              <Button loading={isPending} type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
