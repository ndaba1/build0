import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "./header";
import { SquaresPattern } from "./pattern";

export default function Home() {
  return (
    <main className="relative isolate">
      <Header />
      <section className="mx-auto max-w-7xl py-16 lg:py-40 grid gap-10">
        <SquaresPattern />

        <h2 className="text-7xl z-10 max-w-[60rem] text-center mx-auto font-cal">
          Open source pdf generation for focused teams
        </h2>
        <p className="text-2xl z-10 text-muted-foreground text-center max-w-2xl mx-auto">
          <span>BuildZero</span> is a modern, open-source, and easy-to-use PDF
          generation service for developers and teams.
        </p>
        <div className="flex z-10 w-full items-center max-w-md space-x-4 mx-auto">
          <Input
            className="h-12 max-w-sm w-full rounded-lg text-base"
            type="email"
            placeholder="Enter your email address"
          />
          <Button className="h-12 rounded-lg" type="submit">
            Join Waitlist
          </Button>
        </div>
        {/* <div className="h-[600px] mt-16 bg-muted rounded-xl w-full"></div> */}
      </section>
    </main>
  );
}
