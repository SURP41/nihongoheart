/* ═══════════════════════════════════════════════════════════════
   NIHONGOHEART — app.js (Blueprint Compliant)
═══════════════════════════════════════════════════════════════ */

const API_KEY = "AIzaSyBMMmFwSs1oKEdIajTyxIg5mFFTO9KZMMw"; // PASTE YOUR KEY

// 1. STATE & STORAGE
const STATE = {
    user: JSON.parse(localStorage.getItem('nh_user')) || {
        name: "",
        xp: 0,
        streak: 0,
        rank: "旅人",
        onboarded: false
    },
    save() {
        localStorage.setItem('nh_user', JSON.stringify(this.user));
    }
};

// 2. AI CONFIG
async function askHana(prompt) {
    try {
        const genAI = new window.GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(`You are Hana-sensei. ${prompt}`);
        return result.response.text();
    } catch (e) {
        return "🌸 Hana is resting. Try again in a moment!";
    }
}

// 3. UI ENGINE
const App = {
    init() {
        this.createPetals();
        this.bindEvents();
        
        if (STATE.user.onboarded) {
            this.goTo('home');
        } else {
            this.goTo('splash');
        }
    },

    bindEvents() {
        document.getElementById('btn-start').onclick = () => this.goTo('onboarding-1');
        document.getElementById('btn-save-name').onclick = () => this.saveName();
    },

    goTo(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-' + screenId).classList.add('active');
        if (screenId === 'home') this.renderHome();
    },

    createPetals() {
        const container = document.getElementById('petals');
        for (let i = 0; i < 15; i++) {
            const petal = document.createElement('div');
            petal.className = 'petal';
            petal.innerHTML = '🌸';
            petal.style.left = Math.random() * 100 + 'vw';
            petal.style.animationDuration = (Math.random() * 3 + 2) + 's';
            petal.style.animationDelay = Math.random() * 5 + 's';
            container.appendChild(petal);
        }
    },

    saveName() {
        const val = document.getElementById('input-name').value;
        if (!val) return this.showToast("Please enter a name!");
        STATE.user.name = val;
        STATE.user.onboarded = true;
        STATE.save();
        this.goTo('home');
    },

    renderHome() {
        document.getElementById('display-name').textContent = STATE.user.name;
        document.getElementById('display-xp').textContent = STATE.user.xp + " XP";
        document.getElementById('display-streak').textContent = STATE.user.streak;
        
        const tasks = [
            { id: 1, title: "Morning Grammar", xp: 15, icon: "🏮" },
            { id: 2, title: "Vocab Sprint", xp: 10, icon: "🎴" }
        ];

        document.getElementById('task-list').innerHTML = tasks.map(t => `
            <div class="task-card" onclick="App.startTask('${t.title}')">
                <div class="task-icon">${t.icon}</div>
                <div class="task-info">
                    <div class="task-title">${t.title}</div>
                    <div class="task-xp">+${t.xp} XP</div>
                </div>
                <div class="task-check">→</div>
            </div>
        `).join('');
    },

    async startTask(title) {
        this.goTo('task');
        document.getElementById('task-title').textContent = title;
        const body = document.getElementById('task-body');
        body.innerHTML = '<div class="task-loading"><span class="hana-spin">🌸</span><p>Hana is preparing your lesson...</p></div>';
        
        const response = await askHana(`Create a 3-sentence lesson about: ${title}. Use simple Japanese and English.`);
        body.innerHTML = `<div class="grammar-block"><p>${response}</p></div>`;
    },

    completeTask() {
        STATE.user.xp += 20;
        STATE.user.streak = 1;
        STATE.save();
        this.showToast("Success! +20 XP");
        this.goTo('home');
    },

    showToast(msg) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    }
};

// Start App
window.onload = () => App.init();
