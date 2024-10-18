"use client";

import Link from "next/link";

import logo from "@/assets/logo.png";
import { Loader } from "@/components/loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { signUp } from "aws-amplify/auth";
import axios from "axios";
import { InfoIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { handle } from "typed-handlers";
import { z } from "zod";
import { VerifyEmailForm } from "./verify-email";

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).*$/,
      "Password must contain at least one capital letter, one number, and one symbol"
    ),
});

export function SignUpForm() {
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const { data: allowSignup, isLoading } = useQuery({
    queryKey: ["auth", "allow-signup"],
    queryFn: async () => {
      const cfg = handle("/api/auth/allow-signup");
      const { data } = await axios.get<{ allowSignup: boolean }>(cfg.url);

      return data.allowSignup;
    },
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const { isPending, mutate } = useMutation({
    mutationFn: async (values: z.infer<typeof schema>) => {
      const { userId, nextStep } = await signUp({
        username: values.email,
        password: values.password,
        options: {
          userAttributes: {
            email: values.email,
            name: `${values.firstName} ${values.lastName}`,
          },
          autoSignIn: true,
        },
      });

    //   if (userId) {
    //     const cfg = handle("/api/auth/create");
    //     await axios.post(cfg.url, {
    //       ...values,
    //       userId,
    //     });
    //   }

      if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        setStep("verify");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  if (step === "verify") {
    return <VerifyEmailForm username={form.watch("email")} />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutate(data))}
        className="w-full min-h-screen bg-muted/30 flex flex-col gap-6 items-center justify-center"
      >
        <Image src={logo} alt="Logo" width={64} height={64} />
        {!allowSignup ? (
          <Alert
            variant="destructive"
            className="mx-auto w-[400px] max-w-md bg-background rounded-xl"
          >
            <InfoIcon className="h-4 w-4" />
            <AlertTitle className="font-medium">Invite-Only Access</AlertTitle>
            <AlertDescription>
              Direct sign-up is not enabled. Access to the dashboard is by
              invitation only.
            </AlertDescription>
          </Alert>
        ) : null}
        <Card className="mx-auto w-[400px] rounded-xl max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="Paul" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Atreides" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
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

              <Button
                type="submit"
                className="w-full"
                disabled={!allowSignup}
                loading={isPending}
              >
                Create an account
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/sign-in" className="underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
