/** Server-only configuration; never selected by request input. */
export function modelProvider(env: Record<string, string | undefined> = process.env) {
 if (env.OPENAI_API_KEY) return { key: env.OPENAI_API_KEY, endpoint: 'https://api.openai.com/v1/responses' };
 if (!env.AI_INTEGRATIONS_OPENAI_API_KEY || !env.AI_INTEGRATIONS_OPENAI_BASE_URL) return null;
 try {
  const url = new URL(env.AI_INTEGRATIONS_OPENAI_BASE_URL);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) return null;
  return { key: env.AI_INTEGRATIONS_OPENAI_API_KEY, endpoint: url.href.replace(/\/$/, '') + '/responses' };
 } catch { return null; }
}
