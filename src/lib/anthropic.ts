import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-sonnet-4-20250514";

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

// Legacy export — lazy so it doesn't throw at build time
export const anthropic = new Proxy({} as Anthropic, {
  get(_target, prop) {
    return getAnthropicClient()[prop as keyof Anthropic];
  },
});
