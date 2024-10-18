import logo from "@/assets/logo.png";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SquaresPattern } from "./pattern";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export default function Home() {
  const links = [
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "Pricing",
      href: "/pricing",
    },
    {
      label: "Docs",
      href: "/docs",
    },
    {
      label: "For Teams",
      href: "/teams",
    },
    {
      label: "Github",
      node: () => (
        <Link
          href="https://github.com/ndaba1/build0"
          className="flex items-center gap-2 group text-foreground/50 transition-all hover:text-foreground font-medium"
        >
          <GithubIcon className="w-5 h-5 fill-foreground/70 group-hover:fill-foreground" />
          <span>Github</span>
        </Link>
      ),
    },
  ];

  return (
    <div>
      <main className="relative isolate">
        <header className="w-full h-20 p-5 grid grid-cols-12 gap-2 lg:px-0 mx-auto max-w-7xl">
          <div className="inline-flex col-span-3 justify-start">
            <Image src={logo} alt="Logo" width={48} height={48} />
          </div>

          <div className="justify-center items-center col-span-6">
            <nav className="mx-auto p-2 shadow-sm px-6 border bg-background rounded-3xl w-fit h-fit">
              <ul className="flex gap-8 items-center">
                {links.map((link, idx) =>
                  link.node ? (
                    <link.node key={idx} />
                  ) : (
                    <Link
                      key={link.href}
                      className="text-foreground/50 transition-all hover:text-foreground font-medium"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </ul>
            </nav>
          </div>

          <section className="z-10 flex items-center gap-5 col-span-3 justify-end">
            <Link
              href="/sign-in"
              className={cn(buttonVariants({
                className: "rounded-3xl text-base",
                variant: "ghost",
              }))}
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className={cn(buttonVariants({
                variant: "default",
                className: "rounded-3xl",
              }))}
            >
              Get Started
            </Link>
          </section>
        </header>
        <section className="mx-auto max-w-7xl py-16 lg:py-40 grid gap-10">
          {/* <div className="absolute bottom-0 right-0 z-[1] h-72 w-full bg-gradient-to-t from-background to-transparent"></div> */}
          <SquaresPattern />
          {/* <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            ></div>
          </div> */}
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

      {/* <Text /> */}
    </div>
  );
}
