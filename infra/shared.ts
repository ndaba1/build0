export const docBucket = new sst.aws.Bucket("BuildZeroBucket");
export const imageBucket = new sst.aws.Bucket("BuildZeroImageBucket");

export const vpc =
  $app.stage === "dev"
    ? new sst.aws.Vpc("BuildZeroVpc", {
        bastion: true,
        nat: "ec2",
      })
    : sst.aws.Vpc.get("BuildZeroVpc", "vpc-06cd9f4bdde3d1c6e");

export const database =
  $app.stage === "dev"
    ? new sst.aws.Postgres("BuildZeroDatabase", {
        vpc,
        proxy: true,
      })
    : sst.aws.Postgres.get("BuildZeroDatabase", {
        id: "build0-dev-buildzerodatabaseinstance",
        proxyId: "build0-dev-buildzerodatabaseproxy",
      });

if ($app.stage === "dev") {
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

  const migratorInvocation = new aws.lambda.Invocation(
    "PostgresMigratorInvocation",
    {
      functionName: migrator.name,
      input: JSON.stringify({
        now: new Date().toISOString(),
      }),
    }
  );
}

export const redis =
  $app.stage === "dev"
    ? new sst.aws.Redis("BuildZeroRedisCache", {
        vpc,
      })
    : sst.aws.Redis.get(
        "BuildZeroRedisCache",
        "build0-dev-buildzerorediscache"
      );
