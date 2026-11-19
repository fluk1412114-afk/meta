// End-to-end Meta AI image generation and download.
// Usage: node scripts/create-image.js "A detailed image prompt"
// Optional: node scripts/create-image.js "prompt" "output-folder"
// Attach to the user's existing Chrome CDP session; never launch a new profile.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const prompt = process.argv[2];
if (!prompt || !prompt.trim()) {
  console.error('Usage: node scripts/create-image.js "image prompt"');
  process.exit(2);
}

(async () => {
  const { findCdpEndpoint } = require('./find-cdp-endpoint');
  const endpoint = await findCdpEndpoint();
  const browser = await chromium.connectOverCDP(endpoint);
  try {
    const context = browser.contexts()[0];
    if (!context) throw new Error('No existing Chrome context found.');

    // Always use a dedicated new tab and retain its Page reference while the job runs.
    const page = await context.newPage();
    await page.goto('https://www.meta.ai/', { waitUntil: 'domcontentloaded', timeout: 45000 });

    const tiles = page.locator('img[data-testid="ur-image-tile"]');
    const baseline = await tiles.count();
    const baselineAlts = await tiles.evaluateAll(images => images.map(image => image.getAttribute('alt') || image.currentSrc || image.src));

    const composer = page.locator('[contenteditable="true"][data-testid="composer-input"]');
    if (await composer.count() !== 1 || !(await composer.isVisible())) {
      throw new Error('Visible Meta AI composer not found. Nothing was submitted.');
    }
    await composer.fill(prompt.trim());

    const send = page.locator('[data-testid="composer-send-button"]');
    if (await send.count() !== 1 || !(await send.isEnabled())) {
      throw new Error('Meta AI send button unavailable. Nothing was submitted.');
    }
    await send.click();
    console.log('PROMPT_SUBMITTED');

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
      width: image.naturalWidth,
      height: image.naturalHeight
    }));
    console.log('IMAGE_GENERATED:', dimensions.width + 'x' + dimensions.height);
    // Do not log image alt text; it may contain user-provided or generated personal details.

    const mediaGroup = latest.locator('xpath=ancestor::div[contains(@class,"group/media-item")]').first();
    const downloadButton = mediaGroup.getByRole('button', { name: 'ดาวน์โหลด' });
    if (await downloadButton.count() !== 1) {
      throw new Error('New image is generated, but its download button could not be identified uniquely.');
    }

    const outputDir = process.argv[3] || path.join(process.env.USERPROFILE, 'Pictures', 'MetaAI-Generated');
    fs.mkdirSync(outputDir, { recursive: true });
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await downloadButton.click();
    const download = await downloadPromise;

    const suggested = path.basename(download.suggestedFilename());
    const outputPath = path.join(outputDir, suggested || ('meta-ai-' + Date.now()));
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
      finalPath = outputPath.slice(0, -path.extname(outputPath).length) + '.' + detected;
      fs.renameSync(outputPath, finalPath);
    }
    const verified = fs.statSync(finalPath);
    console.log('DOWNLOAD_VERIFIED:', verified.size > 0 && detected !== 'unknown');
    // Avoid printing local filesystem paths that may disclose the Windows account name.
    console.log('FILE_SIZE_BYTES:', verified.size);
    console.log('FILE_TYPE:', detected);
    console.log('IMAGE_DIMENSIONS:', dimensions.width + 'x' + dimensions.height);
  } finally {
    // Disconnect Playwright only; do not close the user's Chrome.
    await browser.close();
  }
})().catch(error => {
  console.error('WORKFLOW_FAILED:', error.message);
  process.exitCode = 1;
});
