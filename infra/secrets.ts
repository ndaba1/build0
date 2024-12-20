export const contentfulSpaceId = secret("ContentfulSpaceId", { refId: "" });
export const contentfulAccessToken = secret("ContentfulAccessToken", {
  refId: "",
});

function secret(id: string, { refId }: { refId: string }) {
  if ($app.stage === "dev") {
    return new aws.ssm.Parameter(`SSM${id}`, {
      type: "String",
      value: new sst.Secret(id).value,
    });
  }

  // reference existing secrets from dev stage
  return aws.ssm.Parameter.get(id, refId);
}
