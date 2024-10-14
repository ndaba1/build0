import * as auth from "./auth";

export const bucket = new sst.aws.Bucket("BuildZeroBucket");
export const vpc = new sst.aws.Vpc("BuildZeroVpc", { bastion: true });
export const database = new sst.aws.Postgres("BuildZeroDatabase", {
  vpc,
  proxy: true,
});
export const website = new sst.aws.Nextjs("BuildZeroWeb", {
  vpc,
  link: [database, bucket],
  path: "apps/web",
  environment: {
    NEXT_PUBLIC_USER_POOL_ID: auth.userPool.id,
    NEXT_PUBLIC_USER_POOL_CLIENT_ID: auth.userPoolClient.id,
  },
});
