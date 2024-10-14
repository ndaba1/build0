"use client";

import Editor from "@monaco-editor/react";
import Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useEffect, useState } from "react";
import { z } from "zod";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import {
  BasePayload,
  generatePayloadSchema,
  payloadSchema,
  payloadSchemaToInterface,
} from "@/lib/payload-schema";
import { Template, patchTemplateSchema } from "@repo/database/schema";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { SquareTerminalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { handle } from "typed-handlers";

export function VariablesEditor({
  monaco,
  template,
}: {
  monaco?: typeof Monaco | null;
  template: Template;
}) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [schema, setSchema] = useState<z.infer<typeof payloadSchema>>(
    (template.payloadSchema || {}) as BasePayload
  );
  const [samplePayload, setSamplePayload] = useState<string>("{}");

  useEffect(() => {
    try {
      if (Object.keys(JSON.parse(samplePayload)).length === 0) return;
    } catch (e) {
      console.error(e);
      return;
    }

    setSchema(
      (prev) =>
        ({
          ...generatePayloadSchema(samplePayload, prev),
        } as BasePayload)
    );
  }, [samplePayload]);

  useEffect(() => {
    if (!monaco) return;

    const typeDef = payloadSchemaToInterface(schema);
    monaco.languages.typescript.typescriptDefaults.addExtraLib(typeDef);
    monaco.languages.typescript.getTypeScriptWorker(); // -> trigger worker initialization
  }, [monaco, schema]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (payloadSchema: BasePayload) => {
      const cfg = handle("/api/v1/templates/[id]", {
        params: { id: template.id },
        bodySchema: patchTemplateSchema,
      });

      await axios.patch(cfg.url, cfg.body({ payloadSchema }));
      router.refresh();
      setShow(false);
    },
  });

  return (
    <Sheet open={show} onOpenChange={setShow}>
      <SheetTrigger>
        <SquareTerminalIcon className="w-6 h-6 text-muted-foreground" />
      </SheetTrigger>
      <SheetContent side="left" className="min-w-[500px]">
        <SheetHeader>
          <SheetTitle>Template Variables Editor</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pt-8">
          <div className="space-y-0.5">
            <h1 className="font-medium">Sample Payload</h1>
            <p className="text-muted-foreground text-sm">
              Paste a sample payload here to update/generate a schema for your
              template&apos;s variables
            </p>
          </div>
          <Editor
            language="json"
            width="100%"
            className="border shadow"
            height={300}
            options={{
              codeLens: false,
              readOnly: isPending,
              fontFamily: "Menlo, Consolas, monospace, sans-serif",
              quickSuggestions: false,
              renderValidationDecorations: "off",
              minimap: { enabled: false },
              fontSize: 14,
              folding: false,
              wordWrap: "on",
              tabSize: 2,
              glyphMargin: false,
              lineDecorationsWidth: 4,
              lineNumbersMinChars: 2,
              lineNumbers: "on",
            }}
            value={samplePayload}
            onChange={(v) => setSamplePayload(v || "")}
          />

          <div className="space-y-0.5">
            <h1 className="font-medium">Schema</h1>
            <p className="text-muted-foreground text-sm">
              You can update the schema to set default values or mark fields as
              required/optional
            </p>
          </div>
          <Editor
            language="json"
            width="100%"
            className="border shadow"
            height={300}
            options={{
              codeLens: false,
              readOnly: isPending,
              fontFamily: "Menlo, Consolas, monospace, sans-serif",
              quickSuggestions: false,
              renderValidationDecorations: "off",
              minimap: { enabled: false },
              fontSize: 14,
              folding: false,
              wordWrap: "on",
              tabSize: 2,
              glyphMargin: false,
              lineDecorationsWidth: 4,
              lineNumbersMinChars: 2,
              lineNumbers: "on",
            }}
            value={JSON.stringify(schema, null, 2)}
            onChange={(v) => {
              try {
                setSchema(JSON.parse(v || "{}"));
              } catch (e) {
                console.error(e);
              }
            }}
          />
        </div>

        <SheetFooter>
          <Button
            disabled={isPending}
            onClick={() => mutate(schema)}
            className="w-full"
            variant="default"
          >
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
