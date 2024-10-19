import { Badge } from "@/components/tremor/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { formatDistanceToNowStrict } from "date-fns";
import { MoreVerticalIcon } from "lucide-react";

export type MemberProps = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export function ProjectMember({
  idx,
  member,
  isInvite,
}: {
  member: MemberProps;
  idx: number;
  isInvite?: boolean;
}) {
  const added = formatDistanceToNowStrict(new Date(member.createdAt), {
    addSuffix: true,
  });

  return (
    <section
      className={cn("grid grid-cols-12 items-center p-4 px-6", idx !== 0 && "border-t")}
    >
      <div className="flex items-center gap-4 col-span-6">
        <Avatar className={cn("h-12 w-12 cursor-pointer")}>
          <AvatarImage alt="avatar" src={""} />
          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold">{member.name}</div>
          <div className="text-sm text-muted-foreground">{member.email}</div>
        </div>
      </div>

      <div className="col-span-2">
        {member.role === "ADMIN" ? (
          <Badge variant="default">Admin</Badge>
        ) : (
          <Badge variant="neutral">Member</Badge>
        )}
      </div>

      <div className="inline-flex items-center justify-end gap-4 col-span-4">
        <p className="text-sm text-muted-foreground">Added {added}</p>

        <MoreVerticalIcon className="cursor-pointer w-6 h-6" />
      </div>
    </section>
  );
}
