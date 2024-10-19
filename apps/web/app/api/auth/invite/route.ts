import { throwError } from "@/lib/throw-error";
import { withAuth } from "@/lib/with-auth";
import {
    AdminCreateUserCommand,
    CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { db } from "@repo/database/client";
import { projectUsers, users } from "@repo/database/schema";
import { NextResponse } from "next/server";
import { Resource } from "sst";
import { ZodAny, z } from "zod";
import { fromError } from "zod-validation-error";

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(["ADMIN", "MEMBER"]),
  projectId: z.string(),
  projectSlug: z.string(),
});

export const POST = withAuth(async ({ req, user }) => {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const client = new CognitoIdentityProviderClient({});

    const cmd = new AdminCreateUserCommand({
      Username: data.email,
      UserPoolId: Resource.BuildZeroAuth.id,
      UserAttributes: [
        {
          Name: "email",
          Value: data.email,
        },
        {
          Name: "name",
          Value: `${data.firstName} ${data.lastName}`,
        },
        {
          Name: "custom:default_project",
          Value: data.projectSlug,
        },
      ],
      DesiredDeliveryMediums: ["EMAIL"],
      ClientMetadata: {
        invitedByName: user.name,
        invitedByEmail: user.email,
      },
    });

    const { User } = await client.send(cmd);
    if (!User) {
      return throwError("Failed to create user", 500);
    }

    const [dbUser] = await db
      .insert(users)
      .values({
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        sub: User.Username!,
        isMachine: false,
      })
      .returning();

    await db.insert(projectUsers).values({
      projectId: data.projectId,
      userId: dbUser.id,
      role: data.role,
      status: "PENDING",
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      const validationError = fromError(e);
      return new Response(
        JSON.stringify({ message: validationError.toString() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return NextResponse.json(
      { message: (e as z.infer<ZodAny>).message || "Errror" },
      { status: 400 }
    );
  }
});
