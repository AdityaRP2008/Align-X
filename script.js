/**
 * Align-X Client Engine (#60D673 Mint Edition)
 * Team CODE-X | JOYXOR 2K26
 */

let activeStudent = {
  name: "Aditya Pandey",
  email: "aditya@joyuniversity.edu.in",
  roleTitle: "Full-Stack Software Engineer",
  degree: "B.Tech Computer Science",
  semester: "Semester 6",
  horizon: "3-Month Internship Season",
  github: "aditya-dev-26",
  skills: "React, Node.js, Python, PostgreSQL, REST APIs",
  readiness: 68,
  matchedSkills: ["React 19", "TypeScript", "FastAPI", "PostgreSQL", "Tailwind CSS", "RESTful Architecture"],
  missingSkills: [
    { name: "Distributed Caching (Redis)", tag: "High Priority", capstoneTitle: "Redis Rate Limiter", capstoneDesc: "Deploy a distributed rate limiter in Redis using Lua scripts to prevent race conditions across pods." },
    { name: "Docker & Containerization", tag: "Critical Void", capstoneTitle: "Multi-stage Dockerized App", capstoneDesc: "Package a frontend and backend with multi-stage builds and internal bridge networks." },
    { name: "WebSockets Realtime", tag: "Production Gap", capstoneTitle: "Collaborative Code Canvas", capstoneDesc: "Real-time state synchronization via WebSocket channels and Redis Pub/Sub." },
    { name: "Integration Testing", tag: "Quality Bar", capstoneTitle: "Automated Pytest & k6 Suite", capstoneDesc: "End-to-end integration tests configured within a GitHub Actions CI pipeline." }
  ],
  radar: {
    categories: ["Frontend", "Backend APIs", "System Design", "Databases", "DevOps", "Testing"],
    candidate: [85, 78, 42, 70, 35, 60],
    benchmark: [90, 85, 80, 85, 75, 75]
  },
  phases: [
    {
      phaseTitle: "Phase 1: Bridge Core Voids (Weeks 1 – 4)",
      milestones: [
        { id: "m1", title: "Containerize full-stack app with multi-stage Docker Compose", hours: "8 hrs", completed: false, resource: "Docker Multi-stage Builds" },
        { id: "m2", title: "Configure Redis caching layer with TTL invalidation patterns", hours: "6 hrs", completed: false, resource: "Redis University Caching" }
      ]
    },
    {
      phaseTitle: "Phase 2: Production Capstone Sprint (Weeks 5 – 8)",
      milestones: [
        { id: "m3", title: "Build collaborative code editor with Redis Pub/Sub & WebSockets", hours: "16 hrs", completed: false, resource: "Real-Time Engine Spec" },
        { id: "m4", title: "Implement automated GitHub Actions CI testing pipeline", hours: "5 hrs", completed: false, resource: "Actions CI Best Practices" }
      ]
    }
  ]
};

window.addEventListener('DOMContentLoaded', () => {
  initSpotlight();
  renderDashboard();
  renderRadar();
  window.addEventListener('resize', renderRadar);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#dropdown-track-wrapper')) closeMenu('menu-tracks');
    if (!e.target.closest('#dropdown-horizon-wrapper')) closeMenu('menu-horizon');
    if (!e.target.closest('#profile-dropdown-wrapper')) closeMenu('menu-profile');
  });
});

function toggleSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  sidebar.classList.toggle('hidden');
}

function toggleMenu(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('hidden');
}
function closeMenu(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function selectTrack(roleName) {
  activeStudent.roleTitle = roleName;
  document.getElementById('nav-current-role').textContent = roleName.replace(' Software Engineer', '');
  closeMenu('menu-tracks');
  triggerAIRoadmapGeneration();
}

function selectHorizon(val, label) {
  activeStudent.horizon = val;
  document.getElementById('nav-horizon-label').textContent = label;
  closeMenu('menu-horizon');
  triggerAIRoadmapGeneration();
}

function switchView(viewKey) {
  document.querySelectorAll('.side-link').forEach(b => {
    b.classList.remove('active-nav-link');
    b.classList.add('text-slate-400');
    const svg = b.querySelector('svg');
    if (svg) svg.classList.replace('text-mint-400', 'text-slate-400');
  });
  document.querySelectorAll('.view-panel').forEach(p => p.classList.add('hidden'));

  const activeLink = document.getElementById(`side-${viewKey}`);
  if (activeLink) {
    activeLink.classList.add('active-nav-link');
    activeLink.classList.remove('text-slate-400');
    const svg = activeLink.querySelector('svg');
    if (svg) svg.classList.replace('text-slate-400', 'text-mint-400');
  }

  const panel = document.getElementById(`view-${viewKey}`);
  if (panel) panel.classList.remove('hidden');

  if (viewKey === 'overview') setTimeout(renderRadar, 50);
}

function renderDashboard() {
  document.getElementById('nav-user-name').textContent = activeStudent.name;
  document.getElementById('nav-user-term').textContent = `${activeStudent.semester} • ${activeStudent.degree}`;
  document.getElementById('nav-avatar-initials').textContent = activeStudent.name.split(' ').map(n=>n[0]).join('').substring(0,2);
  
  document.getElementById('menu-profile-fullname').textContent = activeStudent.name;
  document.getElementById('menu-profile-github').textContent = `@${activeStudent.github.replace('@', '')}`;
  document.getElementById('menu-profile-role').textContent = activeStudent.roleTitle;

  document.getElementById('dash-student-name').textContent = activeStudent.name;
  document.getElementById('dash-student-role').textContent = activeStudent.roleTitle;
  document.getElementById('dash-github-handle').textContent = `@${activeStudent.github.replace('@', '')}`;

  updateReadinessUI(activeStudent.readiness);

  document.getElementById('dash-matched-count').textContent = activeStudent.matchedSkills.length;
  document.getElementById('dash-missing-count').textContent = activeStudent.missingSkills.length;

  const missingBox = document.getElementById('chips-missing-critical');
  const matchedBox = document.getElementById('chips-matched-skills');
  missingBox.innerHTML = '';
  matchedBox.innerHTML = '';

  activeStudent.missingSkills.forEach(skill => {
    const btn = document.createElement('button');
    btn.onclick = () => openCapstone(skill.capstoneTitle || skill.name, skill.capstoneDesc);
    btn.className = "px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 text-xs font-medium transition flex items-center gap-1.5";
    btn.innerHTML = `<span>${skill.name}</span><span class="text-[9px] font-mono bg-rose-900/60 px-1 py-0.2 rounded text-rose-200">Blueprint</span>`;
    missingBox.appendChild(btn);
  });

  activeStudent.matchedSkills.forEach(skill => {
    const span = document.createElement('span');
    span.className = "px-2.5 py-1 rounded-lg bg-mint-950/40 border border-mint-400/30 text-mint-300 text-xs font-medium flex items-center gap-1";
    span.innerHTML = `<span class="text-mint-400">✓</span> <span>${skill}</span>`;
    matchedBox.appendChild(span);
  });

  renderRoadmap();
}

function updateReadinessUI(score) {
  document.getElementById('dash-readiness-pct').textContent = `${score}%`;
  document.getElementById('dash-mini-score').textContent = `${score}%`;
  document.getElementById('side-readiness-val').textContent = `${score}%`;
  document.getElementById('side-progress-bar').style.width = `${score}%`;
  
  const deficit = 100 - score;
  document.getElementById('dash-deficit-note').textContent = `${deficit}% Deficit to Zero`;
  document.getElementById('side-deficit-val').textContent = `${deficit}% to Zero`;

  const circle = document.getElementById('dash-readiness-circle');
  if (circle) {
    const circumference = 2 * Math.PI * 26;
    circle.style.strokeDashoffset = circumference - (score / 100) * circumference;
  }
}

function renderRoadmap() {
  const container = document.getElementById('roadmap-phases-container');
  container.innerHTML = '';

  activeStudent.phases.forEach((phase, pIdx) => {
    const box = document.createElement('div');
    box.className = "p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-3";

    const header = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 rounded-md bg-mint-950 text-mint-400 border border-mint-400/40 flex items-center justify-center font-mono font-bold text-xs">${pIdx + 1}</span>
          <h4 class="text-xs font-bold text-slate-100">${phase.phaseTitle}</h4>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded ${pIdx === 0 ? 'bg-mint-950/70 border border-mint-400/30 text-mint-300' : 'bg-white/5 text-slate-400'}">
          ${pIdx === 0 ? 'Active Focus' : 'Subsequent Milestone'}
        </span>
      </div>
    `;

    let milestonesHtml = `<div class="space-y-2 pt-1">`;
    phase.milestones.forEach(m => {
      milestonesHtml += `
        <div class="p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] transition flex items-start justify-between gap-3 text-xs">
          <div class="flex items-start gap-3">
            <input type="checkbox" id="${m.id}" ${m.completed ? 'checked' : ''} onchange="toggleMilestone('${m.id}')"
                   class="mt-0.5 w-4 h-4 rounded border-slate-700 text-mint-400 focus:ring-0 bg-black cursor-pointer">
            <div>
              <label for="${m.id}" class="font-medium ${m.completed ? 'line-through text-slate-500' : 'text-slate-200'} cursor-pointer">
                ${m.title}
              </label>
              <div class="text-[11px] text-slate-400 mt-0.5">${m.hours} • <span class="text-mint-400">${m.resource}</span></div>
            </div>
          </div>
          <button onclick="openCapstone('${m.title}')" class="shrink-0 text-[11px] font-mono px-2 py-0.5 rounded bg-mint-950/60 hover:bg-mint-900/60 border border-mint-400/30 text-mint-300">Spec</button>
        </div>
      `;
    });
    milestonesHtml += `</div>`;
    box.innerHTML = header + milestonesHtml;
    container.appendChild(box);
  });
}

function toggleMilestone(id) {
  activeStudent.phases.forEach(p => {
    p.milestones.forEach(m => {
      if (m.id === id) m.completed = !m.completed;
    });
  });

  let total = 0, completed = 0;
  activeStudent.phases.forEach(p => {
    p.milestones.forEach(m => {
      total++;
      if (m.completed) completed++;
    });
  });

  const base = 60;
  activeStudent.readiness = Math.min(100, base + Math.floor(((100 - base) / total) * completed));
  updateReadinessUI(activeStudent.readiness);
  renderRoadmap();
}

function renderRadar() {
  const canvas = document.getElementById('competency-radar-canvas');
  if (!canvas || canvas.offsetParent === null) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = Math.min(360, canvas.parentElement.clientWidth || 360);
  const height = 300;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(95, width * 0.28);
  const labels = activeStudent.radar.categories;
  const cand = activeStudent.radar.candidate;
  const bench = activeStudent.radar.benchmark;
  const n = labels.length;

  // Outer Grid Rings
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
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.stroke();
  }

  // Spokes & Labels
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 / n) * i - Math.PI / 2;
    const x = cx + radius * Math.cos(a);
    const y = cy + radius * Math.sin(a);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.stroke();

    ctx.fillStyle = "#94A3B8";
    ctx.font = "10px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(labels[i], cx + (radius + 20) * Math.cos(a), cy + (radius + 14) * Math.sin(a));
  }

  // Benchmark (Dashed Gray)
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
  ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.setLineDash([]);

  // Candidate Polygon (#60D673 Mint Accent)
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 / n) * i - Math.PI / 2;
    const d = (cand[i] / 100) * radius;
    const x = cx + d * Math.cos(a);
    const y = cy + d * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = "#60D673";
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.fillStyle = "rgba(96, 214, 115, 0.18)";
  ctx.fill();

  // Highlight Data Points
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 / n) * i - Math.PI / 2;
    const d = (cand[i] / 100) * radius;
    ctx.beginPath();
    ctx.arc(cx + d * Math.cos(a), cy + d * Math.sin(a), 3, 0, Math.PI * 2);
    ctx.fillStyle = "#60D673";
    ctx.fill();
  }
}

// Interactive Pointer Spotlight Background
function initSpotlight() {
  const canvas = document.getElementById('spotlight-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;
  let mouse = { x: -1000, y: -1000 };

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    draw();
  });

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const step = 40;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    ctx.lineWidth = 1;

    for (let x = 0; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300);
    grad.addColorStop(0, 'rgba(96, 214, 115, 0.08)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
  draw();
}

function openAuthModal(mode) {
  setAuthMode(mode);
  openModal('modal-auth');
}
function setAuthMode(mode) {
  const isLogin = mode === 'login';
  document.getElementById('auth-modal-title').textContent = isLogin ? 'Student Login' : 'Enroll Student Account';
  document.getElementById('btn-mode-login').className = isLogin 
    ? 'w-1/2 py-1.5 rounded-lg font-semibold transition text-slate-950 bg-mint-400' 
    : 'w-1/2 py-1.5 rounded-lg font-semibold transition text-slate-400';
  document.getElementById('btn-mode-signup').className = !isLogin 
    ? 'w-1/2 py-1.5 rounded-lg font-semibold transition text-slate-950 bg-mint-400' 
    : 'w-1/2 py-1.5 rounded-lg font-semibold transition text-slate-400';
}
function handleAuthSubmit(e) {
  e.preventDefault();
  activeStudent.email = document.getElementById('auth-email').value;
  closeModal('modal-auth');
  openOnboardingModal();
}

function openOnboardingModal() {
  document.getElementById('in-name').value = activeStudent.name;
  document.getElementById('in-role').value = activeStudent.roleTitle;
  document.getElementById('in-degree').value = activeStudent.degree;
  document.getElementById('in-semester').value = activeStudent.semester;
  document.getElementById('in-github').value = activeStudent.github;
  document.getElementById('in-horizon').value = activeStudent.horizon;
  document.getElementById('in-skills').value = activeStudent.skills;
  openModal('modal-onboarding');
}
function handleOnboardingSubmit(e) {
  e.preventDefault();
  activeStudent.name = document.getElementById('in-name').value;
  activeStudent.roleTitle = document.getElementById('in-role').value;
  activeStudent.degree = document.getElementById('in-degree').value;
  activeStudent.semester = document.getElementById('in-semester').value;
  activeStudent.github = document.getElementById('in-github').value.replace('@','');
  activeStudent.horizon = document.getElementById('in-horizon').value;
  activeStudent.skills = document.getElementById('in-skills').value;

  closeModal('modal-onboarding');
  renderDashboard();
  triggerAIRoadmapGeneration();
}

async function triggerAIRoadmapGeneration() {
  const btn = document.getElementById('btn-generate-roadmap');
  if (btn) btn.textContent = 'Calling AI Gateway...';

  try {
    const res = await fetch('/api/roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: activeStudent.name,
        targetRole: activeStudent.roleTitle,
        degree: activeStudent.degree,
        semester: activeStudent.semester,
        horizon: activeStudent.horizon,
        skills: activeStudent.skills,
        github: activeStudent.github
      })
    });

    if (!res.ok) throw new Error('API request failed');

    const data = await res.json();
    activeStudent.readiness = data.readiness;
    activeStudent.matchedSkills = data.matchedSkills;
    activeStudent.missingSkills = data.missingSkills;
    activeStudent.radar = data.radar;
    activeStudent.phases = data.phases;

    renderDashboard();
    renderRadar();
  } catch (err) {
    console.warn('API error, using default state:', err);
  } finally {
    if (btn) btn.textContent = 'Generate AI Career Roadmap →';
  }
}

function simulateCodeAudit() {
  const btn = document.getElementById('btn-gh-audit');
  btn.textContent = 'Auditing...';
  setTimeout(() => {
    btn.textContent = 'Verified ✓';
    setTimeout(() => btn.textContent = 'Verify Code', 2000);
  }, 900);
}

function openCapstone(title, desc) {
  document.getElementById('capstone-title').textContent = title;
  if (desc) document.getElementById('capstone-desc').textContent = desc;
  openModal('modal-capstone');
}

function handleQuizAnswer(idx) {
  const fb = document.getElementById('quiz-feedback');
  fb.classList.remove('hidden');
  if (idx === 1) {
    fb.className = "mt-4 p-3.5 rounded-xl bg-mint-950/60 border border-mint-400/40 text-mint-300 text-xs";
    fb.innerHTML = "<strong>✓ Verified (Senior Competency):</strong> Redis Lua scripts run atomically within a single event loop, eliminating race conditions across auto-scaled containers.";
  } else {
    fb.className = "mt-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs";
    fb.innerHTML = "<strong>✕ Conceptual Void Detected:</strong> In-memory maps or database transaction locks degrade rapidly under distributed concurrency. Redis Lua is standard industry practice.";
  }
}

function exportCareerPlan() {
  const md = `# Align-X Career Roadmap\nTarget: ${activeStudent.roleTitle}\nCandidate: ${activeStudent.name}\nReadiness Score: ${activeStudent.readiness}%\n\n## Verified Skills:\n${activeStudent.matchedSkills.map(s => `- [x] ${s}`).join('\n')}\n\n## Gaps to Bridge:\n${activeStudent.missingSkills.map(s => `- [ ] ${s.name}`).join('\n')}`;
  const blob = new Blob([md], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Align-X_Roadmap_${activeStudent.name.replace(/\s+/g, '_')}.md`;
  a.click();
}