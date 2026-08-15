import { supabase } from './lib/supabase.js';

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let adminSession = null;
let activeManagedProjectId = null;

let adminState = {
  projects: []
};

const STORAGE_KEY = 'dreambuilt_app_state_v1';

function ensureProjectChecklist(project) {
  if (!project) return;
  let isOld = false;
  if (!project.checklistPhases || !Array.isArray(project.checklistPhases) || project.checklistPhases.length === 0) {
    isOld = true;
  } else {
    let total = 0;
    project.checklistPhases.forEach(ph => {
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
    project.checklistPhases = [
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

    project.progress = 52;
  }
}

function loadAdminState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      if (saved.includes('prj-1') || saved.includes('22222222-2222-2222-2222-222222222222') || saved.includes('alba@psycortex.com')) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.projects)) {
          adminState.projects = parsed.projects;
        }
      }
    } catch (e) {
      console.error('Failed loading admin state:', e);
    }
  }

  adminState.projects.forEach(p => ensureProjectChecklist(p));
  window.saveAdminState();

  fetchSupabaseAdminData();
}

async function fetchSupabaseAdminData() {
  if (!supabase) return;
  try {
    const [
      { data: dbProjects, error: prjErr },
      { data: dbClients },
      { data: dbChecklist },
      { data: dbActionItems },
      { data: dbWebsitePages },
      { data: dbFeedback },
      { data: dbMessages },
      { data: dbAssets },
      { data: dbSubmissions },
      { data: dbConsultations }
    ] = await Promise.all([
      supabase.from('projects').select('*'),
      supabase.from('clients').select('*'),
      supabase.from('project_checklist_items').select('*'),
      supabase.from('action_items').select('*'),
      supabase.from('website_pages').select('*'),
      supabase.from('feedback_items').select('*'),
      supabase.from('messages').select('*').order('created_at', { ascending: true }),
      supabase.from('project_assets').select('*'),
      supabase.from('project_submissions').select('*').order('created_at', { ascending: false }),
      supabase.from('consultations').select('*').order('created_at', { ascending: false })
    ]);

    renderAdminSubmissions(dbSubmissions, dbConsultations);

    if (prjErr) console.warn('Supabase fetch projects error:', prjErr);

    if (!prjErr && dbProjects) {
      const activeIds = dbProjects.map(dp => dp.id);
      adminState.projects = adminState.projects.filter(p => activeIds.includes(p.id));

      dbProjects.forEach(dp => {
        const matchingClient = dbClients ? dbClients.find(c => c.id === dp.client_id) : null;
        let existingPrj = adminState.projects.find(p => p.id === dp.id);
        
        if (!existingPrj) {
          existingPrj = {
            id: dp.id,
            clientId: dp.client_id,
            client: matchingClient ? matchingClient.business_name : 'Client',
            contact: matchingClient ? matchingClient.contact_name : 'Contact',
            clientEmail: matchingClient ? matchingClient.email : 'client@dreambuiltstudios.com',
            clientPassword: matchingClient ? matchingClient.password_hash : 'demo1234',
            name: dp.project_name,
            currentPhase: dp.current_phase,
            progress: dp.progress_pct,
            targetLaunch: dp.target_launch_date,
            status: dp.status,
            actionItems: [],
            pages: [],
            feedback: [],
            assets: [],
            messages: [],
            checklistPhases: []
          };
          ensureProjectChecklist(existingPrj);
          adminState.projects.push(existingPrj);
        } else {
          existingPrj.id = dp.id;
          existingPrj.currentPhase = dp.current_phase;
          existingPrj.progress = dp.progress_pct;
          existingPrj.targetLaunch = dp.target_launch_date;
          existingPrj.status = dp.status;
          if (matchingClient) {
            existingPrj.clientId = matchingClient.id;
            existingPrj.clientEmail = matchingClient.email;
            existingPrj.clientPassword = matchingClient.password_hash;
            existingPrj.client = matchingClient.business_name;
            existingPrj.contact = matchingClient.contact_name;
          }
        }

        if (dbActionItems) {
          const prjActions = dbActionItems.filter(a => a.project_id === dp.id);
          if (prjActions.length > 0) {
            existingPrj.actionItems = prjActions.map(a => ({
              id: a.id,
              title: a.title,
              description: a.description,
              dueDate: a.due_date,
              actionType: a.action_type || 'upload_file',
              completed: a.completed
            }));
          }
        }

        if (dbWebsitePages) {
          const prjPages = dbWebsitePages.filter(pg => pg.project_id === dp.id);
          if (prjPages.length > 0) {
            existingPrj.pages = prjPages.map(pg => ({
              id: pg.id,
              title: pg.title,
              image: pg.image || pg.screenshot_url || '/images/card-01-custom-design.jpg',
              version: pg.version || 'v1.0',
              status: pg.status || 'Ready for Review',
              notes: pg.notes || `Version ${pg.version || 'v1.0'}`
            }));
          }
        }

        if (dbFeedback) {
          const prjFb = dbFeedback.filter(f => f.project_id === dp.id);
          if (prjFb.length > 0) {
            existingPrj.feedback = prjFb.map(f => ({
              id: f.id,
              client: existingPrj.client,
              page: f.page_title,
              title: f.title,
              status: f.status,
              priority: f.priority,
              comment: f.comment
            }));
          }
        }

        if (dbMessages) {
          const prjMsgs = dbMessages.filter(m => m.project_id === dp.id);
          if (prjMsgs.length > 0) {
            existingPrj.messages = prjMsgs.map(m => ({
              id: m.id,
              sender: m.sender_name,
              text: m.message_text,
              time: m.time_formatted
            }));
          }
        }

        if (dbAssets) {
          const prjAssets = dbAssets.filter(ast => ast.project_id === dp.id);
          if (prjAssets.length > 0) {
            existingPrj.assets = prjAssets.map(ast => ({
              id: ast.id,
              name: ast.file_name,
              size: ast.file_size,
              date: new Date(ast.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              type: ast.file_type
            }));
          }
        }

        if (dbChecklist && dbChecklist.length > 0) {
          const projChecklist = dbChecklist.filter(c => c.project_id === dp.id);
          if (projChecklist.length > 0) {
            const standardPhases = [
              '1. INTAKE & DISCOVERY',
              '2. DESIGN PHASE',
              '3. BUILD PHASE',
              '4. REVIEW PHASE',
              '5. LAUNCH PHASE'
            ];
            const phasesMap = {};
            standardPhases.forEach(phName => phasesMap[phName] = []);

            const seenKeys = new Set();
            projChecklist.forEach(item => {
              const k = `${item.phase_name}::${item.title}`;
              if (!seenKeys.has(k)) {
                seenKeys.add(k);
                if (!phasesMap[item.phase_name]) phasesMap[item.phase_name] = [];
                phasesMap[item.phase_name].push({
                  id: item.id,
                  title: item.title,
                  owner: item.owner,
                  status: item.status
                });
              }
            });
            existingPrj.checklistPhases = standardPhases.map(pName => {
              const items = (phasesMap[pName] || []).sort((a, b) => {
                const defaultTaskOrder = [
                  'Initial client consultation and requirements gathering',
                  'Target audience and market research (El Salvador corporate focus)',
                  'Defining brand identity (Premium, Deep Blue, Gold)',
                  'Outlining site architecture (Home, About, Services, Packages, Contact)',
                  'UI/UX layout planning',
                  'Selecting modern typography and visual elements',
                  'Designing custom UI components (metallic gold gradients, glow effects)',
                  'Drafting localized copy and service structures',
                  'Developing HTML structure and semantic markup',
                  'Implementing CSS styling and responsive mobile layouts',
                  'Refining package features, monthly structures, and pricing models',
                  'Adding social media links (LinkedIn, Instagram, TikTok)',
                  'Finalizing interactive elements and form functionality',
                  'Cross-browser and mobile device testing',
                  'Proofreading Spanish copy and checking grammar/accents',
                  'Testing all links, forms, and widgets for proper functionality',
                  'Client review and final feedback rounds',
                  'Final performance optimization and cache busting',
                  'Configuring domain and hosting deployment',
                  'SEO metadata implementation (titles, descriptions)',
                  'Post-launch monitoring and client hand-off'
                ];
                const idxA = defaultTaskOrder.indexOf(a.title);
                const idxB = defaultTaskOrder.indexOf(b.title);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                return 0;
              });

              return {
                phaseName: pName,
                status: (items.length > 0 && items.every(i => i.status === 'Completed')) ? 'Completed' : 'In Progress',
                items: items
              };
            }).filter(ph => ph.items.length > 0);
          }
        }
      });

      if (adminState.projects.length > 0 && (!activeManagedProjectId || !adminState.projects.some(p => p.id === activeManagedProjectId))) {
        activeManagedProjectId = adminState.projects[0].id;
      }

      window.saveAdminState();
      window.restoreAdminView();
    }

    supabase.channel('public:admin_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchSupabaseAdminData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_checklist_items' }, () => fetchSupabaseAdminData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchSupabaseAdminData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'action_items' }, () => fetchSupabaseAdminData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'website_pages' }, () => fetchSupabaseAdminData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback_items' }, () => fetchSupabaseAdminData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchSupabaseAdminData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_assets' }, () => fetchSupabaseAdminData())
      .subscribe();

  } catch (e) {
    console.warn('Supabase Admin live sync:', e);
  }
}

window.saveAdminState = function() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects: adminState.projects }));
  } catch (e) {
    console.error('Failed saving admin state:', e);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  loadAdminState();
  initAdminAuth();
  initAdminTabs();
  initAdminForms();

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      loadAdminState();
      renderAdminDashboard();
      if (document.getElementById('admin-project-manage-view').style.display !== 'none') {
        renderManagedWorkspace();
      }
    }
  });
});

// MODALS & TOAST NOTIFICATIONS
window.openModal = function(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.add('active');
    overlay.style.display = 'flex';
  }
};

window.closeModal = function(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.remove('active');
    overlay.style.display = 'none';
  }
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

  // Restore session on browser refresh
  const savedSession = localStorage.getItem('dreambuilt_admin_session');
  if (savedSession) {
    try {
      adminSession = JSON.parse(savedSession);
      const authContainer = document.getElementById('admin-auth-container');
      const wsContainer = document.getElementById('admin-workspace-container');
      if (authContainer) authContainer.style.display = 'none';
      if (wsContainer) wsContainer.style.display = 'block';

      updateAdminHeaderUIState(true);
      window.restoreAdminView();
    } catch (e) {}
  } else {
    updateAdminHeaderUIState(false);
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('admin-email');
      const email = emailInput ? emailInput.value : 'admin@dreambuiltstudios.com';
      adminSession = { email: email, role: 'admin' };
      localStorage.setItem('dreambuilt_admin_session', JSON.stringify(adminSession));

      document.getElementById('admin-auth-container').style.display = 'none';
      document.getElementById('admin-workspace-container').style.display = 'block';

      updateAdminHeaderUIState(true);
      renderAdminDashboard();
      window.showAdminToast('✓ Logged into Dream Built Admin Command Center');
    });
  }

  const notifBtn = document.getElementById('btn-admin-notifications-toggle');
  if (notifBtn) {
    notifBtn.style.cursor = 'pointer';
    notifBtn.onclick = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      window.toggleAdminNotificationsPopover();
    };
  }

  const chatFab = document.getElementById('floating-chat-button');
  if (chatFab) {
    chatFab.style.cursor = 'pointer';
    chatFab.onclick = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      window.toggleFloatingChatWidget();
    };
  }

  document.addEventListener('click', (e) => {
    const popover = document.getElementById('admin-notifications-popover');
    const toggleBtn = document.getElementById('btn-admin-notifications-toggle');
    if (popover && popover.style.display === 'block') {
      if (!popover.contains(e.target) && !toggleBtn.contains(e.target)) {
        popover.style.display = 'none';
      }
    }
  });

  initAdminChatListeners();

window.handleAdminSendMessage = function(customInputId) {
  const chatInput = document.getElementById(customInputId || 'admin-chat-input') || document.getElementById('admin-chat-input') || document.getElementById('adm-tab-chat-input');
  if (!chatInput) return;
  const txt = (chatInput.value || '').trim();
  if (!txt) return;

  const activeProj = adminState.projects.find(p => p.id === activeManagedProjectId) || adminState.projects[0];
  if (!activeProj) return;

  if (!activeProj.messages) activeProj.messages = [];
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newMsgId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `m-${Date.now()}`;
  
  const newMsg = {
    id: newMsgId,
    sender: 'Dream Built Studios',
    text: txt,
    time: timeNow
  };

  activeProj.messages.push(newMsg);
  window.saveAdminState();

  try {
    const portalDataRaw = localStorage.getItem('dreambuilt_portal_state_v1');
    let portalData = portalDataRaw ? JSON.parse(portalDataRaw) : {};
    portalData.messages = activeProj.messages;
    localStorage.setItem('dreambuilt_portal_state_v1', JSON.stringify(portalData));
  } catch (e) {
    console.warn('Error saving chat to portal state:', e);
  }

  const input1 = document.getElementById('admin-chat-input');
  const input2 = document.getElementById('adm-tab-chat-input');
  if (input1) input1.value = '';
  if (input2) input2.value = '';

  renderAdminFloatingChat();
  renderAdminMessages(activeProj);

  if (supabase && activeProj.id) {
    supabase.from('messages').insert([{
      id: newMsgId,
      project_id: activeProj.id,
      sender_name: 'Dream Built Studios',
      message_text: txt,
      time_formatted: timeNow,
      created_at: new Date().toISOString()
    }]).then(({ error }) => {
      if (error) console.error('Admin chat insert error:', error);
    });
  }
};

window.handleAdminTabSendMessage = function() {
  window.handleAdminSendMessage('adm-tab-chat-input');
};

function initAdminChatListeners() {
  const btnSendChat = document.getElementById('btn-admin-chat-send');
  if (btnSendChat) {
    btnSendChat.onclick = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      window.handleAdminSendMessage();
    };
  }

  const chatInput = document.getElementById('admin-chat-input');
  if (chatInput) {
    chatInput.onkeydown = function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        window.handleAdminSendMessage();
      }
    };
  }
}

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      adminSession = null;
      localStorage.removeItem('dreambuilt_admin_session');
      document.getElementById('admin-workspace-container').style.display = 'none';
      document.getElementById('admin-auth-container').style.display = 'block';

      updateAdminHeaderUIState(false);
    });
  }
}

window.toggleAdminNotificationsPopover = function() {
  const popover = document.getElementById('admin-notifications-popover');
  if (!popover) return;
  const isHidden = popover.style.display === 'none' || !popover.style.display;
  if (isHidden) {
    renderAdminNotifications();
    popover.style.display = 'block';
  } else {
    popover.style.display = 'none';
  }
};

let dismissedAdminNotifIds = new Set(JSON.parse(localStorage.getItem('dreambuilt_admin_dismissed_notifs') || '[]'));

window.dismissAdminNotification = function(notifId, actionType) {
  dismissedAdminNotifIds.add(notifId);
  localStorage.setItem('dreambuilt_admin_dismissed_notifs', JSON.stringify(Array.from(dismissedAdminNotifIds)));
  const popover = document.getElementById('admin-notifications-popover');
  if (popover) popover.style.display = 'none';

  if (actionType === 'chat' && typeof window.toggleFloatingChatWidget === 'function') {
    window.toggleFloatingChatWidget();
  } else if (actionType === 'feedback') {
    window.switchAdminTab('feedback');
  } else if (actionType === 'files') {
    window.switchAdminTab('files');
  }

  renderAdminNotifications();
};

window.clearAdminNotifications = function() {
  const currentNotifs = getActiveAdminNotifications();
  currentNotifs.forEach(n => dismissedAdminNotifIds.add(n.id));
  localStorage.setItem('dreambuilt_admin_dismissed_notifs', JSON.stringify(Array.from(dismissedAdminNotifIds)));
  renderAdminNotifications();
};

function getActiveAdminNotifications() {
  const allNotifs = [
    { id: 'adm-n1', actionType: 'feedback', icon: '📝', title: 'New Revision Request Submitted', time: '15m ago', desc: 'Psycortex submitted feedback for Home Page. Click to view.' },
    { id: 'adm-n2', actionType: 'chat', icon: '💬', title: 'New Client Live Message', time: '30m ago', desc: 'Alba Cortez sent a message in live project chat. Click to respond.' },
    { id: 'adm-n3', actionType: 'files', icon: '📁', title: 'Brand Asset Uploaded', time: '1h ago', desc: 'Client uploaded new company logo assets. Click to inspect.' }
  ];
  return allNotifs.filter(n => !dismissedAdminNotifIds.has(n.id));
}

function renderAdminNotifications() {
  const listEl = document.getElementById('admin-notifications-list');
  const badgeEl = document.getElementById('admin-notifications-badge-count');
  if (!listEl) return;

  const activeNotifs = getActiveAdminNotifications();

  if (badgeEl) {
    if (activeNotifs.length > 0) {
      badgeEl.style.display = 'block';
    } else {
      badgeEl.style.display = 'none';
    }
  }

  if (activeNotifs.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; color: var(--text-secondary); padding: 1.5rem 0.5rem; font-size: 0.825rem;">
        <div style="font-size: 1.5rem; margin-bottom: 0.35rem;">🎉</div>
        <div style="color: #ffffff; font-weight: 700; margin-bottom: 0.2rem;">All Client Alerts Resolved!</div>
        <div>No unread notifications at this time.</div>
      </div>
    `;
    return;
  }

  listEl.innerHTML = activeNotifs.map(n => `
    <div onclick="dismissAdminNotification('${n.id}', '${n.actionType}')" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 0.75rem 0.85rem; border-radius: 8px; font-size: 0.825rem; cursor: pointer; transition: all 0.2s ease;" title="Click to open & dismiss">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem;">
        <span style="font-weight: 700; color: #ffffff;">${n.icon} ${escapeHtml(n.title)}</span>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-weight: 400; color: var(--text-secondary); font-size: 0.75rem;">${escapeHtml(n.time)}</span>
          <span style="color: var(--text-secondary); font-size: 0.9rem; font-weight: 700; opacity: 0.7;">&times;</span>
        </div>
      </div>
      <div style="color: var(--text-secondary); font-size: 0.8rem; line-height: 1.35;">${escapeHtml(n.desc)}</div>
    </div>
  `).join('');
}

window.toggleFloatingChatWidget = function() {
  const widget = document.getElementById('floating-chat-widget');
  const fab = document.getElementById('floating-chat-button');
  if (!widget) return;
  const isHidden = widget.style.display === 'none' || !widget.style.display;
  if (isHidden) {
    widget.style.display = 'flex';
    if (fab) fab.classList.remove('chat-shake-alert');
    renderAdminFloatingChat();
    const input = document.getElementById('admin-chat-input');
    if (input) input.focus();
  } else {
    widget.style.display = 'none';
  }
};

const DEFAULT_SHARED_CHAT_MESSAGES = [];

function syncAdminChatMessages(activeProj) {
  if (!activeProj) return [];

  // Check portal localStorage state first for any live messages sent by client
  try {
    const portalDataRaw = localStorage.getItem('dreambuilt_portal_state_v1');
    if (portalDataRaw) {
      const portalData = JSON.parse(portalDataRaw);
      if (portalData && Array.isArray(portalData.messages) && portalData.messages.length > 0) {
        activeProj.messages = portalData.messages;
        return activeProj.messages;
      }
    }
  } catch (e) {
    console.warn('Error reading portal chat state:', e);
  }

  if (!activeProj.messages || activeProj.messages.length === 0) {
    activeProj.messages = JSON.parse(JSON.stringify(DEFAULT_SHARED_CHAT_MESSAGES));
  }

  return activeProj.messages;
}

function renderAdminFloatingChat() {
  const container = document.getElementById('admin-chat-messages-list');
  if (!container) return;

  const activeProj = adminState.projects.find(p => p.id === activeManagedProjectId) || adminState.projects[0];
  const messages = syncAdminChatMessages(activeProj);

  if (messages.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); font-size: 0.85rem; padding: 2rem;">No messages yet. Send a message to start the conversation!</div>`;
    return;
  }

  container.innerHTML = messages.map(m => `
    <div style="display: flex; flex-direction: column; align-items: ${m.sender === 'Dream Built Studios' || m.sender === 'Admin' ? 'flex-end' : 'flex-start'}; margin-bottom: 0.5rem;">
      <div style="font-size: 0.725rem; color: var(--text-secondary); margin-bottom: 0.2rem;">${escapeHtml(m.sender)} • ${escapeHtml(m.time || 'Just now')}</div>
      <div style="background: ${m.sender === 'Dream Built Studios' || m.sender === 'Admin' ? 'linear-gradient(135deg, #00f0ff, #0066ff)' : 'rgba(255,255,255,0.08)'}; color: ${m.sender === 'Dream Built Studios' || m.sender === 'Admin' ? '#000000' : '#ffffff'}; font-weight: ${m.sender === 'Dream Built Studios' || m.sender === 'Admin' ? '700' : '400'}; padding: 0.65rem 0.95rem; border-radius: 14px; max-width: 82%; font-size: 0.85rem; line-height: 1.4; word-break: break-word;">
        ${escapeHtml(m.text)}
      </div>
    </div>
  `).join('');

  container.scrollTop = container.scrollHeight;
}

function updateAdminHeaderUIState(isLoggedIn) {
  const btnCreate = document.getElementById('btn-create-project');
  const btnLogout = document.getElementById('btn-admin-logout');
  const loggedOutBadge = document.getElementById('admin-header-loggedout-badge');

  const chatFab = document.getElementById('floating-chat-button');
  const chatWidget = document.getElementById('floating-chat-widget');
  const notifBtn = document.getElementById('btn-admin-notifications-toggle');
  const notifPopover = document.getElementById('admin-notifications-popover');

  const activeView = localStorage.getItem('dreambuilt_admin_active_view') || 'dashboard';

  if (isLoggedIn) {
    if (btnCreate) btnCreate.style.display = (activeView === 'manage' || activeView === 'crm') ? 'none' : 'inline-flex';
    if (btnLogout) btnLogout.style.display = 'inline-block';
    if (loggedOutBadge) loggedOutBadge.style.display = 'none';
    if (chatFab) {
      chatFab.style.display = 'block';
      chatFab.classList.add('chat-shake-alert');
    }
    if (notifBtn) {
      if (activeView === 'manage') {
        notifBtn.style.display = 'block';
        renderAdminNotifications();
      } else {
        notifBtn.style.display = 'none';
        if (notifPopover) notifPopover.style.display = 'none';
      }
    }
  } else {
    if (btnCreate) btnCreate.style.display = 'none';
    if (btnLogout) btnLogout.style.display = 'none';
    if (loggedOutBadge) loggedOutBadge.style.display = 'inline-block';
    if (chatFab) {
      chatFab.style.display = 'none';
      chatFab.classList.remove('chat-shake-alert');
    }
    if (chatWidget) chatWidget.style.display = 'none';
    if (notifBtn) notifBtn.style.display = 'none';
    if (notifPopover) notifPopover.style.display = 'none';
  }
}

let cachedSubmissions = [];

function renderAdminSubmissions(dbSubmissions, dbConsultations) {
  const tbody = document.getElementById('admin-submissions-table-body');
  const countBadge = document.getElementById('adm-count-submissions');
  if (!tbody) return;

  let allSubs = [];
  if (dbSubmissions && Array.isArray(dbSubmissions)) {
    dbSubmissions.forEach(s => {
      allSubs.push({
        id: s.id,
        date: s.created_at ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
        clientName: `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Anonymous Lead',
        company: s.company || 'Start Your Project Form',
        email: s.email || 'N/A',
        phone: s.phone || 'N/A',
        budget: s.budget || 'Custom',
        timeline: s.timeline || 'Flexible',
        scope: `${s.pages || 'Multi-page'} (${s.industry || 'Web Project'})`,
        desc: s.project_desc || s.success_criteria || 'New intake submission',
        type: 'Questionnaire',
        raw: s
      });
    });
  }

  if (dbConsultations && Array.isArray(dbConsultations)) {
    dbConsultations.forEach(c => {
      allSubs.push({
        id: c.id,
        date: c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
        clientName: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Anonymous Lead',
        company: c.company || 'Strategy Consultation',
        email: c.email || 'N/A',
        phone: c.phone || 'N/A',
        budget: 'Strategy Call',
        timeline: c.consultation_date ? `${c.consultation_date} @ ${c.consultation_time || ''}` : 'Scheduled',
        scope: `Consultation (${c.consultation_type || 'Discovery Call'})`,
        desc: c.notes || 'Strategy Session Booking',
        type: 'Consultation',
        raw: c
      });
    });
  }

  // 3. Read from LocalStorage submissions fallback
  try {
    const localSubsRaw = localStorage.getItem('dreambuilt_form_submissions');
    if (localSubsRaw) {
      const localSubs = JSON.parse(localSubsRaw);
      if (Array.isArray(localSubs)) {
        localSubs.forEach(s => {
          const clientName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Anonymous Lead';
          const email = s.email || 'N/A';
          const exists = allSubs.some(x => (x.id === s.id) || (email !== 'N/A' && x.email.toLowerCase() === email.toLowerCase()));
          if (!exists) {
            allSubs.unshift({
              id: s.id || `loc-${Date.now()}`,
              date: s.date || (s.created_at ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just Now'),
              clientName: clientName,
              company: s.company || (s.table === 'consultations' ? 'Strategy Consultation' : 'Start Your Project Form'),
              email: email,
              phone: s.phone || 'N/A',
              budget: s.budget || (s.table === 'consultations' ? 'Strategy Call' : 'Custom'),
              timeline: s.timeline || (s.consultation_date ? `${s.consultation_date} @ ${s.consultation_time || ''}` : 'Flexible'),
              scope: s.table === 'consultations' ? `Consultation (${s.consultation_type || 'Discovery Call'})` : `${s.pages || 'Multi-page'} (${s.industry || 'Web Project'})`,
              desc: s.project_desc || s.notes || s.success_criteria || 'New submission',
              type: s.table === 'consultations' ? 'Consultation' : 'Questionnaire',
              raw: s
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn('Error loading local form submissions:', e);
  }

  if (allSubs.length === 0) {
    allSubs = [
      {
        id: 'sub-demo-1',
        date: 'Just Now',
        clientName: 'Alba Cortez',
        company: 'Psycortex Inc',
        email: 'alba@psycortex.com',
        phone: '(555) 234-5678',
        budget: '$5,000 - $10,000',
        timeline: '4 - 6 Weeks',
        scope: 'Home, About, Services, Packages, Contact',
        desc: 'Custom high-converting corporate website for El Salvador tech market.',
        type: 'Questionnaire',
        raw: {
          first_name: 'Alba',
          last_name: 'Cortez',
          email: 'alba@psycortex.com',
          phone: '(555) 234-5678',
          company: 'Psycortex Inc',
          website: 'https://psycortex.com',
          industry: 'Artificial Intelligence & Corporate SaaS',
          target_audience: 'Enterprise Tech Leaders & Executives',
          project_desc: 'Custom high-converting corporate website for El Salvador tech market with metallic gold accents.',
          aesthetic_style: 'Modern & Luxury Dark Mode',
          brand_colors: 'Deep Blue (#0a101e), Metallic Gold (#ffd700), Cyan (#00f0ff)',
          primary_cta: 'Request Enterprise Demo',
          inspiration_urls: 'https://apple.com, https://stripe.com',
          pages: 'Home Page, About Page, Services Page, Packages Page, Contact Page',
          features: 'Interactive Prototype Viewer, Live Chat Bot, Spanish Copy Proofing',
          budget: '$5,000 - $10,000',
          timeline: '4 - 6 Weeks',
          success_criteria: 'Increase enterprise lead conversions by 40% within 90 days of launch.'
        }
      }
    ];
  }

  cachedSubmissions = allSubs;

  if (countBadge) {
    countBadge.textContent = `${allSubs.length} Intake ${allSubs.length === 1 ? 'Submission' : 'Submissions'}`;
  }

  tbody.innerHTML = allSubs.map(s => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); transition: background 0.2s ease;">
      <td style="padding: 0.85rem 1rem; color: var(--text-secondary); font-size: 0.8rem; white-space: nowrap;">
        ${escapeHtml(s.date)}
        <div><span class="portal-badge" style="background: rgba(0, 240, 255, 0.1); color: var(--color-cyan-glow); font-size: 0.65rem; margin-top: 0.2rem; display: inline-block;">${escapeHtml(s.type)}</span></div>
      </td>
      <td style="padding: 0.85rem 1rem;">
        <div style="font-weight: 700; color: #ffffff;">${escapeHtml(s.clientName)}</div>
        <div style="font-size: 0.775rem; color: var(--color-cyan-glow);">${escapeHtml(s.company)}</div>
      </td>
      <td style="padding: 0.85rem 1rem; font-size: 0.825rem;">
        <div><a href="mailto:${escapeHtml(s.email)}" style="color: #ffffff; text-decoration: underline;">${escapeHtml(s.email)}</a></div>
        <div style="color: var(--text-secondary); font-size: 0.775rem;">${escapeHtml(s.phone)}</div>
      </td>
      <td style="padding: 0.85rem 1rem; font-size: 0.825rem;">
        <div style="color: var(--color-success); font-weight: 700;">${escapeHtml(s.budget)}</div>
        <div style="color: var(--text-secondary); font-size: 0.775rem;">⏱ ${escapeHtml(s.timeline)}</div>
      </td>
      <td style="padding: 0.85rem 1rem; font-size: 0.825rem; max-width: 220px;">
        <div style="font-weight: 600; color: #ffffff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(s.scope)}</div>
        <div style="color: var(--text-secondary); font-size: 0.75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(s.desc)}">${escapeHtml(s.desc)}</div>
      </td>
      <td style="padding: 0.85rem 1rem; white-space: nowrap;">
        <button class="attention-cta-btn" style="padding: 0.45rem 0.85rem; font-size: 0.8rem;" onclick="window.openCrmLeadScreen('${s.id}')">
          📋 VIEW FULL DOSSIER
        </button>
      </td>
    </tr>
  `).join('');
}

let activeCrmLeadId = null;

window.openCrmLeadScreen = function(subId) {
  const sub = cachedSubmissions.find(s => s.id === subId) || cachedSubmissions[0];
  if (!sub) return;

  activeCrmLeadId = sub.id;
  const raw = sub.raw || {};

  // Store active view state
  localStorage.setItem('dreambuilt_admin_active_view', 'crm');

  // Toggle view visibility
  const mainDash = document.getElementById('admin-main-dashboard');
  const manageView = document.getElementById('admin-manage-workspace');
  const crmView = document.getElementById('admin-crm-view');

  if (mainDash) mainDash.style.display = 'none';
  if (manageView) manageView.style.display = 'none';
  if (crmView) crmView.style.display = 'block';

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Populate Sidebar & Lead Profile Header
  const titleEl = document.getElementById('crm-lead-header-title');
  const badgeEl = document.getElementById('crm-lead-type-badge');
  const avatarEl = document.getElementById('crm-lead-avatar');
  const nameEl = document.getElementById('crm-lead-name');
  const companyEl = document.getElementById('crm-lead-company');
  const industryEl = document.getElementById('crm-lead-industry');
  const emailLink = document.getElementById('crm-lead-email-link');
  const phoneEl = document.getElementById('crm-lead-phone');
  const websiteEl = document.getElementById('crm-lead-website');
  const dateEl = document.getElementById('crm-lead-date');
  const budgetEl = document.getElementById('crm-lead-budget');
  const timelineEl = document.getElementById('crm-lead-timeline');
  const stageSelect = document.getElementById('crm-lead-stage-select');
  const notesInput = document.getElementById('crm-lead-notes-input');
  const onboardBtn = document.getElementById('btn-crm-onboard-action');

  if (titleEl) titleEl.textContent = `INTAKE DOSSIER: ${sub.clientName.toUpperCase()} (${sub.company})`;
  if (badgeEl) badgeEl.textContent = `${sub.type.toUpperCase()} INTAKE • SUBMITTED ${sub.date.toUpperCase()}`;

  const initials = sub.clientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DB';
  if (avatarEl) avatarEl.textContent = initials;
  if (nameEl) nameEl.textContent = sub.clientName;
  if (companyEl) companyEl.textContent = sub.company;
  if (industryEl) industryEl.textContent = raw.industry || 'Web Development Project';

  if (emailLink) {
    emailLink.textContent = sub.email;
    emailLink.href = `mailto:${sub.email}`;
  }
  if (phoneEl) phoneEl.textContent = sub.phone;
  if (websiteEl) websiteEl.textContent = raw.website || 'N/A';
  if (dateEl) dateEl.textContent = sub.date;
  if (budgetEl) budgetEl.textContent = sub.budget;
  if (timelineEl) timelineEl.textContent = sub.timeline;

  const savedNotes = localStorage.getItem(`dreambuilt_crm_notes_${sub.id}`) || '';
  if (notesInput) notesInput.value = savedNotes;

  if (onboardBtn) {
    onboardBtn.onclick = function() {
      window.convertSubmissionToClient(sub.id);
    };
  }

  // Populate Detailed Right-Column Q&A Dossier Cards
  const dossierContainer = document.getElementById('crm-dossier-details-container');
  if (dossierContainer) {
    if (sub.type === 'Consultation') {
      dossierContainer.innerHTML = `
        <div class="portal-glass" style="padding: 1.75rem;">
          <h3 style="margin: 0 0 1rem 0; color: var(--color-cyan-glow); font-size: 1.15rem;">👤 STRATEGY SESSION CONTACT &amp; COMPANY</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem;">
            <div><strong style="color: var(--text-secondary);">First Name:</strong> <span style="color: #ffffff;">${escapeHtml(raw.first_name || sub.clientName)}</span></div>
            <div><strong style="color: var(--text-secondary);">Last Name:</strong> <span style="color: #ffffff;">${escapeHtml(raw.last_name || '')}</span></div>
            <div><strong style="color: var(--text-secondary);">Email Address:</strong> <a href="mailto:${escapeHtml(sub.email)}" style="color: #ffffff; text-decoration: underline;">${escapeHtml(sub.email)}</a></div>
            <div><strong style="color: var(--text-secondary);">Phone Number:</strong> <span style="color: #ffffff;">${escapeHtml(sub.phone)}</span></div>
            <div><strong style="color: var(--text-secondary);">Company / Brand:</strong> <span style="color: #ffffff;">${escapeHtml(sub.company)}</span></div>
            <div><strong style="color: var(--text-secondary);">Website URL:</strong> <span style="color: #ffffff;">${escapeHtml(raw.website || 'N/A')}</span></div>
          </div>
        </div>

        <div class="portal-glass" style="padding: 1.75rem;">
          <h3 style="margin: 0 0 1rem 0; color: var(--color-cyan-glow); font-size: 1.15rem;">📅 CONSULTATION SCHEDULE &amp; MEETING NOTES</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem;">
            <div><strong style="color: var(--text-secondary);">Consultation Type:</strong> <span style="color: var(--color-success); font-weight: 700;">${escapeHtml(raw.consultation_type || 'Discovery Call')}</span></div>
            <div><strong style="color: var(--text-secondary);">Scheduled Date:</strong> <span style="color: #ffffff;">${escapeHtml(raw.consultation_date || 'N/A')}</span></div>
            <div><strong style="color: var(--text-secondary);">Scheduled Time:</strong> <span style="color: #ffffff;">${escapeHtml(raw.consultation_time || 'N/A')}</span></div>
            <div><strong style="color: var(--text-secondary);">Lead Status:</strong> <span class="status-badge active">${escapeHtml(raw.status || 'New Lead')}</span></div>
          </div>
          <div style="margin-top: 1.25rem; font-size: 0.9rem;">
            <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Client Meeting Notes / Goals:</strong>
            <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 1.15rem; border-radius: 8px; color: #ffffff; line-height: 1.5; font-size: 0.95rem;">
              ${escapeHtml(raw.notes || sub.desc)}
            </div>
          </div>
        </div>
      `;
    } else {
      dossierContainer.innerHTML = `
        <!-- CARD 1: OVERVIEW & CLIENT DETAILS -->
        <div class="portal-glass" style="padding: 1.75rem;">
          <h3 style="margin: 0 0 1rem 0; color: var(--color-cyan-glow); font-size: 1.15rem;">👤 STEP 1 &amp; 2: CLIENT &amp; COMPANY OVERVIEW</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.15rem; font-size: 0.9rem;">
            <div><strong style="color: var(--text-secondary);">Client Name:</strong> <span style="color: #ffffff; font-weight: 700;">${escapeHtml(sub.clientName)}</span></div>
            <div><strong style="color: var(--text-secondary);">Company Name:</strong> <span style="color: #ffffff; font-weight: 700;">${escapeHtml(sub.company)}</span></div>
            <div><strong style="color: var(--text-secondary);">Email:</strong> <a href="mailto:${escapeHtml(sub.email)}" style="color: #ffffff; text-decoration: underline;">${escapeHtml(sub.email)}</a></div>
            <div><strong style="color: var(--text-secondary);">Phone:</strong> <span style="color: #ffffff;">${escapeHtml(sub.phone)}</span></div>
            <div><strong style="color: var(--text-secondary);">Current Website:</strong> <span style="color: #ffffff;">${escapeHtml(raw.website || 'N/A')}</span></div>
            <div><strong style="color: var(--text-secondary);">Industry Focus:</strong> <span style="color: #ffffff;">${escapeHtml(raw.industry || 'Web Development Project')}</span></div>
          </div>
          <div style="margin-top: 1.15rem; font-size: 0.9rem;">
            <strong style="color: var(--text-secondary);">Building Type Requested:</strong>
            <span class="portal-badge" style="background: rgba(0,240,255,0.15); color: #ffffff; margin-left: 0.6rem; font-size: 0.85rem;">${escapeHtml(raw.building || 'Custom Website')}</span>
          </div>
        </div>

        <!-- CARD 2: BRAND VISION & AESTHETIC STYLE -->
        <div class="portal-glass" style="padding: 1.75rem;">
          <h3 style="margin: 0 0 1rem 0; color: var(--color-cyan-glow); font-size: 1.15rem;">🎨 STEP 3: BRAND VISION &amp; AESTHETIC STYLE</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.15rem; font-size: 0.9rem;">
            <div><strong style="color: var(--text-secondary);">Aesthetic Style:</strong> <span style="color: #ffffff; font-weight: 700;">${escapeHtml(raw.aesthetic_style || 'Modern & Luxury Dark Mode')}</span></div>
            <div><strong style="color: var(--text-secondary);">Brand Colors:</strong> <span style="color: #ffffff;">${escapeHtml(raw.brand_colors || 'Deep Blue, Gold, Cyan Glow')}</span></div>
            <div><strong style="color: var(--text-secondary);">Primary Call-to-Action:</strong> <span style="color: #ffffff;">${escapeHtml(raw.primary_cta || 'Start Your Project')}</span></div>
            <div><strong style="color: var(--text-secondary);">Target Audience:</strong> <span style="color: #ffffff;">${escapeHtml(raw.target_audience || 'Corporate Clients')}</span></div>
          </div>

          <div style="margin-top: 1.15rem; font-size: 0.9rem;">
            <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.4rem;">Project Vision &amp; Detailed Objectives:</strong>
            <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 1.15rem; border-radius: 8px; color: #ffffff; line-height: 1.5; font-size: 0.95rem;">
              ${escapeHtml(raw.project_desc || sub.desc)}
            </div>
          </div>

          ${raw.headline_text ? `
            <div style="margin-top: 1rem; font-size: 0.9rem;">
              <strong style="color: var(--text-secondary);">Desired Headline Text:</strong>
              <span style="color: #ffffff; font-style: italic;">"${escapeHtml(raw.headline_text)}"</span>
            </div>
          ` : ''}

          ${raw.inspiration_urls ? `
            <div style="margin-top: 1rem; font-size: 0.9rem;">
              <strong style="color: var(--text-secondary);">Inspiration / Competitor URLs:</strong>
              <span style="color: var(--color-cyan-glow); text-decoration: underline;">${escapeHtml(raw.inspiration_urls)}</span>
            </div>
          ` : ''}
        </div>

        <!-- CARD 3: REQUESTED PAGES & SPECIAL FEATURES -->
        <div class="portal-glass" style="padding: 1.75rem;">
          <h3 style="margin: 0 0 1rem 0; color: var(--color-cyan-glow); font-size: 1.15rem;">⚡ STEP 4: REQUESTED PAGES &amp; FEATURE SCOPE</h3>
          <div style="font-size: 0.9rem; margin-bottom: 1.15rem;">
            <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Requested Website Pages:</strong>
            <div style="color: #ffffff; font-weight: 700; background: rgba(0,102,255,0.18); border: 1px solid rgba(0,102,255,0.4); padding: 0.85rem 1.15rem; border-radius: 8px; font-size: 0.95rem;">
              ${escapeHtml(raw.pages || sub.scope)}
            </div>
          </div>

          <div style="font-size: 0.9rem;">
            <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Requested Special Features &amp; Modules:</strong>
            <div style="color: #ffffff; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 0.85rem 1.15rem; border-radius: 8px; line-height: 1.45;">
              ${escapeHtml(raw.features || 'Standard Responsive UI, Contact Form, SEO Metadata')}
            </div>
          </div>
        </div>

        <!-- CARD 4: BUDGET, TIMELINE & SUCCESS GOALS -->
        <div class="portal-glass" style="padding: 1.75rem;">
          <h3 style="margin: 0 0 1rem 0; color: var(--color-cyan-glow); font-size: 1.15rem;">💰 STEP 5: INVESTMENT, TIMELINE &amp; SUCCESS CRITERIA</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.15rem; font-size: 0.9rem;">
            <div><strong style="color: var(--text-secondary);">Budget Allocation:</strong> <span style="color: var(--color-success); font-weight: 800; font-size: 1.05rem;">${escapeHtml(sub.budget)}</span></div>
            <div><strong style="color: var(--text-secondary);">Target Launch Timeline:</strong> <span style="color: #ffffff; font-weight: 700;">${escapeHtml(sub.timeline)}</span></div>
          </div>

          ${raw.success_criteria ? `
            <div style="margin-top: 1.15rem; font-size: 0.9rem;">
              <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.4rem;">Key Performance Indicators / Success Criteria:</strong>
              <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 1.15rem; border-radius: 8px; color: #ffffff; line-height: 1.5; font-size: 0.95rem;">
                ${escapeHtml(raw.success_criteria)}
              </div>
            </div>
          ` : ''}

          ${raw.files ? `
            <div style="margin-top: 1.15rem; font-size: 0.9rem;">
              <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.4rem;">Uploaded Brand Attachments:</strong>
              <div style="color: var(--color-cyan-glow); font-weight: 600; font-size: 0.95rem;">
                📁 ${escapeHtml(raw.files)}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }
  }

  // Update header buttons & state
  if (typeof updateAdminHeaderUIState === 'function') {
    const isLoggedIn = !!localStorage.getItem('dreambuilt_admin_session');
    updateAdminHeaderUIState(isLoggedIn);
  }
};

window.saveCrmLeadNotes = function() {
  if (!activeCrmLeadId) return;
  const notesInput = document.getElementById('crm-lead-notes-input');
  if (notesInput) {
    localStorage.setItem(`dreambuilt_crm_notes_${activeCrmLeadId}`, notesInput.value);
    window.showAdminToast('💾 Private Lead Notes Saved!');
  }
};

window.restoreAdminDashboardView = function() {
  localStorage.setItem('dreambuilt_admin_active_view', 'dashboard');
  const mainDash = document.getElementById('admin-main-dashboard');
  const manageView = document.getElementById('admin-manage-workspace');
  const crmView = document.getElementById('admin-crm-view');

  if (mainDash) mainDash.style.display = 'block';
  if (manageView) manageView.style.display = 'none';
  if (crmView) crmView.style.display = 'none';

  if (typeof updateAdminHeaderUIState === 'function') {
    const isLoggedIn = !!localStorage.getItem('dreambuilt_admin_session');
    updateAdminHeaderUIState(isLoggedIn);
  }
};

window.viewFullIntakeModal = function(subId) {
  const sub = cachedSubmissions.find(s => s.id === subId) || cachedSubmissions[0];
  if (!sub) return;

  const raw = sub.raw || {};
  const bodyEl = document.getElementById('intake-modal-content-body');
  const titleEl = document.getElementById('intake-modal-title');
  const badgeEl = document.getElementById('intake-modal-type-badge');
  const onboardBtn = document.getElementById('btn-intake-modal-onboard');

  if (titleEl) titleEl.textContent = `INTAKE DOSSIER: ${sub.clientName} (${sub.company})`;
  if (badgeEl) badgeEl.textContent = `${sub.type.toUpperCase()} • SUBMITTED ${sub.date}`;

  if (onboardBtn) {
    onboardBtn.onclick = function() {
      if (typeof closeModal === 'function') closeModal('modal-view-intake');
      window.convertSubmissionToClient(sub.id);
    };
  }

  if (bodyEl) {
    if (sub.type === 'Consultation') {
      bodyEl.innerHTML = `
        <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 1.25rem; border-radius: 10px;">
          <h4 style="margin: 0 0 0.85rem 0; color: var(--color-cyan-glow); font-size: 0.95rem;">👤 STRATEGY SESSION CONTACT &amp; COMPANY</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; font-size: 0.85rem;">
            <div><strong style="color: var(--text-secondary);">First Name:</strong> <span style="color: #ffffff;">${escapeHtml(raw.first_name || sub.clientName)}</span></div>
            <div><strong style="color: var(--text-secondary);">Last Name:</strong> <span style="color: #ffffff;">${escapeHtml(raw.last_name || '')}</span></div>
            <div><strong style="color: var(--text-secondary);">Email:</strong> <a href="mailto:${escapeHtml(sub.email)}" style="color: #ffffff; text-decoration: underline;">${escapeHtml(sub.email)}</a></div>
            <div><strong style="color: var(--text-secondary);">Phone:</strong> <span style="color: #ffffff;">${escapeHtml(sub.phone)}</span></div>
            <div><strong style="color: var(--text-secondary);">Company:</strong> <span style="color: #ffffff;">${escapeHtml(sub.company)}</span></div>
            <div><strong style="color: var(--text-secondary);">Website:</strong> <span style="color: #ffffff;">${escapeHtml(raw.website || 'N/A')}</span></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 1.25rem; border-radius: 10px;">
          <h4 style="margin: 0 0 0.85rem 0; color: var(--color-cyan-glow); font-size: 0.95rem;">📅 CONSULTATION SCHEDULE &amp; NOTES</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; font-size: 0.85rem;">
            <div><strong style="color: var(--text-secondary);">Consultation Type:</strong> <span style="color: var(--color-success); font-weight: 700;">${escapeHtml(raw.consultation_type || 'Discovery Call')}</span></div>
            <div><strong style="color: var(--text-secondary);">Scheduled Date:</strong> <span style="color: #ffffff;">${escapeHtml(raw.consultation_date || 'N/A')}</span></div>
            <div><strong style="color: var(--text-secondary);">Scheduled Time:</strong> <span style="color: #ffffff;">${escapeHtml(raw.consultation_time || 'N/A')}</span></div>
            <div><strong style="color: var(--text-secondary);">Status:</strong> <span class="status-badge active">${escapeHtml(raw.status || 'New Lead')}</span></div>
          </div>
          <div style="margin-top: 1rem; font-size: 0.85rem;">
            <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.35rem;">Additional Meeting Notes:</strong>
            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 0.85rem; border-radius: 6px; color: #ffffff; line-height: 1.45;">
              ${escapeHtml(raw.notes || sub.desc)}
            </div>
          </div>
        </div>
      `;
    } else {
      bodyEl.innerHTML = `
        <!-- CARD 1: CLIENT & COMPANY -->
        <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 1.25rem; border-radius: 10px;">
          <h4 style="margin: 0 0 0.85rem 0; color: var(--color-cyan-glow); font-size: 0.95rem;">👤 STEP 1 &amp; 2: CLIENT &amp; COMPANY DETAILS</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; font-size: 0.85rem;">
            <div><strong style="color: var(--text-secondary);">Client Name:</strong> <span style="color: #ffffff; font-weight: 700;">${escapeHtml(sub.clientName)}</span></div>
            <div><strong style="color: var(--text-secondary);">Company:</strong> <span style="color: #ffffff; font-weight: 700;">${escapeHtml(sub.company)}</span></div>
            <div><strong style="color: var(--text-secondary);">Email:</strong> <a href="mailto:${escapeHtml(sub.email)}" style="color: #ffffff; text-decoration: underline;">${escapeHtml(sub.email)}</a></div>
            <div><strong style="color: var(--text-secondary);">Phone:</strong> <span style="color: #ffffff;">${escapeHtml(sub.phone)}</span></div>
            <div><strong style="color: var(--text-secondary);">Current Website:</strong> <span style="color: #ffffff;">${escapeHtml(raw.website || 'N/A')}</span></div>
            <div><strong style="color: var(--text-secondary);">Industry:</strong> <span style="color: #ffffff;">${escapeHtml(raw.industry || 'Web Project')}</span></div>
          </div>
          <div style="margin-top: 0.85rem; font-size: 0.85rem;">
            <strong style="color: var(--text-secondary);">Building Type Requested:</strong>
            <span class="portal-badge" style="background: rgba(0,240,255,0.15); color: #ffffff; margin-left: 0.5rem;">${escapeHtml(raw.building || 'Custom Website')}</span>
          </div>
        </div>

        <!-- CARD 2: PROJECT VISION & BRAND IDENTITY -->
        <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 1.25rem; border-radius: 10px;">
          <h4 style="margin: 0 0 0.85rem 0; color: var(--color-cyan-glow); font-size: 0.95rem;">🎨 STEP 3: BRAND VISION &amp; AESTHETIC STYLE</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; font-size: 0.85rem;">
            <div><strong style="color: var(--text-secondary);">Aesthetic Style:</strong> <span style="color: #ffffff; font-weight: 700;">${escapeHtml(raw.aesthetic_style || 'Modern / Premium')}</span></div>
            <div><strong style="color: var(--text-secondary);">Brand Colors:</strong> <span style="color: #ffffff;">${escapeHtml(raw.brand_colors || 'Deep Blue, Metallic Gold')}</span></div>
            <div><strong style="color: var(--text-secondary);">Primary Call-to-Action:</strong> <span style="color: #ffffff;">${escapeHtml(raw.primary_cta || 'Start Your Project')}</span></div>
            <div><strong style="color: var(--text-secondary);">Target Audience:</strong> <span style="color: #ffffff;">${escapeHtml(raw.target_audience || 'Corporate Clients')}</span></div>
          </div>

          <div style="margin-top: 0.85rem; font-size: 0.85rem;">
            <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.35rem;">Project Description &amp; Objectives:</strong>
            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 0.85rem; border-radius: 6px; color: #ffffff; line-height: 1.45;">
              ${escapeHtml(raw.project_desc || sub.desc)}
            </div>
          </div>

          ${raw.headline_text ? `
            <div style="margin-top: 0.75rem; font-size: 0.85rem;">
              <strong style="color: var(--text-secondary);">Headline Text:</strong>
              <span style="color: #ffffff; font-style: italic;">"${escapeHtml(raw.headline_text)}"</span>
            </div>
          ` : ''}

          ${raw.inspiration_urls ? `
            <div style="margin-top: 0.75rem; font-size: 0.85rem;">
              <strong style="color: var(--text-secondary);">Inspiration / Competitor URLs:</strong>
              <span style="color: var(--color-cyan-glow);">${escapeHtml(raw.inspiration_urls)}</span>
            </div>
          ` : ''}
        </div>

        <!-- CARD 3: REQUESTED PAGES & FEATURES -->
        <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 1.25rem; border-radius: 10px;">
          <h4 style="margin: 0 0 0.85rem 0; color: var(--color-cyan-glow); font-size: 0.95rem;">⚡ STEP 4: PAGES &amp; SPECIAL FEATURES SCOPE</h4>
          <div style="font-size: 0.85rem; margin-bottom: 0.75rem;">
            <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.35rem;">Requested Pages:</strong>
            <div style="color: #ffffff; font-weight: 600; background: rgba(0,102,255,0.15); border: 1px solid rgba(0,102,255,0.3); padding: 0.65rem 0.85rem; border-radius: 6px;">
              ${escapeHtml(raw.pages || sub.scope)}
            </div>
          </div>

          <div style="font-size: 0.85rem;">
            <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.35rem;">Requested Special Features &amp; Functional Modules:</strong>
            <div style="color: #ffffff; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 0.65rem 0.85rem; border-radius: 6px;">
              ${escapeHtml(raw.features || 'Standard Responsive UI, SEO Metadata, Contact Form')}
            </div>
          </div>
        </div>

        <!-- CARD 4: BUDGET, TIMELINE & SUCCESS CRITERIA -->
        <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 1.25rem; border-radius: 10px;">
          <h4 style="margin: 0 0 0.85rem 0; color: var(--color-cyan-glow); font-size: 0.95rem;">💰 STEP 5: INVESTMENT, TIMELINE &amp; GOALS</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; font-size: 0.85rem;">
            <div><strong style="color: var(--text-secondary);">Budget Allocation:</strong> <span style="color: var(--color-success); font-weight: 800; font-size: 0.95rem;">${escapeHtml(sub.budget)}</span></div>
            <div><strong style="color: var(--text-secondary);">Desired Launch Timeline:</strong> <span style="color: #ffffff; font-weight: 700;">${escapeHtml(sub.timeline)}</span></div>
          </div>

          ${raw.success_criteria ? `
            <div style="margin-top: 0.85rem; font-size: 0.85rem;">
              <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.35rem;">Primary Key Performance Indicators / Success Criteria:</strong>
              <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 0.85rem; border-radius: 6px; color: #ffffff; line-height: 1.45;">
                ${escapeHtml(raw.success_criteria)}
              </div>
            </div>
          ` : ''}

          ${raw.files ? `
            <div style="margin-top: 0.85rem; font-size: 0.85rem;">
              <strong style="color: var(--text-secondary); display: block; margin-bottom: 0.35rem;">Uploaded Brand Attachments:</strong>
              <div style="color: var(--color-cyan-glow); font-weight: 600;">
                📁 ${escapeHtml(raw.files)}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }
  }

  if (typeof openModal === 'function') openModal('modal-view-intake');
};

window.convertSubmissionToClient = function(subId) {
  const sub = cachedSubmissions.find(s => s.id === subId) || cachedSubmissions[0];
  if (!sub) return;
  if (typeof openModal === 'function') openModal('modal-create-project');
  setTimeout(() => {
    const bizInput = document.getElementById('p-client-name');
    const contactInput = document.getElementById('p-contact-name');
    const emailInput = document.getElementById('p-client-email');
    const nameInput = document.getElementById('p-name');
    if (bizInput) bizInput.value = sub.company;
    if (contactInput) contactInput.value = sub.clientName;
    if (emailInput) emailInput.value = sub.email;
    if (nameInput) nameInput.value = `${sub.company} Website`;
  }, 100);
};

function renderAdminDashboard() {
  renderAdminSubmissions();
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
        <div style="display: flex; gap: 0.4rem; align-items: center;">
          <button class="attention-cta-btn" style="padding: 0.45rem 0.85rem; font-size: 0.8rem;" onclick="openProjectManageView('${p.id}')">
            MANAGE &rarr;
          </button>
          <button class="portal-badge" style="cursor: pointer; background: rgba(0, 240, 255, 0.15); border-color: rgba(0, 240, 255, 0.4); color: var(--color-cyan-glow); padding: 0.45rem 0.65rem; font-size: 0.8rem;" onclick="openEditCredentialsModal('${p.id}')" title="Edit Login Email & Password">
            🔑 EDIT LOGIN
          </button>
          <button class="portal-badge" style="cursor: pointer; background: rgba(255, 77, 77, 0.15); border-color: rgba(255, 77, 77, 0.4); color: #ff6666; padding: 0.45rem 0.65rem; font-size: 0.8rem;" onclick="deleteClientAccount('${p.id}')" title="Delete Client Account">
            🗑️ DELETE
          </button>
        </div>
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

window.switchAdminTab = function(targetTab) {
  if (!targetTab) return;
  localStorage.setItem('dreambuilt_admin_active_tab', targetTab);

  const tabBtns = document.querySelectorAll('.portal-tabs-nav button[data-adm-tab]');
  tabBtns.forEach(btn => {
    if (btn.getAttribute('data-adm-tab') === targetTab) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  document.querySelectorAll('.adm-tab-pane').forEach(pane => pane.style.display = 'none');
  const activePane = document.getElementById(`adm-tab-${targetTab}`);
  if (activePane) activePane.style.display = 'block';
};

window.restoreAdminView = function() {
  const activeView = localStorage.getItem('dreambuilt_admin_active_view');
  const savedProjectId = localStorage.getItem('dreambuilt_admin_managed_project_id');
  const savedTab = localStorage.getItem('dreambuilt_admin_active_tab') || 'overview';

  renderAdminDashboard();

  const btnCreate = document.getElementById('btn-create-project');
  const chatFab = document.getElementById('floating-chat-button');
  const chatWidget = document.getElementById('floating-chat-widget');
  const notifBtn = document.getElementById('btn-admin-notifications-toggle');
  const notifPopover = document.getElementById('admin-notifications-popover');

  if (activeView === 'manage' && savedProjectId) {
    const project = adminState.projects.find(p => p.id === savedProjectId);
    if (project) {
      activeManagedProjectId = savedProjectId;
      const mainDash = document.getElementById('admin-main-dashboard');
      const manageView = document.getElementById('admin-project-manage-view');
      if (mainDash) mainDash.style.display = 'none';
      if (manageView) manageView.style.display = 'block';
      if (btnCreate) btnCreate.style.display = 'none';
      if (chatFab) {
        chatFab.style.display = 'block';
        chatFab.classList.add('chat-shake-alert');
      }
      if (notifBtn) {
        notifBtn.style.display = 'block';
        renderAdminNotifications();
      }

      const titleEl = document.getElementById('adm-manage-title');
      const subEl = document.getElementById('adm-manage-client-sub');
      const phaseEl = document.getElementById('adm-manage-phase-select');

      if (titleEl) titleEl.textContent = project.name;
      if (subEl) subEl.textContent = `Client: ${project.contact} (${project.client})`;
      if (phaseEl) phaseEl.value = project.currentPhase;
      const launchEl = document.getElementById('adm-manage-target-launch');
      if (launchEl) launchEl.value = project.targetLaunch || 'Sept 15, 2026';

      window.switchAdminTab(savedTab);
      renderManagedWorkspace();
      return;
    }
  }

  if (activeView === 'crm') {
    const mainDash = document.getElementById('admin-main-dashboard');
    const manageView = document.getElementById('admin-project-manage-view');
    const crmView = document.getElementById('admin-crm-view');
    if (mainDash) mainDash.style.display = 'none';
    if (manageView) manageView.style.display = 'none';
    if (crmView) crmView.style.display = 'block';
    if (btnCreate) btnCreate.style.display = 'none';
    if (chatFab) chatFab.style.display = 'none';
    if (notifBtn) notifBtn.style.display = 'none';
    if (cachedSubmissions.length > 0) {
      window.openCrmLeadScreen(cachedSubmissions[0].id);
    }
    return;
  }

  const mainDash = document.getElementById('admin-main-dashboard');
  const manageView = document.getElementById('admin-project-manage-view');
  if (mainDash) mainDash.style.display = 'block';
  if (manageView) manageView.style.display = 'none';
  if (btnCreate) btnCreate.style.display = 'inline-flex';
  if (chatFab) {
    chatFab.style.display = 'block';
  }
  if (notifBtn) notifBtn.style.display = 'none';
  if (notifPopover) notifPopover.style.display = 'none';
};

// SWITCH TO PROJECT MANAGEMENT VIEW
window.openProjectManageView = function(projectId, tabName) {
  activeManagedProjectId = projectId;
  localStorage.setItem('dreambuilt_admin_managed_project_id', projectId);
  localStorage.setItem('dreambuilt_admin_active_view', 'manage');
  
  const project = adminState.projects.find(p => p.id === projectId);
  if (!project) return;

  const btnCreate = document.getElementById('btn-create-project');
  if (btnCreate) btnCreate.style.display = 'none';

  const chatFab = document.getElementById('floating-chat-button');
  if (chatFab) {
    chatFab.style.display = 'block';
    chatFab.classList.add('chat-shake-alert');
  }

  const notifBtn = document.getElementById('btn-admin-notifications-toggle');
  if (notifBtn) {
    notifBtn.style.display = 'block';
    renderAdminNotifications();
  }

  document.getElementById('admin-main-dashboard').style.display = 'none';
  document.getElementById('admin-project-manage-view').style.display = 'block';

  document.getElementById('adm-manage-title').textContent = project.name;
  document.getElementById('adm-manage-client-sub').textContent = `Client: ${project.contact} (${project.client})`;
  document.getElementById('adm-manage-phase-select').value = project.currentPhase;
  const launchEl = document.getElementById('adm-manage-target-launch');
  if (launchEl) launchEl.value = project.targetLaunch || 'Sept 15, 2026';

  const targetTab = tabName || localStorage.getItem('dreambuilt_admin_active_tab') || 'overview';
  window.switchAdminTab(targetTab);

  renderManagedWorkspace();
  window.showAdminToast(`✓ Opened operational management for ${project.name}`);
};

// RETURN TO MAIN ADMIN DASHBOARD
function initAdminTabs() {
  const btnBack = document.getElementById('btn-back-to-dashboard');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      localStorage.setItem('dreambuilt_admin_active_view', 'dashboard');
      document.getElementById('admin-project-manage-view').style.display = 'none';
      document.getElementById('admin-main-dashboard').style.display = 'block';
      const btnCreate = document.getElementById('btn-create-project');
      if (btnCreate) btnCreate.style.display = 'inline-flex';
      
      const chatFab = document.getElementById('floating-chat-button');
      const chatWidget = document.getElementById('floating-chat-widget');
      if (chatFab) {
        chatFab.style.display = 'block';
      }

      const notifBtn = document.getElementById('btn-admin-notifications-toggle');
      const notifPopover = document.getElementById('admin-notifications-popover');
      if (notifBtn) notifBtn.style.display = 'none';
      if (notifPopover) notifPopover.style.display = 'none';

      renderProjectsTable();
    });
  }

  const tabBtns = document.querySelectorAll('.portal-tabs-nav button[data-adm-tab]');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-adm-tab');
      window.switchAdminTab(targetTab);
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

  // Update Overview Heading & Health
  const headingEl = document.getElementById('adm-workspace-heading');
  if (headingEl) {
    headingEl.textContent = `ADMIN MANAGING: ${(project.client || 'PSYCORTEX').toUpperCase()} WORKSPACE`;
  }

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

  window.saveAdminState();
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

  if (!project.pages || project.pages.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 2.5rem; text-align: center; background: rgba(0,0,0,0.2); border: 1px dashed rgba(255,255,255,0.15); border-radius: var(--radius-md);">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🖼️</div>
        <div style="color: #ffffff; font-weight: 700; margin-bottom: 0.25rem; font-size: 1.1rem;">No Website Page Screenshots</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">Click the button below to upload your first website page mockup.</div>
        <button class="attention-cta-btn" style="display: inline-flex;" onclick="openUploadScreenshotModal('NEW_PAGE')">+ ADD NEW WEBSITE PAGE SCREENSHOT</button>
      </div>
    `;
    return;
  }

  container.innerHTML = project.pages.map(page => `
    <div class="portal-glass page-card" style="display: flex; flex-direction: column; justify-content: space-between;">
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

      <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
        <button class="attention-cta-btn" style="flex: 1; justify-content: center; font-size: 0.85rem;" onclick="openUploadScreenshotModal('${page.id}')">
          + UPLOAD / REPLACE SCREENSHOT &rarr;
        </button>
        <button class="portal-badge" style="cursor: pointer; background: rgba(255, 77, 77, 0.2); border-color: rgba(255, 77, 77, 0.4); color: #ff6666; padding: 0.45rem 0.75rem; font-size: 0.85rem; font-weight: 700;" onclick="deleteWebsitePage('${page.id}')" title="Delete Website Page Mockup">
          🗑️ DELETE
        </button>
      </div>
    </div>
  `).join('');
}

window.deleteWebsitePage = function(pageId) {
  const project = adminState.projects.find(p => p.id === activeManagedProjectId);
  if (!project || !project.pages) return;

  const pageIdx = project.pages.findIndex(p => p.id === pageId);
  if (pageIdx !== -1) {
    const removedPage = project.pages.splice(pageIdx, 1)[0];
    window.saveAdminState();
    renderManagedWorkspace();

    if (supabase) {
      supabase.from('website_pages').delete().eq('id', pageId).then(({ error }) => {
        if (error) {
          console.warn('Delete page by ID error, attempting deletion by title:', error);
          supabase.from('website_pages').delete().eq('project_id', project.id).eq('title', removedPage.title).then(() => {});
        }
      });
    }

    window.showAdminToast(`✓ Deleted screenshot for '${removedPage.title}'`);
  }
};

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

  const activeProj = project || adminState.projects.find(p => p.id === activeManagedProjectId) || adminState.projects[0];
  if (!activeProj || !activeProj.messages || activeProj.messages.length === 0) {
    chatContainer.innerHTML = `<div style="text-align: center; color: var(--text-secondary); font-size: 0.9rem; padding: 3rem;">No project messages yet. Send a message below to start chatting with the client!</div>`;
    return;
  }

  chatContainer.innerHTML = activeProj.messages.map(msg => {
    const isAdmin = msg.sender === 'Dream Built' || msg.sender === 'Admin' || msg.sender === 'Dream Built Studios';
    return `
      <div style="align-self: ${isAdmin ? 'flex-end' : 'flex-start'}; max-width: 75%; background: ${isAdmin ? 'rgba(0, 102, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)'}; border: 1px solid ${isAdmin ? 'var(--color-royal-blue)' : 'rgba(255,255,255,0.1)'}; padding: 0.85rem 1.15rem; border-radius: var(--radius-md);">
        <div style="font-size: 0.75rem; font-weight: 700; color: ${isAdmin ? 'var(--color-cyan-glow)' : 'var(--text-secondary)'}; margin-bottom: 0.35rem;">
          ${escapeHtml(msg.sender || 'Client')} • ${escapeHtml(msg.time || '')}
        </div>
        <div style="color: #ffffff; font-size: 0.9rem; line-height: 1.4;">${escapeHtml(msg.text || '')}</div>
      </div>
    `;
  }).join('');
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function renderAdminChecklist(project, total, completed, pct) {
  const badge = document.getElementById('adm-checklist-badge');
  if (badge) badge.innerHTML = `<div>${completed} OF ${total} TASKS COMPLETED</div><div>(${pct}%)</div>`;

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
                <div style="font-weight: 700; color: ${item.status === 'Completed' ? 'var(--text-secondary)' : '#ffffff'}; opacity: ${item.status === 'Completed' ? '0.7' : '1'}; text-decoration: none; font-size: 0.95rem;">
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
      if (supabase) {
        supabase.from('project_checklist_items')
          .delete()
          .eq('project_id', project.id)
          .eq('title', removed.title)
          .then(({ error }) => {
            if (error) console.error('Task deletion error:', error);
          });
      }
    }
  });

  window.saveAdminState();
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
        if (supabase) {
          supabase.from('project_checklist_items')
            .update({ status: item.status })
            .eq('project_id', project.id)
            .eq('title', item.title)
            .then(({ error }) => {
              if (error) console.error('Task status toggle error:', error);
            });
        }
      }
    });
  });

  window.saveAdminState();
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
        if (supabase) {
          supabase.from('project_checklist_items')
            .update({ status: status })
            .eq('project_id', project.id)
            .eq('title', item.title)
            .then(({ error }) => {
              if (error) console.error('Task status update error:', error);
            });
        }
      }
    });
  });

  window.saveAdminState();
  renderManagedWorkspace();
};

window.toggleActionComplete = function(actionId) {
  const project = adminState.projects.find(p => p.id === activeManagedProjectId);
  if (!project) return;

  const item = project.actionItems.find(a => a.id === actionId);
  if (item) {
    item.completed = !item.completed;
    window.showAdminToast(`✓ Updated action item '${item.title}'`);
    window.saveAdminState();
    renderManagedWorkspace();

    if (supabase) {
      supabase.from('action_items').update({ completed: item.completed }).eq('id', actionId).then(({ error }) => {
        if (error) console.error('Action item update error:', error);
      });
    }
  }
};

window.updateProjectPhase = function(id, phase) {
  const p = adminState.projects.find(x => x.id === id);
  if (p) {
    p.currentPhase = phase;
    window.showAdminToast(`✓ Updated ${p.name} phase to ${phase}`);
    window.saveAdminState();

    if (supabase) {
      supabase.from('projects').update({ current_phase: phase }).eq('id', id).then(() => {});
    }
  }
};

window.updateProjectTargetLaunch = function(id, dateVal) {
  const p = adminState.projects.find(x => x.id === id);
  if (p) {
    p.targetLaunch = dateVal;
    window.showAdminToast(`✓ Updated ${p.name} target launch date to '${dateVal}'`);
    window.saveAdminState();

    if (supabase) {
      supabase.from('projects').update({ target_launch_date: dateVal }).eq('id', id).then(() => {});
    }

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
    window.saveAdminState();

    if (supabase) {
      supabase.from('projects').update({ target_launch_date: dateVal }).eq('id', p.id).then(() => {});
    }

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
      window.saveAdminState();
      renderManagedWorkspace();

      if (supabase) {
        supabase.from('feedback_items').update({ status: status }).eq('id', id).then(({ error }) => {
          if (error) console.error('Feedback update error:', error);
        });
      }
    }
  }
};

function initAdminForms() {
  const btnCreateProject = document.getElementById('btn-create-project');
  if (btnCreateProject) {
    btnCreateProject.addEventListener('click', () => window.openModal('modal-create-project'));
  }

  const btnAddTask = document.getElementById('btn-adm-add-task');
  if (btnAddTask) {
    btnAddTask.addEventListener('click', () => window.openModal('modal-add-checklist-task'));
  }

  const formAddFeedback = document.getElementById('form-admin-add-feedback');
  if (formAddFeedback) {
    formAddFeedback.addEventListener('submit', (e) => {
      e.preventDefault();
      const page = document.getElementById('adm-fb-page').value;
      const title = document.getElementById('adm-fb-title').value.trim();
      const section = document.getElementById('adm-fb-section').value.trim() || 'Design Section';
      const desc = document.getElementById('adm-fb-desc').value.trim();
      const priority = document.getElementById('adm-fb-priority').value;
      const status = document.getElementById('adm-fb-status').value;

      const project = adminState.projects.find(p => p.id === activeManagedProjectId);
      if (!project) return;

      const newFbId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `f-${Date.now()}`;
      const newFbItem = {
        id: newFbId,
        title: title,
        page: page,
        section: section,
        comment: desc,
        desc: desc,
        priority: priority,
        status: status
      };

      if (!project.feedback) project.feedback = [];
      project.feedback.unshift(newFbItem);

      window.saveAdminState();
      renderManagedWorkspace();
      window.closeModal('modal-admin-add-feedback');
      formAddFeedback.reset();
      window.showAdminToast(`✓ Submitted feedback item '${title}'`);

      if (supabase && project.id) {
        supabase.from('feedback_items').insert([{
          id: newFbId,
          project_id: project.id,
          page_title: page,
          title: title,
          comment: desc,
          priority: priority,
          status: status
        }]).then(({ error }) => {
          if (error) console.error('Admin feedback insert error:', error);
        });
      }
    });
  }

  const formCreateProject = document.getElementById('form-create-project');
  if (formCreateProject) {
    formCreateProject.addEventListener('submit', (e) => {
      e.preventDefault();
      const clientName = document.getElementById('p-client-name').value.trim();
      const contactName = document.getElementById('p-contact-name').value.trim();
      const clientEmail = document.getElementById('p-client-email').value.trim();
      const clientPassword = document.getElementById('p-client-password').value.trim();

      const name = document.getElementById('p-name').value.trim();
      const phase = document.getElementById('p-phase').value;
      const launch = document.getElementById('p-launch').value.trim();

      const generateUUID = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });

      const newProjId = generateUUID();
      const newClientId = generateUUID();

      const newPrj = {
        id: newProjId,
        clientId: newClientId,
        client: clientName,
        contact: contactName,
        clientEmail: clientEmail,
        clientPassword: clientPassword,
        name: name,
        currentPhase: phase,
        progress: 0,
        targetLaunch: launch,
        status: 'Active',
        actionItems: [
          { id: `act-${Date.now()}`, title: 'Upload Brand Assets & Guidelines', description: 'Please upload transparent SVG logos and brand color guidelines.', dueDate: 'Upcoming', completed: false }
        ],
        pages: [],
        feedback: [],
        assets: [],
        messages: [
          { sender: 'Dream Built', text: `Welcome ${contactName}! Your project workspace for ${name} is live.`, time: 'Just now' }
        ],
        checklistPhases: [
          {
            phaseName: '1. INTAKE & DISCOVERY',
            status: 'Upcoming',
            items: [
              { id: `c-${Date.now()}-1`, title: 'Initial client consultation and requirements gathering', owner: 'Dream Built', status: 'Upcoming' },
              { id: `c-${Date.now()}-2`, title: 'Target audience and market research (El Salvador corporate focus)', owner: 'Dream Built', status: 'Upcoming' },
              { id: `c-${Date.now()}-3`, title: 'Defining brand identity (Premium, Deep Blue, Gold)', owner: 'Dream Built', status: 'Upcoming' },
              { id: `c-${Date.now()}-4`, title: 'Outlining site architecture (Home, About, Services, Packages, Contact)', owner: 'Dream Built', status: 'Upcoming' }
            ]
          },
          {
            phaseName: '2. DESIGN PHASE',
            status: 'Upcoming',
            items: [
              { id: `c-${Date.now()}-5`, title: 'UI/UX layout planning', owner: 'Dream Built', status: 'Upcoming' },
              { id: `c-${Date.now()}-6`, title: 'Selecting modern typography and visual elements', owner: 'Dream Built', status: 'Upcoming' },
              { id: `c-${Date.now()}-7`, title: 'Designing custom UI components (metallic gold gradients, glow effects)', owner: 'Dream Built', status: 'Upcoming' },
              { id: `c-${Date.now()}-8`, title: 'Drafting localized copy and service structures', owner: 'Dream Built', status: 'Upcoming' }
            ]
          },
          {
            phaseName: '3. BUILD PHASE',
            status: 'Upcoming',
            items: [
              { id: `c-${Date.now()}-9`, title: 'Developing HTML structure and semantic markup', owner: 'Dream Built', status: 'Upcoming' },
              { id: `c-${Date.now()}-10`, title: 'Implementing CSS styling and responsive mobile layouts', owner: 'Dream Built', status: 'Upcoming' },
              { id: `c-${Date.now()}-11`, title: 'Refining package features, monthly structures, and pricing models', owner: 'Dream Built', status: 'Upcoming' },
              { id: `c-${Date.now()}-12`, title: 'Adding social media links (LinkedIn, Instagram, TikTok)', owner: 'Dream Built', status: 'Upcoming' },
              { id: `c-${Date.now()}-13`, title: 'Finalizing interactive elements and form functionality', owner: 'Dream Built', status: 'Upcoming' }
            ]
          },
          {
            phaseName: '4. REVIEW PHASE',
            status: 'Upcoming',
            items: [
              { id: `c-${Date.now()}-14`, title: 'Cross-browser and mobile device testing', owner: 'Dream Built', status: 'Upcoming' },
              { id: `c-${Date.now()}-15`, title: 'Proofreading Spanish copy and checking grammar/accents', owner: 'Client Action', status: 'Upcoming' },
              { id: `c-${Date.now()}-16`, title: 'Testing all links, forms, and widgets for proper functionality', owner: 'Dream Built', status: 'Upcoming' },
              { id: `c-${Date.now()}-17`, title: 'Client review and final feedback rounds', owner: 'Client Action', status: 'Upcoming' }
            ]
          },
          {
            phaseName: '5. LAUNCH PHASE',
            status: 'Upcoming',
            items: [
              { id: `c-${Date.now()}-18`, title: 'Final performance optimization and cache busting', owner: 'Dream Built', status: 'Upcoming' },
              { id: `c-${Date.now()}-19`, title: 'Configuring domain and hosting deployment', owner: 'Dream Built', status: 'Upcoming' },
              { id: `c-${Date.now()}-20`, title: 'SEO metadata implementation (titles, descriptions)', owner: 'Dream Built', status: 'Upcoming' },
              { id: `c-${Date.now()}-21`, title: 'Post-launch monitoring and client hand-off', owner: 'Dream Built', status: 'Upcoming' }
            ]
          }
        ]
      };

      adminState.projects.unshift(newPrj);
      window.saveAdminState();

      if (supabase) {
        (async () => {
          try {
            let targetClientId = newClientId;
            const { data: existingClients } = await supabase.from('clients').select('id, email').eq('email', clientEmail);
            if (existingClients && existingClients.length > 0) {
              targetClientId = existingClients[0].id;
              newPrj.clientId = targetClientId;
              await supabase.from('clients').update({
                business_name: clientName,
                contact_name: contactName,
                password_hash: clientPassword
              }).eq('id', targetClientId);
            } else {
              const { error: cliErr } = await supabase.from('clients').insert([{
                id: newClientId,
                business_name: clientName,
                contact_name: contactName,
                email: clientEmail,
                password_hash: clientPassword
              }]);
              if (cliErr) console.error('Clients insert error:', cliErr);
            }

            const { error: prjErr } = await supabase.from('projects').insert([{
              id: newProjId,
              client_id: targetClientId,
              project_name: name,
              current_phase: phase,
              target_launch_date: launch,
              progress_pct: 0,
              status: 'Active'
            }]);

            if (prjErr) {
              console.error('Projects insert error:', prjErr);
              return;
            }



            await supabase.from('action_items').insert([{
              project_id: newProjId,
              title: 'Upload Brand Assets & Guidelines',
              description: 'Please upload transparent SVG logos and brand color guidelines.',
              due_date: 'Upcoming',
              action_type: 'upload_file',
              completed: false
            }]);



            console.log(`Successfully synced new workspace '${name}' to Supabase!`);
          } catch (err) {
            console.error('Failed creating project in Supabase:', err);
          }
        })();
      }

      renderAdminDashboard();

      window.showAdminToast(`✓ Created client '${clientName}' & launched workspace '${name}'!`);
      window.closeModal('modal-create-project');
      formCreateProject.reset();
    });
  }

  const formUploadScreenshot = document.getElementById('form-upload-screenshot');
  if (formUploadScreenshot) {
    formUploadScreenshot.addEventListener('submit', (e) => {
      e.preventDefault();
      const pageSelectVal = document.getElementById('s-page').value;
      const newTitleInput = document.getElementById('s-new-title');
      const urlInput = document.getElementById('s-url').value.trim();
      const notes = document.getElementById('s-notes').value.trim();

      const finalUrl = window.lastUploadedScreenshotDataUrl || urlInput || '/images/card-01-custom-design.jpg';

      const project = adminState.projects.find(p => p.id === activeManagedProjectId);
      if (project) {
        if (pageSelectVal === 'NEW_PAGE' || (newTitleInput && newTitleInput.value.trim())) {
          const newTitle = (newTitleInput && newTitleInput.value.trim()) || 'New Website Page';
          const newPage = {
            id: `pg-${Date.now()}`,
            title: newTitle,
            image: finalUrl,
            status: 'Ready for Review',
            version: notes ? `v1.0 (${notes})` : 'v1.0'
          };
          if (!project.pages) project.pages = [];
          project.pages.push(newPage);

          if (supabase) {
            supabase.from('website_pages').insert([{
              project_id: project.id,
              title: newTitle,
              screenshot_url: finalUrl,
              version: newPage.version,
              status: 'Ready for Review'
            }]).then(() => {});
          }

          window.showAdminToast(`✓ Uploaded new page screenshot for '${newTitle}'!`);
        } else {
          const page = project.pages.find(p => p.id === pageSelectVal);
          if (page) {
            page.image = finalUrl;
            page.version = notes ? `v2.${Date.now().toString().slice(-2)}` : page.version;

            if (supabase) {
              supabase.from('website_pages').upsert({
                project_id: project.id,
                title: page.title,
                screenshot_url: page.image,
                version: page.version
              }).then(() => {});
            }

            window.showAdminToast(`✓ Replaced screenshot for ${page.title}!`);
          }
        }

        window.saveAdminState();
        renderManagedWorkspace();
      }

      window.lastUploadedScreenshotDataUrl = null;
      const fileNameEl = document.getElementById('s-file-name');
      if (fileNameEl) fileNameEl.textContent = 'No file selected';

      window.closeModal('modal-upload-screenshot');
      formUploadScreenshot.reset();
    });
  }

  const formUploadDeliverable = document.getElementById('form-upload-deliverable');
  if (formUploadDeliverable) {
    formUploadDeliverable.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('d-title').value.trim();
      const type = document.getElementById('d-type').value;

      const project = adminState.projects.find(p => p.id === activeManagedProjectId);
      if (project) {
        const newAssetId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `a-${Date.now()}`;
        const newAsset = {
          id: newAssetId,
          name: title,
          size: window.lastSelectedDeliverableSize || '2.4 MB',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          type: type
        };
        if (!project.assets) project.assets = [];
        project.assets.unshift(newAsset);

        window.saveAdminState();
        renderManagedWorkspace();

        if (supabase) {
          supabase.from('project_assets').insert([{
            id: newAssetId,
            project_id: project.id,
            file_name: title,
            file_url: '/assets/sample.pdf',
            file_size: newAsset.size,
            file_type: type
          }]).then(({ error }) => {
            if (error) console.error('Asset insert error:', error);
          });
        }

        window.showAdminToast(`✓ Uploaded deliverable asset '${title}'!`);
      }

      const fileNameEl = document.getElementById('d-file-name');
      if (fileNameEl) fileNameEl.textContent = 'No file selected';
      window.lastSelectedDeliverableSize = null;

      window.closeModal('modal-upload-deliverable');
      formUploadDeliverable.reset();
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
        const newTaskId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `c-${Date.now()}`;
        const newTask = {
          id: newTaskId,
          title: title,
          owner: owner,
          status: status
        };
        phaseObj.items.push(newTask);

        window.saveAdminState();
        renderManagedWorkspace();

        if (supabase) {
          supabase.from('project_checklist_items').insert([{
            id: newTaskId,
            project_id: project.id,
            phase_name: phaseName,
            title: title,
            owner: owner,
            status: status
          }]).then(({ error }) => {
            if (error) console.error('Checklist task insert error:', error);
          });
        }

        window.showAdminToast(`✓ Added checklist task '${title}' to ${phaseName}`);
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
        const newActId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `act-${Date.now()}`;
        const newAction = {
          id: newActId,
          title: title,
          description: desc,
          dueDate: due,
          actionType: 'upload_file',
          ctaText: 'ACTION REQUIRED',
          completed: false
        };
        if (!project.actionItems) project.actionItems = [];
        project.actionItems.unshift(newAction);

        window.saveAdminState();
        renderManagedWorkspace();

        if (supabase) {
          supabase.from('action_items').insert([{
            id: newActId,
            project_id: project.id,
            title: title,
            description: desc,
            due_date: due,
            completed: false
          }]).then(({ error }) => {
            if (error) console.error('Action item insert error:', error);
          });
        }

        window.showAdminToast(`✓ Assigned action item '${title}' to client`);
      }

      window.closeModal('modal-add-action-item');
      formAddAction.reset();
    });
  }

  const formAddManualLead = document.getElementById('form-add-manual-lead');
  if (formAddManualLead) {
    formAddManualLead.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fname = document.getElementById('manual-lead-fname').value.trim();
      const lname = document.getElementById('manual-lead-lname').value.trim();
      const email = document.getElementById('manual-lead-email').value.trim();
      const phone = document.getElementById('manual-lead-phone').value.trim();
      const company = document.getElementById('manual-lead-company').value.trim() || 'Manual Lead Entry';
      const budget = document.getElementById('manual-lead-budget').value.trim() || 'Custom';
      const desc = document.getElementById('manual-lead-desc').value.trim() || 'Manual Lead Submission';

      const data = {
        first_name: fname,
        last_name: lname,
        email: email,
        phone: phone,
        company: company,
        budget: budget,
        project_desc: desc,
        status: 'new'
      };

      try {
        const existingRaw = localStorage.getItem('dreambuilt_form_submissions');
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        existing.unshift({
          id: `sub-man-${Date.now()}`,
          table: 'project_submissions',
          created_at: new Date().toISOString(),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          ...data
        });
        localStorage.setItem('dreambuilt_form_submissions', JSON.stringify(existing));
      } catch (err) {}

      if (supabase) {
        try {
          await supabase.from('project_submissions').insert([data]);
        } catch (err) {}
      }

      window.closeModal('modal-add-manual-lead');
      formAddManualLead.reset();
      window.showAdminToast(`✓ Added manual lead ${fname} ${lname} to CRM`);

      if (typeof fetchSupabaseAdminData === 'function') fetchSupabaseAdminData();
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
        if (!project.messages) project.messages = [];
        project.messages.push({
          id: `m-${Date.now()}`,
          sender: 'Dream Built',
          text: text,
          time: timeNow
        });

        window.saveAdminState();
        renderAdminMessages(project);
        input.value = '';

        if (supabase) {
          supabase.from('messages').insert([{
            project_id: project.id,
            sender_name: 'Dream Built',
            message_text: text,
            time_formatted: timeNow,
            created_at: new Date().toISOString()
          }]).then(({ error }) => {
            if (error) console.error('Message insert error:', error);
          });
        }

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

        window.saveAdminState();
        renderManagedWorkspace();
        if (typeof renderAdminDashboard === 'function') renderAdminDashboard();

        if (supabase && project.clientId) {
          supabase.from('clients').update({ email: email, password_hash: pass }).eq('id', project.clientId).then(({ error }) => {
            if (error) console.error('Client creds update error:', error);
          });
        }

        window.showAdminToast(`✓ Updated login credentials for ${project.client}!`);
      }

      window.closeModal('modal-edit-credentials');
    });
  }
}

// EDIT CREDENTIALS HELPERS
let editingProjectId = null;

window.openEditCredentialsModal = function(projectId) {
  const targetId = projectId || activeManagedProjectId || (adminState.projects[0] && adminState.projects[0].id);
  editingProjectId = targetId;
  const project = adminState.projects.find(p => p.id === targetId);
  if (project) {
    activeManagedProjectId = targetId;
    document.getElementById('edit-cred-client').value = `${project.client} (${project.contact})`;
    document.getElementById('edit-cred-email').value = project.clientEmail || '';
    document.getElementById('edit-cred-password').value = project.clientPassword || '';
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

window.deleteCurrentEditingAccount = function() {
  const targetId = editingProjectId || activeManagedProjectId || (adminState.projects[0] && adminState.projects[0].id);
  window.deleteClientAccount(targetId);
};

window.deleteClientAccount = function(projectId) {
  const targetId = projectId || editingProjectId || activeManagedProjectId || (adminState.projects[0] && adminState.projects[0].id);
  const project = adminState.projects.find(p => p.id === targetId);
  if (!project) return;

  const confirmDelete = confirm(`Are you sure you want to permanently delete the client account for ${project.client} (${project.contact})?\n\nThis action will remove all project workspace data, checklist items, and client portal access.`);

  if (confirmDelete) {
    const idx = adminState.projects.findIndex(p => p.id === targetId);
    if (idx !== -1) {
      adminState.projects.splice(idx, 1);
    }

    if (supabase) {
      supabase.from('project_checklist_items').delete().eq('project_id', targetId).then(() => {});
      supabase.from('action_items').delete().eq('project_id', targetId).then(() => {});
      supabase.from('website_pages').delete().eq('project_id', targetId).then(() => {});
      supabase.from('feedback_items').delete().eq('project_id', targetId).then(() => {});
      supabase.from('messages').delete().eq('project_id', targetId).then(() => {});
      supabase.from('project_assets').delete().eq('project_id', targetId).then(() => {});
      supabase.from('projects').delete().eq('id', targetId).then(() => {});

      if (project.clientId) {
        supabase.from('clients').delete().eq('id', project.clientId).then(() => {});
      }
      if (project.clientEmail) {
        supabase.from('clients').delete().eq('email', project.clientEmail).then(() => {});
      }
    }

    window.closeModal('modal-edit-credentials');

    document.getElementById('admin-project-manage-view').style.display = 'none';
    document.getElementById('admin-main-dashboard').style.display = 'block';

    const countEl = document.getElementById('adm-count-projects');
    if (countEl) countEl.textContent = adminState.projects.length;

    renderProjectsTable();
    window.showAdminToast(`✓ Permanently deleted client account for ${project.client}`);
  }
};

window.toggleNewPageInput = function(val) {
  const group = document.getElementById('s-new-title-group');
  if (group) {
    group.style.display = val === 'NEW_PAGE' ? 'block' : 'none';
  }
};

window.openUploadScreenshotModal = function(pageId) {
  window.lastUploadedScreenshotDataUrl = null;
  const project = adminState.projects.find(p => p.id === activeManagedProjectId);
  const select = document.getElementById('s-page');

  if (select && project && project.pages) {
    let options = project.pages.map(p => `
      <option value="${p.id}" ${p.id === pageId ? 'selected' : ''}>${p.title} (${p.version})</option>
    `).join('');
    options += `<option value="NEW_PAGE" ${pageId === 'NEW_PAGE' ? 'selected' : ''}>+ ADD NEW WEBSITE PAGE SCREENSHOT</option>`;
    select.innerHTML = options;
  }

  window.toggleNewPageInput(pageId || (select ? select.value : ''));

  const fileNameEl = document.getElementById('s-file-name');
  if (fileNameEl) fileNameEl.textContent = 'No file selected';
  const urlInput = document.getElementById('s-url');
  if (urlInput) urlInput.value = '';
  const notesInput = document.getElementById('s-notes');
  if (notesInput) notesInput.value = '';

  window.openModal('modal-upload-screenshot');
};

window.generateNewClientPassword = function() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  let pass = 'Dream';
  for (let i = 0; i < 4; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  pass += '!';
  const input = document.getElementById('p-client-password');
  if (input) input.value = pass;
  window.showAdminToast(`✓ Generated new client password: ${pass}`);
};

window.handleScreenshotFileSelect = function(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const fileNameEl = document.getElementById('s-file-name');
  if (fileNameEl) {
    fileNameEl.textContent = `✓ Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    window.lastUploadedScreenshotDataUrl = dataUrl;
    const urlInput = document.getElementById('s-url');
    if (urlInput) urlInput.value = dataUrl;
    window.showAdminToast(`✓ Loaded PC file: ${file.name}`);
  };
  reader.readAsDataURL(file);
};

window.handleDeliverableFileSelect = function(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const formattedSize = file.size > 1024 * 1024 
    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
    : `${(file.size / 1024).toFixed(0)} KB`;
  
  window.lastSelectedDeliverableSize = formattedSize;

  const fileNameEl = document.getElementById('d-file-name');
  if (fileNameEl) {
    fileNameEl.textContent = `✓ Selected: ${file.name} (${formattedSize})`;
  }

  const titleInput = document.getElementById('d-title');
  if (titleInput && !titleInput.value) {
    titleInput.value = file.name;
  }

  window.showAdminToast(`✓ Selected deliverable file: ${file.name}`);
};
