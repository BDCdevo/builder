const proposalProfile = document.querySelector('[data-proposal-step="profile"]');
const proposalGroups = document.querySelector('[data-proposal-step="groups"]');
const proposalApplication = document.querySelector('[data-proposal-step="application"]');
const proposalSteps = [proposalProfile, proposalGroups, proposalApplication].filter(Boolean);

const setProposalStep = (step) => {
  const target = step === 'profile' ? proposalProfile : step === 'groups' ? proposalGroups : proposalApplication;
  if (!target) return;
  proposalSteps.forEach((section) => {
    const active = section === target;
    section.hidden = !active;
    section.style.display = active ? (section === proposalProfile ? 'grid' : 'flex') : 'none';
    section.setAttribute('aria-hidden', active ? 'false' : 'true');
  });
  target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
};

document.addEventListener('click', (event) => {
  const profileTrigger = event.target.closest('[data-action="open_application"]');
  if (profileTrigger && proposalProfile?.contains(profileTrigger)) {
    event.preventDefault();
    setProposalStep('groups');
    return;
  }
  if (event.target.closest('[data-action="back_to_profile"]')) {
    event.preventDefault();
    setProposalStep('profile');
    return;
  }
  if (event.target.closest('[data-action="back_to_groups"]')) {
    event.preventDefault();
    setProposalStep('groups');
  }
});

document.addEventListener('proposal:group-selected', (event) => {
  const { id, name } = event.detail || {};
  if (!id) return;
  const select = proposalApplication?.querySelector('[data-selected-group-field]');
  const notice = proposalApplication?.querySelector('[data-selected-group-notice]');
  if (!select) return;
  let option = [...select.options].find((item) => item.value === id);
  if (!option) { option = new Option(name || 'المجموعة المختارة', id, true, true); select.add(option); }
  select.value = id;
  select.dispatchEvent(new Event('change', { bubbles: true }));
  if (notice) { notice.textContent = `المجموعة المختارة: ${name || 'المجموعة المختارة'}`; notice.hidden = false; notice.style.display = 'block'; }
  setProposalStep('application');
});

setProposalStep('profile');