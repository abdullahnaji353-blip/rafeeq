# Rafeeq (رفيق) 🦉
### The AI buddy that teaches kids to *not need it*

**Rafeeq** is a small, owl-shaped AI robot that helps children with **autism, Down syndrome and ADHD** do their daily routines (brushing teeth, washing hands, getting ready for school) **on their own**. It watches the routine through a camera, coaches each step in **Kuwaiti Arabic**, calms the child down *before* a meltdown builds, and gives **less help every week** until the child no longer needs it.

> **ATSN26 Gen-AI & Software Innovation Competition (Kuwait)**
> Primary track: Cognitive & Learning · Secondary track: Multiple disabilities & Arabic AI

| | |
|---|---|
| 🌐 **Live website (interactive simulation)** | **https://abdullahnaji353-blip.github.io/rafeeq/** |
| 🎬 **Prototype video (1 min)** | [`docs/rafeeq-prototype-video.mp4`](docs/rafeeq-prototype-video.mp4) (also embedded on the website) |
| 📱 **Working camera demo (real AI)** | [`demo/`](demo) |
| 📲 **QR code** | <img src="docs/rafeeq-qr.png" width="140" alt="QR code to the Rafeeq website"> |
| 🧠 **AI model** | **Gemma 3 (4B)** run locally with **Ollama**: offline, free, private |

---

## Table of contents
1. [The problem](#1-the-problem)
2. [The idea: what Rafeeq does](#2-the-idea-what-rafeeq-does)
3. [The website: a full guide](#3-the-website-a-full-guide)
4. [How the simulation works (step by step)](#4-how-the-simulation-works-step-by-step)
5. [How the real AI works](#5-how-the-real-ai-works)
6. [Rafeeq's voice](#6-rafeeqs-voice)
7. [Hardware](#7-hardware)
8. [The working camera demo](#8-the-working-camera-demo)
9. [Privacy and safety](#9-privacy-and-safety)
10. [How Rafeeq meets the judging criteria](#10-how-rafeeq-meets-the-judging-criteria)
11. [Repository structure](#11-repository-structure)
12. [Publishing the website (GitHub Pages)](#12-publishing-the-website-github-pages)
13. [Honest limitations and next steps](#13-honest-limitations-and-next-steps)
14. [Team](#14-team)

---

## 1. The problem
Children with autism, Down syndrome and ADHD often struggle with everyday living skills such as brushing teeth, washing hands, getting dressed and packing a school bag. Today, families mostly use:

- **Picture charts on the wall.** They can't see the child, so they don't know if a step was skipped, if the child is stuck, or if the child is getting overwhelmed.
- **A parent standing beside the child at every step, every morning.** The child learns to wait for the parent's prompt instead of doing the task alone (this is called *prompt dependency*).
- **Generic apps.** Most are English-first, live on a screen, and don't speak Gulf Arabic or adapt to one specific child in the moment.

**The need in Kuwait and the Gulf:**
| | |
|---|---|
| **30+** | autism diagnoses per 10,000 children in Kuwait (true numbers are likely higher) |
| **1 vs 5.4** | psychologists per 100,000 people in our region vs Europe |
| **up to 8,000 AED/SAR a month** | what diagnostics and therapy can cost Gulf families |
| **Assessment & diagnosis only** | what GCC public health services cover; daily-routine support falls on parents at home |

*Source: PwC Middle East, "[Elevating autism care in the GCC for meaningful change](https://www.pwc.com/m1/en/publications/documents/2024/elevating-autism-care-in-the-gcc-for-meaningful-change.pdf)" (2024), citing the WHO Mental Health Atlas 2020.*

**The gap:** nothing on the market *sees* the routine, *adapts* in real time, speaks the child's own dialect, and is designed to **step back** over time.

## 2. The idea: what Rafeeq does
Rafeeq sits where the routine happens, on the bathroom counter or the bedroom desk. It has five core abilities:

| Ability | What it means for the child |
|---|---|
| 👁️ **Sees the routine** | A camera checks each step: done, in progress, stuck, or off task. |
| 🗣️ **Coaches in Kuwaiti Arabic** | Short, kind, spoken prompts like "يلا يوسف، امسك الفرشاة" (come on Yousef, pick up the toothbrush). |
| 🫧 **Calm mode** | Spots early signs of sensory overload (hands on ears, rocking, raised voice) and switches to a soft voice, dim blue eyes and a breathing game *before* a meltdown. |
| 📉 **Fading hints** | Week 1: full sentences. Week 2: just the key word. Week 3: a one-word nudge. Week 4: silent unless the child gets stuck. |
| 📱 **Parent reports** | The parent's phone gets a simple Arabic summary, e.g. "Completed the morning routine alone 4 of 5 days". |

**Rafeeq's goal is to make itself unnecessary.** Success means the child does the routine without Rafeeq.

---

## 3. The website: a full guide
**Link:** https://abdullahnaji353-blip.github.io/rafeeq/

The website is the main thing judges can try. It is one self-contained page (`docs/index.html`) with **no server and no API calls**, so it works on any phone or laptop browser, even offline once loaded.

### 3.1 Design
- **Dark, premium "tech launch" look** with Rafeeq's orange and teal glow.
- **Full Arabic / English switch** (top-right **EN | عربي** button). The whole site flips to right-to-left Arabic. The choice is remembered in the browser.
- **Fully responsive**: works on phones, tablets and laptops.
- Characters and rooms are drawn in code (SVG with gradients and lighting), so the page is light and loads fast.

### 3.2 Sections (top to bottom)
| Section | What it shows |
|---|---|
| **Hero** | The headline, a floating, blinking Rafeeq, and buttons to play the simulation or watch the video. |
| **The problem** | Three short tiles: charts are blind, parents become the prompt, no Gulf Arabic. |
| **Interactive simulation** | The main feature (explained in detail below). |
| **How it works** | Four steps (See → Think → Coach → Step back) and a "Gemma 3 · 4B via Ollama" panel. |
| **Hardware** | An interactive owl: tap numbers 1–6 to see each part. |
| **Prototype video** | The 1-minute story of Yousef's morning. |
| **The goal** | "Rafeeq wins when it's not needed." |

### 3.3 The simulation screen
**You play the child. Rafeeq reacts.**

**The stage (the scene):**
- A bathroom (teeth, hands) or a bedroom (school bag), with Yousef (the child) and Rafeeq on the counter or desk.
- **Speech bubble**: what Rafeeq says, in Arabic with English underneath, typed out live.
- **Gemma vision box**: a teal box tracks Yousef with a label like `gemma3 · brushing · done 0.93`, showing what the AI "sees". It turns **orange** when something is wrong (stuck, distracted, overloaded).
- **Top-left**: Rafeeq's current mode (Coaching / Overload! / Calm mode / Done) with a colored dot, and the current week.
- **Top-right**: ⭐ stars = steps the child did **alone**.
- **Bottom-center**: step tracker. ★ gold = done alone, ✓ teal = done with help, orange ring = current step.
- **Bottom-right**: stress meter (green → orange → red).

**The controls:**
| Control | What it does |
|---|---|
| **Routine** (🪥 Teeth · 🧼 Hands · 🎒 Bag) | Picks the routine and the room. Each routine has 4 steps. |
| **Week with Rafeeq** (W1–W4) | Sets how much help Rafeeq gives (Full / Light / Nudge / Silent). The small bars show the help level. |
| **▶ Start** | Starts the routine. |
| **🎬 Demo** | Plays a scripted run automatically, including a calm-mode moment, so judges can just watch. |
| **🔊 / 🔈** | Turns Rafeeq's voice and sound effects on or off (on by default). |

**Act like the child** (buttons, or keyboard keys **1–4**):
| Button | Key | What happens |
|---|---|---|
| ✅ **Do it** | 1 | The child finishes the step. Stars burst out, Yousef jumps, Rafeeq hops with happy eyes and cheers. |
| 🤔 **Stuck** | 2 | Rafeeq tilts its head with a "?" and gives the **full hint**, whatever the week. |
| 🙈 **Distracted** | 3 | Rafeeq turns its head toward the child and gives a gentle "Yousef, I'm here, let's keep going". |
| 😣 **Too loud!** | 4 | Sensory overload: the screen shakes, stress climbs, then **calm mode** starts (see below). |

**The parent phone (right side):** shows what the parent would receive, live: a progress ring and a timeline such as "Pick up toothbrush · alone ⭐" or "Calm in 9s". When the routine ends it shows the summary.

**Results screen:** after the last step, confetti, then a card with stars, steps done alone, hints given and calm-downs. If you played Week 1–3, it offers **"▶ Week 4"** so you can see Rafeeq stay quiet while the child earns all the stars. That is the whole idea of Rafeeq in one click.

**"Show Gemma's raw output"** (under the buttons): opens a log of the simulated JSON the AI would produce, e.g.
`{"model":"gemma3:4b","step":"Brush up & down","status":"done","confidence":0.94,"say":"ممتاز!","latency_ms":1180}`

> ⚠️ **Important:** the website is a **simulation**. Rafeeq's reactions there are **scripted** to show how the real system behaves. The real AI runs in the [camera demo](#8-the-working-camera-demo). The page says this in its footer.

---

## 4. How the simulation works (step by step)
This is the logic coded into `docs/index.html`.

### 4.1 A normal step
1. Rafeeq's eyes glow **teal** (coaching mode).
2. Depending on the week, Rafeeq says:
   - **Week 1, full:** "الحين حط شوية معجون" (now put a little toothpaste on)
   - **Week 2, light:** "والمعجون؟" (and the toothpaste?)
   - **Week 3, nudge:** "معجون" (toothpaste)
   - **Week 4, silent:** nothing, just watches
3. When the child does the step, Rafeeq cheers ("شاطر!", "عفية عليك!", "ممتاز!", "برافو يوسف!").
4. **Done alone vs with help:** a step counts as *alone* (⭐) only if it is Week 2 or later **and** the child wasn't stuck, distracted or calmed down on that step. In Week 1 Rafeeq always guides, so every step counts as "with help".

### 4.2 Fading help (the core idea)
| Week | Help level | Example | Bar |
|---|---|---|---|
| 1 | Full sentence | "يلا يوسف، امسك الفرشاة" | 100% |
| 2 | Key word | "الفرشاة؟" | ~60% |
| 3 | One-word nudge | "يوسف…" | ~30% |
| 4 | Silent unless stuck | (nothing) | ~5% |

If the child gets **stuck**, Rafeeq jumps back to the **full hint for that step only**, then returns to the faded level on the next step. In real life this is called *prompt fading with error correction*, a common approach in special-education therapy.

### 4.3 Calm mode (sensory overload)
1. The child presses **Too loud!** → Yousef covers his ears and rocks, red sound waves appear, the screen shakes, and stress climbs to about 88%.
2. The vision box turns orange: `hands_on_ears · stress ↑` → `overload 0.88 → calm`.
3. **Calm mode starts:** the scene turns soft blue, Rafeeq's eyes go dim blue and half-closed, a breathing circle grows and shrinks ("Breathe in / Breathe out"), bubbles float up, and Rafeeq softly says "خذ نفس عميق معاي…" (take a deep breath with me).
4. Stress drops over about 6 seconds, Yousef lowers his hands, and Rafeeq says "خلنا نكمل، خطوة صغيرة بس" (let's keep going, just one small step) and repeats the step.
5. The parent phone logs "Calm in Xs".

During calm mode the child buttons are paused, because Rafeeq waits until the child is calm before continuing.

---

## 5. How the real AI works
Generative AI is the core of Rafeeq. Everything runs **on the device, offline**, using **Gemma 3 (4B)**, Google's open vision-language model, served locally by **[Ollama](https://ollama.com)**:

```
ollama run gemma3:4b
```

**The loop, repeated every few seconds:**
```
Camera frame ──► Gemma 3 (vision): "is step 2 done, in progress, stuck, or off task?"
                       │
                       ▼
            Routine planner: current step + child's week + what helped last time
                       │
                       ▼
            Gemma 3 (language): writes ONE short, kind line in Kuwaiti Arabic,
                                matched to the hint level
                       │
                       ▼
            Speaker: Gulf-Arabic voice ──► child      Parent app ◄── short log
```

| Part | Technology | Why |
|---|---|---|
| **See the task** | Gemma 3 4B (vision) via Ollama | Open model that understands images, runs on small hardware |
| **Plan and coach** | Gemma 3 writes the prompt in Kuwaiti Arabic | Every line is fresh and personal, not a fixed recording |
| **Listen** | Whisper, running locally | The child can answer Rafeeq |
| **Speak** | Gulf-Arabic voice | Sounds like family, not a robot |
| **Calm mode** | Light on-device stress classifier (voice + movement) | Fast enough to react before a meltdown |
| **Independence** | Prompt-fading algorithm | Less help each week; resets per step only when needed |

**Why a local open model instead of a cloud API?**
- 📴 **Works offline.** No internet, no outages.
- 💸 **$0 per month.** No API bills for families.
- 🏠 **Video never leaves the home.** This matters for children.
- 🔓 **Open model.** Can be upgraded or fine-tuned on Gulf-Arabic coaching data later.

---

## 6. Rafeeq's voice
The simulation uses a **real recorded Kuwaiti/Gulf-Arabic voice**, not the robotic built-in browser voice.

- **Voice:** "Ahmed", a natural Kuwaiti male voice from **ElevenLabs** (model `eleven_v3`), directed to sound warm and gentle, like speaking kindly to a young child.
- **46 lines recorded in one take:** the greeting, 4 steps × 3 hint levels × 3 routines (36 lines), 4 cheers, 2 "come back" nudges, calm mode, resume, and the finish line.
- **How it was cut:** the take was transcribed with ElevenLabs Scribe to get word-level timings, then cut at the quietest point between lines, trimmed, faded and loudness-normalized.
- **One small file:** all 46 clips are packed into [`docs/voice/rafeeq-voice.webm`](docs/voice) (Opus, ~75 KB, ~60 s). The website stores the start time and length of each line and plays just that slice with the Web Audio API. It loads once and works offline.
- **Fallback:** if a browser can't play the file (e.g. iPhones older than iOS 17), the site falls back to the device's built-in Arabic voice.

> In the real product, Rafeeq's lines are written live by Gemma, so the voice would come from a local Gulf-Arabic text-to-speech model. The recordings show judges what Rafeeq should *sound* like.

---

## 7. Hardware
Small, soft, and built from cheap, easy-to-find parts:

| # | Part | Job |
|---|---|---|
| 1 | **ESP32-S3 camera board** | Sees the routine; sends frames to the hub, which deletes them after analysis |
| 2 | **LED eyes** | Show Rafeeq's mood: teal = coaching, orange = alert, blue = calm, gold = celebrating |
| 3 | **Speaker + microphone** | Talks in a soft voice and hears the child |
| 4 | **2 servos** | Turn and tilt the head, so Rafeeq can look at the child and nod |
| 5 | **3D-printed owl body** | Rounded and friendly, no sharp edges; printable at a school makerspace |
| 6 | **Raspberry Pi 5 hub** (in the base) | Runs Ollama + Gemma 3, Whisper and the voice, so the AI works with no internet |

### Cost to build (estimates, Nov 2026)
| Part | Approx. price |
|---|---|
| Raspberry Pi 5 · 8 GB (AI hub) | 40 KD ($130) |
| ESP32-S3 camera board (Seeed XIAO ESP32S3 Sense) | 4.5 KD ($14) |
| Power supply + SD card | 7 KD ($22) |
| Servos, speaker, mic, LEDs | 8.5 KD ($28) |
| 3D-printed shell, wires | 5 KD ($16) |
| **Total** | **≈ 65 KD ($210)** |

Running the AI on the family's home computer instead of the Pi brings parts to about **25 KD**. Running costs are **$0**: open model, no subscription, no API bills. Less than one month of private therapy in the Gulf.

*Pi 5 price reflects the 2026 memory-driven price rises ([Tom's Hardware](https://www.tomshardware.com/raspberry-pi/component-shortages-drive-raspberry-pi-prices-up-by-up-to-23-percent-escalating-lpddr4-lpddr5-costs-trigger-the-third-price-hike-of-the-year)); 1 USD ≈ 0.307 KD.*

**Why the Pi?** The ESP32 camera board is far too weak to run Gemma. The Pi 5 can run Gemma 3 4B, but expect **a few seconds per frame**. That is fine for routines, because each step takes many seconds. The hub can be upgraded, or Ollama can run on the family's home computer.

---

## 8. The working camera demo
[`demo/`](demo) is a real, working slice of Rafeeq that uses the **actual AI** (not scripted):

1. Pick a routine (teeth, hands, school bag) and a hint level.
2. Every 3 seconds the browser sends one camera frame to your own computer.
3. **Gemma 3 via Ollama** judges the step (`done / in_progress / off_task / not_visible`) and writes a short Kuwaiti-Arabic line.
4. The phone speaks the line, ticks off finished steps and shows a parent report at the end.

**Run it (free):**
```bash
# 1. Install Node.js 18+ and Ollama (https://ollama.com/download)
ollama pull gemma3:4b      # one time, ~3 GB
cd demo
npm install
npm start                  # then open http://localhost:3000
```
To use it on a phone (cameras need https), run `npx cloudflared tunnel --url http://localhost:3000` and open the `https://…trycloudflare.com` link. Full details are in [`demo/README.md`](demo/README.md).

- **No API key is needed** and none is stored in this repo. `.env` is git-ignored.
- An optional paid cloud model can be switched on in `.env`, but the default is the free local model.

---

## 9. Privacy and safety
- **No video is stored.** Frames are analyzed, then deleted.
- **No cloud.** The AI runs inside Rafeeq (or on the family's own computer).
- **Parents control everything:** which routines, which steps, and all data.
- **Kind by design.** Rafeeq never scolds; prompts are short and positive.
- **Calm mode acts early**, before distress builds.
- **Not a medical device.** Rafeeq supports routines and is meant to work alongside families and therapists, not replace them.

---

## 10. How Rafeeq meets the judging criteria
| Criterion | How Rafeeq answers it |
|---|---|
| **Accessibility & autonomy impact** | Built to make the child independent: help fades until the child does the routine alone. Calm mode reduces distress. Parents get their mornings back. |
| **Gen-AI innovation** | An open vision-language model (Gemma 3) understands real routines from a camera and writes personalized Arabic coaching on the device. |
| **Usability (UI/UX)** | No screen for the child, just a friendly voice and glowing eyes. Parents get a simple Arabic report. The website lets anyone try the experience in seconds. |
| **Technical feasibility** | Off-the-shelf parts (ESP32, Raspberry Pi 5, servos, 3D print), a free open model with no API costs, and a working demo in this repo. |
| **Arabic support** | Kuwaiti Arabic from day one: coaching lines, a recorded Gulf-Arabic voice, and a fully Arabic (RTL) website. |

---

## 11. Repository structure
```
rafeeq/
├── README.md                      ← this file
├── docs/                          ← the WEBSITE (served by GitHub Pages)
│   ├── index.html                 ← the whole site: design, simulation, Arabic/English text, all logic
│   ├── rafeeq-prototype-video.mp4 ← 1-minute prototype story video (embedded on the site)
│   ├── rafeeq-qr.png              ← QR code to the live website
│   └── voice/
│       └── rafeeq-voice.webm      ← 46 recorded Gulf-Arabic lines packed in one file
└── demo/                          ← the WORKING CAMERA DEMO (real AI, runs locally)
    ├── server.js                  ← Node/Express server: sends frames to Gemma 3 via Ollama
    ├── public/index.html          ← phone/browser app: camera, routine steps, speech, report
    ├── package.json               ← dependencies
    ├── .env.example               ← settings template (model name, optional provider)
    └── README.md                  ← how to run the demo
```

**Inside `docs/index.html`** (for anyone editing the site):
| Part | What it is |
|---|---|
| `<style>` | All the design: colors, layout, animations, mobile and RTL rules |
| `L = {en, ar}` | Every piece of text on the site in English and Arabic |
| `owlSVG()`, `kidSVG()`, `ROOMS` | The drawings of Rafeeq, Yousef, the bathroom and the bedroom |
| `R = {teeth, hands, bag}` | The routines: steps, icons, and Rafeeq's lines for each hint level |
| `VMETA`, `playVoice()` | The start/length of each recorded voice line, and the code that plays it |
| `start()`, `prompt()`, `act()` | The simulation: starting, coaching each step, reacting to the child |
| `overload()`, `enterCalm()`, `exitCalm()` | Sensory overload and calm mode |
| `finish()`, `showResult()` | Confetti, parent report and the results card |
| `loop()` | The animation engine: blinking, talking beak, jumping, rocking, particles |

---

## 12. Publishing the website (GitHub Pages)
The website lives in the `docs/` folder. To make the public link work, turn on GitHub Pages **once**:

1. Open **https://github.com/abdullahnaji353-blip/rafeeq**
2. Click **Settings** (top bar of the repo) → **Pages** (left sidebar)
3. Under **Build and deployment → Source**, choose **Deploy from a branch**
4. Branch: **`main`**, folder: **`/docs`** → click **Save**
5. Wait 1–2 minutes and refresh. GitHub shows: *"Your site is live at https://abdullahnaji353-blip.github.io/rafeeq/"*

After that, **every push to `main` updates the site automatically** within a minute or two.

**Test it before the pitch:**
- Open the link on your phone **and** on a laptop.
- Press **▶ Play** (this unlocks sound on phones) and check you hear Rafeeq's voice.
- Try **عربي**, **Week 4**, and **Too loud!**.
- Keep the 🎬 **Demo** button as a backup during the live pitch.

---

## 13. Honest limitations and next steps
**Limitations today:**
- The website reactions are **scripted**. The real AI is in the camera demo.
- Small local models are **slower and less accurate** than big cloud models. The Pi 5 needs a few seconds per frame.
- The robot hardware is **designed, not yet built**.
- The recorded voice covers the simulation's fixed lines. The live product needs a local Gulf-Arabic TTS model.
- Rafeeq has **not yet been tested with children or therapists**.

**Next steps:**
- [x] Prototype video
- [x] Working camera demo with a free local model (Gemma 3 via Ollama)
- [x] Interactive simulation website with Arabic/English and a recorded Gulf-Arabic voice
- [ ] Pitch deck (Dec 7) and live pitch (Dec 13–14)
- [ ] Build the first physical Rafeeq (ESP32-S3 + Raspberry Pi 5 + 3D-printed body)
- [ ] Pilot with special-education teachers and parents in Kuwait; collect feedback
- [ ] Fine-tune Gemma on Kuwaiti-Arabic coaching examples; add a local Gulf-Arabic voice

---

## 14. Team
**A.Naji**

*Made for the ATSN26 Gen-AI & Software Innovation Competition, Kuwait.*
