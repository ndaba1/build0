import { getBlogEntries, getEntryBySlug } from "@/lib/cms";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { format } from "date-fns";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { Header } from "../../header";

export const revalidate = 30;

export async function generateStaticParams() {
  const entries = await getBlogEntries();

  return entries.map((entry) => ({
    slug: entry.slug,
  }));
}

export default async function BlogEntry({
  params,
}: {
  params: { slug: string };
}) {
  const entry = await getEntryBySlug(params.slug);

  return (
    <main className="w-full max-w-3xl mx-auto pb-20">
      <Header showNav={false} />

      <section className="p-8 space-y-6">
        <div className="inline-flex gap-2">
          <ChevronLeftIcon className="w-6 h-6" />
          <Link href="/blog" className="text-blue-500">
            Back to blog
          </Link>
        </div>

        <h1 className="text-4xl font-cal">{entry.title}</h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          {format(new Date(entry.date as string), "MMMM dd, yyyy")}
        </p>
        <p className="text-lg">
          {documentToReactComponents(entry.body, {
            renderNode: {
              [BLOCKS.HEADING_2]: (node, children) => {
                return <h1 className="text-2xl mb-4 font-cal">{children}</h1>;
              },
              [BLOCKS.HEADING_3]: (node, children) => {
                return <h1 className="text-xl mb-4 font-medium">{children}</h1>;
              },
              [BLOCKS.PARAGRAPH]: (node, children) => {
                return (
                  <p className="text-lg mb-4 text-muted-foreground">
                    {children}
                  </p>
                );
              },
              [INLINES.HYPERLINK]: (node, children) => {
                return (
                  <a
                    target="_blank"
                    className="text-blue-500 underline"
                    href={node.data.uri}
                  >
                    {children}
                  </a>
                );
              },
            },
          })}
        </p>
      </section>
    </main>
  );
}
