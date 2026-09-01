import { describe, it, expect } from 'vitest';

describe('Pricing Packages & Add-ons Estimator Logic', () => {
  const PACKAGES = {
    basic: { name: 'Basic', price: 299, maxPages: 3 },
    'dream-build': { name: 'Dream Build', price: 699, maxPages: 6 },
    'dream-elite': { name: 'Dream Elite', price: 1299, maxPages: 10 },
  };

  const ADDONS = {
    booking: { name: 'Appointment Booking System', price: 150 },
    ecommerce: { name: 'E-Commerce / Stripe Store Setup', price: 350 },
    animations: { name: 'Custom Hero Animation & Micro-Interactions', price: 200 },
    cms: { name: 'CMS Blog & Dynamic Content System', price: 180 },
    seo: { name: 'Advanced Technical SEO & Analytics', price: 150 },
  };

  const calculateEstimate = (selectedPackageKey, selectedAddonKeys = []) => {
    const pkg = PACKAGES[selectedPackageKey];
    if (!pkg) return null;

    let subtotal = pkg.price;
    const items = [{ name: pkg.name, price: pkg.price, type: 'package' }];

    selectedAddonKeys.forEach(addonKey => {
      const addon = ADDONS[addonKey];
      if (addon) {
        subtotal += addon.price;
        items.push({ name: addon.name, price: addon.price, type: 'addon' });
      }
    });

    return {
      subtotal,
      itemCount: items.length,
      items,
    };
  };

  it('calculates the base price for Core packages correctly', () => {
    expect(calculateEstimate('basic').subtotal).toBe(299);
    expect(calculateEstimate('dream-build').subtotal).toBe(699);
    expect(calculateEstimate('dream-elite').subtotal).toBe(1299);
  });

  it('correctly aggregates selected modular add-ons to base package', () => {
    const estimate = calculateEstimate('basic', ['booking', 'seo']);
    expect(estimate.subtotal).toBe(299 + 150 + 150); // 599
    expect(estimate.itemCount).toBe(3);
  });

  it('correctly aggregates all add-ons with Dream Elite flagship tier', () => {
    const estimate = calculateEstimate('dream-elite', ['booking', 'ecommerce', 'animations', 'cms', 'seo']);
    const expected = 1299 + 150 + 350 + 200 + 180 + 150; // 2329
    expect(estimate.subtotal).toBe(expected);
    expect(estimate.items.length).toBe(6);
  });

  it('handles empty add-on selections gracefully', () => {
    const estimate = calculateEstimate('dream-build', []);
    expect(estimate.subtotal).toBe(699);
    expect(estimate.itemCount).toBe(1);
  });

  it('returns null for nonexistent package keys', () => {
    const estimate = calculateEstimate('invalid-package', ['booking']);
    expect(estimate).toBeNull();
  });
});
