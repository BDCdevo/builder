const groupsSection = document.querySelector('.teacher-groups-section');
if (groupsSection) {
  const filters = Array.from(groupsSection.querySelectorAll('.group-filter-control'));
  const filterEmptyState = groupsSection.querySelector('[data-state="no-filter-results"]');
  const noGroupsState = groupsSection.querySelector('[data-state="no-groups"]');
  const clearButton = groupsSection.querySelector('[data-action="clear_filters"]');
  const groupCount = document.querySelector('[data-teacher-groups-count]');
  const groupList = groupsSection.querySelector('.teacher-groups-list:not([data-group-template-container])');
  const templateCard = groupList?.querySelector(':scope > [data-group-template][data-group-card]');

  const keepTemplatesAndListUnhidden = () => {
    [groupList, templateCard].filter(Boolean).forEach((element) => {
      element.removeAttribute('hidden');
      element.removeAttribute('aria-hidden');
      element.style.removeProperty('display');
    });
  };
  const cards = () => Array.from(groupList?.querySelectorAll('[data-group-card]') || []).filter((card) => !card.hasAttribute('data-group-template') && Boolean((card.dataset.groupId || '').trim()));
  const availability = (card) => (card.dataset.groupAvailability || '').trim().toLowerCase();
  const canApply = (card) => Boolean(card) && !card.hasAttribute('data-group-template') && Boolean((card.dataset.groupId || '').trim()) && card.dataset.groupCanApply === 'true' && !['مكتملة', 'full'].includes(availability(card));
  const populateFilters = () => {
    const realCards = cards();
    filters.forEach((filter) => {
      const previous = filter.value;
      const field = filter.dataset.filter === 'subject' ? 'groupSubject' : filter.dataset.filter === 'stage' ? 'groupStage' : 'groupGrade';
      const values = [...new Set(realCards.map((card) => card.dataset[field]).filter(Boolean))];
      while (filter.options.length > 1) filter.remove(1);
      values.forEach((value) => filter.add(new Option(value, value)));
      if (values.includes(previous)) filter.value = previous;
    });
  };
  const applyFilters = () => {
    keepTemplatesAndListUnhidden();
    const realCards = cards();
    const chosen = Object.fromEntries(filters.map((filter) => [filter.dataset.filter, filter.value.trim().toLowerCase()]));
    let shown = 0;
    realCards.forEach((card) => {
      const visible = (!chosen.subject || (card.dataset.groupSubject || '').toLowerCase() === chosen.subject) && (!chosen.stage || (card.dataset.groupStage || '').toLowerCase() === chosen.stage) && (!chosen.grade || (card.dataset.groupGrade || '').toLowerCase() === chosen.grade);
      card.hidden = !visible;
      if (visible) shown += 1;
    });
    if (filterEmptyState) filterEmptyState.hidden = realCards.length === 0 || shown !== 0;
    if (noGroupsState) noGroupsState.hidden = realCards.length !== 0;
    if (groupCount) groupCount.textContent = `${realCards.length} مجموعات متاحة`;
  };
  const refreshGroups = () => { keepTemplatesAndListUnhidden(); populateFilters(); applyFilters(); };
  const pickGroup = (card) => {
    if (!canApply(card)) return;
    const id = card.dataset.groupId.trim();
    const name = card.dataset.groupName || card.querySelector('[data-group-name], .group-name')?.textContent.trim() || 'المجموعة المختارة';
    document.dispatchEvent(new CustomEvent('proposal:group-selected', { detail: { id, name } }));
  };

  refreshGroups();
  filters.forEach((filter) => filter.addEventListener('change', applyFilters));
  clearButton?.addEventListener('click', () => { filters.forEach((filter) => { filter.value = ''; }); applyFilters(); });
  groupsSection.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="select_group"]');
    if (!button) return;
    event.preventDefault();
    pickGroup(button.closest('[data-group-card]'));
  });
  groupsSection.addEventListener('keydown', (event) => {
    const card = event.target.closest('[data-group-card]');
    if ((event.key === 'Enter' || event.key === ' ') && card) { event.preventDefault(); pickGroup(card); }
  });

  new MutationObserver((changes) => {
    const mustRepair = changes.some((change) => {
      const target = change.target;
      return target === groupList || target === templateCard || change.type === 'childList';
    });
    if (mustRepair) refreshGroups();
  }).observe(groupList || groupsSection, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'aria-hidden', 'style', 'data-group-id', 'data-group-template', 'data-group-can-apply'] });
}