import { Input } from "@/components/ui/input";
import { getBlogEntries } from "@/lib/cms";
import { format } from "date-fns";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { Header } from "../header";

export const revalidate = 30;

export default async function BlogListing() {
  const entries = await getBlogEntries();

  return (
    <main className="w-full max-w-4xl mx-auto pb-20">
      <Header showNav={false} />

      <section className="py-16 px-8 space-y-6">
        <h1 className="text-4xl font-cal">
          A few articles we think you might like (time-based ISR)
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Just a small team, trying to make the world a better place. One
          article at a time. We write about basically anything that interests
          us. We hope you find something you like...
        </p>

        <div className="relative">
          <SearchIcon className="absolute top-3.5 left-3.5 w-5 h-5 text-muted-foreground" />

          <Input
            placeholder="Search articles..."
            className="max-w-sm h-12 rounded-lg pl-12 text-base"
          />
        </div>
      </section>

      <section className="grid grid-cols-1">
        {entries.map((entry, idx) => (
          <Link
            href={`/blog/${entry.slug}`}
            key={idx}
            className="p-6 sm:px-4 border-t space-y-4 cursor-pointer hover:bg-gray-50"
          >
            <h2 className="text-2xl font-cal">{entry.title as string}</h2>
            <p className="text-lg text-muted-foreground">
              {entry.summary as string}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(entry.date as string), "MMMM dd, yyyy")}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
