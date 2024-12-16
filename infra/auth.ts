import { vpc, database } from "./shared";

export const userPool =
  $app.stage === "dev"
    ? new sst.aws.CognitoUserPool("BuildZeroAuth", {
        usernames: ["email"],
        triggers: {
          customMessage: "packages/cognito/src/custom-message/index.handler",
          postAuthentication: {
            vpc,
            memory: "3008 MB",
            handler: "packages/cognito/src/post-authentication/index.handler",
            link: [database],
          },
          postConfirmation: {
            vpc,
            memory: "3008 MB",
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
      })
    : sst.aws.CognitoUserPool.get("BuildZeroAuth", "us-east-2_Op3stHCiZ");

export const userPoolClient = userPool.addClient("BuildZeroPoolWebClient");
