# Rafeeq phone demo

A working slice of Rafeeq: point a camera at a child doing a routine, and Rafeeq checks each step with a **vision AI model** and coaches out loud in **Kuwaiti Arabic**.

**Runs 100% free by default** on a local model through [Ollama](https://ollama.com). No API key, no bill.

## What it does
- **Child screen** (`/`): pick a routine, and every 3 seconds one camera frame goes to the model on your own computer. It judges the current step (done / in progress / off task / not visible) and Rafeeq says a short line.
- **Parent app** (`/parent.html`): everything below is set up here, and saved only on this computer in `demo/data/`.

### Features
| Feature | How it works |
|---|---|
| Automatic fading | Each step has a help level: full guidance, light hint, or silent unless stuck. Done alone 3 mornings in a row → one level less. A hard morning (3+ hints, or not finished) → one level back. Every change is logged; parents can pin or undo any level. |
| Routine builder | Parents add or edit routines and steps: what Rafeeq says, an English description for the camera, and an optional timer. |
| AI routine builder | Parents describe a routine in one sentence ("my son needs to get ready for swimming") and Gemma drafts the steps in Kuwaiti Arabic and English. Nothing is saved until the parent checks it. |
| Routine library | Eight ready-made routines in one tap: waking up, washing the face, getting dressed, shoes, breakfast, wudu, tidying toys, bedtime. |
| Camera-free routines | Private routines (dressing, bedtime) keep the camera off. The child taps a big "I did it" button, and Rafeeq reminds gently if a step takes long. |
| Mum's or Dad's voice | Record up to 10 seconds per step. At full guidance, Rafeeq plays the parent's recording instead of his own voice. |
| Eye-ring timer | Timed steps (brushing 120 s, rubbing hands 20 s) fill a ring around Rafeeq's eyes. The step only counts as done when the ring is full. |
| First, then | Parents set a reward. Rafeeq says "first teeth, then the iPad" at the start and celebrates it at the end. |
| Quiet mode | No voice at all: text in the bubble, a nod and eye colours, for sound-sensitive children. |
| Simple words | Lines of 1 to 3 words (Down syndrome, little speech). |
| English mode | Rafeeq speaks simple English instead of Kuwaiti Arabic. |
| Calm mode | A button, or the optional loud-noise check (loud for 1.5 s), pauses the routine: blue eyes, a breathing circle and the family's chosen calm sound (rain, waves or a soft hum). |
| Stars for doing it alone | Praise only when a step at a reduced help level was done with no hints. |
| Weekly summary | Text only: runs, steps done alone, current help level, every change. A printable page for a teacher or therapist opens only if the parent allows sharing. |
| Rafeeq Band (optional) | Connect any Bluetooth heart-rate band that uses the standard Heart Rate Service (many armbands, chest straps and some watches) with **⌚ Connect band** on the child screen. Chrome or Edge, desktop or Android. Rafeeq learns the child's resting heart rate in the first minute (or the parent sets it). If the average over 15 s stays more than 20% above resting (adjustable), calm mode starts early. 🧪 **Simulated band** fakes readings for trying it or filming without a band, and says so on screen. Only use it if the child is comfortable wearing it: wrist, ankle or clipped to clothes. |
| Camera switch | Off in the parent app = the server refuses every frame. The real owl adds a physical cover. |

## Run it (free, local)
1. Install [Node.js 18+](https://nodejs.org) and [Ollama](https://ollama.com/download)
2. Download a vision model (one time, about 3 GB):
   ```bash
   ollama pull gemma3:4b
   ```
3. Start the demo:
   ```bash
   cd demo
   npm install
   npm start
   ```
4. Open **http://localhost:3000**, pick a routine and tap **ابدأ** (Start). Open **http://localhost:3000/parent.html** to set up the child, routines and voices.

**Try it without a model:** `PROVIDER=mock npm start` gives scripted answers, only to click through the app. It is not the AI.

### Other free models
Set `OLLAMA_MODEL` in a `.env` file (see `.env.example`):
| Model | Size | Notes |
|---|---|---|
| `gemma3:4b` (default) | ~3 GB | Good vision + Arabic, runs on most laptops |
| `qwen2.5vl:7b` | ~6 GB | Stronger at reading scenes, needs more RAM |
| `gemma3:12b` | ~8 GB | Best quality, needs a strong computer |

Small local models are slower and less accurate than big cloud models. For the competition demo, rehearse the routine a few times so the model sees each step clearly.

### On your phone
Phone browsers only allow the camera on **https**. Use a free tunnel:
```bash
npx cloudflared tunnel --url http://localhost:3000
```
Open the `https://….trycloudflare.com` link on your phone. The model still runs on your computer.

## Optional: Claude Opus 5.5 (paid)
For the highest accuracy, set `PROVIDER=claude` and your own `ANTHROPIC_API_KEY` in `.env`. This costs money per check. Set a spend limit in the Anthropic console first. `.env` is git-ignored, so your key never gets pushed.

## Notes
- The voice uses the device's built-in Arabic text-to-speech, because the lines are written live by the AI. (The website simulation uses a recorded Gulf-Arabic voice, see the main README.) A local Gulf-Arabic TTS model is the next upgrade.
- Frames are processed only while a routine is running, and no picture is ever saved. The only things stored are the parent's settings, routines, voice recordings and the text history, all in `demo/data/` on this computer (git-ignored).
