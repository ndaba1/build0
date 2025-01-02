import { domainExists } from "@/lib/domains";
import { DomainsPageClient } from "./page-client";

export default async function Page({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const hasSubdomain = await domainExists(`${slug}.buildzero.fyi`);
  return (
    <>
      <DomainsPageClient hasSubdomain={hasSubdomain} />
    </>
  );
}
