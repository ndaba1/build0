import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";

const cloudFront = new CloudFrontClient({});

export async function invalidateCloudFrontPaths(paths: string[]) {
  const distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;

  if (distributionId && distributionId !== "null") {
    await cloudFront.send(
      new CreateInvalidationCommand({
        DistributionId: distributionId,
        InvalidationBatch: {
          CallerReference: `${Date.now()}`,
          Paths: {
            Quantity: paths.length,
            Items: paths,
          },
        },
      })
    );
  }
}
