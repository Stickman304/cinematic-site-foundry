const NETLIFY_API = "https://api.netlify.com/api/v1";

function headers() {
  const token = process.env.NETLIFY_AUTH_TOKEN;
  if (!token || token.startsWith("PLACEHOLDER")) {
    throw new Error("NETLIFY_AUTH_TOKEN not configured — add it to .env and Vercel");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export interface NetlifySite {
  id: string;
  name: string;
  url: string;
  deploy_url: string;
}

export async function createSite(clientSlug: string): Promise<NetlifySite> {
  const teamId = process.env.NETLIFY_TEAM_ID ?? "";
  const body: Record<string, string> = { name: `smca-${clientSlug}` };
  if (teamId && !teamId.startsWith("PLACEHOLDER")) body.account_slug = teamId;

  const res = await fetch(`${NETLIFY_API}/sites`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Netlify createSite failed: ${res.statusText}`);
  const data = await res.json();
  return { id: data.id, name: data.name, url: data.url, deploy_url: data.deploy_url };
}

export async function deploySite(
  siteId: string,
  files: Record<string, string>
): Promise<string> {
  const digest: Record<string, string[]> = {};
  for (const [path, sha] of Object.entries(files)) {
    digest[sha] = digest[sha] ?? [];
    digest[sha].push(path);
  }

  const res = await fetch(`${NETLIFY_API}/sites/${siteId}/deploys`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ files: Object.fromEntries(Object.entries(files).map(([p]) => [p, files[p]])) }),
  });
  if (!res.ok) throw new Error(`Netlify deploy failed: ${res.statusText}`);
  const data = await res.json();
  return data.deploy_ssl_url ?? data.deploy_url ?? data.url;
}
