import { expect, test, type Locator, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const cameraStage = '.surveillance-stage';

async function ready(page: Page) {
  await expect(page.locator(cameraStage)).toHaveAttribute('data-feed', /^CAM_0[1-4]$/);
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
  await expect(stage).toHaveAttribute('data-sampling', 'woven-frame');
  await expect(stage).toHaveAttribute('data-annotations', /Monitor_Wall/);
  await film.evaluate(element => { element.dataset.qaIdentity = 'same-film'; });
  await page.screenshot({ path: info.outputPath('woven-hero.png') });
  await cameraControl.click();
  await expect(page.getByText('VISUAL SIMULATION / WOVEN CAMERA STUDY')).toBeVisible();
  const panel = (await cameraPanel.boundingBox())!;
  await expect.poll(async () => (await page.locator('.scroll-telemetry').boundingBox())!.y).toBeGreaterThan(panel.y + panel.height);

  for (const progress of [0, .30, .60, .90, .60, .30, 0]) {
    await scrollToProgress(page, progress);
    await expect(stage).toHaveAttribute('data-feed', `CAM_0${1 + Math.floor(progress * 4)}`);
    await frameNear(stage, Math.round(progress * 192));
    await expect.poll(() => stage.evaluate(element => Number((element as HTMLElement).dataset.keypoints))).toBeGreaterThan(0);
    if (progress === .30) await expect(stage).toHaveAttribute('data-annotations', /Billboard_Display Pedestrian/);
    if (progress === .90) await expect(stage).toHaveAttribute('data-annotations', /Spherical_Vehicle/);
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
  for (const [camera, progress] of [[2, 28], [3, 55], [4, 80], [1, 0]]) {
    await cameraPanel.getByRole('button', { name: new RegExp(`^CAM_0${camera} /`) }).click();
    await expect(stage).toHaveAttribute('data-progress', String(progress));
    await frameNear(stage, Math.round(progress * 1.92));
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
  if (!isMobile) await page.mouse.move(900, 350);

  for (const [progress, expectedFrame] of [[0, 0], [.55, 106]]) {
    await scrollToProgress(page, progress);
    await expect(stage).toHaveAttribute('data-frame', String(expectedFrame));
    await expect(stage).toHaveAttribute('data-settled', 'true');
    const result = await stage.evaluate(async element => {
      const stage = element as HTMLElement;
      const canvases = [...stage.querySelectorAll('canvas')];
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
