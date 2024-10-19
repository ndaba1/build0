import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { eq } from "@repo/database";
import { db } from "@repo/database/client";
import { documentTypes, projects } from "@repo/database/schema";
import { format } from "date-fns/format";
import { FileTextIcon } from "lucide-react";
import { DocumentTypeDialog } from "./dialog";

export default async function DocumentTypes({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const data = await db
    .select({
      id: documentTypes.id,
      name: documentTypes.name,
      description: documentTypes.description,
      s3PathPrefix: documentTypes.s3PathPrefix,
      createdAt: documentTypes.createdAt,
    })
    .from(documentTypes)
    .innerJoin(projects, eq(projects.id, documentTypes.projectId))
    .where(eq(projects.slug, slug));

  return (
    <Card className="rounded-xl">
      <CardHeader className="border-b flex flex-row items-center justify-between">
        <div className="grid gap-2">
          <CardTitle>Document Types</CardTitle>
          <CardDescription className="max-w-lg text-sm">
            You can configure different S3 prefixes for each document type.
          </CardDescription>
        </div>

        <div className="flex items-center gap-4">
          <DocumentTypeDialog />
        </div>
      </CardHeader>

      <CardContent className="p-0 min-h-80">
        {!data?.length ? (
          <div className="flex flex-col py-20 items-center justify-center">
            <FileTextIcon className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground max-w-md text-center mt-4">
              Create a new document type to categorize your documents
            </p>
          </div>
        ) : null}

        {data?.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] px-6">Created</TableHead>
                <TableHead className="px-6">Name</TableHead>
                <TableHead className="w-[200px] px-6">Description</TableHead>
                <TableHead className="px-6">S3 Prefix</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {data.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="p-6">
                    {format(new Date(type.createdAt), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell className="p-6">{type.name}</TableCell>
                  <TableCell className="p-6">{type.description}</TableCell>
                  <TableCell className="p-6">{type.s3PathPrefix}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
    </Card>
  );
}
