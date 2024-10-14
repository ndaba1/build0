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

export const website = new sst.aws.Nextjs("BuildZeroWeb", {
  vpc,
  link: [database, docBucket, imageBucket],
  path: "apps/web",
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
