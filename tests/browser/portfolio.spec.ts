import { expect, test, type Locator, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { BREACH_PALETTES } from '../../src/lib/ascii-breach';

const cameraStage = '.surveillance-stage';

async function ready(page: Page) {
  await expect(page.locator(cameraStage)).toHaveAttribute('data-feed', /^CAM_0[0-4]$/);
}

async function frameNear(stage: Locator, expected: number) {
  await expect.poll(async () => {
    const value = await stage.getAttribute('data-frame');
    return value ? Math.abs(Number(value) - expected) : Infinity;
  }).toBeLessThanOrEqual(3);
  await expect.poll(async () => stage.evaluate(element =>
    element.getAttribute('data-frame') === element.getAttribute('data-tracking-frame'))).toBe(true);
}

async function scrollToProgress(page: Page, progress: number) {
  await page.evaluate(ratio => window.scrollTo({
    top: Math.round((document.documentElement.scrollHeight - window.innerHeight) * ratio),
    behavior: 'instant',
  }), progress);
}

async function tabTo(page: Page, locator: Locator, key = 'Tab') {
  for (let attempt = 0; attempt < 110; attempt++) {
    if (await locator.evaluate(element => document.activeElement === element)) return;
    await page.keyboard.press(key);
  }
  await expect(locator).toBeFocused();
}

test('woven frames follow all four acts in both directions and preserve source color', async ({ page }, info) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', request => requests.push(request.url()));
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const stage = page.locator(cameraStage);
  const film = stage.locator('.surveillance-film');
  const cameraControl = page.getByRole('button', { name: /^Camera study controls/ });
  const cameraPanel = page.locator('#camera-study');
  await expect(cameraPanel).toBeHidden();
  await frameNear(stage, 0);
  await expect(stage).toHaveAttribute('data-sampling', 'desk-plate');
  await expect(stage).toHaveAttribute('data-resolution', '4k');

  await film.evaluate(element => { element.dataset.qaIdentity = 'same-film'; });
  await page.screenshot({ path: info.outputPath('woven-hero.png') });
  await cameraControl.click();
  await expect(page.getByText('VISUAL SIMULATION / WOVEN CAMERA STUDY')).toBeVisible();
  const panel = (await cameraPanel.boundingBox())!;
  await expect.poll(async () => (await page.locator('.scroll-telemetry').boundingBox())!.y).toBeGreaterThan(panel.y + panel.height);

  for (const progress of [.24, .44, .66, .88, .66, .44, .24]) {
    await scrollToProgress(page, progress);
    await expect(stage).toHaveAttribute('data-feed', `CAM_0${progress < .38 ? 1 : progress < .58 ? 2 : progress < .79 ? 3 : 4}`);
    await frameNear(stage, progress === .24 ? 14 : progress === .44 ? 62 : progress === .66 ? 114 : 165);
    await expect.poll(() => stage.evaluate(element => Number((element as HTMLElement).dataset.keypoints))).toBeGreaterThan(0);
    if (progress === .44) await expect(stage).toHaveAttribute('data-annotations', /Billboard_Display Pedestrian/);
    if (progress === .88) await expect(stage).toHaveAttribute('data-annotations', /Spherical_Vehicle/);
    if (progress < .5) {
      await expect.poll(() => film.evaluate((canvas: HTMLCanvasElement) => {
        const { data } = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
        let colored = 0;
        for (let i = 0; i < data.length; i += 68) {
          const spread = Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]);
          if (spread > 14 && data[i + 3] === 255) colored++;
        }
        return colored / (data.length / 68);
      })).toBeGreaterThan(.03);
    }
  }
  for (const [camera, progress] of [[2, 40], [3, 60], [4, 81], [1, 18]]) {
    await cameraPanel.getByRole('button', { name: new RegExp(`^CAM_0${camera} /`) }).click();
    await expect(stage).toHaveAttribute('data-progress', String(progress));
    await frameNear(stage, camera === 1 ? 0 : camera === 2 ? 53 : camera === 3 ? 101 : 149);
  }
  for (const mode of ['YOLO_BOXES', 'SLAM_KEYPOINTS', 'HYBRID_CV']) {
    const button = page.getByRole('button', { name: mode, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  }
  await page.keyboard.press('Escape');
  await expect(cameraPanel).toBeHidden();
  await expect(cameraControl).toBeFocused();
  await scrollToProgress(page, 1);
  await expect(stage).toHaveAttribute('data-section', 'FOOTER');
  await frameNear(stage, 191);
  await expect(film).toHaveAttribute('data-qa-identity', 'same-film');
  expect(await stage.evaluate(element => {
    const box = element.getBoundingClientRect();
    const root = document.documentElement;
    return box.x === 0 && box.y === 0 && box.width === root.clientWidth && root.scrollWidth === root.clientWidth;
  })).toBe(true);
  expect(requests.some(url => /\/surveillance\/.+\.mp4|\/underground-(?:frames|reel)|\/carmechanicos\//.test(url))).toBe(false);
  const revisionFor = (asset: RegExp) => {
    const matches = requests.filter(url => asset.test(new URL(url).pathname));
    expect(matches.length).toBeGreaterThan(0);
    return matches.map(url => new URL(url).searchParams.get('v'));
  };
  const revisions = [
    ...revisionFor(/\/desk-4k\.webp$/), ...revisionFor(/\/woven-frames\//), ...revisionFor(/\/woven-4k\//),
  ];
  expect(revisions[0]).toMatch(/^\d+\.\d+\.\d+/);
  expect(new Set(revisions).size).toBe(1);
  await cameraControl.click();
  await page.getByRole('button', { name: 'Pause surveillance effects' }).click();
  await expect(stage).toHaveAttribute('data-playback', 'off');
  await page.getByRole('button', { name: 'Resume surveillance effects' }).click();
  await expect(stage).toHaveAttribute('data-playback', 'active');
  expect(errors).toEqual([]);
});

test('SOC scroll stays close to the playhead on a cold connection', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium-desktop', 'Compare cold-cache cadence at a fixed desktop viewport');
  await page.route(/\/surveillance\/woven-frames\/\d+\.webp/, async route => {
    await new Promise(resolve => setTimeout(resolve, 200));
    await route.continue().catch(() => {}); // The renderer may cancel an obsolete download.
  });
  await page.goto('/');
  const stage = page.locator(cameraStage);
  await frameNear(stage, 0);

  const endOfScroll = await page.evaluate(async () => {
    const stage = document.querySelector<HTMLElement>('.surveillance-stage')!;
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    function scroll(from: number, to: number, duration: number) {
      return new Promise<void>(resolve => {
        let start: number | undefined;
        function step(now: number) {
          start ??= now;
          const amount = Math.min(1, (now - start) / duration);
          window.scrollTo({ top: Math.round(maxScroll * (from + (to - from) * amount)), behavior: 'instant' });
          if (amount < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      });
    }
    await scroll(0, .16, 1900);
    await scroll(.16, .30, 1400);
    return Number(stage.dataset.frame);
  });

  // The normal easing can lag by a few frames while the wheel is moving.
  // The old queue ended near frame 19 under the same delay.
  expect(endOfScroll).toBeGreaterThanOrEqual(24);
  await expect(stage).toHaveAttribute('data-frame', '29');
  await expect(stage).toHaveAttribute('data-tracking-frame', '29');
  await scrollToProgress(page, .21);
  await expect(stage).toHaveAttribute('data-frame', '7');
  await expect(stage).toHaveAttribute('data-playback', 'active');
});

test('woven film, CV overlays and HUD have zero drift during five seconds idle', async ({ page, isMobile }) => {
  await page.goto('/');
  const stage = page.locator(cameraStage);
  await page.getByRole('button', { name: /^Camera study controls/ }).click();
  await page.evaluate(async () => { await document.fonts.ready; });
  await expect.poll(() => page.evaluate(() => parseFloat(document.querySelector<HTMLElement>('.site')!.style.getPropertyValue('--hud-height')) === document.querySelector<HTMLElement>('.hud-header')!.offsetHeight)).toBe(true);
  if (!isMobile) await page.mouse.move(900, 350);

  for (const [progress, expectedFrame] of [[0, 0], [.55, 89]]) {
    await scrollToProgress(page, progress);
    await expect(stage).toHaveAttribute('data-frame', String(expectedFrame));
    await expect(stage).toHaveAttribute('data-settled', 'true');
    const result = await stage.evaluate(async element => {
      const stage = element as HTMLElement;
      const canvases = [...stage.querySelectorAll<HTMLCanvasElement>('canvas:not(.surveillance-breach)')];
      const sample = document.createElement('canvas');
      sample.width = 96;
      sample.height = 54;
      const ctx = sample.getContext('2d', { willReadFrequently: true })!;
      const measured = ['.hero', '.hero h1', '.hud-header', '.hud-top', '.hud-actions', '.scroll-telemetry',
        '.surveillance-controls', '.surveillance-section', '.surveillance-readout'].map(selector => document.querySelector(selector)!);
      const pixels = () => canvases.map(canvas => {
        ctx.clearRect(0, 0, sample.width, sample.height);
        ctx.drawImage(canvas, 0, 0, sample.width, sample.height);
        return ctx.getImageData(0, 0, sample.width, sample.height).data;
      });
      const geometry = () => JSON.stringify({
        scrollY, width: document.documentElement.clientWidth, height: document.documentElement.scrollHeight,
        rects: [...measured, ...canvases].map(node => node.getBoundingClientRect().toJSON()),
      });
      const frame = () => [stage.dataset.frame, stage.dataset.trackingFrame, stage.dataset.frames, stage.dataset.settled].join('/');
      const start = { pixels: pixels(), geometry: geometry(), frame: frame(), scrollY };
      const changed: string[] = [];
      for (let i = 1; i <= 20; i++) {
        await new Promise(resolve => setTimeout(resolve, 250));
        if (pixels().some((data, index) => data.some((byte, j) => byte !== start.pixels[index][j]))) changed.push(`canvas at sample ${i}`);
        if (geometry() !== start.geometry) changed.push(`geometry at sample ${i}`);
        if (frame() !== start.frame) changed.push(`frame or draw count at sample ${i}`);
      }
      return { scrollY: start.scrollY, changed };
    });
    if (progress === 0) expect(result.scrollY).toBe(0);
    else expect(result.scrollY).toBeGreaterThan(0);
    expect(result.changed, `idle at ${progress * 100}% scroll`).toEqual([]);
  }
});

test('reduced motion requests stills and takes precedence over the header cycle', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const frames: string[] = [];
  page.on('request', request => { if (/\/surveillance\/woven-frames\//.test(request.url())) frames.push(request.url()); });
  await page.goto('/');
  await ready(page);
  const stage = page.locator(cameraStage);
  await expect(stage).toHaveAttribute('data-motion', 'reduced');
  await expect(stage.locator('img')).toBeVisible();
  await expect.poll(() => stage.locator('img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await page.getByRole('button', { name: /^Camera study controls/ }).click();
  await page.getByRole('button', { name: /^CAM_01 / }).click();
  await expect.poll(() => stage.evaluate(element => Number((element as HTMLElement).dataset.keypoints))).toBeGreaterThan(0);
  const canvas = stage.locator('.surveillance-overlay');
  const hybrid = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  await page.getByRole('button', { name: 'SLAM_KEYPOINTS', exact: true }).click();
  await expect.poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL())).not.toBe(hybrid);
  await page.getByRole('button', { name: /^CAM_03 / }).click();
  await expect(stage.locator('img')).toHaveAttribute('src', /cam-03/);
  const fx = page.getByRole('button', { name: /^Effects / });
  await fx.click();
  await expect(stage).toHaveAttribute('data-motion', 'off');
  await fx.click();
  await expect(stage).toHaveAttribute('data-motion', 'reduced');
  expect(frames).toEqual([]);
});

test('missing frame assets fall back to the still and can be retried', async ({ page }) => {
  const pattern = '**/surveillance/woven-frames/**';
  let available = false;
  await page.route(pattern, route => available ? route.continue() : route.abort());
  await page.goto('/');
  const stage = page.locator(cameraStage);
  await page.getByRole('button', { name: /^Camera study controls/ }).click();
  const retry = page.getByRole('button', { name: /Retry footage/ });
  await expect(retry).toBeVisible();
  await expect(stage).toHaveAttribute('data-playback', 'fallback');
  await expect(stage.locator('img')).toBeVisible();
  available = true;
  await retry.click();
  await expect(stage).toHaveAttribute('data-playback', 'active');
  await expect(retry).toBeHidden();
});

test('keyboard skip link, chapter modal, focus wrap, Escape and destination focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await ready(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await expect(page).toHaveURL(/#main$/);

  await page.goto('/');
  await ready(page);
  const trigger = page.getByRole('button', { name: 'Open chapter index' });
  await tabTo(page, trigger);
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'CHAPTER INDEX' });
  const close = dialog.getByRole('button', { name: 'Close chapter index' });
  await expect(dialog).toBeVisible();
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('link', { name: 'Contact' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  await tabTo(page, dialog.getByRole('link', { name: 'Portfolio' }));
  await page.keyboard.press('Enter');
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator('#projects')).toBeFocused();
});

test('keyboard Ambassador submission, evidence link and clear keep focus usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await ready(page);
  const question = page.getByRole('textbox', { name: /Ask about Ashim/ });
  await tabTo(page, question);
  await page.keyboard.insertText('Tell me about Project Hedgehog');
  await page.keyboard.press('Enter');
  const conversation = page.getByRole('log', { name: 'Conversation' });
  const evidence = conversation.locator('a[href="#project-hedgehog"]');
  await expect(evidence).toBeVisible();
  await expect(question).toBeFocused();
  await tabTo(page, evidence, 'Shift+Tab');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#project-hedgehog$/);
  await expect(page.locator('#project-hedgehog')).toBeFocused();
  await tabTo(page, page.getByRole('button', { name: 'Clear conversation' }));
  await page.keyboard.press('Enter');
  await expect(conversation).toHaveCount(0);
  await expect(question).toHaveValue('');
  await expect(question).toBeFocused();
});

test('public résumé link downloads the approved PDF bytes', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: 'Download Redacted Resume' });
  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  expect(download.suggestedFilename()).toBe('resume-public.pdf');
  expect(await readFile(await download.path())).toEqual(await readFile('public/resume-public.pdf'));
});

test('CRT browses the virtual root and opens the museum without host file access', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open CLI', exact: true }).click();
  const command = page.getByRole('textbox', { name: 'Terminal command' });
  const output = page.locator('.aj-cli-output');
  const prompt = page.locator('label[for="aj-cli-input"]');
  const run = async (input: string) => {
    await command.fill(input);
    await command.press('Enter');
  };

  await expect(prompt).toHaveText('aj@crt:/$');
  await run('ls');
  await expect(output).toContainText(/bin\/.*etc\/.*home\/.*opt\/.*usr\/.*var\//);
  await run('cd ../../..');
  await expect(prompt).toHaveText('aj@crt:/$');
  await run('cat /etc/passwd');
  await expect(output).toContainText('cat: no such file: /etc/passwd');
  await run('museum');
  await expect(output).toContainText('MUSEUM OF HUMBLE BEGINNINGS');
  await command.fill('cd /usr/share/doc/quan');
  await command.press('Tab');
  await expect(command).toHaveValue('cd /usr/share/doc/quantum-leap/');
  await command.press('Enter');
  await expect(prompt).toHaveText('aj@crt:/usr/share/doc/quantum-leap$');
  await run('tree');
  await expect(output).toContainText('origins.txt');
  await run('cat origins.txt');
  await expect(output).toContainText('sophomore-year final project at UAlbany');
  await command.press('ArrowUp');
  await expect(command).toHaveValue('cat origins.txt');
  await run('cat exhibits.txt');
  await expect(output).toContainText('v1.0.9 added the ASCII portal');
  await expect(output).toContainText('v1.0.10 opens the CRT filesystem');
  await run('cd ~');
  await expect(prompt).toHaveText('aj@crt:~$');
  await run('cd Desktop/carmechanicos');
  await expect(prompt).toHaveText('aj@crt:/opt/carmechanicos$');
  await run('cd /');
  await run('cd /opt/carmechanicos');
  await expect(prompt).toHaveText('aj@crt:/opt/carmechanicos$');
  await expect(page.locator('iframe[title="CarMechanicOS hidden garage game"]')).toHaveCount(0);
});

test('garage loads on demand and exits without shifting the document', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await ready(page);
  const open = page.getByRole('button', { name: 'Open CLI', exact: true });
  await open.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  const geometry = () => page.evaluate(() => ({ y: scrollY, height: document.documentElement.scrollHeight }));
  const before = await geometry();
  await open.click();
  const command = page.getByRole('textbox', { name: 'Terminal command' });
  for (const input of ['cd Desktop/carmechanicos', 'start game']) {
    await command.fill(input);
    await command.press('Enter');
  }
  await expect(page.locator('iframe[title="CarMechanicOS hidden garage game"]')).toHaveAttribute('sandbox', 'allow-scripts allow-modals');
  await expect(page.locator('.aj-game-status')).toHaveCount(0);
  await page.getByRole('button', { name: 'Expand monitor', exact: true }).click();
  await page.getByRole('button', { name: 'Collapse monitor', exact: true }).click();
  await page.getByRole('button', { name: /exit game/i }).click();
  await expect(command).toBeFocused();
  expect(await geometry()).toEqual(before);
});

test('portfolio actions emit one fixed-label event each and tolerate tracker errors', async ({ context, page }) => {
  await context.route(/https:\/\/(?:www\.linkedin\.com|github\.com)\//, route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const events: { name: string; data?: Record<string, string> }[] = [];
    Object.assign(window, { analyticsEvents: events, umami: {
      track: (name: string, data?: Record<string, string>) => { events.push({ name, data }); },
    } });
  });
  let status = 200;
  await page.route('**/api/ambassador', route => route.fulfill({ status, json: { answer: 'Private answer fixture.' } }));
  await page.goto('/');
  await expect(page.locator(cameraStage)).toHaveAttribute('data-motion', 'reduced');
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download Redacted Resume' }).click();
  await download;
  await page.getByRole('link', { name: 'LinkedIn profile' }).click();
  await page.locator('.hero-actions').getByRole('link', { name: 'GitHub' }).click();
  await page.getByRole('button', { name: /Tell me about Project Hedgehog/ }).click();
  await expect(page.getByText('Private answer fixture.')).toBeVisible();
  const question = page.getByRole('textbox', { name: /Ask about Ashim/ });
  status = 429;
  await question.fill('Private typed fixture with https://example.com/private');
  await question.press('Enter');
  await expect(page.getByText('Please wait a minute before asking again.')).toBeVisible();
  await page.getByRole('button', { name: 'Clear conversation' }).click();
  await page.getByRole('button', { name: /^Effects / }).click();
  await expect(page.locator(cameraStage)).toHaveAttribute('data-motion', 'off');
  const actual = await page.evaluate(() => (window as Window & { analyticsEvents: unknown[] }).analyticsEvents);
  expect(actual).toEqual([
    { name: 'resume_download_click', data: { location: 'top' } },
    { name: 'profile_link_click', data: { platform: 'linkedin' } },
    { name: 'profile_link_click', data: { platform: 'github' } },
    { name: 'ambassador_question_submitted', data: { source: 'starter' } },
    { name: 'ambassador_response_outcome', data: { outcome: 'success' } },
    { name: 'ambassador_question_submitted', data: { source: 'typed' } },
    { name: 'ambassador_response_outcome', data: { outcome: 'rate_limited' } },
    { name: 'ambassador_conversation_cleared', data: undefined },
    { name: 'fx_changed', data: { mode: 'off' } },
  ]);
  const errors: Error[] = [];
  page.on('pageerror', error => errors.push(error));
  await page.evaluate(() => { window.umami = { track: () => { throw new Error('Blocked'); } }; });
  status = 200;
  await question.fill('Another private fixture.');
  await question.press('Enter');
  await expect(page.getByText('Private answer fixture.')).toBeVisible();
  await page.evaluate(() => { window.umami = { track: () => Promise.reject(new Error('Unavailable')) }; });
  await page.getByRole('button', { name: 'Clear conversation' }).click();
  await expect(question).toBeFocused();
  expect(errors).toEqual([]);
});


test('desk stays sharp while the ASCII portal animates, engulfs and reveals', async ({ page }, info) => {
  await page.goto('/');
  const stage = page.locator(cameraStage);
  const film = stage.locator('.surveillance-film');
  await expect(stage).toHaveAttribute('data-intro', 'desk');
  await expect(stage).toHaveAttribute('data-resolution', '4k');
  await expect(stage).toHaveAttribute('data-settled', 'true');
  const dimensions = await film.evaluate((canvas: HTMLCanvasElement) => ({
    width: canvas.width, height: canvas.height, cssWidth: innerWidth, cssHeight: innerHeight, ratio: devicePixelRatio,
  }));
  const expectedRatio = Math.min(dimensions.ratio, 3840 / Math.max(dimensions.cssWidth, dimensions.cssHeight), 2160 / Math.min(dimensions.cssWidth, dimensions.cssHeight));
  expect(dimensions.width).toBe(Math.round(dimensions.cssWidth * expectedRatio));
  expect(dimensions.height).toBe(Math.round(dimensions.cssHeight * expectedRatio));
  const start = Number(await stage.getAttribute('data-orb-frames'));
  await expect.poll(async () => Number(await stage.getAttribute('data-orb-frames'))).toBeGreaterThan(start + 5);
  const cadence = await stage.evaluate(async element => {
    const stage = element as HTMLElement, start = performance.now(), first = Number(stage.dataset.orbFrames);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { seconds: (performance.now() - start) / 1000, frames: Number(stage.dataset.orbFrames) - first };
  });
  await info.attach('intro-cadence.json', { body: JSON.stringify(cadence), contentType: 'application/json' });
  await page.screenshot({ path: info.outputPath('portal-desk.png') });
  for (const [ratio, state] of [[.09, 'breach'], [.13, 'breach'], [.155, 'reveal'], [.24, 'complete']] as const) {
    await scrollToProgress(page, ratio);
    await expect(stage).toHaveAttribute('data-intro', state);
    await page.screenshot({ path: info.outputPath(`portal-${ratio}.png`) });
  }
  await expect(stage).toHaveAttribute('data-resolution', '4k');
  await expect(stage).toHaveAttribute('data-settled', 'true');
  await expect(stage.locator('.surveillance-breach')).toBeHidden();
  const count = await stage.getAttribute('data-orb-frames');
  await page.waitForTimeout(500);
  expect(await stage.getAttribute('data-orb-frames')).toBe(count);
});

const deskImageRequest = /\/surveillance\/desk-4k\.webp(?:\?|$)/;

const charcoalFilm = Array.from({ length: 9 }, () => [7, 9, 14, 255]);

const readFilm = (stage: Locator) => stage.locator('.surveillance-film').evaluate((canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  return [.1, .5, .9].flatMap(x => [.16, .45, .8].map(y =>
    [...ctx.getImageData(Math.round(x * canvas.width), Math.round(y * canvas.height), 1, 1).data]));
});

async function assertDeskFallback(stage: Locator) {
  await expect(stage).toHaveAttribute('data-sampling', 'desk-fallback');
  await expect(stage.locator('.surveillance-poster')).toBeHidden();
  for (const [r, g, b, a] of await readFilm(stage)) {
    expect(r).toBeLessThan(40); expect(g).toBeLessThan(40); expect(b).toBeLessThan(50); expect(a).toBe(255);
  }
  const orb = await stage.locator('.surveillance-breach').evaluate((canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext('webgl')!;
    return new Promise<{ lit: number; maxRadius: number }>(resolve => {
      const draw = gl.drawArrays;
      gl.drawArrays = function (mode, first, count) {
        draw.call(this, mode, first, count);
        gl.drawArrays = draw;
        const { width, height } = canvas;
        const pixels = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        const centerX = width < height ? width / 2 : width / 2 + .147 * Math.max(width, height * 16 / 9);
        const centerY = height / 2 + .068 * Math.max(height, width * 9 / 16);
        let lit = 0, maxRadius = 0;
        for (let y = 0; y < height; y += 3) for (let x = 0; x < width; x += 3) {
          const i = (y * width + x) * 4;
          if (pixels[i + 3] < 100 || Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) < 80) continue;
          lit++;
          maxRadius = Math.max(maxRadius, Math.hypot(x - centerX, y - centerY) / height);
        }
        resolve({ lit, maxRadius });
      };
      // Reduced motion is static; request one paint without changing progress.
      document.documentElement.dispatchEvent(new Event('pointerleave'));
    });
  });
  expect(orb.lit).toBeGreaterThan(5);
  expect(orb.maxRadius).toBeLessThan(.11);
}

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test.describe(`Act 0 asset fallback (${reducedMotion})`, () => {
    test.use({ reducedMotion });

    test('slow desk stays charcoal until its image loads', async ({ page }) => {
      let releaseDesk!: () => void;
      const pendingDesk = new Promise<void>(resolve => { releaseDesk = resolve; });
      await page.route(deskImageRequest, async route => {
        await pendingDesk;
        await route.continue();
      });
      try {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        const stage = page.locator(cameraStage);
        await expect(stage).toHaveAttribute('data-motion', reducedMotion === 'reduce' ? 'reduced' : 'full');
        await assertDeskFallback(stage);
        await scrollToProgress(page, .12);
        await expect(stage).toHaveAttribute('data-progress', '12');
        await assertDeskFallback(stage);
        await scrollToProgress(page, 0);
        await expect(stage).toHaveAttribute('data-progress', '0');
        releaseDesk();
        await expect(stage).toHaveAttribute('data-sampling', 'desk-plate');
        await expect(stage).toHaveAttribute('data-settled', 'true');
        expect(await readFilm(stage)).not.toEqual(charcoalFilm);
      } finally {
        releaseDesk();
      }
    });

    test('missing desk stays charcoal with a compact orb', async ({ page }) => {
      await page.route(deskImageRequest, route => route.fulfill({ status: 404, headers: { 'cache-control': 'no-store' } }));
      await page.goto('/');
      const stage = page.locator(cameraStage);
      await expect(stage).toHaveAttribute('data-motion', reducedMotion === 'reduce' ? 'reduced' : 'full');
      const poster = stage.locator('.surveillance-poster');
      await expect.poll(() => poster.evaluate((image: HTMLImageElement) => image.complete && !image.naturalWidth)).toBe(true);
      await assertDeskFallback(stage);
    });

    test('desk survives source eviction, long idle and visibility restoration', async ({ page }, info) => {
      test.setTimeout(180_000);
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      const plateRequests: string[] = [];
      page.on('request', request => { if (request.url().includes('/woven-4k/')) plateRequests.push(request.url()); });
      await page.addInitScript(() => {
        const draw = CanvasRenderingContext2D.prototype.drawImage;
        const sources = new Set<HTMLImageElement>();
        Object.assign(window, { deskTestSources: sources });
        CanvasRenderingContext2D.prototype.drawImage = function (...args: Parameters<typeof draw>) {
          if (args[0] instanceof HTMLImageElement && args[0].src.includes('desk-4k')) sources.add(args[0]);
          return Reflect.apply(draw, this, args);
        };
      });
      await page.goto('/');
      const stage = page.locator(cameraStage);
      await expect(stage).toHaveAttribute('data-desk-buffer', 'ready');
      const original = await stage.locator('.surveillance-film').evaluate((c: HTMLCanvasElement) => c.toDataURL());
      // Invalidate the original decoded Image and deny refetches. This models
      // source loss without pretending to force the browser's GPU eviction policy.
      await page.route(deskImageRequest, route => route.abort());
      await page.evaluate(() => {
        const sources = (window as unknown as { deskTestSources: Set<HTMLImageElement> }).deskTestSources;
        if (!sources.size) throw new Error('No desk source captured');
        for (const source of sources) { source.onload = null; source.src = 'data:image/webp;base64,AA=='; }
      });
      for (const ratio of [0, .03, .08]) {
        await scrollToProgress(page, ratio);
        await expect(stage).toHaveAttribute('data-progress', String(Math.round(ratio * 100)));
        const report = await stage.evaluate(async element => {
          const film = element.querySelector<HTMLCanvasElement>('.surveillance-film')!;
          const canvas = element.querySelector<HTMLCanvasElement>('.surveillance-breach')!;
          const gl = canvas.getContext('webgl')!;
          const draw = gl.drawArrays;
          const maxima = [0, 0, 0], roomMaxima = [0, 0, 0];
          let samples = 0, invalidAlphaPixels = 0;
          const atTop = (element as HTMLElement).dataset.progress === '0';
          gl.drawArrays = function (mode, first, count) {
            draw.call(this, mode, first, count);
            const ctx = film.getContext('2d')!;
            for (const x of [.1, .9]) {
              const base = ctx.getImageData(Math.floor(x * film.width), Math.floor(.2 * film.height), 1, 1).data;
              const effect = new Uint8Array(4);
              gl.readPixels(Math.floor(x * canvas.width), canvas.height - 1 - Math.floor(.2 * canvas.height), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, effect);
              for (let channel = 0; channel < 3; channel++) {
                // Preserve the approved expanding burst at 3%/8%. Its desk layer
                // must stay dark, and transparent effect pixels must never leak RGB.
                roomMaxima[channel] = Math.max(roomMaxima[channel], base[channel]);
                if (effect[channel] > effect[3]) invalidAlphaPixels++;
                if (atTop) maxima[channel] = Math.max(maxima[channel], effect[channel] + base[channel] * (1 - effect[3] / 255));
              }
            }
            samples++;
          };
          try {
            const end = performance.now() + 15_250;
            while (performance.now() < end) {
              document.documentElement.dispatchEvent(new Event('pointerleave'));
              await new Promise(resolve => setTimeout(resolve, 250));
            }
          } finally { gl.drawArrays = draw; }
          return { samples, maxima, roomMaxima, invalidAlphaPixels };
        });
        expect(report.samples).toBeGreaterThan(40);
        expect(report.invalidAlphaPixels).toBe(0);
        expect(report.roomMaxima[0]).toBeLessThan(40);
        expect(report.roomMaxima[1]).toBeLessThan(40);
        expect(report.roomMaxima[2]).toBeLessThan(50);
        expect(report.maxima[0]).toBeLessThan(40);
        expect(report.maxima[1]).toBeLessThan(40);
        expect(report.maxima[2]).toBeLessThan(50);
        await info.attach(`idle-${ratio}.json`, { body: JSON.stringify(report), contentType: 'application/json' });
        // Dispatch the actual document lifecycle event; no production test hook.
        await page.evaluate(() => {
          Object.defineProperty(document, 'hidden', { configurable: true, value: true });
          document.dispatchEvent(new Event('visibilitychange'));
        });
        const paused = await stage.getAttribute('data-orb-frames');
        await page.waitForTimeout(300);
        expect(await stage.getAttribute('data-orb-frames')).toBe(paused);
        await page.evaluate(() => {
          delete (document as unknown as { hidden?: boolean }).hidden;
          document.dispatchEvent(new Event('visibilitychange'));
        });
        await expect.poll(async () => Number(await stage.getAttribute('data-orb-frames'))).toBeGreaterThan(Number(paused));
        await expect(stage).toHaveAttribute('data-desk-buffer', 'ready');
        await page.screenshot({ path: info.outputPath(`persistent-desk-${ratio}.png`) });
      }
      await scrollToProgress(page, 0);
      await expect(stage).toHaveAttribute('data-progress', '0');
      // React updates the HUD before the next canvas animation frame. Wait for
      // that paint, then require byte-identical desk pixels (not a near match).
      await expect.poll(async () => stage.locator('.surveillance-film').evaluate(
        (c: HTMLCanvasElement, expected) => c.toDataURL() === expected, original,
      ), { message: 'returning to the top restores the identical desk frame' }).toBe(true);
      expect(plateRequests).toEqual([]);
      expect(errors).toEqual([]);
    });

    test('ASCII transparency and glyphs recover after graphics context loss', async ({ page }) => {
      await page.goto('/');
      const stage = page.locator(cameraStage);
      await expect(stage).toHaveAttribute('data-desk-buffer', 'ready');
      await stage.locator('.surveillance-breach').evaluate(async (canvas: HTMLCanvasElement) => {
        const gl = canvas.getContext('webgl')!;
        const extension = gl.getExtension('WEBGL_lose_context');
        if (!extension) throw new Error('Context loss simulation unavailable');
        const lost = new Promise(resolve => canvas.addEventListener('webglcontextlost', resolve, { once: true }));
        extension.loseContext();
        await lost;
        await new Promise(resolve => setTimeout(resolve, 100));
        const restored = new Promise(resolve => canvas.addEventListener('webglcontextrestored', resolve, { once: true }));
        extension.restoreContext();
        await restored;
      });
      const result = await stage.locator('.surveillance-breach').evaluate((canvas: HTMLCanvasElement) => {
        const gl = canvas.getContext('webgl')!;
        return new Promise<{ hiddenColor: number; lit: number }>(resolve => {
          const draw = gl.drawArrays;
          gl.drawArrays = function (mode, first, count) {
            draw.call(this, mode, first, count);
            gl.drawArrays = draw;
            const pixels = new Uint8Array(canvas.width * canvas.height * 4);
            gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            let hiddenColor = 0, lit = 0;
            for (let i = 0; i < pixels.length; i += 4) {
              if (pixels[i + 3] === 0) hiddenColor = Math.max(hiddenColor, pixels[i], pixels[i + 1], pixels[i + 2]);
              if (pixels[i + 3] > 100) lit++;
            }
            resolve({ hiddenColor, lit });
          };
          document.documentElement.dispatchEvent(new Event('pointerleave'));
        });
      });
      expect(result.hiddenColor).toBe(0);
      expect(result.lit).toBeGreaterThan(20);
    });
  });
}

test('reload selects all six breach palettes without changing color during a visit', async ({ page }, info) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  // Exercise every equal-width random interval on actual reloads, without a
  // production query parameter or forced-palette control.
  await page.addInitScript(() => {
    Math.random = () => Number(sessionStorage.getItem('test-breach-random') ?? '0.01');
  });
  await page.goto('/');
  const stage = page.locator(cameraStage);
  for (const [index, palette] of BREACH_PALETTES.entries()) {
    await page.evaluate(value => sessionStorage.setItem('test-breach-random', String(value)), (index + .5) / BREACH_PALETTES.length);
    // Pause prefetch before navigating away from each test visit. WebKit reports
    // intentionally interrupted image decodes as access-control page errors.
    await expect(stage).toHaveAttribute('data-motion', 'full');
    await page.getByRole('button', { name: /^Effects / }).click();
    await expect(stage).toHaveAttribute('data-motion', 'reduced');
    await page.waitForLoadState('networkidle');
    await page.reload();
    await scrollToProgress(page, 0);
    await expect(stage).toHaveAttribute('data-breach-palette', palette.name);
    await expect(stage).toHaveAttribute('data-motion', 'full');
    await expect(stage).toHaveAttribute('data-intro', 'desk');
    const shades = [palette.core, palette.mid, palette.outer, palette.glow].map(hex =>
      [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16)));

    for (const ratio of [0, .04, .11]) {
      await scrollToProgress(page, ratio);
      await expect(stage).toHaveAttribute('data-progress', String(Math.round(ratio * 100)));
      // Read immediately after a real WebGL draw; reading a composed WebGL
      // buffer later can return cleared pixels when preserveDrawingBuffer=false.
      const colors = await stage.locator('.surveillance-breach').evaluate((canvas: HTMLCanvasElement) => {
        const gl = canvas.getContext('webgl')!;
        return new Promise<{ bright: number; min: number[]; max: number[] }>(resolve => {
          const draw = gl.drawArrays;
          gl.drawArrays = function (mode, first, count) {
            draw.call(this, mode, first, count);
            gl.drawArrays = draw;
            const pixels = new Uint8Array(canvas.width * canvas.height * 4);
            gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            const min = [255, 255, 255], max = [0, 0, 0];
            let bright = 0;
            for (let i = 0; i < pixels.length; i += 16) {
              if (pixels[i + 3] < 100 || Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) < 80) continue;
              bright++;
              for (let channel = 0; channel < 3; channel++) {
                const straight = Math.round(pixels[i + channel] * 255 / pixels[i + 3]);
                min[channel] = Math.min(min[channel], straight);
                max[channel] = Math.max(max[channel], straight);
              }
            }
            resolve({ bright, min, max });
          };
        });
      });
      expect(colors.bright, `${palette.name} at ${ratio} has visible glyphs`).toBeGreaterThan(20);
      for (let channel = 0; channel < 3; channel++) {
        expect(colors.min[channel]).toBeGreaterThanOrEqual(Math.min(...shades.map(rgb => rgb[channel])) - 2);
        expect(colors.max[channel]).toBeLessThanOrEqual(Math.max(...shades.map(rgb => rgb[channel])) + 2);
      }
      await expect(stage).toHaveAttribute('data-breach-palette', palette.name);
      await page.screenshot({ path: info.outputPath(`palette-${index}-${ratio}.png`) });
    }
    // Changing the next random value must not recolor an already mounted visit,
    // including when the FX control disposes/recreates its WebGL renderer.
    await page.evaluate(() => sessionStorage.setItem('test-breach-random', '0.99'));
    for (const motion of ['reduced', 'off', 'full']) {
      await page.getByRole('button', { name: /^Effects / }).click();
      await expect(stage).toHaveAttribute('data-motion', motion);
      await expect(stage).toHaveAttribute('data-breach-palette', palette.name);
    }
  }
  expect(errors).toEqual([]);
});

test('failed 4K enhancement retains the exact HD frame without idle drift', async ({ page }) => {
  await page.route('**/surveillance/woven-4k/**', route => route.abort());
  await page.goto('/');
  await scrollToProgress(page, .44);
  const stage = page.locator(cameraStage);
  await expect(stage).toHaveAttribute('data-frame', '62');
  await expect(stage).toHaveAttribute('data-settled', 'true');
  await expect(stage).toHaveAttribute('data-resolution', 'hd');
  const pixels = await stage.locator('.surveillance-film').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await page.waitForTimeout(500);
  expect(await stage.locator('.surveillance-film').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).toBe(pixels);
});
