import { ZodAny, ZodType, z } from "zod";

const baseTypeSchema = z.object({
  required: z.boolean(),
  defaultValue: z.any(),
});

export type BasePayload = z.infer<typeof baseTypeSchema> & {
  type: {
    name: string;
    schema?: Record<string, BasePayload> | string;
  };
};

export const payloadSchema: z.ZodType<BasePayload> = baseTypeSchema.extend({
  type: z.object({
    name: z.string(),
    schema: z.optional(
      z
        .record(
          z.string(),
          z.lazy(() => payloadSchema)
        )
        .or(z.string())
    ),
  }),
});

export type PayloadSchema = z.infer<typeof payloadSchema>;

/**
 * Take in a json payload and recursively generate a schema for it.
 * The schema is used to generate typescript interfaces (for the editor) and zod schemas (for API validation).
 */
export function generatePayloadSchema(
  payload: string,
  prev: z.infer<typeof payloadSchema>
) {
  try {
    const input = JSON.parse(payload);
    const schema: z.infer<typeof payloadSchema> = prev || {};

    Object.entries(input).forEach(([key, value]) => {
      schema[key as keyof BasePayload] = {
        required: true,
        defaultValue: null,
        type: {
          name: value instanceof Array ? "array" : typeof value,
          ...(typeof value === "object" && value
            ? {
                schema:
                  value instanceof Array
                    ? generatePayloadSchema(
                        JSON.stringify(value[0]),
                        {} as BasePayload
                      )
                    : generatePayloadSchema(
                        JSON.stringify(value),
                        {} as BasePayload
                      ),
              }
            : {}),
        },
      };
    });

    // remove keys that are not in the payload
    Object.keys(schema).forEach((key) => {
      if (!input[key]) {
        delete schema[key as keyof BasePayload];
      }
    });

    return schema;
  } catch (e) {
    console.error(e);
  }
}

function parseInterfaceType(type: PayloadSchema["type"]): string {
  if (type.name === "object" && type.schema) {
    return parseInterfaceSchema(type.schema as Record<string, BasePayload>);
  } else if (type.name === "array" && type.schema) {
    const isObjectSchema = (Object.keys(type.schema).length || 0) > 0;
    const schemaType = isObjectSchema
      ? parseInterfaceSchema(type.schema as Record<string, BasePayload>)
      : type.schema;
    return `${schemaType}[]`;
  } else {
    return type.name;
  }
}

function parseInterfaceSchema(
  schema: PayloadSchema | Record<string, BasePayload>
) {
  return `{ ${Object.entries(schema)
    .map(([key, value]) => {
      const optional = !value.required || value.defaultValue !== null;
      return `${key}${optional ? "?" : ""}: ${parseInterfaceType(value.type)};`;
    })
    .join("\n")} }`;
}

export function payloadSchemaToInterface(schema: PayloadSchema) {
  const typeDef = `\
    interface Variables ${parseInterfaceSchema(schema)};
`;

  return typeDef;
}

export function payloadSchemaToZod(
  schema: PayloadSchema | Record<string, BasePayload>
) {
  const zodShape: Record<string, ZodType> = {};

  Object.entries(schema).forEach(([key, { type, required, defaultValue }]) => {
    let baseType: ZodType;

    if (type.name === "string") {
      baseType = z.string();
    } else if (type.name === "number") {
      baseType = z.number();
    } else if (type.name === "boolean") {
      baseType = z.boolean();
    } else if (type.name === "array") {
      const isObjectSchema = (Object.keys(type.schema).length || 0) > 0;
      if (isObjectSchema) {
        baseType = z.array(
          payloadSchemaToZod(type.schema as Record<string, BasePayload>)
        );
      } else {
        baseType =
          type.schema === "boolean"
            ? z.array(z.boolean())
            : type.schema === "number"
            ? z.array(z.number())
            : z.array(z.string());
      }
    } else if (type.name === "object") {
      baseType = payloadSchemaToZod(type.schema as Record<string, BasePayload>);
    } else {
      throw new Error(`Unsupported type: ${type.name}`);
    }

    // handle qualifiers
    if (!required) {
      baseType = baseType.optional();
    }

    if (defaultValue) {
      baseType = baseType.default(defaultValue);
    }

    zodShape[key] = baseType;
  });

  return z.object(zodShape);
}

/**
 * Take in a payload schema and generate a "dummy" json payload. This
 * is used by the editor to preview the pdf since values may be required.
 * Uses the criteria:
 * - if field has default value, use that, othwerwise:
 * - if field is string, value should "{{field}}"
 * - if field is boolean, default value should be false
 * - if field is number, default value should be 10
 * - if field is array, recurse it's schema and generate at least 1 item
 */
export function payloadSchemaToJson(schema: PayloadSchema) {
  const payload: Record<string, z.infer<ZodAny>> = {};

  Object.entries(schema).forEach(([key, { type, required, defaultValue }]) => {
    if (defaultValue !== null) {
      payload[key] = defaultValue;
    } else {
      if (type.name === "string") {
        payload[key] = `{{${key}}}`;
      } else if (type.name === "boolean") {
        payload[key] = false;
      } else if (type.name === "number") {
        payload[key] = 10;
      } else if (type.name === "array") {
        const isObjectSchema = (Object.keys(type.schema).length || 0) > 0;
        payload[key] = isObjectSchema
          ? payloadSchemaToJson(type.schema as PayloadSchema)
          : type.schema === "boolean"
          ? [false]
          : type.schema === "number"
          ? [10]
          : ["{{item}}"];
      } else if (type.name === "object") {
        payload[key] = payloadSchemaToJson(type.schema as PayloadSchema);
      }
    }
  });

  return payload;
}
