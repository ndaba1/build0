import { env } from "@/env";

export const authConfig = {
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
