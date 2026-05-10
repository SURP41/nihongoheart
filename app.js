/* ═══════════════════════════════════════════════════════════════
   NIHONGOHEART — app.js
   Gemini 2.0 Flash via plain fetch() — no SDK, no imports,
   works on every browser and GitHub Pages without any build step.
═══════════════════════════════════════════════════════════════ */

// ── 🔑 PASTE YOUR GEMINI API KEY HERE ────────────────────────────
const API_KEY = "YOUR_API_KEY_HERE";
// ─────────────────────────────────────────────────────────────────

// Gemini REST endpoint (no SDK required)
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY;

// ── VOCABULARY DATA — 30 N2 words ─────────────────────────────────
const VOCAB_LIST = [
  { kanji:"読む",    reading:"よむ (yomu)",          meaning:"to read",              example:"本を読む — to read a book" },
  { kanji:"聞く",    reading:"きく (kiku)",           meaning:"to listen / ask",      example:"音楽を聞く — to listen to music" },
  { kanji:"書く",    reading:"かく (kaku)",           meaning:"to write",             example:"手紙を書く — to write a letter" },
  { kanji:"話す",    reading:"はなす (hanasu)",       meaning:"to speak",             example:"日本語を話す — to speak Japanese" },
  { kanji:"覚える",  reading:"おぼえる (oboeru)",     meaning:"to memorize",          example:"単語を覚える — to memorize vocab" },
  { kanji:"忘れる",  reading:"わすれる (wasureru)",   meaning:"to forget",            example:"名前を忘れた — I forgot the name" },
  { kanji:"調べる",  reading:"しらべる (shiraberu)",  meaning:"to look up",           example:"辞書で調べる — look up in a dictionary" },
  { kanji:"確認する",reading:"かくにんする (kakunin suru)", meaning:"to confirm",   example:"予約を確認する — confirm a reservation" },
  { kanji:"決める",  reading:"きめる (kimeru)",       meaning:"to decide",            example:"計画を決める — decide on a plan" },
  { kanji:"集める",  reading:"あつめる (atsumeru)",   meaning:"to collect",           example:"情報を集める — gather information" },
  { kanji:"比べる",  reading:"くらべる (kuraberu)",   meaning:"to compare",           example:"価格を比べる — compare prices" },
  { kanji:"続ける",  reading:"つづける (tsuzukeru)",  meaning:"to continue",          example:"勉強を続ける — continue studying" },
  { kanji:"伝える",  reading:"つたえる (tsutaeru)",   meaning:"to convey",            example:"気持ちを伝える — convey feelings" },
  { kanji:"受ける",  reading:"うける (ukeru)",        meaning:"to receive / take",    example:"試験を受ける — take an exam" },
  { kanji:"増える",  reading:"ふえる (fueru)",        meaning:"to increase",          example:"人口が増える — population increases" },
  { kanji:"減る",    reading:"へる (heru)",           meaning:"to decrease",          example:"体重が減る — weight decreases" },
  { kanji:"気づく",  reading:"きづく (kiduku)",       meaning:"to notice / realize",  example:"間違いに気づく — notice a mistake" },
  { kanji:"諦める",  reading:"あきらめる (akirameru)",meaning:"to give up",           example:"夢を諦めない — don't give up on dreams" },
  { kanji:"頑張る",  reading:"がんばる (ganbaru)",    meaning:"to do one's best",     example:"試験に頑張る — do your best on the exam" },
  { kanji:"努力",    reading:"どりょく (doryoku)",    meaning:"effort / hard work",   example:"努力を続ける — keep making effort" },
  { kanji:"経験",    reading:"けいけん (keiken)",     meaning:"experience",           example:"経験を積む — gain experience" },
  { kanji:"目標",    reading:"もくひょう (mokuhyou)", meaning:"goal / target",        example:"目標を達成する — achieve a goal" },
  { kanji:"成功",    reading:"せいこう (seikou)",     meaning:"success",              example:"成功を祝う — celebrate success" },
  { kanji:"失敗",    reading:"しっぱい (shippai)",    meaning:"failure",              example:"失敗から学ぶ — learn from failure" },
  { kanji:"機会",    reading:"きかい (kikai)",        meaning:"opportunity / chance", example:"機会を活かす — make use of an opportunity" },
  { kanji:"問題",    reading:"もんだい (mondai)",     meaning:"problem / question",   example:"問題を解く — solve a problem" },
  { kanji:"方法",    reading:"ほうほう (houhou)",     meaning:"method / way",         example:"別の方法を試す — try another method" },
  { kanji:"理由",    reading:"りゆう (riyuu)",        meaning:"reason",               example:"理由を説明する — explain the reason" },
  { kanji:"結果",    reading:"けっか (kekka)",        meaning:"result / outcome",     example:"結果を確認する — check the result" },
  { kanji:"影響",    reading:"えいきょう (eikyou)",   meaning:"influence / effect",   example:"社会に影響する — influence society" },
];

// ── STATE ─────────────────────────────────────────────────────────
var STATE = {
  get: function(key, fallback) {
    if (fallback === undefined) fallback = null;
    try {
      var v = localStorage.getItem("nhk_" + key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch(e) { return fallback; }
  },
  set: function(key, value) {
    try { localStorage.setItem("nhk_" + key, JSON.stringify(value)); } catch(e) {}
  },
  user: function() {
    return this.get("user", {
      name: "", why: "", minutes: 15, blockers: [],
      streak: 0, longestStreak: 0, totalXp: 0,
      wordsLearned: 0, sessionsCompleted: 0,
      lastStudyDate: null, achievements: [],
      weekActivity: [0,0,0,0,0,0,0]
    });
  },
  saveUser: function(u) { this.set("user", u); }
};

// ── LEVELS ────────────────────────────────────────────────────────
var LEVELS = [
  { min:0,    max:100,   kanji:"旅人",  name:"Traveler" },
  { min:101,  max:500,   kanji:"学生",  name:"Student" },
  { min:501,  max:1500,  kanji:"修行者",name:"Apprentite" },
  { min:1501, max:3500,  kanji:"侍",    name:"Samurai" },
  { min:3501, max:99999, kanji:"先生",  name:"Sensei" }
];

function getLevel(xp) {
  for (var i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min && xp <= LEVELS[i].max) return LEVELS[i];
  }
  return LEVELS[0];
}

// ── ACHIEVEMENTS ──────────────────────────────────────────────────
var ACHIEVEMENT_DEFS = [
  { id:"first_step",    icon:"👣", title:"First Step",      desc:"Completed your first task",     check:function(u){ return u.sessionsCompleted >= 1; } },
  { id:"not_giving_up", icon:"💪", title:"Not Giving Up",   desc:"Returned after a break",        check:function(u){ return u.achievements.indexOf("not_giving_up") > -1; } },
  { id:"week_warrior",  icon:"🔥", title:"Week Warrior",    desc:"7-day streak achieved",         check:function(u){ return u.streak >= 7; } },
  { id:"vocab_start",   icon:"📖", title:"Word Collector",  desc:"Learned 20 vocabulary words",  check:function(u){ return (u.wordsLearned||0) >= 20; } },
  { id:"quiet_champ",   icon:"🏅", title:"Quiet Champion",  desc:"Studied 7 sessions quietly",   check:function(u){ return (u.sessionsCompleted||0) >= 7; } },
  { id:"xp_100",        icon:"⭐", title:"First Hundred",   desc:"Earned 100 XP",                check:function(u){ return u.totalXp >= 100; } },
  { id:"midnight_hero", icon:"🌙", title:"2am Hero",        desc:"Studied past midnight",         check:function(u){ return u.achievements.indexOf("midnight_hero") > -1; } }
];

// ── HANA SYSTEM PROMPT ────────────────────────────────────────────
function buildSystemPrompt() {
  var u = STATE.user();
  return "You are Hana-sensei, a warm, patient, encouraging Japanese tutor.\n" +
    "Your student is preparing for the JLPT N2 exam.\n\n" +
    "PERSONALITY:\n" +
    "- Kind older sister / supportive mentor tone\n" +
    "- NEVER say 'wrong' — say 'almost!' or 'good try!'\n" +
    "- Celebrate every small win\n" +
    "- Simple English only\n" +
    "- Max 5 sentences unless asked for more\n" +
    "- 1-2 emojis per message max\n" +
    "- Acknowledge feelings before teaching if student is frustrated\n\n" +
    "STUDENT: " + (u.name||"Friend") + " | Streak: " + u.streak + " days | XP: " + u.totalXp + "\n\n" +
    "RULES:\n" +
    "- Max 3 new pieces of info at once\n" +
    "- Always end with an action step or encouragement\n" +
    "- Gently redirect if asked about non-Japanese topics";
}

// ── GEMINI FETCH — plain REST, no SDK ────────────────────────────
var _lastCallAt = 0;

function callHana(userPrompt, systemOverride) {
  var system = systemOverride || buildSystemPrompt();
  var now = Date.now();
  var gap = now - _lastCallAt;
  var delay = gap < 250 ? (250 - gap) : 0;

  return new Promise(function(resolve) {
    setTimeout(function() {
      _lastCallAt = Date.now();

      var body = {
        contents: [{
          parts: [{ text: system + "\n\n---\nStudent: " + userPrompt }]
        }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 600
        }
      };

      fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        try {
          var text = data.candidates[0].content.parts[0].text;
          resolve(text || "Hana is taking a quick tea break — try again in a moment! 🍵");
        } catch(e) {
          console.warn("Gemini parse error:", data);
          resolve("Hana is taking a quick tea break — try again in a moment! 🍵🌸");
        }
      })
      .catch(function(err) {
        console.warn("Gemini fetch error:", err);
        resolve("Hana is taking a quick tea break — try again in a moment! 🍵🌸");
      });
    }, delay);
  });
}

// ── TASK GENERATOR ────────────────────────────────────────────────
function generateTasksFromAI(mood, minutes, name) {
  var taskCount    = minutes >= 30 ? 3 : minutes >= 15 ? 2 : 1;
  var taskDuration = Math.floor(minutes / taskCount);

  var prompt =
    "You are a JSON API. Return ONLY a valid JSON array, no markdown, no backticks, no explanation.\n\n" +
    "Generate exactly " + taskCount + " JLPT N2 study tasks for " + name + ".\n" +
    "Mood: " + mood + "/5. Time available: " + minutes + " min. Each task max: " + taskDuration + " min.\n" +
    (mood <= 2 ? "Mood is LOW — make tasks very easy and confidence-building.\n" : "") +
    (mood >= 4 ? "Mood is HIGH — one task can be a bit more challenging.\n" : "") +
    "Mix task types (vocab, grammar, reading) if count > 1.\n" +
    "Titles must be warm and encouraging.\n" +
    "icon: one emoji. xp_reward: 10-30.\n\n" +
    "Return ONLY this JSON structure:\n" +
    '[{"title":"...","type":"vocab","duration_min":5,"description":"...","xp_reward":15,"icon":"📚"}]';

  return new Promise(function(resolve) {
    var body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
    };

    fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      try {
        var text = data.candidates[0].content.parts[0].text.trim();
        text = text.replace(/```json|```/g, "").trim();
        var tasks = JSON.parse(text);
        if (!Array.isArray(tasks)) throw new Error("not array");
        resolve(tasks.slice(0, taskCount));
      } catch(e) {
        console.warn("Task parse failed, using fallback:", e);
        resolve(fallbackTasks(taskCount, taskDuration));
      }
    })
    .catch(function() {
      resolve(fallbackTasks(taskCount, taskDuration));
    });
  });
}

function fallbackTasks(count, duration) {
  var all = [
    { title:"5 Quick Vocabulary Flashcards 🌸", type:"vocab",   duration_min:duration, description:"Review 5 N2 words in the flashcard section.", xp_reward:15, icon:"📚" },
    { title:"Ask Hana a Grammar Question",       type:"grammar", duration_min:duration, description:"Pick one N2 grammar point and ask Hana to explain it.", xp_reward:20, icon:"📝" },
    { title:"Read One Short Passage",            type:"reading", duration_min:duration, description:"Ask Hana for a short N2-level reading passage with translation.", xp_reward:25, icon:"📖" }
  ];
  return all.slice(0, count);
}

// ── APP ───────────────────────────────────────────────────────────
var App = {
  currentScreen:   "splash",
  currentMood:     3,
  currentTasks:    [],
  activeTaskIndex: -1,
  vocabIndex:      0,
  vocabDeck:       [],
  sessionXp:       0,
  chatHistory:     [],
  unlockTimeout:   null,

  // Navigation
  goTo: function(id) {
    var prev = document.getElementById("screen-" + this.currentScreen);
    var next = document.getElementById("screen-" + id);
    if (!next) return;
    if (prev) prev.classList.remove("active");
    this.currentScreen = id;
    next.classList.add("active");
    this.onEnter(id);
  },

  onEnter: function(id) {
    if (id === "home")     this.refreshHome();
    if (id === "vocab")    this.startVocab();
    if (id === "progress") this.refreshProgress();
    if (id === "checkin")  this.refreshCheckin();
  },

  // ── ONBOARDING ───────────────────────────────────────────────
  saveName: function() {
    var v = document.getElementById("input-name").value.trim();
    if (!v) { this.toast("Please enter your name 😊"); return; }
    var u = STATE.user(); u.name = v; STATE.saveUser(u);
    this.goTo("onboarding-2");
  },

  saveWhy: function() {
    var sel = document.querySelector("#why-choices .selected");
    if (!sel) { this.toast("Pick one that feels right 🌸"); return; }
    var u = STATE.user(); u.why = sel.dataset.value; STATE.saveUser(u);
    this.goTo("onboarding-3");
  },

  selectTime: function(mins) {
    document.querySelectorAll(".time-card").forEach(function(c){ c.classList.remove("selected"); });
    document.querySelector(".time-card[data-minutes='" + mins + "']").classList.add("selected");
  },

  saveTime: function() {
    var sel = document.querySelector(".time-card.selected");
    if (!sel) { this.toast("Choose a study time 🕐"); return; }
    var u = STATE.user(); u.minutes = parseInt(sel.dataset.minutes); STATE.saveUser(u);
    this.goTo("onboarding-4");
  },

  saveBlockers: function() {
    var sel = [];
    document.querySelectorAll(".blocker-tag.selected").forEach(function(el){ sel.push(el.dataset.value); });
    var u = STATE.user(); u.blockers = sel; STATE.saveUser(u);
    this.goTo("onboarding-5");
  },

  saveApiKey: function() {
    var hardcoded = API_KEY !== "YOUR_API_KEY_HERE";
    var v = document.getElementById("input-apikey").value.trim();
    if (!hardcoded && !v.startsWith("AIza")) {
      this.toast("Paste a valid Gemini key (starts with AIza...)");
      return;
    }
    if (!hardcoded) STATE.set("apikey", v);
    STATE.set("onboarded", true);
    this.goTo("checkin");
  },

  // ── CHECK-IN ─────────────────────────────────────────────────
  refreshCheckin: function() {
    var u = STATE.user();
    var h = new Date().getHours();
    var greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    var el = document.getElementById("checkin-greeting");
    if (el) el.textContent = greet + ", " + (u.name||"friend") + "! How are you feeling today? 🌸";
    var cs = document.getElementById("commitment-section");
    if (cs) cs.style.display = "none";
    document.querySelectorAll(".mood-btn").forEach(function(b){ b.classList.remove("selected"); });
  },

  selectMood: function(n) {
    this.currentMood = n;
    document.querySelectorAll(".mood-btn").forEach(function(b){ b.classList.remove("selected"); });
    var btn = document.querySelector(".mood-btn[data-mood='" + n + "']");
    if (btn) btn.classList.add("selected");
    var cs = document.getElementById("commitment-section");
    if (cs) cs.style.display = "flex";
  },

  generateTasks: function() {
    var self = this;
    var btn     = document.getElementById("generate-tasks-btn");
    var btnText = document.getElementById("gen-btn-text");
    var loader  = document.getElementById("gen-btn-loader");
    if (btn) btn.disabled = true;
    if (btnText) btnText.style.display = "none";
    if (loader)  loader.style.display  = "inline";

    var u = STATE.user();
    generateTasksFromAI(this.currentMood, u.minutes, u.name).then(function(tasks) {
      var commitment = "";
      var ci = document.getElementById("commitment-input");
      if (ci) commitment = ci.value.trim();
      STATE.set("dailyPlan", { date: new Date().toDateString(), tasks: tasks, commitment: commitment, mood: self.currentMood });
      self.currentTasks = tasks.map(function(t){ return Object.assign({}, t, { completed: false }); });
      if (btn) btn.disabled = false;
      if (btnText) btnText.style.display = "inline";
      if (loader)  loader.style.display  = "none";
      self.goTo("home");
    });
  },

  // ── HOME ─────────────────────────────────────────────────────
  refreshHome: function() {
    var u  = STATE.user();
    var h  = new Date().getHours();
    var jp = h < 12 ? "おはよう" : h < 17 ? "こんにちは" : "こんばんは";

    var hg = document.getElementById("home-greeting");
    var hn = document.getElementById("home-name");
    var hl = document.getElementById("home-level");
    var hx = document.getElementById("home-xp");
    var sc = document.getElementById("streak-count");
    var tx = document.getElementById("total-xp");
    if (hg) hg.textContent = jp + "!";
    if (hn) hn.textContent = u.name || "Friend";
    var lv = getLevel(u.totalXp);
    if (hl) hl.textContent = lv.kanji;
    if (hx) hx.textContent = u.totalXp + " XP";
    if (sc) sc.textContent = u.streak;
    if (tx) tx.textContent = u.totalXp;

    // Midnight achievement
    if (h >= 0 && h < 4) {
      var u2 = STATE.user();
      if (u2.achievements.indexOf("midnight_hero") === -1) {
        u2.achievements.push("midnight_hero"); STATE.saveUser(u2);
        this.toast("🌙 2am Hero unlocked! Your dedication is showing!");
      }
    }

    // Load tasks
    if (this.currentTasks.length === 0) {
      var plan = STATE.get("dailyPlan");
      if (plan && plan.date === new Date().toDateString()) {
        this.currentTasks = plan.tasks.map(function(t){ return Object.assign({}, t, { completed: false }); });
      }
    }

    if (this.currentTasks.length > 0) {
      this.renderTasks();
    } else {
      var tl = document.getElementById("task-list");
      if (tl) tl.innerHTML =
        '<div class="task-placeholder">' +
        '<p>No tasks yet! Check in to get today\'s tasks 🌸</p>' +
        '<button class="btn-secondary" onclick="App.goTo(\'checkin\')">Morning Check-in</button>' +
        '</div>';
    }
    this.checkUnlock();
  },

  renderTasks: function() {
    var tl = document.getElementById("task-list");
    if (!tl) return;
    var self = this;
    tl.innerHTML = this.currentTasks.map(function(t, i) {
      return '<div class="task-card ' + (t.completed ? "completed" : "") + '" onclick="App.startTask(' + i + ')">' +
        '<span class="task-icon">' + (t.icon||"📝") + '</span>' +
        '<div class="task-info">' +
          '<div class="task-title">' + t.title + '</div>' +
          '<div class="task-meta">' + t.type + ' · ' + t.duration_min + ' min</div>' +
        '</div>' +
        '<span class="task-xp">+' + t.xp_reward + ' XP</span>' +
        '<span class="task-check">' + (t.completed ? "✅" : "○") + '</span>' +
      '</div>';
    }).join("");
  },

  // ── TASK SCREEN ──────────────────────────────────────────────
  startTask: function(idx) {
    var self = this;
    var task = this.currentTasks[idx];
    if (!task) return;
    if (task.completed) { this.toast("Already done! ✅"); return; }
    this.activeTaskIndex = idx;

    var tt  = document.getElementById("task-screen-title");
    var txr = document.getElementById("task-xp-reward");
    var tdb = document.getElementById("task-done-btn");
    var tc  = document.getElementById("task-content");
    if (tt)  tt.textContent  = task.title;
    if (txr) txr.textContent = task.xp_reward;
    if (tdb) tdb.style.display = "none";
    if (tc)  tc.innerHTML = '<div class="task-loading"><div class="hana-spin">🌸</div><p>Hana is preparing your lesson...</p></div>';
    this.goTo("task");

    var u = STATE.user();
    var prompt = "";
    if (task.type === "grammar") {
      prompt = "Generate a JLPT N2 grammar lesson for " + (u.name||"my student") + ".\n" +
        "Task: \"" + task.title + "\". Description: \"" + task.description + "\".\n\n" +
        "Use these section labels (no markdown, no asterisks):\n" +
        "SUMMARY: one plain-English line\n" +
        "PATTERN: the structure\n" +
        "EXAMPLE 1: Japanese — English\n" +
        "EXAMPLE 2: Japanese — English\n" +
        "TIP: one memory trick\n\n" +
        "Under 150 words total. End with encouragement.";
    } else if (task.type === "vocab") {
      prompt = "Create a mini vocab lesson for JLPT N2 student " + (u.name||"my student") + ".\n" +
        "Task: \"" + task.title + "\". Give exactly 5 N2 words.\n\n" +
        "Format each as (no markdown):\n" +
        "WORD: kanji — reading — meaning\n" +
        "EXAMPLE: Japanese sentence — English\n\n" +
        "Warm tone. End with encouragement.";
    } else {
      prompt = "Create a warm JLPT N2 study activity for " + (u.name||"my student") + ".\n" +
        "Task: \"" + task.title + "\". Description: \"" + task.description + "\".\n" +
        "Personal, not textbook-like. Under 150 words.\n" +
        "End with a small exercise or reflection question.";
    }

    callHana(prompt).then(function(content) {
      if (tc) tc.innerHTML = self.formatTaskContent(content);
      if (tdb) tdb.style.display = "block";
    });
  },

  formatTaskContent: function(text) {
    var LABELS = ["SUMMARY", "PATTERN", "EXAMPLE 1", "EXAMPLE 2", "TIP", "WORD", "EXAMPLE"];
    var lines  = text.split("\n").filter(function(l){ return l.trim(); });
    var html   = '<div class="grammar-content">';
    lines.forEach(function(line) {
      var matched = null;
      for (var i = 0; i < LABELS.length; i++) {
        if (line.toUpperCase().indexOf(LABELS[i] + ":") === 0) { matched = LABELS[i]; break; }
      }
      if (matched) {
        var body = line.substring(matched.length + 1).trim();
        html += '<div class="grammar-block"><h4>' + matched + '</h4><p>' + body + '</p></div>';
      } else if (line.trim()) {
        html += '<div class="grammar-block"><p>' + line + '</p></div>';
      }
    });
    return html + '</div>';
  },

  completeTask: function() {
    if (this.activeTaskIndex < 0) return;
    var task = this.currentTasks[this.activeTaskIndex];
    task.completed = true;

    var u = STATE.user();
    u.totalXp           += task.xp_reward;
    u.sessionsCompleted  = (u.sessionsCompleted||0) + 1;

    var today     = new Date().toDateString();
    var yesterday = new Date(Date.now() - 86400000).toDateString();
    if (u.lastStudyDate !== today) {
      if (u.lastStudyDate === yesterday) {
        u.streak = (u.streak||0) + 1;
      } else {
        if ((u.streak||0) > 0 && u.achievements.indexOf("not_giving_up") === -1) {
          u.achievements.push("not_giving_up");
        }
        u.streak = 1;
      }
      u.lastStudyDate = today;
      var day = new Date().getDay();
      if (!u.weekActivity) u.weekActivity = [0,0,0,0,0,0,0];
      u.weekActivity[day] = (u.weekActivity[day]||0) + task.xp_reward;
    }
    if (u.streak > (u.longestStreak||0)) u.longestStreak = u.streak;

    // Check achievements
    var self = this;
    ACHIEVEMENT_DEFS.forEach(function(def) {
      if (u.achievements.indexOf(def.id) === -1 && def.check(u)) u.achievements.push(def.id);
    });

    // Honor system unlock when all tasks done
    if (this.currentTasks.every(function(t){ return t.completed; })) {
      STATE.set("unlock_earned", { earnedAt: Date.now(), minutesEarned: 20, used: false });
      this.toast("🎉 All tasks done! 20 min of social media unlocked!");
    }

    STATE.saveUser(u);
    this.showCelebration(task.title, task.xp_reward);
  },

  showCelebration: function(title, xp) {
    var msgs = [
      { emoji:"🎉", heading:"Wonderful!",     body:"\"" + title + "\" done! One more step forward." },
      { emoji:"🌸", heading:"Hana is proud!", body:"Every small step adds up. You're doing great!" },
      { emoji:"⭐", heading:"You did it!",     body:"Your Japanese is getting stronger. Keep going!" },
      { emoji:"🌱", heading:"Growing!",        body:"Tiny steps every day — that's the whole secret." }
    ];
    var m = msgs[Math.floor(Math.random() * msgs.length)];
    var ce = document.getElementById("cel-emoji");
    var ct = document.getElementById("cel-title");
    var cm = document.getElementById("cel-msg");
    var cx = document.getElementById("cel-xp");
    var cv = document.getElementById("celebration");
    if (ce) ce.textContent = m.emoji;
    if (ct) ct.textContent = m.heading;
    if (cm) cm.textContent = m.body;
    if (cx) cx.textContent = xp;
    if (cv) cv.style.display = "flex";
  },

  closeCelebration: function() {
    var cv = document.getElementById("celebration");
    if (cv) cv.style.display = "none";
    this.goTo("home");
  },

  // ── VOCAB ─────────────────────────────────────────────────────
  startVocab: function() {
    this.vocabDeck = VOCAB_LIST.slice().sort(function(){ return Math.random() - 0.5; }).slice(0, 10);
    this.vocabIndex = 0;
    this.sessionXp  = 0;
    this.renderCard();
    var xf = document.getElementById("xp-fill");
    var sx = document.getElementById("session-xp");
    if (xf) xf.style.width = "0%";
    if (sx) sx.textContent = "0";
  },

  renderCard: function() {
    var card = this.vocabDeck[this.vocabIndex];
    if (!card) { this.vocabDone(); return; }
    var ck = document.getElementById("card-kanji");
    var cr = document.getElementById("card-reading");
    var cm = document.getElementById("card-meaning");
    var ce = document.getElementById("card-example");
    var vc = document.getElementById("vocab-counter");
    var ca = document.getElementById("card-actions");
    var fc = document.getElementById("flashcard");
    if (ck) ck.textContent = card.kanji;
    if (cr) cr.textContent = card.reading;
    if (cm) cm.textContent = card.meaning;
    if (ce) ce.textContent = card.example;
    if (vc) vc.textContent = (this.vocabIndex + 1) + "/" + this.vocabDeck.length;
    if (fc) fc.classList.remove("flipped");
    if (ca) ca.style.display = "none";
  },

  flipCard: function() {
    var fc = document.getElementById("flashcard");
    var ca = document.getElementById("card-actions");
    if (!fc) return;
    fc.classList.toggle("flipped");
    if (fc.classList.contains("flipped")) {
      setTimeout(function(){ if (ca) ca.style.display = "flex"; }, 300);
    } else {
      if (ca) ca.style.display = "none";
    }
  },

  vocabResult: function(result) {
    var xp = result === "knew" ? 5 : 2;
    this.sessionXp += xp;
    var sx = document.getElementById("session-xp");
    var xf = document.getElementById("xp-fill");
    if (sx) sx.textContent = this.sessionXp;
    if (xf) xf.style.width = Math.min(100, (this.sessionXp / (this.vocabDeck.length * 5)) * 100) + "%";
    if (result === "knew") {
      var u = STATE.user(); u.wordsLearned = (u.wordsLearned||0) + 1; STATE.saveUser(u);
    }
    this.vocabIndex++;
    if (this.vocabIndex >= this.vocabDeck.length) this.vocabDone();
    else this.renderCard();
  },

  vocabDone: function() {
    var u = STATE.user(); u.totalXp += this.sessionXp; STATE.saveUser(u);
    this.showCelebration("Vocab Session", this.sessionXp);
  },

  // ── TUTOR CHAT ───────────────────────────────────────────────
  sendMessage: function() {
    var self  = this;
    var input = document.getElementById("chat-input");
    if (!input) return;
    var msg = input.value.trim();
    if (!msg) return;
    input.value = ""; input.style.height = "auto";
    this.appendBubble("user", msg);
    var qp = document.getElementById("quick-prompts");
    if (qp) qp.style.display = "none";

    var loadId = "load-" + Date.now();
    this.appendBubble("hana", "🌸 thinking...", loadId, true);
    var sb = document.getElementById("send-btn");
    if (sb) sb.disabled = true;

    var histText = this.chatHistory.slice(-6).map(function(m){
      return (m.role === "user" ? "Student" : "Hana") + ": " + m.text;
    }).join("\n");
    var fullPrompt = histText ? "Previous conversation:\n" + histText + "\n\nStudent: " + msg : msg;

    callHana(fullPrompt).then(function(reply) {
      if (sb) sb.disabled = false;
      var loadEl = document.getElementById(loadId);
      if (loadEl) loadEl.querySelector(".bubble-text").textContent = reply;
      self.chatHistory.push({ role:"user", text:msg });
      self.chatHistory.push({ role:"assistant", text:reply });
      if (self.chatHistory.length > 20) self.chatHistory = self.chatHistory.slice(-20);
      var msgs = document.getElementById("chat-messages");
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    });
  },

  quickPrompt: function(msg) {
    var input = document.getElementById("chat-input");
    if (input) input.value = msg;
    this.sendMessage();
  },

  appendBubble: function(role, text, id, loading) {
    var div = document.createElement("div");
    div.className = "chat-bubble " + role;
    if (id) div.id = id;
    div.innerHTML = '<div class="bubble-text' + (loading ? " loading" : "") + '">' + text + '</div>';
    var msgs = document.getElementById("chat-messages");
    if (msgs) { msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight; }
  },

  // ── PROGRESS ─────────────────────────────────────────────────
  refreshProgress: function() {
    var u  = STATE.user();
    var lv = getLevel(u.totalXp);
    var idx = LEVELS.indexOf(lv);
    var next = LEVELS[idx + 1] || lv;
    var pct = next !== lv ? Math.min(100, ((u.totalXp - lv.min) / (next.min - lv.min)) * 100) : 100;

    var pk = document.getElementById("prog-level-kanji");
    var pn = document.getElementById("prog-level-name");
    var pt = document.getElementById("prog-xp-text");
    var lf = document.getElementById("level-fill");
    if (pk) pk.textContent = lv.kanji;
    if (pn) pn.textContent = lv.name;
    if (pt) pt.textContent = u.totalXp + " / " + next.min + " XP to next level";
    if (lf) lf.style.width = pct + "%";

    var ss = document.getElementById("stat-streak");
    var sw = document.getElementById("stat-words");
    var se = document.getElementById("stat-sessions");
    var sx = document.getElementById("stat-xp");
    if (ss) ss.textContent = u.streak || 0;
    if (sw) sw.textContent = u.wordsLearned || 0;
    if (se) se.textContent = u.sessionsCompleted || 0;
    if (sx) sx.textContent = u.totalXp || 0;

    var list   = document.getElementById("achievements-list");
    var earned = ACHIEVEMENT_DEFS.filter(function(d){ return (u.achievements||[]).indexOf(d.id) > -1; });
    if (list) {
      list.innerHTML = earned.length === 0
        ? '<p style="color:var(--muted);font-size:14px;text-align:center;padding:20px">Complete tasks to earn achievements! 🏅</p>'
        : earned.map(function(a){
            return '<div class="achievement-item"><span class="ach-icon">' + a.icon + '</span>' +
              '<div class="ach-text"><strong>' + a.title + '</strong><br><small>' + a.desc + '</small></div></div>';
          }).join("");
    }

    var days     = ["S","M","T","W","T","F","S"];
    var activity = u.weekActivity || [0,0,0,0,0,0,0];
    var maxVal   = Math.max.apply(null, activity.concat([1]));
    var wc = document.getElementById("week-chart");
    if (wc) {
      wc.innerHTML = days.map(function(d, i) {
        var h = Math.round((activity[i] / maxVal) * 60);
        return '<div class="week-bar-wrap">' +
          '<div class="week-bar ' + (activity[i] > 0 ? "has-data" : "") + '" style="height:' + (h||4) + 'px"></div>' +
          '<span class="week-day">' + d + '</span></div>';
      }).join("");
    }
  },

  // ── SOCIAL MEDIA UNLOCK — Option A Honor System ──────────────
  checkUnlock: function() {
    var unlock = STATE.get("unlock_earned");
    var us = document.getElementById("unlock-section");
    if (us) us.style.display = (unlock && !unlock.used) ? "block" : "none";
  },

  useUnlock: function() {
    var unlock = STATE.get("unlock_earned");
    if (!unlock || unlock.used) return;
    unlock.used = true; STATE.set("unlock_earned", unlock);
    var us = document.getElementById("unlock-section");
    if (us) us.style.display = "none";
    this.toast("📱 20 minutes unlocked! Enjoy your break 🌸", 5000);
    this.unlockTimeout = setTimeout(function() {
      App.toast("Break time is over! Ready to study again? 🌸", 5000);
    }, 20 * 60 * 1000);
  },

  // ── TOAST ─────────────────────────────────────────────────────
  toast: function(msg, duration) {
    if (!duration) duration = 3000;
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(function(){ t.classList.remove("show"); }, duration);
  }
};

// ── CLOSE CELEBRATION (called from HTML) ──────────────────────────
function closeCelebration() { App.closeCelebration(); }

// ── CHOICE CARDS ─────────────────────────────────────────────────
document.querySelectorAll(".choice-card").forEach(function(card) {
  card.addEventListener("click", function() {
    card.closest(".choice-grid").querySelectorAll(".choice-card")
      .forEach(function(c){ c.classList.remove("selected"); });
    card.classList.add("selected");
  });
});

document.querySelectorAll(".blocker-tag").forEach(function(tag) {
  tag.addEventListener("click", function(){ tag.classList.toggle("selected"); });
});

// Enter key helpers
var nameInput = document.getElementById("input-name");
if (nameInput) nameInput.addEventListener("keydown", function(e){ if (e.key === "Enter") App.saveName(); });

var chatInput = document.getElementById("chat-input");
if (chatInput) {
  chatInput.addEventListener("keydown", function(e){
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); App.sendMessage(); }
  });
  chatInput.addEventListener("input", function(){
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 100) + "px";
  });
}

// ── FALLING PETALS ────────────────────────────────────────────────
function createPetals() {
  var container = document.getElementById("petals");
  if (!container) return;
  for (var i = 0; i < 14; i++) {
    var p = document.createElement("div");
    p.className   = "petal";
    p.textContent = ["🌸","🌺","🌼"][Math.floor(Math.random() * 3)];
    p.style.left              = (Math.random() * 100) + "%";
    p.style.fontSize          = (12 + Math.random() * 14) + "px";
    p.style.animationDuration = (5 + Math.random() * 7) + "s";
    p.style.animationDelay    = (Math.random() * 10) + "s";
    container.appendChild(p);
  }
}

// ── BOOT ──────────────────────────────────────────────────────────
(function boot() {
  createPetals();

  // Wire up the splash "Let's Begin" button
  var splashBtn = document.getElementById("splash-btn");
  if (splashBtn) splashBtn.addEventListener("click", function(){ App.goTo("onboarding-1"); });

  // Wire up the celebration close button
  var celebBtn = document.getElementById("btn-close-celebration");
  if (celebBtn) celebBtn.addEventListener("click", function(){ App.closeCelebration(); });

  var onboarded = STATE.get("onboarded");
  var hasKey    = API_KEY !== "YOUR_API_KEY_HERE" || STATE.get("apikey");

  setTimeout(function() {
    if (onboarded && hasKey) App.goTo("home");
    // else: stay on splash — user presses "始めましょう → Let's Begin"
  }, 900);
})();

// Prevent double-tap zoom on mobile
document.addEventListener("touchend", function(e) {
  if (e.target.tagName === "BUTTON") e.preventDefault();
}, { passive: false });

// Expose globally for onclick= attributes
window.App = App;
