"use client";

import { useAuth } from "@/components/authenticator";
import { cn, getInitials } from "@/lib/utils";
import {
  BookOpenTextIcon,
  LogOutIcon,
  User2Icon
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function UserButton({className}: {className?: string}) {
  const { signOut, userAttributes } = useAuth();
  const [open, setOpen] = useState(false);

  const menuItems = [
    {
      label: "My Account",
      href: "/settings/account",
      icon: User2Icon,
    },
    {
      label: "Changelog",
      href: "/changelog",
      icon: BookOpenTextIcon,
    },
    {
      label: "Sign Out",
      action: () => void signOut(),
      icon: LogOutIcon,
    },
  ];

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <Avatar
          className={cn("h-9 w-9 cursor-pointer", className)}
          onClick={() => setOpen((o) => !o)}
        >
          <AvatarImage alt="avatar" src={""} />
          <AvatarFallback>
            {getInitials(userAttributes?.name ?? "")}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-xl py-3">
        <DropdownMenuLabel className="grid px-5 text-base font-normal">
          <p>{userAttributes?.name}</p>
          <p className="text-muted-foreground">{userAttributes?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid gap-1.5 p-2">
          {menuItems.map((item) =>
            item.href ? (
              <Link href={item.href} key={item.href}>
                <DropdownMenuItem className="text-muted-foreground hover:text-foreground group cursor-pointer justify-between rounded-md text-base">
                  <span>{item.label}</span>
                  <item.icon className="stroke-muted-foreground group-hover:stroke-foreground mr-5 h-5 w-5" />
                </DropdownMenuItem>
              </Link>
            ) : (
              <DropdownMenuItem
                className="text-muted-foreground hover:text-foreground group cursor-pointer justify-between rounded-md text-base"
                key={item.label}
                onClick={item.action}
              >
                <span>{item.label}</span>
                <item.icon className="stroke-muted-foreground group-hover:stroke-foreground mr-5 h-5 w-5" />
              </DropdownMenuItem>
            )
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
