class AppFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="main-footer section">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a href="/index.html" class="logo mb-2">
                <img src="/logo.png" alt="Dream Built Studios Logo" class="logo-image" />
              </a>
              <p>Website Design & Development</p>
              <p class="highlight mt-4">You Dream It. We Build It.</p>
            </div>
            
            <div class="footer-links-group">
              <h4>Navigation</h4>
              <ul class="footer-links">
                <li><a href="/index.html">Home</a></li>
                <li><a href="/index.html#services">Services</a></li>
                <li><a href="/index.html#portfolio">Our Work</a></li>
                <li><a href="/index.html#process">Process</a></li>
                <li><a href="/index.html#faq">FAQ</a></li>
              </ul>
            </div>
            
            <div class="footer-links-group">
              <h4>Action</h4>
              <ul class="footer-links">
                <li><a href="/project.html">Start Project</a></li>
                <li><a href="/pricing.html">Pricing</a></li>
              </ul>
            </div>
            
            <div class="footer-social">
              <h4>Connect</h4>
              <div class="social-icons">
                <a href="#" aria-label="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></a>
                <a href="#" aria-label="Facebook"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
                <a href="#" aria-label="LinkedIn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg></a>
              </div>
            </div>
          </div>
          
          <div class="footer-bottom">
            <p>&copy; ${new Date().getFullYear()} Dream Built Studios. All rights reserved.</p>
            <div class="legal-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('app-footer', AppFooter);
