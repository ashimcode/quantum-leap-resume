'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

const sections = ['top', 'role-match', 'projects', 'experience', 'ambassador', 'contact', 'sources'] as const;

/** Observe native anchor activations without changing navigation or downloads. */
export default function PortfolioAnalytics() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== (event.type === 'auxclick' ? 1 : 0)) return;
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      let url: URL;
      try { url = new URL(anchor.href); } catch { return; }
      if (url.origin === window.location.origin && url.pathname === '/resume-public.pdf') {
        const id = anchor.closest('section')?.id || (anchor.closest('.hero') ? 'top' : '');
        const location = sections.find(section => section === id)
          ?? (anchor.closest('.blueprint-hud, .hud-header') ? 'header' : anchor.closest('footer') ? 'footer' : 'other');
        trackEvent('resume_download_click', location);
      } else if (url.protocol === 'https:') {
        if (url.hostname === 'linkedin.com' || url.hostname.endsWith('.linkedin.com')) trackEvent('profile_link_click', 'linkedin');
        if (url.hostname === 'github.com') trackEvent('profile_link_click', 'github');
      }
    }
    document.addEventListener('click', onClick);
    document.addEventListener('auxclick', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('auxclick', onClick);
    };
  }, []);
  return null;
}
