/**
 * Align-X Academic Engine
 * Live Gemini Chatbot + Context-Aware Topic Notes + Career Gap Deficits Analyzer
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
  const g = (goal || 'Cardiologist').toLowerCase();
  
  if (g.includes('cardio') || g.includes('medic') || g.includes('doctor') || g.includes('surgeon')) {
    return {
      radar: {
        categories: ["Cardiovascular Anatomy", "Diagnostic Imaging", "Hemodynamics", "Pharmacology", "Interventional Procedures", "Emergency Protocols"],
        candidate: [25, 20, 15, 30, 10, 20],
        benchmark: [95, 90, 90, 85, 80, 90]
      },
      phases: [
        {
          phaseTitle: "Phase 1: Cardiovascular Anatomy & Cellular Physiology",
          milestones: [
            { id: "med-1", title: "Cardiac Electrophysiology & Action Potentials", hours: "14 hrs", desc: "Action potential phases 0-4, ion channel conductances, and resting membrane gradients.", completed: false, xp: 140 },
            { id: "med-2", title: "12-Lead ECG Interpretation & Arrhythmia Mapping", hours: "18 hrs", desc: "Systematic vector analysis, bundle branch blocks, and ischemia vectors.", completed: false, xp: 180 },
            { id: "med-3", title: "Hemodynamics, Pressure-Volume Loops & Murmurs", hours: "16 hrs", desc: "Wiggers diagram mastery, preload/afterload curve shifts, and auscultatory timing.", completed: false, xp: 160 }
          ]
        },
        {
          phaseTitle: "Phase 2: Diagnostic Imaging & Cardiovascular Pharmacology",
          milestones: [
            { id: "med-4", title: "Echocardiography Fundamentals & Doppler Ultrasound", hours: "20 hrs", desc: "Identify valvular stenosis, regurgitation, and wall motion abnormalities via 2D and Doppler echo views.", completed: false, xp: 200 },
            { id: "med-5", title: "Cardiovascular Pharmacology & Drug Mechanisms", hours: "18 hrs", desc: "Prescribe and manage dosages for beta-blockers, ACE inhibitors, antiarrhythmics, and inotropic agents.", completed: false, xp: 220 },
            { id: "med-6", title: "Coronary Artery Disease & Acute Coronary Syndromes", hours: "16 hrs", desc: "Differentiate STEMI from NSTEMI protocols, triage acute chest pain, and map out emergency interventions.", completed: false, xp: 240 }
          ]
        },
        {
          phaseTitle: "Phase 3: Invasive Cardiology & Clinical Decision Systems",
          milestones: [
            { id: "med-7", title: "Cardiac Catheterization & Angiography Protocols", hours: "22 hrs", desc: "Fluoroscopic coronary anatomy, fractional flow reserve (FFR), and stent deployment parameters.", completed: false, xp: 300 },
            { id: "med-8", title: "Heart Failure Management & Mechanical Support", hours: "20 hrs", desc: "HFrEF vs HFpEF guidelines, left ventricular assist devices (LVAD), and transplant indications.", completed: false, xp: 320 }
          ]
        }
      ]
    };
  }

  // General Fallback
  return {
    radar: {
      categories: ["Theoretical Foundations", "Applied Core", "System Integration", "Tooling & Protocols", "Safety / Validation", "Case Decision Systems"],
      candidate: [30, 20, 15, 25, 10, 15],
      benchmark: [90, 85, 85, 80, 80, 75]
    },
    phases: [
      {
        phaseTitle: "Phase 1: Core Fundamentals & Prerequisite Competency",
        milestones: [
          { id: "gen-1", title: "Master Theoretical Principles & Terminology", hours: "10 hrs", desc: "Understand foundational taxonomies, formulas, and operational rules.", completed: false, xp: 120 },
          { id: "gen-2", title: "Applied Practical Drills & Diagnostic Baseline", hours: "12 hrs", desc: "Execute baseline exercises to detect gaps against target benchmarks.", completed: false, xp: 150 }
        ]
      },
      {
        phaseTitle: "Phase 2: Intermediate Implementation & Systems",
        milestones: [
          { id: "gen-3", title: "Core Architecture & Methodological Execution", hours: "16 hrs", desc: "Build comprehensive end-to-end projects demonstrating domain mastery.", completed: false, xp: 220 },
          { id: "gen-4", title: "Testing, Stress Scenarios & Edge Cases", hours: "14 hrs", desc: "Evaluate failure states and optimize performance under adverse criteria.", completed: false, xp: 240 }
        ]
      },
      {
        phaseTitle: "Phase 3: Production Mastery & Capstone Benchmark",
        milestones: [
          { id: "gen-5", title: "Industry-Standard Production Deliverable", hours: "20 hrs", desc: "Deploy final peer-reviewed deliverable ready for hiring evaluation.", completed: false, xp: 300 }
        ]
      }
    ]
  };
}

// Continuous MCQ Bank
const endlessMCQBank = [
  {
    q: "In 12-Lead ECG interpretation, persistent ST-segment elevation in leads V1-V4 indicates infarction of which anatomical territory?",
    topic: "Cardiology",
    options: [
      "Anteroseptal myocardial infarction (Left Anterior Descending Artery).",
      "Inferior wall myocardial infarction (Right Coronary Artery).",
      "Lateral myocardial infarction (Left Circumflex Artery)."
    ],
    correct: 0,
    explanation: "Leads V1-V4 look directly at the anterior and septal walls of the left ventricle, which are perfused by the LAD artery."
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
  const email = emailInput ? emailInput.value.trim() : "";
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

  const nameVal = document.getElementById('prof-name-input')?.value.trim() || 'Scholar';
  const emailVal = window.pendingRegistrationEmail || (nameVal.toLowerCase().replace(/\s+/g, '') + "@alignx.edu");
  const levelVal = document.getElementById('prof-level-input')?.value.trim() || 'Undergraduate';
  const goalVal = document.getElementById('prof-goal-input')?.value.trim() || 'Cardiologist';
  const knowVal = document.getElementById('prof-know-input')?.value.trim() || 'Basics';
  const tenureVal = document.getElementById('prof-tenure-input')?.value.trim() || '12 Months';
  const ghVal = document.getElementById('prof-github-input')?.value.trim() || '';

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
          desc: m.desc || m.description || `${m.hours || '10 hrs'} structured practice`,
          hours: m.hours || '10 hrs',
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

  if (roleEl) roleEl.textContent = s.career_goal || 'Cardiologist';
  if (ghEl) ghEl.textContent = s.github ? `@${s.github}` : '@student';
  if (uNameEl) uNameEl.textContent = s.name || 'Student Scholar';
  if (dNameEl) dNameEl.textContent = s.name || 'Student Scholar';
  if (termEl) termEl.textContent = s.academic_level || 'Education Profile';
  if (goalEl) goalEl.textContent = s.career_goal || 'Cardiologist';

  const initials = (s.name || 'ST').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
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

  const cats = window.currentStudent.radar?.categories || ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6"];
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

  box.innerHTML += `
    <div class="flex justify-end">
      <div class="p-3 rounded-2xl bg-purple-600/30 text-purple-200 border border-purple-500/30 max-w-[85%] text-left font-medium leading-relaxed">
        ${escapeHtml(msg)}
      </div>
    </div>
  `;
  inEl.value = '';

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

// ==========================================================
// DYNAMIC TOPIC-TAILORED "WHAT TO READ & MASTER" NOTES
// ==========================================================
function generateMilestoneSpecificReadingGuide(title, desc, goal) {
  const t = (title || '').toLowerCase();
  
  if (t.includes('echocardiography') || t.includes('ultrasound') || t.includes('imaging')) {
    return {
      theory: "Physical acoustic impedance differences, Doppler shift equation ($$f_d = \\frac{2 f_0 v \\cos\\theta}{c}$$), Nyquist limits, and wall motion score indexing (WMSI).",
      caseStudy: "Diagnosing severe aortic stenosis vs regurgitation in bicuspid aortic valves using transesophageal echocardiography (TEE) peak jet velocity and mean pressure gradients.",
      deliverable: "Standardized 5-view transthoracic echo protocol mapping with left ventricular ejection fraction (LVEF) calculations via Simpson's biplane method."
    };
  }
  
  if (t.includes('pharmacology') || t.includes('drug')) {
    return {
      theory: "Receptor pharmacodynamics (Beta-1/Beta-2 adrenergic antagonism, Renin-Angiotensin-Aldosterone cascade inhibition, and Vaughan Williams Class I-IV antiarrhythmic mechanisms).",
      caseStudy: "Titrating Quadruple Therapy (ARNI, SGLT2i, Beta-Blocker, MRA) in decompensated heart failure with preserved renal function and hypotension considerations.",
      deliverable: "Emergency dosing reference card for intravenous vasodilators, inotropes (Dobutamine, Milrinone), and antiarrhythmics (Amiodarone)."
    };
  }

  if (t.includes('coronary') || t.includes('artery') || t.includes('infarct') || t.includes('stemi')) {
    return {
      theory: "Atherosclerotic plaque rupture cascade, platelet aggregation pathways (GPIIb/IIIa), subendocardial ischemia versus transmural necrosis pathology.",
      caseStudy: "Managing acute ST-elevation myocardial infarction with cardiogenic shock, door-to-balloon time benchmarks (<90 min), and dual antiplatelet loading protocols.",
      deliverable: "High-risk acute chest pain triage pathway decision tree with troponin kinetics and Killip classification grading."
    };
  }

  if (t.includes('electrophysiology') || t.includes('ecg') || t.includes('arrhythmia')) {
    return {
      theory: "Cellular ionic flux (Na+ influx, K+ efflux, slow Ca2+ channels), Einthoven's triangle, hexaxial reference system, and re-entrant circuit pathophysiology.",
      caseStudy: "Mapping and differentiating wide-complex tachycardias: Ventricular Tachycardia (VT) vs Supraventricular Tachycardia with aberrancy using Brugada criteria.",
      deliverable: "Emergency antiarrhythmic cardioversion guide and 12-lead vector localization cheat-sheet."
    };
  }

  if (t.includes('cash burn') || t.includes('financial') || t.includes('runway')) {
    return {
      theory: "Gross Burn vs Net Burn formulas ($$\\text{Runway (Months)} = \\frac{\\text{Cash Reserves}}{\\text{Monthly Net Burn}}$$), zero-cash date trajectory modeling, and variable cost elasticity.",
      caseStudy: "Surviving a funding freeze by slashing non-payroll OPEX by 40% to extend runway from 5 months to 18 months while maintaining product velocity.",
      deliverable: "12-month rolling cash flow forecasting spreadsheet with scenario sensitivities for delayed revenues."
    };
  }

  if (t.includes('tree') || t.includes('database') || t.includes('index')) {
    return {
      theory: "B+ Tree block page alignment, branch fanout factor ($$B = \\frac{\\text{Page Size}}{\\text{Key + Pointer Size}}$$), write amplification, and WAL (Write-Ahead Logging) protocols.",
      caseStudy: "Eliminating table-scan disk I/O bottlenecks in a 50M-row transaction ledger by replacing binary composite indexes with covering B+ tree leaf indexes.",
      deliverable: "PostgreSQL EXPLAIN ANALYZE index profiling audit script and schema optimization document."
    };
  }

  // Smart Context-Aware Fallback for any domain
  return {
    theory: `Detailed breakdown of underlying principles, authoritative standards, and structural equations for "${title}".`,
    caseStudy: `Real-world breakdown of how leading practitioners in ${goal} execute "${title}" to minimize error and increase operational throughput.`,
    deliverable: `Production-ready deliverable or technical documentation demonstrating mastery of "${title}".`
  };
}

window.openNotesModal = function() {
  const currentPhase = (window.currentStudent?.phases || [])[activePhaseIdx] || (window.currentStudent?.phases || [])[0];
  const phaseTitle = currentPhase?.phaseTitle || `Phase ${activePhaseIdx + 1}`;
  const goal = window.currentStudent?.career_goal || 'Specialist';
  
  const titleEl = document.getElementById('notes-modal-title');
  if (titleEl) {
    titleEl.textContent = `${phaseTitle} • Tailored Study Specifications`;
  }
  
  const container = document.getElementById('notes-container');
  if (!container) return;

  const milestones = currentPhase?.milestones || [];
  
  let milestoneDetailsHTML = '';
  milestones.forEach((m, idx) => {
    const readingGuide = generateMilestoneSpecificReadingGuide(m.title, m.desc, goal);

    milestoneDetailsHTML += `
      <div class="p-4 rounded-2xl theme-card-inner space-y-3 border border-white/10">
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

        <!-- Topic-Specific Tailored Study Guide -->
        <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-[11px]">
          <div class="font-bold dynamic-accent-text flex items-center gap-1.5">
            <span>📚 Core Concepts & Readings to Master for "${escapeHtml(m.title)}":</span>
          </div>
          <div class="space-y-1.5 text-slate-300">
            <div><strong class="text-white">🔬 Theoretical Mechanics:</strong> <span class="theme-text-sub">${readingGuide.theory}</span></div>
            <div><strong class="text-white">🏥 Clinical / Industry Case Study:</strong> <span class="theme-text-sub">${readingGuide.caseStudy}</span></div>
            <div><strong class="text-white">🎯 Practical Hands-on Deliverable:</strong> <span class="theme-text-sub">${readingGuide.deliverable}</span></div>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-transparent border border-purple-500/30 space-y-1.5">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-mono font-extrabold uppercase tracking-wider dynamic-accent-text">Syllabus Deep-Dive Specification</span>
        <span class="px-2.5 py-0.5 rounded-full bg-purple-500/20 dynamic-accent-text text-[10px] font-bold">Phase ${activePhaseIdx + 1} of 3</span>
      </div>
      <h4 class="text-sm font-bold theme-text-title">${escapeHtml(phaseTitle)}</h4>
      <p class="theme-text-sub text-[11px] leading-relaxed">
        Personalized curriculum reading guide configured specifically for <strong>${escapeHtml(goal)}</strong>.
      </p>
    </div>

    <div class="space-y-3 pt-1">
      ${milestoneDetailsHTML || '<p class="theme-text-sub">No milestones mapped in this phase.</p>'}
    </div>
  `;

  openModal('modal-notes');
};

// ==========================================================
// CAREER GAP & DEFICITS ANALYZER MODAL
// ==========================================================
window.openGapModal = function() {
  const s = window.currentStudent;
  const container = document.getElementById('gap-analysis-container');
  if (!container || !s) return;

  const goal = s.career_goal || 'Selected Target Goal';
  const background = s.current_knowledge || 'Undergraduate Background';
  const deficitsPercentage = s.concept_deficits || 80;

  // Gather incomplete milestones representing the curriculum gap
  const gapMilestones = [];
  (s.phases || []).forEach((p, pIdx) => {
    (p.milestones || []).forEach(m => {
      if (!m.completed) {
        gapMilestones.push({ ...m, phaseTitle: p.phaseTitle || `Phase ${pIdx + 1}` });
      }
    });
  });

  let gapListHTML = '';
  if (gapMilestones.length === 0) {
    gapListHTML = `
      <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center text-xs font-semibold">
        🎉 Zero Curriculum Gaps Remaining! You have verified 100% of your targeted syllabus competencies.
      </div>
    `;
  } else {
    gapMilestones.slice(0, 6).forEach((gm, idx) => {
      gapListHTML += `
        <div class="p-3.5 rounded-2xl theme-card-inner border border-rose-500/20 flex items-center justify-between gap-3 text-xs">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-[10px]">${idx + 1}</span>
              <span class="font-bold theme-text-title">${escapeHtml(gm.title)}</span>
              <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 theme-text-sub">${escapeHtml(gm.phaseTitle)}</span>
            </div>
            <p class="theme-text-sub text-[11px] pl-7">${escapeHtml(gm.desc)}</p>
          </div>
          <button type="button" onclick="bridgeGap('${gm.id}')" class="shrink-0 px-3 py-1.5 rounded-xl btn-brand text-[10px] font-bold shadow cursor-pointer">
            Bridge Gap ✓
          </button>
        </div>
      `;
    });
  }

  container.innerHTML = `
    <!-- Top Deficit Overview -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
      <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
        <div class="text-[10px] font-mono uppercase font-bold text-rose-400">Target Deficit Ratio</div>
        <div class="text-2xl font-black font-mono mt-1">${deficitsPercentage}% Untested</div>
        <div class="text-[10px] theme-text-sub mt-0.5">${gapMilestones.length} syllabus competencies remaining</div>
      </div>
      <div class="p-4 rounded-2xl theme-card-inner border border-white/10 sm:col-span-2 space-y-1">
        <div class="text-[10px] font-mono uppercase font-bold dynamic-accent-text">Candidate Background vs Industry Benchmark</div>
        <div class="text-xs font-semibold theme-text-title">From: "${escapeHtml(background)}" → Target: "${escapeHtml(goal)}"</div>
        <p class="text-[11px] theme-text-sub leading-relaxed">
          The analyzer highlights core clinical/technical deficits that hiring managers or boards inspect before clearance.
        </p>
      </div>
    </div>

    <!-- Priority Action Items to Bridge the Gap -->
    <div class="space-y-2.5 pt-2">
      <div class="flex items-center justify-between text-xs font-bold theme-text-title">
        <span class="flex items-center gap-1.5 text-rose-400">
          <span>⚠️</span> <span>High-Priority Concept Gaps to Cover:</span>
        </span>
        <span class="text-[10px] font-mono theme-text-sub">Click "Bridge Gap" to verify completion</span>
      </div>
      <div class="space-y-2">
        ${gapListHTML}
      </div>
    </div>

    <!-- AI Tutor Direct Assistance -->
    <div class="p-4 rounded-2xl theme-card-inner border border-purple-500/30 flex items-center justify-between gap-3 text-xs">
      <div>
        <div class="font-bold theme-text-title flex items-center gap-1.5">
          <span>🤖</span> <span>Need an accelerated revision plan for these deficits?</span>
        </div>
        <p class="text-[11px] theme-text-sub mt-0.5">Your AI Tutor can generate immediate practice questions or concept summaries for your top deficit.</p>
      </div>
      <button type="button" onclick="closeModal('modal-gaps'); toggleTutorChat();" class="px-4 py-2 rounded-xl btn-brand font-bold text-xs shrink-0 cursor-pointer">
        Consult AI Tutor →
      </button>
    </div>
  `;

  openModal('modal-gaps');
};

window.bridgeGap = function(milestoneId) {
  toggleMilestoneState(milestoneId);
  setTimeout(openGapModal, 100);
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
  if (bdg) bdg.textContent = window.currentStudent?.career_goal || 'Cardiologist';
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
