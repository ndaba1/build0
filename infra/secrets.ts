export const contentfulSpaceId = secret("ContentfulSpaceId");
export const contentfulAccessToken = secret("ContentfulAccessToken");

function secret(id: string) {
  if ($app.stage === "dev") {
    return new aws.ssm.Parameter(`SM_${id}`, {
      type: "String",
      value: new sst.Secret(id).value,
      name: `/build0/secrets/${$app.stage}/${id}`,
    });
  }

  // reference existing secrets from dev stage
  return aws.ssm.Parameter.get(id, `/build0/secrets/dev/${id}`);
}
