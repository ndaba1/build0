import { createClient } from "contentful";
import { Document } from "@contentful/rich-text-types";
import { env } from "@/env";

export const client = createClient({
  space: env.CONTENTFUL_SPACE_ID,
  accessToken: env.CONTENTFUL_ACCESS_TOKEN,
});

export async function getBlogEntries() {
  const entries = await client.getEntries({
    content_type: "blog-post",
    select: [
      "fields.title",
      "fields.slug",
      "fields.summary",
      "fields.date",
      "sys.id",
    ],
    order: ["-fields.date"],
  });

  return entries.items.map((entry) => ({
    id: entry.sys.id,
    title: entry.fields.title,
    slug: entry.fields.slug,
    summary: entry.fields.summary,
    date: entry.fields.date,
  }));
}

export async function getEntryBySlug(slug: string) {
  const res = await client.getEntries({
    content_type: "blog-post",
    "fields.slug": slug,
  });

  const entry = res.items[0];

  return {
    title: entry.fields.title as string,
    slug: entry.fields.slug as string,
    summary: entry.fields.summary as string,
    date: entry.fields.date as string,
    body: entry.fields.body as Document,
  };
}
