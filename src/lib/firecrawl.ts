export interface ScrapeResult {
  url: string;
  title: string;
  description: string;
  content: string;
  markdown: string;
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  if (!process.env.FIRECRAWL_API_KEY) {
    throw new Error("FIRECRAWL_API_KEY is not set");
  }
  // Use Firecrawl REST API directly to avoid type issues with the SDK
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, formats: ["markdown", "html"] }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firecrawl error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(`Firecrawl scrape failed for ${url}`);
  }

  return {
    url,
    title: data.data?.metadata?.title ?? "",
    description: data.data?.metadata?.description ?? "",
    content: data.data?.html ?? "",
    markdown: data.data?.markdown ?? "",
  };
}
