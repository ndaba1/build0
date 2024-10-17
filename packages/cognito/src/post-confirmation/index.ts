import { PostConfirmationTriggerEvent } from "aws-lambda";
import { db } from "@repo/database/client";
import { users } from "@repo/database/schema";

export const handler = async (event: PostConfirmationTriggerEvent) => {
  console.log("function invoked with event", event);
  const attributes = event.request.userAttributes;

  await db.insert(users).values({
    email: attributes.email,
    name: attributes.name,
    sub: attributes.sub,
    isMachine: false,
  });

  return event;
};
