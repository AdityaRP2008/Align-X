/**
 * Align-X Academic Engine
 * Zero Premade Data + Supabase Storage + Post-Auth Data Collection
 * OmniRoute Phased Roadmap + Live Milestone Content Checker + Endless Adaptive MCQs & Logic Riddles
 */

// SUPABASE INITIALIZATION
const SUPABASE_URL = "https://eydgvcjsgkqiyqjkkedi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZGd2Y2pzZ2txaXlxamtrZWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzc4NTUsImV4cCI6MjEwNDYxMzg1NX0.LuM7hHQuAZwvLyxXZycsl8lDkKoqKCsiD64PiVOcnKI";

let supabase = null;
try {
  if (window.supabase && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes("YOUR_KEY")) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn("Supabase running in local fallback mode:", e.message);
}

const csFunFacts = [
  "Apollo 11's lunar guidance computer had only 4 kilobytes of RAM and operated at roughly 1 MHz clock speed.",
  "The first computer bug was an actual moth trapped inside the Harvard Mark II relay computer in 1947 by Grace Hopper.",
  "Git was written by Linus Torvalds in roughly 10 days to maintain the Linux kernel codebase.",
  "JavaScript was engineered in just 10 days in May 1995 by Brendan Eich while working at Netscape.",
  "Relational databases use B+ Trees because wide fanouts match physical storage disk page sizes."
];
let currentFactIdx = 0;

// EMPTY INITIAL STATE: NO PRE-MADE PROFILE OR ROADMAP
let currentStudent = null;

// Endless Puzzle Bank
const endlessPuzzleBank = [
  {
    title: "The Partitioned Consensus Dilemma",
    topic: "Distributed Systems & Raft",
    scenario: "You have 3 distributed nodes (A, B, C) coordinating writes under the Raft consensus algorithm. A network partition splits Node C onto an isolated subnet, while Nodes A and B communicate normally. A client issues a write request to Node C. Under Strong Consistency (CP), how must Node C respond?",
    options: [
      "Accept write (200 OK) and store it in an ephemeral buffer.",
      "Refuse the write / return Error (Cannot reach majority quorum of 2/3)."
    ],
    correct: 1,
    explanation: "In CP systems, a node cannot commit a write unless it reaches a majority quorum (N/2 + 1). Node C is isolated (1 of 3), so accepting a write would cause a fatal split-brain anomaly when the partition heals."
  },
  {
    title: "Cache Stampede & Thundering Herd",
    topic: "Backend & Low-Latency Systems",
    scenario: "A hot cache key in Redis expires while your web app receives 50,000 requests/second. All 50,000 concurrent requests miss the cache and hammer the PostgreSQL database simultaneously, crashing the primary replica. Which pattern prevents this thundering herd?",
    options: [
      "Deploy a distributed lock with a single worker cache-refresh mutex (or probabilistic early expiration).",
      "Increase the PostgreSQL max_connections setting to 100,000."
    ],
    correct: 0,
    explanation: "Using an atomic distributed lock (or XFetch probabilistic early recomputation) ensures only 1 worker process queries the database to warm the cache while other requests either wait or receive slightly stale cached data, protecting the database."
  },
  {
    title: "Database Deadlock in Concurrent Transfers",
    topic: "Database Concurrency",
    scenario: "Transaction 1 transfers $50 from Account A to Account B (locks A, waits for B). Transaction 2 concurrently transfers $50 from Account B to Account A (locks B, waits for A). Both transactions freeze indefinitely. How do you permanently eliminate this cycle at the application design level?",
    options: [
      "Acquire row locks in a strict global deterministic order (e.g., always lock the smaller account_id first).",
      "Remove foreign keys from the database schema."
    ],
    correct: 0,
    explanation: "Deadlocks occur when transactions request resources in circular conflicting orders. Forcing all transactions to acquire locks in a deterministic order (e.g., sort IDs: lock min(A,B), then max(A,B)) makes circular wait conditions mathematically impossible."
  }
];

// Endless Adaptive MCQ Bank
const adaptiveMCQBank = [
  {
    q: "Why do relational database engines (PostgreSQL, InnoDB) prefer B+ Trees over standard Red-Black Binary Trees for disk index storage?",
    topic: "Database Internals",
    options: [
      "Red-Black trees require non-volatile encryption keys on physical sectors.",
      "High fanout matches physical disk page block sizes, drastically reducing expensive random I/O seeks.",
      "Binary trees cannot store variable-width VARCHAR columns."
    ],
    correct: 1,
    explanation: "Disks read and write in block pages (4KB-8KB). B+ Trees have huge fanouts (100+ children/node), keeping tree depth to 3 or 4 levels and requiring only 3-4 disk seeks. Binary trees require dozens of pointer jumps across arbitrary disk sectors."
  },
  {
    q: "When implementing an atomic rate limiter across multiple auto-scaled Node.js instances, which architecture guarantees zero race conditions without table locks?",
    topic: "Distributed Systems",
    options: [
      "Using Redis running an atomic Lua script (Token Bucket algorithm).",
      "Storing requests in a local Node.js in-memory Map.",
      "Executing a SQL query: SELECT COUNT(*) WHERE created_at > NOW() - INTERVAL '1 minute'."
    ],
    correct: 0,
    explanation: "Redis executes Lua scripts atomically within a single event loop tick without context switching. Because all application instances query the same Redis cluster, the token bucket decrements linearly with zero race conditions."
  },
  {
    q: "In the JavaScript V8 engine event loop, what executes first immediately following the current synchronous call stack?",
    topic: "JavaScript Runtime",
    options: [
      "Macro-tasks scheduled via setTimeout(..., 0).",
      "Micro-task queue jobs (Promise.then, queueMicrotask).",
      "I/O polling callbacks."
    ],
    correct: 1,
    explanation: "The microtask queue is completely drained immediately after the synchronous execution stack empties, BEFORE the event loop picks the next macrotask (such as setTimeout) from the task queue."
  }
];

// MCQ Session State
let mcqSession = {
  active: false,
  questionIdx: 0,
  totalAnswered: 0,
  correctCount: 0,
  wrongCount: 0,
  secondsElapsed: 0,
  timerInterval: null,
  answeredCurrent: false,
  incorrectReview: []
};

// Puzzle Session State
let puzzleSession = {
  idx: 0,
  solvedCount: 0,
  answeredCurrent: false
};

let authMode = 'signup';

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'light') {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }

  initPointerGlow();
  setInterval(cycleFunFact, 8000);
  window.addEventListener('resize', renderRadar);

  // Check Local Session Storage for authenticated student
  const savedStudent = localStorage.getItem('alignx_student');
  if (savedStudent) {
    try {
      currentStudent = JSON.parse(savedStudent);
      renderAuthenticatedUI();
    } catch (e) {
      console.warn("Session restore error:", e);
    }
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#profile-dropdown-wrapper')) closeMenu('menu-profile');
  });
});

function toggleNavSidebar() {
  const drawer = document.getElementById('nav-drawer');
  if (drawer) drawer.classList.toggle('-translate-x-full');
}

function cycleFunFact() {
  const el = document.getElementById('cs-fun-fact-text');
  if (!el) return;
  el.style.opacity = '0';
  setTimeout(() => {
    currentFactIdx = (currentFactIdx + 1) % csFunFacts.length;
    el.textContent = csFunFacts[currentFactIdx];
    el.style.opacity = '1';
  }, 200);
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark');
  if (isDark) {
    html.classList.remove('light');
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.add('light');
    localStorage.setItem('theme', 'light');
  }
  if (currentStudent) {
    renderDashboard();
    renderRadar();
  }
}

function toggleMenu(id, e) {
  if (e) e.stopPropagation();
  const el = document.getElementById(id);
  if (el) el.classList.toggle('hidden');
}

function closeMenu(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function openModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

// ==========================================
// AUTHENTICATION (LOGIN & REGISTRATION)
// ==========================================

function openAuthModal(mode) {
  setAuthMode(mode);
  openModal('modal-auth');
}

function setAuthMode(mode) {
  authMode = mode;
  const isLogin = mode === 'login';
  const title = document.getElementById('auth-modal-title');
  const btnLogin = document.getElementById('btn-auth-mode-login');
  const btnSignup = document.getElementById('btn-auth-mode-signup');
  const btnSubmit = document.getElementById('btn-auth-submit');

  if (title) title.textContent = isLogin ? 'Student Login' : 'Enroll Student Account';
  if (btnSubmit) btnSubmit.textContent = isLogin ? 'Log In to Academic Dashboard →' : 'Register Student Profile →';

  if (isLogin) {
    btnLogin.className = "w-1/2 py-2 rounded-lg font-bold btn-brand shadow-sm transition";
    btnSignup.className = "w-1/2 py-2 rounded-lg font-bold text-slate-500 transition";
  } else {
    btnSignup.className = "w-1/2 py-2 rounded-lg font-bold btn-brand shadow-sm transition";
    btnLogin.className = "w-1/2 py-2 rounded-lg font-bold text-slate-500 transition";
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const emailVal = document.getElementById('auth-email').value.trim();

  closeModal('modal-auth');

  // Check Supabase if user exists
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('email', emailVal)
        .single();

      if (data && !error) {
        currentStudent = {
          ...data,
          academicLevel: data.academic_level,
          careerGoal: data.role || data.career_goal,
          matchedSkills: data.matched_skills || [],
          missingSkills: data.missing_skills || [],
          phases: data.phases || []
        };
        localStorage.setItem('alignx_student', JSON.stringify(currentStudent));
        renderAuthenticatedUI();
        return;
      }
    } catch (err) {
      console.warn("Supabase auth lookup:", err.message);
    }
  }

  // If new user or profile incomplete, prompt for student data collection
  currentStudent = {
    email: emailVal,
    name: "",
    academicLevel: "",
    careerGoal: "",
    tenure: "",
    github: "",
    readiness: 0,
    curriculumMastery: 0,
    conceptDeficits: 100,
    xp: 0,
    level: 1,
    matchedSkills: [],
    missingSkills: [],
    radar: {
      categories: ["Frontend", "Backend APIs", "System Design", "Databases", "DevOps", "Testing"],
      candidate: [0, 0, 0, 0, 0, 0],
      benchmark: [90, 85, 80, 85, 75, 75]
    },
    phases: []
  };

  openModal('modal-onboarding');
}

// GITHUB USERNAME PRE-VERIFICATION
async function verifyAndInspectGitHubInput() {
  const input = document.getElementById('in-github');
  const note = document.getElementById('github-verify-note');
  const username = input.value.trim();
  if (!username) return;

  note.textContent = `Connecting to GitHub API for @${username}...`;
  note.className = "text-[11px] text-purple-400 mt-1";

  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
    if (!res.ok) throw new Error("GitHub username not found");
    const repos = await res.json();
    const languages = [...new Set(repos.map(r => r.language).filter(Boolean))];
    note.textContent = `Verified ✓ Found ${repos.length} public repos. Detected stacks: ${languages.join(', ')}`;
    note.className = "text-[11px] text-emerald-500 mt-1 font-semibold";
  } catch (err) {
    note.textContent = `Warning: Could not verify @${username} (${err.message}).`;
    note.className = "text-[11px] text-rose-500 mt-1";
  }
}

// ==========================================
// DATA COLLECTION & OMNIROUTE ROADMAP SYNTHESIS
// ==========================================

async function handleOnboardingSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-onboarding');
  btn.textContent = "Synthesizing Roadmap via OmniRoute...";
  btn.disabled = true;

  const name = document.getElementById('in-name').value.trim();
  const academicLevel = document.getElementById('in-academic-level').value;
  const careerGoal = document.getElementById('in-career-goal').value;
  const tenure = document.getElementById('in-tenure').value;
  const github = document.getElementById('in-github').value.trim();

  // Scan public repositories for languages
  let detectedLanguages = [];
  try {
    const ghRes = await fetch(`https://api.github.com/users/${github}/repos?sort=updated&per_page=8`);
    if (ghRes.ok) {
      const ghRepos = await ghRes.json();
      detectedLanguages = [...new Set(ghRepos.map(r => r.language).filter(Boolean))];
    }
  } catch (e) {
    console.warn("GitHub inspection skipped:", e.message);
  }

  try {
    // Invoke OmniRoute Roadmap generator
    const aiRes = await fetch('/api/roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        academicLevel,
        careerGoal,
        tenure,
        github,
        detectedSkills: detectedLanguages
      })
    });

    if (!aiRes.ok) throw new Error("OmniRoute Gateway error");
    const aiData = await aiRes.json();

    currentStudent = {
      ...currentStudent,
      name,
      academicLevel,
      careerGoal,
      tenure,
      github,
      readiness: aiData.readiness || 35,
      curriculumMastery: aiData.curriculumMastery || 30,
      conceptDeficits: aiData.conceptDeficits || 70,
      matchedSkills: aiData.matchedSkills || detectedLanguages,
      missingSkills: aiData.missingSkills || [],
      radar: aiData.radar || currentStudent.radar,
      phases: aiData.phases || [],
      xp: 200, // Onboarding bonus
      level: 1
    };

    // Save profile to Supabase
    await syncStudentToSupabase();

    localStorage.setItem('alignx_student', JSON.stringify(currentStudent));
    closeModal('modal-onboarding');
    renderAuthenticatedUI();
  } catch (err) {
    alert(`Notice: Failed to synthesize roadmap via API (${err.message}). Generating standard baseline.`);
    currentStudent = {
      ...currentStudent,
      name,
      academicLevel,
      careerGoal,
      tenure,
      github,
      readiness: 40,
      curriculumMastery: 35,
      conceptDeficits: 65,
      matchedSkills: detectedLanguages.length ? detectedLanguages : ["Core Fundamentals"],
      missingSkills: [
        { name: "Distributed Caching (Redis)", tag: "Critical Void", capstoneTitle: "Redis Rate Limiter", capstoneDesc: "Deploy an atomic token bucket in Redis using Lua scripts." }
      ],
      radar: {
        categories: ["Frontend", "Backend APIs", "System Design", "Databases", "DevOps", "Testing"],
        candidate: [50, 45, 30, 40, 20, 30],
        benchmark: [90, 85, 80, 85, 75, 75]
      },
      phases: [
        {
          phaseTitle: "Phase 1: Foundational Systems & Tooling",
          milestones: [
            { id: "m1", title: "Containerize multi-stage runtime with Docker Compose", hours: "8 hrs", resource: "Docker Multi-stage Builds", completed: false, xp: 100 }
          ]
        }
      ],
      xp: 150,
      level: 1
    };
    await syncStudentToSupabase();
    localStorage.setItem('alignx_student', JSON.stringify(currentStudent));
    closeModal('modal-onboarding');
    renderAuthenticatedUI();
  } finally {
    btn.textContent = "Generate Roadmap with OmniRoute →";
    btn.disabled = false;
  }
}

// PERSISTENCE SYNC TO SUPABASE
async function syncStudentToSupabase() {
  if (!supabase || !currentStudent) return;
  try {
    await supabase.from('students').upsert({
      email: currentStudent.email,
      name: currentStudent.name,
      academic_level: currentStudent.academicLevel,
      career_goal: currentStudent.careerGoal,
      tenure: currentStudent.tenure,
      github: currentStudent.github,
      readiness: currentStudent.readiness,
      curriculum_mastery: currentStudent.curriculumMastery,
      concept_deficits: currentStudent.conceptDeficits,
      matched_skills: currentStudent.matchedSkills,
      missing_skills: currentStudent.missingSkills,
      radar: currentStudent.radar,
      phases: currentStudent.phases,
      xp: currentStudent.xp,
      level: currentStudent.level
    }, { onConflict: 'email' });
  } catch (err) {
    console.warn("Supabase background sync:", err.message);
  }
}

function logoutStudent() {
  currentStudent = null;
  localStorage.removeItem('alignx_student');
  location.reload();
}

// ==========================================
// UI RENDERING & TELEMETRY
// ==========================================

function renderAuthenticatedUI() {
  if (!currentStudent || !currentStudent.careerGoal) return;

  // Reveal telemetry and hide empty onboarding prompt
  document.getElementById('onboarding-callout')?.classList.add('hidden');
  document.getElementById('telemetry-dials-section')?.classList.remove('hidden');
  document.getElementById('dashboard-core-section')?.classList.remove('hidden');
  document.getElementById('profile-dropdown-wrapper')?.classList.remove('hidden');
  document.getElementById('btn-auth-trigger')?.classList.add('hidden');
  document.getElementById('btn-nav-github')?.classList.remove('hidden');

  document.getElementById('nav-current-role').textContent = currentStudent.careerGoal;
  document.getElementById('nav-user-name').textContent = currentStudent.name;
  document.getElementById('nav-user-term').textContent = `${currentStudent.academicLevel} • ${currentStudent.tenure}`;
  document.getElementById('drawer-student-name').textContent = currentStudent.name;
  document.getElementById('drawer-student-meta').textContent = `${currentStudent.academicLevel} • ${currentStudent.careerGoal}`;
  document.getElementById('nav-avatar-initials').textContent = currentStudent.name.split(' ').map(n=>n[0]).join('').substring(0,2);
  document.getElementById('nav-github-label').textContent = `@${currentStudent.github}`;

  renderDashboard();
  renderRadar();
}

function updateRadialMeter(circleId, labelId, percentage, strokeColor) {
  const circle = document.getElementById(circleId);
  const label = document.getElementById(labelId);
  const clamped = Math.max(0, Math.min(100, percentage));
  const circumference = 2 * Math.PI * 26; // ~163.36
  
  if (circle) {
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = circumference - (clamped / 100) * circumference;
    if (strokeColor) circle.setAttribute('stroke', strokeColor);
  }
  if (label) {
    label.textContent = `${clamped}%`;
  }
}

function renderDashboard() {
  if (!currentStudent) return;
  const isDark = document.documentElement.classList.contains('dark');
  const primaryColor = isDark ? '#C084FC' : '#EA580C';
  const purpleColor = isDark ? '#C084FC' : '#9333EA';

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  const total = (currentStudent.matchedSkills?.length || 0) + (currentStudent.missingSkills?.length || 0);

  // 1. Curriculum Mastery
  setTxt('meter-current-val', `${currentStudent.curriculumMastery}%`);
  setTxt('meter-current-sub', `${currentStudent.matchedSkills?.length || 0} of ${total} verified units`);
  updateRadialMeter('circle-current-skill', 'circle-current-label', currentStudent.curriculumMastery, primaryColor);

  // 2. Concept Deficits
  setTxt('meter-gap-val', `${currentStudent.conceptDeficits}%`);
  setTxt('meter-gap-sub', `${currentStudent.missingSkills?.length || 0} critical voids to bridge`);
  updateRadialMeter('circle-skill-gap', 'circle-gap-label', currentStudent.conceptDeficits, purpleColor);

  // 3. Career Readiness
  setTxt('meter-readiness-val', `${currentStudent.readiness}%`);
  setTxt('meter-readiness-sub', `Target: ${currentStudent.careerGoal}`);
  updateRadialMeter('circle-career-readiness', 'circle-readiness-label', currentStudent.readiness, primaryColor);

  // 4. Target Tenure Pace
  const pace = Math.min(100, Math.round((currentStudent.readiness / 75) * 100));
  setTxt('meter-time-val', `${pace}%`);
  setTxt('meter-tenure-sub', `Urgency: ${currentStudent.tenure}`);
  updateRadialMeter('circle-time-goal', 'circle-time-label', pace, primaryColor);

  // Gamification Level
  setTxt('player-level-badge', `L${currentStudent.level}`);
  setTxt('xp-level-title', `Level ${currentStudent.level}: Candidate`);
  setTxt('xp-progress-label', `${currentStudent.xp} / 1000 XP`);
  setTxt('menu-profile-xp', `XP: ${currentStudent.xp} / 1000 (Level ${currentStudent.level})`);

  const xpPct = Math.min(100, Math.round((currentStudent.xp / 1000) * 100));
  const bar = document.getElementById('xp-progress-bar');
  if (bar) bar.style.width = `${xpPct}%`;

  // Missing Skills Chips
  const missingBox = document.getElementById('chips-missing-critical');
  if (missingBox) {
    missingBox.innerHTML = '';
    (currentStudent.missingSkills || []).forEach(skill => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.onclick = () => openCapstone(skill.capstoneTitle || skill.name, skill.capstoneDesc);
      btn.className = "deficit-chip flex items-center gap-2";
      btn.innerHTML = `<span>${skill.name}</span><span class="text-[10px] font-mono uppercase px-2 py-0.5 bg-purple-500/20 text-purple-700 dark:text-purple-200 rounded-md font-extrabold tracking-wider">Lab Spec</span>`;
      missingBox.appendChild(btn);
    });
  }

  // Matched Competency Chips
  const matchedBox = document.getElementById('chips-matched-skills');
  if (matchedBox) {
    matchedBox.innerHTML = '';
    (currentStudent.matchedSkills || []).forEach(skill => {
      const span = document.createElement('span');
      span.className = "competency-chip flex items-center gap-1.5";
      span.innerHTML = `<span>✓</span> <span>${skill}</span>`;
      matchedBox.appendChild(span);
    });
  }
}

// ==========================================
// ROADMAP CONTENT VIEWER & LIVE COMPLETION CHECKER
// ==========================================

function openPersonalizedRoadmap() {
  if (!currentStudent || !currentStudent.phases || currentStudent.phases.length === 0) {
    alert("Please sign in and set up your student profile to view your synthesized roadmap.");
    openModal('modal-onboarding');
    return;
  }

  renderRoadmapPhases();
  openModal('modal-roadmap');
}

function renderRoadmapPhases() {
  const container = document.getElementById('roadmap-phases-container');
  if (!container) return;
  container.innerHTML = '';

  currentStudent.phases.forEach((phase, pIdx) => {
    const phaseBox = document.createElement('div');
    phaseBox.className = "p-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-3";

    const header = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-md bg-purple-500/20 text-purple-600 dark:text-purple-400 font-mono font-bold text-xs flex items-center justify-center">${pIdx + 1}</span>
          <h4 class="text-xs font-bold text-slate-900 dark:text-white">${phase.phaseTitle}</h4>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">Active Sprint</span>
      </div>
    `;

    let milestonesHtml = `<div class="space-y-2 pt-1">`;
    phase.milestones.forEach(m => {
      milestonesHtml += `
        <div class="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-start justify-between gap-3 text-xs">
          <div class="flex items-start gap-3">
            <input type="checkbox" id="${m.id}" ${m.completed ? 'checked' : ''} onchange="toggleRoadmapMilestone('${m.id}')"
                   class="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer">
            <div>
              <label for="${m.id}" class="font-medium cursor-pointer ${m.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}">
                ${m.title}
              </label>
              <div class="text-[11px] text-slate-500 mt-1">${m.hours} • <span class="text-purple-600 dark:text-purple-400 font-semibold">${m.resource}</span></div>
            </div>
          </div>
          <span class="shrink-0 text-[10px] font-mono px-2 py-1 rounded bg-amber-500/10 text-amber-500 font-bold">+${m.xp || 100} XP</span>
        </div>
      `;
    });
    milestonesHtml += `</div>`;

    phaseBox.innerHTML = header + milestonesHtml;
    container.appendChild(phaseBox);
  });
}

// LIVE MILESTONE CHECKER: ACCURATELY ADJUSTS TELEMETRY & RE-SYNCS
async function toggleRoadmapMilestone(mId) {
  let totalCount = 0;
  let completedCount = 0;

  currentStudent.phases.forEach(p => {
    p.milestones.forEach(m => {
      if (m.id === mId) {
        m.completed = !m.completed;
        if (m.completed) {
          currentStudent.xp += (m.xp || 100);
        } else {
          currentStudent.xp = Math.max(0, currentStudent.xp - (m.xp || 100));
        }
      }
      totalCount++;
      if (m.completed) completedCount++;
    });
  });

  // Dynamically calculate telemetry adjustments
  const completionRatio = completedCount / (totalCount || 1);
  const baseReadiness = 35;
  currentStudent.readiness = Math.min(100, Math.round(baseReadiness + completionRatio * (100 - baseReadiness)));
  currentStudent.curriculumMastery = Math.min(100, Math.round(30 + completionRatio * 70));
  currentStudent.conceptDeficits = Math.max(0, 100 - currentStudent.curriculumMastery);

  // Check Level Progression
  if (currentStudent.xp >= 1000) {
    currentStudent.level = Math.floor(currentStudent.xp / 1000) + 1;
  }

  // Update Radar scores
  currentStudent.radar.candidate = currentStudent.radar.candidate.map(score => Math.min(95, score + 4));

  renderRoadmapPhases();
  renderDashboard();
  renderRadar();

  // Instant persistence to Supabase
  await syncStudentToSupabase();
  localStorage.setItem('alignx_student', JSON.stringify(currentStudent));
}

// ==========================================
// ENDLESS ADAPTIVE MCQ STUDIO
// ==========================================

function startAdaptiveMCQSession() {
  mcqSession.active = true;
  mcqSession.questionIdx = 0;
  mcqSession.totalAnswered = 0;
  mcqSession.correctCount = 0;
  mcqSession.wrongCount = 0;
  mcqSession.secondsElapsed = 0;
  mcqSession.incorrectReview = [];
  mcqSession.answeredCurrent = false;

  document.getElementById('mcq-badge-track').textContent = currentStudent?.careerGoal || "Technical Assessment";
  document.getElementById('mcq-correct-counter').textContent = '0';
  document.getElementById('mcq-wrong-counter').textContent = '0';
  document.getElementById('mcq-session-timer').textContent = '00:00';

  clearInterval(mcqSession.timerInterval);
  mcqSession.timerInterval = setInterval(() => {
    mcqSession.secondsElapsed++;
    const mins = String(Math.floor(mcqSession.secondsElapsed / 60)).padStart(2, '0');
    const secs = String(mcqSession.secondsElapsed % 60).padStart(2, '0');
    document.getElementById('mcq-session-timer').textContent = `${mins}:${secs}`;
  }, 1000);

  openModal('modal-mcq');
  generateNextMCQ();
}

function generateNextMCQ() {
  mcqSession.answeredCurrent = false;
  document.getElementById('btn-next-mcq').classList.add('hidden');
  const fb = document.getElementById('mcq-instant-feedback');
  fb.classList.add('hidden');

  const qObj = adaptiveMCQBank[mcqSession.questionIdx % adaptiveMCQBank.length];

  document.getElementById('mcq-question-number').textContent = `Question #${mcqSession.totalAnswered + 1}`;
  document.getElementById('mcq-topic-tag').textContent = qObj.topic;
  document.getElementById('mcq-question-text').textContent = qObj.q;

  const container = document.getElementById('mcq-choices-container');
  container.innerHTML = '';

  qObj.options.forEach((optText, optIdx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = "mcq-choice-btn w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-xs hover:bg-slate-100 dark:hover:bg-white/10 transition font-medium flex items-start gap-2.5";
    btn.innerHTML = `<span class="font-mono text-purple-500 font-bold">${String.fromCharCode(65 + optIdx)}.</span> <span>${optText}</span>`;
    btn.onclick = () => handleMCQSubmission(optIdx, qObj);
    container.appendChild(btn);
  });
}

function handleMCQSubmission(selectedIdx, qObj) {
  if (mcqSession.answeredCurrent) return;
  mcqSession.answeredCurrent = true;
  mcqSession.totalAnswered++;

  const isCorrect = (selectedIdx === qObj.correct);
  const fb = document.getElementById('mcq-instant-feedback');
  const allBtns = document.querySelectorAll('.mcq-choice-btn');

  allBtns.forEach((b, idx) => {
    b.disabled = true;
    if (idx === qObj.correct) {
      b.classList.add('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-700', 'dark:text-emerald-300');
    } else if (idx === selectedIdx && !isCorrect) {
      b.classList.add('bg-rose-500/20', 'border-rose-500', 'text-rose-700', 'dark:text-rose-300');
    }
  });

  fb.classList.remove('hidden');

  if (isCorrect) {
    mcqSession.correctCount++;
    document.getElementById('mcq-correct-counter').textContent = mcqSession.correctCount;
    fb.className = "p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs";
    fb.innerHTML = `<strong>✓ Correct:</strong> ${qObj.explanation}`;
    if (currentStudent) {
      currentStudent.xp += 50;
      renderDashboard();
    }
  } else {
    mcqSession.wrongCount++;
    document.getElementById('mcq-wrong-counter').textContent = mcqSession.wrongCount;
    fb.className = "p-3.5 rounded-xl bg-rose-100 dark:bg-rose-950/40 border border-rose-300 text-rose-800 dark:text-rose-300 text-xs";
    fb.innerHTML = `<strong>✕ Incorrect:</strong> ${qObj.explanation}`;
    mcqSession.incorrectReview.push({
      question: qObj.q,
      userAnswer: qObj.options[selectedIdx],
      correctAnswer: qObj.options[qObj.correct],
      explanation: qObj.explanation,
      topic: qObj.topic
    });
  }

  mcqSession.questionIdx++;
  document.getElementById('btn-next-mcq').classList.remove('hidden');
}

function finishMCQSession() {
  clearInterval(mcqSession.timerInterval);
  closeModal('modal-mcq');

  const total = mcqSession.totalAnswered;
  const correct = mcqSession.correctCount;
  const wrong = mcqSession.wrongCount;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const avgPace = total > 0 ? Math.round(mcqSession.secondsElapsed / total) : 0;

  document.getElementById('scorecard-total').textContent = total;
  document.getElementById('scorecard-correct').textContent = correct;
  document.getElementById('scorecard-wrong').textContent = wrong;
  document.getElementById('scorecard-accuracy').textContent = `${accuracy}% (${avgPace}s/q)`;

  const listContainer = document.getElementById('scorecard-breakdown-list');
  listContainer.innerHTML = '';

  if (mcqSession.incorrectReview.length === 0) {
    listContainer.innerHTML = `
      <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-center">
        🏆 Flawless performance! Zero concept gaps identified in this sprint.
      </div>
    `;
  } else {
    mcqSession.incorrectReview.forEach(item => {
      const box = document.createElement('div');
      box.className = "p-4 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-2";
      box.innerHTML = `
        <div class="flex items-center justify-between text-[11px] font-mono">
          <span class="font-bold text-purple-500">${item.topic}</span>
          <span class="text-rose-500 font-semibold">Missed Void</span>
        </div>
        <p class="font-bold text-slate-800 dark:text-slate-200 text-xs">${item.question}</p>
        <div class="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs">
          <strong>Your Answer:</strong> ${item.userAnswer}
        </div>
        <div class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs">
          <strong>Correct Concept:</strong> ${item.correctAnswer}
        </div>
        <p class="text-slate-600 dark:text-slate-400 text-xs pt-1 leading-relaxed">
          <strong>Explanation:</strong> ${item.explanation}
        </p>
      `;
      listContainer.appendChild(box);
    });
  }

  openModal('modal-scorecard');
}

// ==========================================
// ENDLESS LOGIC RIDDLE STUDIO
// ==========================================

function startEndlessPuzzleSession() {
  puzzleSession.idx = 0;
  puzzleSession.solvedCount = 0;
  document.getElementById('puzzle-solved-counter').textContent = '0';
  openModal('modal-puzzle');
  generateNextPuzzle();
}

function generateNextPuzzle() {
  puzzleSession.answeredCurrent = false;
  document.getElementById('btn-next-puzzle').classList.add('hidden');
  const fb = document.getElementById('puzzle-instant-feedback');
  fb.classList.add('hidden');

  const pObj = endlessPuzzleBank[puzzleSession.idx % endlessPuzzleBank.length];

  document.getElementById('puzzle-title-number').textContent = `Riddle #${puzzleSession.idx + 1}`;
  document.getElementById('puzzle-topic-tag').textContent = pObj.topic;
  document.getElementById('puzzle-scenario-text').textContent = pObj.scenario;

  const container = document.getElementById('puzzle-choices-container');
  container.innerHTML = '';

  pObj.options.forEach((optText, optIdx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = "puzzle-btn p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-xs hover:bg-slate-100 dark:hover:bg-white/10 transition text-left font-medium";
    btn.textContent = `${optIdx + 1}. ${optText}`;
    btn.onclick = () => handlePuzzleSubmission(optIdx, pObj);
    container.appendChild(btn);
  });
}

function handlePuzzleSubmission(selectedIdx, pObj) {
  if (puzzleSession.answeredCurrent) return;
  puzzleSession.answeredCurrent = true;

  const isCorrect = (selectedIdx === pObj.correct);
  const fb = document.getElementById('puzzle-instant-feedback');
  fb.classList.remove('hidden');

  if (isCorrect) {
    puzzleSession.solvedCount++;
    document.getElementById('puzzle-solved-counter').textContent = puzzleSession.solvedCount;
    fb.className = "p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs";
    fb.innerHTML = `<strong>🎯 Verified:</strong> ${pObj.explanation}`;
    if (currentStudent) {
      currentStudent.xp += 100;
      renderDashboard();
    }
  } else {
    fb.className = "p-3.5 rounded-xl bg-rose-100 dark:bg-rose-950/40 border border-rose-300 text-rose-800 dark:text-rose-300 text-xs";
    fb.innerHTML = `<strong>✕ Hazard Detected:</strong> ${pObj.explanation}`;
  }

  puzzleSession.idx++;
  document.getElementById('btn-next-puzzle').classList.remove('hidden');
}

// ==========================================
// RADAR CHART & GITHUB INSPECTOR
// ==========================================

function renderRadar() {
  const canvas = document.getElementById('competency-radar-canvas');
  if (!canvas || !currentStudent) return;

  const isDark = document.documentElement.classList.contains('dark');
  const parent = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;

  const width = parent.clientWidth || 420;
  const height = parent.clientHeight || 320;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) * 0.68;
  const labels = currentStudent.radar.categories;
  const cand = currentStudent.radar.candidate;
  const bench = currentStudent.radar.benchmark;
  const n = labels.length;

  for (let l = 1; l <= 4; l++) {
    const r = (radius / 4) * l;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 / n) * i - Math.PI / 2;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
    ctx.stroke();
  }

  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 / n) * i - Math.PI / 2;
    const x = cx + radius * Math.cos(a);
    const y = cy + radius * Math.sin(a);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
    ctx.stroke();

    ctx.fillStyle = isDark ? "#94A3B8" : "#475569";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(labels[i], cx + (radius + 24) * Math.cos(a), cy + (radius + 14) * Math.sin(a));
  }

  // Benchmark
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 / n) * i - Math.PI / 2;
    const d = (bench[i] / 100) * radius;
    const x = cx + d * Math.cos(a);
    const y = cy + d * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = isDark ? "rgba(148, 163, 184, 0.5)" : "rgba(100, 116, 139, 0.6)";
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.setLineDash([]);

  // Candidate
  const strokeColor = isDark ? "#C084FC" : "#EA580C";
  const fillColor = isDark ? "rgba(192, 132, 252, 0.22)" : "rgba(234, 88, 12, 0.18)";

  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 / n) * i - Math.PI / 2;
    const d = (cand[i] / 100) * radius;
    const x = cx + d * Math.cos(a);
    const y = cy + d * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.fillStyle = fillColor;
  ctx.fill();

  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 / n) * i - Math.PI / 2;
    const d = (cand[i] / 100) * radius;
    ctx.beginPath();
    ctx.arc(cx + d * Math.cos(a), cy + d * Math.sin(a), 3, 0, Math.PI * 2);
    ctx.fillStyle = strokeColor;
    ctx.fill();
  }
}

async function fetchGitHubRepos() {
  const username = (document.getElementById('in-github-scan')?.value || currentStudent?.github || '').trim();
  const container = document.getElementById('github-repos-container');
  if (!username) return;

  container.innerHTML = `<div class="p-4 text-center text-purple-400 font-mono">Querying api.github.com/users/${username}/repos...</div>`;

  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
    if (!res.ok) throw new Error("GitHub user not found or rate limit reached");
    const repos = await res.json();

    container.innerHTML = '';
    repos.forEach(repo => {
      const card = document.createElement('div');
      card.className = "p-3 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-2 hover:border-purple-400 transition";
      card.innerHTML = `
        <div class="truncate">
          <a href="${repo.html_url}" target="_blank" class="font-bold text-slate-900 dark:text-white hover:text-purple-400 flex items-center gap-1.5">
            <span>📦</span> <span>${repo.name}</span>
          </a>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">${repo.description || 'No description'}</p>
          <div class="flex items-center gap-3 mt-1 text-[9px] font-mono text-slate-400">
            <span class="text-purple-500 font-bold">${repo.language || 'Code'}</span>
            <span>⭐ ${repo.stargazers_count}</span>
            <span>🍴 ${repo.forks_count}</span>
          </div>
        </div>
        <a href="${repo.html_url}" target="_blank" class="shrink-0 px-2 py-1 rounded-lg bg-slate-200 dark:bg-white/5 text-[10px] font-mono">View ↗</a>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = `<div class="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold">${err.message}</div>`;
  }
}

// Background Pointer Spotlight Canvas
function initPointerGlow() {
  const canvas = document.getElementById('glow-spotlight-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let currentPos = { x: mouse.x, y: mouse.y };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function renderGlow() {
    currentPos.x += (mouse.x - currentPos.x) * 0.12;
    currentPos.y += (mouse.y - currentPos.y) * 0.12;

    ctx.clearRect(0, 0, width, height);
    const isDark = document.documentElement.classList.contains('dark');
    const step = 44;

    ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.03)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    const radius = 380;
    const gradient = ctx.createRadialGradient(currentPos.x, currentPos.y, 0, currentPos.x, currentPos.y, radius);

    if (isDark) {
      gradient.addColorStop(0, 'rgba(192, 132, 252, 0.14)');
      gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.04)');
      gradient.addColorStop(1, 'transparent');
    } else {
      gradient.addColorStop(0, 'rgba(234, 88, 12, 0.12)');
      gradient.addColorStop(0.5, 'rgba(234, 88, 12, 0.03)');
      gradient.addColorStop(1, 'transparent');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    requestAnimationFrame(renderGlow);
  }

  renderGlow();
}

function openCapstone(title, desc) {
  document.getElementById('capstone-title').textContent = title;
  document.getElementById('capstone-desc').textContent = desc;
  openModal('modal-capstone');
}

function toggleTutorChat() {
  document.getElementById('drawer-ai-tutor')?.classList.toggle('translate-x-full');
}

async function handleTutorSend(e) {
  e.preventDefault();
  const inEl = document.getElementById('tutor-input');
  const box = document.getElementById('tutor-chat-messages');
  const msg = inEl.value.trim();
  if (!msg) return;

  const uBubble = document.createElement('div');
  uBubble.className = "p-2.5 rounded-xl bg-purple-950/50 text-purple-200 ml-6 text-right font-medium";
  uBubble.textContent = msg;
  box.appendChild(uBubble);
  inEl.value = '';

  const typing = document.createElement('div');
  typing.className = "p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] text-slate-400";
  typing.textContent = "AI Tutor is evaluating curriculum concepts...";
  box.appendChild(typing);
  box.scrollTop = box.scrollHeight;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, context: currentStudent })
    });
    const data = await res.json();
    typing.remove();
    const bot = document.createElement('div');
    bot.className = "p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5";
    bot.innerHTML = (data.reply || 'Concept verified.').replace(/\n/g, '<br/>');
    box.appendChild(bot);
  } catch {
    typing.remove();
    const bot = document.createElement('div');
    bot.className = "p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] text-slate-800 dark:text-slate-200";
    bot.innerHTML = `<strong>Tutor Note:</strong> For <em>${msg}</em>, check your public repositories for containerization & concurrency patterns.`;
    box.appendChild(bot);
  }
  box.scrollTop = box.scrollHeight;
}
