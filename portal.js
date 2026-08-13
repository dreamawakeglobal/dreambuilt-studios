import { supabase } from './lib/supabase.js';

// LOCAL DEMO STATE (Fallback & Seed Data for Client View)
let currentTab = 'overview';
let userSession = null;

let mockClientState = {
  client: {
    businessName: 'Psycortex',
    contactName: 'Alba Cortez',
    email: 'alba@psycortex.com'
  },
  project: {
    name: 'Psycortex Corporate Website',
    currentPhase: 'Build',
    progress: 65,
    targetLaunchDate: 'Sept 15, 2026',
    nextMilestone: 'Homepage Review',
    status: 'On Track',
    previewUrl: 'https://dreambuiltstudios.com'
  },
  actionItems: [
    {
      id: 'act-1',
      title: 'Upload founder headshot',
      description: 'Please upload a high-resolution studio photo of Alba for the About page.',
      actionType: 'upload_file',
      dueDate: 'Aug 15, 2026',
      ctaText: 'UPLOAD FILE',
      completed: false
    },
    {
      id: 'act-2',
      title: 'Review Homepage build',
      description: 'Inspect the live staging preview of the homepage and submit revision notes.',
      actionType: 'review_page',
      targetPage: 'Home Page',
      dueDate: 'Aug 17, 2026',
      ctaText: 'REVIEW PAGE',
      completed: false
    },
    {
      id: 'act-3',
      title: 'Approve Services Page',
      description: 'Formally approve the finalized Services page build.',
      actionType: 'approve_milestone',
      targetPage: 'Services Page',
      dueDate: 'Aug 20, 2026',
      ctaText: 'APPROVE PAGE',
      completed: false
    }
  ],
  pages: [
    { id: 'p1', name: 'Home Page', slug: '/', status: 'Ready for Review', version: '1.2', screenshotUrl: '/images/card-01-custom-design.jpg', notes: 'Responsive homepage design screenshot uploaded for client review.' },
    { id: 'p2', name: 'About Page', slug: '/about', status: 'Building', version: '1.0', screenshotUrl: '/images/card-02-website-development.jpg', notes: 'Bio & team section layout in progress.' },
    { id: 'p3', name: 'Services Page', slug: '/services', status: 'Approved', version: '1.1', screenshotUrl: '/images/card-01-custom-design.jpg', notes: 'Approved by Alba Cortez on Aug 12, 2026.' },
    { id: 'p4', name: 'Contact Page', slug: '/contact', status: 'Planned', version: '1.0', screenshotUrl: '/images/card-02-website-development.jpg', notes: 'Scheduled for build phase 2.' }
  ],
  feedbackItems: [
    { id: 'f1', title: 'Replace Founder Photo', page: 'About Page', section: 'Founder Bio Section', desc: 'Can we update the founder photo to the new high-resolution studio shot?', priority: 'Normal', status: 'In Progress' },
    { id: 'f2', title: 'Update Headline Copy', page: 'Services Page', section: 'Hero Banner', desc: 'Tweak main headline text to emphasize rapid growth solutions.', priority: 'Important', status: 'Ready for Review' }
  ],
  files: [
    { id: 'fl1', name: 'brand-logo-icon.svg', category: 'Logo', size: '24 KB', uploadDate: 'Aug 10, 2026' },
    { id: 'fl2', name: 'psycortex-brand-guide.pdf', category: 'Brand Assets', size: '2.4 MB', uploadDate: 'Aug 08, 2026' }
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
};

const STORAGE_KEY = 'dreambuilt_app_state_v1';

function ensurePsycortexChecklist(state) {
  let isOld = false;
  if (!state.checklistPhases || !Array.isArray(state.checklistPhases)) {
    isOld = true;
  } else {
    let total = 0;
    state.checklistPhases.forEach(ph => {
      if (ph.items) {
        total += ph.items.length;
        ph.items.forEach(i => {
          if (i.title && (i.title.includes('Scope Confirmation') || i.title.includes('Sitemap & Page Architecture'))) {
            isOld = true;
          }
        });
      }
    });
    if (total !== 21) isOld = true;
  }

  if (isOld) {
    state.checklistPhases = [
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
    ];
    if (state.project) state.project.progress = 52;
  }
}

function loadPortalState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
        const p = parsed.projects.find(x => x.client === 'Psycortex' || x.id === 'prj-1') || parsed.projects[0];
        if (p) {
          mockClientState.client.businessName = p.client || 'Psycortex';
          mockClientState.client.contactName = p.contact || 'Alba Cortez';
          mockClientState.client.email = p.clientEmail || 'alba@psycortex.com';
          mockClientState.client.password = p.clientPassword || 'demo1234';

          mockClientState.project.name = p.name || 'Psycortex Corporate Website';
          mockClientState.project.currentPhase = p.currentPhase || 'Build';
          mockClientState.project.targetLaunchDate = p.targetLaunch || 'Sept 15, 2026';
          mockClientState.project.status = p.status || 'Active';

          if (p.actionItems) mockClientState.actionItems = p.actionItems;
          if (p.checklistPhases) mockClientState.checklistPhases = p.checklistPhases;
          if (p.pages) {
            mockClientState.pages = p.pages.map(pg => ({
              id: pg.id,
              name: pg.title || pg.name,
              slug: `/${(pg.title || pg.name || '').toLowerCase().replace(/ /g, '-')}`,
              status: pg.status,
              version: pg.version,
              screenshotUrl: pg.image || pg.screenshotUrl || '/images/card-01-custom-design.jpg',
              notes: pg.notes || `Version ${pg.version}`
            }));
          }
          if (p.feedback) {
            mockClientState.feedbackItems = p.feedback.map(f => ({
              id: f.id,
              title: f.title,
              page: f.page,
              section: 'Revision Request',
              desc: f.comment,
              priority: f.priority,
              status: f.status
            }));
          }
          if (p.messages && Array.isArray(p.messages)) {
            mockClientState.messages = p.messages;
          }
          if (p.assets) {
            mockClientState.files = p.assets.map(a => ({
              id: a.id,
              name: a.name,
              category: a.type,
              size: a.size,
              uploadDate: a.date
            }));
          }
        }
      }
    } catch (e) {
      console.error('Failed loading portal state:', e);
    }
  }

  ensurePsycortexChecklist(mockClientState);
  window.savePortalState();

  fetchSupabaseData();
}

async function fetchSupabaseData() {
  if (!supabase) return;
  try {
    const [
      { data: projects, error },
      { data: chkData },
      { data: dbActions },
      { data: dbPages },
      { data: dbFeedback },
      { data: dbMessages },
      { data: dbAssets }
    ] = await Promise.all([
      supabase.from('projects').select('*'),
      supabase.from('project_checklist_items').select('*'),
      supabase.from('action_items').select('*'),
      supabase.from('website_pages').select('*'),
      supabase.from('feedback_items').select('*'),
      supabase.from('messages').select('*').order('created_at', { ascending: true }),
      supabase.from('project_assets').select('*')
    ]);

    if (!error && projects && projects.length > 0) {
      const p = projects.find(x => x.project_name.toLowerCase().includes('psycortex') || x.id === '22222222-2222-2222-2222-222222222222') || projects[0];
      if (p) {
        mockClientState.project.id = p.id;
        mockClientState.project.name = p.project_name;
        mockClientState.project.currentPhase = p.current_phase;
        mockClientState.project.progress = p.progress_pct;
        mockClientState.project.targetLaunchDate = p.target_launch_date;
        mockClientState.project.status = p.status;

        if (dbActions && dbActions.length > 0) {
          const prjActions = dbActions.filter(a => a.project_id === p.id);
          if (prjActions.length > 0) {
            mockClientState.actionItems = prjActions.map(a => ({
              id: a.id,
              title: a.title,
              description: a.description,
              dueDate: a.due_date,
              actionType: a.action_type || 'upload_file',
              ctaText: 'ACTION REQUIRED',
              targetPage: 'Home Page',
              completed: a.completed
            }));
          }
        }

        if (dbPages && dbPages.length > 0) {
          const prjPages = dbPages.filter(pg => pg.project_id === p.id);
          if (prjPages.length > 0) {
            mockClientState.pages = prjPages.map(pg => ({
              id: pg.id,
              name: pg.title,
              slug: `/${pg.title.toLowerCase().replace(/ /g, '-')}`,
              status: pg.status,
              version: pg.version,
              screenshotUrl: pg.screenshot_url,
              notes: `Version ${pg.version}`
            }));
          }
        }

        if (dbFeedback && dbFeedback.length > 0) {
          const prjFb = dbFeedback.filter(f => f.project_id === p.id);
          if (prjFb.length > 0) {
            mockClientState.feedbackItems = prjFb.map(f => ({
              id: f.id,
              title: f.title,
              page: f.page_title,
              section: 'Revision Request',
              desc: f.comment,
              priority: f.priority,
              status: f.status
            }));
          }
        }

        if (dbMessages && dbMessages.length > 0) {
          const prjMsgs = dbMessages.filter(m => m.project_id === p.id);
          if (prjMsgs.length > 0) {
            mockClientState.messages = prjMsgs.map(m => ({
              id: m.id,
              sender: m.sender_name,
              text: m.message_text,
              time: m.time_formatted
            }));
          }
        }

        if (dbAssets && dbAssets.length > 0) {
          const prjAssets = dbAssets.filter(ast => ast.project_id === p.id);
          if (prjAssets.length > 0) {
            mockClientState.files = prjAssets.map(ast => ({
              id: ast.id,
              name: ast.file_name,
              category: ast.file_type,
              size: ast.file_size,
              uploadDate: new Date(ast.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
            }));
          }
        }
      }
    }

    if (chkData && chkData.length > 0) {
      const phasesMap = {};
      const seenKeys = new Set();
      chkData.forEach(item => {
        const k = `${item.phase_name}::${item.title}`;
        if (!seenKeys.has(k)) {
          seenKeys.add(k);
          if (!phasesMap[item.phase_name]) phasesMap[item.phase_name] = [];
          phasesMap[item.phase_name].push({
            id: item.id,
            title: item.title,
            owner: item.owner || 'Dream Built',
            status: item.status || 'Upcoming'
          });
        }
      });

      if (Object.keys(phasesMap).length > 0) {
        mockClientState.checklistPhases = Object.keys(phasesMap).map(phaseName => ({
          phaseName: phaseName,
          status: phasesMap[phaseName].every(i => i.status === 'Completed') ? 'Completed' : 'In Progress',
          items: phasesMap[phaseName]
        }));
      }
    }

    if (userSession) renderAllViews();

    supabase.channel('public:projects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchSupabaseData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_checklist_items' }, () => fetchSupabaseData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'action_items' }, () => fetchSupabaseData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'website_pages' }, () => fetchSupabaseData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback_items' }, () => fetchSupabaseData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchSupabaseData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_assets' }, () => fetchSupabaseData())
      .subscribe();

  } catch (e) {
    console.warn('Supabase live sync:', e);
  }
}

window.savePortalState = function() {
  let saved = localStorage.getItem(STORAGE_KEY);
  let projects = [];
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.projects)) projects = parsed.projects;
    } catch (e) {}
  }

  let p = projects.find(x => x.id === 'prj-1' || x.client === 'Psycortex');
  if (!p) {
    p = { id: 'prj-1', client: 'Psycortex', contact: 'Alba Cortez' };
    projects.unshift(p);
  }

  p.client = mockClientState.client.businessName;
  p.contact = mockClientState.client.contactName;
  p.clientEmail = mockClientState.client.email;
  p.clientPassword = mockClientState.client.password || 'demo1234';
  p.name = mockClientState.project.name;
  p.currentPhase = mockClientState.project.currentPhase;
  p.progress = mockClientState.project.progress;
  p.targetLaunch = mockClientState.project.targetLaunchDate;
  p.status = mockClientState.project.status;
  p.actionItems = mockClientState.actionItems;
  p.checklistPhases = mockClientState.checklistPhases;
  p.messages = mockClientState.messages;

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects: projects }));
};

document.addEventListener('DOMContentLoaded', () => {
  loadPortalState();
  initAuthAndPortal();
  initTabNavigation();
  initFormsAndModals();

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      loadPortalState();
      if (userSession) renderAllViews();
    }
  });
});

// 1. AUTHENTICATION & INITIALIZATION
function initAuthAndPortal() {
  const loginForm = document.getElementById('portal-login-form');
  const btnSignOut = document.getElementById('btn-sign-out');

  // Restore session on browser refresh
  const savedSession = localStorage.getItem('dreambuilt_portal_session');
  if (savedSession) {
    try {
      userSession = JSON.parse(savedSession);
      const authContainer = document.getElementById('auth-container');
      const wsContainer = document.getElementById('workspace-container');
      if (authContainer) authContainer.style.display = 'none';
      if (wsContainer) wsContainer.style.display = 'block';

      const appHeader = document.querySelector('app-header');
      if (appHeader) appHeader.style.display = 'none';

      renderAllViews();
    } catch (e) {}
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('login-email');
      const email = emailInput ? emailInput.value : 'alba@psycortex.com';

      userSession = { email: email, name: mockClientState.client.contactName, company: mockClientState.client.businessName };
      localStorage.setItem('dreambuilt_portal_session', JSON.stringify(userSession));

      document.getElementById('auth-container').style.display = 'none';
      document.getElementById('workspace-container').style.display = 'block';

      const appHeader = document.querySelector('app-header');
      if (appHeader) appHeader.style.display = 'none';

      renderAllViews();
    });
  }

  if (btnSignOut) {
    btnSignOut.addEventListener('click', () => {
      userSession = null;
      localStorage.removeItem('dreambuilt_portal_session');
      document.getElementById('workspace-container').style.display = 'none';
      document.getElementById('auth-container').style.display = 'block';

      const appHeader = document.querySelector('app-header');
      if (appHeader) appHeader.style.display = 'block';
    });
  }
}

function initTabNavigation() {
  const savedTab = localStorage.getItem('dreambuilt_portal_active_tab');
  if (savedTab) {
    currentTab = savedTab;
    const tabBtns = document.querySelectorAll('.portal-tab-btn');
    tabBtns.forEach(b => {
      if (b.getAttribute('data-tab') === savedTab) b.classList.add('active');
      else b.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach(pane => pane.style.display = 'none');
    const activePane = document.getElementById(`tab-${savedTab}`);
    if (activePane) activePane.style.display = 'block';
  }

  const tabBtns = document.querySelectorAll('.portal-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.getAttribute('data-tab');
      currentTab = targetTab;
      localStorage.setItem('dreambuilt_portal_active_tab', targetTab);

      document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.style.display = 'none';
      });

      const activePane = document.getElementById(`tab-${targetTab}`);
      if (activePane) {
        activePane.style.display = 'block';
      }

      renderAllViews();
    });
  });
}

// 3. RENDER ALL VIEWS
function renderAllViews() {
  renderOverview();
  renderPages();
  renderFeedback();
  renderFiles();
  renderMessages();
  renderChecklist();
  window.savePortalState();
}

// HELPER: CALCULATE DYNAMIC PROGRESS FROM CHECKLIST
function getChecklistProgress() {
  let total = 0;
  let completed = 0;
  if (mockClientState.checklistPhases) {
    mockClientState.checklistPhases.forEach(p => {
      p.items.forEach(i => {
        total++;
        if (i.status === 'Completed') completed++;
      });
    });
  }
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, pct };
}

// RENDER OVERVIEW
function renderOverview() {
  const gridContainer = document.getElementById('attention-grid-container');
  const countBadge = document.getElementById('attention-count');
  
  // Sync progress % dynamically from Project Checklist
  const progressInfo = getChecklistProgress();
  mockClientState.project.progress = progressInfo.pct;
  const progressValEl = document.getElementById('health-progress-value');
  const progressFillEl = document.getElementById('health-progress-fill');
  if (progressValEl) progressValEl.textContent = `${progressInfo.pct}%`;
  if (progressFillEl) progressFillEl.style.width = `${progressInfo.pct}%`;

  const pendingActions = mockClientState.actionItems.filter(item => !item.completed);
  if (countBadge) countBadge.textContent = pendingActions.length;

  if (pendingActions.length === 0) {
    gridContainer.innerHTML = `
      <div class="all-caught-up" style="grid-column: 1 / -1;">
        <h4>✓ YOU'RE ALL CAUGHT UP</h4>
        <p style="margin: 0; font-size: 0.9rem;">Dream Built is currently building your project. We'll alert you here as soon as we need your feedback or approval.</p>
      </div>
    `;
  } else {
    gridContainer.innerHTML = pendingActions.map(action => `
      <div class="attention-card">
        <div class="attention-card-header">
          <div>
            <div class="attention-card-title">${escapeHtml(action.title)}</div>
            <div class="attention-card-desc">${escapeHtml(action.description)}</div>
          </div>
          <span class="status-badge changes-requested">Due ${action.dueDate}</span>
        </div>
        <button class="attention-cta-btn" onclick="handleActionClick('${action.id}', '${action.actionType}')">
          ${action.ctaText} &rarr;
        </button>
      </div>
    `).join('');
  }
}

// RENDER PAGES
function renderPages() {
  const pagesContainer = document.getElementById('pages-grid-container');
  pagesContainer.innerHTML = mockClientState.pages.map(page => `
    <div class="portal-glass page-card">
      <div>
        <div class="page-card-header">
          <div class="page-card-title">${escapeHtml(page.name)}</div>
          <span class="status-badge ${page.status.toLowerCase().replace(/ /g, '-')}">${page.status}</span>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
          Route: <code style="color: var(--color-cyan-glow);">${page.slug}</code> | Version: <strong>${page.version}</strong>
        </div>

        <!-- Page Design Screenshot Thumbnail -->
        <div style="aspect-ratio: 16 / 9; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--color-royal-blue); margin-bottom: 0.85rem; cursor: pointer; position: relative;" onclick="openScreenshotLightbox('${page.screenshotUrl}', '${escapeHtml(page.name)} Design Screenshot')">
          <img src="${page.screenshotUrl}" alt="${escapeHtml(page.name)} Screenshot" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
          <div style="position: absolute; bottom: 0.4rem; right: 0.4rem; background: rgba(0,0,0,0.85); color: #fff; padding: 0.2rem 0.5rem; border-radius: 8px; font-size: 0.7rem; font-weight: 700;">
            🔍 View Screenshot
          </div>
        </div>

        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4;">${escapeHtml(page.notes)}</p>
      </div>

      <div class="page-card-actions">
        <button class="attention-cta-btn" style="flex: 1; justify-content: center; font-size: 0.8rem; padding: 0.5rem;" onclick="openScreenshotLightbox('${page.screenshotUrl}', '${escapeHtml(page.name)} Design Screenshot')">
          VIEW SCREENSHOT 🖼️
        </button>
        <button class="attention-cta-btn" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2);" onclick="openPageWorkspace('${page.id}')">
          INSPECT
        </button>
      </div>
    </div>
  `).join('');
}

window.openScreenshotLightbox = function(imgUrl, caption) {
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  if (lightboxImg) lightboxImg.src = imgUrl;
  if (lightboxCaption) lightboxCaption.textContent = caption || 'Page Design Screenshot';
  openModal('modal-screenshot-lightbox');
};

window.openPageWorkspace = function(pageId) {
  const page = mockClientState.pages.find(p => p.id === pageId) || mockClientState.pages[0];
  document.getElementById('pwd-page-name').textContent = `${page.name.toUpperCase()} WORKSPACE`;
  document.getElementById('pwd-page-status').textContent = page.status;
  document.getElementById('pwd-page-version').textContent = page.version;
  document.getElementById('pwd-page-notes').textContent = page.notes;

  const pageImg = document.getElementById('pwd-page-img');
  if (pageImg) pageImg.src = page.screenshotUrl;

  const btnViewScreenshot = document.getElementById('btn-view-pwd-screenshot');
  if (btnViewScreenshot) {
    btnViewScreenshot.onclick = () => openScreenshotLightbox(page.screenshotUrl, `${page.name} Full Design Screenshot`);
  }

  const pwdScreenshotContainer = document.getElementById('pwd-screenshot-container');
  if (pwdScreenshotContainer) {
    pwdScreenshotContainer.onclick = () => openScreenshotLightbox(page.screenshotUrl, `${page.name} Full Design Screenshot`);
  }

  const btnApprove = document.getElementById('btn-approve-page');
  if (btnApprove) {
    btnApprove.onclick = function() {
      page.status = 'Approved';
      page.notes = `Approved by Alba Cortez on ${new Date().toLocaleDateString()}`;
      
      // Complete associated action item
      mockClientState.actionItems.forEach(item => {
        if (item.targetPage === page.name) item.completed = true;
      });

      mockClientState.activityLog.unshift({
        id: `a-${Date.now()}`,
        time: 'Just now',
        text: `Alba Cortez formally approved ${page.name}.`
      });

      closeModal('modal-page-workspace');
      renderAllViews();
      alert(`✓ ${page.name} has been formally approved!`);
    };
  }

  openModal('modal-page-workspace');
};

// MODALS AND FORMS
function initFormsAndModals() {
  const formRequestChange = document.getElementById('form-request-change');
  if (formRequestChange) {
    formRequestChange.addEventListener('submit', (e) => {
      e.preventDefault();
      const page = document.getElementById('req-page').value;
      const section = document.getElementById('req-section').value || 'General Section';
      const title = document.getElementById('req-title').value;
      const desc = document.getElementById('req-desc').value;
      const priority = document.getElementById('req-priority').value;

      mockClientState.feedbackItems.unshift({
        id: `f-${Date.now()}`,
        title,
        page,
        section,
        desc,
        priority,
        status: 'Submitted'
      });

      mockClientState.activityLog.unshift({
        id: `a-${Date.now()}`,
        time: 'Just now',
        text: `Alba Cortez submitted revision request: ${title}`
      });

      closeModal('modal-request-change');
      formRequestChange.reset();
      renderAllViews();
      alert('✓ Your revision request has been submitted to Dream Built!');
    });
  }

  const btnSendMsg = document.getElementById('btn-send-msg');
  if (btnSendMsg) {
    const sendHandler = () => {
      const input = document.getElementById('msg-input');
      if (input && input.value.trim()) {
        const text = input.value.trim();
        const sender = mockClientState.client.contactName || 'Alba Cortez';
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        mockClientState.messages.push({
          id: `m-${Date.now()}`,
          sender: sender,
          text: text,
          time: timeNow
        });

        input.value = '';
        renderMessages();
        window.savePortalState();

        if (supabase) {
          supabase.from('messages').insert([{
            project_id: mockClientState.project.id || 'prj-1',
            sender: sender,
            text: text,
            created_at: new Date().toISOString()
          }]).then(() => {});
        }
      }
    };

    btnSendMsg.addEventListener('click', sendHandler);

    const msgInput = document.getElementById('msg-input');
    if (msgInput) {
      msgInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendHandler();
        }
      });
    }
  }

  const btnOpenRequest = document.getElementById('btn-open-request-change');
  if (btnOpenRequest) {
    btnOpenRequest.addEventListener('click', () => openModal('modal-request-change'));
  }
}

window.openModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
};

window.closeModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
};

function renderChecklist() {
  const container = document.getElementById('checklist-container');
  const badge = document.getElementById('checklist-progress-badge');
  if (!container) return;

  let totalItems = 0;
  let completedItems = 0;

  mockClientState.checklistPhases.forEach(p => {
    p.items.forEach(i => {
      totalItems++;
      if (i.status === 'Completed') completedItems++;
    });
  });

  const pct = Math.round((completedItems / totalItems) * 100);
  if (badge) badge.textContent = `${completedItems} of ${totalItems} Tasks Completed (${pct}%)`;

  container.innerHTML = mockClientState.checklistPhases.map(phase => `
    <div class="portal-glass" style="padding: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem;">
        <h3 style="margin: 0; font-size: 1.1rem; color: #ffffff;">${escapeHtml(phase.phaseName)}</h3>
        <span class="status-badge ${phase.status === 'Completed' ? 'completed' : phase.status === 'Current Phase' ? 'active' : 'planned'}">
          ${phase.status}
        </span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        ${phase.items.map(item => {
          let icon = '○';
          let iconColor = 'var(--text-muted)';
          if (item.status === 'Completed') {
            icon = '✓';
            iconColor = 'var(--color-success)';
          } else if (item.status === 'In Progress') {
            icon = '●';
            iconColor = 'var(--color-cyan-glow)';
          } else if (item.status === 'Action Required') {
            icon = '⚠️';
            iconColor = 'var(--color-warning)';
          }

          return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-sm);">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-weight: 900; font-size: 1.1rem; color: ${iconColor}; width: 20px; text-align: center;">${icon}</span>
                <div style="font-weight: 600; font-size: 0.95rem; color: ${item.status === 'Completed' ? 'var(--text-secondary)' : '#ffffff'}; text-decoration: ${item.status === 'Completed' ? 'line-through' : 'none'};">
                  ${escapeHtml(item.title)}
                </div>
              </div>
              <span class="portal-badge" style="background: ${item.owner === 'Client Action' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 102, 255, 0.15)'}; color: ${item.owner === 'Client Action' ? 'var(--color-warning)' : 'var(--color-royal-blue)'}; border-color: transparent;">
                ${item.owner}
              </span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
