"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { useMutation } from "@tanstack/react-query";
import { autoSignIn, confirmSignUp } from "aws-amplify/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export function VerifyEmailForm({ username }: { username: string }) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (code: string) => {
      await confirmSignUp({
        username,
        confirmationCode: code,
      });

      const { isSignedIn } = await autoSignIn();

      if (isSignedIn) {
        setIsRedirecting(true);
        router.replace("/onboarding");
      }
    },
    onError: (error) => {
      form.setError("pin", {
        message: error.message,
      });
    },
  });

  const watch = form.watch();
  const mutateRef = useRef(mutate);

  useEffect(() => {
    if (watch.pin.length === 6) {
      mutateRef.current(watch.pin);
    }
  }, [watch.pin]);

  return (
    <main className="w-full min-h-screen bg-muted/30 flex flex-col gap-8 items-center justify-center">
      <Image src={logo} alt="Logo" width={64} height={64} />

      <Card className="mx-auto w-[400px] rounded-xl max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            Verify your email address to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => mutate(v.pin))}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem className="mx-auto">
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={0}
                            className="h-14 w-14 text-lg"
                          />
                          <InputOTPSlot
                            index={1}
                            className="h-14 w-14 text-lg"
                          />
                          <InputOTPSlot
                            index={2}
                            className="h-14 w-14 text-lg"
                          />
                          <InputOTPSlot
                            index={3}
                            className="h-14 w-14 text-lg"
                          />
                          <InputOTPSlot
                            index={4}
                            className="h-14 w-14 text-lg"
                          />
                          <InputOTPSlot
                            index={5}
                            className="h-14 w-14 text-lg"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription>
                      Please enter the code sent to your email.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className="w-full"
                type="submit"
                size="lg"
                loading={isPending || isRedirecting}
              >
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
