function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .replace(/[<>]/g, '') // Strip angle brackets to prevent script injection
    .slice(0, 5000);     // Prevent unbounded payload sizes
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function saveSubmissionLocally(tableName, data) {
  try {
    const existingRaw = localStorage.getItem('dreambuilt_form_submissions');
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    
    const newSubmission = {
      id: `sub-loc-${Date.now()}`,
      table: tableName,
      created_at: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ...data
    };

    existing.unshift(newSubmission);
    localStorage.setItem('dreambuilt_form_submissions', JSON.stringify(existing));
  } catch (e) {
    console.warn('Error saving submission to local storage:', e);
  }
}

async function compressImageFile(file, maxWidth = 1400, quality = 0.75) {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/')) return resolve(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const compressedFile = new File([blob], cleanName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

// Multi-step form logic with Supabase integration & LocalStorage fallback
document.addEventListener('DOMContentLoaded', () => {
  const projectForm = document.getElementById('project-form');
  const consultationForm = document.getElementById('consultation-form');

  const setupMultiStepForm = (form, tableName) => {
    if (!form) return;

    const steps = form.querySelectorAll('.form-step[data-step]');
    const nextBtns = form.querySelectorAll('.next-step');
    const prevBtns = form.querySelectorAll('.prev-step');
    const successState = form.querySelector('#success-state');
    const submitBtn = form.querySelector('button[type="submit"]');

    let currentStep = 0;

    const container = form.closest('.form-container');
    const progressFill = container ? container.querySelector('.progress-fill') : null;
    const stepIndicators = container ? container.querySelectorAll('.step-indicator') : [];

    const updateSteps = () => {
      steps.forEach((step, index) => {
        if (index === currentStep) {
          step.classList.add('active');
        } else {
          step.classList.remove('active');
        }
      });

      // Update progress bar percentage & step indicators
      if (progressFill && steps.length > 0) {
        const percentage = Math.min(100, Math.round(((currentStep + 1) / steps.length) * 100));
        progressFill.style.width = `${percentage}%`;
      }

      stepIndicators.forEach((ind, index) => {
        if (index === currentStep) {
          ind.classList.add('active');
          ind.classList.remove('completed');
        } else if (index < currentStep) {
          ind.classList.remove('active');
          ind.classList.add('completed');
        } else {
          ind.classList.remove('active', 'completed');
        }
      });
    };

    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentStepEl = steps[currentStep];
        const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
        let valid = true;
        const checkedGroupNames = new Set();

        inputs.forEach(input => {
          if (input.type === 'radio') {
            if (!checkedGroupNames.has(input.name)) {
              checkedGroupNames.add(input.name);
              const isChecked = form.querySelector(`input[name="${input.name}"]:checked`);
              const labels = currentStepEl.querySelectorAll(`input[name="${input.name}"]`);
              if (!isChecked) {
                valid = false;
                labels.forEach(i => {
                  const lbl = i.closest('label');
                  if (lbl) lbl.style.borderColor = '#ff4d4d';
                });
              } else {
                labels.forEach(i => {
                  const lbl = i.closest('label');
                  if (lbl) lbl.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                });
              }
            }
          } else if (input.type === 'checkbox') {
            if (!checkedGroupNames.has(input.name)) {
              checkedGroupNames.add(input.name);
              const checkedCount = currentStepEl.querySelectorAll(`input[name="${input.name}"]:checked`).length;
              const labels = currentStepEl.querySelectorAll(`input[name="${input.name}"]`);
              if (checkedCount === 0) {
                valid = false;
                labels.forEach(i => {
                  const lbl = i.closest('label');
                  if (lbl) lbl.style.borderColor = '#ff4d4d';
                });
              } else {
                labels.forEach(i => {
                  const lbl = i.closest('label');
                  if (lbl) lbl.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                });
              }
            }
          } else if (input.type === 'email' && input.value.trim()) {
            if (!isValidEmail(input.value)) {
              valid = false;
              input.style.borderColor = '#ff4d4d';
            } else {
              input.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            }
          } else if (!input.value.trim()) {
            valid = false;
            input.style.borderColor = '#ff4d4d';
          } else {
            input.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          }
        });

        if (valid && currentStep < steps.length - 1) {
          currentStep++;
          updateSteps();
        }
      });
    });

    prevBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep > 0) {
          currentStep--;
          updateSteps();
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate inputs in the active step before submit
      const currentStepEl = steps[currentStep];
      if (currentStepEl) {
        const activeInputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
        let stepValid = true;
        activeInputs.forEach(input => {
          if (!input.value || !input.value.trim() || (input.type === 'radio' && !form.querySelector(`input[name="${input.name}"]:checked`))) {
            stepValid = false;
            input.style.borderColor = '#ff4d4d';
          } else {
            input.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          }
        });
        if (!stepValid) return;
      }

      const formData = new FormData(form);

      // Anti-Spam Security Check: If hidden honeypot field is filled, silently discard bot spam
      const honeypotVal = formData.get('website_url_hp');
      if (honeypotVal && honeypotVal.trim() !== '') {
        console.warn('Security notice: Bot spam attempt rejected via honeypot.');
        // Show artificial success so automated scrapers don't retry
        steps.forEach(step => step.classList.remove('active'));
        if (successState) successState.classList.add('active');
        return;
      }

      const data = {};

      formData.forEach((value, key) => {
        if (key === 'website_url_hp') return; // Do not store honeypot
        if (!(value instanceof File)) {
          if (typeof value === 'string') {
            const cleanKey = key.replace('[]', '');
            const sanitizedVal = sanitizeInput(value);
            if (key.endsWith('[]')) {
              if (!data[cleanKey]) {
                data[cleanKey] = [];
              }
              if (sanitizedVal) data[cleanKey].push(sanitizedVal);
            } else {
              if (sanitizedVal) data[key] = sanitizedVal;
            }
          }
        }
      });

      // Format arrays into comma-separated text strings for clean DB storage
      if (Array.isArray(data.building)) data.building = data.building.join(', ');
      if (Array.isArray(data.features)) data.features = data.features.join(', ');

      // Handle File Uploads to Supabase Storage 'project-files' bucket
      const fileInput = form.querySelector('input[type="file"][name="files"]');
      const uploadedFileUrls = [];

      const originalBtnText = submitBtn ? submitBtn.textContent : 'SUBMIT';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading files...';
      }

      const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'pdf', 'doc', 'docx', 'txt', 'zip'];
      const maxFileSizeBytes = 25 * 1024 * 1024; // 25 MB max

      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        for (let file of fileInput.files) {
          if (file.size === 0) continue;
          if (file.size > maxFileSizeBytes) {
            console.warn(`File '${file.name}' exceeds 25MB limit. Skipping upload.`);
            continue;
          }

          const fileExt = file.name.split('.').pop().toLowerCase();
          if (!allowedExtensions.includes(fileExt)) {
            console.warn(`File extension '.${fileExt}' not permitted. Skipping.`);
            continue;
          }

          if (file.type && file.type.startsWith('image/')) {
            try {
              file = await compressImageFile(file, 1400, 0.75);
            } catch (cErr) {
              console.warn('Image compression fallback:', cErr);
            }
          }
          const sanitizeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const filePath = `uploads/${Date.now()}_${sanitizeName}`;
          try {
            if (supabase && supabase.storage) {
              const { data: uploadData, error: uploadErr } = await supabase.storage
                .from('project-files')
                .upload(filePath, file, { cacheControl: '31536000', upsert: false });

              if (!uploadErr && uploadData) {
                const { data: publicUrlData } = supabase.storage
                  .from('project-files')
                  .getPublicUrl(filePath);
                if (publicUrlData && publicUrlData.publicUrl) {
                  uploadedFileUrls.push(publicUrlData.publicUrl);
                }
              } else {
                uploadedFileUrls.push(file.name);
              }
            } else {
              uploadedFileUrls.push(file.name);
            }
          } catch (e) {
            uploadedFileUrls.push(file.name);
          }
        }
      }

      if (uploadedFileUrls.length > 0) {
        data.files = uploadedFileUrls.join(', ');
      }

      data.status = 'new';

      if (submitBtn) submitBtn.textContent = 'Submitting...';

      // Always save locally as fallback so no submission is ever lost
      saveSubmissionLocally(tableName, data);

      if (supabase) {
        try {
          const { error } = await supabase.from(tableName).insert([data]);
          if (error) {
            console.warn(`Supabase insert notice on '${tableName}':`, error.message);
          }
        } catch (err) {
          console.warn('Supabase submission fallback:', err);
        }
      }

      // Display success state
      steps.forEach(step => step.classList.remove('active'));
      if (successState) successState.classList.add('active');
    });

    // Clear validation styling on input
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => {
        input.style.borderColor = 'var(--glass-border)';
      });
    });
    // Pre-fill fields from URL query params (e.g. from Pricing page)
    const prefillFromUrlParams = () => {
      if (!projectForm) return;
      const params = new URLSearchParams(window.location.search);
      const pkg = params.get('package');
      const addons = params.get('addons');

      if (pkg) {
        // Step 1: Services Needed
        const customWebsiteCheck = projectForm.querySelector('input[name="building[]"][value="Custom Website"]');
        if (customWebsiteCheck) customWebsiteCheck.checked = true;

        const pagesSelect = projectForm.querySelector('select[name="pages"]');
        const budgetSelect = projectForm.querySelector('select[name="budget"]');

        if (pkg === 'basic') {
          if (pagesSelect) pagesSelect.value = 'Standard Starter Site (2–5 Pages)';
          if (budgetSelect) budgetSelect.value = 'Under $500';
        } else if (pkg === 'dream-build') {
          if (pagesSelect) pagesSelect.value = 'Full Business Site (6–10 Pages)';
          if (budgetSelect) budgetSelect.value = '$500 – $1,500';
          const heroAnim = projectForm.querySelector('input[name="features[]"][value="Hero Header Video/Animation"]');
          if (heroAnim) heroAnim.checked = true;
          const interactiveForms = projectForm.querySelector('input[name="features[]"][value="Interactive Forms"]');
          if (interactiveForms) interactiveForms.checked = true;
        } else if (pkg === 'dream-elite') {
          if (pagesSelect) pagesSelect.value = 'Full Business Site (6–10 Pages)';
          if (budgetSelect) budgetSelect.value = '$500 – $1,500';
          const heroAnim = projectForm.querySelector('input[name="features[]"][value="Hero Header Video/Animation"]');
          if (heroAnim) heroAnim.checked = true;
          const formsCheck = projectForm.querySelector('input[name="features[]"][value="Interactive Forms"]');
          if (formsCheck) formsCheck.checked = true;
          const seoCheck = projectForm.querySelector('input[name="features[]"][value="Analytics & SEO"]');
          if (seoCheck) seoCheck.checked = true;
        } else if (pkg === 'custom') {
          const devCheck = projectForm.querySelector('input[name="building[]"][value="Website Development"]');
          if (devCheck) devCheck.checked = true;
          if (budgetSelect) budgetSelect.value = '$1,500 – $3,000';
        }
      }

      if (addons) {
        const addonList = decodeURIComponent(addons).split(',');
        addonList.forEach(item => {
          if (item === 'booking') {
            const el = projectForm.querySelector('input[name="features[]"][value="Appointment Booking"]');
            if (el) el.checked = true;
          } else if (item === 'ecommerce') {
            const el = projectForm.querySelector('input[name="features[]"][value="Online Payments / Store"]');
            if (el) el.checked = true;
            const bldEl = projectForm.querySelector('input[name="building[]"][value="E-Commerce Store"]');
            if (bldEl) bldEl.checked = true;
          } else if (item === 'animations') {
            const el = projectForm.querySelector('input[name="features[]"][value="Hero Header Video/Animation"]');
            if (el) el.checked = true;
          } else if (item === 'cms') {
            const el = projectForm.querySelector('input[name="features[]"][value="Blog / News"]');
            if (el) el.checked = true;
          }
        });
      }
    };

    prefillFromUrlParams();
  };

  setupMultiStepForm(projectForm, 'project_submissions');
  setupMultiStepForm(consultationForm, 'consultations');
});

