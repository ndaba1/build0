import { withAuth } from "@/lib/auth/with-auth";
import {
  addCustomDomain,
  getDomainConfig,
  removeCustomDomain,
} from "@/lib/domains";
import { and, eq } from "@repo/database";
import { db } from "@repo/database/client";
import { projectDomains, projects, projectUsers } from "@repo/database/schema";
import { NextResponse } from "next/server";

export const GET = withAuth(async ({ req, user }) => {
  const domains = await db
    .select({
      id: projectDomains.id,
      domain: projectDomains.domain,
    })
    .from(projectDomains)
    .leftJoin(projects, eq(projects.id, projectDomains.projectId))
    .leftJoin(projectUsers, eq(projectUsers.projectId, projects.id))
    .where(eq(projectUsers.userId, user.id));

  const data = await Promise.all(
    domains.map(async (value) => {
      const config = await getDomainConfig(value.domain);
      return {
        ...value,
        config,
      };
    })
  );

  return NextResponse.json({
    domains: data,
  });
});

export const POST = withAuth(async ({ req, user }) => {
  const body = await req.json();
  const { domain } = body;

  const [project] = await db
    .select({
      id: projectUsers.projectId,
      slug: projects.slug,
    })
    .from(projectUsers)
    .innerJoin(projects, eq(projects.id, projectUsers.projectId))
    .where(eq(projectUsers.userId, user.id));

  await addCustomDomain(domain, {
    project: project.slug,
  });

  await db.insert(projectDomains).values({
    domain,
    projectId: project.id!,
  });

  return NextResponse.json({
    message: "Domain added successfully",
  });
});

export const DELETE = withAuth(async ({ req, user }) => {
  const body = await req.json();
  const { domain } = body;

  await removeCustomDomain(domain);

  const [projectDomain] = await db
    .select({
      id: projectDomains.id,
    })
    .from(projectDomains)
    .leftJoin(projects, eq(projects.id, projectDomains.projectId))
    .leftJoin(projectUsers, eq(projectUsers.projectId, projects.id))
    .where(
      and(eq(projectUsers.userId, user.id), eq(projectDomains.domain, domain))
    );

  if (projectDomain)
    await db
      .delete(projectDomains)
      .where(eq(projectDomains.id, projectDomain.id));

  return NextResponse.json({
    message: "Domain deleted successfully",
  });
});
