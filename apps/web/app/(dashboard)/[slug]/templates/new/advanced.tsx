import { TSEditor, useTsEditor } from "@/components/editor";
import { Checkbox } from "@/components/ui/checkbox";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BasePayload, generatePayloadSchema } from "@/lib/payload-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import isEqual from "lodash/isEqual";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormSection } from "./section";
import { CreateTemplateForm } from "./utils";

const advancedConfigSchema = z.object({
  passwordProtection: z.object({
    enabled: z.boolean().default(false),
    password: z.string().optional(),
  }),
  watermark: z.object({
    enabled: z.boolean().default(false),
    text: z.string().optional(),
    opacity: z.number().default(0.2),
  }),
});

export function Advanced(props: { form: CreateTemplateForm }) {
  const [definition, setDefinition] = useState<TDocumentDefinitions>({
    content: [{ text: "Hello world!", fontSize: 24, color: "red" }],
  });
  const initialCode = `\
/**
 * Define your PDF template here.
 */ 
function generate(variables: Variables) {
    return ${JSON.stringify(definition, null, 4).replace(
      /\}$/,
      "  }"
    )} satisfies TDocumentDefinitions;
}`;
  const { jsCode, tsCode, setTsCode, onMount } = useTsEditor({ initialCode });

  const form = useForm<z.infer<typeof advancedConfigSchema>>({
    resolver: zodResolver(advancedConfigSchema),
    defaultValues: {
      passwordProtection: {
        enabled: false,
        password: "",
      },
      watermark: {
        enabled: false,
        text: "",
        opacity: 0.2,
      },
    },
  });

  const watch = form.watch();

  useEffect(() => {
    const watermark = watch.watermark.text;
    const watermarkEnabled = watch.watermark.enabled;
    const password = watch.passwordProtection.password;
    const passwordEnabled = watch.passwordProtection.enabled;

    const def = Object.entries(definition).reduce((acc, [key, value]) => {
      if (key === "watermark" && !watermarkEnabled) {
        return acc;
      }
      if (key === "userPassword" && !passwordEnabled) {
        return acc;
      }
      return {
        ...acc,
        [key]: value,
      };
    }, {} as TDocumentDefinitions);

    const currentDef: TDocumentDefinitions = {
      ...def,
      ...(password && passwordEnabled ? { userPassword: password } : {}),
      ...(watermark && watermarkEnabled
        ? {
            watermark: {
              text: watermark,
              opacity: watch.watermark.opacity,
            },
          }
        : {}),
    };

    if (!isEqual(currentDef, definition)) {
      setDefinition(currentDef);
      setTsCode(`\
/**
 * Define your PDF template here.
 */ 
function generate(variables: Variables) {
    return ${JSON.stringify(currentDef, null, 4).replace(
      /\}$/,
      "  }"
    )} satisfies TDocumentDefinitions;
}`);
    }
  }, [watch, definition, setTsCode]);

  useEffect(() => {
    const payload = JSON.stringify({ hello: "world" });
    const payloadSchema = generatePayloadSchema(payload, {} as BasePayload);

    props.form.setValue("functionDefinition", jsCode || "");
    props.form.setValue("rawFunctionDefinition", tsCode);
    props.form.setValue("payloadSchema", payloadSchema || {});
  }, [definition, props.form, jsCode, tsCode]);

  return (
    <FormSection
      title="Advanced settings"
      description="Password protection, watermarking and more"
    >
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="passwordProtection.enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-4 leading-none">
                <FormLabel>Enable password protection</FormLabel>
                <FormDescription className="w-[240px]">
                  <FormField
                    disabled={!field.value}
                    control={form.control}
                    name="passwordProtection.password"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            placeholder="L1Saan@lGa1B"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Set a password to protect the PDF
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="watermark.enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-4 leading-none">
                <FormLabel>Add a watermark</FormLabel>
                <FormDescription className="w-full">
                  <FormField
                    disabled={!field.value}
                    control={form.control}
                    name="watermark.text"
                    render={({ field }) => (
                      <FormItem className="w-[240px]">
                        <FormControl>
                          <Input
                            placeholder="My Company"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Add a watermark to the PDF
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>

      <div className="h-4" />

      <h3 className="text-muted-foreground">
        We will generate a default template function for you. You will be able
        to edit this later
      </h3>
      <TSEditor
        height={500}
        onMount={onMount}
        className="opacity-60 border shadow-sm"
        options={{
          readOnly: true,
          cursorStyle: "line-thin",
        }}
        value={tsCode}
        onChange={(v) => setTsCode(v || "")}
      />
    </FormSection>
  );
}
