// Rafeeq demo server.
// The camera page sends one frame + the current routine step; a vision model
// judges the step and writes a short coaching line.
//
// Default model: FREE and local through Ollama (no API key, no cost).
// Optional:      PROVIDER=claude (your own key, costs money)
// Testing only:  PROVIDER=mock   (no model; fake answers to try the app flow)
//
// Everything the parent sets up (child profile, routines, recorded voices,
// progress history) is saved on THIS computer in ./data. Nothing is uploaded.
import "dotenv/config";
import express from "express";
import fs from "node:fs";
import path from "node:path";

const app = express();
app.use(express.json({ limit: "12mb" }));
app.use(express.static("public"));

const PROVIDER = (process.env.PROVIDER || "ollama").toLowerCase();
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3:4b";
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

/* ------------------------------------------------------------------ */
/* Local store                                                         */
/* ------------------------------------------------------------------ */
const DATA_DIR = process.env.RAFEEQ_DATA || path.resolve("data");
const DB_FILE = path.join(DATA_DIR, "rafeeq.json");
const VOICE_DIR = path.join(DATA_DIR, "voices");
fs.mkdirSync(VOICE_DIR, { recursive: true });

// Fading rule. One place, so it is easy to read and to change.
const FADE = {
  levels: 3,            // 0 full guidance · 1 light hint · 2 silent unless stuck
  aloneStreakUp: 3,     // done alone on 3 mornings in a row -> less help
  hardHints: 3,         // 3 or more hints on one step = a hard morning for that step
};

const DEFAULT_ROUTINES = [
  { id: "teeth", icon: "🪥", name: "تفريش الأسنان", nameEn: "Brushing teeth", steps: [
    { ar: "يمسك فرشاة الأسنان", en: "Pick up the toothbrush" },
    { ar: "يحط معجون على الفرشاة", en: "Put toothpaste on the toothbrush" },
    { ar: "يفرش أسنانه", en: "Brush the teeth", seconds: 120 },
    { ar: "يرجع الفرشاة مكانها", en: "Put the toothbrush back" },
  ]},
  { id: "hands", icon: "🧼", name: "غسل اليدين", nameEn: "Washing hands", steps: [
    { ar: "يفتح الماي", en: "Turn on the tap" },
    { ar: "يحط صابون على يدينه", en: "Put soap on the hands" },
    { ar: "يفرك يدينه زين", en: "Rub the hands together well", seconds: 20 },
    { ar: "ينشف يدينه بالفوطة", en: "Dry the hands with a towel" },
  ]},
  { id: "bag", icon: "🎒", name: "تجهيز الشنطة", nameEn: "Packing the school bag", steps: [
    { ar: "يجيب الشنطة", en: "Get the school bag" },
    { ar: "يحط الدفاتر في الشنطة", en: "Put the notebooks in the bag" },
    { ar: "يحط المقلمة", en: "Put the pencil case in the bag" },
    { ar: "يسكر الشنطة", en: "Close the bag" },
  ]},
];

const DEFAULT_DB = {
  profile: {
    childName: "",
    language: "ar",        // ar = Kuwaiti Arabic · en = simple English
    simpleWords: false,    // even shorter lines (Down syndrome, little speech)
    quiet: false,          // no voice: lights and nods only
    reward: "",            // first-then: "first teeth, then <reward>"
    calmSound: "rain",     // rain · waves · hum · none
    noiseCheck: false,     // listen for loud noise and offer calm mode
    cameraOn: true,        // software camera switch (the device adds a physical cover)
    shareOk: false,        // parent allows exporting the weekly summary
    band: false,           // Rafeeq Band: a Bluetooth heart-rate band (optional)
    bandRest: 0,           // child's resting heart rate; 0 = learn it in the first minute
    bandRise: 20,          // % above resting that counts as "stress rising"
  },
  routines: DEFAULT_ROUTINES,
  levels: {},              // "routineId:stepIndex" -> { level, streak, manual }
  sessions: [],            // finished or stopped runs, newest last
  fadeLog: [],             // every automatic change, so parents can see and undo it
};

function loadDb() {
  try {
    const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    return { ...structuredCloneSafe(DEFAULT_DB), ...db, profile: { ...DEFAULT_DB.profile, ...(db.profile || {}) } };
  } catch {
    return structuredCloneSafe(DEFAULT_DB);
  }
}
function structuredCloneSafe(o) { return JSON.parse(JSON.stringify(o)); }
let db = loadDb();
function saveDb() {
  const tmp = DB_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

const key = (rid, i) => `${rid}:${i}`;
function levelOf(rid, i) { return db.levels[key(rid, i)]?.level ?? 0; }
function findRoutine(id) { return db.routines.find((r) => r.id === id); }

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */
function systemPrompt(p) {
  const lang = p.language === "en"
    ? `- Speak simple, warm English.`
    : `- Speak Kuwaiti Arabic dialect (لهجة كويتية), never formal Arabic.`;
  const len = p.simpleWords
    ? `- Keep "say" to 1 to 3 very simple words. One idea only.`
    : `- Keep "say" very short: at most 10 words, simple and kind.`;
  return `You are Rafeeq (رفيق), a warm, patient owl robot that coaches a child with autism, Down syndrome or ADHD through a daily routine.
You look at ONE camera frame and judge ONLY the current step.

Rules:
${lang}
${len}
- Never scold, never punish, never compare the child to others.
- hint_level controls how much you help:
  0 = full guidance (say exactly what to do),
  1 = light hint (a short nudge),
  2 = silent unless the child is stuck or off task (then "say" may be empty).
- If the step is done, celebrate briefly.
- If no person or object is visible, gently ask the child to come in front of Rafeeq.

Reply with ONLY this JSON, no other text:
{"status":"done|in_progress|off_task|not_visible","say":"<line or empty>","reason":"<5-word English note for the parent log>"}`;
}

async function askOllama(system, base64, userText) {
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
        { role: "system", content: system },
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
async function askClaude(system, base64, userText) {
  if (!claude) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("PROVIDER=claude needs ANTHROPIC_API_KEY in .env");
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    claude = new Anthropic();
  }
  const msg = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 200,
    system,
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

// Test mode only: no model, scripted answers, so the app flow can be tried
// without Ollama. Never used unless PROVIDER=mock.
const mockCount = {};
function askMock(_s, _b, userText, p) {
  const k = userText.slice(0, 60);
  mockCount[k] = (mockCount[k] || 0) + 1;
  const n = mockCount[k];
  const lvl = Number((userText.match(/hint_level: (\d)/) || [])[1] || 0);
  const en = p.language === "en";
  if (n >= 2) return JSON.stringify({ status: "done", say: en ? "Great job!" : "شاطر!", reason: "mock: step done" });
  const say = lvl >= 2 ? "" : en ? (p.simpleWords ? "Brush now" : "Keep going, you can do it") : (p.simpleWords ? "يلا" : "يلا، كمّل وأنا معاك");
  return JSON.stringify({ status: "in_progress", say, reason: "mock: in progress" });
}

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */
app.get("/api/state", (_req, res) => {
  res.json({
    provider: PROVIDER === "claude" ? CLAUDE_MODEL : PROVIDER === "mock" ? "mock (test mode)" : "ollama/" + OLLAMA_MODEL,
    profile: db.profile,
    routines: db.routines.map((r) => ({
      ...r,
      steps: r.steps.map((s, i) => ({
        ...s,
        level: levelOf(r.id, i),
        manual: !!db.levels[key(r.id, i)]?.manual,
        streak: db.levels[key(r.id, i)]?.streak || 0,
        voice: fs.existsSync(path.join(VOICE_DIR, voiceFile(r.id, i))),
      })),
    })),
    fade: FADE,
    fadeLog: db.fadeLog.slice(-50),
    sessions: db.sessions.slice(-30),
  });
});

app.put("/api/profile", (req, res) => {
  const allowed = Object.keys(DEFAULT_DB.profile);
  for (const k of allowed) if (k in (req.body || {})) db.profile[k] = req.body[k];
  db.profile.childName = String(db.profile.childName || "").slice(0, 40);
  db.profile.reward = String(db.profile.reward || "").slice(0, 60);
  db.profile.bandRest = Math.max(0, Math.min(180, Math.round(Number(db.profile.bandRest) || 0)));
  db.profile.bandRise = Math.max(10, Math.min(60, Math.round(Number(db.profile.bandRise) || 20)));
  saveDb();
  res.json(db.profile);
});

/* Routine builder */
function cleanRoutine(body, id) {
  const steps = (Array.isArray(body.steps) ? body.steps : [])
    .map((s) => ({
      ar: String(s.ar || "").trim().slice(0, 80),
      en: String(s.en || s.ar || "").trim().slice(0, 120),
      ...(Number(s.seconds) > 0 ? { seconds: Math.min(600, Math.round(Number(s.seconds))) } : {}),
    }))
    .filter((s) => s.ar)
    .slice(0, 12);
  return {
    id,
    icon: String(body.icon || "⭐").slice(0, 4),
    name: String(body.name || "روتين").trim().slice(0, 40),
    nameEn: String(body.nameEn || body.name || "Routine").trim().slice(0, 60),
    steps,
  };
}
app.post("/api/routines", (req, res) => {
  const id = "r" + Date.now().toString(36);
  const r = cleanRoutine(req.body || {}, id);
  if (!r.steps.length) return res.status(400).json({ error: "add at least one step" });
  db.routines.push(r);
  saveDb();
  res.json(r);
});
app.put("/api/routines/:id", (req, res) => {
  const i = db.routines.findIndex((r) => r.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: "no such routine" });
  const r = cleanRoutine(req.body || {}, req.params.id);
  if (!r.steps.length) return res.status(400).json({ error: "add at least one step" });
  db.routines[i] = r;
  // steps may have moved: drop levels past the new length
  for (const k of Object.keys(db.levels)) {
    const [rid, idx] = k.split(":");
    if (rid === r.id && Number(idx) >= r.steps.length) delete db.levels[k];
  }
  saveDb();
  res.json(r);
});
app.delete("/api/routines/:id", (req, res) => {
  db.routines = db.routines.filter((r) => r.id !== req.params.id);
  for (const k of Object.keys(db.levels)) if (k.startsWith(req.params.id + ":")) delete db.levels[k];
  saveDb();
  res.json({ ok: true });
});

/* Manual help level (parents can override or undo any automatic change) */
app.put("/api/levels/:rid/:i", (req, res) => {
  const { rid, i } = req.params;
  const k = key(rid, i);
  if (req.body?.auto) {
    db.levels[k] = { ...(db.levels[k] || { level: 0, streak: 0 }), manual: false };
  } else {
    const level = Math.max(0, Math.min(FADE.levels - 1, Number(req.body?.level) || 0));
    db.levels[k] = { level, streak: 0, manual: true };
    db.fadeLog.push({ t: Date.now(), routine: rid, step: Number(i), from: null, to: level, why: "parent set it" });
  }
  saveDb();
  res.json(db.levels[k]);
});

/* Parent's own voice, one short recording per step */
function voiceFile(rid, i) { return `${rid.replace(/[^a-z0-9]/gi, "")}-${Number(i)}.webm`; }
app.post("/api/voice/:rid/:i", (req, res) => {
  const m = String(req.body?.audio || "").match(/^data:audio\/[\w.+-]+(;codecs=[\w.,-]+)?;base64,(.+)$/);
  if (!m) return res.status(400).json({ error: "send audio as a data URL" });
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > 3_000_000) return res.status(413).json({ error: "keep it under 30 seconds" });
  fs.writeFileSync(path.join(VOICE_DIR, voiceFile(req.params.rid, req.params.i)), buf);
  res.json({ ok: true });
});
app.get("/api/voice/:rid/:i", (req, res) => {
  const f = path.join(VOICE_DIR, voiceFile(req.params.rid, req.params.i));
  if (!fs.existsSync(f)) return res.status(404).end();
  res.type("audio/webm").sendFile(f);
});
app.delete("/api/voice/:rid/:i", (req, res) => {
  const f = path.join(VOICE_DIR, voiceFile(req.params.rid, req.params.i));
  if (fs.existsSync(f)) fs.unlinkSync(f);
  res.json({ ok: true });
});

/* Coaching: one frame, one step */
app.post("/api/coach", async (req, res) => {
  try {
    if (!db.profile.cameraOn) return res.status(423).json({ error: "camera is switched off in the parent app" });
    const { image, routineId, stepIndex } = req.body || {};
    const r = findRoutine(routineId);
    const step = r?.steps[stepIndex];
    if (!image || !step) return res.status(400).json({ error: "image, routineId and stepIndex are required" });

    const p = db.profile;
    const hintLevel = levelOf(r.id, stepIndex);
    const next = r.steps[stepIndex + 1];
    const base64 = image.replace(/^data:image\/\w+;base64,/, "");
    const userText =
      `Current step: "${step.en}".` +
      (next ? ` Next step after this: "${next.en}".` : " This is the last step.") +
      ` hint_level: ${hintLevel}.` +
      (p.childName ? ` The child's name is ${p.childName}.` : "");
    const system = systemPrompt(p);

    const text = PROVIDER === "claude" ? await askClaude(system, base64, userText)
      : PROVIDER === "mock" ? askMock(system, base64, userText, p)
      : await askOllama(system, base64, userText);
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(502).json({ error: "no JSON from model", raw: text });
    const out = JSON.parse(match[0]);
    const status = ["done", "in_progress", "off_task", "not_visible"].includes(out.status) ? out.status : "in_progress";
    res.json({ status, say: typeof out.say === "string" ? out.say : "", reason: out.reason || "", hintLevel });
  } catch (err) {
    console.error(err.message || err);
    res.status(500).json({ error: err.message || "coach failed" });
  }
});

/* End of a run: save it and apply the fading rule, step by step */
app.post("/api/session", (req, res) => {
  const b = req.body || {};
  const r = findRoutine(b.routineId);
  if (!r) return res.status(400).json({ error: "unknown routine" });
  const steps = (Array.isArray(b.steps) ? b.steps : []).slice(0, r.steps.length).map((s, i) => ({
    i,
    done: !!s.done,
    hints: Math.max(0, Number(s.hints) || 0),
    offTask: Math.max(0, Number(s.offTask) || 0),
  }));
  const session = {
    t: Date.now(),
    routine: r.id,
    finished: steps.length === r.steps.length && steps.every((s) => s.done),
    minutes: Math.max(0, Math.round(Number(b.seconds || 0) / 6) / 10),
    calmDowns: Math.max(0, Number(b.calmDowns) || 0),
    bandAlerts: Math.max(0, Number(b.bandAlerts) || 0),
    hrRest: Math.max(0, Number(b.hrRest) || 0),
    hrMax: Math.max(0, Number(b.hrMax) || 0),
    steps,
  };
  db.sessions.push(session);
  if (db.sessions.length > 500) db.sessions = db.sessions.slice(-500);

  const changes = [];
  for (const s of steps) {
    const k = key(r.id, s.i);
    const cur = db.levels[k] || { level: 0, streak: 0, manual: false };
    if (cur.manual) continue; // parent chose this level: leave it alone
    const alone = s.done && s.hints === 0 && s.offTask === 0;
    const hard = !s.done || s.hints >= FADE.hardHints;
    let { level, streak } = cur;
    const from = level;
    if (alone) {
      streak += 1;
      if (streak >= FADE.aloneStreakUp && level < FADE.levels - 1) { level += 1; streak = 0; }
    } else {
      streak = 0;
      if (hard && level > 0) level -= 1;
    }
    db.levels[k] = { level, streak, manual: false };
    if (level !== from) {
      const why = level > from ? `done alone ${FADE.aloneStreakUp} times in a row` : "a hard morning";
      const change = { t: session.t, routine: r.id, step: s.i, from, to: level, why };
      db.fadeLog.push(change);
      changes.push(change);
    }
  }
  if (db.fadeLog.length > 500) db.fadeLog = db.fadeLog.slice(-500);
  saveDb();
  res.json({ session, changes });
});

/* Weekly summary: text only, no pictures. Shared only if the parent allows. */
function summary(days) {
  const since = Date.now() - days * 864e5;
  const ss = db.sessions.filter((s) => s.t >= since);
  return db.routines.map((r) => {
    const runs = ss.filter((s) => s.routine === r.id);
    return {
      routine: r.name, routineEn: r.nameEn, runs: runs.length,
      finished: runs.filter((s) => s.finished).length,
      calmDowns: runs.reduce((n, s) => n + (s.calmDowns || 0), 0),
      bandAlerts: runs.reduce((n, s) => n + (s.bandAlerts || 0), 0),
      steps: r.steps.map((st, i) => {
        const tries = runs.map((s) => s.steps[i]).filter(Boolean);
        return {
          ar: st.ar, en: st.en,
          alone: tries.filter((x) => x.done && !x.hints && !x.offTask).length,
          tries: tries.length,
          level: levelOf(r.id, i),
        };
      }),
      changes: db.fadeLog.filter((c) => c.routine === r.id && c.t >= since),
    };
  }).filter((x) => x.runs > 0);
}
app.get("/api/summary", (req, res) => {
  const days = Math.max(1, Math.min(31, Number(req.query.days) || 7));
  res.json({ days, child: db.profile.childName, shareOk: db.profile.shareOk, routines: summary(days) });
});
const LV = ["Full guidance", "Light hint", "Silent unless stuck"];
const LV_AR = ["توجيه كامل", "تلميح خفيف", "ساكت إلا إذا احتاج"];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
app.get("/summary.html", (req, res) => {
  if (!db.profile.shareOk) return res.status(403).type("html").send(`<meta charset="utf-8"><body style="font-family:sans-serif;padding:40px">Sharing is off. The parent can turn on "Allow sharing the weekly summary" in the parent app.<br><br>المشاركة مقفلة. الأهل يقدرون يفعّلونها من تطبيق الأهل.</body>`);
  const days = Math.max(1, Math.min(31, Number(req.query.days) || 7));
  const rs = summary(days);
  const name = esc(db.profile.childName || "—");
  const body = rs.length ? rs.map((r) => `
    <h2>${esc(r.routine)} · ${esc(r.routineEn)}</h2>
    <p>${r.runs} runs · ${r.finished} finished · ${r.calmDowns} calm-downs${r.bandAlerts ? ` · ${r.bandAlerts} early warnings from the band` : ""}</p>
    <table><tr><th>Step · الخطوة</th><th>Done alone</th><th>Help now</th></tr>
    ${r.steps.map((s) => `<tr><td>${esc(s.ar)}<br><small>${esc(s.en)}</small></td><td>${s.alone} / ${s.tries}</td><td>${LV[s.level]}<br><small>${LV_AR[s.level]}</small></td></tr>`).join("")}
    </table>
    ${r.changes.length ? `<p><b>Changes this week:</b> ${r.changes.map((c) => `step ${c.step + 1}: ${LV[c.from] || "?"} → ${LV[c.to]} (${esc(c.why)})`).join("; ")}</p>` : ""}`).join("")
    : "<p>No routines this week yet.</p>";
  res.type("html").send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rafeeq weekly summary</title>
<style>body{font-family:system-ui,sans-serif;max-width:760px;margin:auto;padding:32px;color:#14213D}h1{margin:0}table{border-collapse:collapse;width:100%;margin:8px 0 18px}th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left;vertical-align:top}small{color:#5B6478}.note{color:#5B6478;font-size:14px;border-top:1px solid #ddd;padding-top:12px;margin-top:28px}@media print{button{display:none}}</style></head>
<body><h1>Rafeeq weekly summary</h1><p>Child: <b>${name}</b> · last ${days} days · ${new Date().toLocaleDateString("en-GB")}</p>
<button onclick="print()">Print or save as PDF</button>${body}
<p class="note">Text only. Rafeeq never records or stores pictures. Shared by the child's parent. · ملخص مكتوب فقط. رفيق ما يسجّل ولا يحفظ صور.</p></body></html>`);
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () =>
  console.log(`Rafeeq demo running at http://localhost:${port}  · parent app: /parent.html  (model: ${PROVIDER === "claude" ? CLAUDE_MODEL : PROVIDER === "mock" ? "mock, test mode" : "ollama/" + OLLAMA_MODEL})`)
);
