# 心 NihongoHeart

> **One step today. Fluent someday.**

A warm, psychology-driven JLPT N2 study app powered by Claude AI (Hana-sensei).

---

## 🚀 Deploy to GitHub Pages in 5 Minutes

### Step 1 — Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Name it `nihongoheart` (or anything you like)
3. Set it to **Public**
4. Click **Create repository**

### Step 2 — Upload the Files
Upload these 3 files to the root of your repository:
- `index.html`
- `style.css`
- `app.js`

You can do this by:
- Dragging and dropping files into the GitHub web interface
- Or using Git: `git add . && git commit -m "init" && git push`

### Step 3 — Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select `Deploy from a branch`
3. Choose `main` branch, `/ (root)` folder
4. Click **Save**

### Step 4 — Visit Your App
After ~60 seconds, your app will be live at:
```
https://YOUR_USERNAME.github.io/nihongoheart/
```

---

## 🔑 API Key Setup

The app uses the **Anthropic Claude API** to power Hana-sensei.

1. Get a free API key at [console.anthropic.com](https://console.anthropic.com)
2. When you first open the app, paste your key in the onboarding screen
3. Your key is stored **only in your browser's localStorage** — never sent to any server

> ⚠️ Note: This is a personal/demo app. Do not share your deployment URL widely as others could use your API key credits.

---

## ✨ Features

| Feature | Status |
|---|---|
| 5-screen onboarding with Hana-sensei | ✅ |
| Morning check-in + mood selector | ✅ |
| AI-generated daily tasks (Claude API) | ✅ |
| 30 N2 vocabulary flashcards with SRS feel | ✅ |
| AI tutor chat (Hana-sensei) | ✅ |
| XP & level system (旅人 → 先生) | ✅ |
| Streak tracking (shame-free) | ✅ |
| Achievements system | ✅ |
| Weekly activity chart | ✅ |
| Social media unlock (honor system) | ✅ |
| Grammar lessons via AI | ✅ |
| Local storage persistence | ✅ |

---

## 🗂 File Structure

```
nihongoheart/
├── index.html   — All screens & markup
├── style.css    — Full styling (warm Japanese editorial aesthetic)
└── app.js       — App logic, AI calls, state management
```

Everything is vanilla HTML/CSS/JS — no build tools, no npm, no frameworks.

---

## 🎨 Design

- **Aesthetic**: Warm Japanese editorial — ink, sakura, washi paper
- **Fonts**: DM Serif Display + DM Sans + Noto Serif JP
- **Colors**: Sakura pink · Deep ink · Warm cream · Moss green · Gold
- **Mobile-first**: Designed for 375–480px, works great on desktop too

---

## 🧠 Psychology Baked In

- **BJ Fogg's Tiny Habits** — tasks sized to feel easy
- **Implementation Intentions** — daily commitment prompts
- **Shame Resilience** — no red streaks, "Comeback Day" framing
- **Variable Rewards** — surprise XP, random celebration messages
- **Temptation Bundling** — social media unlock system

---

## 📝 Customization

### Add more vocabulary
In `app.js`, find `const VOCAB_LIST = [...]` and add entries:
```js
{ kanji:"新しい単語", reading:"reading (romaji)", meaning:"English meaning", example:"example sentence" },
```

### Change Hana's personality
In `app.js`, find the `systemPrompt` inside `callHana()` and edit her personality.

### Change colors
In `style.css`, edit the `:root` CSS variables at the top.

---

## 🔮 Roadmap (V2/V3)

- [ ] Speaking practice (Web Speech API)
- [ ] Grammar lessons library (50+ N2 points)
- [ ] Reading passages
- [ ] Mock JLPT N2 tests
- [ ] PWA support (installable on phone)
- [ ] Cloud sync via Supabase

---

Built with ❤️ and 🌸 for Japanese learners everywhere.
