import { createTemplateSchema } from "@repo/database/schema";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const formSchema = createTemplateSchema.extend({
  projectId: z.string().optional(),
  // name cannot contain special characters
  name: z
    .string()
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Name can only contain letters, numbers and underscores"
    ),
});

export type CreateTemplateForm = ReturnType<
  typeof useForm<z.infer<typeof formSchema>>
>;
