import { expect, test, type Locator, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const cameraStage = '.surveillance-stage';

async function ready(page: Page) {
  await expect(page.locator(cameraStage)).toHaveAttribute('data-feed', /^CAM_0[1-4]$/);
}

async function playing(video: Locator) {
  await expect.poll(() => video.evaluate((media: HTMLVideoElement) => ({
    playing: !media.paused && media.currentTime > .05,
    decodedFrame: media.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && media.videoWidth > 0 && media.videoHeight > 0,
    error: media.error?.code ?? null,
  })), { timeout: 12_000 }).toEqual({ playing: true, decodedFrame: true, error: null });
  const initialTime = await video.evaluate((media: HTMLVideoElement) => media.currentTime);
  await expect.poll(() => video.evaluate((media: HTMLVideoElement, time) => Math.abs(media.currentTime - time), initialTime)).toBeGreaterThan(.03);
}

async function tabTo(page: Page, locator: Locator, key = 'Tab') {
  for (let attempt = 0; attempt < 110; attempt++) {
    if (await locator.evaluate(element => document.activeElement === element)) return;
    await page.keyboard.press(key);
  }
  await expect(locator).toBeFocused();
}

test('one playing camera and canvas follow the entire document', async ({ page, browserName }, info) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', request => requests.push(request.url()));
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await page.goto('/');
  await ready(page);
  const stage = page.locator(cameraStage);
  const video = stage.locator('video');
  const canvas = stage.locator('canvas');
  await expect(video).toHaveCount(1);
  await expect(canvas).toHaveCount(1);
  await playing(video);
  await expect(stage).toHaveAttribute('data-sampling', 'luminance-motion');
  await expect(video).toHaveAttribute('src', /^\/surveillance\/cam-0[1-4]-.+\.mp4$/);
  // WebKit's media process does not report all range requests as page events.
  if (browserName === 'chromium') expect(new Set(requests.filter(url => /\/surveillance\/.+\.mp4$/.test(url))).size).toBe(1);
  await expect(page.getByText('VISUAL SIMULATION / CAMERA STUDY')).toBeVisible();
  await page.screenshot({ path: info.outputPath('hero.png') });

  const seen = new Set<string>();
  const switchFeed = page.getByRole('button', { name: /^Switch surveillance camera/ });
  for (let i = 0; i < 4; i++) {
    seen.add((await stage.getAttribute('data-feed'))!);
    await playing(video);
    if (i < 3) await switchFeed.click();
  }
  expect(seen.size).toBe(4);
  await video.evaluate(element => { element.dataset.qaIdentity = 'same-camera-element'; });
  await canvas.evaluate(element => { element.dataset.qaIdentity = 'same-canvas-element'; });
  for (const mode of ['YOLO_BOXES', 'SLAM_KEYPOINTS', 'HYBRID_CV']) {
    const button = page.getByRole('button', { name: mode, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  }

  for (const [selector, section] of [
    ['.hero-grid-strip', 'FOUNDATION'], ['#role-match', 'VERIFIABLE EVIDENCE'],
    ['#projects', 'PROJECTS'], ['#experience', 'EXPERIENCE'],
    ['#credentials', 'CREDENTIALS'], ['#ambassador', 'AMBASSADOR'],
  ]) {
    await page.locator(selector).evaluate(element => {
      window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - 100, behavior: 'instant' });
    });
    await expect(stage).toHaveAttribute('data-section', section);
  }
  await page.screenshot({ path: info.outputPath('ambassador.png') });
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect(stage).toHaveAttribute('data-progress', '100');
  await expect(stage).toHaveAttribute('data-section', 'FOOTER');
  await expect.poll(() => stage.evaluate(element => Number(element.style.getPropertyValue('--camera-zoom')))).toBeGreaterThan(1.04);
  await expect(video).toHaveAttribute('data-qa-identity', 'same-camera-element');
  await expect(canvas).toHaveAttribute('data-qa-identity', 'same-canvas-element');
  await playing(video);
  const bounds = await stage.evaluate(element => {
    const box = element.getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width, viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth };
  });
  expect(bounds).toEqual({ x: 0, y: 0, width: bounds.viewport, viewport: bounds.viewport, scrollWidth: bounds.viewport });
  expect(requests.some(url => /\/underground-(?:frames|reel)/.test(url))).toBe(false);
  expect(requests.some(url => /\/carmechanicos\//.test(url))).toBe(false);

  const cameraControl = page.getByRole('button', { name: /^Camera study controls/ });
  if (await cameraControl.getAttribute('aria-expanded') === 'false') await cameraControl.click();
  await expect(page.locator('.surveillance-section')).toHaveText('100% / FOOTER');
  await page.getByRole('button', { name: 'Pause surveillance effects' }).click();
  await expect(stage).toHaveAttribute('data-motion', 'off');
  await expect.poll(() => video.evaluate((media: HTMLVideoElement) => media.paused)).toBe(true);
  await page.getByRole('button', { name: 'Resume surveillance effects' }).click();
  await playing(video);

  const fx = page.getByRole('button', { name: /^Effects / });
  await fx.click();
  await expect(stage).toHaveAttribute('data-motion', 'reduced');
  await expect(video).not.toHaveAttribute('src');
  await fx.click();
  await expect(stage).toHaveAttribute('data-motion', 'off');
  await fx.click();
  await expect(stage).toHaveAttribute('data-motion', 'full');
  await playing(video);
  expect(errors).toEqual([]);
});

test('reduced motion requests a poster and takes precedence over the header cycle', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const movies: string[] = [];
  page.on('request', request => { if (/\/surveillance\/.+\.mp4$/.test(request.url())) movies.push(request.url()); });
  await page.goto('/');
  await ready(page);
  const stage = page.locator(cameraStage);
  await expect(stage).toHaveAttribute('data-motion', 'reduced');
  await expect(stage.locator('img')).toBeVisible();
  await expect.poll(() => stage.locator('img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(stage.locator('video')).not.toHaveAttribute('src');
  const canvas = stage.locator('canvas');
  const hybrid = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  await page.getByRole('button', { name: 'SLAM_KEYPOINTS', exact: true }).click();
  await expect.poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL())).not.toBe(hybrid);
  await page.getByRole('button', { name: /^Switch surveillance camera/ }).click();
  const fx = page.getByRole('button', { name: /^Effects / });
  await fx.click();
  await expect(stage).toHaveAttribute('data-motion', 'off');
  await fx.click();
  await expect(stage).toHaveAttribute('data-motion', 'reduced');
  expect(movies).toEqual([]);
});

test('blocked autoplay uses a still and a user can retry playback', async ({ page }) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    let firstAttempt = true;
    HTMLMediaElement.prototype.play = function () {
      if (firstAttempt && this.closest('.surveillance-stage')) {
        firstAttempt = false;
        return Promise.reject(new DOMException('Autoplay disabled for this test', 'NotAllowedError'));
      }
      return play.call(this);
    };
  });
  await page.goto('/');
  await ready(page);
  const stage = page.locator(cameraStage);
  const retry = page.getByRole('button', { name: /Retry playback/ });
  await expect(retry).toBeVisible();
  await expect(stage).toHaveAttribute('data-playback', 'fallback');
  await expect(stage.locator('video')).toBeHidden();
  await expect(stage.locator('img')).toBeVisible();
  await retry.click();
  await playing(stage.locator('video'));
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
  const dialog = page.getByRole('dialog', { name: 'QUANTUM LEAP / CHAPTER INDEX' });
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
