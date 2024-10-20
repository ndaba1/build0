import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DownloadIcon, ExternalLinkIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export type DocumentProps = {
  id: string;
  name: string;
  jobId: string;
  templateId: string;
  templateName: string;
  externalId?: string | null;
  previewUrl?: string | null;
  downloadUrl: string;
  createdAt: Date;
};

export function DocumentCard({
  idx,
  document,
}: {
  document: DocumentProps;
  idx: number;
}) {
  return (
    <section
      key={document.id}
      className={cn(
        "p-4 px-6 grid grid-cols-12 gap-4 items-center justify-between",
        idx !== 0 && "border-t"
      )}
    >
      <div className="col-span-5 flex items-center">
        <Link href={document.previewUrl || "#"}>
          <Image
            src={
              document.previewUrl || "https://assets.build0.dev/fallback.png"
            }
            alt={document.name}
            width={800}
            height={1200}
            className="rounded-lg object-cover h-16 w-16 cursor-pointer"
          />
        </Link>

        <div className="ml-4">
          <p className="text-foreground font-medium mb-0.5">
            {document.templateName} / {document.name}
          </p>
          <p className="text-muted-foreground text-sm">
            {format(document.createdAt, "PPP")}
          </p>
        </div>
      </div>

      <div className="col-span-4">
        <div className="flex gap-2">
          <p className="text-muted-foreground">Job:</p>{" "}
          <div className="inline-flex items-center gap-2 underline text-blue-500 text-sm">
            <p className="overflow-hidden max-w-[80px] whitespace-nowrap text-ellipsis">
              {document.jobId}
            </p>

            <ExternalLinkIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex gap-2">
          <p className="text-muted-foreground">Template:</p>{" "}
          <div className="inline-flex items-center gap-2 underline text-blue-500 text-sm">
            <p className="overflow-hidden max-w-[80px] whitespace-nowrap text-ellipsis">
              {document.templateId}
            </p>

            <ExternalLinkIcon className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="col-span-3 justify-end inline-flex items-center gap-4">
        <Link
          href={document.downloadUrl}
          className={buttonVariants({
            size: "sm",
          })}
        >
          <DownloadIcon className="w-4 h-4 mr-2" />
          Download
        </Link>
        <Button size="sm" variant="outline">
          <UsersIcon className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </section>
  );
}
