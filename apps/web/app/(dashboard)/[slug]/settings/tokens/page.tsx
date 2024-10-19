import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import { projects, tokens, users } from "@repo/database/schema";
import { TokenFormDialog } from "./token-dialog";
import { ProjectToken, TokenProps } from "./token-entry";

export default async function TokensPage({
  params,
}: {
  params: { slug: string };
}) {
  const apiKeys = await db
    .select({
      id: tokens.id,
      name: tokens.name,
      partialKey: tokens.partialKey,
      createdAt: tokens.createdAt,
      lastUsedAt: tokens.lastUsedAt,
      user: { id: users.id, name: users.name },
    })
    .from(tokens)
    .innerJoin(users, eq(users.id, tokens.userId))
    .innerJoin(projects, eq(projects.id, tokens.projectId))
    .where(eq(projects.slug, params.slug));

  return (
    <Card className="rounded-xl">
      <CardHeader className="border-b flex flex-row items-center justify-between">
        <div className="grid gap-2">
          <CardTitle>Access Tokens</CardTitle>
          <CardDescription className="max-w-md">
            Tokens are used to authenticate with the API
          </CardDescription>
        </div>

        <div className="flex items-center gap-4">
          <TokenFormDialog />
        </div>
      </CardHeader>

      <CardContent className="p-0 min-h-80">
        {apiKeys.map((token, idx) => {
          return (
            <ProjectToken
              key={idx}
              token={token as unknown as TokenProps}
              idx={idx}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
