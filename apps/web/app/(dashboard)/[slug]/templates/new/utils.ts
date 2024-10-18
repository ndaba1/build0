import { createTemplateSchema } from "@repo/database/schema";
import { useForm } from "react-hook-form";
import { z } from "zod";

export type CreateTemplateForm = ReturnType<
  typeof useForm<z.infer<typeof createTemplateSchema>>
>;
