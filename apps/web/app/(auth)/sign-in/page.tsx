"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { signIn, signUp } from "aws-amplify/auth";
import { useState } from "react";
import { NewPasswordRequired } from "./new-password";
import { redirect, useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email(),
  password: z
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
    ),
});

export default function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"login" | "new-password">("login");
  const [missingAttributes, setMissingAttributes] = useState<string[]>([]);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof schema>) => {
      const { isSignedIn, nextStep } = await signIn({
        username: values.email,
        password: values.password,
      });

      console.log({ isSignedIn, nextStep });

      const requiresNewPwd =
        nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED";

      if (requiresNewPwd) {
        setStep("new-password");
        setMissingAttributes(nextStep.missingAttributes || []);
      } else if (isSignedIn) {
        router.replace("/home");
      }
    },
  });

  if (step === "new-password") {
    return <NewPasswordRequired missingAttributes={missingAttributes} />;
  }

  return (
    <main className="w-full min-h-screen flex flex-col gap-8 items-center justify-center">
      <Image src={logo} alt="Logo" width={64} height={64} />

      <Card className="mx-auto w-[400px] rounded-xl max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit((v) => mutate(v))}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="atreides@arrakis.spice"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="#"
                        className="ml-auto inline-block text-sm underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>

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

              <Button loading={isPending} type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="#" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
