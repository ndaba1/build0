import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { format, formatDistanceToNowStrict } from "date-fns";
import { MoreVerticalIcon } from "lucide-react";

export type TokenProps = {
  id: string;
  name: string;
  lastUsedAt: string;
  user: { id: string; name: string };
  createdAt: string;
  partialKey: string;
};

export function ProjectToken({
  idx,
  token,
}: {
  token: TokenProps;
  idx: number;
}) {
  const lastUsed = token.lastUsedAt
    ? formatDistanceToNowStrict(new Date(token.lastUsedAt), {
        addSuffix: true,
      })
    : "Never";

  return (
    <section
      className={cn(
        "grid grid-cols-12 items-center p-4 px-6",
        idx !== 0 && "border-t"
      )}
    >
      <div className="flex items-center gap-4 col-span-6">
        <Avatar className={cn("h-12 w-12 cursor-pointer")}>
          <AvatarImage alt="avatar" src={""} />
          <AvatarFallback>{getInitials(token.user.name)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold">{token.name}</div>
          <div className="text-sm text-muted-foreground">
            Created {format(new Date(token.createdAt), "MMM dd")}
          </div>
        </div>
      </div>

      <div className="col-span-2 text-muted-foreground font-mono">
        {token.partialKey}
      </div>

      <div className="inline-flex items-center justify-end gap-8 col-span-4">
        <p className="text-sm text-muted-foreground">
          {lastUsed === "Never" ? "Never used" : `Last used ${lastUsed}`}
        </p>

        <MoreVerticalIcon className="cursor-pointer w-6 h-6" />
      </div>
    </section>
  );
}
