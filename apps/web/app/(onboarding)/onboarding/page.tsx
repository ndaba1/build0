import logo from "@/assets/logo.png";
import { FadeIn } from "@/components/fade-in";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import OnboardingForm from "./form";

export const dynamic = "force-dynamic";

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
