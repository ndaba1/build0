"use client";

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

import { useAuth } from "@/components/authenticator";
import { JsonEditor } from "@/components/editor";
import { Button } from "@/components/ui/button";
import {
  BasePayload,
  generatePayloadSchema,
  payloadSchema,
  payloadSchemaToInterface,
  payloadSchemaToJson,
} from "@/lib/payload-schema";
import { Template, patchTemplateSchema } from "@repo/database/schema";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { SquareTerminalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { handle } from "typed-handlers";
import { useDebounce } from "use-debounce";
import { documentTypeDefs } from "./definitions";

export function VariablesEditor({
  monaco,
  template,
  onPayloadChange,
}: {
  monaco?: typeof Monaco | null;
  template: Template;
  onPayloadChange?: (payload: JSON) => void;
}) {
  const router = useRouter();
  const { idToken } = useAuth();
  const [show, setShow] = useState(false);
  const [schema, setSchema] = useState<z.infer<typeof payloadSchema>>(
    (template.payloadSchema || {}) as BasePayload
  );

  const fallbackPayload = payloadSchemaToJson(
    (template.payloadSchema || {}) as BasePayload
  );
  const initialPayload = template.previewPayload || fallbackPayload;
  const [samplePayload, setSamplePayload] = useState<string>(
    JSON.stringify(initialPayload, null, 2)
  );

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

    // reset extra libs
    monaco.languages.typescript.typescriptDefaults.setExtraLibs([]);

    const typeDef = payloadSchemaToInterface(schema);
    monaco.languages.typescript.typescriptDefaults.addExtraLib(`
    ${documentTypeDefs}
    ${typeDef}
    `);
    monaco.languages.typescript.getTypeScriptWorker(); // -> trigger worker initialization
  }, [monaco, schema]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: {
      payloadSchema: BasePayload;
      previewPayload: string;
    }) => {
      const cfg = handle("/api/v1/templates/[id]", {
        params: { id: template.id },
        bodySchema: patchTemplateSchema,
      });

      await axios.patch(cfg.url, cfg.body({ ...values }), {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      router.refresh();
      setShow(false);
    },
  });

  const [debouncedPayload] = useDebounce(samplePayload, 600);
  useEffect(() => {
    onPayloadChange?.(JSON.parse(debouncedPayload));
  }, [debouncedPayload]);

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
              This payload is used to preview your pdf as well as updating the
              template schema
            </p>
          </div>
          <JsonEditor
            height={200}
            options={{
              readOnly: isPending,
            }}
            value={samplePayload}
            onChange={(v) => setSamplePayload(v || "")}
          />

          <div className="space-y-0.5">
            <h1 className="font-medium">Schema</h1>
            <p className="text-muted-foreground text-sm">
              Update this to set default values or mark fields as
              required/optional
            </p>
          </div>
          <JsonEditor
            options={{
              readOnly: isPending,
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

        <SheetFooter className="mt-8">
          <Button
            loading={isPending}
            onClick={() =>
              mutate({
                payloadSchema: schema,
                previewPayload: samplePayload,
              })
            }
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
