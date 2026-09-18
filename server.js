// Multimodal demo — text chat AND image generation through the SAME
// DigitalOcean Serverless Inference endpoint (base URL + API key).
//
// Both /api/chat and /api/image below use one `client`, one `baseURL`
// (https://inference.do-ai.run/v1), and one MODEL_ACCESS_KEY — only the
// `model` field and the SDK method (chat.completions vs images.generate)
// differ. That's the point of the demo: one control plane, many modalities.

import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const MODEL_ACCESS_KEY = process.env.MODEL_ACCESS_KEY;
const TEXT_MODEL = process.env.TEXT_MODEL || "gemma-4-31B-it";
const IMAGE_MODEL = process.env.IMAGE_MODEL || "openai-gpt-oss-20b";
const PORT = process.env.PORT || 8080;
const BASE_URL = "https://inference.do-ai.run/v1";

if (!MODEL_ACCESS_KEY) {
  console.error(
    "Missing MODEL_ACCESS_KEY. Copy .env.example to .env and add your key.\n" +
      "Docs: https://docs.digitalocean.com/products/inference/how-to/manage-model-access-keys/"
  );
  process.exit(1);
}

const client = new OpenAI({ baseURL: BASE_URL, apiKey: MODEL_ACCESS_KEY });

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/config", (_req, res) => {
  res.json({ baseUrl: BASE_URL, textModel: TEXT_MODEL, imageModel: IMAGE_MODEL });
});

// ---- Text (chat completions) ----
app.post("/api/chat", async (req, res) => {
  const prompt = (req.body?.prompt || "").trim();
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  try {
    const completion = await client.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: "You are a helpful, concise assistant." },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 400,
      temperature: 0.7,
    });
    res.json({
      text: completion.choices[0].message.content,
      model: completion.model,
      usage: completion.usage,
      endpoint: `${BASE_URL}/chat/completions`,
    });
  } catch (err) {
    console.error("chat error:", err.message || err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// ---- Image (images.generate) — same client/base URL/API key as above ----
app.post("/api/image", async (req, res) => {
  const prompt = (req.body?.prompt || "").trim();
  const size = req.body?.size || "1024x1024";
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  try {
    const result = await client.images.generate({
      model: IMAGE_MODEL,
      prompt,
      size,
      n: 1,
    });
    const b64 = result.data[0].b64_json;
    res.json({
      image: `data:image/png;base64,${b64}`,
      model: IMAGE_MODEL,
      usage: result.usage,
      endpoint: `${BASE_URL}/images/generations`,
    });
  } catch (err) {
    console.error("image error:", err.message || err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Multimodal Inference demo listening on :${PORT}`);
  console.log(`Text model: ${TEXT_MODEL} | Image model: ${IMAGE_MODEL}`);
  console.log(`Both served from: ${BASE_URL}`);
});
