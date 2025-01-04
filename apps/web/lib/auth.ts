import { env } from "@/env";
import { ResourcesConfig } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { CookieStorage } from "aws-amplify/utils";

cognitoUserPoolsTokenProvider.setKeyValueStorage(
  new CookieStorage({
    domain: ".buildzero.fyi",
  })
);

export const authConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: env.NEXT_PUBLIC_USER_POOL_ID,
      userPoolClientId: env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
      userAttributes: {
        email: {
          required: true,
        },
        name: {
          required: true,
        },
      },
      loginWith: {
        email: true,
        username: false,
        phone: false,
      },
    },
  },
};
