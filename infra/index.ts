import { vpc, database, docBucket, imageBucket, redis } from "./shared";
import { userPool, userPoolClient } from "./auth";
import { customAlphabet } from "nanoid";

// no uppercase to avoid CNAME errors
const nano = customAlphabet("abcdefghijklmnopqrstuvwxyz", 10);

export const website = new sst.aws.Nextjs("BuildZeroWeb", {
  vpc,
  link: [database, docBucket, imageBucket, redis, userPool, userPoolClient],
  path: "apps/web",
  domain: {
    name: $app.stage === "dev" ? "build0.dev" : `${nano()}.build0.dev`,
    dns: sst.cloudflare.dns(),
    aliases:
      $app.stage === "dev" ? ["api.build0.dev", "files.build0.dev"] : undefined,
    redirects: $app.stage === "dev" ? ["www.build0.dev"] : undefined,
  },
  transform: {
    cdn: {
      wait: false, // since we have pre-computed domains
    },
  },
  environment: {
    NEXT_PUBLIC_AWS_REGION: "us-east-2",
    NEXT_PUBLIC_USER_POOL_ID: userPool.id,
    NEXT_PUBLIC_USER_POOL_CLIENT_ID: userPoolClient.id,

    // file server url
    FILE_SERVER_URL:
      $app.stage === "dev"
        ? "https://files.build0.dev"
        : "http://localhost:3000/api/v1/files",

    DOCUMENT_TOKEN_SECRET: process.env.DOCUMENT_TOKEN_SECRET,

    // uncomment for self signup
    // ENABLE_SELF_SIGNUP: "true",
  },
});

if ($app.stage === "dev") {
  docBucket.subscribe(
    {
      vpc,
      handler: "packages/previewer/src/index.handler",
      timeout: "10 minutes",
      memory: "3008 MB",
      link: [database, docBucket, imageBucket],
      nodejs: {
        install: ["@sparticuz/chromium", "puppeteer-core"],
      },
      name: `BuildZeroPreviewerFn-${$app.stage}`,
      environment: {
        IS_LOCAL: process.env.IS_LOCAL,

        // file server url
        FILE_SERVER_URL:
          $app.stage === "dev"
            ? "https://files.build0.dev"
            : "http://localhost:3000/api/v1/files",

        DOCUMENT_TOKEN_SECRET: process.env.DOCUMENT_TOKEN_SECRET,
      },
    },
    {
      events: ["s3:ObjectCreated:*"],
    }
  );
}

export * from "./shared";
export * from "./auth";
