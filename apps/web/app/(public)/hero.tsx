import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Header } from "./header";
import { SquaresPattern } from "./pattern";

import hero from "@/assets/hero.png";

export function Hero() {
  return (
    <main className="relative">
      <Header />
      <SquaresPattern />

      <section className="mx-auto max-w-[85rem] py-12 lg:pt-40 grid gap-10">
        <h2 className="text-7xl max-w-[60rem] text-center mx-auto font-cal">
          Open source pdf generation for focused teams
        </h2>
        <p className="text-2xl text-muted-foreground text-center max-w-2xl mx-auto">
          <span>BuildZero</span> is a modern, open-source, and easy-to-use PDF
          generation service for developers and teams.
        </p>
        <div className="flex w-full items-center max-w-md space-x-4 mx-auto">
          <Input
            className="h-12 max-w-sm w-full rounded-lg text-base"
            type="email"
            placeholder="Enter your email address"
          />
          <Button className="h-12 rounded-lg" type="submit">
            Join Waitlist
          </Button>
        </div>
      </section>

      <section className="max-w-[85rem] mx-auto p-4">
        <div className="h-full p-5 mt-20 bg-gray-900/5 ring-1 ring-inset ring-gray-900/10 rounded-2xl w-full">
          <div className="relative h-[800px]">
            <Image
              fill
              src={hero}
              className="w-full shadow border rounded-xl object-cover"
              alt="BuildZero"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
