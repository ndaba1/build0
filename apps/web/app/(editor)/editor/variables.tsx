"use client";

import Editor from "@monaco-editor/react";
import Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useEffect, useState } from "react";
import { z } from "zod";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  BasePayload,
  generatePayloadSchema,
  payloadSchema,
  payloadSchemaToInterface,
} from "@/lib/payload-schema";
import { SquareTerminalIcon } from "lucide-react";

export function VariablesEditor({ monaco }: { monaco?: typeof Monaco | null }) {
  const [schema, setSchema] = useState<z.infer<typeof payloadSchema>>(
    {} as BasePayload
  );
  const [samplePayload, setSamplePayload] = useState<string>("{}");

  useEffect(() => {
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

  return (
    <Sheet>
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
              Paste a sample payload here to generate a schema for your
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
      </SheetContent>
    </Sheet>
  );
}
