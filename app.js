/* ═══════════════════════════════════════════════════════════════
   NIHONGOHEART — app.js
   AI: Google Gemini 2.0 Flash (free tier, 1500 RPM)
   Paste your key from https://aistudio.google.com/app/apikey
═══════════════════════════════════════════════════════════════ */

// ── 🔑 YOUR API KEY — paste it here ──────────────────────────────
const API_KEY = "AIzaSyBMMmFwSs1oKEdIajTyxIg5mFFTO9KZMMw";
// ─────────────────────────────────────────────────────────────────

import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini client — initialised once, reused everywhere
let genAI = null;
let geminiModel = null;

function getModel() {
  if (!geminiModel) {
    const key = API_KEY !== "YOUR_API_KEY_HERE" ? API_KEY : STATE.get("apikey");
    if (!key) return null;
    genAI = new GoogleGenerativeAI(key);
    geminiModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",          // free-tier model
      generationConfig: {
        temperature: 0.85,
        topP: 0.95,
        maxOutputTokens: 600,
      },
    });
  }
  return geminiModel;
}

// ── VOCABULARY DATA — 30 N2 sample words ─────────────────────────
const VOCAB_LIST = [
  { kanji:"読む",   reading:"よむ (yomu)",         meaning:"to read",             example:"本を読む — to read a book" },
  { kanji:"聞く",   reading:"きく (kiku)",          meaning:"to listen / ask",     example:"音楽を聞く — to listen to music" },
  { kanji:"書く",   reading:"かく (kaku)",          meaning:"to write",            example:"手紙を書く — to write a letter" },
  { kanji:"話す",   reading:"はなす (hanasu)",      meaning:"to speak",            example:"日本語を話す — to speak Japanese" },
  { kanji:"覚える", reading:"おぼえる (oboeru)",    meaning:"to memorize",         example:"単語を覚える — to memorize vocab" },
  { kanji:"忘れる", reading:"わすれる (wasureru)",  meaning:"to forget",           example:"名前を忘れた — I forgot the name" },
  { kanji:"調べる", reading:"しらべる (shiraberu)", meaning:"to look up / check",  example:"辞書で調べる — look up in a dictionary" },
  { kanji:"確認する",reading:"かくにんする (kakunin suru)", meaning:"to confirm", example:"予約を確認する — confirm a reservation" },
  { kanji:"決める", reading:"きめる (kimeru)",      meaning:"to decide",           example:"計画を決める — decide on a plan" },
  { kanji:"集める", reading:"あつめる (atsumeru)",  meaning:"to collect",          example:"情報を集める — gather information" },
  { kanji:"比べる", reading:"くらべる (kuraberu)",  meaning:"to compare",          example:"価格を比べる — compare prices" },
  { kanji:"続ける", reading:"つづける (tsuzukeru)", meaning:"to continue",         example:"勉強を続ける — continue studying" },
  { kanji:"伝える", reading:"つたえる (tsutaeru)",  meaning:"to convey",           example:"気持ちを伝える — convey feelings" },
  { kanji:"受ける", reading:"うける (ukeru)",       meaning:"to receive / take",   example:"試験を受ける — take an exam" },
  { kanji:"増える", reading:"ふえる (fueru)",       meaning:"to increase",         example:"人口が増える — population increases" },
  { kanji:"減る",   reading:"へる (heru)",          meaning:"to decrease",         example:"体重が減る — weight decreases" },
  { kanji:"気づく", reading:"きづく (kiduku)",      meaning:"to notice / realize", example:"間違いに気づく — notice a mistake" },
  { kanji:"諦める", reading:"あきらめる (akirameru)",meaning:"to give up",         example:"夢を諦めない — don't give up on dreams" },
  { kanji:"頑張る", reading:"がんばる (ganbaru)",   meaning:"to do one's best",    example:"試験に頑張る — do your best on the exam" },
  { kanji:"努力",   reading:"どりょく (doryoku)",   meaning:"effort / hard work",  example:"努力を続ける — keep making effort" },
  { kanji:"経験",   reading:"けいけん (keiken)",    meaning:"experience",          example:"経験を積む — gain experience" },
  { kanji:"目標",   reading:"もくひょう (mokuhyou)",meaning:"goal / target",       example:"目標を達成する — achieve a goal" },
  { kanji:"成功",   reading:"せいこう (seikou)",    meaning:"success",             example:"成功を祝う — celebrate success" },
  { kanji:"失敗",   reading:"しっぱい (shippai)",   meaning:"failure",             example:"失敗から学ぶ — learn from failure" },
  { kanji:"機会",   reading:"きかい (kikai)",       meaning:"opportunity / chance", example:"機会を活かす — make use of an opportunity" },
  { kanji:"問題",   reading:"もんだい (mondai)",    meaning:"problem / question",  example:"問題を解く — solve a problem" },
  { kanji:"方法",   reading:"ほうほう (houhou)",    meaning:"method / way",        example:"別の方法を試す — try another method" },
  { kanji:"理由",   reading:"りゆう (riyuu)",       meaning:"reason",              example:"理由を説明する — explain the reason" },
  { kanji:"結果",   reading:"けっか (kekka)",       meaning:"result / outcome",    example:"結果を確認する — check the result" },
  { kanji:"影響",   reading:"えいきょう (eikyou)",  meaning:"influence / effect",  example:"社会に影響する — influence society" },
];

// ── STATE — localStorage wrapper ──────────────────────────────────
const STATE = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem("nhk_" + key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("nhk_" + key, JSON.stringify(value)); } catch {}
  },
  user() {
    return this.get("user", {
      name: "", why: "", minutes: 15, blockers: [],
      streak: 0, longestStreak: 0, totalXp: 0,
      wordsLearned: 0, sessionsCompleted: 0,
      lastStudyDate: null, achievements: [],
      weekActivity: [0, 0, 0, 0, 0, 0, 0],
    });
  },
  saveUser(u) { this.set("user", u); },
};

// ── LEVELS ────────────────────────────────────────────────────────
const LEVELS = [
  { min: 0,    max: 100,   kanji: "旅人",  name: "Traveler" },
  { min: 101,  max: 500,   kanji: "学生",  name: "Student" },
  { min: 501,  max: 1500,  kanji: "修行者",name: "Apprentice" },
  { min: 1501, max: 3500,  kanji: "侍",    name: "Samurai" },
  { min: 3501, max: 99999, kanji: "先生",  name: "Sensei" },
];

function getLevel(xp) {
  return LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[0];
}

// ── ACHIEVEMENTS ──────────────────────────────────────────────────
const ACHIEVEMENT_DEFS = [
  { id: "first_step",    icon: "👣", title: "First Step",       desc: "Completed your first task",       check: u => u.sessionsCompleted >= 1 },
  { id: "not_giving_up", icon: "💪", title: "Not Giving Up",    desc: "Returned after a break",          check: u => u.achievements.includes("not_giving_up") },
  { id: "week_warrior",  icon: "🔥", title: "Week Warrior",     desc: "7-day streak achieved",           check: u => u.streak >= 7 },
  { id: "vocab_start",   icon: "📖", title: "Word Collector",   desc: "Learned 20 vocabulary words",    check: u => (u.wordsLearned || 0) >= 20 },
  { id: "quiet_champ",   icon: "🏅", title: "Quiet Champion",   desc: "Studied 7 sessions quietly",     check: u => (u.sessionsCompleted || 0) >= 7 },
  { id: "xp_100",        icon: "⭐", title: "First Hundred",    desc: "Earned 100 XP",                  check: u => u.totalXp >= 100 },
  { id: "midnight_hero", icon: "🌙", title: "2am Hero",         desc: "Studied past midnight",          check: u => u.achievements.includes("midnight_hero") },
];

// ── HANA-SENSEI SYSTEM PROMPT ─────────────────────────────────────
function buildSystemPrompt() {
  const u = STATE.user();
  return `You are Hana-sensei, a warm, patient, and encouraging Japanese language tutor.
Your student is preparing for the JLPT N2 exam.

YOUR PERSONALITY:
- Speak like a kind older sister or supportive mentor
- NEVER use the word "wrong" — say "almost!" or "good try! here's another way"
- Celebrate every small win, even tiny ones
- Use simple English — never assume prior Japanese knowledge
- Keep responses under 5 sentences unless the student asks for more
- Use emojis sparingly but warmly (1-2 per message max)
- If a student seems frustrated, acknowledge their feelings BEFORE teaching

STUDENT CONTEXT:
Name: ${u.name || "Friend"} | Streak: ${u.streak} days | Total XP: ${u.totalXp}

STRICT RULES:
- Never give more than 3 new pieces of information at once
- Always end with one actionable next step OR an encouraging word
- If asked about non-Japanese topics, gently redirect back to studying
- Never sound robotic or clinical — always warm and human`;
}

// ── HANA AI — rate-limit-safe Gemini call ────────────────────────
// Enforces a 250 ms minimum gap between calls to stay well within
// the free-tier 1,500 RPM (= 25 req/s) limit.
let _lastCallAt = 0;

async function callHana(userPrompt, systemOverride = null) {
  const model = getModel();
  if (!model) {
    return "Please set your Gemini API key to chat with me! 🔑";
  }

  // Rate-limit guard
  const gap = Date.now() - _lastCallAt;
  if (gap < 250) await sleep(250 - gap);
  _lastCallAt = Date.now();

  const system = systemOverride || buildSystemPrompt();

  try {
    // Combine system context + user message into one prompt
    // (simplest approach for the browser SDK, avoids extra API calls)
    const fullPrompt = `${system}\n\n---\nStudent says: ${userPrompt}`;
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();
    return text.trim() || "Hana is taking a quick tea break — try again in a moment! 🍵";
  } catch (err) {
    console.warn("Gemini error:", err);
    return "Hana is taking a quick tea break — try again in a moment! 🍵🌸";
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── TASK GENERATOR ────────────────────────────────────────────────
async function generateTasksFromAI(mood, minutes, name) {
  const taskCount    = minutes >= 30 ? 3 : minutes >= 15 ? 2 : 1;
  const taskDuration = Math.floor(minutes / taskCount);

  const key = API_KEY !== "YOUR_API_KEY_HERE" ? API_KEY : STATE.get("apikey");
  if (!key) return fallbackTasks(taskCount, taskDuration);

  const prompt =
`You are a JSON API. Return ONLY a valid JSON array — no markdown, no backticks, no explanation.

Generate exactly ${taskCount} JLPT N2 study tasks for a student named ${name}.
Mood today: ${mood}/5. Total study time: ${minutes} min. Each task max: ${taskDuration} min.
${mood <= 2 ? "Mood is LOW — tasks must be very easy, short, and purely confidence-building." : ""}
${mood >= 4 ? "Mood is HIGH — one task can include a slightly harder challenge." : ""}

Rules:
- Mix task types if count > 1: vocab, grammar, reading, or fun
- Titles must be warm and encouraging, NOT clinical
- icon: single emoji matching the task type
- xp_reward: 10-30 based on difficulty

Return this exact JSON structure and nothing else:
[{"title":"...","type":"vocab","duration_min":5,"description":"...","xp_reward":15,"icon":"📚"}]`;

  try {
    await sleep(300); // gentle rate-limit buffer
    const ai     = new GoogleGenerativeAI(key);
    const m      = ai.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
    });
    const result = await m.generateContent(prompt);
    let text     = result.response.text().trim().replace(/```json|```/g, "").trim();
    const tasks  = JSON.parse(text);
    if (!Array.isArray(tasks)) throw new Error("Not an array");
    return tasks.slice(0, taskCount);
  } catch (err) {
    console.warn("Task generation failed, using fallback:", err);
    return fallbackTasks(taskCount, taskDuration);
  }
}

function fallbackTasks(count, duration) {
  return [
    { title:"5 Quick Vocabulary Flashcards 🌸", type:"vocab",   duration_min:duration, description:"Review 5 N2 words in the flashcard section.", xp_reward:15, icon:"📚" },
    { title:"Ask Hana a Grammar Question",       type:"grammar", duration_min:duration, description:"Pick one N2 grammar point and ask Hana to explain it.", xp_reward:20, icon:"📝" },
    { title:"Read One Short Passage",            type:"reading", duration_min:duration, description:"Ask Hana for a short N2-level reading passage with translation.", xp_reward:25, icon:"📖" },
  ].slice(0, count);
}

// ── APP CONTROLLER ────────────────────────────────────────────────
const App = {
  currentScreen:   "splash",
  currentMood:     3,
  currentTasks:    [],
  activeTaskIndex: -1,
  vocabIndex:      0,
  vocabDeck:       [],
  sessionXp:       0,
  unlockTimeout:   null,
  chatHistory:     [],   // in-memory multi-turn context

  // ── Navigation ─────────────────────────────────────────────────
  goTo(id) {
    const prev = document.getElementById("screen-" + this.currentScreen);
    const next = document.getElementById("screen-" + id);
    if (!next) return;
    if (prev) prev.classList.remove("active");
    this.currentScreen = id;
    next.classList.add("active");
    this.onEnter(id);
  },

  onEnter(id) {
    if (id === "home")     this.refreshHome();
    if (id === "vocab")    this.startVocab();
    if (id === "progress") this.refreshProgress();
    if (id === "checkin")  this.refreshCheckin();
  },

  // ── ONBOARDING ─────────────────────────────────────────────────
  saveName() {
    const v = document.getElementById("input-name").value.trim();
    if (!v) { this.toast("Please enter your name 😊"); return; }
    const u = STATE.user(); u.name = v; STATE.saveUser(u);
    this.goTo("onboarding-2");
  },

  saveWhy() {
    const sel = document.querySelector("#why-choices .selected");
    if (!sel) { this.toast("Pick one that feels right 🌸"); return; }
    const u = STATE.user(); u.why = sel.dataset.value; STATE.saveUser(u);
    this.goTo("onboarding-3");
  },

  selectTime(mins) {
    document.querySelectorAll(".time-card").forEach(c => c.classList.remove("selected"));
    document.querySelector(`.time-card[data-minutes="${mins}"]`).classList.add("selected");
  },

  saveTime() {
    const sel = document.querySelector(".time-card.selected");
    if (!sel) { this.toast("Choose a study time 🕐"); return; }
    const u = STATE.user(); u.minutes = parseInt(sel.dataset.minutes); STATE.saveUser(u);
    this.goTo("onboarding-4");
  },

  saveBlockers() {
    const sel = [...document.querySelectorAll(".blocker-tag.selected")].map(el => el.dataset.value);
    const u = STATE.user(); u.blockers = sel; STATE.saveUser(u);
    this.goTo("onboarding-5");
  },

  saveApiKey() {
    // If the developer already hardcoded the key above, skip the field
    const hardcoded = API_KEY !== "YOUR_API_KEY_HERE";
    const v = document.getElementById("input-apikey").value.trim();

    if (!hardcoded && (!v || !v.startsWith("AIza"))) {
      this.toast("Paste a valid Gemini API key (starts with AIza...)");
      return;
    }
    if (!hardcoded) {
      STATE.set("apikey", v);
      geminiModel = null; // reset so getModel() picks up the new key
    }
    STATE.set("onboarded", true);
    this.goTo("checkin");
  },

  // ── CHECK-IN ───────────────────────────────────────────────────
  refreshCheckin() {
    const u = STATE.user();
    const h = new Date().getHours();
    const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    document.getElementById("checkin-greeting").textContent =
      `${greet}, ${u.name || "friend"}! How are you feeling today? 🌸`;
    document.getElementById("commitment-section").style.display = "none";
    document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("selected"));
  },

  selectMood(n) {
    this.currentMood = n;
    document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("selected"));
    document.querySelector(`.mood-btn[data-mood="${n}"]`).classList.add("selected");
    document.getElementById("commitment-section").style.display = "flex";
  },

  async generateTasks() {
    const hasKey = API_KEY !== "YOUR_API_KEY_HERE" || STATE.get("apikey");
    if (!hasKey) { this.toast("Set your Gemini API key first!"); return; }

    const btn     = document.getElementById("generate-tasks-btn");
    const btnText = document.getElementById("gen-btn-text");
    const loader  = document.getElementById("gen-btn-loader");
    btn.disabled  = true;
    btnText.style.display = "none";
    loader.style.display  = "inline";

    const u     = STATE.user();
    const tasks = await generateTasksFromAI(this.currentMood, u.minutes, u.name);
    const commitment = document.getElementById("commitment-input").value.trim();

    STATE.set("dailyPlan", {
      date: new Date().toDateString(), tasks, commitment, mood: this.currentMood,
    });
    this.currentTasks = tasks.map(t => ({ ...t, completed: false }));

    btn.disabled = false;
    btnText.style.display = "inline";
    loader.style.display  = "none";

    this.goTo("home");
  },

  // ── HOME ───────────────────────────────────────────────────────
  refreshHome() {
    const u  = STATE.user();
    const h  = new Date().getHours();
    const jp = h < 12 ? "おはよう" : h < 17 ? "こんにちは" : "こんばんは";
    document.getElementById("home-greeting").textContent = jp + "!";
    document.getElementById("home-name").textContent     = u.name || "Friend";

    const lv = getLevel(u.totalXp);
    document.getElementById("home-level").textContent    = lv.kanji;
    document.getElementById("home-xp").textContent       = u.totalXp + " XP";
    document.getElementById("streak-count").textContent  = u.streak;
    document.getElementById("total-xp").textContent      = u.totalXp;

    // Check midnight achievement
    if (h >= 0 && h < 4) {
      const u2 = STATE.user();
      if (!u2.achievements.includes("midnight_hero")) {
        u2.achievements.push("midnight_hero");
        STATE.saveUser(u2);
        this.toast("🌙 2am Hero unlocked! Your dedication is showing!");
      }
    }

    // Load today's tasks
    if (this.currentTasks.length === 0) {
      const plan = STATE.get("dailyPlan");
      if (plan && plan.date === new Date().toDateString()) {
        this.currentTasks = plan.tasks.map(t => ({ ...t, completed: false }));
      }
    }

    if (this.currentTasks.length > 0) {
      this.renderTasks();
    } else {
      document.getElementById("task-list").innerHTML = `
        <div class="task-placeholder">
          <p>No tasks yet! Do your check-in to get today's tasks 🌸</p>
          <button class="btn-secondary" onclick="App.goTo('checkin')">Morning Check-in</button>
        </div>`;
    }

    this.checkUnlock();
  },

  renderTasks() {
    document.getElementById("task-list").innerHTML =
      this.currentTasks.map((t, i) => `
        <div class="task-card ${t.completed ? "completed" : ""}" onclick="App.startTask(${i})">
          <span class="task-icon">${t.icon || "📝"}</span>
          <div class="task-info">
            <div class="task-title">${t.title}</div>
            <div class="task-meta">${t.type} · ${t.duration_min} min</div>
          </div>
          <span class="task-xp">+${t.xp_reward} XP</span>
          <span class="task-check">${t.completed ? "✅" : "○"}</span>
        </div>`).join("");
  },

  // ── TASK SCREEN ────────────────────────────────────────────────
  async startTask(idx) {
    const task = this.currentTasks[idx];
    if (task.completed) { this.toast("Already done! ✅"); return; }

    this.activeTaskIndex = idx;
    document.getElementById("task-screen-title").textContent  = task.title;
    document.getElementById("task-xp-reward").textContent     = task.xp_reward;
    document.getElementById("task-done-btn").style.display    = "none";
    document.getElementById("task-content").innerHTML = `
      <div class="task-loading">
        <div class="hana-spin">🌸</div>
        <p>Hana is preparing your lesson...</p>
      </div>`;
    this.goTo("task");

    const u = STATE.user();
    let prompt = "";

    if (task.type === "grammar") {
      prompt =
`Generate a JLPT N2 grammar lesson for ${u.name || "my student"}.
Task title: "${task.title}". Description: "${task.description}".

Use EXACTLY these section labels (plain text, no asterisks, no markdown):

SUMMARY: one plain-English line (explain like to a 12-year-old)
PATTERN: the grammatical structure (e.g. Verb stem + ように)
EXAMPLE 1: Japanese sentence (reading in brackets) — English translation
EXAMPLE 2: another example with translation
TIP: one memory trick or analogy

Total response under 150 words. End with one encouraging sentence.`;
    } else if (task.type === "vocab") {
      prompt =
`Create a mini vocab lesson for JLPT N2 student ${u.name || "my student"}.
Task: "${task.title}". Give exactly 5 N2 vocabulary words.

Format each word like this (no markdown, no asterisks):
WORD: kanji — reading — English meaning
EXAMPLE: Japanese example sentence — English translation

Warm tone throughout. End with one encouraging line.`;
    } else {
      prompt =
`Create a warm, engaging JLPT N2 study activity for ${u.name || "my student"}.
Task: "${task.title}". Description: "${task.description}".
Make it feel personal, not textbook-like. Under 150 words.
End with a small reflection question or a tiny exercise they can do right now.`;
    }

    const content = await callHana(prompt);
    document.getElementById("task-content").innerHTML = this.formatTaskContent(content);
    document.getElementById("task-done-btn").style.display = "block";
  },

  formatTaskContent(text) {
    const LABELS = ["SUMMARY", "PATTERN", "EXAMPLE 1", "EXAMPLE 2", "TIP", "WORD", "EXAMPLE"];
    const lines  = text.split("\n").filter(l => l.trim());
    return "<div class=\"grammar-content\">" +
      lines.map(line => {
        const match = LABELS.find(s => line.toUpperCase().startsWith(s + ":"));
        if (match) {
          const body = line.substring(match.length + 1).trim();
          return `<div class="grammar-block"><h4>${match}</h4><p>${body}</p></div>`;
        }
        return line.trim() ? `<div class="grammar-block"><p>${line}</p></div>` : "";
      }).join("") + "</div>";
  },

  completeTask() {
    if (this.activeTaskIndex < 0) return;
    const task = this.currentTasks[this.activeTaskIndex];
    task.completed = true;

    const u = STATE.user();
    u.totalXp         += task.xp_reward;
    u.sessionsCompleted = (u.sessionsCompleted || 0) + 1;

    // Streak logic (shame-free)
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (u.lastStudyDate !== today) {
      if (u.lastStudyDate === yesterday) {
        u.streak = (u.streak || 0) + 1;
      } else {
        // Gap detected — grant comeback achievement, reset streak to 1
        if ((u.streak || 0) > 0) this._grantAchievement(u, "not_giving_up");
        u.streak = 1;
      }
      u.lastStudyDate = today;
      const day = new Date().getDay();
      if (!u.weekActivity) u.weekActivity = [0,0,0,0,0,0,0];
      u.weekActivity[day] = (u.weekActivity[day] || 0) + task.xp_reward;
    }
    if (u.streak > (u.longestStreak || 0)) u.longestStreak = u.streak;

    // Check all achievement conditions
    ACHIEVEMENT_DEFS.forEach(def => {
      if (!(u.achievements || []).includes(def.id) && def.check(u)) {
        u.achievements.push(def.id);
      }
    });

    // Option A — Honor System: unlock social media when all tasks done
    if (this.currentTasks.every(t => t.completed)) {
      STATE.set("unlock_earned", { earnedAt: Date.now(), minutesEarned: 20, used: false });
      this.toast("🎉 All tasks done! You've unlocked 20 minutes of social media!");
    }

    STATE.saveUser(u);
    this.showCelebration(task.title, task.xp_reward);
  },

  _grantAchievement(u, id) {
    if (!(u.achievements || []).includes(id)) {
      u.achievements = u.achievements || [];
      u.achievements.push(id);
    }
  },

  showCelebration(title, xp) {
    const msgs = [
      { emoji:"🎉", heading:"Wonderful!",      body:`"${title}" — done! One more step forward.` },
      { emoji:"🌸", heading:"Hana is proud!",  body:"Every small step adds up. You're doing great!" },
      { emoji:"⭐", heading:"You did it!",      body:"Your Japanese is getting stronger. Keep going!" },
      { emoji:"🌱", heading:"Growing!",         body:"Tiny steps every day — that's the whole secret." },
    ];
    const m = msgs[Math.floor(Math.random() * msgs.length)];
    document.getElementById("cel-emoji").textContent = m.emoji;
    document.getElementById("cel-title").textContent = m.heading;
    document.getElementById("cel-msg").textContent   = m.body;
    document.getElementById("cel-xp").textContent    = xp;
    document.getElementById("celebration").style.display = "flex";
  },

  closeCelebration() {
    document.getElementById("celebration").style.display = "none";
    this.goTo("home");
  },

  // ── VOCAB FLASHCARDS ───────────────────────────────────────────
  startVocab() {
    this.vocabDeck  = [...VOCAB_LIST].sort(() => Math.random() - 0.5).slice(0, 10);
    this.vocabIndex = 0;
    this.sessionXp  = 0;
    this.renderCard();
    document.getElementById("xp-fill").style.width    = "0%";
    document.getElementById("session-xp").textContent = "0";
  },

  renderCard() {
    const card = this.vocabDeck[this.vocabIndex];
    if (!card) { this.vocabDone(); return; }

    document.getElementById("card-kanji").textContent   = card.kanji;
    document.getElementById("card-reading").textContent = card.reading;
    document.getElementById("card-meaning").textContent = card.meaning;
    document.getElementById("card-example").textContent = card.example;
    document.getElementById("vocab-counter").textContent =
      `${this.vocabIndex + 1}/${this.vocabDeck.length}`;

    const fc = document.getElementById("flashcard");
    fc.classList.remove("flipped");
    document.getElementById("card-actions").style.display = "none";
  },

  flipCard() {
    const fc = document.getElementById("flashcard");
    fc.classList.toggle("flipped");
    if (fc.classList.contains("flipped")) {
      setTimeout(() => {
        document.getElementById("card-actions").style.display = "flex";
      }, 300);
    } else {
      document.getElementById("card-actions").style.display = "none";
    }
  },

  vocabResult(result) {
    const xp = result === "knew" ? 5 : 2;
    this.sessionXp += xp;
    document.getElementById("session-xp").textContent = this.sessionXp;
    const maxXp = this.vocabDeck.length * 5;
    document.getElementById("xp-fill").style.width =
      Math.min(100, (this.sessionXp / maxXp) * 100) + "%";

    if (result === "knew") {
      const u = STATE.user();
      u.wordsLearned = (u.wordsLearned || 0) + 1;
      STATE.saveUser(u);
    }
    this.vocabIndex++;
    if (this.vocabIndex >= this.vocabDeck.length) this.vocabDone();
    else this.renderCard();
  },

  vocabDone() {
    const u = STATE.user();
    u.totalXp += this.sessionXp;
    STATE.saveUser(u);
    this.showCelebration("Vocab Session", this.sessionXp);
  },

  // ── TUTOR CHAT ─────────────────────────────────────────────────
  async sendMessage() {
    const input = document.getElementById("chat-input");
    const msg   = input.value.trim();
    if (!msg) return;

    input.value        = "";
    input.style.height = "auto";
    this._appendBubble("user", msg);
    document.getElementById("quick-prompts").style.display = "none";

    const loadId = "load-" + Date.now();
    this._appendBubble("hana", "🌸 thinking...", loadId, true);
    document.getElementById("send-btn").disabled = true;

    // Build multi-turn context (last 6 turns = 3 exchanges)
    const historyText = this.chatHistory.slice(-6)
      .map(m => `${m.role === "user" ? "Student" : "Hana"}: ${m.text}`)
      .join("\n");

    const fullPrompt = historyText
      ? `Previous conversation:\n${historyText}\n\nStudent: ${msg}`
      : msg;

    const reply = await callHana(fullPrompt);
    document.getElementById("send-btn").disabled = false;

    const loadEl = document.getElementById(loadId);
    if (loadEl) loadEl.querySelector(".bubble-text").textContent = reply;

    this.chatHistory.push({ role: "user",      text: msg });
    this.chatHistory.push({ role: "assistant", text: reply });
    // Cap at 20 entries to manage memory
    if (this.chatHistory.length > 20) this.chatHistory = this.chatHistory.slice(-20);

    this._scrollChat();
  },

  quickPrompt(msg) {
    document.getElementById("chat-input").value = msg;
    this.sendMessage();
  },

  _appendBubble(role, text, id = null, loading = false) {
    const div = document.createElement("div");
    div.className = `chat-bubble ${role}`;
    if (id) div.id = id;
    div.innerHTML = `<div class="bubble-text ${loading ? "loading" : ""}">${text}</div>`;
    document.getElementById("chat-messages").appendChild(div);
    this._scrollChat();
  },

  _scrollChat() {
    const el = document.getElementById("chat-messages");
    if (el) el.scrollTop = el.scrollHeight;
  },

  // ── PROGRESS ───────────────────────────────────────────────────
  refreshProgress() {
    const u   = STATE.user();
    const lv  = getLevel(u.totalXp);
    const idx = LEVELS.indexOf(lv);
    const next = LEVELS[idx + 1] || lv;
    const pct  = next !== lv
      ? Math.min(100, ((u.totalXp - lv.min) / (next.min - lv.min)) * 100)
      : 100;

    document.getElementById("prog-level-kanji").textContent = lv.kanji;
    document.getElementById("prog-level-name").textContent  = lv.name;
    document.getElementById("prog-xp-text").textContent     = `${u.totalXp} / ${next.min} XP to next level`;
    document.getElementById("level-fill").style.width       = pct + "%";

    document.getElementById("stat-streak").textContent   = u.streak   || 0;
    document.getElementById("stat-words").textContent    = u.wordsLearned   || 0;
    document.getElementById("stat-sessions").textContent = u.sessionsCompleted || 0;
    document.getElementById("stat-xp").textContent       = u.totalXp  || 0;

    // Achievements list
    const list   = document.getElementById("achievements-list");
    const earned = ACHIEVEMENT_DEFS.filter(d => (u.achievements || []).includes(d.id));
    list.innerHTML = earned.length === 0
      ? `<p style="color:var(--muted);font-size:14px;text-align:center;padding:20px">Complete tasks to earn achievements! 🏅</p>`
      : earned.map(a => `
          <div class="achievement-item">
            <span class="ach-icon">${a.icon}</span>
            <div class="ach-text"><strong>${a.title}</strong><br><small>${a.desc}</small></div>
          </div>`).join("");

    // Weekly activity chart
    const days     = ["S","M","T","W","T","F","S"];
    const activity = u.weekActivity || [0,0,0,0,0,0,0];
    const maxVal   = Math.max(...activity, 1);
    document.getElementById("week-chart").innerHTML = days.map((d, i) => {
      const h = Math.round((activity[i] / maxVal) * 60);
      return `<div class="week-bar-wrap">
        <div class="week-bar ${activity[i] > 0 ? "has-data" : ""}" style="height:${h || 4}px"></div>
        <span class="week-day">${d}</span>
      </div>`;
    }).join("");
  },

  // ── SOCIAL MEDIA UNLOCK — Option A: Honor System ───────────────
  checkUnlock() {
    const unlock = STATE.get("unlock_earned");
    document.getElementById("unlock-section").style.display =
      (unlock && !unlock.used) ? "block" : "none";
  },

  useUnlock() {
    const unlock = STATE.get("unlock_earned");
    if (!unlock || unlock.used) return;
    unlock.used = true;
    STATE.set("unlock_earned", unlock);
    document.getElementById("unlock-section").style.display = "none";

    this.toast("📱 20 minutes unlocked! Enjoy your break — you earned it 🌸", 5000);

    // Gentle nudge after 20 minutes (honor system)
    this.unlockTimeout = setTimeout(() => {
      this.toast("Your social media break is over! Ready to study again? 🌸", 5000);
    }, 20 * 60 * 1000);
  },

  // ── TOAST NOTIFICATION ─────────────────────────────────────────
  toast(msg, duration = 3000) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), duration);
  },
};

// ── INTERACTIVE SETUP — event listeners ──────────────────────────

// Why-screen choice cards (single select)
document.querySelectorAll(".choice-card").forEach(card => {
  card.addEventListener("click", () => {
    card.closest(".choice-grid").querySelectorAll(".choice-card")
      .forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
  });
});

// Blocker tags (multi-select)
document.querySelectorAll(".blocker-tag").forEach(tag => {
  tag.addEventListener("click", () => tag.classList.toggle("selected"));
});

// Enter on name field
document.getElementById("input-name")?.addEventListener("keydown", e => {
  if (e.key === "Enter") App.saveName();
});

// Enter in chat (Shift+Enter = newline)
document.getElementById("chat-input")?.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); App.sendMessage(); }
});

// Auto-resize chat textarea
document.getElementById("chat-input")?.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 100) + "px";
});

// ── FALLING SAKURA PETALS ─────────────────────────────────────────
function createPetals() {
  const container = document.getElementById("petals");
  if (!container) return;
  for (let i = 0; i < 14; i++) {
    const p       = document.createElement("div");
    p.className   = "petal";
    p.textContent = ["🌸","🌺","🌼"][Math.floor(Math.random() * 3)];
    p.style.left              = Math.random() * 100 + "%";
    p.style.fontSize          = (12 + Math.random() * 14) + "px";
    p.style.animationDuration = (5 + Math.random() * 7) + "s";
    p.style.animationDelay    = (Math.random() * 10) + "s";
    container.appendChild(p);
  }
}

// ── BOOT ─────────────────────────────────────────────────────────
(function boot() {
  createPetals();

  const onboarded = STATE.get("onboarded");
  const hasKey    = API_KEY !== "YOUR_API_KEY_HERE" || STATE.get("apikey");

  // Small pause so the splash animation plays
  setTimeout(() => {
    if (onboarded && hasKey) App.goTo("home");
    // else: stay on splash, user presses "始めましょう"
  }, 900);
})();

// Prevent double-tap zoom on mobile buttons
document.addEventListener("touchend", e => {
  if (e.target.tagName === "BUTTON") e.preventDefault();
}, { passive: false });

// Expose App globally (called from HTML onclick="App.xxx()")
window.App = App;
