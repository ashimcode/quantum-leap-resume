const fields = {
  resume_download_click: ['location', ['top', 'role-match', 'projects', 'experience', 'ambassador', 'contact', 'sources', 'header', 'footer', 'other']],
  profile_link_click: ['platform', ['linkedin', 'github']],
  ambassador_question_submitted: ['source', ['starter', 'typed']],
  ambassador_response_outcome: ['outcome', ['success', 'rate_limited', 'http_error', 'connection_error']],
  fx_changed: ['mode', ['full', 'reduced', 'off']],
} as const;

type FieldEvent = keyof typeof fields;
type Event = {
  [Name in FieldEvent]: [name: Name, label: (typeof fields)[Name][1][number]];
}[FieldEvent] | [name: 'ambassador_conversation_cleared'];

declare global {
  interface Window {
    umami?: { track(name: string, data?: Record<string, string>): void | Promise<unknown> };
  }
}

export function trackEvent(...[name, label]: Event): void {
  if (typeof window === 'undefined') return;
  try {
    if (name === 'ambassador_conversation_cleared') {
      if (label === undefined) void Promise.resolve(window.umami?.track(name)).catch(() => {});
      return;
    }
    if (!Object.hasOwn(fields, name)) return;
    const [field, allowed] = fields[name];
    // Construct the payload from the allowlist, including for untyped callers.
    const value = allowed.find(candidate => candidate === label);
    if (value !== undefined) void Promise.resolve(window.umami?.track(name, { [field]: value })).catch(() => {});
  } catch {
    // The host may disable, block, or replace its analytics tracker.
  }
}
