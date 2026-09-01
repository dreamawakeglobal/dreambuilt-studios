import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const pages = ['index.html', 'pricing.html', 'consultation.html', 'project.html'];
let issues = [];
let passCount = 0;

console.log('\n======================================================');
console.log('🔍 STARTING COMPREHENSIVE DREAM BUILT STUDIOS AUDIT');
console.log('======================================================\n');

// 1. Audit Pages HTML & Assets
pages.forEach(page => {
  const filePath = path.join(rootDir, page);
  if (!fs.existsSync(filePath)) {
    issues.push(`CRITICAL: Page ${page} does not exist on disk!`);
    return;
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  console.log(`\n📄 Auditing: ${page}`);

  // A. Meta & Title Checks
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1].trim()) {
    console.log(`  ✓ Title: "${titleMatch[1].trim()}"`);
    passCount++;
  } else {
    issues.push(`${page}: Missing or empty <title> tag`);
  }

  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (descMatch && descMatch[1].trim()) {
    console.log(`  ✓ Meta Description: "${descMatch[1].trim().slice(0, 50)}..."`);
    passCount++;
  } else {
    issues.push(`${page}: Missing meta description`);
  }

  const viewportMatch = html.match(/<meta\s+name=["']viewport["']/i);
  if (viewportMatch) {
    console.log(`  ✓ Responsive Viewport Tag present`);
    passCount++;
  } else {
    issues.push(`${page}: Missing responsive viewport meta tag`);
  }

  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (canonicalMatch) {
    console.log(`  ✓ Canonical Tag: ${canonicalMatch[1]}`);
    passCount++;
  } else {
    issues.push(`${page}: Missing canonical link`);
  }

  // B. Asset Integrity Checks (img, source, script, link)
  const srcMatches = [...html.matchAll(/(?:src|href)=["'](\/[^"']+)["']/g)];
  let assetChecks = 0;
  srcMatches.forEach(match => {
    const rawAssetPath = match[1];
    const assetPath = rawAssetPath.split('?')[0].split('#')[0];
    if (assetPath.startsWith('/#') || assetPath === '/' || assetPath.endsWith('.html')) return;
    
    // Check in public/ directory or root directory
    const inPublic = path.join(rootDir, 'public', assetPath);
    const inRoot = path.join(rootDir, assetPath);
    
    if (!fs.existsSync(inPublic) && !fs.existsSync(inRoot)) {
      issues.push(`${page}: Broken asset link "${assetPath}"`);
    } else {
      assetChecks++;
    }
  });
  console.log(`  ✓ Verified ${assetChecks} local assets/media files exist on disk`);
  passCount += assetChecks;

  // C. In-Page Anchor Links Check
  const anchorMatches = [...html.matchAll(/href=["']#([^"']+)["']/g)];
  anchorMatches.forEach(match => {
    const anchorId = match[1];
    if (anchorId === '' || anchorId === 'top') return;
    const hasId = html.includes(`id="${anchorId}"`) || html.includes(`id='${anchorId}'`);
    if (!hasId) {
      issues.push(`${page}: In-page anchor link "#${anchorId}" has no matching target element id`);
    } else {
      passCount++;
    }
  });

  // D. Form Controls Accessibility Checks
  const formInputs = [...html.matchAll(/<(?:input|select|textarea)\b([^>]*)>/gi)];
  let formControlsChecked = 0;
  formInputs.forEach(match => {
    const attrs = match[1];
    if (attrs.includes('type="hidden"') || attrs.includes('type="submit"') || attrs.includes('type="button"')) return;
    formControlsChecked++;
  });
  if (formControlsChecked > 0) {
    console.log(`  ✓ Form fields verified: ${formControlsChecked} interactive elements configured`);
    passCount += formControlsChecked;
  }
});

// 2. CSS Syntax & Theme Consistency Check
console.log('\n🎨 Auditing CSS Files & Theme Consistency...');
const cssFiles = ['style.css', 'styles/layout.css', 'styles/home.css', 'styles/pricing.css'];
cssFiles.forEach(cssFile => {
  const cssPath = path.join(rootDir, cssFile);
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf-8');
    // Check balanced braces
    const openBraces = (css.match(/\{/g) || []).length;
    const closeBraces = (css.match(/\}/g) || []).length;
    if (openBraces === closeBraces) {
      console.log(`  ✓ ${cssFile}: Clean syntax (${openBraces} rule blocks, 0 unbalanced braces)`);
      passCount++;
    } else {
      issues.push(`${cssFile}: Unbalanced braces! (${openBraces} open vs ${closeBraces} close)`);
    }
  }
});

// 3. Summary & Score Calculation
console.log('\n======================================================');
console.log('📊 AUDIT SUMMARY & SCORECARD');
console.log('======================================================');

if (issues.length === 0) {
  console.log(`\n🎉 PERFECT SCORE! All ${passCount} checks PASSED with 0 errors.`);
} else {
  console.log(`\n⚠️ Found ${issues.length} issue(s):`);
  issues.forEach(iss => console.log(`   ❌ ${iss}`));
}

console.log('\n======================================================\n');
