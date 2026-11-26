const finder = document.getElementById('tool-finder');
const finderTrigger = document.querySelector('[data-tool-finder-open]');

if (finder?.showModal && finderTrigger) {
  const query = finder.querySelector('input');
  const status = finder.querySelector('[role="status"]');
  const entries = Array.from(finder.querySelectorAll('[data-search]'), element => ({
    element,
    link: element.querySelector('a'),
    search: element.dataset.search.toLowerCase()
  }));
  let matches = entries;

  function filterTools() {
    const terms = query.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    matches = entries.filter(({ search }) => terms.every(term => search.includes(term)));
    const matchingEntries = new Set(matches);
    for (const entry of entries) entry.element.hidden = !matchingEntries.has(entry);
    status.textContent = matches.length ? `${matches.length} tools found` : 'No tools match your search.';
    finder.querySelector('ul').scrollTop = 0;
  }

  function openFinder() {
    if (finder.open) return;
    query.value = '';
    filterTools();
    finder.showModal();
    query.focus();
  }

  finderTrigger.hidden = false;
  finderTrigger.querySelector('kbd').textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
  finderTrigger.addEventListener('click', openFinder);
  query.addEventListener('input', filterTools);

  document.addEventListener('keydown', event => {
    if (event.key.toLowerCase() !== 'k' || !(event.ctrlKey || event.metaKey) || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openFinder();
  });

  finder.addEventListener('keydown', event => {
    const activeIndex = matches.findIndex(({ link }) => link === event.target);
    if (event.target !== query && activeIndex === -1) return;
    if (event.target === query && event.key === 'Enter' && matches.length) {
      event.preventDefault();
      matches[0].link.click();
    }
    if (event.key === 'ArrowDown' && matches[activeIndex + 1]) {
      event.preventDefault();
      matches[activeIndex + 1].link.focus();
    }
    if (event.key === 'ArrowUp' && activeIndex >= 0) {
      event.preventDefault();
      (activeIndex ? matches[activeIndex - 1].link : query).focus();
    }
  });
}
