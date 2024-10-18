import { FadeIn } from "@/components/fade-in";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import React from "react";
import logo from "@/assets/logo.png";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/authenticator";
import OnboardingForm from "./form";

export default function Onboarding() {
  return (
    <main className="bg-muted w-full h-full min-h-screen flex items-center justify-center">
      <section className="max-w-4xl mx-auto p-4">
        <FadeIn>
          <Card className="mx-auto w-[480px] rounded-xl max-w-md">
            <CardHeader className="flex flex-col items-center justify-center gap-4 border-b">
              <Image src={logo} alt="BuildZero" width={36} height={36} />

              <CardTitle className="text-2xl">Welcome to BuildZero</CardTitle>
              <CardDescription className="text-center">
                Get started by creating your first project. A project is a
                container for all the work you will do in BuildZero.
              </CardDescription>
            </CardHeader>

            <OnboardingForm />
          </Card>
        </FadeIn>
      </section>
    </main>
  );
}
