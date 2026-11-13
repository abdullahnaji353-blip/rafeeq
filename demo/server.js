// Rafeeq demo server: receives a camera frame + the current routine step,
// asks a vision model whether the step is done, and returns a short coaching
// line in Kuwaiti Arabic.
//
// Default: a FREE local model through Ollama (no API key, no cost).
// Optional: PROVIDER=claude uses Claude Opus 5.5 (needs your own key, costs money).
import "dotenv/config";
import express from "express";

const app = express();
app.use(express.json({ limit: "8mb" }));
app.use(express.static("public"));

const PROVIDER = (process.env.PROVIDER || "ollama").toLowerCase();
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3:4b";
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

const SYSTEM = `You are Rafeeq (رفيق), a warm, patient owl robot that coaches a child with autism or Down syndrome through a daily routine.
You look at ONE camera frame and judge ONLY the current step.

Rules:
- Speak Kuwaiti Arabic dialect (لهجة كويتية), never formal Arabic.
- Keep "say" very short: at most 10 words, simple and kind. Never scold.
- hint_level controls how much you help:
  0 = full guidance (say exactly what to do),
  1 = light hint (a short nudge),
  2 = silent unless the child is stuck or off task (then "say" may be empty).
- If the step is done, celebrate briefly (e.g. "شاطر" / "عفية عليك").
- If no person or object is visible, gently ask the child to come in front of Rafeeq.

Reply with ONLY this JSON, no other text:
{"status":"done|in_progress|off_task|not_visible","say":"<Kuwaiti Arabic line or empty>","reason":"<5-word English note for the parent log>"}`;

async function askOllama(base64, userText) {
  const r = await fetch(`${OLLAMA_URL}/api/chat`, {
    signal: AbortSignal.timeout(60000),
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: "json",
      options: { temperature: 0.3 },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userText, images: [base64] },
      ],
    }),
  }).catch((e) => {
    throw new Error(`Can't reach Ollama at ${OLLAMA_URL}. Is Ollama running, and did you run "ollama pull ${OLLAMA_MODEL}"? (${e.message})`);
  });
  if (!r.ok) throw new Error(`Ollama ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return data.message?.content || "";
}

let claude = null;
async function askClaude(base64, userText) {
  if (!claude) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("PROVIDER=claude needs ANTHROPIC_API_KEY in .env");
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    claude = new Anthropic();
  }
  const msg = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 200,
    system: SYSTEM,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
        { type: "text", text: userText },
      ],
    }],
  });
  return msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
}

app.post("/api/coach", async (req, res) => {
  try {
    const { image, step, nextStep, hintLevel = 0, childName = "" } = req.body || {};
    if (!image || !step) return res.status(400).json({ error: "image and step are required" });

    const base64 = image.replace(/^data:image\/\w+;base64,/, "");
    const userText =
      `Current step: "${step}".` +
      (nextStep ? ` Next step after this: "${nextStep}".` : " This is the last step.") +
      ` hint_level: ${hintLevel}.` +
      (childName ? ` The child's name is ${childName}.` : "");

    const text = PROVIDER === "claude" ? await askClaude(base64, userText) : await askOllama(base64, userText);
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(502).json({ error: "no JSON from model", raw: text });
    const out = JSON.parse(match[0]);
    res.json({
      status: out.status || "in_progress",
      say: typeof out.say === "string" ? out.say : "",
      reason: out.reason || "",
    });
  } catch (err) {
    console.error(err.message || err);
    res.status(500).json({ error: err.message || "coach failed" });
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () =>
  console.log(`Rafeeq demo running at http://localhost:${port}  (model: ${PROVIDER === "claude" ? CLAUDE_MODEL : "ollama/" + OLLAMA_MODEL})`)
);
