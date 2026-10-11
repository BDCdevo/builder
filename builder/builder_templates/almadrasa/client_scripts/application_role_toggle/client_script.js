const appForm = document.querySelector('form[data-teacher-application]');
if (appForm) {
  const roleRadios = appForm.querySelectorAll('[data-role-toggle]');
  const panels = appForm.querySelectorAll('[data-role-panel]');
  const setFields = (panel, active) => panel.querySelectorAll('input, select, textarea').forEach((field) => {
    field.disabled = !active;
    if (active && field.hasAttribute('data-required')) field.required = true;
    if (!active) field.required = false;
  });
  const applyRole = () => {
    const role = appForm.querySelector('[data-role-toggle]:checked')?.dataset.roleToggle;
    panels.forEach((panel) => {
      const active = panel.dataset.rolePanel === role;
      panel.hidden = !active;
      panel.style.display = active ? 'flex' : 'none';
      setFields(panel, active);
    });
  };
  const childrenWrap = appForm.querySelector('[data-children-wrap]');
  const template = childrenWrap?.querySelector('[data-child-block]');
  appForm.addEventListener('change', (event) => {
    if (event.target.matches('[data-role-toggle]')) applyRole();
    if (event.target.matches('[data-child-samephone]')) {
      const phone = event.target.closest('[data-child-block]')?.querySelector('[data-child-phone]');
      if (phone) { phone.disabled = event.target.checked; phone.hidden = event.target.checked; phone.required = !event.target.checked; }
    }
  });
  appForm.addEventListener('click', (event) => {
    if (event.target.closest('[data-add-child]') && template && childrenWrap) {
      const copy = template.cloneNode(true);
      copy.querySelectorAll('input, select').forEach((field) => { field.value = ''; field.checked = false; field.disabled = false; field.hidden = false; });
      childrenWrap.appendChild(copy);
    }
    const remove = event.target.closest('[data-remove-child]');
    if (remove && childrenWrap?.querySelectorAll('[data-child-block]').length > 1) remove.closest('[data-child-block]')?.remove();
  });
  applyRole();
}