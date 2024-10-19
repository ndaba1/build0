import { throwError } from "@/lib/throw-error";
import { withAuth } from "@/lib/with-auth";
import {
    AdminCreateUserCommand,
    CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextResponse } from "next/server";
import { Resource } from "sst";
import { ZodAny, z } from "zod";
import { fromError } from "zod-validation-error";

const schema = z.object({
  email: z.string().email(),
});

export const POST = withAuth(async ({ req, user }) => {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const client = new CognitoIdentityProviderClient({});

    const cmd = new AdminCreateUserCommand({
      Username: data.email,
      UserPoolId: Resource.BuildZeroAuth.id,
      MessageAction: "RESEND",
      DesiredDeliveryMediums: ["EMAIL"],
      ClientMetadata: {
        invitedByName: user.name,
        invitedByEmail: user.email,
      },
    });

    const { User } = await client.send(cmd);
    if (!User) {
      return throwError("Failed to resend user invite", 500);
    }

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
