class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="main-header">
        <div class="container header-container">
          <a href="/index.html" class="logo" aria-label="Dream Built Studios Homepage">
            <img src="/logo.png" alt="Dream Built Studios Logo" class="logo-image" />
          </a>
          
          <div class="nav-dropdown-wrapper">
            <button 
              class="nav-circle-btn" 
              id="nav-dropdown-toggle" 
              aria-label="Toggle Pages Navigation Menu" 
              aria-haspopup="true" 
              aria-expanded="false" 
              aria-controls="nav-dropdown-menu"
              title="Explore Pages"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
              </svg>
            </button>

            <nav class="nav-dropdown-menu" id="nav-dropdown-menu" aria-label="Site Navigation">
              <ul class="dropdown-links">
                <li><a href="/index.html">HOME</a></li>
                <li><a href="/pricing.html">PRICING</a></li>
                <li><a href="/index.html#services">SERVICES</a></li>
                <li><a href="/index.html#portfolio">OUR WORK</a></li>
                <li><a href="/index.html#process">PROCESS</a></li>
              </ul>
            </nav>
          </div>
          
          <div class="header-actions">
            <a href="/project.html" class="btn btn-primary">Build Your Dream</a>
          </div>
        </div>
      </header>
    `;

    const circleBtn = this.querySelector('#nav-dropdown-toggle');
    const dropdownMenu = this.querySelector('#nav-dropdown-menu');

    if (circleBtn && dropdownMenu) {
      const toggleDropdown = (state) => {
        const willBeActive = typeof state === 'boolean' ? state : !circleBtn.classList.contains('active');
        circleBtn.classList.toggle('active', willBeActive);
        dropdownMenu.classList.toggle('active', willBeActive);
        circleBtn.setAttribute('aria-expanded', willBeActive ? 'true' : 'false');
      };

      circleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown();
      });

      // Close dropdown when clicking a link
      dropdownMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          toggleDropdown(false);
        });
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.contains(e.target)) {
          toggleDropdown(false);
        }
      });

      // Escape key to close navigation menu
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && circleBtn.classList.contains('active')) {
          toggleDropdown(false);
          circleBtn.focus();
        }
      });
    }

    // Sticky Header effect
    window.addEventListener('scroll', () => {
      const header = this.querySelector('.main-header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    }, { passive: true });
  }
}

customElements.define('app-header', AppHeader);
