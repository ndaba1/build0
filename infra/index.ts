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
  timeout: "2 minutes",
  handler: "packages/database/src/migrator.handler",
  copyFiles: [
    {
      from: "./packages/database/migrations",
      to: "./migrations",
    },
  ],
});

const invocation = new aws.lambda.Invocation("PostgresMigratorInvocation", {
  functionName: migrator.name,
  input: JSON.stringify({
    now: new Date().toISOString(),
  }),
});

export const userPool = new sst.aws.CognitoUserPool(
  "BuildZeroCognitoUserPool",
  {
    usernames: ["email"],
    triggers: {
      customMessage: "packages/cognito/src/custom-message/index.handler",
      postConfirmation: {
        vpc,
        memory: "3008 MB",
        name: `BuildZeroCognitoPostConfirmationFn-${$app.stage}`,
        handler: "packages/cognito/src/post-confirmation/index.handler",
        link: [database],
      },
    },
    transform: {
      userPool(args) {
        args.schemas = [
          {
            name: "email",
            required: true,
            mutable: true,
            attributeDataType: "String",
          },
          {
            name: "name",
            required: true,
            mutable: true,
            attributeDataType: "String",
          },
          {
            name: "is_onboarded",
            required: false,
            mutable: true,
            attributeDataType: "Boolean",
          },
          {
            name: "default_project",
            required: false,
            mutable: true,
            attributeDataType: "String",
          },
        ];
      },
    },
  }
);

export const userPoolClient = userPool.addClient("BuildZeroPoolWebClient");

export const redis = new sst.aws.Redis("BuildZeroRedisCache", {
  vpc,
});

export const website = new sst.aws.Nextjs(
  "BuildZeroWeb",
  {
    vpc,
    link: [database, docBucket, imageBucket, redis],
    path: "apps/web",
    domain: {
      name: "build0.dev",
      dns: sst.cloudflare.dns(),
      aliases: ["api.build0.dev"],
      redirects: ["www.build0.dev"],
    },
    environment: {
      NEXT_PUBLIC_AWS_REGION: "us-east-2",
      NEXT_PUBLIC_USER_POOL_ID: userPool.id,
      NEXT_PUBLIC_USER_POOL_CLIENT_ID: userPoolClient.id,

      // uncomment for self signup
      // ENABLE_SELF_SIGNUP: "true",
    },
  },
  // make sure migrations applied
  { dependsOn: [invocation] }
);

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
