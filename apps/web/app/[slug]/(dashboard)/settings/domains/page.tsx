import { DomainsPageClient } from "./page-client";

export default async function Page({
  params: { slug },
}: {
  params: { slug: string };
}) {
  return (
    <>
      <DomainsPageClient />
    </>
  );
}
