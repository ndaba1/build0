export const cloudfrontFunctionCode = `\
  const cookieNames = Object.keys(event.request.cookies);
  const allowedCookies = {};

  for (var i = cookieNames.length - 1; i >= 0; i--) {
      const cookieName = cookieNames[i];

      if (!cookieName.startsWith("CognitoIdentityServiceProvider")) {
          allowedCookies[cookieName] = event.request.cookies[cookieName];
      } else {
          const parts = cookieName.split(".");
          const suffix = parts[parts.length - 1];
          const existingCookies = Object.keys(allowedCookies);

          if (!existingCookies.some((cookie) => cookie.endsWith(suffix))) {
              allowedCookies[cookieName] = event.request.cookies[cookieName];
          }
      }
  }

  event.request.cookies = allowedCookies;
`;
