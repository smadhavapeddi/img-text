async function loadConfig() {
  try {
    const res = await fetch("/api/config");
    const cfg = await res.json();
    document.getElementById("endpoint-badge").textContent =
      `${cfg.baseUrl}  ·  text: ${cfg.textModel}  ·  image: ${cfg.imageModel}`;
  } catch {
    document.getElementById("endpoint-badge").textContent = "Could not load endpoint config.";
  }
}

const chatBtn = document.getElementById("chat-btn");
const chatOutput = document.getElementById("chat-output");
const chatMeta = document.getElementById("chat-meta");

chatBtn.addEventListener("click", async () => {
  const prompt = document.getElementById("chat-prompt").value.trim();
  if (!prompt) return;
  chatBtn.disabled = true;
  chatOutput.textContent = "Calling /v1/chat/completions…";
  chatMeta.textContent = "";
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    chatOutput.textContent = data.text;
    chatMeta.textContent = `model: ${data.model} · endpoint: ${data.endpoint} · tokens: ${data.usage?.total_tokens ?? "n/a"}`;
  } catch (err) {
    chatOutput.textContent = `Error: ${err.message}`;
  } finally {
    chatBtn.disabled = false;
  }
});

const imageBtn = document.getElementById("image-btn");
const imageOutput = document.getElementById("image-output");
const imageMeta = document.getElementById("image-meta");

imageBtn.addEventListener("click", async () => {
  const prompt = document.getElementById("image-prompt").value.trim();
  const size = document.getElementById("image-size").value;
  if (!prompt) return;
  imageBtn.disabled = true;
  imageOutput.textContent = "Calling /v1/images/generations… (can take a few seconds)";
  imageMeta.textContent = "";
  try {
    const res = await fetch("/api/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, size }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    imageOutput.innerHTML = "";
    const img = document.createElement("img");
    img.src = data.image;
    imageOutput.appendChild(img);
    imageMeta.textContent = `model: ${data.model} · endpoint: ${data.endpoint} · tokens: ${data.usage?.total_tokens ?? "n/a"}`;
  } catch (err) {
    imageOutput.textContent = `Error: ${err.message}`;
  } finally {
    imageBtn.disabled = false;
  }
});

loadConfig();
