/**
 * Align-X Academic Engine
 * Any Educational Field Profiler + Supabase Cloud Database + Gemini API
 */

const SUPABASE_URL = "https://eydgvjsgkqjyqjkkedi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZGd2anNna3FqeXFqa2tlZGkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1NzQ4OTc1MCwiZXhwIjoyMDczMDY1NzUwfQ.f11c7dG38yT7CwhL6f6f9lKkEee9r8r_placeholder";

let supabase = null;
try {
  if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn("Supabase init local:", e.message);
}

let activePhaseIdx = 0;

let currentStudent = {
  email: "guest@alignx.edu",
  name: "Aditya Pandey",
  academic_level: "Semester 6 • B.Tech Computer Science",
  career_goal: "Full-Stack Engineer",
  current_knowledge: "Solid understanding of JavaScript and React. Needs containerization, B+ tree disk structures, and Redis concurrency.",
  tenure: "3 Months",
  github: "adityarp2008",
  readiness: 68,
  curriculum_mastery: 60,
  concept_deficits: 40,
  target_pace: 75,
  xp: 800,
  level: 2,
  radar: {
    categories: ["Frontend", "Backend APIs", "System Design", "Databases", "DevOps", "Testing"],
    candidate: [85, 78, 42, 70, 35, 60],
    benchmark: [90, 85, 80, 85, 75, 75]
  },
  phases: [
    {
      phaseTitle: "Phase 1: Foundations & Systems Architecture",
      milestones: [
        { id: "p1-1", title: "Implement B+ Tree Indexing in PostgreSQL", hours: "6 hrs", desc: "Reduce random disk block reads.", completed: true, xp: 120 },
        { id: "p1-2", title: "Configure High-Performance Nginx Reverse Proxy", hours: "4 hrs", desc: "Isolate application runtime.", completed: true, xp: 90 }
      ]
    },
    {
      phaseTitle: "Phase 2: Concurrency & Distributed Storage",
      milestones: [
        { id: "p2-1", title: "Deploy Redis Atomic Lua Token Bucket Rate Limiter", hours: "8 hrs", desc: "Eliminate pod race conditions.", completed: false, xp: 200 },
        { id: "p2-2", title: "Design Multi-Region Event Pub/Sub with Kafka", hours: "10 hrs", desc: "Event ordering across brokers.", completed: false, xp: 250 }
      ]
    },
    {
      phaseTitle: "Phase 3: Production Hardening & Cloud Native",
      milestones: [
        { id: "p3-1", title: "Multi-Stage Docker Compose Containerization", hours: "6 hrs", desc: "Secure production containers.", completed: false, xp: 150 },
        { id: "p3-2", title: "Automate Integration & Stress Testing (Pytest/k6)", hours: "8 hrs", desc: "Load test concurrent scenarios.", completed: false, xp: 180 }
      ]
    }
  ]
};

// Continuous MCQ Bank
const endlessMCQBank = [
  {
    q: "Why do relational database engines (PostgreSQL, InnoDB) prefer B+ Trees over standard Red-Black Binary Trees for disk index storage?",
    topic: "Database Internals",
    options: [
      "Red-Black trees require non-volatile encryption keys on physical sectors.",
      "High fanout matches physical disk page block sizes, drastically reducing random I/O seeks.",
      "Binary trees cannot store variable-width VARCHAR columns."
    ],
    correct: 1,
    explanation: "Disks read and write in block pages (4KB-8KB). Because B+ Trees have huge fanouts, tree depth stays at 3-4 levels, requiring only 3-4 disk block seeks."
  },
  {
    q: "When implementing an atomic rate limiter across multiple auto-scaled Node.js instances, which architecture guarantees zero race conditions?",
    topic: "Distributed Systems",
    options: [
      "Using Redis running an atomic Lua script (Token Bucket algorithm).",
      "Storing requests in a local Node.js in-memory Map.",
      "Executing a SQL query: SELECT COUNT(*) WHERE created_at > NOW() - INTERVAL '1 minute'."
    ],
    correct: 0,
    explanation: "Redis executes Lua scripts atomically in a single event loop iteration without distributed lock contention across multiple pods."
  },
  {
    q: "In the JavaScript V8 engine event loop, what executes first immediately following the current synchronous call stack?",
    topic: "JavaScript Runtime",
    options: [
      "Macro-tasks scheduled via setTimeout.",
      "Micro-task queue jobs (Promise.then, queueMicrotask).",
      "I/O polling callbacks."
    ],
    correct: 1,
    explanation: "The microtask queue is completely drained immediately after the synchronous execution stack empties, BEFORE macrotasks run."
  }
];

let mcqSession = { total: 0, correct: 0, wrong: 0, answeredCurrent: false, incorrectReview: [] };

window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('alignx_accent') || 'purple';
  setAccentTheme(savedTheme);

  const localSaved = localStorage.getItem('alignx_student_active');
  if (localSaved) {
    try {
      currentStudent = JSON.parse(localSaved);
    } catch (e) {
      console.warn("Using default session state");
    }
  }

  updateDashboardUI();
  initPointerGlow();
  setInterval(cycleFunFact, 8000);
  window.addEventListener('resize', renderRadar);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#dropdown-track-wrapper')) closeMenu('menu-tracks');
    if (!e.target.closest('#dropdown-theme-wrapper')) closeMenu('menu-themes');
    if (!e.target.closest('#dropdown-week-wrapper')) closeMenu('menu-weeks');
  });
});

// SYNC & UI UPDATES
function updateDashboardUI() {
  const s = currentStudent;
  document.getElementById('nav-current-role').textContent = s.career_goal || 'Custom Track';
  document.getElementById('nav-github-label').textContent = s.github ? `@${s.github}` : '@student';
  document.getElementById('nav-user-name').textContent = s.name || 'Student Scholar';
  document.getElementById('drawer-user-name').textContent = s.name || 'Student Scholar';
  document.getElementById('nav-academic-term').textContent = s.academic_level || 'Active Candidate';
  document.getElementById('drawer-user-goal').textContent = s.career_goal || 'Goal Unset';
  
  const initials = (s.name || 'AX').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  document.getElementById('nav-avatar-initials').textContent = initials;
  document.getElementById('nav-level-badge').textContent = `L${s.level || 1}`;

  // Telemetry Dials
  document.getElementById('meter-current-val').innerHTML = `${s.curriculum_mastery}% <span class="text-xs font-normal theme-text-sub">/100%</span>`;
  document.getElementById('meter-gap-val').innerHTML = `${s.concept_deficits}% <span class="text-xs font-normal theme-text-sub">untested</span>`;
  document.getElementById('meter-readiness-val').innerHTML = `${s.readiness}% <span class="text-xs font-normal theme-text-sub">score</span>`;
  document.getElementById('meter-time-val').innerHTML = `${s.target_pace || 75}% <span class="text-xs font-normal theme-text-sub">pace</span>`;

  document.getElementById('label-ring-1').textContent = `${s.curriculum_mastery}%`;
  document.getElementById('label-ring-2').textContent = `${s.concept_deficits}%`;
  document.getElementById('label-ring-3').textContent = `${s.readiness}%`;
  document.getElementById('label-ring-4').textContent = `${s.target_pace || 75}%`;

  updateRadialMeter('dial-ring-1', s.curriculum_mastery);
  updateRadialMeter('dial-ring-2', s.concept_deficits);
  updateRadialMeter('dial-ring-3', s.readiness);
  updateRadialMeter('dial-ring-4', s.target_pace || 75);

  // XP & Level
  document.getElementById('xp-level-title').textContent = `⚡ Level ${s.level || 1}: Apprentice Architect`;
  document.getElementById('xp-progress-label').textContent = `${s.xp || 0} / 1000 XP`;
  document.getElementById('xp-progress-bar').style.width = `${Math.min(100, ((s.xp || 0) % 1000) / 10)}%`;

  renderStudyPlanModules();
  renderRoadmapModal();
  renderRadar();
}

function updateRadialMeter(circleId, percentage) {
  const circle = document.getElementById(circleId);
  if (!circle) return;
  const clamped = Math.max(0, Math.min(100, percentage));
  const circumference = 2 * Math.PI * 26; // r = 26
  circle.style.strokeDasharray = `${circumference}`;
  circle.style.strokeDashoffset = circumference - (clamped / 100) * circumference;
}

// INTERACTIVE STUDY PLAN RENDERER
function changeStudyPlanPhase(phaseIdx) {
  activePhaseIdx = phaseIdx;
  document.getElementById('active-week-label').textContent = `Phase ${phaseIdx + 1}`;
  closeMenu('menu-weeks');
  renderStudyPlanModules();
}

function renderStudyPlanModules() {
  const container = document.getElementById('study-plan-modules-container');
  if (!container) return;
  container.innerHTML = '';

  const phases = currentStudent.phases || [];
  const currentPhase = phases[activePhaseIdx] || phases[0];

  if (!currentPhase || !currentPhase.milestones || currentPhase.milestones.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center theme-card-inner rounded-2xl space-y-2">
        <p class="theme-text-sub">No milestones generated yet.</p>
        <button onclick="openOnboardingModal()" class="btn-brand px-4 py-1.5 rounded-xl text-xs">✨ Generate with Gemini</button>
      </div>
    `;
    return;
  }

  currentPhase.milestones.forEach((m, idx) => {
    const item = document.createElement('div');
    item.className = "p-3.5 rounded-2xl study-module-card flex items-center justify-between gap-3 transition cursor-pointer";
    const statusClass = m.completed ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30' : 'bg-slate-500/10 text-slate-500 border border-slate-500/20';

    item.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="w-6 h-6 rounded-full bg-white/10 dynamic-accent-text font-bold flex items-center justify-center text-xs shrink-0">${idx + 1}</span>
        <div>
          <div class="study-module-title text-xs leading-snug ${m.completed ? 'line-through opacity-60' : ''}">${m.title}</div>
          <div class="study-module-desc text-[11px] mt-0.5">${m.desc || `${m.hours} focused exercise`}</div>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <span class="px-2.5 py-1 rounded-full ${statusClass} font-bold text-[10px]">${m.completed ? 'Completed ✓' : 'In Progress'}</span>
        <span class="theme-text-sub text-xs">›</span>
      </div>
    `;
    item.onclick = () => toggleMilestoneState(m.id);
    container.appendChild(item);
  });
}

// ROADMAP MODAL BUILDER
function renderRoadmapModal() {
  const container = document.getElementById('roadmap-phases-container');
  if (!container) return;
  container.innerHTML = '';

  document.getElementById('roadmap-track-name').textContent = currentStudent.career_goal || 'Selected Target Role';
  const phases = currentStudent.phases || [];

  phases.forEach((phase, pIdx) => {
    const box = document.createElement('div');
    box.className = "p-4 rounded-2xl theme-card-inner space-y-3";
    
    let html = '';
    phase.milestones.forEach(m => {
      html += `
        <div class="p-3 rounded-xl theme-card-inner flex items-center justify-between gap-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" ${m.completed ? 'checked' : ''} onchange="toggleMilestoneState('${m.id}')" class="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer">
            <div>
              <div class="font-bold text-xs theme-text-title ${m.completed ? 'line-through opacity-50' : ''}">${m.title}</div>
              <div class="text-[10px] theme-text-sub">${m.hours} • ${m.desc || 'Milestone goal'}</div>
            </div>
          </label>
          <span class="font-mono text-amber-500 font-bold text-xs shrink-0">+${m.xp || 100} XP</span>
        </div>
      `;
    });

    box.innerHTML = `
      <div class="flex items-center justify-between pb-1">
        <h4 class="text-xs font-extrabold uppercase tracking-wider dynamic-accent-text">${phase.phaseTitle || `Phase ${pIdx + 1}`}</h4>
        <span class="text-[10px] font-mono theme-text-sub">Phase ${pIdx + 1}</span>
      </div>
      <div class="space-y-2">${html}</div>
    `;
    container.appendChild(box);
  });
}

// DYNAMIC TELEMETRY CALCULATION ON COURSE COMPLETION
async function toggleMilestoneState(mId) {
  let totalMilestones = 0;
  let completedMilestones = 0;

  currentStudent.phases.forEach(phase => {
    phase.milestones.forEach(m => {
      totalMilestones++;
      if (m.id === mId) {
        m.completed = !m.completed;
        const deltaXP = m.xp || 100;
        if (m.completed) {
          currentStudent.xp = (currentStudent.xp || 0) + deltaXP;
        } else {
          currentStudent.xp = Math.max(0, (currentStudent.xp || 0) - deltaXP);
        }
      }
      if (m.completed) completedMilestones++;
    });
  });

  const completionRatio = completedMilestones / (totalMilestones || 1);
  const mastery = Math.round(completionRatio * 100);
  currentStudent.curriculum_mastery = mastery;
  currentStudent.concept_deficits = Math.max(0, 100 - mastery);
  currentStudent.readiness = Math.min(100, Math.round(20 + completionRatio * 80));
  currentStudent.level = Math.floor((currentStudent.xp || 0) / 1000) + 1;

  // Dynamically push student polygon outward on radar
  if (currentStudent.radar && currentStudent.radar.candidate) {
    currentStudent.radar.candidate = currentStudent.radar.candidate.map((val, idx) => {
      const target = currentStudent.radar.benchmark ? currentStudent.radar.benchmark[idx] : 85;
      return Math.min(target, Math.round(30 + completionRatio * 60));
    });
  }

  saveStudentState();
  updateDashboardUI();
}

// SAVE STATE TO SUPABASE & LOCAL STORAGE
async function saveStudentState() {
  localStorage.setItem('alignx_student_active', JSON.stringify(currentStudent));

  if (supabase && currentStudent.email && !currentStudent.email.includes("guest@")) {
    try {
      await supabase.from('students').upsert({
        email: currentStudent.email,
        name: currentStudent.name,
        academic_level: currentStudent.academic_level,
        career_goal: currentStudent.career_goal,
        current_knowledge: currentStudent.current_knowledge,
        tenure: currentStudent.tenure,
        github: currentStudent.github,
        readiness: currentStudent.readiness,
        curriculum_mastery: currentStudent.curriculum_mastery,
        concept_deficits: currentStudent.concept_deficits,
        target_pace: currentStudent.target_pace,
        radar: currentStudent.radar,
        phases: currentStudent.phases,
        xp: currentStudent.xp,
        level: currentStudent.level
      }, { onConflict: 'email' });
    } catch (err) {
      console.warn("Supabase upsert error:", err.message);
    }
  }
}

// ONBOARDING SUBMISSION (GOOGLE GEMINI POWERED)
async function handleOnboardingSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-generate-roadmap');
  btn.disabled = true;
  btn.innerHTML = `<span class="animate-spin">↻</span> Generating Architecture with Gemini...`;

  const payload = {
    name: document.getElementById('in-name').value.trim(),
    academicLevel: document.getElementById('in-academic-level').value.trim(),
    careerGoal: document.getElementById('in-career-goal').value.trim(),
    currentKnowledge: document.getElementById('in-current-knowledge').value.trim(),
    tenure: document.getElementById('in-tenure').value,
    github: document.getElementById('in-github').value.trim()
  };

  try {
    const res = await fetch('/api/roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const aiData = await res.json();

    if (aiData.error) throw new Error(aiData.error);

    currentStudent = {
      ...currentStudent,
      name: payload.name,
      academic_level: payload.academicLevel,
      career_goal: payload.careerGoal,
      current_knowledge: payload.currentKnowledge,
      tenure: payload.tenure,
      github: payload.github,
      readiness: aiData.readiness || 25,
      curriculum_mastery: aiData.curriculumMastery || 20,
      concept_deficits: aiData.conceptDeficits || 80,
      target_pace: aiData.targetPace || 75,
      radar: aiData.radar || currentStudent.radar,
      phases: aiData.phases || currentStudent.phases
    };

    await saveStudentState();
    closeModal('modal-onboarding');
    updateDashboardUI();
    alert(`Personalized roadmap for "${payload.careerGoal}" generated successfully!`);
  } catch (err) {
    alert("Could not reach Gemini backend: " + err.message + ". Check GEMINI_API_KEY in Vercel.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>✨ Synthesize Custom Roadmap via Gemini</span>`;
  }
}

// AUTHENTICATION MODAL SUBMIT
async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value.trim();
  closeModal('modal-auth');

  if (supabase) {
    try {
      const { data, error } = await supabase.from('students').select('*').eq('email', email).single();
      if (data && !error) {
        currentStudent = data;
        saveStudentState();
        updateDashboardUI();
        alert(`Welcome back, ${data.name}! Synchronized profile from Supabase.`);
        return;
      }
    } catch (err) {
      console.warn("Supabase fetch failed:", err);
    }
  }

  // If new user, set email and prompt for custom background
  currentStudent.email = email;
  openOnboardingModal();
}

function openOnboardingModal() {
  document.getElementById('in-name').value = currentStudent.name || '';
  document.getElementById('in-academic-level').value = currentStudent.academic_level || '';
  document.getElementById('in-career-goal').value = currentStudent.career_goal || '';
  document.getElementById('in-current-knowledge').value = currentStudent.current_knowledge || '';
  document.getElementById('in-github').value = currentStudent.github || '';
  openModal('modal-onboarding');
}

function openAuthModal() {
  openModal('modal-auth');
}

function quickSwitchGoal(goalName) {
  currentStudent.career_goal = goalName;
  closeMenu('menu-tracks');
  openOnboardingModal();
}

// RADAR MATRIX VISUALIZER
function renderRadar() {
  const canvas = document.getElementById('competency-radar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2, radius = 95;

  const cats = currentStudent.radar?.categories || ["Domain 1", "Domain 2", "Domain 3", "Domain 4", "Domain 5", "Domain 6"];
  const vals = currentStudent.radar?.candidate || [30, 30, 30, 30, 30, 30];
  const bench = currentStudent.radar?.benchmark || [85, 85, 80, 90, 75, 80];
  const n = cats.length;

  ctx.clearRect(0, 0, w, h);
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-main').trim() || '#C084FC';
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';

  // Concentric Web
  for (let l = 1; l <= 4; l++) {
    const r = (radius / 4) * l;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 / n) * i - Math.PI / 2;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)";
    ctx.stroke();
  }

  // Spokes & Labels
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 / n) * i - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
    ctx.strokeStyle = isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)";
    ctx.stroke();
    ctx.fillStyle = isLight ? "#475569" : "#94A3B8";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(cats[i], cx + (radius + 26) * Math.cos(a), cy + (radius + 12) * Math.sin(a));
  }

  // Industry Benchmark Polygon (Dashed)
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 / n) * i - Math.PI / 2;
    const d = (bench[i] / 100) * radius;
    const x = cx + d * Math.cos(a), y = cy + d * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = isLight ? "rgba(71, 85, 105, 0.4)" : "rgba(148, 163, 184, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);

  // Candidate Polygon
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 / n) * i - Math.PI / 2;
    const d = (vals[i] / 100) * radius;
    const x = cx + d * Math.cos(a), y = cy + d * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.fillStyle = accentColor === '#34D399' ? 'rgba(52, 211, 153, 0.22)' : 
                  accentColor === '#FBBF24' ? 'rgba(251, 191, 36, 0.22)' : 
                  accentColor === '#38BDF8' ? 'rgba(56, 189, 248, 0.22)' : 
                  accentColor === '#FFFFFF' ? 'rgba(255, 255, 255, 0.2)' : 
                  accentColor === '#7C3AED' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(192, 132, 252, 0.22)';
  ctx.fill();
}

// AI TUTOR HANDLER (CALLS /api/chat)
async function handleTutorSend(e) {
  e.preventDefault();
  const inEl = document.getElementById('tutor-input');
  const box = document.getElementById('tutor-chat-messages');
  const msg = inEl.value.trim();
  if (!msg) return;

  box.innerHTML += `<div class="p-2.5 rounded-xl bg-purple-600/20 text-purple-700 dark:text-purple-200 ml-6 text-right font-medium">${msg}</div>`;
  inEl.value = '';

  const typing = document.createElement('div');
  typing.className = "p-2.5 rounded-xl theme-card-inner theme-text-sub italic";
  typing.textContent = "Gemini is analyzing your syllabus...";
  box.appendChild(typing);
  box.scrollTop = box.scrollHeight;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, studentContext: currentStudent })
    });
    const data = await res.json();
    typing.remove();
    box.innerHTML += `<div class="p-2.5 rounded-xl theme-card-inner theme-text-title leading-relaxed">${(data.reply || 'Insight verified.').replace(/\n/g, '<br/>')}</div>`;
  } catch (err) {
    typing.remove();
    box.innerHTML += `<div class="p-2.5 rounded-xl theme-card-inner theme-text-title"><strong>Tutor:</strong> Make sure your GEMINI_API_KEY is configured in Vercel. For ${currentStudent.career_goal}, prioritize your Phase 1 foundational milestones!</div>`;
  }
  box.scrollTop = box.scrollHeight;
}

// ADAPTIVE THEME SWITCHER
function setAccentTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('alignx_accent', themeName);

  const themeLabels = {
    purple: "Cyber Purple",
    emerald: "Emerald Matrix",
    amber: "Solar Amber",
    cyan: "Ocean Cyan",
    white: "Pure White",
    light: "Light Theme"
  };

  const themeColors = {
    purple: "#C084FC",
    emerald: "#34D399",
    amber: "#FBBF24",
    cyan: "#38BDF8",
    white: "#FFFFFF",
    light: "#7C3AED"
  };

  document.getElementById('active-theme-label').textContent = themeLabels[themeName] || "Cyber Purple";
  document.getElementById('active-theme-dot').style.backgroundColor = themeColors[themeName] || "#C084FC";

  renderStudyPlanModules();
  renderRadar();
}

// ENDLESS MCQ STUDIO
function startEndlessMCQSession() {
  mcqSession = { total: 0, correct: 0, wrong: 0, answeredCurrent: false, incorrectReview: [] };
  document.getElementById('mcq-correct-counter').textContent = '0';
  document.getElementById('mcq-wrong-counter').textContent = '0';
  document.getElementById('mcq-badge-track').textContent = currentStudent.career_goal || 'General Track';
  openModal('modal-mcq');
  generateNextMCQ();
}

function generateNextMCQ() {
  mcqSession.answeredCurrent = false;
  document.getElementById('btn-next-mcq').classList.add('hidden');
  document.getElementById('mcq-instant-feedback').classList.add('hidden');

  const qObj = endlessMCQBank[mcqSession.total % endlessMCQBank.length];
  document.getElementById('mcq-question-number').textContent = `Challenge #${mcqSession.total + 1}`;
  document.getElementById('mcq-topic-tag').textContent = qObj.topic;
  document.getElementById('mcq-question-text').textContent = qObj.q;

  const container = document.getElementById('mcq-choices-container');
  container.innerHTML = '';

  qObj.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = "mcq-choice-btn w-full text-left p-3.5 rounded-xl theme-card-inner text-xs theme-text-title font-medium transition flex items-start gap-2.5";
    btn.innerHTML = `<span class="font-mono dynamic-accent-text font-bold">${String.fromCharCode(65 + idx)}.</span> <span>${opt}</span>`;
    btn.onclick = () => handleMCQChoice(idx, qObj);
    container.appendChild(btn);
  });
}

function handleMCQChoice(selectedIdx, qObj) {
  if (mcqSession.answeredCurrent) return;
  mcqSession.answeredCurrent = true;
  mcqSession.total++;

  const isCorrect = (selectedIdx === qObj.correct);
  const fb = document.getElementById('mcq-instant-feedback');
  const allBtns = document.querySelectorAll('.mcq-choice-btn');

  allBtns.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === qObj.correct) {
      btn.className = "mcq-choice-btn w-full text-left p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-start gap-2.5 shadow-lg shadow-emerald-500/10";
    } else if (idx === selectedIdx && !isCorrect) {
      btn.className = "mcq-choice-btn w-full text-left p-3.5 rounded-xl border-2 border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-start gap-2.5 shadow-lg shadow-rose-500/10";
    } else {
      btn.classList.add('opacity-40');
    }
  });

  fb.classList.remove('hidden');

  if (isCorrect) {
    mcqSession.correct++;
    document.getElementById('mcq-correct-counter').textContent = mcqSession.correct;
    fb.className = "p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium";
    fb.innerHTML = `<strong>✓ Correct!</strong> ${qObj.explanation}`;
  } else {
    mcqSession.wrong++;
    document.getElementById('mcq-wrong-counter').textContent = mcqSession.wrong;
    fb.className = "p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium";
    fb.innerHTML = `<strong>✕ Incorrect.</strong> You picked ${String.fromCharCode(65 + selectedIdx)}.<br><br><strong>Key Concept:</strong> ${qObj.explanation}`;
    mcqSession.incorrectReview.push({
      question: qObj.q,
      userAnswer: qObj.options[selectedIdx],
      correctAnswer: qObj.options[qObj.correct],
      explanation: qObj.explanation
    });
  }

  document.getElementById('btn-next-mcq').classList.remove('hidden');
}

function finishMCQSession() {
  closeModal('modal-mcq');
  document.getElementById('scorecard-total').textContent = mcqSession.total;
  document.getElementById('scorecard-correct').textContent = mcqSession.correct;
  document.getElementById('scorecard-wrong').textContent = mcqSession.wrong;

  const list = document.getElementById('scorecard-breakdown-list');
  list.innerHTML = '';
  if (mcqSession.incorrectReview.length === 0) {
    list.innerHTML = `<div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center text-xs font-semibold">🏆 Flawless performance! Zero errors encountered.</div>`;
  } else {
    mcqSession.incorrectReview.forEach(item => {
      list.innerHTML += `
        <div class="p-3.5 rounded-xl theme-card-inner space-y-1.5 text-xs">
          <div class="font-bold theme-text-title">${item.question}</div>
          <div class="text-rose-500 font-medium">✕ Your Choice: ${item.userAnswer}</div>
          <div class="text-emerald-500 font-medium">✓ Correct Concept: ${item.correctAnswer}</div>
          <div class="theme-text-sub text-[11px] pt-1 leading-relaxed">${item.explanation}</div>
        </div>
      `;
    });
  }
  openModal('modal-scorecard');
}

// GITHUB TELEMETRY
async function fetchGitHubRepos() {
  const u = (document.getElementById('in-github-scan').value || currentStudent.github || 'adityarp2008').trim();
  const c = document.getElementById('github-repos-container');
  if (!u) return;

  c.innerHTML = '<div class="p-3 theme-text-sub">Querying GitHub public API...</div>';
  try {
    const res = await fetch(`https://api.github.com/users/${u}/repos?sort=updated&per_page=6`);
    const data = await res.json();

    if (!Array.isArray(data)) {
      c.innerHTML = `<div class="p-3 text-rose-500">User @${u} not found or rate limited.</div>`;
      return;
    }

    c.innerHTML = data.map(r => `
      <a href="${r.html_url}" target="_blank" rel="noopener noreferrer" class="p-3 rounded-xl theme-card-inner hover:border-purple-400 transition flex justify-between items-center text-xs group block">
        <div class="flex items-center gap-2">
          <span class="text-base group-hover:scale-110 transition">📦</span>
          <div>
            <div class="font-bold theme-text-title group-hover:text-purple-500 transition flex items-center gap-1.5">
              <span>${r.name}</span>
              <svg class="w-3 h-3 theme-text-sub" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </div>
            <div class="text-[10px] theme-text-sub truncate max-w-[280px]">${r.description || 'Public academic repository.'}</div>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="dynamic-accent-text font-mono text-[10px] font-bold">${r.language || 'Code'}</span>
          <span class="text-[10px] text-amber-500">★ ${r.stargazers_count}</span>
        </div>
      </a>
    `).join('');
  } catch(e) {
    c.innerHTML = '<div class="text-rose-500 p-3">Error connecting to GitHub API.</div>';
  }
}

// UI NAVIGATION HELPERS
function toggleNavSidebar() { document.getElementById('nav-drawer')?.classList.toggle('-translate-x-full'); }
function toggleTutorChat() { document.getElementById('drawer-ai-tutor')?.classList.toggle('translate-x-full'); }
function toggleMenu(id, e) { if (e) e.stopPropagation(); document.getElementById(id)?.classList.toggle('hidden'); }
function closeMenu(id) { document.getElementById(id)?.classList.add('hidden'); }
function openModal(id) {
  document.getElementById(id)?.classList.remove('hidden');
  if (id === 'modal-capabilities') setTimeout(renderRadar, 50);
}
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

function openNotesModal() {
  document.getElementById('notes-modal-title').textContent = `${currentStudent.career_goal} - Blueprint`;
  const container = document.getElementById('notes-container');
  container.innerHTML = `
    <div class="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-300 font-semibold mb-2">
      🚀 Target Curriculum Specifications for ${currentStudent.career_goal}
    </div>
    <div class="p-3.5 rounded-xl theme-card-inner space-y-1">
      <div class="font-bold theme-text-title">Background Assessment</div>
      <p class="theme-text-sub text-[11px] leading-relaxed">${currentStudent.current_knowledge || 'Undergraduate'}</p>
    </div>
  `;
  openModal('modal-notes');
}

function cycleFunFact() {
  const facts = [
    "Personalized academic architectures reduce career transition time by up to 65%.",
    "Relational databases use B+ Trees because wide fanouts match physical storage disk page sizes.",
    "Git was written by Linus Torvalds in roughly 10 days to maintain the Linux kernel codebase."
  ];
  const el = document.getElementById('cs-fun-fact-text');
  if (el) el.textContent = facts[Math.floor(Math.random() * facts.length)];
}

function initPointerGlow() {
  const canvas = document.getElementById('glow-spotlight-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth, h = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });
  window.addEventListener('mousemove', (e) => {
    ctx.clearRect(0,0,w,h);
    const grad = ctx.createRadialGradient(e.clientX, e.clientY, 0, e.clientX, e.clientY, 350);
    grad.addColorStop(0, 'rgba(192, 132, 252, 0.08)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,w,h);
  });
}
