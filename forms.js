import { supabase } from './lib/supabase.js';

// Multi-step form logic with Supabase integration
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
                labels.forEach(i => i.closest('label').style.borderColor = '#ff4d4d');
              } else {
                labels.forEach(i => i.closest('label').style.borderColor = 'rgba(255, 255, 255, 0.1)');
              }
            }
          } else if (input.type === 'checkbox') {
            if (!checkedGroupNames.has(input.name)) {
              checkedGroupNames.add(input.name);
              const checkedCount = currentStepEl.querySelectorAll(`input[name="${input.name}"]:checked`).length;
              const labels = currentStepEl.querySelectorAll(`input[name="${input.name}"]`);
              if (checkedCount === 0) {
                valid = false;
                labels.forEach(i => i.closest('label').style.borderColor = '#ff4d4d');
              } else {
                labels.forEach(i => i.closest('label').style.borderColor = 'rgba(255, 255, 255, 0.1)');
              }
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
      const data = {};

      formData.forEach((value, key) => {
        if (!(value instanceof File)) {
          if (typeof value === 'string') {
            const cleanKey = key.replace('[]', '');
            if (key.endsWith('[]')) {
              if (!data[cleanKey]) {
                data[cleanKey] = [];
              }
              if (value.trim()) data[cleanKey].push(value);
            } else {
              if (value.trim()) data[key] = value;
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

      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        for (const file of fileInput.files) {
          if (file.size === 0) continue;
          const sanitizeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const filePath = `uploads/${Date.now()}_${sanitizeName}`;
          try {
            const { data: uploadData, error: uploadErr } = await supabase.storage
              .from('project-files')
              .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (!uploadErr && uploadData) {
              const { data: publicUrlData } = supabase.storage
                .from('project-files')
                .getPublicUrl(filePath);
              if (publicUrlData && publicUrlData.publicUrl) {
                uploadedFileUrls.push(publicUrlData.publicUrl);
              }
            } else {
              console.warn('Storage upload note:', uploadErr ? uploadErr.message : 'Saving filename');
              uploadedFileUrls.push(file.name);
            }
          } catch (e) {
            console.warn('File upload fallback:', e);
            uploadedFileUrls.push(file.name);
          }
        }
      }

      if (uploadedFileUrls.length > 0) {
        data.files = uploadedFileUrls.join(', ');
      }

      data.status = 'new';

      if (submitBtn) submitBtn.textContent = 'Submitting...';

      try {
        console.log(`Sending submission to Supabase table '${tableName}':`, data);
        const { error } = await supabase.from(tableName).insert([data]);

        if (error) {
          console.error(`Error saving to ${tableName}:`, error.message);
          alert('Notice submitting form to Supabase: ' + error.message);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
          return;
        }

        // Successfully saved in Supabase! Show success state
        steps.forEach(step => step.classList.remove('active'));
        if (successState) successState.classList.add('active');

      } catch (err) {
        console.error('Unexpected submission error:', err);
        alert('An unexpected error occurred: ' + err.message);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });

    // Clear validation styling on input
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => {
        input.style.borderColor = 'var(--glass-border)';
      });
    });
  };

  setupMultiStepForm(projectForm, 'project_submissions');
  setupMultiStepForm(consultationForm, 'consultations');
});
