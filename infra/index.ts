import * as auth from "./auth";

export const docBucket = new sst.aws.Bucket("BuildZeroBucket");
export const imageBucket = new sst.aws.Bucket("BuildZeroImageBucket");

export const vpc = new sst.aws.Vpc("BuildZeroVpc", {
  bastion: true,
  nat: "managed",
});

export const database = new sst.aws.Postgres("BuildZeroDatabase", {
  vpc,
  proxy: true,
});

const migrator = new sst.aws.Function("PostgresMigrator", {
  vpc,
  link: [database],
  handler: "packages/database/src/migrator.handler",
  copyFiles: [
    {
      from: "./packages/database/migrations",
      to: "./migrations",
    },
  ],
});

new aws.lambda.Invocation("PostgresMigratorInvocation", {
  functionName: migrator.name,
  input: JSON.stringify({
    now: new Date().toISOString(),
  }),
});

export const website = new sst.aws.Nextjs("BuildZeroWeb", {
  vpc,
  link: [database, docBucket, imageBucket],
  path: "apps/web",
  domain: {
    name: "build0.dev",
    dns: sst.cloudflare.dns(),
    aliases: ["api.build0.dev"],
    redirects: ["www.build0.dev"],
  },
  environment: {
    NEXT_PUBLIC_USER_POOL_ID: auth.userPool.id,
    NEXT_PUBLIC_USER_POOL_CLIENT_ID: auth.userPoolClient.id,
  },
});

docBucket.subscribe(
  {
    vpc,
    handler: "packages/previewer/src/index.handler",
    timeout: "10 minutes",
    memory: "2048 MB",
    link: [database, docBucket, imageBucket],
    nodejs: {
      install: ["@sparticuz/chromium", "puppeteer-core"],
    },
    name: `BuildZeroPreviewerFn-${$app.stage}`,
    environment: {
      IS_LOCAL: $app.stage !== "prod" ? "true" : undefined,
      APP_URL: $app.stage === "prod" ? website.url : "http://localhost:3000",
    },
  },
  {
    events: ["s3:ObjectCreated:*"],
  }
);
