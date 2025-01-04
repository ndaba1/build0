import { DashboardPage } from "@/components/layout";
import { DatePicker } from "@/components/ui/date-picker";
import { and, count, eq } from "@repo/database";
import { db } from "@repo/database/client";
import { documents, jobs, projects, templates } from "@repo/database/schema";
import {
  CheckCircle2Icon,
  FileTextIcon,
  PackageIcon,
  XCircleIcon,
} from "lucide-react";
import { Metadata } from "next";
import { DocumentTypeAnalysis } from "./bar-chart";
import { DocumentsAnalysis } from "./line-chart";
import { TemplateAnalysis } from "./pie-chart";
import StatCard from "./stat-card";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function Home({ params }: { params: { slug: string } }) {
  const res = await Promise.all([
    db
      .select({ count: count() })
      .from(documents)
      .leftJoin(projects, eq(documents.projectId, projects.id))
      .where(eq(projects.slug, params.slug)),
    db
      .select({ count: count() })
      .from(jobs)
      .leftJoin(projects, eq(jobs.projectId, projects.id))
      .where(and(eq(projects.slug, params.slug), eq(jobs.status, "COMPLETED"))),
    db
      .select({ count: count() })
      .from(jobs)
      .leftJoin(projects, eq(jobs.projectId, projects.id))
      .where(and(eq(projects.slug, params.slug), eq(jobs.status, "FAILED"))),
    db
      .select({ count: count() })
      .from(templates)
      .leftJoin(projects, eq(templates.projectId, projects.id))
      .where(eq(projects.slug, params.slug)),
  ]);

  const [totalDocuments, completedJobs, failedJobs, totalTemplates] = res.map(
    (r) => r[0].count
  );

  return (
    <DashboardPage
      title="Analytics"
      description="Keep track of your jobs, documents, and templates."
      header={<DatePicker />}
    >
      <div className="space-y-8 my-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <StatCard
            title={totalDocuments.toString()}
            description="Total Documents"
            Icon={FileTextIcon}
          />
          <StatCard
            title={completedJobs.toString()}
            description="Successful Jobs"
            Icon={CheckCircle2Icon}
            iconClassName="text-green-500"
          />
          <StatCard
            title={failedJobs.toString()}
            description="Failed Jobs"
            Icon={XCircleIcon}
            iconClassName="text-red-500"
          />
          <StatCard
            title={totalTemplates.toString()}
            description="No. of Templates"
            Icon={PackageIcon}
            iconClassName="text-cyan-500"
          />
        </div>

        <DocumentsAnalysis />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <DocumentTypeAnalysis />
          <TemplateAnalysis />
        </div>
      </div>
    </DashboardPage>
  );
}
