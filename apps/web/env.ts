import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_AWS_REGION: z.string().min(1),
    NEXT_PUBLIC_USER_POOL_ID: z.string().min(1),
    NEXT_PUBLIC_USER_POOL_CLIENT_ID: z.string().min(1),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).startsWith("phc_"),
  },
  server: {
    FILE_SERVER_URL: z.string().min(1),
    DOCUMENT_TOKEN_SECRET: z.string().min(1),
    ENABLE_SELF_SIGNUP: z.coerce.boolean().optional(),
    CONTENTFUL_SPACE_ID: z.string().min(1),
    CONTENTFUL_ACCESS_TOKEN: z.string().min(1),
    DOCUMENT_BUCKET_NAME: z.string().min(1),
    REDIS_HOST: z.string().min(1),
    REDIS_PASSWORD: z.string(),
    REDIS_USERNAME: z.string(),
    DB_HOST: z.string().min(1),
    DB_USERNAME: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
    NEXT_PUBLIC_USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID,
    NEXT_PUBLIC_USER_POOL_CLIENT_ID:
      process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,

    FILE_SERVER_URL: process.env.FILE_SERVER_URL,
    DOCUMENT_TOKEN_SECRET: process.env.DOCUMENT_TOKEN_SECRET,
    ENABLE_SELF_SIGNUP: process.env.ENABLE_SELF_SIGNUP || undefined,
    CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID,
    CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_ACCESS_TOKEN,
    DOCUMENT_BUCKET_NAME: process.env.DOCUMENT_BUCKET_NAME,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_USERNAME: process.env.REDIS_USERNAME,
    DB_HOST: process.env.DB_HOST,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  // experimental__runtimeEnv: {
  //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  // }
});
