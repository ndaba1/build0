import { and, eq } from "@repo/database";
import { db } from "@repo/database/client";
import { projectUsers, users } from "@repo/database/schema";
import { PostAuthenticationTriggerEvent } from "aws-lambda";

export const handler = async (event: PostAuthenticationTriggerEvent) => {
  // TODO: track login events?
  console.log("function invoked with event", JSON.stringify(event, null, 2));

  const userSub = event.userName;
  if (userSub) {
    console.log("userSub", userSub);
    const results = await db
      .select({
        projectUserId: projectUsers.id,
      })
      .from(projectUsers)
      .innerJoin(users, eq(users.id, projectUsers.userId))
      .where(and(eq(users.sub, userSub), eq(projectUsers.status, "PENDING")));

    console.log("results", results);

    if (results?.length > 0) {
      const result = results[0];
      const projectUserId = result.projectUserId;

      if (projectUserId)
        await db
          .update(projectUsers)
          .set({ status: "ACTIVE" })
          .where(eq(projectUsers.id, projectUserId));
    }
  }

  return event;
};
