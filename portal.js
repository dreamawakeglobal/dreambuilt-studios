import { supabase } from './lib/supabase.js';

// LOCAL DEMO STATE (Fallback & Seed Data for Client View)
let currentTab = 'overview';
let userSession = null;

let mockClientState = {
  client: {
    businessName: '',
    contactName: '',
    email: ''
  },
  project: {
    name: '',
    currentPhase: 'Intake',
    progress: 0,
    targetLaunchDate: 'Upcoming',
    nextMilestone: 'Initial Review',
    status: 'Active',
    previewUrl: ''
  },
  actionItems: [],
  pages: [],
  feedbackItems: [],
  files: [],
  messages: [],
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
  ],
  messages: []
};

const STORAGE_KEY = 'dreambuilt_app_state_v1';

function ensureProjectChecklist(state) {
  let isOld = false;
  if (!state.checklistPhases || !Array.isArray(state.checklistPhases) || state.checklistPhases.length === 0) {
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
        status: 'In Progress',
        items: [
          { id: 'c1', title: 'Initial client consultation and requirements gathering', owner: 'Dream Built', status: 'Upcoming' },
          { id: 'c2', title: 'Target audience and market research (El Salvador corporate focus)', owner: 'Dream Built', status: 'Upcoming' },
          { id: 'c3', title: 'Defining brand identity (Premium, Deep Blue, Gold)', owner: 'Dream Built', status: 'Upcoming' },
          { id: 'c4', title: 'Outlining site architecture (Home, About, Services, Packages, Contact)', owner: 'Dream Built', status: 'Upcoming' }
        ]
      },
      {
        phaseName: '2. DESIGN PHASE',
        status: 'Upcoming',
        items: [
          { id: 'c5', title: 'UI/UX layout planning', owner: 'Dream Built', status: 'Upcoming' },
          { id: 'c6', title: 'Selecting modern typography and visual elements', owner: 'Dream Built', status: 'Upcoming' },
          { id: 'c7', title: 'Designing custom UI components (metallic gold gradients, glow effects)', owner: 'Dream Built', status: 'Upcoming' },
          { id: 'c8', title: 'Drafting localized copy and service structures', owner: 'Dream Built', status: 'Upcoming' }
        ]
      },
      {
        phaseName: '3. BUILD PHASE',
        status: 'Upcoming',
        items: [
          { id: 'c9', title: 'Developing HTML structure and semantic markup', owner: 'Dream Built', status: 'Upcoming' },
          { id: 'c10', title: 'Implementing CSS styling and responsive mobile layouts', owner: 'Dream Built', status: 'Upcoming' },
          { id: 'c11', title: 'Refining package features, monthly structures, and pricing models', owner: 'Dream Built', status: 'Upcoming' },
          { id: 'c12', title: 'Adding social media links (LinkedIn, Instagram, TikTok)', owner: 'Dream Built', status: 'Upcoming' },
          { id: 'c13', title: 'Finalizing interactive elements and form functionality', owner: 'Dream Built', status: 'Upcoming' }
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
  }
}

function loadPortalState() {
  const savedSession = localStorage.getItem('dreambuilt_portal_session');
  if (savedSession) {
    try {
      const sess = JSON.parse(savedSession);
      if (sess && sess.email) {
        userSession = sess;
        mockClientState.client.businessName = sess.company || 'Client Workspace';
        mockClientState.client.contactName = sess.name || 'Client Contact';
        mockClientState.client.email = sess.email;
      }
    } catch(e) {}
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
        let p = null;
        if (userSession && userSession.email) {
          p = parsed.projects.find(x => 
            (x.clientEmail && x.clientEmail.toLowerCase() === userSession.email.toLowerCase()) || 
            (x.email && x.email.toLowerCase() === userSession.email.toLowerCase()) ||
            (x.client && x.client.toLowerCase() === userSession.company.toLowerCase())
          );
        }
        
        if (!p && !userSession) {
          p = null;
        }

        if (p) {
          if (!userSession) {
            mockClientState.client.businessName = p.client || p.business_name || 'Client Business';
            mockClientState.client.contactName = p.contact || p.contact_name || 'Client Contact';
            mockClientState.client.email = p.clientEmail || p.email || '';
            mockClientState.client.password = p.clientPassword || p.password || '';
          }

          mockClientState.project.id = p.id || `prj-${Date.now()}`;
          mockClientState.project.name = p.name || p.project_name || 'Client Website';
          mockClientState.project.currentPhase = p.currentPhase || p.current_phase || 'Build';
          mockClientState.project.progress = p.progress || p.progress_pct || 0;
          mockClientState.project.targetLaunchDate = p.targetLaunch || p.target_launch_date || 'Upcoming';
          mockClientState.project.status = p.status || 'Active';

          mockClientState.actionItems = Array.isArray(p.actionItems) ? p.actionItems.map(item => ({
            id: item.id || `act-${Date.now()}`,
            title: item.title,
            description: item.description || item.desc || '',
            dueDate: item.dueDate || item.due_date || 'Soon',
            actionType: item.actionType || item.action_type || 'upload_file',
            ctaText: item.ctaText || item.cta_text || 'ACTION REQUIRED',
            completed: !!item.completed
          })) : [];

          if (p.checklistPhases && Array.isArray(p.checklistPhases) && p.checklistPhases.length > 0) {
            mockClientState.checklistPhases = p.checklistPhases;
          } else {
            ensureProjectChecklist(mockClientState);
          }

          mockClientState.pages = Array.isArray(p.pages) ? p.pages.map(pg => {
            const imgUrl = pg.image || pg.screenshotUrl || pg.screenshot_url || '/images/card-01-custom-design.jpg';
            const isVid = pg.isVideo || window.isVideoUrl(imgUrl);
            return {
              id: pg.id || `pg-${Date.now()}`,
              name: pg.title || pg.name || 'Website Page',
              slug: `/${(pg.title || pg.name || 'page').toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              status: pg.status || 'Ready for Review',
              version: pg.version || 'v1.0',
              screenshotUrl: imgUrl,
              isVideo: isVid,
              notes: pg.notes || (isVid ? 'Video walkthrough ready for review.' : `Version ${pg.version || 'v1.0'}`)
            };
          }) : [];

          mockClientState.feedbackItems = Array.isArray(p.feedback) ? p.feedback.map(f => ({
            id: f.id,
            title: f.title,
            page: f.page,
            section: f.section || 'Revision Request',
            desc: f.desc || f.comment || '',
            priority: f.priority,
            status: f.status
          })) : [];

          mockClientState.messages = Array.isArray(p.messages) ? p.messages : [];

          mockClientState.files = Array.isArray(p.assets) ? p.assets.map(a => ({
            id: a.id,
            name: a.name,
            category: a.type || a.category,
            size: a.size,
            uploadDate: a.date || a.uploadDate
          })) : [];
        }
      }
    } catch (e) {
      console.error('Failed loading portal state:', e);
    }
  }

  if (userSession) {
    if (userSession.company) mockClientState.client.businessName = userSession.company;
    if (userSession.name) mockClientState.client.contactName = userSession.name;
    if (userSession.email) mockClientState.client.email = userSession.email;
  }

  ensureProjectChecklist(mockClientState);
}

async function fetchSupabaseData() {
  if (!supabase) return;
  try {
    const [
      { data: projects, error },
      { data: dbClients },
      { data: chkData },
      { data: dbActions },
      { data: dbPages },
      { data: dbFeedback },
      { data: dbMessages },
      { data: dbAssets }
    ] = await Promise.all([
      supabase.from('projects').select('*'),
      supabase.from('clients').select('*'),
      supabase.from('project_checklist_items').select('*'),
      supabase.from('action_items').select('*'),
      supabase.from('website_pages').select('*'),
      supabase.from('feedback_items').select('*'),
      supabase.from('messages').select('*').order('created_at', { ascending: true }),
      supabase.from('project_assets').select('*')
    ]);

    if (userSession && userSession.email) {
      mockClientState.client.email = userSession.email;
      mockClientState.client.contactName = userSession.name;
      mockClientState.client.businessName = userSession.company;

      const matchingClient = dbClients ? dbClients.find(c => c.email.toLowerCase() === userSession.email.toLowerCase()) : null;
      if (matchingClient) {
        mockClientState.client.businessName = matchingClient.business_name || userSession.company;
        mockClientState.client.contactName = matchingClient.contact_name || userSession.name;
        mockClientState.client.email = matchingClient.email || userSession.email;
        userSession.name = mockClientState.client.contactName;
        userSession.company = mockClientState.client.businessName;
        localStorage.setItem('dreambuilt_portal_session', JSON.stringify(userSession));
      }

      let p = null;
      if (!error && projects && projects.length > 0) {
        if (matchingClient) {
          p = projects.find(x => x.client_id === matchingClient.id);
        }
        if (!p) {
          p = projects.find(x => 
            x.client_email && x.client_email.toLowerCase() === userSession.email.toLowerCase()
          );
        }
      }

      if (p) {
        mockClientState.project.id = p.id;
        mockClientState.project.name = p.project_name;
        mockClientState.project.currentPhase = p.current_phase || 'Build';
        mockClientState.project.progress = p.progress_pct || 50;
        mockClientState.project.targetLaunchDate = p.target_launch_date || 'Upcoming';
        mockClientState.project.status = p.status || 'Active';

        const prjActions = dbActions ? dbActions.filter(a => a.project_id === p.id) : [];
        if (prjActions.length > 0) {
          mockClientState.actionItems = prjActions.map(a => ({
            id: a.id,
            title: a.title,
            description: a.description || '',
            dueDate: a.due_date || 'Soon',
            actionType: a.action_type || 'upload_file',
            ctaText: 'ACTION REQUIRED',
            completed: !!a.completed
          }));
        }

        const prjPages = dbPages ? dbPages.filter(pg => pg.project_id === p.id) : [];
        if (prjPages.length > 0) {
          mockClientState.pages = prjPages.map(pg => {
            const imgUrl = pg.image || pg.screenshot_url || '/images/card-01-custom-design.jpg';
            return {
              id: pg.id,
              name: pg.title,
              slug: `/${pg.title.toLowerCase().replace(/ /g, '-')}`,
              status: pg.status || 'Ready for Review',
              version: pg.version || 'v1.0',
              screenshotUrl: imgUrl,
              notes: pg.notes || `Version ${pg.version || 'v1.0'}`
            };
          });
        }

        const prjFb = dbFeedback ? dbFeedback.filter(f => f.project_id === p.id) : [];
        mockClientState.feedbackItems = prjFb.map(f => ({
          id: f.id,
          title: f.title || 'Revision Request',
          page: f.page_title,
          page_title: f.page_title,
          section: f.section || 'Design Screenshot',
          desc: f.comment,
          comment: f.comment,
          priority: f.priority || 'Normal',
          status: f.status || 'Submitted'
        }));

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

        const standardPhases = [
          '1. INTAKE & DISCOVERY',
          '2. DESIGN PHASE',
          '3. BUILD PHASE',
          '4. REVIEW PHASE',
          '5. LAUNCH PHASE'
        ];

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

        if (chkData && chkData.length > 0) {
          const projChecklist = chkData.filter(c => c.project_id === p.id);
          if (projChecklist.length > 0) {
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
                  owner: item.owner || 'Dream Built',
                  status: item.status || 'Upcoming'
                });
              }
            });

            mockClientState.checklistPhases = standardPhases.map(phaseName => {
              const items = (phasesMap[phaseName] || []).sort((a, b) => {
                const idxA = defaultTaskOrder.indexOf(a.title);
                const idxB = defaultTaskOrder.indexOf(b.title);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                return 0;
              });

              return {
                phaseName: phaseName,
                status: (items.length > 0 && items.every(i => i.status === 'Completed')) ? 'Completed' : 'In Progress',
                items: items
              };
            }).filter(ph => ph.items.length > 0);
          }
        }
      }
    }

    renderAllViews();

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

  let pIndex = projects.findIndex(x => 
    (mockClientState.project.id && x.id === mockClientState.project.id) ||
    (mockClientState.client.email && x.clientEmail && x.clientEmail.toLowerCase() === mockClientState.client.email.toLowerCase())
  );

  let p = pIndex >= 0 ? projects[pIndex] : null;

  if (!p) {
    p = { id: mockClientState.project.id || `prj-${Date.now()}` };
    projects.push(p);
  }

  p.client = mockClientState.client.businessName;
  p.contact = mockClientState.client.contactName;
  p.clientEmail = mockClientState.client.email;
  p.clientPassword = mockClientState.client.password;
  p.name = mockClientState.project.name;
  p.currentPhase = mockClientState.project.currentPhase;
  p.progress = mockClientState.project.progress;
  p.targetLaunch = mockClientState.project.targetLaunchDate;
  p.status = mockClientState.project.status;
  p.actionItems = mockClientState.actionItems;
  p.checklistPhases = mockClientState.checklistPhases;
  p.messages = mockClientState.messages;
  p.pages = mockClientState.pages;
  p.feedback = mockClientState.feedbackItems;
  p.assets = mockClientState.files;

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

  // Restore session on browser refresh
  const savedSession = localStorage.getItem('dreambuilt_portal_session');
  if (savedSession) {
    try {
      userSession = JSON.parse(savedSession);
      const authContainer = document.getElementById('auth-container');
      const wsContainer = document.getElementById('workspace-container');
      if (authContainer) authContainer.style.display = 'none';
      if (wsContainer) wsContainer.style.display = 'block';

      updateHeaderUIState(true);
      renderAllViews();
    } catch (e) {}
  } else {
    updateHeaderUIState(false);
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('login-email');
      const passInput = document.getElementById('login-password');

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passInput ? passInput.value.trim() : '';

      if (!email || !password) {
        alert('Please enter both email and password.');
        return;
      }

      let matchedClient = null;
      let matchedLocalProject = null;

      if (supabase) {
        try {
          const { data: clients } = await supabase.from('clients').select('*');
          if (clients && clients.length > 0) {
            matchedClient = clients.find(c => c.email.toLowerCase() === email.toLowerCase());
          }
        } catch (err) {
          console.error('Portal client authentication error:', err);
        }
      }

      if (!matchedClient) {
        try {
          const savedApp = localStorage.getItem('dreambuilt_app_state_v1');
          if (savedApp) {
            const parsedApp = JSON.parse(savedApp);
            if (parsedApp && Array.isArray(parsedApp.projects)) {
              matchedLocalProject = parsedApp.projects.find(p => 
                (p.clientEmail && p.clientEmail.toLowerCase() === email.toLowerCase()) || 
                (p.email && p.email.toLowerCase() === email.toLowerCase()) ||
                (p.client && p.client.toLowerCase() === email.toLowerCase().split('@')[0])
              );
            }
          }
        } catch (err) {}
      }

      // Reject if account was deleted or does not exist
      if (!matchedClient && !matchedLocalProject) {
        alert(`❌ Account Not Found: No active client workspace exists for '${email}'. Please contact Dream Built Studios or verify your login credentials.`);
        return;
      }

      // Verify password
      const expectedPassword = matchedClient 
        ? matchedClient.password_hash 
        : (matchedLocalProject ? (matchedLocalProject.clientPassword || matchedLocalProject.password || 'demo1234') : 'demo1234');

      if (expectedPassword && expectedPassword !== password) {
        alert(`❌ Incorrect password for ${email}. Please use the login password configured in the Admin Command Center.`);
        return;
      }

      userSession = {
        email: email,
        name: matchedClient ? (matchedClient.contact_name || matchedClient.business_name) : (matchedLocalProject ? (matchedLocalProject.contact || matchedLocalProject.client) : 'Decipher Client'),
        company: matchedClient ? matchedClient.business_name : (matchedLocalProject ? (matchedLocalProject.client || matchedLocalProject.name) : 'Decipher Workspace'),
        clientId: matchedClient ? matchedClient.id : (matchedLocalProject ? matchedLocalProject.id : null)
      };

      localStorage.setItem('dreambuilt_portal_session', JSON.stringify(userSession));

      mockClientState.client.contactName = userSession.name;
      mockClientState.client.businessName = userSession.company;
      mockClientState.client.email = userSession.email;

      document.getElementById('auth-container').style.display = 'none';
      document.getElementById('workspace-container').style.display = 'block';

      updateHeaderUIState(true);
      await fetchSupabaseData();
      renderAllViews();
    });
  }

  const btnSignOut = document.getElementById('btn-sign-out');
  const btnPopoverSignOut = document.getElementById('btn-popover-signout');

  if (btnSignOut) {
    btnSignOut.addEventListener('click', window.performPortalSignOut);
  }
  if (btnPopoverSignOut) {
    btnPopoverSignOut.addEventListener('click', (e) => {
      e.stopPropagation();
      window.performPortalSignOut();
    });
  }
}

window.performPortalSignOut = function() {
  userSession = null;
  localStorage.removeItem('dreambuilt_portal_session');
  
  mockClientState.client = { businessName: '', contactName: '', email: '' };
  mockClientState.project = { name: '', currentPhase: 'Intake', progress: 0, targetLaunchDate: 'Upcoming', nextMilestone: 'Initial Review', status: 'Active', previewUrl: '' };
  mockClientState.actionItems = [];
  mockClientState.pages = [];
  mockClientState.feedbackItems = [];
  mockClientState.files = [];
  mockClientState.messages = [];

  const wsContainer = document.getElementById('workspace-container');
  const authContainer = document.getElementById('auth-container');
  if (wsContainer) wsContainer.style.display = 'none';
  if (authContainer) authContainer.style.display = 'block';

  const userPopover = document.getElementById('user-profile-popover');
  if (userPopover) userPopover.style.display = 'none';

  updateHeaderUIState(false);
};

window.toggleFloatingChatWidget = function() {
  const widget = document.getElementById('floating-chat-widget');
  const fab = document.getElementById('floating-chat-button');
  if (!widget) return;
  const isHidden = widget.style.display === 'none' || !widget.style.display;
  if (isHidden) {
    widget.style.display = 'flex';
    if (fab) fab.classList.remove('chat-shake-alert');
    renderMessages();
    const input = document.getElementById('msg-input');
    if (input) input.focus();
  } else {
    widget.style.display = 'none';
  }
};

window.triggerChatShakeAlert = function() {
  const fab = document.getElementById('floating-chat-button');
  const widget = document.getElementById('floating-chat-widget');
  if (fab && (!widget || widget.style.display === 'none' || !widget.style.display)) {
    fab.classList.add('chat-shake-alert');
  }
};

function updateHeaderUIState(isLoggedIn) {
  const bizNameEl = document.getElementById('client-business-name');
  const userInfoEl = document.getElementById('portal-header-user-info');
  const signOutBtn = document.getElementById('btn-sign-out');
  const loggedOutBadge = document.getElementById('portal-header-loggedout-badge');

  const chatFab = document.getElementById('floating-chat-button');
  const chatWidget = document.getElementById('floating-chat-widget');
  const notifBtn = document.getElementById('btn-notifications-toggle');
  const notifPopover = document.getElementById('user-notifications-popover');

  if (isLoggedIn) {
    const bizName = (userSession && userSession.company) || mockClientState.client.businessName || '';
    const prjName = (mockClientState.project && mockClientState.project.name) ? mockClientState.project.name : '';
    const badgeTitle = bizName 
      ? (bizName.toLowerCase().includes('workspace') ? bizName : `${bizName} Workspace`) 
      : (prjName ? (prjName.toLowerCase().includes('workspace') ? prjName : `${prjName} Workspace`) : 'Client Workspace');

    if (bizNameEl) {
      bizNameEl.textContent = badgeTitle;
      bizNameEl.style.display = 'inline-block';
    }
    if (userInfoEl) userInfoEl.style.display = 'flex';
    if (signOutBtn) signOutBtn.style.display = 'none';
    if (loggedOutBadge) loggedOutBadge.style.display = 'none';
    if (chatFab) {
      chatFab.style.display = 'block';
      chatFab.classList.add('chat-shake-alert');
    }
    if (notifBtn) notifBtn.style.display = 'block';
    renderNotifications();
  } else {
    if (bizNameEl) bizNameEl.style.display = 'none';
    if (userInfoEl) userInfoEl.style.display = 'none';
    if (signOutBtn) signOutBtn.style.display = 'none';
    if (loggedOutBadge) loggedOutBadge.style.display = 'inline-block';
    if (chatFab) {
      chatFab.style.display = 'none';
      chatFab.classList.remove('chat-shake-alert');
    }
    if (chatWidget) chatWidget.style.display = 'none';
    if (notifBtn) notifBtn.style.display = 'none';
    if (notifPopover) notifPopover.style.display = 'none';
    const userPopover = document.getElementById('user-profile-popover');
    if (userPopover) userPopover.style.display = 'none';
  }
}

window.toggleNotificationsPopover = function() {
  const popover = document.getElementById('user-notifications-popover');
  const userPopover = document.getElementById('user-profile-popover');
  if (!popover) return;
  const isHidden = popover.style.display === 'none' || !popover.style.display;
  if (isHidden) {
    if (userPopover) userPopover.style.display = 'none';
    renderNotifications();
    popover.style.display = 'block';
  } else {
    popover.style.display = 'none';
  }
};

let dismissedNotificationIds = new Set(JSON.parse(localStorage.getItem('dreambuilt_dismissed_notifs') || '[]'));

window.dismissNotification = function(notifId, actionType) {
  dismissedNotificationIds.add(notifId);
  localStorage.setItem('dreambuilt_dismissed_notifs', JSON.stringify(Array.from(dismissedNotificationIds)));
  
  const popover = document.getElementById('user-notifications-popover');
  if (popover) popover.style.display = 'none';

  if (actionType === 'chat' && typeof window.toggleFloatingChatWidget === 'function') {
    window.toggleFloatingChatWidget();
  } else if (actionType === 'pages') {
    const pagesBtn = document.querySelector('.portal-tab-btn[data-tab="pages"]');
    if (pagesBtn) pagesBtn.click();
  } else if (actionType === 'checklist') {
    const chkBtn = document.querySelector('.portal-tab-btn[data-tab="checklist"]');
    if (chkBtn) chkBtn.click();
  }

  renderNotifications();
};

window.clearNotifications = function() {
  const currentNotifs = getActiveNotifications();
  currentNotifs.forEach(n => dismissedNotificationIds.add(n.id));
  localStorage.setItem('dreambuilt_dismissed_notifs', JSON.stringify(Array.from(dismissedNotificationIds)));
  renderNotifications();
};

function getActiveNotifications() {
  const allNotifs = [
    { id: 'notif-1', actionType: 'chat', icon: '💬', title: 'New Message from Dream Built', time: '10m ago', desc: 'Welcome! Your project workspace is live. Click to view live chat.' },
    { id: 'notif-2', actionType: 'pages', icon: '🖼️', title: 'Website Screenshot Uploaded', time: '1h ago', desc: 'Home Page v1.0 mockup is ready for inspection. Click to view.' },
    { id: 'notif-3', actionType: 'checklist', icon: '✅', title: 'Milestone Completed', time: '2h ago', desc: 'Phase 1 Intake & Discovery requirements aligned. Click to view roadmap.' }
  ];

  return allNotifs.filter(n => !dismissedNotificationIds.has(n.id));
}

function renderNotifications() {
  const listEl = document.getElementById('notifications-list');
  const badgeEl = document.getElementById('notifications-badge-count');
  if (!listEl) return;

  const activeNotifs = getActiveNotifications();

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
        <div style="color: #ffffff; font-weight: 700; margin-bottom: 0.2rem;">All Notifications Caught Up!</div>
        <div>No unread notifications at this time.</div>
      </div>
    `;
    return;
  }

  listEl.innerHTML = activeNotifs.map(n => `
    <div onclick="dismissNotification('${n.id}', '${n.actionType}')" style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 0.75rem 0.85rem; border-radius: 8px; font-size: 0.825rem; cursor: pointer; transition: all 0.2s ease; position: relative;" title="Click to open & dismiss">
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

function renderFeedback() {}
function renderFiles() {}

function renderMessages() {
  const container = document.getElementById('messages-list');
  if (!container) return;

  if (!mockClientState.messages || mockClientState.messages.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-secondary); padding: 3rem 1rem;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💬</div>
        <p style="margin: 0; font-weight: 600; color: #ffffff;">No messages in project workspace chat yet.</p>
        <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem;">Type a message below to communicate directly with Dream Built Studios.</p>
      </div>
    `;
    return;
  }

  const currentUser = (userSession && userSession.name) ? userSession.name.toLowerCase() : '';

  container.innerHTML = mockClientState.messages.map(msg => {
    const isMe = msg.sender.toLowerCase().includes('client') ||
                 (currentUser && msg.sender.toLowerCase() === currentUser);

    return `
      <div style="display: flex; flex-direction: column; align-items: ${isMe ? 'flex-end' : 'flex-start'}; margin-bottom: 0.5rem;">
        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
          ${escapeHtml(msg.sender)} • ${escapeHtml(msg.time || '')}
        </div>
        <div style="max-width: 75%; padding: 0.85rem 1.15rem; border-radius: 12px; font-size: 0.95rem; line-height: 1.4; ${
          isMe
            ? 'background: linear-gradient(135deg, #0066ff, #00f0ff); color: #000000; font-weight: 600; border-bottom-right-radius: 2px;'
            : 'background: rgba(255,255,255,0.08); color: #ffffff; border: 1px solid rgba(255,255,255,0.1); border-bottom-left-radius: 2px;'
        }">
          ${escapeHtml(msg.text)}
        </div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

// 3. RENDER ALL VIEWS
function renderAllViews() {
  renderUserAvatarUI();
  if (typeof renderOverview === 'function') renderOverview();
  if (typeof renderPages === 'function') renderPages();
  if (typeof renderFeedback === 'function') renderFeedback();
  if (typeof renderFiles === 'function') renderFiles();
  if (typeof renderMessages === 'function') renderMessages();
  if (typeof renderChecklist === 'function') renderChecklist();
  if (typeof window.savePortalState === 'function') window.savePortalState();
}

function renderUserAvatarUI() {
  const avatarEl = document.getElementById('user-avatar-initials');
  const nameEl = document.getElementById('user-display-name');
  const bizNameEl = document.getElementById('client-business-name');

  const popoverAvatar = document.getElementById('popover-avatar-circle');
  const popoverName = document.getElementById('popover-user-name');
  const popoverEmail = document.getElementById('popover-user-email');
  const popoverCompany = document.getElementById('popover-user-company');

  const contactName = (userSession && userSession.name) || mockClientState.client.contactName || 'Client Contact';
  const bizName = (userSession && userSession.company) || mockClientState.client.businessName || '';
  const email = (userSession && userSession.email) || mockClientState.client.email || '';
  const avatarUrl = mockClientState.client.avatarUrl;

  const prjName = (mockClientState.project && mockClientState.project.name) ? mockClientState.project.name : '';
  const badgeTitle = bizName 
    ? (bizName.toLowerCase().includes('workspace') ? bizName : `${bizName} Workspace`) 
    : (prjName ? (prjName.toLowerCase().includes('workspace') ? prjName : `${prjName} Workspace`) : 'Client Workspace');

  if (nameEl) nameEl.textContent = contactName;
  if (bizNameEl) bizNameEl.textContent = badgeTitle;

  if (popoverName) popoverName.textContent = contactName;
  if (popoverEmail) popoverEmail.textContent = email;
  if (popoverCompany) popoverCompany.textContent = bizName ? `${bizName}` : 'Client Workspace';

  const initials = contactName
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .substring(0, 2) || '--';

  if (avatarEl) {
    if (avatarUrl) {
      avatarEl.innerHTML = `<img src="${avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;
    } else {
      avatarEl.textContent = initials;
    }
  }

  if (popoverAvatar) {
    if (avatarUrl) {
      popoverAvatar.innerHTML = `<img src="${avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />`;
    } else {
      popoverAvatar.textContent = initials;
    }
  }
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

  // Sync Target Launch Date dynamically from Admin
  const launchDateEl = document.getElementById('health-launch-date');
  if (launchDateEl && mockClientState.project.targetLaunchDate) {
    launchDateEl.textContent = mockClientState.project.targetLaunchDate;
  }

  // Sync Lifecycle Stepper Phase dynamically from Admin
  const stepperContainer = document.getElementById('lifecycle-stepper');
  if (stepperContainer && mockClientState.project.currentPhase) {
    const phases = ['Dream', 'Design', 'Build', 'Review', 'Launch'];
    const currentPhaseUpper = mockClientState.project.currentPhase.toUpperCase();
    const currentIdx = phases.findIndex(p => p.toUpperCase() === currentPhaseUpper);
    const validIdx = currentIdx !== -1 ? currentIdx : 2;

    stepperContainer.innerHTML = phases.map((phaseName, i) => {
      let isCompleted = i < validIdx;
      let isCurrent = i === validIdx;
      return `
        <div class="step-node ${isCurrent ? 'current' : isCompleted ? 'completed' : ''}">
          <div class="step-circle">${isCompleted ? '✓' : isCurrent ? '●' : '○'}</div>
          <div class="step-label">${phaseName.toUpperCase()}</div>
        </div>
      `;
    }).join('');
  }

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
            <div class="attention-card-desc">${escapeHtml(action.description || '')}</div>
          </div>
          <span class="status-badge changes-requested">Due ${escapeHtml(action.dueDate || 'Soon')}</span>
        </div>
      </div>
    `).join('');
  }
}

window.handleActionClick = function(actionId, actionType) {
  const action = mockClientState.actionItems.find(a => a.id === actionId);
  if (action) {
    if (actionType === 'review_page') {
      window.switchPortalTab('pages');
    } else if (actionType === 'approve_milestone' || actionType === 'checklist') {
      window.switchPortalTab('roadmap');
    } else if (actionType === 'upload_file') {
      window.switchPortalTab('vault');
    } else {
      action.completed = true;
      if (typeof savePortalState === 'function') savePortalState();
      renderOverview();
    }
  }
};

// RENDER PAGES
function renderPages() {
  const pagesContainer = document.getElementById('pages-grid-container');
  if (!pagesContainer) return;

  if (!mockClientState.pages || mockClientState.pages.length === 0) {
    pagesContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: rgba(0,0,0,0.2); border: 1px dashed var(--color-royal-blue); border-radius: var(--radius-md);">
        <div style="font-size: 2.25rem; margin-bottom: 0.5rem;">🖼️</div>
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1.15rem; color: #ffffff;">NO WEBSITE PAGE SCREENSHOTS YET</h4>
        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">Your project manager will upload website page design mockups here for your review.</p>
      </div>
    `;
    return;
  }

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
        <div style="aspect-ratio: 16 / 9; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--color-royal-blue); margin-bottom: 0.85rem; cursor: pointer; position: relative;" onclick="openScreenshotLightbox('${page.screenshotUrl}', '${escapeHtml(page.name)} Design Screenshot', '${escapeHtml(page.name)}')">
          <img src="${page.screenshotUrl}" alt="${escapeHtml(page.name)} Screenshot" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
          <div style="position: absolute; bottom: 0.4rem; right: 0.4rem; background: rgba(0,0,0,0.85); color: #fff; padding: 0.2rem 0.5rem; border-radius: 8px; font-size: 0.7rem; font-weight: 700;">
            🔍 View & Add Notes
          </div>
        </div>

        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4;">${escapeHtml(page.notes)}</p>
      </div>

      <div class="page-card-actions">
        <button class="attention-cta-btn" style="flex: 1; justify-content: center; font-size: 0.8rem; padding: 0.5rem;" onclick="openScreenshotLightbox('${page.screenshotUrl}', '${escapeHtml(page.name)} Design Screenshot', '${escapeHtml(page.name)}')">
          VIEW & ADD NOTES 🖼️
        </button>
        <button class="attention-cta-btn" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2);" onclick="openPageWorkspace('${page.id}')">
          INSPECT
        </button>
      </div>
    </div>
  `).join('');
}

let currentActiveLightboxPage = null;

window.openScreenshotLightbox = function(imgUrl, caption, pageName) {
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');

  if (lightboxImg) {
    lightboxImg.src = imgUrl;
    lightboxImg.style.transform = 'scale(1)';
    lightboxImg.dataset.zoomed = 'false';
  }
  if (lightboxCaption) lightboxCaption.textContent = caption || 'Page Design Screenshot';

  const searchName = pageName || (caption || '').replace(' Design Screenshot', '').replace(' Full Design Screenshot', '').replace(' Design Overview', '').trim();
  const foundPage = mockClientState.pages.find(p => p.name.toLowerCase() === searchName.toLowerCase() || p.id === searchName) || mockClientState.pages[0];
  currentActiveLightboxPage = foundPage;

  renderLightboxNotes(foundPage);
  openModal('modal-screenshot-lightbox');
};

window.toggleLightboxZoom = function() {
  const lightboxImg = document.getElementById('lightbox-img');
  if (!lightboxImg) return;

  const isZoomed = lightboxImg.dataset.zoomed === 'true';
  if (isZoomed) {
    lightboxImg.style.transform = 'scale(1)';
    lightboxImg.style.cursor = 'zoom-in';
    lightboxImg.dataset.zoomed = 'false';
  } else {
    lightboxImg.style.transform = 'scale(1.5)';
    lightboxImg.style.cursor = 'zoom-out';
    lightboxImg.dataset.zoomed = 'true';
  }
};

function renderLightboxNotes(page) {
  const container = document.getElementById('lightbox-notes-list');
  if (!container) return;

  const pageNotes = [];

  if (page && page.notes) {
    const lines = page.notes.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    lines.forEach(l => {
      let sender = 'Page Note';
      let text = l;
      if (l.includes(':')) {
        const parts = l.split(':');
        sender = parts[0].replace('[', '').replace(']', '').trim();
        text = parts.slice(1).join(':').trim();
      }
      pageNotes.push({
        sender: sender,
        time: page.version || 'v1.0',
        text: text
      });
    });
  }

  if (mockClientState.feedbackItems && page) {
    const targetName = (page.name || '').toLowerCase().trim();
    const fbItems = mockClientState.feedbackItems.filter(f => {
      const fPage = (f.page || f.page_title || '').toLowerCase().trim();
      return fPage === targetName || fPage.includes(targetName) || targetName.includes(fPage);
    });

    fbItems.forEach(f => {
      const text = f.desc || f.comment;
      if (text && !pageNotes.some(n => n.text === text)) {
        pageNotes.push({
          sender: f.title || 'Revision Note',
          time: f.status || 'Submitted',
          text: text
        });
      }
    });
  }

  if (pageNotes.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: center; padding: 1.5rem 0.5rem; background: rgba(0,0,0,0.3); border-radius: 8px;">
        No notes or revision comments for this mockup yet.<br/>Type a note below to add one!
      </div>
    `;
    return;
  }

  container.innerHTML = pageNotes.map(n => `
    <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 0.65rem 0.85rem; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 800; color: #0088ff; margin-bottom: 0.25rem;">
        <span>${escapeHtml(n.sender)}</span>
        <span style="color: var(--text-secondary);">${escapeHtml(n.time)}</span>
      </div>
      <div style="font-size: 0.85rem; color: #ffffff; line-height: 1.35;">${escapeHtml(n.text)}</div>
    </div>
  `).join('');

  container.scrollTop = container.scrollHeight;
}

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
      page.notes = `Approved by Decipher Client on ${new Date().toLocaleDateString()}`;
      
      // Complete associated action item
      mockClientState.actionItems.forEach(item => {
        if (item.targetPage === page.name) item.completed = true;
      });

      mockClientState.activityLog.unshift({
        id: `a-${Date.now()}`,
        time: 'Just now',
        text: `Decipher Client formally approved ${page.name}.`
      });

      closeModal('modal-page-workspace');
      renderAllViews();
      alert(`✓ ${page.name} has been formally approved!`);
    };
  }

  openModal('modal-page-workspace');
};

// MODALS AND FORMS
window.openProfileSettingsModal = function() {
  const contactName = (userSession && userSession.name) || mockClientState.client.contactName || 'Decipher Client';
  const bizName = (userSession && userSession.company) || mockClientState.client.businessName || 'Decipher Inc.';
  const email = (userSession && userSession.email) || mockClientState.client.email || 'decipher@portal.dbstudios.com';
  const avatarUrl = mockClientState.client.avatarUrl;

  const modalNameEl = document.getElementById('profile-modal-user-name');
  const modalEmailEl = document.getElementById('profile-modal-user-email');
  const contactInput = document.getElementById('profile-contact-name');
  const bizInput = document.getElementById('profile-business-name');
  const avatarPreview = document.getElementById('profile-modal-avatar-preview');

  if (modalNameEl) modalNameEl.textContent = contactName;
  if (modalEmailEl) modalEmailEl.textContent = email;
  if (contactInput) contactInput.value = contactName;
  if (bizInput) bizInput.value = bizName;

  if (avatarPreview) {
    if (avatarUrl) {
      avatarPreview.innerHTML = `<img src="${avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />`;
    } else {
      const initials = contactName.trim().split(/\s+/).map(n => n[0]).filter(Boolean).join('').toUpperCase().substring(0, 2) || 'DC';
      avatarPreview.textContent = initials;
    }
  }

  const passNew = document.getElementById('profile-new-password');
  const passConfirm = document.getElementById('profile-confirm-password');
  if (passNew) passNew.value = '';
  if (passConfirm) passConfirm.value = '';

  openModal('modal-profile-settings');
};

window.toggleUserProfilePopover = function() {
  const popover = document.getElementById('user-profile-popover');
  if (!popover) return;
  const isHidden = popover.style.display === 'none' || !popover.style.display;
  if (isHidden) {
    renderUserAvatarUI();
    popover.style.display = 'block';
  } else {
    popover.style.display = 'none';
  }
};

function initFormsAndModals() {
  const userHeaderEl = document.getElementById('portal-header-user-info');
  const userAvatarEl = document.getElementById('user-avatar-initials');
  const userNameEl = document.getElementById('user-display-name');

  [userHeaderEl, userAvatarEl, userNameEl].forEach(el => {
    if (el) {
      el.style.cursor = 'pointer';
      el.onclick = function(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        window.toggleUserProfilePopover();
      };
    }
  });

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

  initMessageFormListeners();

  document.addEventListener('click', (e) => {
    const popover = document.getElementById('user-profile-popover');
    const headerInfo = document.getElementById('portal-header-user-info');
    if (popover && popover.style.display === 'block') {
      if (!popover.contains(e.target) && !headerInfo.contains(e.target)) {
        popover.style.display = 'none';
      }
    }
  });

  const popoverAvatarInput = document.getElementById('popover-avatar-file-input');
  if (popoverAvatarInput) {
    popoverAvatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target.result;
          mockClientState.client.avatarUrl = dataUrl;
          renderUserAvatarUI();
          window.savePortalState();

          if (supabase && mockClientState.client.email) {
            supabase.from('clients').update({ avatar_url: dataUrl }).eq('email', mockClientState.client.email).then(() => {});
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const btnPopoverChangePass = document.getElementById('btn-popover-change-pass');
  const passBox = document.getElementById('popover-password-box');
  if (btnPopoverChangePass && passBox) {
    btnPopoverChangePass.addEventListener('click', (e) => {
      e.stopPropagation();
      const isBoxHidden = passBox.style.display === 'none' || !passBox.style.display;
      passBox.style.display = isBoxHidden ? 'block' : 'none';
    });
  }

  const btnSavePopoverPass = document.getElementById('btn-save-popover-pass');
  if (btnSavePopoverPass) {
    btnSavePopoverPass.addEventListener('click', (e) => {
      e.stopPropagation();
      const newPass = (document.getElementById('popover-new-pass').value || '').trim();
      const confirmPass = (document.getElementById('popover-confirm-pass').value || '').trim();

      if (!newPass || !confirmPass) {
        alert('Please fill out both password fields.');
        return;
      }

      if (newPass !== confirmPass) {
        alert('❌ Passwords do not match!');
        return;
      }

      mockClientState.client.password = newPass;
      window.savePortalState();
      document.getElementById('popover-new-pass').value = '';
      document.getElementById('popover-confirm-pass').value = '';
      if (passBox) passBox.style.display = 'none';
      alert('✓ Password updated successfully!');

      if (supabase && mockClientState.client.email) {
        supabase.from('clients').update({ password_hash: newPass }).eq('email', mockClientState.client.email).then(() => {});
      }
    });
  }

  const btnPopoverSignOut = document.getElementById('btn-popover-signout');
  if (btnPopoverSignOut) {
    btnPopoverSignOut.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof window.performPortalSignOut === 'function') {
        window.performPortalSignOut();
      }
    });
  }

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
        text: `Decipher Client submitted revision request: ${title}`
      });

      const newFbId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `f-${Date.now()}`;
      const newFbItem = {
        id: newFbId,
        title,
        page,
        section,
        desc,
        priority,
        status: 'Submitted'
      };

      if (!mockClientState.feedbackItems) mockClientState.feedbackItems = [];
      mockClientState.feedbackItems.unshift(newFbItem);

      closeModal('modal-request-change');
      formRequestChange.reset();
      renderAllViews();

      if (supabase && mockClientState.project && mockClientState.project.id) {
        supabase.from('feedback_items').insert([{
          id: newFbId,
          project_id: mockClientState.project.id,
          page_title: page,
          title: title,
          comment: desc,
          priority: priority,
          status: 'Submitted'
        }]).then(({ error }) => {
          if (error) console.error('Customer feedback insert error:', error);
        });
      }

      alert('✓ Your revision request has been submitted to Dream Built!');
    });
  }

  const formAddNote = document.getElementById('lightbox-add-note-form');
  if (formAddNote) {
    formAddNote.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('lightbox-note-input');
      const text = input ? input.value.trim() : '';
      if (!text || !currentActiveLightboxPage) return;

      const pageName = currentActiveLightboxPage.name;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const noteEntry = `[${timestamp}] Decipher Client: ${text}`;

      currentActiveLightboxPage.notes = currentActiveLightboxPage.notes ? `${currentActiveLightboxPage.notes}\n${noteEntry}` : noteEntry;

      const newFbId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `f-${Date.now()}`;
      const newFbItem = {
        id: newFbId,
        title: 'Mockup Revision Note',
        page: pageName,
        section: 'Design Screenshot',
        desc: text,
        priority: 'Normal',
        status: 'Submitted'
      };

      if (!mockClientState.feedbackItems) mockClientState.feedbackItems = [];
      mockClientState.feedbackItems.unshift(newFbItem);

      if (supabase && mockClientState.project && mockClientState.project.id) {
        supabase.from('feedback_items').insert([{
          id: newFbId,
          project_id: mockClientState.project.id,
          page_title: pageName,
          title: 'Mockup Revision Note',
          comment: text,
          priority: 'Normal',
          status: 'Submitted'
        }]).then(({ error }) => {
          if (error) console.error('Note insert error:', error);
        });

        supabase.from('website_pages').update({ notes: currentActiveLightboxPage.notes }).eq('project_id', mockClientState.project.id).eq('title', pageName).then(({ error }) => {
          if (error) console.error('Page notes update error:', error);
        });
      }

      input.value = '';
      renderLightboxNotes(currentActiveLightboxPage);
      renderAllViews();
    });
  }

window.handlePortalSendMessage = function() {
  const input = document.getElementById('msg-input');
  if (!input) return;
  const text = (input.value || '').trim();
  if (!text) return;

  const sender = mockClientState.client.contactName || 'Client';
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newMsgId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `m-${Date.now()}`;
  const newMsg = {
    id: newMsgId,
    sender: sender,
    text: text,
    time: timeNow
  };

  if (!mockClientState.messages) mockClientState.messages = [];
  mockClientState.messages.push(newMsg);

  input.value = '';
  renderMessages();
  window.savePortalState();

  const projectId = (mockClientState.project && mockClientState.project.id) ? mockClientState.project.id : 'prj-decipher';

  if (supabase && projectId) {
    supabase.from('messages').insert([{
      id: newMsgId,
      project_id: projectId,
      sender_name: sender,
      message_text: text,
      time_formatted: timeNow,
      created_at: new Date().toISOString()
    }]).then(({ error }) => {
      if (error) console.error('Customer chat insert error:', error);
    });
  }
};

function initMessageFormListeners() {
  const btnSendMsg = document.getElementById('btn-send-msg');
  if (btnSendMsg) {
    btnSendMsg.onclick = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      window.handlePortalSendMessage();
    };
  }

  const msgInput = document.getElementById('msg-input');
  if (msgInput) {
    msgInput.onkeydown = function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        window.handlePortalSendMessage();
      }
    };
  }
}

  const btnOpenRequest = document.getElementById('btn-open-request-change');
  if (btnOpenRequest) {
    btnOpenRequest.addEventListener('click', () => openModal('modal-request-change'));
  }

  const avatarInput = document.getElementById('profile-avatar-input');
  if (avatarInput) {
    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target.result;
          mockClientState.client.avatarUrl = dataUrl;

          const preview = document.getElementById('profile-modal-avatar-preview');
          if (preview) {
            preview.innerHTML = `<img src="${dataUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />`;
          }

          renderUserAvatarUI();
          window.savePortalState();

          if (supabase && mockClientState.client.email) {
            supabase.from('clients').update({ avatar_url: dataUrl }).eq('email', mockClientState.client.email).then(() => {});
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const formProfile = document.getElementById('form-profile-settings');
  if (formProfile) {
    formProfile.addEventListener('submit', (e) => {
      e.preventDefault();
      const contactName = document.getElementById('profile-contact-name').value.trim();
      const bizName = document.getElementById('profile-business-name').value.trim();
      const newPass = document.getElementById('profile-new-password').value.trim();
      const confirmPass = document.getElementById('profile-confirm-password').value.trim();

      if (newPass || confirmPass) {
        if (newPass !== confirmPass) {
          alert('❌ Passwords do not match! Please check your new password confirmation.');
          return;
        }
        mockClientState.client.password = newPass;
      }

      mockClientState.client.contactName = contactName;
      mockClientState.client.businessName = bizName;

      renderUserAvatarUI();
      window.savePortalState();
      closeModal('modal-profile-settings');
      alert('✓ Profile settings and account details updated successfully!');

      if (supabase && mockClientState.client.email) {
        const updatePayload = {
          contact_name: contactName,
          business_name: bizName
        };
        if (newPass) updatePayload.password_hash = newPass;
        supabase.from('clients').update(updatePayload).eq('email', mockClientState.client.email).then(({ error }) => {
          if (error) console.error('Client profile update error:', error);
        });
      }
    });
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

  if (!mockClientState.checklistPhases || !Array.isArray(mockClientState.checklistPhases) || mockClientState.checklistPhases.length === 0) {
    ensureProjectChecklist(mockClientState);
  }

  let totalItems = 0;
  let completedItems = 0;

  mockClientState.checklistPhases.forEach(p => {
    if (p.items) {
      p.items.forEach(i => {
        totalItems++;
        if (i.status === 'Completed') completedItems++;
      });
    }
  });

  const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  if (badge) badge.innerHTML = `<div>${completedItems} OF ${totalItems} TASKS COMPLETED</div><div>(${pct}%)</div>`;

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
                <div style="font-weight: 600; font-size: 0.95rem; color: ${item.status === 'Completed' ? 'var(--text-secondary)' : '#ffffff'}; opacity: ${item.status === 'Completed' ? '0.7' : '1'}; text-decoration: none;">
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
