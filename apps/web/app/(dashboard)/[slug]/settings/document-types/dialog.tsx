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
import { zodResolver } from "@hookform/resolvers/zod";
import { createDocumentTypeSchema } from "@repo/database/schema";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { handle } from "typed-handlers";
import { z } from "zod";

export function DocumentTypeDialog({
  onSuccess,
  showDialog,
  setShowDialog,
}: {
  onSuccess: () => void;
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
}) {
  const form = useForm<z.infer<typeof createDocumentTypeSchema>>({
    resolver: zodResolver(createDocumentTypeSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof createDocumentTypeSchema>) => {
      const cfg = handle("/api/v1/document-types", {
        bodySchema: createDocumentTypeSchema,
      });

      await axios.post(cfg.url, cfg.body(values));

      onSuccess();
      setShowDialog(false);
      form.reset();
    },
  });

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Type
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 rounded-2xl overflow-hidden">
        <DialogHeader className="border-b p-6 bg-muted">
          <DialogTitle>Create Document Type</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutate(v))}>
            <div className="px-6 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="invoice,quotation,etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      This must be a unique value
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
                        placeholder="/invoices"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      The S3 prefix where documents will be stored
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="border-t p-6 py-4 flex items-center justify-end gap-4">
              <Button disabled={isPending} size="sm" variant="destructive">
                Cancel
              </Button>
              <Button disabled={isPending} size="sm" type="submit">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
