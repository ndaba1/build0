export const userPool = new aws.cognito.UserPool("BuildZeroUserPool", {
  usernameAttributes: ["email"],
  autoVerifiedAttributes: ["email"],
  adminCreateUserConfig: {
    allowAdminCreateUserOnly: true,
  },
  mfaConfiguration: "OFF",
  emailVerificationMessage: "Your verification code is {####}",
  emailVerificationSubject: "Verify your BuildZero account",
  accountRecoverySetting: {
    recoveryMechanisms: [
      {
        name: "verified_email",
        priority: 1,
      },
    ],
  },
  schemas: [
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
  ],
  usernameConfiguration: {
    caseSensitive: false,
  },
});

export const userPoolClient = new aws.cognito.UserPoolClient(
  "BuildZeroUserPoolClient",
  {
    userPoolId: userPool.id,
    generateSecret: false,
    explicitAuthFlows: [
      "ALLOW_USER_SRP_AUTH",
      "ALLOW_REFRESH_TOKEN_AUTH",
      "ALLOW_CUSTOM_AUTH",
      "ALLOW_ADMIN_USER_PASSWORD_AUTH",
    ],
  }
);

sst.Linkable.wrap(aws.cognito.UserPool, (pool) => ({
  properties: { poolId: pool.id },
}));

sst.Linkable.wrap(aws.cognito.UserPoolClient, (client) => ({
  properties: { clientId: client.id },
}));
