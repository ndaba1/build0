import { useAuth } from "@/components/authenticator";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { listDocumentTypeSchema } from "@repo/database/schema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { handle } from "typed-handlers";
import { z } from "zod";
import { FormSection } from "./section";
import { CreateTemplateForm } from "./utils";

export function General({ form }: { form: CreateTemplateForm }) {
  const { idToken } = useAuth();
  const { data: documentTypes, isLoading } = useQuery({
    queryKey: ["documentTypes-templates"],
    queryFn: async () => {
      const cfg = handle("/api/v1/document-types");

      const { data } = await axios.get<z.infer<typeof listDocumentTypeSchema>>(
        cfg.url,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      return data;
    },
  });

  const watch = form.watch();
  const formRef = useRef(form);

  useEffect(() => {
    if (watch.documentTypeId && documentTypes) {
      const documentType = documentTypes.find(
        (documentType) => documentType.id === watch.documentTypeId
      );

      if (documentType) {
        formRef.current.setValue("s3PathPrefix", documentType.s3PathPrefix);
      }
    }
  }, [watch.documentTypeId, documentTypes]);

  return (
    <FormSection
      title="General"
      description="Define basic information of your new template. You will be able to update this values later"
    >
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="max-w-[400px]">
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              Must be unique, without special characters
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="documentTypeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Document type</FormLabel>
            <Select
              disabled={isLoading}
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="max-w-[400px]">
                  <SelectValue
                    placeholder={
                      isLoading ? "Loading...." : "Select a document type"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {documentTypes?.map((documentType) => (
                  <SelectItem key={documentType.id} value={documentType.id}>
                    {documentType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              You can manage document types in your{" "}
              <span className="inline-flex gap-1 items-center text-blue-500">
                <Link target="_blank" href="../settings/documents" className="underline">
                  settings
                </Link>

                <ExternalLinkIcon className="w-4 h-4" />
              </span>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="s3PathPrefix"
        render={({ field }) => (
          <FormItem className="max-w-[400px]">
            <FormLabel>S3 Path Prefix</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>
              Defaults to document type&apos;s path prefix
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="max-w-400px]">
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} value={field.value ?? ""} />
            </FormControl>
            <FormDescription>
              Write a short description about this template
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
