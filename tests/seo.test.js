import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Technical SEO & Structural Integrity Suite', () => {
  const rootDir = path.resolve(__dirname, '..');
  const pages = ['index.html', 'pricing.html', 'consultation.html', 'project.html'];

  pages.forEach(page => {
    describe(`Page SEO: ${page}`, () => {
      const htmlPath = path.join(rootDir, page);
      const content = fs.readFileSync(htmlPath, 'utf-8');

      it('has a non-empty title tag', () => {
        const titleMatch = content.match(/<title>(.*?)<\/title>/);
        expect(titleMatch).not.toBeNull();
        expect(titleMatch[1].trim().length).toBeGreaterThan(10);
      });

      it('has a descriptive meta description', () => {
        const descMatch = content.match(/<meta\s+name="description"\s+content="(.*?)"/i);
        expect(descMatch).not.toBeNull();
        expect(descMatch[1].trim().length).toBeGreaterThan(20);
      });

      it('has a valid canonical link matching https://dreambuiltstudios.com', () => {
        const canonMatch = content.match(/<link\s+rel="canonical"\s+href="(.*?)"/i);
        expect(canonMatch).not.toBeNull();
        expect(canonMatch[1]).toMatch(/^https:\/\/dreambuiltstudios\.com/);
      });

      it('has OpenGraph social sharing meta tags', () => {
        expect(content).toContain('property="og:title"');
        expect(content).toContain('property="og:description"');
        expect(content).toContain('property="og:image"');
        expect(content).toContain('property="og:url"');
      });

      it('has Twitter summary card meta tags', () => {
        expect(content).toContain('name="twitter:card"');
        expect(content).toContain('name="twitter:title"');
        expect(content).toContain('name="twitter:description"');
      });

      it('has touch icon and favicon links', () => {
        expect(content).toContain('rel="apple-touch-icon"');
        expect(content).toContain('rel="icon"');
      });
    });
  });

  describe('Structured Data (JSON-LD)', () => {
    it('index.html includes valid Schema.org ProfessionalService JSON-LD', () => {
      const content = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
      const jsonLdMatch = content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      expect(jsonLdMatch).not.toBeNull();
      const parsed = JSON.parse(jsonLdMatch[1]);
      expect(parsed['@context']).toBe('https://schema.org');
      expect(parsed['@type']).toBe('ProfessionalService');
      expect(parsed.name).toBe('Dream Built Studios');
    });

    it('pricing.html includes valid Schema.org OfferCatalog JSON-LD', () => {
      const content = fs.readFileSync(path.join(rootDir, 'pricing.html'), 'utf-8');
      const jsonLdMatch = content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      expect(jsonLdMatch).not.toBeNull();
      const parsed = JSON.parse(jsonLdMatch[1]);
      expect(parsed['@context']).toBe('https://schema.org');
      expect(parsed['@type']).toBe('OfferCatalog');
      expect(parsed.itemListElement).toBeInstanceOf(Array);
      expect(parsed.itemListElement.length).toBe(3);
    });
  });

  describe('Robots.txt & Sitemap.xml', () => {
    it('public/robots.txt exists and points to sitemap', () => {
      const robotsPath = path.join(rootDir, 'public', 'robots.txt');
      expect(fs.existsSync(robotsPath)).toBe(true);
      const content = fs.readFileSync(robotsPath, 'utf-8');
      expect(content).toContain('User-agent: *');
      expect(content).toContain('Sitemap: https://dreambuiltstudios.com/sitemap.xml');
    });

    it('public/sitemap.xml exists and defines canonical routes', () => {
      const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
      expect(fs.existsSync(sitemapPath)).toBe(true);
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      expect(content).toContain('<loc>https://dreambuiltstudios.com/</loc>');
      expect(content).toContain('<loc>https://dreambuiltstudios.com/pricing.html</loc>');
      expect(content).toContain('<loc>https://dreambuiltstudios.com/project.html</loc>');
      expect(content).toContain('<loc>https://dreambuiltstudios.com/consultation.html</loc>');
    });

    it('public/_headers exists and specifies security & caching rules', () => {
      const headersPath = path.join(rootDir, 'public', '_headers');
      expect(fs.existsSync(headersPath)).toBe(true);
      const content = fs.readFileSync(headersPath, 'utf-8');
      expect(content).toContain('X-Content-Type-Options: nosniff');
      expect(content).toContain('X-Frame-Options: SAMEORIGIN');
      expect(content).toContain('Strict-Transport-Security: max-age=31536000');
    });
  });
});
