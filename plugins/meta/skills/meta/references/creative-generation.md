# Image and video generation

Use this guide for Meta AI image creation, image edits, video generation, and creative production.

## Discover current controls

Before submitting, inspect the current page for:
- active mode (Instant / Think or any current equivalent);
- image or video creation entry point;
- prompt composer and send control;
- reference-image upload or attachment support;
- aspect ratio, duration, quality, style, or other settings that are actually exposed;
- result cards, regenerate/edit controls, and download controls.

Do not assume a control, model name, output size, duration, or quota from an older session. Use only options visible and available to the signed-in account.

## Image workflow

1. Translate the user's request into a clear visual brief: subject, action, environment, composition, camera, lighting, style, aspect ratio, and exclusions.
2. Preserve exact details the user specified. Fill gaps with sensible defaults; avoid asking about details that do not materially affect the result.
3. For complex prompts, use the more reasoning-oriented mode if it is visibly available and appropriate; use the faster mode for simple requests.
4. Submit once, wait for a new result, and verify that it belongs to the current prompt.
5. If asked to deliver the file, use the actual download control and verify the saved file's existence, non-zero size, signature, and dimensions where possible.
6. If the first result misses important constraints, revise the prompt specifically rather than repeatedly resubmitting unchanged text.

Known helper: node scripts/create-image.js "prompt" ["output-folder"]. It currently targets a specific observed Meta AI composer/result/download UI. Inspect the live UI and helper before relying on it; update selectors only after confirming the actual change. This helper is image-only.

## Video workflow

1. Inspect whether video generation is available to this account and in the current Meta AI surface.
2. Extract the brief: duration, aspect ratio, subject, action, scene, camera movement, visual style, continuity, and audio/voice requirements.
3. If the tool accepts text-to-video, write a motion-focused prompt describing what changes over time. If it accepts image-to-video, first create or select a reference image only when that improves the result.
4. Use only supported settings. Never promise 720p, 1080p, a duration, audio, Thai speech, lip-sync, or a specific model unless the UI exposes it and the resulting file verifies it.
5. Wait for completion and inspect the actual video. Verify duration, dimensions, playback, and audio track when possible.
6. Download through the visible UI and verify the file. If video generation is unavailable, still help by producing a shot list, storyboard, narration, and prompts, but label these as prepared assets rather than a generated video.

## Continuity and production

For multi-shot work, define reusable identity anchors for characters, wardrobe, location, lighting, and visual style. Generate a clean reference first when useful, then compare each output for drift. Do not claim character consistency is guaranteed by text prompts alone.

For Thai output, write Thai dialogue/narration explicitly and distinguish it from visual instructions. If Meta generates unwanted English speech or no audio, report that and prepare Thai voiceover/subtitle alternatives.

## Output handling

Keep original downloads unchanged. Use verified paths only. Do not claim a transparent background unless the file's alpha channel has been checked. Record actual dimensions rather than requested dimensions.
