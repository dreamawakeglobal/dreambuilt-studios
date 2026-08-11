class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="main-header">
        <div class="container header-container">
          <a href="/index.html" class="logo">
            <img src="/logo.png" alt="Dream Built Studios Logo" class="logo-image" />
          </a>
          
          <div class="nav-dropdown-wrapper">
            <button class="nav-circle-btn" id="nav-dropdown-toggle" aria-label="Pages Menu" title="Explore Pages">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
              </svg>
            </button>

            <div class="nav-dropdown-menu" id="nav-dropdown-menu">
              <ul class="dropdown-links">
                <li><a href="/index.html">HOME</a></li>
                <li><a href="/index.html#services">SERVICES</a></li>
                <li><a href="/index.html#portfolio">OUR WORK</a></li>
                <li><a href="/index.html#process">PROCESS</a></li>
                <li><a href="/index.html#faq">FAQ</a></li>
              </ul>
            </div>
          </div>
          
          <div class="header-actions">
            <a href="/project.html" class="btn btn-primary">Start Your Project</a>
          </div>
        </div>
      </header>
    `;

    const circleBtn = this.querySelector('#nav-dropdown-toggle');
    const dropdownMenu = this.querySelector('#nav-dropdown-menu');

    if (circleBtn && dropdownMenu) {
      circleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        circleBtn.classList.toggle('active');
        dropdownMenu.classList.toggle('active');
      });

      // Close dropdown when clicking a link
      dropdownMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          circleBtn.classList.remove('active');
          dropdownMenu.classList.remove('active');
        });
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.contains(e.target)) {
          circleBtn.classList.remove('active');
          dropdownMenu.classList.remove('active');
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
    });
  }
}

customElements.define('app-header', AppHeader);
