import fs from 'node:fs';
import path from 'node:path';
import { connectGhost, safeFill, safeClick, waitForMetaAI } from './ghost-controller.js';

const args = process.argv.slice(2);
const browserIndex = args.indexOf('--browser');
const inlineBrowser = args.find(value => value.startsWith('--browser='));
const browser = inlineBrowser
  ? inlineBrowser.slice('--browser='.length)
  : browserIndex >= 0 ? args[browserIndex + 1] : 'edge';
const outputIndex = args.indexOf('--output');
const inlineOutput = args.find(value => value.startsWith('--output='));
const outputDir = inlineOutput
  ? inlineOutput.slice('--output='.length)
  : outputIndex >= 0 ? args[outputIndex + 1]
    : path.join(process.env.USERPROFILE || process.env.HOME, 'Pictures', 'MetaAI-Generated');
const skipped = new Set(['--browser', '--output']);
const promptParts = args.filter((value, index) => {
  if (skipped.has(value)) return false;
  if (index > 0 && (args[index - 1] === '--browser' || args[index - 1] === '--output')) return false;
  if (value.startsWith('--browser=') || value.startsWith('--output=')) return false;
  return true;
});
const prompt = promptParts.join(' ');

if (!prompt.trim()) {
  console.error('Usage: node scripts/create-image.js "image prompt" [--browser edge|chrome|brave|firefox] [--output folder]');
  process.exit(2);
}

let connection;
try {
  connection = await connectGhost({ browser });
  const { context, selectedBrowser } = connection;
  const page = await context.newPage();
  await waitForMetaAI(page);
  const tiles = page.locator('img[data-testid="ur-image-tile"]');
  const baseline = await tiles.count();
  const baselineAlts = await tiles.evaluateAll(images =>
    images.map(image => image.getAttribute('alt') || image.currentSrc || image.src));

  const composer = page.locator('[contenteditable="true"][data-testid="composer-input"]');
  if (await composer.count() !== 1 || !(await composer.isVisible())) {
    throw new Error('Visible Meta AI composer not found. Nothing was submitted.');
  }
  await safeFill(composer, prompt.trim());

  const send = page.locator('[data-testid="composer-send-button"]');
  if (await send.count() !== 1 || !(await send.isEnabled())) {
    throw new Error('Meta AI send button unavailable. Nothing was submitted.');
  }
  await safeClick(send);
  console.log(`PROMPT_SUBMITTED_BROWSER: ${selectedBrowser}`);

  await page.waitForFunction(({ baseline, baselineAlts }) => {
    const images = [...document.querySelectorAll('img[data-testid="ur-image-tile"]')];
    if (images.length <= baseline) return false;
    const latest = images[images.length - 1];
    const identity = latest.getAttribute('alt') || latest.currentSrc || latest.src;
    return !baselineAlts.includes(identity) && latest.complete &&
      latest.naturalWidth > 500 && latest.naturalHeight > 400;
  }, { baseline, baselineAlts }, { timeout: 180000 });

  const latest = tiles.last();
  await latest.scrollIntoViewIfNeeded();
  await latest.hover();
  const dimensions = await latest.evaluate(image => ({
    width: image.naturalWidth, height: image.naturalHeight
  }));
  const mediaGroup = latest.locator('xpath=ancestor::div[contains(@class,"group/media-item")]').first();
  const downloadButton = mediaGroup.getByRole('button', { name: 'ดาวน์โหลด' });
  if (await downloadButton.count() !== 1) {
    throw new Error('Generated image found, but the download button could not be identified uniquely.');
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
  await safeClick(downloadButton);
  const download = await downloadPromise;
  const suggested = path.basename(download.suggestedFilename());
  const outputPath = path.join(outputDir, suggested || `meta-ai-${Date.now()}`);
  await download.saveAs(outputPath);

  const stat = fs.statSync(outputPath);
  if (!stat.size) throw new Error('Downloaded file is empty.');
  const header = fs.readFileSync(outputPath).subarray(0, 12);
  const hex = header.toString('hex').toLowerCase();
  let detected = 'unknown';
  if (hex.startsWith('ffd8ff')) detected = 'jpg';
  else if (hex.startsWith('89504e470d0a1a0a')) detected = 'png';
  else if (header.toString('ascii', 0, 4) === 'RIFF' &&
           header.toString('ascii', 8, 12) === 'WEBP') detected = 'webp';
  let finalPath = outputPath;
  const ext = path.extname(outputPath).slice(1).toLowerCase();
  if (detected !== 'unknown' && ext !== detected) {
    finalPath = outputPath.slice(0, -path.extname(outputPath).length) + `.${detected}`;
    fs.renameSync(outputPath, finalPath);
  }
  const verified = fs.statSync(finalPath);
  console.log('DOWNLOAD_VERIFIED:', verified.size > 0 && detected !== 'unknown');
  console.log('FILE_SIZE_BYTES:', verified.size);
  console.log('FILE_TYPE:', detected);
  console.log('IMAGE_DIMENSIONS:', `${dimensions.width}x${dimensions.height}`);
} catch (error) {
  console.error('WORKFLOW_FAILED:', error.message);
  process.exitCode = 1;
} finally {
  if (connection?.browser) await connection.browser.close().catch(() => {});
}
