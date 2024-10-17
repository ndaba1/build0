import { render } from "@react-email/render";
import React from "react";

import VerifyEmail from "@repo/email/verify";
import InviteUser from "@repo/email/invite";
import { CustomMessageTriggerEvent } from "aws-lambda";

export const handler = async (event: CustomMessageTriggerEvent) => {
  if (event.triggerSource === "CustomMessage_SignUp") {
    event.response.emailSubject = "Verify your BuildZero Account";
    event.response.emailMessage = await render(
      VerifyEmail({
        username: event.request.usernameParameter!,
        verificationCode: event.request.codeParameter,
      }),
      {
        pretty: true,
      }
    );
  }

  if (event.triggerSource === "CustomMessage_AdminCreateUser") {
    event.response.emailSubject = "You've been invited to join BuildZero!";
    event.response.emailMessage = await render(
      InviteUser({
        username: event.request.usernameParameter!,
        password: event.request.codeParameter,
      }),
      {
        pretty: true,
      }
    );
  }

  if (event.triggerSource === "CustomMessage_ForgotPassword") {
    event.response.emailSubject = "Reset your password";
    event.response.emailMessage = "Please reset your password";
  }

  if (event.triggerSource === "CustomMessage_ResendCode") {
    event.response.emailSubject = "Resend your code";
    event.response.emailMessage = "Please resend your code";
  }

  if (event.triggerSource === "CustomMessage_UpdateUserAttribute") {
    event.response.emailSubject = "Update your user attribute";
    event.response.emailMessage = "Please update your user attribute";
  }

  if (event.triggerSource === "CustomMessage_VerifyUserAttribute") {
    event.response.emailSubject = "Verify your user attribute";
    event.response.emailMessage = "Please verify your user attribute";
  }

  return event;
};
