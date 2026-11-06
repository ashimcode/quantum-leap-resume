import assert from 'node:assert/strict';
import { trackEvent } from '../src/lib/analytics';

async function main() {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const mock: { umami?: Window['umami'] } = {};
  try {
    Reflect.deleteProperty(globalThis, 'window');
    assert.doesNotThrow(() => trackEvent('resume_download_click', 'top'));
    Object.defineProperty(globalThis, 'window', { configurable: true, value: mock });
    assert.doesNotThrow(() => trackEvent('ambassador_conversation_cleared'));

    const events: unknown[] = [];
    mock.umami = { track: (name, data) => { events.push({ name, data }); } };
    trackEvent('resume_download_click', 'header');
    trackEvent('profile_link_click', 'github');
    trackEvent('ambassador_question_submitted', 'typed');
    trackEvent('ambassador_response_outcome', 'rate_limited');
    trackEvent('ambassador_conversation_cleared');
    trackEvent('fx_changed', 'reduced');
    const unsafe = trackEvent as (name: string, value?: unknown) => void;
    unsafe('profile_link_click', 'https://example.com/private');
    unsafe('ambassador_question_submitted', { source: 'typed', question: 'private text' });
    unsafe('ambassador_response_outcome', 'private answer');
    unsafe('ambassador_conversation_cleared', 'private text');
    unsafe('unrecognized', 'private text');
    assert.deepEqual(events, [
      { name: 'resume_download_click', data: { location: 'header' } },
      { name: 'profile_link_click', data: { platform: 'github' } },
      { name: 'ambassador_question_submitted', data: { source: 'typed' } },
      { name: 'ambassador_response_outcome', data: { outcome: 'rate_limited' } },
      { name: 'ambassador_conversation_cleared', data: undefined },
      { name: 'fx_changed', data: { mode: 'reduced' } },
    ]);

    mock.umami = { track: () => { throw new Error('Tracker unavailable'); } };
    assert.doesNotThrow(() => trackEvent('fx_changed', 'off'));
    mock.umami = { track: () => Promise.reject(new Error('Tracker unavailable')) };
    assert.doesNotThrow(() => trackEvent('fx_changed', 'full'));
    await new Promise(resolve => setTimeout(resolve, 0));
    console.log('PASS analytics: all six exact event payloads, invalid values rejected, and missing, blocked or failing tracker tolerated.');
  } finally {
    if (original) Object.defineProperty(globalThis, 'window', original);
    else Reflect.deleteProperty(globalThis, 'window');
  }
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
