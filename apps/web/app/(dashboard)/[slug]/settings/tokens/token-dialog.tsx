"use client";

import logo from "@/assets/logo.png";
import { useAuth } from "@/components/authenticator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useProject } from "@/hooks/use-project";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import { createTokenSchema } from "@repo/database/schema";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { handle } from "typed-handlers";
import { z } from "zod";

const schema = z.object({
  name: z.string(),
});

export function TokenFormDialog() {
  const router = useRouter();
  const { idToken } = useAuth();
  const { isAdmin, id: projectId } = useProject();
  const [showForm, setShowForm] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof schema>) => {
      const cfg = handle("/api/auth/tokens", {
        bodySchema: createTokenSchema,
      });

      const { data } = await axios.post(
        cfg.url,
        cfg.body({
          name: values.name,
          projectId: projectId!,
        }),
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (data.token) {
        setShowForm(false);
        form.reset();

        setToken(data.token);
        setShowToken(true);
      }
    },
    onError(error) {
      toast({
        variant: "destructive",
        title: "Failed to invite member",
        description: error.message,
      });
    },
  });

  if (token) {
    return (
      <TokenDisplayDialog
        token={token}
        isOpen={showToken}
        setIsOpen={(v) => {
          setShowToken(v);

          if (!v) {
            setToken(null);
            router.refresh();
          }
        }}
      />
    );
  }

  return (
    <Dialog open={showForm} onOpenChange={setShowForm}>
      <DialogTrigger asChild>
        <Button disabled={!isAdmin}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="border-b flex gap-4 items-center justify-center p-0 px-6 py-4">
          <Image src={logo} alt="BuildZero" width={36} height={36} />
          <DialogTitle>Create Access Token</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            The newly created token will be associated with your user account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutate(v))}>
            <div className="grid gap-6 p-0 pb-8 px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="What's the token for"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for the token
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="p-0 px-6 py-4 border-t">
              <Button loading={isPending} type="submit">
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function TokenDisplayDialog({
  token,
  isOpen,
  setIsOpen,
}: {
  token: string;

  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="border-b flex gap-4 items-center justify-center p-0 px-6 py-4">
          <Image src={logo} alt="BuildZero" width={36} height={36} />
          <DialogTitle>API Key Created</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            For security reasons, this is the only time you can view the full
            key. Please store it in a safe place.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-8 p-0 pt-6 pb-8 px-6">
          <Input className="h-12" type="text" value={token} readOnly disabled />
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
