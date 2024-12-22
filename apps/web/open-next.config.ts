import type { OpenNextConfig } from "@opennextjs/aws/types/open-next.js";

const config = {
  default: {
    override: {
      queue: "sqs-lite",
      tagCache: "dynamodb-lite",
      wrapper: "aws-lambda-streaming",
      incrementalCache: "s3-lite",
    },
  },
} satisfies OpenNextConfig;

export default config;
