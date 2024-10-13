"use client";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { TSEditor, useTsEditor } from "@/components/editor";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { VariablesEditor } from "./variables";

// Register fonts with pdfMake
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { tsCode, setTsCode, onMount, monaco } = useTsEditor({
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
  });

  return (
    <main className="flex h-screen w-screen">
      <div className="h-screen w-[50%]">
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
                <BreadcrumbLink href="/">Build Zero</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="text-base">
                <BreadcrumbLink href="/components">Templates</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="text-base">
                <BreadcrumbPage>Invoices</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto inline-flex gap-6">
            <VariablesEditor monaco={monaco} />
          </div>
        </header>

        <TSEditor
          onMount={onMount}
          value={tsCode}
          onChange={(value) => {
            setTsCode(value || "");
          }}
        />
      </div>
      {pdfUrl ? (
        <iframe
          title="PDF Preview"
          src={pdfUrl}
          style={{ width: "50%", height: "100%" }}
          frameBorder="0"
        />
      ) : null}
    </main>
  );
}
