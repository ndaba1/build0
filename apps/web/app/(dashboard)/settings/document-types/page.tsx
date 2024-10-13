"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { listDocumentTypeSchema } from "@repo/database/schema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns/format";
import { FileTextIcon } from "lucide-react";
import { useState } from "react";
import { handle } from "typed-handlers";
import { z } from "zod";
import { DocumentTypeDialog } from "./dialog";

export default function DocumentTypes() {
  const [showDialog, setShowDialog] = useState(false);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["documentTypes"],
    queryFn: async () => {
      const cfg = handle("/api/v1/document-types");

      const { data } = await axios.get<z.infer<typeof listDocumentTypeSchema>>(
        cfg.url
      );

      return data;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="p-4 px-6 flex items-center justify-between border-b">
        <div>
          <h2 className="text-xl font-semibold mb-2">Document Types</h2>
          <p className="text-muted-foreground text-sm max-w-lg">
            Document types are used to categorize documents. You can configure
            different S3 prefixes for each document type.
          </p>
        </div>

        <DocumentTypeDialog
          onSuccess={refetch}
          showDialog={showDialog}
          setShowDialog={setShowDialog}
        />
      </div>

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
              <TableHead className="w-[200px]">Created</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-[200px]">Description</TableHead>
              <TableHead>S3 Prefix</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((type) => (
              <TableRow key={type.id}>
                <TableCell>
                  {format(new Date(type.createdAt), "yyyy-MM-dd")}
                </TableCell>
                <TableCell>{type.name}</TableCell>
                <TableCell>{type.description}</TableCell>
                <TableCell>{type.s3PathPrefix}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </>
  );
}
