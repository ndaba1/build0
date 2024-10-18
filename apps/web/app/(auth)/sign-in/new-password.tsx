"use client";

import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { confirmSignIn } from "aws-amplify/auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const pwd = z
  .string()
  .min(8)
  .refine(
    (password) => {
      return (
        password.match(/[a-z]/) &&
        password.match(/[A-Z]/) &&
        password.match(/[0-9]/)
      );
    },
    {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }
  );

export function NewPasswordRequired({
  missingAttributes,
}: {
  missingAttributes: string[];
}) {
  const schema = z.object({
    name: z.string().optional(),
    password: pwd,
    confirmPassword: pwd,
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof schema>) => {
      const { isSignedIn, nextStep } = await confirmSignIn({
        challengeResponse: values.password,
        options: {
          ...(values.name
            ? {
                userAttributes: {
                  name: values.name,
                },
              }
            : {}),
        },
      });

      if (isSignedIn) {
        redirect("/home");
      }
    },
  });

  return (
    <main className="w-full min-h-screen flex flex-col gap-8 items-center justify-center">
      <Image src={logo} alt="Logo" width={64} height={64} />

      <Card className="mx-auto w-[400px] rounded-xl max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Change your password</CardTitle>
          <CardDescription>
            Your account requires a new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit((v) => mutate(v))}
            >
              {missingAttributes.includes("name") ? (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Muad'Dib" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>

                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>

                    <FormControl>
                      <Input
                        id="confirmPassword"
                        type="password"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button loading={isPending} type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
