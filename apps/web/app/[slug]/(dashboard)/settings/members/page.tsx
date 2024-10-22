import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import { projectUsers, projects, users } from "@repo/database/schema";
import { InviteDialog } from "./invite-dialog";
import { MemberProps, ProjectMember } from "./member-entry";
import { PendingInvites } from "./pending-invites";

export default async function MembersSettings({
  params,
}: {
  params: { slug: string };
}) {
  const members = await db
    .select({
      id: users.id,
      role: projectUsers.role,
      name: users.name,
      email: users.email,
      status: projectUsers.status,
      createdAt: projectUsers.createdAt,
    })
    .from(projectUsers)
    .innerJoin(projects, eq(projectUsers.projectId, projects.id))
    .innerJoin(users, eq(users.id, projectUsers.userId))
    .where(eq(projects.slug, params.slug));

  const activeMembers = members.filter((member) => member.status === "ACTIVE");
  const pendingMembers = members.filter(
    (member) => member.status === "PENDING"
  );

  return (
    <Card className="rounded-xl">
      <CardHeader className="border-b flex flex-row items-center justify-between">
        <div className="grid gap-2">
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Teammates with access to this project.
          </CardDescription>
        </div>

        <div className="flex items-center gap-4">
          <PendingInvites
            pendingMembers={pendingMembers as unknown as MemberProps[]}
          />
          <InviteDialog />
        </div>
      </CardHeader>

      <CardContent className="p-0 min-h-80">
        {activeMembers.map((member, idx) => {
          return (
            <ProjectMember
              key={idx}
              member={member as unknown as MemberProps}
              idx={idx}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
