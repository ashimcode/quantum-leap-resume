import { expect, test, type Locator, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

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
  await cameraControl.click();
  await page.getByRole('button', { name: 'Pause surveillance effects' }).click();
  await expect(stage).toHaveAttribute('data-playback', 'off');
  await page.getByRole('button', { name: 'Resume surveillance effects' }).click();
  await expect(stage).toHaveAttribute('data-playback', 'active');
  expect(errors).toEqual([]);
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

test('idle desk contains the red orb through rapid scroll and late 4K responses', async ({ page }) => {
  const stage = page.locator(cameraStage);
  let releasePlates!: () => void;
  const heldPlates = new Promise<void>(resolve => { releasePlates = resolve; });
  let requested = 0;
  await page.route('**/surveillance/woven-4k/**', async route => {
    requested++;
    try {
      const response = await route.fetch();
      await heldPlates;
      await route.fulfill({ response });
    } catch {
      // Leaving the requested scroll position cancels the browser's request.
    }
  });
  await page.goto('/');
  await expect(stage).toHaveAttribute('data-motion', 'full');

  async function checkDesk() {
    await expect(stage).toHaveAttribute('data-intro', 'desk');
    await expect(stage).toHaveAttribute('data-settled', 'true');
    // Sample the composited page. Reading the WebGL backing buffer after the
    // browser presents it can miss the very overlay this test is looking for.
    const shot = await page.screenshot({ scale: 'css' });
    const pixels = await page.evaluate(async base64 => {
      const bytes = Uint8Array.from(atob(base64), value => value.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
      const canvas = document.createElement('canvas');
      const w = canvas.width = 320, h = canvas.height = 180;
      const context = canvas.getContext('2d')!;
      context.drawImage(bitmap, 0, 0, w, h);
      bitmap.close();
      const data = context.getImageData(0, 0, w, h).data;
      const imageWidth = Math.max(innerWidth, innerHeight * 16 / 9);
      const imageHeight = imageWidth * 9 / 16;
      const cx = innerWidth < innerHeight ? .5 : .5 + .147 * imageWidth / innerWidth;
      const cy = .5 - .068 * imageHeight / innerHeight;
      let inside = 0, outside = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          if (data[i] < 52 || data[i] - Math.max(data[i + 1], data[i + 2]) < 26) continue;
          const dx = Math.abs((x + .5) / w - cx), dy = Math.abs((y + .5) / h - cy);
          if (dx < .14 * imageWidth / innerWidth && dy < .136 * imageHeight / innerHeight) inside++;
          else outside++;
        }
      }
      return { inside, outside };
    }, shot.toString('base64'));
    expect(pixels.outside, 'bright red pixels outside the monitor').toBeLessThan(12);
    return pixels.inside;
  }

  try {
    let orbPixels = 0;
    const idleUntil = Date.now() + 12_000;
    do {
      orbPixels = Math.max(orbPixels, await checkDesk());
      await page.waitForTimeout(500);
    } while (Date.now() < idleUntil);
    expect(orbPixels).toBeGreaterThan(8);
    expect(requested).toBe(0);
    await scrollToProgress(page, .60);
    await expect.poll(() => requested).toBeGreaterThan(0);
    await scrollToProgress(page, .04);
    await scrollToProgress(page, 0);
    await checkDesk();
    await scrollToProgress(page, .85);
    await expect.poll(() => requested).toBeGreaterThan(1);
    await scrollToProgress(page, 0);
    await expect(stage).toHaveAttribute('data-intro', 'desk');
    releasePlates();
    await checkDesk();
    await page.waitForTimeout(750);
    expect(await checkDesk()).toBeGreaterThan(8);
  } finally {
    releasePlates();
  }
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
