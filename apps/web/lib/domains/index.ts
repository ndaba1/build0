const BASE_URL = "https://api.vercel.com";
const BASE_DOMAIN = "buildzero.fyi";
const PROJECT_SLUG = "projects/build0/domains";

const headers = {
  Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
};

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

export async function getRedirectTarget(domain: string) {
  const res = await fetch(`${BASE_URL}/v9/${PROJECT_SLUG}/${domain}`, {
    headers,
  });

  const data = await res.json();
  if (data.name === domain) {
    return data.redirect;
  }

  return null;
}
