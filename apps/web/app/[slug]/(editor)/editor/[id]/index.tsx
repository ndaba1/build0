"use client";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { useAuth } from "@/components/authenticator";
import { TSEditor, useTsEditor } from "@/components/editor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Template, patchTemplateSchema } from "@repo/database/schema";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { handle } from "typed-handlers";
import { VariablesEditor } from "./variables";

// Register fonts with pdfMake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export function TemplateEditor({ template }: { template: Template }) {
  const router = useRouter();
  const { idToken } = useAuth();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const {
    jsCode,
    tsCode,
    setTsCode,
    onMount,
    monaco,
    compileAndPreview,
    error,
  } = useTsEditor({
    generatePdf(docDefinition) {
      pdfMake.createPdf(docDefinition).getBlob((blob) => {
        const url = URL.createObjectURL(blob);

        setPdfUrl((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev);
          }
          return url;
        });
      });
    },
    initialCode: template.rawFunctionDefinition,
    previewPayload: template.previewPayload,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (code: { jsCode: string; tsCode: string }) => {
      const cfg = handle("/api/v1/templates/[id]", {
        params: { id: template.id },
        bodySchema: patchTemplateSchema,
      });

      await axios.patch(
        cfg.url,
        cfg.body({
          functionDefinition: code.jsCode,
          rawFunctionDefinition: code.tsCode,
        }),
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      router.refresh();
    },
  });

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: monaco ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className={cn("flex h-screen w-screen")}
    >
      <div className="h-screen w-[50%] relative">
        <header className="w-full bg-white h-16 border-b flex items-center p-4 px-6 shadow-sm">
          <Button
            variant="outline"
            size="icon"
            className="h-8 flex items-center justify-center px-0 py-0 w-8 rounded-md mr-6"
          >
            <ChevronLeftIcon className="w-6 h-6 text-muted-foreground" />
          </Button>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="text-base">
                <Link href="../templates">Templates</Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="text-base">
                <BreadcrumbPage>{template.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto inline-flex gap-6">
            <VariablesEditor
              monaco={monaco}
              template={template}
              onPayloadChange={compileAndPreview}
            />

            <Button
              loading={isPending}
              size="sm"
              onClick={() => {
                mutate({ jsCode: jsCode || "", tsCode });
              }}
            >
              Save
            </Button>
          </div>
        </header>

        <TSEditor
          onMount={onMount}
          value={tsCode}
          options={{
            readOnly: isPending,
          }}
          onChange={(value) => {
            setTsCode(value || "");
          }}
        />

        {error ? (
          <div className="absolute bottom-0">
            <div className="bg-red-400 text-red-50 p-4">{error}</div>
          </div>
        ) : null}
      </div>
      {pdfUrl ? (
        <iframe
          title="PDF Preview"
          src={pdfUrl}
          style={{ width: "50%", height: "100%" }}
          frameBorder="0"
        />
      ) : null}
    </motion.main>
  );
}
