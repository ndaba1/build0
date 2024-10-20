import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_AWS_REGION: z.string().min(1),
    NEXT_PUBLIC_USER_POOL_ID: z.string().min(1),
    NEXT_PUBLIC_USER_POOL_CLIENT_ID: z.string().min(1),
  },
  server: {
    FILE_SERVER_URL: z.string().min(1),
    DOCUMENT_TOKEN_SECRET: z.string().min(1),
    ENABLE_SELF_SIGNUP: z.coerce.boolean().optional(),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
    NEXT_PUBLIC_USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID,
    NEXT_PUBLIC_USER_POOL_CLIENT_ID:
      process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,

    FILE_SERVER_URL: process.env.FILE_SERVER_URL,
    DOCUMENT_TOKEN_SECRET: process.env.DOCUMENT_TOKEN_SECRET,
    ENABLE_SELF_SIGNUP: process.env.ENABLE_SELF_SIGNUP || undefined,
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  // experimental__runtimeEnv: {
  //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  // }
});
