/* ═══════════════════════════════════════════
   NIHONGOHEART — app.js
   Full application logic
═══════════════════════════════════════════ */

// ── VOCABULARY DATA (200 N2 words sample) ──────────────────────────
const VOCAB_LIST = [
  { kanji:"読む", reading:"よむ (yomu)", meaning:"to read", example:"本を読む — to read a book" },
  { kanji:"聞く", reading:"きく (kiku)", meaning:"to listen / ask", example:"音楽を聞く — to listen to music" },
  { kanji:"書く", reading:"かく (kaku)", meaning:"to write", example:"手紙を書く — to write a letter" },
  { kanji:"話す", reading:"はなす (hanasu)", meaning:"to speak", example:"日本語を話す — to speak Japanese" },
  { kanji:"覚える", reading:"おぼえる (oboeru)", meaning:"to memorize", example:"単語を覚える — to memorize vocab" },
  { kanji:"忘れる", reading:"わすれる (wasureru)", meaning:"to forget", example:"名前を忘れた — I forgot the name" },
  { kanji:"調べる", reading:"しらべる (shiraberu)", meaning:"to investigate / look up", example:"辞書で調べる — look up in a dictionary" },
  { kanji:"確認する", reading:"かくにんする (kakunin suru)", meaning:"to confirm / verify", example:"予約を確認する — confirm a reservation" },
  { kanji:"決める", reading:"きめる (kimeru)", meaning:"to decide", example:"計画を決める — decide on a plan" },
  { kanji:"集める", reading:"あつめる (atsumeru)", meaning:"to collect / gather", example:"情報を集める — gather information" },
  { kanji:"比べる", reading:"くらべる (kuraberu)", meaning:"to compare", example:"価格を比べる — compare prices" },
  { kanji:"続ける", reading:"つづける (tsuzukeru)", meaning:"to continue", example:"勉強を続ける — continue studying" },
  { kanji:"伝える", reading:"つたえる (tsutaeru)", meaning:"to convey / tell", example:"気持ちを伝える — convey feelings" },
  { kanji:"受ける", reading:"うける (ukeru)", meaning:"to receive / take (exam)", example:"試験を受ける — take an exam" },
  { kanji:"増える", reading:"ふえる (fueru)", meaning:"to increase", example:"人口が増える — population increases" },
  { kanji:"減る", reading:"へる (heru)", meaning:"to decrease", example:"体重が減る — weight decreases" },
  { kanji:"気づく", reading:"きづく (kiduku)", meaning:"to notice / realize", example:"間違いに気づく — notice a mistake" },
  { kanji:"諦める", reading:"あきらめる (akirameru)", meaning:"to give up", example:"夢を諦めない — don't give up on dreams" },
  { kanji:"頑張る", reading:"がんばる (ganbaru)", meaning:"to do one's best", example:"試験に頑張る — do your best on the exam" },
  { kanji:"努力", reading:"どりょく (doryoku)", meaning:"effort / hard work", example:"努力を続ける — keep making effort" },
  { kanji:"経験", reading:"けいけん (keiken)", meaning:"experience", example:"経験を積む — gain experience" },
  { kanji:"目標", reading:"もくひょう (mokuhyou)", meaning:"goal / target", example:"目標を達成する — achieve a goal" },
  { kanji:"成功", reading:"せいこう (seikou)", meaning:"success", example:"成功を祝う — celebrate success" },
  { kanji:"失敗", reading:"しっぱい (shippai)", meaning:"failure", example:"失敗から学ぶ — learn from failure" },
  { kanji:"機会", reading:"きかい (kikai)", meaning:"opportunity / chance", example:"機会を活かす — make use of an opportunity" },
  { kanji:"問題", reading:"もんだい (mondai)", meaning:"problem / question", example:"問題を解く — solve a problem" },
  { kanji:"方法", reading:"ほうほう (houhou)", meaning:"method / way", example:"別の方法を試す — try another method" },
  { kanji:"理由", reading:"りゆう (riyuu)", meaning:"reason", example:"理由を説明する — explain the reason" },
  { kanji:"結果", reading:"けっか (kekka)", meaning:"result / outcome", example:"結果を確認する — check the result" },
  { kanji:"影響", reading:"えいきょう (eikyou)", meaning:"influence / effect", example:"社会に影響する — influence society" },
];

// ── STATE ──────────────────────────────────────────────────────────
const STATE = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem('nhk_' + key); return v !== null ? JSON.parse(v) : fallback; } 
    catch(e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('nhk_' + key, JSON.stringify(value)); } catch(e) {}
  },
  user() {
    return this.get('user', {
      name: '', why: '', minutes: 15, blockers: [],
      streak: 0, longestStreak: 0, totalXp: 0, level: 0,
      wordsLearned: 0, sessionsCompleted: 0,
      lastStudyDate: null, achievements: [],
      weekActivity: [0,0,0,0,0,0,0],
    });
  },
  saveUser(u) { this.set('user', u); },
};

// ── LEVELS ────────────────────────────────────────────────────────
const LEVELS = [
  { min:0,    max:100,  kanji:'旅人', name:'Traveler' },
  { min:101,  max:500,  kanji:'学生', name:'Student' },
  { min:501,  max:1500, kanji:'修行者', name:'Apprentice' },
  { min:1501, max:3500, kanji:'侍', name:'Samurai' },
  { min:3501, max:99999,kanji:'先生', name:'Sensei' },
];
function getLevel(xp) {
  return LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[0];
}

// ── ACHIEVEMENTS ──────────────────────────────────────────────────
const ACHIEVEMENT_DEFS = [
  { id:'first_step',     icon:'👣', title:'First Step',        desc:'Completed your first task',       check: u => u.sessionsCompleted >= 1 },
  { id:'not_giving_up',  icon:'💪', title:'Not Giving Up',     desc:'Returned after a 3+ day break',   check: u => u.achievements.includes('not_giving_up') },
  { id:'week_warrior',   icon:'🔥', title:'Week Warrior',      desc:'7-day streak achieved',            check: u => u.streak >= 7 },
  { id:'vocab_start',    icon:'📖', title:'Word Collector',    desc:'Learned 20 vocabulary words',     check: u => u.wordsLearned >= 20 },
  { id:'quiet_champion', icon:'🏅', title:'Quiet Champion',    desc:'Studied 7 days quietly',          check: u => u.sessionsCompleted >= 7 },
  { id:'xp_100',         icon:'⭐', title:'First Hundred',     desc:'Earned 100 XP',                  check: u => u.totalXp >= 100 },
];

// ── HANA AI ───────────────────────────────────────────────────────
let chatHistory = [];

async function callHana(userMessage, systemOverride = null) {
  const apiKey = STATE.get('apikey');
  if (!apiKey) return "Please set your API key in settings! 🔑";
  
  const u = STATE.user();
  const systemPrompt = systemOverride || `You are Hana-sensei, a warm, patient, and encouraging Japanese language tutor.
Your student is preparing for the JLPT N2 exam.

YOUR PERSONALITY:
- Speak like a kind older sister or supportive mentor
- Never use harsh corrections — always rephrase gently
- Celebrate every small win, even tiny ones
- Use simple English — never assume prior grammar knowledge
- Keep explanations under 5 sentences unless asked for more
- Use emojis sparingly but warmly (1-2 per message max)
- If a student seems frustrated, acknowledge it before teaching

USER CONTEXT:
Name: ${u.name} | Streak: ${u.streak} days | Total XP: ${u.totalXp}

RULES:
- Never say "wrong" — say "almost!" or "good try!"
- Never give more than 3 new pieces of information at once
- Always end with one actionable next step or encouraging word
- If asked about non-Japanese topics, gently redirect`;

  chatHistory.push({ role: 'user', content: userMessage });

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: systemPrompt,
        messages: chatHistory.slice(-10),
      })
    });
    const data = await res.json();
    if (data.error) { return "Hana is resting right now. Check your API key! 🌸"; }
    const reply = data.content[0].text;
    chatHistory.push({ role: 'assistant', content: reply });
    return reply;
  } catch(e) {
    return "Hana couldn't connect. Please check your internet and API key. 🙏";
  }
}

async function generateTasksFromAI(mood, minutes, name) {
  const taskCount = minutes >= 30 ? 3 : minutes >= 15 ? 2 : 1;
  const taskDuration = Math.floor(minutes / taskCount);
  
  const prompt = `Generate exactly ${taskCount} study tasks for JLPT N2 student ${name}.
Mood: ${mood}/5. Available: ${minutes} minutes total. Each task: ${taskDuration} min max.
${mood <= 2 ? 'Mood is low — make tasks very easy and confidence-building.' : ''}
${mood >= 4 ? 'Good mood — can include a slightly harder challenge.' : ''}

Rules:
- Mix task types (vocab, grammar, reading, fun)
- Give warm encouraging titles
- Format as ONLY a JSON array, no markdown, no extra text:
[{"title":"...","type":"vocab|grammar|reading","duration_min":5,"description":"...","xp_reward":20,"icon":"📚"}]`;

  const systemPrompt = `You are a JSON API. Return ONLY a valid JSON array. No explanations, no markdown, no code blocks. Raw JSON only.`;
  
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': STATE.get('apikey'),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    let text = data.content[0].text.trim();
    text = text.replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch(e) {
    // Fallback tasks
    return [
      { title:"5 Quick Vocabulary Words", type:"vocab", duration_min: taskDuration, description:"Review 5 N2 vocabulary words with flashcards.", xp_reward:15, icon:"📚" },
      { title:"Grammar: ように explained", type:"grammar", duration_min: taskDuration, description:"Ask Hana to explain a grammar point you find tricky.", xp_reward:20, icon:"📝" },
    ].slice(0, taskCount);
  }
}

// ── APP CONTROLLER ─────────────────────────────────────────────────
const App = {
  currentScreen: 'splash',
  currentMood: 3,
  currentTasks: [],
  activeTaskIndex: -1,
  vocabIndex: 0,
  vocabDeck: [],
  sessionXp: 0,
  unlockInterval: null,
  unlockSecondsLeft: 0,

  // Navigation
  goTo(screenId) {
    const current = document.getElementById('screen-' + this.currentScreen);
    const next = document.getElementById('screen-' + screenId);
    if (!next) return;
    if (current) current.classList.remove('active');
    this.currentScreen = screenId;
    next.classList.add('active');
    this.onScreenEnter(screenId);
  },

  onScreenEnter(screenId) {
    if (screenId === 'home') this.refreshHome();
    if (screenId === 'vocab') this.startVocab();
    if (screenId === 'progress') this.refreshProgress();
    if (screenId === 'checkin') this.refreshCheckin();
  },

  // ── ONBOARDING ──────────────────────────────────────────────────
  saveName() {
    const v = document.getElementById('input-name').value.trim();
    if (!v) { this.toast('Please enter your name 😊'); return; }
    const u = STATE.user(); u.name = v; STATE.saveUser(u);
    this.goTo('onboarding-2');
  },

  saveWhy() {
    const selected = document.querySelector('#why-choices .selected');
    if (!selected) { this.toast('Pick one that feels right 🌸'); return; }
    const u = STATE.user(); u.why = selected.dataset.value; STATE.saveUser(u);
    this.goTo('onboarding-3');
  },

  selectTime(mins) {
    document.querySelectorAll('.time-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`.time-card[data-minutes="${mins}"]`).classList.add('selected');
  },

  saveTime() {
    const selected = document.querySelector('.time-card.selected');
    if (!selected) { this.toast('Choose a study time 🕐'); return; }
    const u = STATE.user(); u.minutes = parseInt(selected.dataset.minutes); STATE.saveUser(u);
    this.goTo('onboarding-4');
  },

  saveBlockers() {
    const selected = [...document.querySelectorAll('.blocker-tag.selected')].map(el => el.dataset.value);
    const u = STATE.user(); u.blockers = selected; STATE.saveUser(u);
    this.goTo('onboarding-5');
  },

  saveApiKey() {
    const v = document.getElementById('input-apikey').value.trim();
    if (!v || !v.startsWith('sk-')) { this.toast('Paste a valid API key (starts with sk-)'); return; }
    STATE.set('apikey', v);
    STATE.set('onboarded', true);
    this.goTo('checkin');
  },

  // ── CHECK-IN ────────────────────────────────────────────────────
  refreshCheckin() {
    const u = STATE.user();
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    document.getElementById('checkin-greeting').textContent = 
      `${greet}, ${u.name || 'friend'}! How are you feeling today? 🌸`;
    document.getElementById('commitment-section').style.display = 'none';
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  },

  selectMood(n) {
    this.currentMood = n;
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    document.querySelector(`.mood-btn[data-mood="${n}"]`).classList.add('selected');
    document.getElementById('commitment-section').style.display = 'flex';
  },

  async generateTasks() {
    const commitment = document.getElementById('commitment-input').value.trim();
    const btn = document.getElementById('generate-tasks-btn');
    const btnText = document.getElementById('gen-btn-text');
    const btnLoader = document.getElementById('gen-btn-loader');
    
    if (!STATE.get('apikey')) {
      this.toast('Set your API key first! Go back to settings.');
      return;
    }
    
    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';

    const u = STATE.user();
    const tasks = await generateTasksFromAI(this.currentMood, u.minutes, u.name);
    
    // Save commitment & tasks
    const plan = { date: new Date().toDateString(), tasks, commitment, mood: this.currentMood };
    STATE.set('dailyPlan', plan);
    this.currentTasks = tasks.map(t => ({ ...t, completed: false }));

    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';

    this.goTo('home');
  },

  // ── HOME ────────────────────────────────────────────────────────
  refreshHome() {
    const u = STATE.user();
    const hour = new Date().getHours();
    const greetings = ['おはよう', 'こんにちは', 'こんばんは'];
    const greet = hour < 12 ? greetings[0] : hour < 17 ? greetings[1] : greetings[2];
    
    document.getElementById('home-greeting').textContent = greet + '!';
    document.getElementById('home-name').textContent = u.name || 'Friend';
    
    const lv = getLevel(u.totalXp);
    document.getElementById('home-level').textContent = lv.kanji;
    document.getElementById('home-xp').textContent = u.totalXp + ' XP';
    document.getElementById('streak-count').textContent = u.streak;
    document.getElementById('total-xp').textContent = u.totalXp;
    
    // Load tasks
    const plan = STATE.get('dailyPlan');
    const todayPlan = plan && plan.date === new Date().toDateString() ? plan : null;
    
    if (todayPlan || this.currentTasks.length > 0) {
      const tasks = this.currentTasks.length > 0 ? this.currentTasks : 
        (todayPlan ? todayPlan.tasks.map(t => ({ ...t, completed: false })) : []);
      if (this.currentTasks.length === 0) this.currentTasks = tasks;
      this.renderTasks();
    } else {
      document.getElementById('task-list').innerHTML = `
        <div class="task-placeholder">
          <p>No tasks yet! Check in to get your tasks. 🌸</p>
          <button class="btn-secondary" onclick="App.goTo('checkin')">Morning Check-in</button>
        </div>`;
    }
  },

  renderTasks() {
    const list = document.getElementById('task-list');
    if (!this.currentTasks.length) return;
    list.innerHTML = this.currentTasks.map((t, i) => `
      <div class="task-card ${t.completed ? 'completed' : ''}" onclick="App.startTask(${i})">
        <span class="task-icon">${t.icon || '📝'}</span>
        <div class="task-info">
          <div class="task-title">${t.title}</div>
          <div class="task-meta">${t.type} · ${t.duration_min} min</div>
        </div>
        <span class="task-xp">+${t.xp_reward} XP</span>
        <span class="task-check">${t.completed ? '✅' : '○'}</span>
      </div>`).join('');
  },

  // ── TASK SCREEN ─────────────────────────────────────────────────
  async startTask(idx) {
    const task = this.currentTasks[idx];
    if (task.completed) { this.toast('Already completed! ✅'); return; }
    
    this.activeTaskIndex = idx;
    document.getElementById('task-screen-title').textContent = task.title;
    document.getElementById('task-xp-reward').textContent = task.xp_reward;
    document.getElementById('task-done-btn').style.display = 'none';
    document.getElementById('task-content').innerHTML = `
      <div class="task-loading">
        <div class="hana-spin">🌸</div>
        <p>Hana is preparing your lesson...</p>
      </div>`;
    
    this.goTo('task');

    // AI-generate lesson content
    const u = STATE.user();
    let prompt = '';
    if (task.type === 'grammar') {
      prompt = `Generate a grammar lesson for JLPT N2 student ${u.name}. 
Task: "${task.title}". Description: "${task.description}"
Format your response with these clearly labeled sections:
SUMMARY: (one line plain English, like explaining to a 12-year-old)
PATTERN: (structure pattern)
EXAMPLE 1: (Japanese with reading + English translation)
EXAMPLE 2: (another example)
TIP: (one memory tip)
Keep it warm and encouraging. Under 150 words total.`;
    } else if (task.type === 'vocab') {
      prompt = `Create a mini vocab lesson for JLPT N2 student ${u.name}.
Task: "${task.title}". Description: "${task.description}"
Give 5 N2 vocabulary words, each formatted as:
WORD: (kanji) - (reading) - (meaning)
EXAMPLE: (example sentence in Japanese + English)
Keep it warm and encouraging! 🌸`;
    } else {
      prompt = `Create an engaging study activity for JLPT N2 student ${u.name}.
Task: "${task.title}". Description: "${task.description}"
Make it feel like a personal lesson, not a textbook. Keep it under 150 words. Include something interactive at the end (a question to think about or a short exercise).`;
    }

    const content = await callHana(prompt);
    document.getElementById('task-content').innerHTML = this.formatTaskContent(content);
    document.getElementById('task-done-btn').style.display = 'block';
  },

  formatTaskContent(text) {
    const paragraphs = text.split('\n').filter(l => l.trim());
    return '<div class="grammar-content">' +
      paragraphs.map(p => {
        if (p.match(/^(SUMMARY|PATTERN|TIP|WORD|EXAMPLE):/i)) {
          const [label, ...rest] = p.split(':');
          return `<div class="grammar-block"><h4>${label}</h4><p>${rest.join(':').trim()}</p></div>`;
        }
        return `<div class="grammar-block"><p>${p}</p></div>`;
      }).join('') + '</div>';
  },

  completeTask() {
    if (this.activeTaskIndex < 0) return;
    const task = this.currentTasks[this.activeTaskIndex];
    task.completed = true;
    
    // Award XP
    const u = STATE.user();
    u.totalXp += task.xp_reward;
    u.sessionsCompleted += 1;
    
    // Update streak
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (u.lastStudyDate !== today) {
      if (u.lastStudyDate === yesterday) {
        u.streak += 1;
      } else if (!u.lastStudyDate) {
        u.streak = 1;
      } else {
        // Comeback
        if (u.streak > 0) this.grantAchievement(u, 'not_giving_up');
        u.streak = 1;
      }
      u.lastStudyDate = today;
      // Update week activity
      const dayIdx = new Date().getDay();
      if (!u.weekActivity) u.weekActivity = [0,0,0,0,0,0,0];
      u.weekActivity[dayIdx] = (u.weekActivity[dayIdx] || 0) + task.xp_reward;
    }
    
    if (u.streak > u.longestStreak) u.longestStreak = u.streak;
    
    // Check achievements
    ACHIEVEMENT_DEFS.forEach(def => {
      if (!u.achievements.includes(def.id) && def.check(u)) {
        u.achievements.push(def.id);
      }
    });
    
    // Unlock social media if all tasks done
    const allDone = this.currentTasks.every(t => t.completed);
    if (allDone) {
      STATE.set('unlock_earned', { earnedAt: Date.now(), minutesEarned: 20, used: false });
    }
    
    STATE.saveUser(u);
    this.showCelebration(task.title, task.xp_reward);
  },

  grantAchievement(u, id) {
    if (!u.achievements.includes(id)) u.achievements.push(id);
  },

  showCelebration(title, xp) {
    const messages = [
      { emoji:'🎉', title:'Wonderful!', msg: `You completed "${title}"!` },
      { emoji:'🌸', title:'Hana is proud!', msg: 'That\'s one more step forward!' },
      { emoji:'⭐', title:'You did it!', msg: 'Every task counts. Keep going!' },
      { emoji:'🌱', title:'Growing!', msg: 'Your Japanese is getting stronger.' },
    ];
    const m = messages[Math.floor(Math.random() * messages.length)];
    document.getElementById('cel-emoji').textContent = m.emoji;
    document.getElementById('cel-title').textContent = m.title;
    document.getElementById('cel-msg').textContent = m.msg;
    document.getElementById('cel-xp').textContent = xp;
    document.getElementById('celebration').style.display = 'flex';
  },

  closeCelebration() {
    document.getElementById('celebration').style.display = 'none';
    this.goTo('home');
  },

  // ── VOCAB ────────────────────────────────────────────────────────
  startVocab() {
    this.vocabDeck = [...VOCAB_LIST].sort(() => Math.random() - 0.5).slice(0, 10);
    this.vocabIndex = 0;
    this.sessionXp = 0;
    this.renderVocabCard();
    document.getElementById('xp-fill').style.width = '0%';
    document.getElementById('session-xp').textContent = '0';
  },

  renderVocabCard() {
    const card = this.vocabDeck[this.vocabIndex];
    if (!card) { this.vocabDone(); return; }
    
    document.getElementById('card-kanji').textContent = card.kanji;
    document.getElementById('card-reading').textContent = card.reading;
    document.getElementById('card-meaning').textContent = card.meaning;
    document.getElementById('card-example').textContent = card.example;
    document.getElementById('vocab-counter').textContent = `${this.vocabIndex + 1}/${this.vocabDeck.length}`;
    
    const fc = document.getElementById('flashcard');
    fc.classList.remove('flipped');
    document.getElementById('card-actions').style.display = 'none';
  },

  flipCard() {
    const fc = document.getElementById('flashcard');
    fc.classList.toggle('flipped');
    if (fc.classList.contains('flipped')) {
      setTimeout(() => { document.getElementById('card-actions').style.display = 'flex'; }, 300);
    } else {
      document.getElementById('card-actions').style.display = 'none';
    }
  },

  vocabResult(result) {
    const xp = result === 'knew' ? 5 : 2;
    this.sessionXp += xp;
    document.getElementById('session-xp').textContent = this.sessionXp;
    
    const maxXp = this.vocabDeck.length * 5;
    document.getElementById('xp-fill').style.width = Math.min(100, (this.sessionXp / maxXp) * 100) + '%';
    
    if (result === 'knew') {
      const u = STATE.user();
      u.wordsLearned = (u.wordsLearned || 0) + 1;
      STATE.saveUser(u);
    }
    
    this.vocabIndex++;
    if (this.vocabIndex >= this.vocabDeck.length) {
      this.vocabDone();
    } else {
      this.renderVocabCard();
    }
  },

  vocabDone() {
    const u = STATE.user();
    u.totalXp += this.sessionXp;
    STATE.saveUser(u);
    this.showCelebration('Vocab Session', this.sessionXp);
    this.toast(`Session complete! +${this.sessionXp} XP earned 🌸`);
  },

  // ── TUTOR ────────────────────────────────────────────────────────
  async sendMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;
    
    input.value = '';
    this.appendBubble('user', msg);
    
    // Hide quick prompts after first message
    document.getElementById('quick-prompts').style.display = 'none';
    
    // Loading bubble
    const loadId = 'load-' + Date.now();
    this.appendBubble('hana', '...', loadId, true);
    
    document.getElementById('send-btn').disabled = true;
    const reply = await callHana(msg);
    document.getElementById('send-btn').disabled = false;
    
    // Replace loading
    const loadBubble = document.getElementById(loadId);
    if (loadBubble) loadBubble.querySelector('.bubble-text').textContent = reply;
    
    this.scrollChat();
  },

  quickPrompt(msg) {
    document.getElementById('chat-input').value = msg;
    this.sendMessage();
  },

  appendBubble(role, text, id = null, loading = false) {
    const div = document.createElement('div');
    div.className = `chat-bubble ${role}`;
    if (id) div.id = id;
    div.innerHTML = `<div class="bubble-text ${loading ? 'loading' : ''}">${loading ? '🌸 thinking...' : text}</div>`;
    document.getElementById('chat-messages').appendChild(div);
    this.scrollChat();
  },

  scrollChat() {
    const msgs = document.getElementById('chat-messages');
    msgs.scrollTop = msgs.scrollHeight;
  },

  // ── PROGRESS ─────────────────────────────────────────────────────
  refreshProgress() {
    const u = STATE.user();
    const lv = getLevel(u.totalXp);
    const nextLv = LEVELS[LEVELS.indexOf(lv) + 1] || lv;
    const pct = nextLv !== lv ? Math.min(100, ((u.totalXp - lv.min) / (nextLv.min - lv.min)) * 100) : 100;
    
    document.getElementById('prog-level-kanji').textContent = lv.kanji;
    document.getElementById('prog-level-name').textContent = lv.name;
    document.getElementById('prog-xp-text').textContent = `${u.totalXp} / ${nextLv.min} XP to next level`;
    document.getElementById('level-fill').style.width = pct + '%';
    
    document.getElementById('stat-streak').textContent = u.streak;
    document.getElementById('stat-words').textContent = u.wordsLearned || 0;
    document.getElementById('stat-sessions').textContent = u.sessionsCompleted || 0;
    document.getElementById('stat-xp').textContent = u.totalXp;
    
    // Achievements
    const list = document.getElementById('achievements-list');
    const earned = ACHIEVEMENT_DEFS.filter(d => u.achievements.includes(d.id));
    if (earned.length === 0) {
      list.innerHTML = '<p style="color:var(--muted);font-size:14px;text-align:center;padding:20px">Complete tasks to earn achievements! 🏅</p>';
    } else {
      list.innerHTML = earned.map(a => `
        <div class="achievement-item">
          <span class="ach-icon">${a.icon}</span>
          <div class="ach-text"><strong>${a.title}</strong><br><small>${a.desc}</small></div>
        </div>`).join('');
    }
    
    // Week chart
    const days = ['S','M','T','W','T','F','S'];
    const activity = u.weekActivity || [0,0,0,0,0,0,0];
    const maxVal = Math.max(...activity, 1);
    document.getElementById('week-chart').innerHTML = days.map((d, i) => {
      const h = Math.round((activity[i] / maxVal) * 60);
      return `<div class="week-bar-wrap">
        <div class="week-bar ${activity[i] > 0 ? 'has-data' : ''}" style="height:${h || 4}px"></div>
        <span class="week-day">${d}</span>
      </div>`;
    }).join('');
  },

  // ── SOCIAL MEDIA UNLOCK ──────────────────────────────────────────
  useUnlock() {
    const unlock = STATE.get('unlock_earned');
    if (!unlock || unlock.used) return;
    unlock.used = true;
    STATE.set('unlock_earned', unlock);
    
    this.unlockSecondsLeft = 20 * 60;
    document.getElementById('unlock-section').style.display = 'none';
    this.toast('20 minutes unlocked! Enjoy your break. 📱');
    
    this.unlockInterval = setInterval(() => {
      this.unlockSecondsLeft--;
      if (this.unlockSecondsLeft <= 0) {
        clearInterval(this.unlockInterval);
        this.toast('Break time is over! Ready to study again? 🌸');
      }
    }, 1000);
  },

  checkUnlock() {
    const unlock = STATE.get('unlock_earned');
    const section = document.getElementById('unlock-section');
    if (unlock && !unlock.used) {
      section.style.display = 'block';
    }
  },

  // ── UTILS ─────────────────────────────────────────────────────────
  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  },
};

// ── CHOICE CARD SELECTION ─────────────────────────────────────────
document.querySelectorAll('.choice-card').forEach(card => {
  card.addEventListener('click', () => {
    card.closest('.choice-grid').querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
  });
});

document.querySelectorAll('.blocker-tag').forEach(tag => {
  tag.addEventListener('click', () => tag.classList.toggle('selected'));
});

// ── ENTER KEY SUPPORT ─────────────────────────────────────────────
document.getElementById('input-name')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') App.saveName();
});

document.getElementById('chat-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); App.sendMessage(); }
});

// Auto-resize chat input
document.getElementById('chat-input')?.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});

// ── FALLING PETALS ─────────────────────────────────────────────────
function createPetals() {
  const container = document.getElementById('petals');
  if (!container) return;
  for (let i = 0; i < 12; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    petal.textContent = ['🌸','🌺','🌼'][Math.floor(Math.random()*3)];
    petal.style.left = Math.random() * 100 + '%';
    petal.style.fontSize = (12 + Math.random() * 16) + 'px';
    petal.style.animationDuration = (4 + Math.random() * 6) + 's';
    petal.style.animationDelay = (Math.random() * 8) + 's';
    container.appendChild(petal);
  }
}

// ── INIT ──────────────────────────────────────────────────────────
(function init() {
  createPetals();
  
  const onboarded = STATE.get('onboarded');
  const apiKey = STATE.get('apikey');
  
  // Small delay for splash animation
  setTimeout(() => {
    if (onboarded && apiKey) {
      // Update streak on open
      const u = STATE.user();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (u.lastStudyDate && u.lastStudyDate !== today && u.lastStudyDate !== yesterday) {
        if (u.streak > 1) {
          // Streak broken, will show comeback tomorrow
        }
      }
      STATE.saveUser(u);
      App.goTo('home');
    }
  }, 800);
})();

// Prevent double-tap zoom on buttons (mobile)
document.addEventListener('touchend', e => {
  if (e.target.tagName === 'BUTTON') e.preventDefault();
}, { passive: false });
