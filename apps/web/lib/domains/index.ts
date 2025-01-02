import { Redis } from "@upstash/redis";

const BASE_URL = "https://api.vercel.com";
const BASE_DOMAIN = "buildzero.fyi";
const PROJECT_SLUG = "projects/build0/domains";

const headers = {
  Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
};

const redis = Redis.fromEnv();

export async function domainExists(name: string) {
  const res = await fetch(`${BASE_URL}/v9/${PROJECT_SLUG}/${name}`, {
    headers,
  });

  const data = await res.json();

  if (data.name === name) {
    return true;
  }

  return false;
}

export async function addProjectSubdomain(name: string) {
  const res = await fetch(`${BASE_URL}/v10/${PROJECT_SLUG}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: `${name}.${BASE_DOMAIN}` }),
  });

  return res.json();
}

export async function addCustomDomain(
  domain: string,
  { redirect }: { redirect: string }
) {
  const res = await fetch(`${BASE_URL}/v10/${PROJECT_SLUG}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: domain,
    }),
  });

  await redis.set(`domain:${domain}`, redirect);

  return res.json();
}

export async function removeCustomDomain(domain: string) {
  const res = await fetch(`${BASE_URL}/v9/${PROJECT_SLUG}/${domain}`, {
    method: "DELETE",
    headers,
  });

  await redis.del(`domain:${domain}`);

  return res.json();
}

export async function getRedirectTarget(domain: string) {
  const data = await redis.get(`domain:${domain}`);

  if (data) {
    return data as string;
  }

  return null;
}

export async function getDomainConfig(domain: string) {
  const res = await fetch(
    `https://api.vercel.com/v6/domains/${domain}/config`,
    {
      headers,
    }
  );

  return res.json();
}
