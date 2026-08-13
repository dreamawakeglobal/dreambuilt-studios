import { supabase } from './lib/supabase.js';

let adminSession = null;
let activeManagedProjectId = 'prj-1';

let adminState = {
  projects: [
    {
      id: 'prj-1',
      client: 'Psycortex',
      contact: 'Alba Cortez',
      clientEmail: 'alba@psycortex.com',
      clientPassword: 'demo1234',
      name: 'Psycortex Corporate Website',
      currentPhase: 'Build',
      progress: 69,
      targetLaunch: 'Sept 15, 2026',
      status: 'Active',
      actionItems: [
        { id: 'act-1', title: 'Upload High-Res Founder Headshot', description: 'Please upload transparent background headshots for team page bio.', dueDate: 'August 18, 2026', completed: false },
        { id: 'act-2', title: 'Review & Approve Homepage Staging', description: 'Check micro-animations and typography layout on mobile devices.', dueDate: 'August 22, 2026', completed: false }
      ],
      pages: [
        { id: 'p1', title: 'Home Page', image: '/images/card-01-custom-design.jpg', status: 'Approved', version: 'v2.4' },
        { id: 'p2', title: 'About Page', image: '/images/card-02-website-development.jpg', status: 'Changes Requested', version: 'v1.8' },
        { id: 'p3', title: 'Services Page', image: '/images/card-03-ecommerce.jpg', status: 'Ready for Review', version: 'v2.1' },
        { id: 'p4', title: 'Contact Page', image: '/images/card-05-landing-pages.jpg', status: 'Approved', version: 'v1.2' }
      ],
      feedback: [
        { id: 'f1', client: 'Psycortex', page: 'About Page', title: 'Replace Founder Photo with High-Res Shot', status: 'In Progress', priority: 'Normal', comment: 'Uploading new high-res asset shortly.' },
        { id: 'f2', client: 'Psycortex', page: 'Services Page', title: 'Update Headline Copy to Enterprise Focus', status: 'Ready for Review', priority: 'Important', comment: 'Updated copy in staging preview build.' }
      ],
      assets: [
        { id: 'a1', name: 'psycortex-logo-vector.svg', size: '2.4 MB', date: 'Aug 10, 2026', type: 'SVG Vector' },
        { id: 'a2', name: 'brand-color-palette-guidelines.pdf', size: '4.8 MB', date: 'Aug 12, 2026', type: 'PDF Document' }
      ],
      messages: [
        { sender: 'Dream Built', text: 'Welcome to your workspace, Alba! Your homepage build is officially live on staging preview.', time: '10:15 AM' },
        { sender: 'Alba Cortez', text: 'Looks amazing! We uploaded the brand guidelines to the Asset Vault.', time: '10:42 AM' }
      ],
      checklistPhases: [
        {
          phaseName: '1. INTAKE & DISCOVERY',
          status: 'Completed',
          items: [
            { id: 'c1', title: 'Initial client consultation and requirements gathering', owner: 'Dream Built', status: 'Completed' },
            { id: 'c2', title: 'Target audience and market research (El Salvador corporate focus)', owner: 'Dream Built', status: 'Completed' },
            { id: 'c3', title: 'Defining brand identity (Premium, Deep Blue, Gold)', owner: 'Dream Built', status: 'Completed' },
            { id: 'c4', title: 'Outlining site architecture (Home, About, Services, Packages, Contact)', owner: 'Dream Built', status: 'Completed' }
          ]
        },
        {
          phaseName: '2. DESIGN PHASE',
          status: 'Completed',
          items: [
            { id: 'c5', title: 'UI/UX layout planning', owner: 'Dream Built', status: 'Completed' },
            { id: 'c6', title: 'Selecting modern typography and visual elements', owner: 'Dream Built', status: 'Completed' },
            { id: 'c7', title: 'Designing custom UI components (metallic gold gradients, glow effects)', owner: 'Dream Built', status: 'Completed' },
            { id: 'c8', title: 'Drafting localized copy and service structures', owner: 'Dream Built', status: 'Completed' }
          ]
        },
        {
          phaseName: '3. BUILD PHASE',
          status: 'Current Phase',
          items: [
            { id: 'c9', title: 'Developing HTML structure and semantic markup', owner: 'Dream Built', status: 'Completed' },
            { id: 'c10', title: 'Implementing CSS styling and responsive mobile layouts', owner: 'Dream Built', status: 'Completed' },
            { id: 'c11', title: 'Refining package features, monthly structures, and pricing models', owner: 'Dream Built', status: 'Completed' },
            { id: 'c12', title: 'Adding social media links (LinkedIn, Instagram, TikTok)', owner: 'Dream Built', status: 'In Progress' },
            { id: 'c13', title: 'Finalizing interactive elements and form functionality', owner: 'Dream Built', status: 'In Progress' }
          ]
        },
        {
          phaseName: '4. REVIEW PHASE',
          status: 'Upcoming',
          items: [
            { id: 'c14', title: 'Cross-browser and mobile device testing', owner: 'Dream Built', status: 'Upcoming' },
            { id: 'c15', title: 'Proofreading Spanish copy and checking grammar/accents', owner: 'Client Action', status: 'Upcoming' },
            { id: 'c16', title: 'Testing all links, forms, and widgets for proper functionality', owner: 'Dream Built', status: 'Upcoming' },
            { id: 'c17', title: 'Client review and final feedback rounds', owner: 'Client Action', status: 'Upcoming' }
          ]
        },
        {
          phaseName: '5. LAUNCH PHASE',
          status: 'Upcoming',
          items: [
            { id: 'c18', title: 'Final performance optimization and cache busting', owner: 'Dream Built', status: 'Upcoming' },
            { id: 'c19', title: 'Configuring domain and hosting deployment', owner: 'Dream Built', status: 'Upcoming' },
            { id: 'c20', title: 'SEO metadata implementation (titles, descriptions)', owner: 'Dream Built', status: 'Upcoming' },
            { id: 'c21', title: 'Post-launch monitoring and client hand-off', owner: 'Dream Built', status: 'Upcoming' }
          ]
        }
      ]
    },
    {
      id: 'prj-2',
      client: 'Dream Wealthy',
      contact: 'Marcus Vance',
      name: 'Dream Wealthy Budgeting App',
      currentPhase: 'Launch',
      progress: 95,
      targetLaunch: 'Aug 25, 2026',
      status: 'In Review',
      actionItems: [
        { id: 'act-3', title: 'Approve Launch Readiness Checklist', description: 'Review final production build and sign off on DNS cutover.', dueDate: 'August 16, 2026', completed: false }
      ],
      pages: [
        { id: 'p5', title: 'Dashboard View', image: '/images/dream-wealthy.jpg', status: 'Approved', version: 'v3.0' }
      ],
      feedback: [],
      assets: [],
      messages: [],
      checklistPhases: [
        {
          phaseName: '1. INTAKE & DISCOVERY',
          status: 'Completed',
          items: [{ id: 'c17', title: 'App Specs & Plaid Integration Setup', owner: 'Dream Built', status: 'Completed' }]
        }
      ]
    }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
  initAdminTabs();
  initAdminForms();
});

// MODALS & TOAST NOTIFICATIONS
window.openModal = function(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.add('active');
};

window.closeModal = function(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove('active');
};

window.showAdminToast = function(msg) {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 10000;
      background: rgba(2, 8, 19, 0.95);
      border: 1.5px solid var(--color-cyan-glow);
      box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 25px rgba(0, 240, 255, 0.4);
      color: #ffffff;
      padding: 0.9rem 1.4rem;
      border-radius: var(--radius-sm);
      font-weight: 700;
      font-size: 0.9rem;
      transition: opacity 0.3s ease, transform 0.3s ease;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 4000);
};

function initAdminAuth() {
  const loginForm = document.getElementById('admin-login-form');
  const btnLogout = document.getElementById('btn-admin-logout');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      adminSession = { email: 'admin@dreambuiltstudios.com', role: 'admin' };
      document.getElementById('admin-auth-container').style.display = 'none';
      document.getElementById('admin-workspace-container').style.display = 'block';

      const appHeader = document.querySelector('app-header');
      if (appHeader) appHeader.style.display = 'none';

      renderAdminDashboard();
      window.showAdminToast('✓ Logged into Dream Built Admin Command Center');
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      adminSession = null;
      document.getElementById('admin-workspace-container').style.display = 'none';
      document.getElementById('admin-auth-container').style.display = 'block';

      const appHeader = document.querySelector('app-header');
      if (appHeader) appHeader.style.display = 'block';
    });
  }
}

function renderAdminDashboard() {
  renderProjectsTable();
  renderAdminFeedbackSummary();
}

function renderProjectsTable() {
  const tbody = document.getElementById('admin-projects-table-body');
  if (!tbody) return;

  tbody.innerHTML = adminState.projects.map(p => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: #ffffff;">
      <td style="padding: 1rem;">
        <strong style="font-size: 1rem; color: #ffffff;">${p.name}</strong>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">${p.client} • ${p.contact}</div>
      </td>
      <td style="padding: 1rem;">
        <select class="portal-select" style="padding: 0.35rem 0.6rem; font-size: 0.8rem; width: auto;" onchange="updateProjectPhase('${p.id}', this.value)">
          <option value="Dream" ${p.currentPhase === 'Dream' ? 'selected' : ''}>Dream</option>
          <option value="Design" ${p.currentPhase === 'Design' ? 'selected' : ''}>Design</option>
          <option value="Build" ${p.currentPhase === 'Build' ? 'selected' : ''}>Build</option>
          <option value="Review" ${p.currentPhase === 'Review' ? 'selected' : ''}>Review</option>
          <option value="Launch" ${p.currentPhase === 'Launch' ? 'selected' : ''}>Launch</option>
        </select>
      </td>
      <td style="padding: 1rem;">
        <span style="font-weight: 800; color: var(--color-cyan-glow);">${p.progress}%</span>
      </td>
      <td style="padding: 1rem;">
        <input type="text" class="portal-input" style="padding: 0.35rem 0.6rem; font-size: 0.85rem; width: 130px; border-color: rgba(255,255,255,0.15);" value="${p.targetLaunch}" onchange="updateProjectTargetLaunch('${p.id}', this.value)" title="Click to change target launch date" />
      </td>
      <td style="padding: 1rem;">
        <span class="status-badge ${p.status.toLowerCase().replace(/ /g, '-')}">${p.status}</span>
      </td>
      <td style="padding: 1rem;">
        <button class="attention-cta-btn" style="padding: 0.45rem 1rem; font-size: 0.85rem;" onclick="openProjectManageView('${p.id}')">
          MANAGE &rarr;
        </button>
      </td>
    </tr>
  `).join('');
}

function renderAdminFeedbackSummary() {
  const container = document.getElementById('admin-feedback-list');
  if (!container) return;

  const currentProject = adminState.projects.find(x => x.id === activeManagedProjectId) || adminState.projects[0];
  container.innerHTML = currentProject.feedback.map(f => `
    <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-sm); padding: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
        <div>
          <strong style="color: #ffffff; font-size: 0.95rem;">${f.title}</strong>
          <div style="font-size: 0.8rem; color: var(--color-cyan-glow);">${f.client} • ${f.page}</div>
        </div>
        <span class="status-badge ${f.status.toLowerCase().replace(/ /g, '-')}">${f.status}</span>
      </div>

      <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
        <select class="portal-select" style="padding: 0.3rem 0.5rem; font-size: 0.75rem;" onchange="updateFeedbackStatus('${f.id}', this.value)">
          <option value="Submitted" ${f.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
          <option value="In Progress" ${f.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Ready for Review" ${f.status === 'Ready for Review' ? 'selected' : ''}>Ready for Review</option>
          <option value="Completed" ${f.status === 'Completed' ? 'selected' : ''}>Completed</option>
        </select>
        <button class="portal-badge" style="cursor: pointer; background: rgba(0,240,255,0.15);" onclick="window.showAdminToast('Opening reply thread for ${f.title}')">REPLY</button>
      </div>
    </div>
  `).join('');
}

// SWITCH TO PROJECT MANAGEMENT VIEW
window.openProjectManageView = function(projectId) {
  activeManagedProjectId = projectId;
  const project = adminState.projects.find(p => p.id === projectId);
  if (!project) return;

  document.getElementById('admin-main-dashboard').style.display = 'none';
  document.getElementById('admin-project-manage-view').style.display = 'block';

  document.getElementById('adm-manage-title').textContent = project.name;
  document.getElementById('adm-manage-client-sub').textContent = `Client: ${project.contact} (${project.client})`;
  document.getElementById('adm-manage-phase-select').value = project.currentPhase;

  renderManagedWorkspace();
  window.showAdminToast(`✓ Opened operational management for ${project.name}`);
};

// RETURN TO MAIN ADMIN DASHBOARD
function initAdminTabs() {
  const btnBack = document.getElementById('btn-back-to-dashboard');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      document.getElementById('admin-project-manage-view').style.display = 'none';
      document.getElementById('admin-main-dashboard').style.display = 'block';
      renderProjectsTable();
    });
  }

  const tabBtns = document.querySelectorAll('.portal-tabs-nav button[data-adm-tab]');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-adm-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.adm-tab-pane').forEach(pane => pane.style.display = 'none');
      const activePane = document.getElementById(`adm-tab-${targetTab}`);
      if (activePane) activePane.style.display = 'block';

      renderManagedWorkspace();
    });
  });

  const phaseSelect = document.getElementById('adm-manage-phase-select');
  if (phaseSelect) {
    phaseSelect.addEventListener('change', (e) => {
      const p = adminState.projects.find(x => x.id === activeManagedProjectId);
      if (p) {
        p.currentPhase = e.target.value;
        window.showAdminToast(`✓ Updated ${p.name} phase to ${p.currentPhase}`);
      }
    });
  }
}

// RENDER ALL MANAGED WORKSPACE PANES
function renderManagedWorkspace() {
  const project = adminState.projects.find(p => p.id === activeManagedProjectId);
  if (!project) return;

  // Calculate dynamic progress %
  let totalTasks = 0;
  let completedTasks = 0;
  if (project.checklistPhases) {
    project.checklistPhases.forEach(ph => {
      ph.items.forEach(i => {
        totalTasks++;
        if (i.status === 'Completed') completedTasks++;
      });
    });
  }
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : project.progress;
  project.progress = pct;

  // Update Overview Health
  const valEl = document.getElementById('adm-manage-progress-val');
  const fillEl = document.getElementById('adm-manage-progress-fill');
  if (valEl) valEl.textContent = `${pct}%`;
  if (fillEl) fillEl.style.width = `${pct}%`;

  const targetLaunchInput = document.getElementById('adm-manage-target-launch');
  if (targetLaunchInput) targetLaunchInput.value = project.targetLaunch;

  const emailEl = document.getElementById('adm-manage-client-email');
  const passEl = document.getElementById('adm-manage-client-pass');
  if (emailEl) emailEl.textContent = project.clientEmail || 'alba@psycortex.com';
  if (passEl) passEl.textContent = project.clientPassword || 'demo1234';

  // Render Action Items
  renderAdminActionItems(project);

  // Render Pages Screenshots
  renderAdminPages(project);

  // Render Feedback Board
  renderAdminFeedbackBoard(project);

  // Render Assets Vault
  renderAdminAssets(project);

  // Render Messages
  renderAdminMessages(project);

  // Render Checklist
  renderAdminChecklist(project, totalTasks, completedTasks, pct);
}

function renderAdminActionItems(project) {
  const grid = document.getElementById('adm-manage-action-grid');
  if (!grid) return;

  if (!project.actionItems || project.actionItems.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-secondary);">No active client action items assigned.</div>`;
    return;
  }

  grid.innerHTML = project.actionItems.map(item => `
    <div class="attention-card">
      <div class="attention-card-header">
        <div>
          <div class="attention-card-title">${item.title}</div>
          <div class="attention-card-desc">${item.description}</div>
        </div>
        <span class="status-badge ${item.completed ? 'active' : 'changes-requested'}">${item.completed ? 'Completed' : `Due ${item.dueDate}`}</span>
      </div>
      <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
        <button class="portal-badge" style="cursor: pointer; background: rgba(0, 240, 255, 0.15);" onclick="toggleActionComplete('${item.id}')">
          ${item.completed ? 'REOPEN ITEM' : 'MARK COMPLETED'}
        </button>
      </div>
    </div>
  `).join('');
}

function renderAdminPages(project) {
  const container = document.getElementById('adm-manage-pages-grid');
  if (!container) return;

  container.innerHTML = project.pages.map(page => `
    <div class="portal-glass page-card">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <h3 style="margin: 0; font-size: 1.15rem; color: #ffffff;">${page.title}</h3>
          <span class="status-badge ${page.status.toLowerCase().replace(/ /g, '-')}">${page.status}</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">Version ${page.version}</div>
        
        <div class="page-preview-wrapper" style="margin-bottom: 1rem;">
          <img src="${page.image}" alt="${page.title}" class="page-preview-img" style="width: 100%; border-radius: var(--radius-sm);" />
        </div>
      </div>

      <button class="attention-cta-btn" style="width: 100%; justify-content: center; font-size: 0.85rem;" onclick="openModal('modal-upload-screenshot')">
        + UPLOAD / REPLACE SCREENSHOT &rarr;
      </button>
    </div>
  `).join('');
}

function renderAdminFeedbackBoard(project) {
  const container = document.getElementById('adm-manage-feedback-list');
  if (!container) return;

  if (project.feedback.length === 0) {
    container.innerHTML = `<div style="color: var(--text-secondary);">No feedback items submitted yet.</div>`;
    return;
  }

  container.innerHTML = project.feedback.map(f => `
    <div class="portal-glass" style="padding: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
        <div>
          <h4 style="margin: 0 0 0.25rem 0; color: #ffffff;">${f.title}</h4>
          <span style="font-size: 0.8rem; color: var(--color-cyan-glow);">${f.page}</span>
        </div>
        <span class="status-badge ${f.status.toLowerCase().replace(/ /g, '-')}">${f.status}</span>
      </div>
      <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: var(--text-secondary);">${f.comment}</p>
      
      <div style="display: flex; gap: 0.5rem;">
        <select class="portal-select" style="padding: 0.35rem 0.5rem; font-size: 0.8rem;" onchange="updateFeedbackStatus('${f.id}', this.value)">
          <option value="Submitted" ${f.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
          <option value="In Progress" ${f.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Ready for Review" ${f.status === 'Ready for Review' ? 'selected' : ''}>Ready for Review</option>
          <option value="Completed" ${f.status === 'Completed' ? 'selected' : ''}>Completed</option>
        </select>
        <button class="portal-badge" style="cursor: pointer; background: rgba(0,240,255,0.15);" onclick="window.showAdminToast('Reply sent for ${f.title}')">REPLY CHAT</button>
      </div>
    </div>
  `).join('');
}

function renderAdminAssets(project) {
  const grid = document.getElementById('adm-manage-assets-grid');
  if (!grid) return;

  grid.innerHTML = project.assets.map(asset => `
    <div class="portal-glass file-card" style="padding: 1rem; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="width: 38px; height: 38px; border-radius: var(--radius-sm); background: rgba(0,102,255,0.2); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--color-cyan-glow);">📄</div>
        <div>
          <div style="font-weight: 700; color: #ffffff; font-size: 0.9rem;">${asset.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">${asset.size} • ${asset.date}</div>
        </div>
      </div>
      <button class="portal-badge" style="cursor: pointer; background: rgba(0,240,255,0.15);" onclick="window.showAdminToast('Downloading ${asset.name}')">DOWNLOAD</button>
    </div>
  `).join('');
}

function renderAdminMessages(project) {
  const chatContainer = document.getElementById('adm-manage-chat-messages');
  if (!chatContainer) return;

  chatContainer.innerHTML = project.messages.map(msg => {
    const isAdmin = msg.sender === 'Dream Built';
    return `
      <div style="align-self: ${isAdmin ? 'flex-end' : 'flex-start'}; max-width: 75%; background: ${isAdmin ? 'rgba(0, 102, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)'}; border: 1px solid ${isAdmin ? 'var(--color-royal-blue)' : 'rgba(255,255,255,0.1)'}; padding: 0.85rem 1.15rem; border-radius: var(--radius-md);">
        <div style="font-size: 0.75rem; font-weight: 700; color: ${isAdmin ? 'var(--color-cyan-glow)' : 'var(--text-secondary)'}; margin-bottom: 0.35rem;">
          ${msg.sender} • ${msg.time}
        </div>
        <div style="color: #ffffff; font-size: 0.9rem; line-height: 1.4;">${msg.text}</div>
      </div>
    `;
  }).join('');
}

function renderAdminChecklist(project, total, completed, pct) {
  const badge = document.getElementById('adm-checklist-badge');
  if (badge) badge.textContent = `${completed} of ${total} Tasks Completed (${pct}%)`;

  const container = document.getElementById('adm-manage-checklist-container');
  if (!container) return;

  container.innerHTML = project.checklistPhases.map((phase, pIdx) => `
    <div class="portal-glass" style="padding: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem;">
        <h3 style="margin: 0; font-size: 1.1rem; color: #ffffff;">${phase.phaseName}</h3>
        <span class="status-badge ${phase.status === 'Completed' ? 'active' : phase.status === 'Current Phase' ? 'in-progress' : ''}">${phase.status}</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        ${phase.items.map(item => `
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 0.75rem 1rem; border-radius: var(--radius-sm);">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <input type="checkbox" ${item.status === 'Completed' ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;" onchange="toggleChecklistItem('${item.id}')" />
              <div>
                <div style="font-weight: 700; color: ${item.status === 'Completed' ? 'var(--text-secondary)' : '#ffffff'}; text-decoration: ${item.status === 'Completed' ? 'line-through' : 'none'}; font-size: 0.95rem;">
                  ${item.title}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">Owner: ${item.owner}</div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <select class="portal-select" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; width: auto;" onchange="updateTaskStatus('${item.id}', this.value)">
                <option value="Completed" ${item.status === 'Completed' ? 'selected' : ''}>Completed</option>
                <option value="In Progress" ${item.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Action Required" ${item.status === 'Action Required' ? 'selected' : ''}>Action Required</option>
                <option value="Upcoming" ${item.status === 'Upcoming' ? 'selected' : ''}>Upcoming</option>
              </select>

              <button class="portal-badge" style="cursor: pointer; background: rgba(255, 77, 77, 0.2); border-color: rgba(255, 77, 77, 0.4); color: #ff6666; padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="deleteChecklistItem('${item.id}')" title="Delete Task">
                &times; DELETE
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// CHECKLIST CONTROLS
window.deleteChecklistItem = function(taskId) {
  const project = adminState.projects.find(p => p.id === activeManagedProjectId);
  if (!project) return;

  project.checklistPhases.forEach(ph => {
    const idx = ph.items.findIndex(i => i.id === taskId);
    if (idx !== -1) {
      const removed = ph.items.splice(idx, 1)[0];
      window.showAdminToast(`✓ Deleted checklist task '${removed.title}'`);
    }
  });

  renderManagedWorkspace();
};
window.toggleChecklistItem = function(taskId) {
  const project = adminState.projects.find(p => p.id === activeManagedProjectId);
  if (!project) return;

  project.checklistPhases.forEach(ph => {
    ph.items.forEach(item => {
      if (item.id === taskId) {
        item.status = item.status === 'Completed' ? 'In Progress' : 'Completed';
        window.showAdminToast(`✓ Updated checklist item: ${item.title}`);
      }
    });
  });

  renderManagedWorkspace();
};

window.updateTaskStatus = function(taskId, status) {
  const project = adminState.projects.find(p => p.id === activeManagedProjectId);
  if (!project) return;

  project.checklistPhases.forEach(ph => {
    ph.items.forEach(item => {
      if (item.id === taskId) {
        item.status = status;
        window.showAdminToast(`✓ Set task status to '${status}'`);
      }
    });
  });

  renderManagedWorkspace();
};

window.toggleActionComplete = function(actionId) {
  const project = adminState.projects.find(p => p.id === activeManagedProjectId);
  if (!project) return;

  const item = project.actionItems.find(a => a.id === actionId);
  if (item) {
    item.completed = !item.completed;
    window.showAdminToast(`✓ Updated action item '${item.title}'`);
    renderManagedWorkspace();
  }
};

window.updateProjectPhase = function(id, phase) {
  const p = adminState.projects.find(x => x.id === id);
  if (p) {
    p.currentPhase = phase;
    window.showAdminToast(`✓ Updated ${p.name} phase to ${phase}`);
  }
};

window.updateProjectTargetLaunch = function(id, dateVal) {
  const p = adminState.projects.find(x => x.id === id);
  if (p) {
    p.targetLaunch = dateVal;
    window.showAdminToast(`✓ Updated ${p.name} target launch date to '${dateVal}'`);
    if (activeManagedProjectId === id) {
      renderManagedWorkspace();
    }
  }
};

window.updateProjectTargetLaunchFromOverview = function(dateVal) {
  const p = adminState.projects.find(x => x.id === activeManagedProjectId);
  if (p) {
    p.targetLaunch = dateVal;
    window.showAdminToast(`✓ Updated ${p.name} target launch date to '${dateVal}'`);
    renderProjectsTable();
  }
};

window.updateFeedbackStatus = function(id, status) {
  const project = adminState.projects.find(p => p.id === activeManagedProjectId);
  if (project) {
    const f = project.feedback.find(x => x.id === id);
    if (f) {
      f.status = status;
      window.showAdminToast(`✓ Updated feedback '${f.title}' status to ${status}`);
      renderManagedWorkspace();
    }
  }
};

function initAdminForms() {
  const btnCreateClient = document.getElementById('btn-create-client');
  if (btnCreateClient) {
    btnCreateClient.addEventListener('click', () => window.openModal('modal-create-client'));
  }

  const btnCreateProject = document.getElementById('btn-create-project');
  if (btnCreateProject) {
    btnCreateProject.addEventListener('click', () => window.openModal('modal-create-project'));
  }

  const btnAddTask = document.getElementById('btn-adm-add-task');
  if (btnAddTask) {
    btnAddTask.addEventListener('click', () => window.openModal('modal-add-checklist-task'));
  }

  const formCreateClient = document.getElementById('form-create-client');
  if (formCreateClient) {
    formCreateClient.addEventListener('submit', (e) => {
      e.preventDefault();
      const business = document.getElementById('c-business').value;
      const contact = document.getElementById('c-contact').value;
      
      window.showAdminToast(`✓ Created new client profile for ${business} (${contact})`);
      window.closeModal('modal-create-client');
      formCreateClient.reset();
    });
  }

  const formCreateProject = document.getElementById('form-create-project');
  if (formCreateProject) {
    formCreateProject.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('p-name').value;
      const client = document.getElementById('p-client').value;
      const phase = document.getElementById('p-phase').value;
      const launch = document.getElementById('p-launch').value;

      const newPrj = {
        id: `prj-${Date.now()}`,
        client: client,
        contact: client === 'Psycortex' ? 'Alba Cortez' : 'Marcus Vance',
        name: name,
        currentPhase: phase,
        progress: 10,
        targetLaunch: launch,
        status: 'Active',
        actionItems: [],
        pages: [],
        feedback: [],
        assets: [],
        messages: [],
        checklistPhases: [
          {
            phaseName: '1. INTAKE & DISCOVERY',
            status: 'In Progress',
            items: [{ id: `c-${Date.now()}`, title: 'Kickoff Call & Strategy Alignment', owner: 'Dream Built', status: 'In Progress' }]
          }
        ]
      };

      adminState.projects.unshift(newPrj);
      renderAdminDashboard();

      window.showAdminToast(`✓ Successfully launched project workspace '${name}'!`);
      window.closeModal('modal-create-project');
      formCreateProject.reset();
    });
  }

  const formUploadScreenshot = document.getElementById('form-upload-screenshot');
  if (formUploadScreenshot) {
    formUploadScreenshot.addEventListener('submit', (e) => {
      e.preventDefault();
      const pageId = document.getElementById('s-page').value;
      const url = document.getElementById('s-url').value;
      const notes = document.getElementById('s-notes').value;

      const project = adminState.projects.find(p => p.id === activeManagedProjectId);
      if (project) {
        const page = project.pages.find(p => p.id === pageId);
        if (page) {
          page.image = url;
          page.version = notes ? `v2.${Date.now().toString().slice(-2)}` : page.version;
          window.showAdminToast(`✓ Updated screenshot for ${page.title}!`);
          renderManagedWorkspace();
        }
      }

      window.closeModal('modal-upload-screenshot');
      formUploadScreenshot.reset();
    });
  }

  const formAddChecklist = document.getElementById('form-add-checklist-task');
  if (formAddChecklist) {
    formAddChecklist.addEventListener('submit', (e) => {
      e.preventDefault();
      const phaseName = document.getElementById('t-phase').value;
      const title = document.getElementById('t-title').value;
      const owner = document.getElementById('t-owner').value;
      const status = document.getElementById('t-status').value;

      const project = adminState.projects.find(p => p.id === activeManagedProjectId);
      if (project) {
        let phaseObj = project.checklistPhases.find(ph => ph.phaseName === phaseName);
        if (!phaseObj) {
          phaseObj = { phaseName: phaseName, status: 'In Progress', items: [] };
          project.checklistPhases.push(phaseObj);
        }
        phaseObj.items.push({
          id: `c-${Date.now()}`,
          title: title,
          owner: owner,
          status: status
        });

        window.showAdminToast(`✓ Added checklist task '${title}' to ${phaseName}`);
        renderManagedWorkspace();
      }

      window.closeModal('modal-add-checklist-task');
      formAddChecklist.reset();
    });
  }

  const formAddAction = document.getElementById('form-add-action-item');
  if (formAddAction) {
    formAddAction.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('act-title').value;
      const desc = document.getElementById('act-desc').value;
      const due = document.getElementById('act-due').value;

      const project = adminState.projects.find(p => p.id === activeManagedProjectId);
      if (project) {
        project.actionItems.unshift({
          id: `act-${Date.now()}`,
          title: title,
          description: desc,
          dueDate: due,
          completed: false
        });
        window.showAdminToast(`✓ Assigned action item '${title}' to client`);
        renderManagedWorkspace();
      }

      window.closeModal('modal-add-action-item');
      formAddAction.reset();
    });
  }

  const formChat = document.getElementById('adm-chat-send-form');
  if (formChat) {
    formChat.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('adm-chat-input');
      const text = input.value.trim();
      if (!text) return;

      const project = adminState.projects.find(p => p.id === activeManagedProjectId);
      if (project) {
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        project.messages.push({
          sender: 'Dream Built',
          text: text,
          time: timeNow
        });

        renderAdminMessages(project);
        input.value = '';
        window.showAdminToast('✓ Message sent to client!');
      }
    });
  }

  const formEditCreds = document.getElementById('form-edit-credentials');
  if (formEditCreds) {
    formEditCreds.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('edit-cred-email').value;
      const pass = document.getElementById('edit-cred-password').value;

      const project = adminState.projects.find(p => p.id === activeManagedProjectId);
      if (project) {
        project.clientEmail = email;
        project.clientPassword = pass;
        window.showAdminToast(`✓ Updated login credentials for ${project.client}!`);
        renderManagedWorkspace();
      }

      window.closeModal('modal-edit-credentials');
    });
  }
}

// EDIT CREDENTIALS HELPERS
window.openEditCredentialsModal = function() {
  const project = adminState.projects.find(p => p.id === activeManagedProjectId);
  if (project) {
    document.getElementById('edit-cred-client').value = `${project.client} (${project.contact})`;
    document.getElementById('edit-cred-email').value = project.clientEmail || 'alba@psycortex.com';
    document.getElementById('edit-cred-password').value = project.clientPassword || 'demo1234';
  }
  window.openModal('modal-edit-credentials');
};

window.generateRandomPassword = function() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  let pass = 'Dream';
  for (let i = 0; i < 4; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  pass += '!';
  document.getElementById('edit-cred-password').value = pass;
  window.showAdminToast(`✓ Generated new password: ${pass}`);
};
