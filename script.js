/**
 * Align-X Academic Engine
 * Live Gemini Chatbot + Detailed Phase-Based Reading Notes + Dynamic Telemetry
 */

const SUPABASE_URL = "https://eydgvjsgkqjyqjkkedi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZGd2anNna3FqeXFqa2tlZGkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1NzQ4OTc1MCwiZXhwIjoyMDczMDY1NzUwfQ.f11c7dG38yT7CwhL6f6f9lKkEee9r8r_placeholder";

let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabase = supabaseClient;
  } catch (e) {
    console.warn("Supabase running local mode.");
  }
}

let activePhaseIdx = 0;
window.currentStudent = null;
window.pendingRegistrationEmail = "";

// Dynamic fallback curriculum generator based on goal and knowledge
function generateFallbackCurriculum(goal, knowledge) {
  const g = (goal || 'AI Engineer').toLowerCase();
  
  if (g.includes('entrepreneur') || g.includes('business') || g.includes('startup') || g.includes('founder')) {
    return {
      radar: {
        categories: ["Market Validation", "Financial Modeling", "Product / MVP", "Customer Discovery", "Unit Economics", "Growth & Sales"],
        candidate: [30, 25, 20, 35, 15, 20],
        benchmark: [90, 85, 85, 90, 80, 85]
      },
      phases: [
        {
          phaseTitle: "Phase 1: Problem Identification & Niche Selection",
          milestones: [
            { id: "ent-1", title: "Problem Identification & Niche Selection", hours: "10 hrs", desc: "Identify high-margin market gaps and customer pain points.", completed: false, xp: 120 },
            { id: "ent-2", title: "Lean Customer Discovery & Surveys", hours: "12 hrs", desc: "Conduct primary market research and interview 20+ prospective customers.", completed: false, xp: 160 },
            { id: "ent-3", title: "Minimum Viable Product (MVP) Blueprint", hours: "14 hrs", desc: "Design a low-cost, high-value MVP scope to test product-market fit.", completed: false, xp: 180 }
          ]
        },
        {
          phaseTitle: "Phase 2: Financial Modeling & Unit Economics",
          milestones: [
            { id: "ent-4", title: "Cash Burn & Runway Analysis", hours: "10 hrs", desc: "Model Gross Burn, Net Burn, and 18-month survival runway.", completed: false, xp: 200 },
            { id: "ent-5", title: "CAC to LTV Ratio Calculation", hours: "8 hrs", desc: "Ensure customer acquisition cost is at least 3x recovered over lifetime.", completed: false, xp: 220 },
            { id: "ent-6", title: "Pricing Model & Margin Architecture", hours: "10 hrs", desc: "Validate recurring subscription vs transaction fee economics.", completed: false, xp: 240 }
          ]
        },
        {
          phaseTitle: "Phase 3: Go-To-Market & Capital Scaling",
          milestones: [
            { id: "ent-7", title: "Outbound Sales Funnel & Lead Gen", hours: "16 hrs", desc: "Build automated cold email, LinkedIn, and conversion funnels.", completed: false, xp: 280 },
            { id: "ent-8", title: "Pitch Deck & Seed Capital Readiness", hours: "14 hrs", desc: "10-slide investor narrative covering TAM, traction, and financial pro-forma.", completed: false, xp: 300 }
          ]
        }
      ]
    };
  }

  if (g.includes('ai') || g.includes('machine learning') || g.includes('data')) {
    return {
      radar: {
        categories: ["Python", "Algorithms", "Machine Learning", "Deep Learning", "Math/Stats", "Data Pipelines"],
        candidate: [30, 20, 15, 10, 25, 15],
        benchmark: [90, 85, 85, 80, 80, 75]
      },
      phases: [
        {
          phaseTitle: "Phase 1: Python Fundamentals & Data Primitives",
          milestones: [
            { id: "ai-1", title: "Master Python OOP & Generator Pipelines", hours: "8 hrs", desc: "Object models, iterators, and vector primitives.", completed: false, xp: 120 },
            { id: "ai-2", title: "Applied Linear Algebra & Probability", hours: "10 hrs", desc: "Matrix operations, dot products, and Bayes theorem.", completed: false, xp: 150 },
            { id: "ai-3", title: "NumPy & Pandas Data Manipulation", hours: "6 hrs", desc: "DataFrames, vectorization, and dataset cleansing.", completed: false, xp: 100 }
          ]
        },
        {
          phaseTitle: "Phase 2: Core Machine Learning & Statistical Models",
          milestones: [
            { id: "ai-4", title: "Scikit-Learn Regression & Classification", hours: "12 hrs", desc: "Train-test splits, cross-validation, and metrics.", completed: false, xp: 200 },
            { id: "ai-5", title: "Feature Engineering & Data Preprocessing", hours: "10 hrs", desc: "One-hot encoding, imputation, and scaling pipelines.", completed: false, xp: 220 },
            { id: "ai-6", title: "Gradient Descent & Loss Functions", hours: "8 hrs", desc: "Deriving cost functions and learning rate decay.", completed: false, xp: 180 }
          ]
        },
        {
          phaseTitle: "Phase 3: Deep Learning & Production Deployment",
          milestones: [
            { id: "ai-7", title: "PyTorch Neural Networks & Backprop", hours: "16 hrs", desc: "Autograd, tensor computation, and training loops.", completed: false, xp: 280 },
            { id: "ai-8", title: "Deploy Inference API with FastAPI & Docker", hours: "14 hrs", desc: "Containerize model endpoint for low-latency serving.", completed: false, xp: 300 }
          ]
        }
      ]
    };
  }

  return {
    radar: {
      categories: ["Frontend", "Backend APIs", "System Design", "Databases", "DevOps", "Testing"],
      candidate: [35, 25, 15, 30, 10, 20],
      benchmark: [90, 85, 80, 85, 75, 75]
    },
    phases: [
      {
        phaseTitle: "Phase 1: Foundational Systems & Architecture",
        milestones: [
          { id: "fs-1", title: "Implement B+ Tree Indexing in PostgreSQL", hours: "6 hrs", desc: "Reduce random disk block reads.", completed: false, xp: 120 },
          { id: "fs-2", title: "Configure High-Performance Nginx Reverse Proxy", hours: "4 hrs", desc: "Isolate application runtime and caching.", completed: false, xp: 90 },
          { id: "fs-3", title: "RESTful API Design & Structured JSON Validation", hours: "6 hrs", desc: "HTTP error conventions and data serialization.", completed: false, xp: 110 }
        ]
      },
      {
        phaseTitle: "Phase 2: Concurrency & Distributed Storage",
        milestones: [
          { id: "fs-4", title: "Deploy Redis Atomic Lua Rate Limiter", hours: "8 hrs", desc: "Eliminate multi-instance race conditions.", completed: false, xp: 200 },
          { id: "fs-5", title: "Design Multi-Region Event Pub/Sub with Kafka", hours: "10 hrs", desc: "Event ordering across distributed brokers.", completed: false, xp: 250 }
        ]
      },
      {
        phaseTitle: "Phase 3: Production Hardening & Cloud Native",
        milestones: [
          { id: "fs-6", title: "Multi-Stage Docker Compose Containerization", hours: "6 hrs", desc: "Secure multi-container production environments.", completed: false, xp: 150 },
          { id: "fs-7", title: "Automate CI/CD & Integration Testing (k6)", hours: "8 hrs", desc: "Load test concurrent scenarios in GitHub Actions.", completed: false, xp: 180 }
        ]
      }
    ]
  };
}

// Continuous MCQ Bank
const endlessMCQBank = [
  {
    q: "In financial modeling for startups, what does 'Net Cash Burn' measure?",
    topic: "Venture Finance",
    options: [
      "Total operating costs minus total gross revenue in a given monthly window.",
      "The legal salary drawn by equity partners before depreciation.",
      "The total amount of venture debt available in credit lines."
    ],
    correct: 0,
    explanation: "Net Cash Burn = Total Cash Outflows (Salaries, Servers, Rent) - Cash Inflows (Revenues). It dictates how many months of runway the startup has before bank balance hits zero."
  },
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
    q: "When implementing an atomic rate limiter across multiple auto-scaled instances, which architecture guarantees zero race conditions?",
    topic: "Distributed Systems",
    options: [
      "Using Redis running an atomic Lua script (Token Bucket algorithm).",
      "Storing requests in a local in-memory Map.",
      "Executing a SQL query: SELECT COUNT(*) WHERE created_at > NOW() - INTERVAL '1 minute'."
    ],
    correct: 0,
    explanation: "Redis executes Lua scripts atomically in a single event loop iteration without distributed lock contention across multiple pods."
  }
];

let mcqSession = { total: 0, correct: 0, wrong: 0, answeredCurrent: false, incorrectReview: [] };

// ==========================================
// AUTH & PROFILER CONTROLLERS
// ==========================================
window.showAuthStep = function(step) {
  const fIn = document.getElementById('form-signin');
  const fReg = document.getElementById('form-register');
  const fProf = document.getElementById('form-profiler-integrated');
  const bIn = document.getElementById('tab-btn-signin');
  const bReg = document.getElementById('tab-btn-register');
  const tabBar = document.getElementById('auth-tab-bar');

  if (fIn) fIn.style.display = 'none';
  if (fReg) fReg.style.display = 'none';
  if (fProf) fProf.style.display = 'none';
  if (tabBar) tabBar.style.display = 'grid';

  if (step === 'signin') {
    if (fIn) fIn.style.display = 'block';
    if (bIn) bIn.className = 'py-2.5 rounded-xl transition btn-brand shadow-sm cursor-pointer';
    if (bReg) bReg.className = 'py-2.5 rounded-xl transition theme-text-sub hover:opacity-100 cursor-pointer';
  } else if (step === 'register') {
    if (fReg) fReg.style.display = 'block';
    if (bReg) bReg.className = 'py-2.5 rounded-xl transition btn-brand shadow-sm cursor-pointer';
    if (bIn) bIn.className = 'py-2.5 rounded-xl transition theme-text-sub hover:opacity-100 cursor-pointer';
  } else if (step === 'profiler') {
    if (fProf) fProf.style.display = 'block';
    if (tabBar) tabBar.style.display = 'none';
  }
};

window.goToProfilerStep = function() {
  const regEmail = document.getElementById('reg-email');
  if (regEmail && !regEmail.value.trim()) {
    regEmail.focus();
    return;
  }
  window.pendingRegistrationEmail = regEmail ? regEmail.value.trim() : '';
  showAuthStep('profiler');
};

window.submitSignIn = async function() {
  const emailInput = document.getElementById('signin-email');
  const email = emailInput ? emailInput.value.trim() : "aditya@joyuniversity.edu.in";
  const btn = document.getElementById('btn-submit-signin');
  
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Checking Profile...";
  }

  // 1. Query Supabase via server route
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get', email: email })
    });
    const result = await res.json();
    if (result && result.student && result.student.phases && result.student.phases.length > 0) {
      window.currentStudent = result.student;
      localStorage.setItem('alignx_student_active', JSON.stringify(window.currentStudent));
      if (btn) { btn.disabled = false; btn.textContent = "Sign In →"; }
      enterDashboard();
      return;
    }
  } catch (err) {
    console.warn("Server auth lookup error:", err.message);
  }

  // 2. Check localStorage
  const localData = localStorage.getItem('alignx_student_active');
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (parsed.email && parsed.email.toLowerCase() === email.toLowerCase() && parsed.career_goal && parsed.phases && parsed.phases.length > 0) {
        window.currentStudent = parsed;
        if (btn) { btn.disabled = false; btn.textContent = "Sign In →"; }
        enterDashboard();
        return;
      }
    } catch (err) {}
  }

  // 3. New user or incomplete profile -> show profiler
  if (btn) {
    btn.disabled = false;
    btn.textContent = "Sign In →";
  }
  window.pendingRegistrationEmail = email;
  showAuthStep('profiler');
};

// GEMINI PROFILER SYNTHESIS
window.submitProfilerForm = async function() {
  const btn = document.getElementById('btn-submit-ai-profiler');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin">↻</span> Gemini is architecting your roadmap...`;
  }

  const nameVal = document.getElementById('prof-name-input')?.value.trim() || 'Aditya Pandey';
  const emailVal = window.pendingRegistrationEmail || (nameVal.toLowerCase().replace(/\s+/g, '') + "@alignx.edu");
  const levelVal = document.getElementById('prof-level-input')?.value.trim() || '1st semester';
  const goalVal = document.getElementById('prof-goal-input')?.value.trim() || 'AI Engineer';
  const knowVal = document.getElementById('prof-know-input')?.value.trim() || 'basic html css and python';
  const tenureVal = document.getElementById('prof-tenure-input')?.value || '12 Months Comprehensive';
  const ghVal = document.getElementById('prof-github-input')?.value.trim() || 'adityarp2008';

  const payload = {
    email: emailVal,
    name: nameVal,
    academicLevel: levelVal,
    careerGoal: goalVal,
    currentKnowledge: knowVal,
    tenure: tenureVal,
    github: ghVal
  };

  const fallback = generateFallbackCurriculum(goalVal, knowVal);

  try {
    const res = await fetch('/api/roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const aiData = await res.json();

    if (aiData.error) throw new Error(aiData.error);

    let normalizedPhases = [];
    if (Array.isArray(aiData.phases) && aiData.phases.length > 0) {
      normalizedPhases = aiData.phases.map((p, pIdx) => {
        const title = p.phaseTitle || p.title || `Phase ${pIdx + 1}`;
        const rawList = p.milestones || p.modules || p.steps || p.topics || [];
        const milestones = Array.isArray(rawList) ? rawList.map((m, mIdx) => ({
          id: m.id || `m-${pIdx}-${mIdx}`,
          title: m.title || m.name || `Milestone ${mIdx + 1}`,
          desc: m.desc || m.description || `${m.hours || '8 hrs'} structured practice`,
          hours: m.hours || '8 hrs',
          completed: Boolean(m.completed),
          xp: Number(m.xp) || 120
        })) : [];
        return { phaseTitle: title, milestones };
      });
    }

    if (normalizedPhases.length === 0 || !normalizedPhases[0].milestones || normalizedPhases[0].milestones.length === 0) {
      normalizedPhases = fallback.phases;
    }

    window.currentStudent = {
      email: payload.email,
      name: payload.name,
      academic_level: payload.academicLevel,
      career_goal: payload.careerGoal,
      current_knowledge: payload.currentKnowledge,
      tenure: payload.tenure,
      github: payload.github,
      readiness: Number(aiData.readiness) || 25,
      curriculum_mastery: Number(aiData.curriculumMastery) || 0,
      concept_deficits: Number(aiData.conceptDeficits) || 100,
      target_pace: Number(aiData.targetPace) || 75,
      radar: aiData.radar || fallback.radar,
      phases: normalizedPhases,
      xp: 0,
      level: 1
    };

    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', studentData: window.currentStudent })
    }).catch(e => console.warn('Background Supabase save:', e));

    localStorage.setItem('alignx_student_active', JSON.stringify(window.currentStudent));
    enterDashboard();
  } catch (err) {
    console.warn("Using smart fallback curriculum:", err.message);
    window.currentStudent = {
      email: payload.email,
      name: payload.name,
      academic_level: payload.academicLevel,
      career_goal: payload.careerGoal,
      current_knowledge: payload.currentKnowledge,
      tenure: payload.tenure,
      github: payload.github,
      readiness: 25,
      curriculum_mastery: 0,
      concept_deficits: 100,
      target_pace: 75,
      radar: fallback.radar,
      phases: fallback.phases,
      xp: 0,
      level: 1
    };

    localStorage.setItem('alignx_student_active', JSON.stringify(window.currentStudent));
    enterDashboard();
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>✨ Synthesize Custom Architecture via Gemini →</span>`;
    }
  }
};

// MODAL CONTROLLERS
window.openModal = function(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = 'flex';
  }
  if (id === 'modal-capabilities') {
    setTimeout(renderRadar, 50);
  }
};

window.closeModal = function(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = 'none';
  }
};

window.openRoadmapModal = function() {
  renderRoadmapModal();
  openModal('modal-roadmap');
};

window.toggleMenu = function(id, e) {
  if (e) e.stopPropagation();
  const el = document.getElementById(id);
  if (el) {
    el.classList.toggle('hidden');
  }
};

window.closeMenu = function(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('hidden');
  }
};

window.toggleNavSidebar = function() {
  const drawer = document.getElementById('nav-drawer');
  if (drawer) {
    drawer.classList.toggle('-translate-x-full');
  }
};

window.toggleTutorChat = function() {
  const drawer = document.getElementById('drawer-ai-tutor');
  if (drawer) {
    drawer.classList.toggle('translate-x-full');
  }
};

window.handleLogout = function() {
  localStorage.removeItem('alignx_student_active');
  window.currentStudent = null;
  showAuthGateway();
};

// ==========================================
// APP LIFECYCLE
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('alignx_accent') || 'purple';
  setAccentTheme(savedTheme);
  initPointerGlow();

  const savedSession = localStorage.getItem('alignx_student_active');
  if (savedSession) {
    try {
      const parsed = JSON.parse(savedSession);
      if (parsed && parsed.phases && parsed.phases.length > 0) {
        window.currentStudent = parsed;
        enterDashboard();
      } else {
        showAuthGateway();
      }
    } catch (e) {
      showAuthGateway();
    }
  } else {
    showAuthGateway();
  }

  setInterval(cycleFunFact, 8000);
  window.addEventListener('resize', renderRadar);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#dropdown-track-wrapper')) closeMenu('menu-tracks');
    if (!e.target.closest('#dropdown-theme-wrapper')) closeMenu('menu-themes');
    if (!e.target.closest('#dropdown-week-wrapper')) closeMenu('menu-weeks');
  });
});

function showAuthGateway() {
  const authView = document.getElementById('auth-view');
  const appView = document.getElementById('app-view');
  const cBtn = document.getElementById('btn-floating-center');
  const tBtn = document.getElementById('btn-floating-tutor');

  if (authView) authView.style.display = 'flex';
  if (appView) appView.style.display = 'none';
  if (cBtn) cBtn.style.display = 'none';
  if (tBtn) tBtn.style.display = 'none';
  showAuthStep('signin');
}

function enterDashboard() {
  const authView = document.getElementById('auth-view');
  const appView = document.getElementById('app-view');
  const cBtn = document.getElementById('btn-floating-center');
  const tBtn = document.getElementById('btn-floating-tutor');

  if (authView) authView.style.display = 'none';
  if (appView) appView.style.display = 'flex';
  if (cBtn) cBtn.style.display = 'flex';
  if (tBtn) tBtn.style.display = 'flex';
  updateDashboardUI();
}

// DASHBOARD UI UPDATES
function updateDashboardUI() {
  if (!window.currentStudent) return;
  const s = window.currentStudent;

  const roleEl = document.getElementById('nav-current-role');
  const ghEl = document.getElementById('nav-github-label');
  const uNameEl = document.getElementById('nav-user-name');
  const dNameEl = document.getElementById('drawer-user-name');
  const termEl = document.getElementById('nav-academic-term');
  const goalEl = document.getElementById('drawer-user-goal');

  if (roleEl) roleEl.textContent = s.career_goal || 'Entrepreneur';
  if (ghEl) ghEl.textContent = s.github ? `@${s.github}` : '@adityarp2008';
  if (uNameEl) uNameEl.textContent = s.name || 'Aditya Pandey';
  if (dNameEl) dNameEl.textContent = s.name || 'Aditya Pandey';
  if (termEl) termEl.textContent = s.academic_level || '1st semester';
  if (goalEl) goalEl.textContent = s.career_goal || 'Entrepreneur';

  const initials = (s.name || 'AP').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const initEl = document.getElementById('nav-avatar-initials');
  const lvlBadge = document.getElementById('nav-level-badge');
  if (initEl) initEl.textContent = initials;
  if (lvlBadge) lvlBadge.textContent = `L${s.level || 1}`;

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

  const lvlTitle = document.getElementById('xp-level-title');
  const xpLabel = document.getElementById('xp-progress-label');
  const xpBar = document.getElementById('xp-progress-bar');
  if (lvlTitle) lvlTitle.textContent = `⚡ Level ${s.level || 1}: Apprentice Architect`;
  if (xpLabel) xpLabel.textContent = `${s.xp || 0} / 1000 XP`;
  if (xpBar) xpBar.style.width = `${Math.min(100, ((s.xp || 0) % 1000) / 10)}%`;

  renderStudyPlanModules();
  renderRoadmapModal();
  renderRadar();
}

function updateRadialMeter(circleId, percentage) {
  const circle = document.getElementById(circleId);
  if (!circle) return;
  const clamped = Math.max(0, Math.min(100, percentage));
  const circumference = 2 * Math.PI * 26;
  circle.style.strokeDasharray = `${circumference}`;
  circle.style.strokeDashoffset = circumference - (clamped / 100) * circumference;
}

// STUDY PLAN MODULES
window.changeStudyPlanPhase = function(phaseIdx) {
  activePhaseIdx = phaseIdx;
  const lbl = document.getElementById('active-week-label');
  if (lbl) lbl.textContent = `Phase ${phaseIdx + 1}`;
  closeMenu('menu-weeks');
  renderStudyPlanModules();
};

function renderStudyPlanModules() {
  const container = document.getElementById('study-plan-modules-container');
  if (!container || !window.currentStudent) return;
  container.innerHTML = '';

  const phases = window.currentStudent.phases || [];
  const currentPhase = phases[activePhaseIdx] || phases[0];

  if (!currentPhase || !currentPhase.milestones || currentPhase.milestones.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center theme-card-inner rounded-2xl space-y-2">
        <p class="theme-text-sub">No milestones mapped yet.</p>
        <button onclick="showAuthStep('profiler'); document.getElementById('auth-view').style.display='flex'; document.getElementById('app-view').style.display='none';" class="btn-brand px-4 py-1.5 rounded-xl text-xs cursor-pointer">✨ Configure Milestones</button>
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
          <div class="study-module-desc text-[11px] mt-0.5">${m.desc || `${m.hours} structured spec`}</div>
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

// ROADMAP MODAL
function renderRoadmapModal() {
  const container = document.getElementById('roadmap-phases-container');
  if (!container || !window.currentStudent) return;
  container.innerHTML = '';

  const trackEl = document.getElementById('roadmap-track-name');
  if (trackEl) trackEl.textContent = window.currentStudent.career_goal || 'Target Goal';
  const phases = window.currentStudent.phases || [];

  phases.forEach((phase, pIdx) => {
    const box = document.createElement('div');
    box.className = "p-4 rounded-2xl theme-card-inner space-y-3";
    
    let html = '';
    const mList = phase.milestones || [];
    mList.forEach(m => {
      html += `
        <div class="p-3 rounded-xl theme-card-inner flex items-center justify-between gap-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" ${m.completed ? 'checked' : ''} onchange="toggleMilestoneState('${m.id}')" class="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer">
            <div>
              <div class="font-bold text-xs theme-text-title ${m.completed ? 'line-through opacity-50' : ''}">${m.title}</div>
              <div class="text-[10px] theme-text-sub">${m.hours} • ${m.desc || 'Milestone target'}</div>
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

// PROGRESS & XP RECOMPUTATION
async function toggleMilestoneState(mId) {
  let total = 0, completed = 0;

  window.currentStudent.phases.forEach(phase => {
    (phase.milestones || []).forEach(m => {
      total++;
      if (m.id === mId) {
        m.completed = !m.completed;
        const delta = m.xp || 100;
        window.currentStudent.xp = m.completed ? (window.currentStudent.xp || 0) + delta : Math.max(0, (window.currentStudent.xp || 0) - delta);
      }
      if (m.completed) completed++;
    });
  });

  const ratio = completed / (total || 1);
  const mastery = Math.round(ratio * 100);
  window.currentStudent.curriculum_mastery = mastery;
  window.currentStudent.concept_deficits = Math.max(0, 100 - mastery);
  window.currentStudent.readiness = Math.min(100, Math.round(25 + ratio * 75));
  window.currentStudent.level = Math.floor((window.currentStudent.xp || 0) / 1000) + 1;

  if (window.currentStudent.radar && window.currentStudent.radar.candidate) {
    window.currentStudent.radar.candidate = window.currentStudent.radar.candidate.map((val, idx) => {
      const target = window.currentStudent.radar.benchmark ? window.currentStudent.radar.benchmark[idx] : 85;
      return Math.min(target, Math.round(30 + ratio * 60));
    });
  }

  localStorage.setItem('alignx_student_active', JSON.stringify(window.currentStudent));

  fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save', studentData: window.currentStudent })
  }).catch(e => console.warn('Milestone save error:', e));

  updateDashboardUI();
}

// RADAR MATRIX VISUALIZER
function renderRadar() {
  const canvas = document.getElementById('competency-radar-canvas');
  if (!canvas || !window.currentStudent) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2, radius = 95;

  const cats = window.currentStudent.radar?.categories || ["Domain 1", "Domain 2", "Domain 3", "Domain 4", "Domain 5", "Domain 6"];
  const vals = window.currentStudent.radar?.candidate || [30, 20, 15, 10, 25, 15];
  const bench = window.currentStudent.radar?.benchmark || [90, 85, 85, 80, 80, 75];
  const n = cats.length;

  ctx.clearRect(0, 0, w, h);
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-main').trim() || '#C084FC';
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';

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

  // Benchmark
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

  // Candidate
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

// ==========================================
// DYNAMIC AI TUTOR (WITH FULL GEMINI REPLIES)
// ==========================================
window.handleTutorSend = async function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const inEl = document.getElementById('tutor-input');
  const box = document.getElementById('tutor-chat-messages');
  const msg = inEl ? inEl.value.trim() : '';
  if (!msg) return;

  // Add User Message Bubble
  box.innerHTML += `
    <div class="flex justify-end">
      <div class="p-3 rounded-2xl bg-purple-600/30 text-purple-200 border border-purple-500/30 max-w-[85%] text-left font-medium leading-relaxed">
        ${escapeHtml(msg)}
      </div>
    </div>
  `;
  inEl.value = '';

  // Add Typing Indicator
  const typingId = 'typing-' + Date.now();
  box.innerHTML += `
    <div id="${typingId}" class="flex justify-start">
      <div class="p-3 rounded-2xl theme-card-inner theme-text-sub text-xs italic flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
        <span>Gemini is synthesizing answer for ${escapeHtml(window.currentStudent?.career_goal || 'your role')}...</span>
      </div>
    </div>
  `;
  box.scrollTop = box.scrollHeight;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, studentContext: window.currentStudent })
    });
    
    const data = await res.json();
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();

    const reply = data.reply || (data.details ? `Tutor error: ${data.details}` : "Insight verified.");
    
    // Render formatted response with proper paragraph and bullet spacing
    const formattedReply = reply
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');

    box.innerHTML += `
      <div class="flex justify-start">
        <div class="p-3.5 rounded-2xl theme-card-inner theme-text-title border border-white/10 max-w-[95%] text-xs leading-relaxed space-y-2">
          ${formattedReply}
        </div>
      </div>
    `;
  } catch (err) {
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();

    box.innerHTML += `
      <div class="flex justify-start">
        <div class="p-3 rounded-2xl theme-card-inner text-rose-300 border border-rose-500/20 text-xs">
          <strong>Tutor Alert:</strong> Could not connect to Gemini API. Error: ${escapeHtml(err.message)}
        </div>
      </div>
    `;
  }
  box.scrollTop = box.scrollHeight;
};

// ==========================================
// DETAILED "WHAT TO READ & MASTER" NOTES MODAL
// ==========================================
window.openNotesModal = function() {
  const currentPhase = (window.currentStudent?.phases || [])[activePhaseIdx] || (window.currentStudent?.phases || [])[0];
  const phaseTitle = currentPhase?.phaseTitle || `Phase ${activePhaseIdx + 1}`;
  const goal = window.currentStudent?.career_goal || 'Specialist';
  
  const titleEl = document.getElementById('notes-modal-title');
  if (titleEl) {
    titleEl.textContent = `${phaseTitle} • What to Read & Master`;
  }
  
  const container = document.getElementById('notes-container');
  if (!container) return;

  const milestones = currentPhase?.milestones || [];
  
  let milestoneDetailsHTML = '';
  milestones.forEach((m, idx) => {
    milestoneDetailsHTML += `
      <div class="p-4 rounded-2xl theme-card-inner space-y-2.5 border border-white/10">
        <div class="flex items-center justify-between">
          <span class="font-bold theme-text-title flex items-center gap-2 text-xs">
            <span class="w-5 h-5 rounded-full bg-purple-500/20 dynamic-accent-text flex items-center justify-center font-bold text-[10px]">${idx + 1}</span>
            <span>${escapeHtml(m.title)}</span>
          </span>
          <span class="font-mono text-[10px] text-amber-400 font-bold">${m.hours} Study Target</span>
        </div>
        
        <p class="theme-text-sub text-[11px] leading-relaxed">
          ${escapeHtml(m.desc || 'Comprehensive core competence required for career benchmarks.')}
        </p>

        <!-- Deep-dive Reading Guide -->
        <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-[11px]">
          <div class="font-semibold dynamic-accent-text flex items-center gap-1.5">
            <span>📚 Core Reading & Concepts to Master:</span>
          </div>
          <ul class="list-disc list-inside space-y-1 theme-text-sub">
            <li><strong>Theoretical Foundations:</strong> Master the underlying mechanics, formulas, and definitions.</li>
            <li><strong>Industry Case Studies:</strong> Analyze how real-world teams implement this to mitigate risk or increase velocity.</li>
            <li><strong>Hands-on Deliverable:</strong> Write a concise specification document, executable script, or prototype validating this topic.</li>
          </ul>
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <!-- Active Header Capsule -->
    <div class="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-transparent border border-purple-500/30 space-y-1.5">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-mono font-extrabold uppercase tracking-wider dynamic-accent-text">Syllabus Deep-Dive Specification</span>
        <span class="px-2.5 py-0.5 rounded-full bg-purple-500/20 dynamic-accent-text text-[10px] font-bold">Phase ${activePhaseIdx + 1} of 3</span>
      </div>
      <h4 class="text-sm font-bold theme-text-title">${escapeHtml(phaseTitle)}</h4>
      <p class="theme-text-sub text-[11px] leading-relaxed">
        Curriculum reading blueprint configured for <strong>${escapeHtml(goal)}</strong> candidates with background in <em>"${escapeHtml(window.currentStudent?.current_knowledge || 'Undergraduate')}"</em>.
      </p>
    </div>

    <!-- Milestones Detailed Breakdown -->
    <div class="space-y-3 pt-1">
      ${milestoneDetailsHTML || '<p class="theme-text-sub">No milestones mapped in this phase.</p>'}
    </div>

    <!-- Recommended External Research Guide -->
    <div class="p-3.5 rounded-2xl theme-card-inner border border-white/10 space-y-2 text-xs">
      <div class="font-bold theme-text-title flex items-center gap-2">
        <span>🔍</span>
        <span>Recommended Learning Path:</span>
      </div>
      <p class="theme-text-sub text-[11px] leading-relaxed">
        Focus your time on building tangible outputs for each milestone above. You can ask your <strong>AI Tutor</strong> (in the bottom right) anytime for explanations, code reviews, or business breakdowns of any concept in this phase.
      </p>
    </div>
  `;

  openModal('modal-notes');
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// THEME SWITCHER
window.setAccentTheme = function(themeName) {
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

  const lbl = document.getElementById('active-theme-label');
  const dot = document.getElementById('active-theme-dot');
  if (lbl) lbl.textContent = themeLabels[themeName] || "Cyber Purple";
  if (dot) dot.style.backgroundColor = themeColors[themeName] || "#C084FC";

  renderStudyPlanModules();
  renderRadar();
};

// MCQ STUDIO
window.startEndlessMCQSession = function() {
  mcqSession = { total: 0, correct: 0, wrong: 0, answeredCurrent: false, incorrectReview: [] };
  const corr = document.getElementById('mcq-correct-counter');
  const wrng = document.getElementById('mcq-wrong-counter');
  const bdg = document.getElementById('mcq-badge-track');
  if (corr) corr.textContent = '0';
  if (wrng) wrng.textContent = '0';
  if (bdg) bdg.textContent = window.currentStudent?.career_goal || 'Entrepreneur';
  openModal('modal-mcq');
  generateNextMCQ();
};

window.generateNextMCQ = function() {
  mcqSession.answeredCurrent = false;
  const nxt = document.getElementById('btn-next-mcq');
  const fb = document.getElementById('mcq-instant-feedback');
  if (nxt) nxt.style.display = 'none';
  if (fb) fb.style.display = 'none';

  const qObj = endlessMCQBank[mcqSession.total % endlessMCQBank.length];
  document.getElementById('mcq-question-number').textContent = `Challenge #${mcqSession.total + 1}`;
  document.getElementById('mcq-topic-tag').textContent = qObj.topic;
  document.getElementById('mcq-question-text').textContent = qObj.q;

  const container = document.getElementById('mcq-choices-container');
  container.innerHTML = '';

  qObj.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = "mcq-choice-btn w-full text-left p-3.5 rounded-xl theme-card-inner text-xs theme-text-title font-medium transition flex items-start gap-2.5 cursor-pointer";
    btn.innerHTML = `<span class="font-mono dynamic-accent-text font-bold">${String.fromCharCode(65 + idx)}.</span> <span>${opt}</span>`;
    btn.onclick = () => handleMCQChoice(idx, qObj);
    container.appendChild(btn);
  });
};

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

  if (fb) {
    fb.style.display = 'block';
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
  }

  const nxt = document.getElementById('btn-next-mcq');
  if (nxt) nxt.style.display = 'inline-block';
}

window.finishMCQSession = function() {
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
};

// GITHUB TELEMETRY
window.fetchGitHubRepos = async function() {
  const u = (document.getElementById('in-github-scan').value || window.currentStudent?.github || 'adityarp2008').trim();
  const c = document.getElementById('github-repos-container');
  if (!u) return;

  c.innerHTML = '<div class="p-3 theme-text-sub">Querying GitHub API...</div>';
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
};

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
