import { z } from "zod";

export const templateSchema = z.record(
  z.string(),
  z.object({
    required: z.boolean(),
    defaultValue: z.any(),
    type: z.object({
      name: z.string(),
      schema: z.optional(z.record(z.string(), z.any()).or(z.string())),
    }),
  })
);

export const initialCode = `\
/**
 * Define your PDF template here.
 */ 
function generate(variables: Variables) {
  return {
    content: [
      { text: 'Hello, World!', fontSize: 24 }
    ]
  } satisfies TDocumentDefinitions;
}`;
