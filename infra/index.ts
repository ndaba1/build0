import { customAlphabet } from "nanoid";
import { userPool, userPoolClient } from "./auth";
import {
  cloudfrontDistributionId,
  contentfulAccessToken,
  contentfulSpaceId,
  posthogKey,
  revalidateSecret,
} from "./secrets";
import { database, docBucket, imageBucket, redis, vpc } from "./shared";
import { cloudfrontFunctionCode } from "./utils";

// no uppercase to avoid CNAME errors
const nano = customAlphabet("abcdefghijklmnopqrstuvwxyz", 10);

const cloudfrontFn = new aws.cloudfront.Function(
  "BuildZeroCloudfrontServerFn",
  {
    code: cloudfrontFunctionCode,
    runtime: "cloudfront-js-2.0",
  }
);

export const website = new sst.aws.Nextjs("BuildZeroWebApp", {
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
      transform: {
        distribution(args, opts, name) {
          args.defaultCacheBehavior = {
            ...args.defaultCacheBehavior,
            functionAssociations: [
              {
                eventType: "viewer-request",
                functionArn: cloudfrontFn.arn,
              },
            ],
          };

          const behaviors =
            args.orderedCacheBehaviors as unknown as aws.types.input.cloudfront.DistributionOrderedCacheBehavior[];
          args.orderedCacheBehaviors = behaviors.map((behavior) => {
            return {
              ...behavior,
              functionAssociations: [
                {
                  eventType: "viewer-request",
                  functionArn: cloudfrontFn.arn,
                },
              ],
            };
          });
        },
      },
    },
  },
  environment: {
    NEXT_PUBLIC_AWS_REGION: "us-east-1",
    NEXT_PUBLIC_USER_POOL_ID: userPool.id,
    NEXT_PUBLIC_USER_POOL_CLIENT_ID: userPoolClient.id,
    NEXT_PUBLIC_POSTHOG_KEY: posthogKey.value,
    NEXT_PUBLIC_POSTHOG_HOST: "https://us.i.posthog.com",

    // file server url
    FILE_SERVER_URL:
      $app.stage === "dev"
        ? "https://files.build0.dev"
        : "http://localhost:3000/api/v1/files",

    REVALIDATE_SECRET: revalidateSecret.value,
    DOCUMENT_TOKEN_SECRET: process.env.DOCUMENT_TOKEN_SECRET,
    CONTENTFUL_SPACE_ID: contentfulSpaceId.value,
    CONTENTFUL_ACCESS_TOKEN: contentfulAccessToken.value,
    CLOUDFRONT_DISTRIBUTION_ID: cloudfrontDistributionId.value,

    // uncomment for self signup
    // ENABLE_SELF_SIGNUP: "true",
  },
  warm: $app.stage === "dev" ? 3 : 0,
  permissions: [
    {
      actions: ["cloudfront:CreateInvalidation"],
      resources: ["*"],
    },
    {
      actions: ["bedrock:*"],
      resources: ["*"],
    },
  ],
});

if ($app.stage === "dev") {
  const lambdaDlq = new aws.sqs.Queue("BuildZeroPreviewerDLQ", {
    name: "LambdaDLQ",
  });

  const lambdaSuccessQueue = new aws.sqs.Queue(
    "BuildZeroPreviewerSuccessQueue",
    {
      name: "LambdaSuccessQueue",
    }
  );

  const lambdaFailureQueue = new aws.sqs.Queue("BuildZeroPreviewerErrorQueue", {
    name: "LambdaErrorQueue",
  });

  const fn = docBucket.subscribe(
    {
      vpc,
      versioning: true,
      transform: {
        function: {
          deadLetterConfig: {
            targetArn: lambdaDlq.arn,
          },
        },
      },
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
      permissions: [
        {
          actions: ["sqs:*"],
          resources: [
            lambdaDlq.arn,
            lambdaSuccessQueue.arn,
            lambdaFailureQueue.arn,
          ],
        },
      ],
    } satisfies sst.aws.FunctionArgs,
    {
      events: ["s3:ObjectCreated:*"],
    }
  );

  const func = fn.nodes.function;

  new aws.lambda.FunctionEventInvokeConfig("BuildZeroPreviewerInvokeConfig", {
    functionName: func.name,
    destinationConfig: {
      onFailure: { destination: lambdaFailureQueue.arn },
      onSuccess: { destination: lambdaSuccessQueue.arn },
    },
    maximumRetryAttempts: 0,
  });
}

export * from "./auth";
export * from "./shared";

