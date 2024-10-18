import { throwError } from "@/lib/throw-error";
import { withAuth } from "@/lib/with-auth";
import { and, eq } from "@repo/database";
import { db } from "@repo/database/client";
import { projectUsers, projects } from "@repo/database/schema";
import { NextResponse } from "next/server";
import { Params } from "typed-handlers";

export const GET = withAuth<Params<"/api/v1/projects/[slug]">>(
  async ({ req, params, user }) => {
    const { slug } = params;

    const results = await db
      .select({
        id: projects.id,
        name: projects.name,
        slug: projects.slug,
        isMember: projectUsers.userId,
      })
      .from(projects)
      .leftJoin(projectUsers, eq(projectUsers.projectId, projects.id))
      .where(and(eq(projects.slug, slug), eq(projectUsers.userId, user.id)))
      .limit(1);

    const project = results[0];

    if (!project) {
      return throwError("Project not found", 404);
    }

    const isMember = project.isMember === user.id;

    if (!isMember) {
      return throwError("Project not found", 404);
    }

    return NextResponse.json({ project });
  }
);
