/* ═══════════════════════════════════════════════════════════════
   NIHONGOHEART — app.js
   AI: Google Gemini 2.0 Flash  |  Plain <script> — no modules
═══════════════════════════════════════════════════════════════ */

const API_KEY = "AIzaSyBMMmFwSs1oKEdIajTyxIg5mFFTO9KZMMw";

const VOCAB_LIST = [
  { kanji:"読む", reading:"よむ (yomu)", meaning:"to read", example:"本を読む — to read a book" },
  { kanji:"聞く", reading:"きき (kiku)", meaning:"to listen / ask", example:"音楽を聞く — to listen to music" },
  { kanji:"頑張る", reading:"がんばる (ganbaru)", meaning:"to do one's best", example:"試験に頑張る — do your best on the exam" }
];

const LEVELS = [
  { min:0, max:100, kanji:"旅人", name:"Traveler" },
  { min:101, max:500, kanji:"学生", name:"Student" },
  { min:501, max:1500, kanji:"修行者", name:"Apprentice" }
];

// STATE MANAGEMENT
var STATE = {
  get: function(key, fallback) {
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
      name:"", streak:0, totalXp:0, achievements:[], lastStudyDate:null, sessionsCompleted:0
    });
  },
  saveUser: function(u) { this.set("user", u); }
};

// GEMINI AI LOGIC
async function callHana(userPrompt) {
  if (API_KEY === "YOUR_API_KEY_HERE") return "Please set your API key! 🔑";
  
  try {
    const ai = new window.GoogleGenerativeAI(API_KEY);
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const system = "You are Hana-sensei, a warm Japanese tutor. Never say 'wrong'. Be encouraging.";
    const result = await model.generateContent(system + "\n\nStudent: " + userPrompt);
    return result.response.text();
  } catch(err) {
    return "Hana is taking a tea break! 🍵 Try again in a second.";
  }
}

// MAIN APP OBJECT
var App = {
  currentScreen: "splash",
  currentTasks: [],
  activeTaskIndex: -1,

  goTo: function(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById("screen-" + id).classList.add("active");
    this.currentScreen = id;
    if(id === 'home') this.refreshHome();
  },

  saveName: function() {
    var name = document.getElementById("input-name").value;
    if(!name) return;
    var u = STATE.user(); u.name = name; STATE.saveUser(u);
    this.goTo("home");
  },

  refreshHome: function() {
    var u = STATE.user();
    document.getElementById("home-name").textContent = u.name;
    document.getElementById("streak-count").textContent = u.streak;
    document.getElementById("total-xp").textContent = u.totalXp;
    
    // Fallback tasks if none generated
    this.currentTasks = [
        { title: "N2 Grammar Intro", type: "grammar", xp_reward: 20, completed: false },
        { title: "Daily Vocab", type: "vocab", xp_reward: 15, completed: false }
    ];
    this.renderTasks();
  },

  renderTasks: function() {
    var html = this.currentTasks.map((t, i) => `
        <div class="task-card ${t.completed ? 'completed' : ''}" onclick="App.startTask(${i})">
            <span>${t.title}</span>
            <small>+${t.xp_reward} XP</small>
        </div>
    `).join('');
    document.getElementById("task-list").innerHTML = html;
  },

  startTask: async function(idx) {
    this.activeTaskIndex = idx;
    var task = this.currentTasks[idx];
    this.goTo("task");
    document.getElementById("task-screen-title").textContent = task.title;
    document.getElementById("task-content").innerHTML = "Hana is writing your lesson... 🌸";
    
    const res = await callHana("Explain a JLPT N2 concept related to " + task.title);
    document.getElementById("task-content").innerHTML = res;
  },

  completeTask: function() {
    var u = STATE.user();
    var task = this.currentTasks[this.activeTaskIndex];
    u.totalXp += task.xp_reward;
    u.sessionsCompleted++;
    u.streak = 1; // Simplified for MVP
    STATE.saveUser(u);
    this.showCelebration(task.title, task.xp_reward);
  },

  showCelebration: function(title, xp) {
    document.getElementById("cel-msg").textContent = "You finished: " + title;
    document.getElementById("cel-xp").textContent = xp;
    document.getElementById("celebration").style.display = "flex";
  },

  closeCelebration: function() {
    document.getElementById("celebration").style.display = "none";
    this.goTo("home");
  },

  useUnlock: function() {
      alert("Enjoy your 20 minutes! Hana will be here when you return. 🌸");
  }
};

// INITIALIZE
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("splash-btn").addEventListener("click", () => App.goTo("onboarding-1"));
  document.getElementById("btn-save-name").addEventListener("click", () => App.saveName());
  
  if (STATE.user().name) {
    App.goTo("home");
  } else {
    App.goTo("splash");
  }
});
