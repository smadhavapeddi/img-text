# Multimodal Inference Demo

A single small web app that calls **DigitalOcean Serverless Inference** for two
different modalities — text (chat completions) and image generation — through
the *same* endpoint base URL and the *same* `MODEL_ACCESS_KEY`. The point of the
demo is that it's one control plane: swap the `model` field and SDK method, not
the credentials or infrastructure.

## Why this is a good demo

- **One API key, one base URL (`https://inference.do-ai.run/v1`), two modalities.**
  Good for showing a prospect they don't need separate vendors/integrations for
  text vs. image generation.
- Shows the actual request/response shape for both `POST /v1/chat/completions`
  and `POST /v1/images/generations`, including token usage, live on screen.
- Runs as a normal web app, so it's easy to screen-share or deploy for others to
  click around themselves.

## Run locally

```bash
npm install
cp .env.example .env      # fill in MODEL_ACCESS_KEY
npm start
```

Open http://localhost:8080. Type a prompt in either panel — the chat panel hits
`/v1/chat/completions`, the image panel hits `/v1/images/generations`. Both show
the model used, the endpoint called, and token usage under the result.

Override `TEXT_MODEL` / `IMAGE_MODEL` in `.env` — see
[available models](https://docs.digitalocean.com/products/inference/details/models/)
for other options (e.g. `stable-diffusion-3.5-large` for image generation).

## Deploying to App Platform

1. Push this folder to a GitHub repo, then update `.do/app.yaml`'s `github.repo`.
2. Create the app:
   ```bash
   doctl apps create --spec .do/app.yaml
   ```
   or via the control panel: **Apps → Create App → GitHub** — App Platform
   auto-detects Node.js from `package.json`.
3. Set the `MODEL_ACCESS_KEY` secret under **App → Settings → App-Level
   Environment Variables**.
4. Verify:
   ```bash
   curl https://<your-app>.ondigitalocean.app/health
   ```
   then open the app URL to try both panels.

## Reference

- [Chat Completions API](https://docs.digitalocean.com/products/inference/how-to/use-chat-completions-api/)
- [Generate Images From Text Prompts](https://docs.digitalocean.com/products/inference/how-to/generate-images-from-text-prompts/)
