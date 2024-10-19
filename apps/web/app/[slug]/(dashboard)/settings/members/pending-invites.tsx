"use client";

import logo from "@/assets/logo.png";
import { useAuth } from "@/components/authenticator";
import { Badge } from "@/components/tremor/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useProject } from "@/hooks/use-project";
import { toast } from "@/hooks/use-toast";
import { cn, getInitials } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { handle } from "typed-handlers";
import { MemberProps } from "./member-entry";

export function PendingInvites({
  pendingMembers,
}: {
  pendingMembers: MemberProps[];
}) {
  const router = useRouter();
  const { idToken } = useAuth();
  const { slug, isAdmin, id: projectId } = useProject();
  const [isOpen, setIsOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: { email: string }) => {
      const cfg = handle("/api/auth/invite/resend");

      const { data, status } = await axios.post(
        cfg.url,
        {
          ...values,
          projectId,
          projectSlug: slug,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      router.refresh();
      setIsOpen(false);
    },
    onError(error) {
      toast({
        variant: "destructive",
        title: "Failed to invite member",
        description: error.message,
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-muted-foreground underline">
          {pendingMembers.length} Pending
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="border-b flex gap-4 items-center justify-center p-0 px-6 py-4">
          <Image src={logo} alt="BuildZero" width={36} height={36} />
          <DialogTitle>Pending Members</DialogTitle>
          <DialogDescription className="text-center max-w-xs">
            Teammates who have been invited to join this project. You can resend
            their invites if needed.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-6">
          {pendingMembers.map((member, idx) => {
            return (
              <section
                key={member.id}
                className={cn(
                  "flex items-center justify-between",
                  idx !== 0 && "border-t"
                )}
              >
                <div className="flex items-center gap-4">
                  <Avatar className={cn("h-10 w-10 cursor-pointer")}>
                    <AvatarImage alt="avatar" src={""} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{member.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {member.email}
                    </div>
                  </div>
                </div>

                {member.role === "ADMIN" ? (
                  <Badge variant="default">Admin</Badge>
                ) : (
                  <Badge variant="neutral">Member</Badge>
                )}

                <Button
                  onClick={() => mutate({ email: member.email })}
                  variant="ghost"
                  size="sm"
                  loading={isPending}
                  className="text-muted-foreground"
                >
                  Resend
                </Button>
              </section>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
