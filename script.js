/**
 * Align-X Academic Engine
 * Dynamic Career Readiness & Velocity Sprint Pace + Goal-Specific Endless AI MCQs
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

// Dynamic Fallback Curriculum
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
            { id: "med-1", title: "Cardiac Action Potentials & Ion Channels", hours: "14 hrs", desc: "Action potential phases 0-4, ion channel conductances, and resting membrane gradients.", completed: false, xp: 140 },
            { id: "med-2", title: "Mastering 12-Lead ECG Interpretation", hours: "18 hrs", desc: "Systematic vector analysis, bundle branch blocks, and ischemia vectors.", completed: false, xp: 180 },
            { id: "med-3", title: "Hemodynamic Principles and Pressure-Volume Loops", hours: "16 hrs", desc: "Wiggers diagram mastery, preload/afterload curve shifts, and auscultatory timing.", completed: false, xp: 160 }
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

  return {
    radar: {
      categories: ["Theoretical Foundations", "Applied Core", "System Integration", "Tooling & Protocols", "Safety / Validation", "Case Decision Systems"],
      candidate: [20, 15, 10, 15, 10, 10],
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

let mcqSession = { total: 0, correct: 0, wrong: 0, answeredCurrent: false, incorrectReview: [], activeQuestion: null };

// ==========================================
// AUTH & PROFILER CONTROLLERS
// ==========================================
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

    // STRICT METRICS: Unstarted course starts strictly at 0% Readiness and 0% Pace
    window.currentStudent = {
      email: payload.email,
      name: payload.name,
      academic_level: payload.academicLevel,
      career_goal: payload.careerGoal,
      current_knowledge: payload.currentKnowledge,
      tenure: payload.tenure,
      github: payload.github,
      readiness: 0,
      curriculum_mastery: 0,
      concept_deficits: 100,
      target_pace: 0,
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
      readiness: 0,
      curriculum_mastery: 0,
      concept_deficits: 100,
      target_pace: 0,
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
        // Recalculate metrics on load to eliminate stale hardcoded baselines
        recalculateMetrics();
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

// DYNAMIC METRICS RECALCULATION (Eliminates artificial 25% floor & static 85% pace)
function recalculateMetrics() {
  if (!window.currentStudent) return;
  let total = 0, completed = 0;

  (window.currentStudent.phases || []).forEach(phase => {
    (phase.milestones || []).forEach(m => {
      total++;
      if (m.completed) completed++;
    });
  });

  const completionRatio = total > 0 ? (completed / total) : 0;
  const mastery = Math.round(completionRatio * 100);

  window.currentStudent.curriculum_mastery = mastery;
  window.currentStudent.concept_deficits = Math.max(0, 100 - mastery);
  
  // Strict Career Readiness: 0% when unstarted, scaling precisely with verified completion & performance
  window.currentStudent.readiness = Math.round(completionRatio * 100);

  // Dynamic Sprint Pace: Velocity scales based on milestones completed and active momentum
  const quizFactor = Math.min(25, (mcqSession.correct || 0) * 5);
  if (completed === 0) {
    window.currentStudent.target_pace = quizFactor > 0 ? quizFactor : 0;
  } else {
    window.currentStudent.target_pace = Math.min(100, Math.round(20 + (completionRatio * 70) + quizFactor));
  }
}

// DASHBOARD UI UPDATES
function updateDashboardUI() {
  if (!window.currentStudent) return;
  recalculateMetrics();
  const s = window.currentStudent;

  let totalMilestones = 0, completedMilestones = 0;
  (s.phases || []).forEach(phase => {
    (phase.milestones || []).forEach(m => {
      totalMilestones++;
      if (m.completed) completedMilestones++;
    });
  });

  const roleEl = document.getElementById('nav-current-role');
  const ghEl = document.getElementById('nav-github-label');
  const uNameEl = document.getElementById('nav-user-name');
  const dNameEl = document.getElementById('drawer-user-name');
  const termEl = document.getElementById('nav-academic-term');
  const goalEl = document.getElementById('drawer-user-goal');

  if (roleEl) roleEl.textContent = s.career_goal || 'Goal Unset';
  if (ghEl) ghEl.textContent = s.github ? `@${s.github}` : '@student';
  if (uNameEl) uNameEl.textContent = s.name || 'Student Scholar';
  if (dNameEl) dNameEl.textContent = s.name || 'Student Scholar';
  if (termEl) termEl.textContent = s.academic_level || 'Education Profile';
  if (goalEl) goalEl.textContent = s.career_goal || 'Target Goal';

  const initials = (s.name || 'ST').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const initEl = document.getElementById('nav-avatar-initials');
  const lvlBadge = document.getElementById('nav-level-badge');
  if (initEl) initEl.textContent = initials;
  if (lvlBadge) lvlBadge.textContent = `L${s.level || 1}`;

  // Dial 1: Curriculum Mastery
  document.getElementById('meter-current-val').innerHTML = `${s.curriculum_mastery}% <span class="text-xs font-normal theme-text-sub">/100%</span>`;
  document.getElementById('meter-current-sub').textContent = `${completedMilestones} of ${totalMilestones} verified`;

  // Dial 2: Concept Deficits
  document.getElementById('meter-gap-val').innerHTML = `${s.concept_deficits}% <span class="text-xs font-normal theme-text-sub">untested</span>`;
  document.getElementById('meter-gap-sub').textContent = `${totalMilestones - completedMilestones} syllabus topics left`;

  // Dial 3: Career Readiness (Strict 0% when unstarted)
  document.getElementById('meter-readiness-val').innerHTML = `${s.readiness}% <span class="text-xs font-normal theme-text-sub">score</span>`;
  document.getElementById('meter-readiness-sub').textContent = s.readiness === 0 ? 'Course unstarted' : 'Verified clearance';

  // Dial 4: Dynamic Study Sprint Pace
  document.getElementById('meter-time-val').innerHTML = `${s.target_pace}% <span class="text-xs font-normal theme-text-sub">pace</span>`;
  document.getElementById('meter-time-sub').textContent = s.target_pace === 0 ? 'Sprint unstarted' : 'Active velocity';

  document.getElementById('label-ring-1').textContent = `${s.curriculum_mastery}%`;
  document.getElementById('label-ring-2').textContent = `${s.concept_deficits}%`;
  document.getElementById('label-ring-3').textContent = `${s.readiness}%`;
  document.getElementById('label-ring-4').textContent = `${s.target_pace}%`;

  updateRadialMeter('dial-ring-1', s.curriculum_mastery);
  updateRadialMeter('dial-ring-2', s.concept_deficits);
  updateRadialMeter('dial-ring-3', s.readiness);
  updateRadialMeter('dial-ring-4', s.target_pace);

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

// MILESTONE TOGGLE (Dynamically recalculates XP, Mastery, Deficits, Readiness, and Pace)
async function toggleMilestoneState(mId) {
  (window.currentStudent.phases || []).forEach(phase => {
    (phase.milestones || []).forEach(m => {
      if (m.id === mId) {
        m.completed = !m.completed;
        const delta = m.xp || 100;
        window.currentStudent.xp = m.completed ? (window.currentStudent.xp || 0) + delta : Math.max(0, (window.currentStudent.xp || 0) - delta);
      }
    });
  });

  window.currentStudent.level = Math.floor((window.currentStudent.xp || 0) / 1000) + 1;
  recalculateMetrics();

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
  
  if (t.includes('pharmacology') || t.includes('drug') || t.includes('dose')) {
    return {
      theory: "Receptor pharmacodynamics (Beta-1/Beta-2 adrenergic antagonism, Renin-Angiotensin-Aldosterone cascade inhibition, and Vaughan Williams Class I-IV antiarrhythmic mechanisms).",
      caseStudy: "Titrating Quadruple Therapy (ARNI, SGLT2i, Beta-Blocker, MRA) in decompensated heart failure with preserved renal function and hypotension considerations.",
      deliverable: "Emergency dosing reference card for intravenous vasodilators, inotropes (Dobutamine, Milrinone), and antiarrhythmics (Amiodarone)."
    };
  }

  if (t.includes('coronary') || t.includes('artery') || t.includes('stemi') || t.includes('infarct')) {
    return {
      theory: "Atherosclerotic plaque rupture cascade, platelet aggregation pathways (GPIIb/IIIa), subendocardial ischemia versus transmural necrosis pathology.",
      caseStudy: "Managing acute ST-elevation myocardial infarction with cardiogenic shock, door-to-balloon time benchmarks (<90 min), and dual antiplatelet loading protocols.",
      deliverable: "High-risk acute chest pain triage pathway decision tree with troponin kinetics and Killip classification grading."
    };
  }

  if (t.includes('electrophysiology') || t.includes('ecg') || t.includes('action potential') || t.includes('arrhythmia')) {
    return {
      theory: "Cellular ionic flux (Na+ fast channels in Phase 0, transient outward K+ in Phase 1, L-type Ca2+ plateau in Phase 2, rapid delayed rectifier K+ in Phase 3, Na+/K+ ATPase in Phase 4).",
      caseStudy: "12-Lead ECG localization: differentiating anterior LAD occlusions (V1-V4) from RCA inferior infarcts (II, III, aVF) and identifying reciprocal ST-depression.",
      deliverable: "Systematic 7-step vector analysis checklist for bundle branch blocks, QT prolongation risk scoring, and emergency cardioversion indications."
    };
  }

  return {
    theory: `Authoritative clinical/technical foundations, mathematical formulas, and structural rules for "${title}".`,
    caseStudy: `Real-world clinical or production protocol analyzing how specialists in ${goal} execute "${title}" under acute conditions.`,
    deliverable: `Standardized operational procedure, diagnostic protocol, or technical deliverable verifying mastery of "${title}".`
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
  const background = s.current_knowledge || 'Educational Baseline';
  const deficitsPercentage = s.concept_deficits !== undefined ? s.concept_deficits : 100;

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
    gapMilestones.forEach((gm, idx) => {
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
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
      <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
        <div class="text-[10px] font-mono uppercase font-bold text-rose-400">Target Deficit Ratio</div>
        <div class="text-2xl font-black font-mono mt-1">${deficitsPercentage}% Untested</div>
        <div class="text-[10px] theme-text-sub mt-0.5">${gapMilestones.length} syllabus competencies remaining</div>
      </div>
      <div class="p-4 rounded-2xl theme-card-inner border border-white/10 sm:col-span-2 space-y-1">
        <div class="text-[10px] font-mono uppercase font-bold dynamic-accent-text">Candidate Baseline vs Hiring Clearance</div>
        <div class="text-xs font-semibold theme-text-title">From: "${escapeHtml(background)}" → Target: "${escapeHtml(goal)}"</div>
        <p class="text-[11px] theme-text-sub leading-relaxed">
          The analyzer isolates clinical, technical, and operational vulnerabilities that must be verified before career benchmark clearance.
        </p>
      </div>
    </div>

    <div class="space-y-2.5 pt-2">
      <div class="flex items-center justify-between text-xs font-bold theme-text-title">
        <span class="flex items-center gap-1.5 text-rose-400">
          <span>⚠️</span> <span>High-Priority Concept Gaps to Bridge:</span>
        </span>
        <span class="text-[10px] font-mono theme-text-sub">Click "Bridge Gap" to verify completion</span>
      </div>
      <div class="space-y-2">
        ${gapListHTML}
      </div>
    </div>

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

// ==========================================================
// GOAL-SPECIFIC ENDLESS AI MCQ STUDIO
// ==========================================================
window.startEndlessMCQSession = function() {
  mcqSession = { total: 0, correct: 0, wrong: 0, answeredCurrent: false, incorrectReview: [], activeQuestion: null };
  const corr = document.getElementById('mcq-correct-counter');
  const wrng = document.getElementById('mcq-wrong-counter');
  const bdg = document.getElementById('mcq-badge-track');
  const sub = document.getElementById('mcq-subtext');

  const goal = window.currentStudent?.career_goal || 'Specialist';
  if (corr) corr.textContent = '0';
  if (wrng) wrng.textContent = '0';
  if (bdg) bdg.textContent = goal;
  if (sub) sub.textContent = `Continuous AI question generator tailored exclusively to ${goal}`;

  openModal('modal-mcq');
  generateNextMCQ();
};

window.generateNextMCQ = async function() {
  mcqSession.answeredCurrent = false;
  const nxt = document.getElementById('btn-next-mcq');
  const fb = document.getElementById('mcq-instant-feedback');
  const qNum = document.getElementById('mcq-question-number');
  const qTopic = document.getElementById('mcq-topic-tag');
  const qText = document.getElementById('mcq-question-text');
  const container = document.getElementById('mcq-choices-container');

  if (nxt) nxt.style.display = 'none';
  if (fb) fb.style.display = 'none';
  if (qNum) qNum.textContent = `Challenge #${mcqSession.total + 1}`;
  if (qText) qText.textContent = "Synthesizing challenge from Gemini for your target career...";
  if (container) container.innerHTML = '<div class="p-6 text-center theme-text-sub italic"><span class="w-2 h-2 rounded-full bg-purple-400 animate-ping inline-block mr-2"></span>Generating domain question...</div>';

  const goal = window.currentStudent?.career_goal || 'Cardiologist';
  
  // Pick active topic from student's curriculum
  let currentTopic = goal;
  const phases = window.currentStudent?.phases || [];
  if (phases[activePhaseIdx]?.milestones?.length > 0) {
    const mIdx = mcqSession.total % phases[activePhaseIdx].milestones.length;
    currentTopic = phases[activePhaseIdx].milestones[mIdx].title;
  }

  try {
    const res = await fetch('/api/mcq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        careerGoal: goal,
        currentTopic: currentTopic,
        completedCount: mcqSession.total
      })
    });

    const aiMCQ = await res.json();
    if (aiMCQ.error || !aiMCQ.options) throw new Error(aiMCQ.error || 'Malformed question');

    mcqSession.activeQuestion = aiMCQ;
    renderMCQQuestion(aiMCQ);
  } catch (err) {
    console.warn("AI MCQ synthesis fallback engaged:", err.message);
    const fallbackQuestion = generateOfflineGoalMCQ(goal, currentTopic, mcqSession.total);
    mcqSession.activeQuestion = fallbackQuestion;
    renderMCQQuestion(fallbackQuestion);
  }
};

function renderMCQQuestion(qObj) {
  const qTopic = document.getElementById('mcq-topic-tag');
  const qText = document.getElementById('mcq-question-text');
  const container = document.getElementById('mcq-choices-container');

  if (qTopic) qTopic.textContent = qObj.topic || window.currentStudent?.career_goal || "Core Concept";
  if (qText) qText.textContent = qObj.q;
  if (!container) return;
  container.innerHTML = '';

  (qObj.options || []).forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = "mcq-choice-btn w-full text-left p-3.5 rounded-xl theme-card-inner text-xs theme-text-title font-medium transition flex items-start gap-2.5 cursor-pointer";
    btn.innerHTML = `<span class="font-mono dynamic-accent-text font-bold">${String.fromCharCode(65 + idx)}.</span> <span>${escapeHtml(opt)}</span>`;
    btn.onclick = () => handleMCQChoice(idx, qObj);
    container.appendChild(btn);
  });
}

function generateOfflineGoalMCQ(goal, topic, count) {
  const g = (goal || '').toLowerCase();
  
  if (g.includes('cardio') || g.includes('medic') || g.includes('doctor')) {
    const bank = [
      {
        q: "Which ion channel conductance phase of the cardiac myocyte action potential is responsible for the rapid, transient Phase 1 repolarization?",
        topic: "Cardiac Electrophysiology",
        options: [
          "Inactivation of fast inward Na+ channels with transient outward K+ (I_to) activation.",
          "Opening of L-type Ca2+ slow inward channels.",
          "Delayed rectifier K+ (I_Kr) repolarizing outflow."
        ],
        correct: 0,
        explanation: "Phase 1 repolarization is driven by the rapid inactivation of Phase 0 fast Na+ channels combined with the activation of transient outward K+ currents (I_to)."
      },
      {
        q: "In Wiggers pressure-volume loops, acute aortic valve regurgitation causes which primary hemodynamic variation?",
        topic: "Hemodynamics & Valvular Mechanics",
        options: [
          "Widened pulse pressure with steep diastolic runoff into the left ventricle, eliminating true isovolumetric relaxation.",
          "Isolated elevation of peak systolic aortic pressure without changes in end-diastolic volume.",
          "Premature closure of the tricuspid valve during early isovolumetric contraction."
        ],
        correct: 0,
        explanation: "Aortic regurgitation leaks blood retrograde from the aorta into the left ventricle during diastole, widening pulse pressure and preventing a true isovolumetric relaxation phase."
      },
      {
        q: "In 12-Lead ECG interpretation, persistent ST-segment elevation in leads V1-V4 indicates infarction of which anatomical territory?",
        topic: "Clinical ECG Interpretation",
        options: [
          "Anteroseptal myocardial infarction (Left Anterior Descending Artery).",
          "Inferior wall myocardial infarction (Right Coronary Artery).",
          "Posterior wall infarction (Left Circumflex Artery)."
        ],
        correct: 0,
        explanation: "Leads V1-V4 look directly at the anterior and septal walls of the left ventricle, perfused by the Left Anterior Descending (LAD) coronary artery."
      }
    ];
    return bank[count % bank.length];
  }

  // General Goal Fallback
  return {
    q: `For a professional in ${goal}, which core principle is critical when executing ${topic}?`,
    topic: topic,
    options: [
      `Systematically identify underlying dependencies, reduce variance, and document edge cases.`,
      `Bypass baseline testing protocols to deploy directly to end users.`,
      `Rely exclusively on subjective intuition rather than verified performance telemetry.`
    ],
    correct: 0,
    explanation: `Disciplined execution in ${goal} requires verifying constraints, measuring baseline performance, and documenting edge scenarios.`
  };
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

  if (fb) {
    fb.style.display = 'block';
    if (isCorrect) {
      mcqSession.correct++;
      document.getElementById('mcq-correct-counter').textContent = mcqSession.correct;
      fb.className = "p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium";
      fb.innerHTML = `<strong>✓ Correct!</strong> ${escapeHtml(qObj.explanation)}`;
      
      // Bonus XP for correct domain challenge
      if (window.currentStudent) {
        window.currentStudent.xp = (window.currentStudent.xp || 0) + 50;
        updateDashboardUI();
      }
    } else {
      mcqSession.wrong++;
      document.getElementById('mcq-wrong-counter').textContent = mcqSession.wrong;
      fb.className = "p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium";
      fb.innerHTML = `<strong>✕ Incorrect.</strong> You picked ${String.fromCharCode(65 + selectedIdx)}.<br><br><strong>Key Concept:</strong> ${escapeHtml(qObj.explanation)}`;
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
          <div class="font-bold theme-text-title">${escapeHtml(item.question)}</div>
          <div class="text-rose-500 font-medium">✕ Your Choice: ${escapeHtml(item.userAnswer)}</div>
          <div class="text-emerald-500 font-medium">✓ Correct Concept: ${escapeHtml(item.correctAnswer)}</div>
          <div class="theme-text-sub text-[11px] pt-1 leading-relaxed">${escapeHtml(item.explanation)}</div>
        </div>
      `;
    });
  }
  openModal('modal-scorecard');
};

// GITHUB TELEMETRY
window.fetchGitHubRepos = async function() {
  const u = (document.getElementById('in-github-scan').value || window.currentStudent?.github || '').trim();
  const c = document.getElementById('github-repos-container');
  if (!u) {
    c.innerHTML = '<div class="p-3 text-rose-400">Please enter a GitHub username to scan.</div>';
    return;
  }

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
