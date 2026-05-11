// Render the tree from data before any DOM queries run.
const mainEl = document.querySelector('.main');
const emptyStateEl = document.getElementById('empty-state');
window.renderTree(window.TREE_DATA, mainEl, emptyStateEl);

document.querySelectorAll('.tree-item > .toggle-row, .tree-sub-item > .toggle-row').forEach(row => {
  row.addEventListener('click', () => {
    row.parentElement.classList.toggle('expanded');
  });
});

// Inject checkboxes
document.querySelectorAll('.toggle-row, .tree-row').forEach(row => {
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'row-checkbox';
  cb.addEventListener('click', e => e.stopPropagation());
  row.appendChild(cb);
});

// Cascade: update ancestor indeterminate/checked state
function updateAncestors(startEl) {
  ['tree-sub-item', 'tree-item'].forEach(cls => {
    const ancestor = startEl.closest('.' + cls);
    if (!ancestor) return;
    const parentCb = ancestor.querySelector(':scope > .toggle-row .row-checkbox');
    if (!parentCb) return;
    const childCbs = [...ancestor.querySelectorAll('.row-checkbox')].filter(cb => cb !== parentCb);
    const checkedCount = childCbs.filter(cb => cb.checked).length;
    const indetermCount = childCbs.filter(cb => cb.indeterminate).length;
    parentCb.indeterminate = false;
    if (checkedCount === childCbs.length) {
      parentCb.checked = true;
    } else if (checkedCount > 0 || indetermCount > 0) {
      parentCb.checked = false;
      parentCb.indeterminate = true;
    } else {
      parentCb.checked = false;
    }
  });
}

const mapNewFlowsBtn = document.querySelector('.btn-primary');
const browserPlaceholder = document.getElementById('browser-placeholder');
const playgroundBlock = document.getElementById('playground-block');
const flowsMappedCount = document.getElementById('flows-mapped-count');
const playgroundTimer = document.getElementById('playground-timer');
const chatMessages = document.getElementById('chat-messages');
const wolfThinking = document.getElementById('wolf-thinking');

function startPlaygroundProgress() {
  flowsMappedCount.textContent = '0';
  // 10 flows complete over 15s — one per 1.5s slot at a random offset.
  const flowCount = 10;
  const slotMs = 15000 / flowCount;
  for (let i = 0; i < flowCount; i++) {
    const min = i * slotMs + 200;
    const max = (i + 1) * slotMs - 200;
    const t = min + Math.random() * (max - min);
    setTimeout(() => {
      flowsMappedCount.textContent = String(i + 1);
    }, t);
  }
  // Elapsed timer 0s → 15s, synced with the video.
  let elapsed = 0;
  playgroundTimer.textContent = elapsed + 's';
  const tick = setInterval(() => {
    elapsed++;
    playgroundTimer.textContent = elapsed + 's';
    if (elapsed >= 15) {
      clearInterval(tick);
      // Squish-and-fade: lock the current height, clear aspect-ratio, then
      // transition height + opacity to 0 so siblings flow up smoothly.
      const startHeight = browserPlaceholder.offsetHeight;
      browserPlaceholder.style.aspectRatio = 'auto';
      browserPlaceholder.style.height = startHeight + 'px';
      void browserPlaceholder.offsetHeight;
      browserPlaceholder.classList.remove('shown');
      browserPlaceholder.style.height = '0px';
      hideWolf();
      if (playgroundStartedMsg) {
        playgroundStartedMsg.textContent = window.MAP_FLOWS_SCRIPT.completedReply;
      }
      setTimeout(() => browserPlaceholder.remove(), 400);
    }
  }, 1000);
}

function scrollToBottom() {
  chatScrollArea.scrollTop = chatScrollArea.scrollHeight;
}

function addUserMsg(text) {
  const el = document.createElement('div');
  el.className = 'chat-msg-user';
  el.textContent = text;
  chatMessages.appendChild(el);
  scrollToBottom();
}
function addAIMsg(text) {
  const el = document.createElement('div');
  el.className = 'chat-msg-ai';
  el.textContent = text;
  chatMessages.appendChild(el);
  scrollToBottom();
  return el;
}
function showWolf() { wolfThinking.style.opacity = '1'; scrollToBottom(); }
function hideWolf() { wolfThinking.style.opacity = '0'; }

const chatInput = document.querySelector('.left-input');
function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  chatInput.style.height = '';
  const innerEl = leftPanel.querySelector('.left-panel-inner');
  if (!innerEl.classList.contains('faded')) {
    innerEl.classList.add('fading');
    setTimeout(() => { innerEl.classList.remove('fading'); innerEl.classList.add('faded'); }, 320);
  }
  addUserMsg(text);
  setTimeout(showWolf, 150);
  setTimeout(() => {
    hideWolf();
    setTimeout(() => addAIMsg(window.pickFallback()), 150);
  }, 900);
}

chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

let mapFlowsActive = false;
let playgroundStartedMsg = null;
mapNewFlowsBtn.addEventListener('click', () => {
  if (mapFlowsActive) return;
  mapFlowsActive = true;

  // Open sidebar if closed
  if (leftPanel.classList.contains('closed')) {
    leftPanel.classList.remove('closed');
    updateSidebarVar();
  }

  // Fade out top portion
  const innerEl = leftPanel.querySelector('.left-panel-inner');
  if (!innerEl.classList.contains('faded')) {
    innerEl.classList.add('fading');
    setTimeout(() => { innerEl.classList.remove('fading'); innerEl.classList.add('faded'); }, 320);
  }

  // 1. User message
  addUserMsg(window.MAP_FLOWS_SCRIPT.userMessage);

  // 2. Wolf appears (fast)
  setTimeout(showWolf, 150);

  // 3. Wolf hides, first AI message
  setTimeout(() => {
    hideWolf();
    setTimeout(() => addAIMsg(window.MAP_FLOWS_SCRIPT.firstReply), 200);
  }, 800);

  // 4. Wolf appears again
  setTimeout(showWolf, 1300);

  // 5. Playground container appears in connecting state (rainbow on, iframe hidden) + sidebar expand
  setTimeout(() => {
    hideWolf();
    chatMessages.appendChild(playgroundBlock);
    playgroundBlock.classList.add('connecting');
    playgroundBlock.style.display = 'flex';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      browserPlaceholder.classList.add('shown');
    }));
    leftPanel.classList.remove('closed');
    leftPanelContent.style.width = maxWidth + 'px';
    leftPanel.style.width = (48 + maxWidth) + 'px';
    updateSidebarVar();
  }, 2000);

  // 6. Connecting AI message + keep wolf visible
  setTimeout(() => {
    playgroundStartedMsg = addAIMsg(window.MAP_FLOWS_SCRIPT.connectingReply);
    setTimeout(showWolf, 200);
  }, 2600);

  // 7. After 2s of connecting, reveal the video, swap the message, and begin mapping
  setTimeout(() => {
    playgroundBlock.classList.remove('connecting');
    if (playgroundStartedMsg) {
      playgroundStartedMsg.textContent = window.MAP_FLOWS_SCRIPT.finalReply;
    }
    startPlaygroundProgress();
  }, 4600);
});

const runBtn = document.querySelector('.btn-outline');

const batchBar = document.getElementById('batch-bar');
const batchCount = document.getElementById('batch-count');
const batchRunBtn = document.getElementById('batch-run-btn');
const batchDeselect = document.getElementById('batch-deselect');

function updateRunBtn() {
  const count = document.querySelectorAll('.tree-row .row-checkbox:checked').length;
  const s = count === 1 ? '' : 's';
  runBtn.textContent = count > 0 ? `Run ${count} flow${s}` : 'Run all flows';
  batchCount.textContent = `${count} flow${s} selected`;
  batchRunBtn.textContent = `Run ${count} flow${s}`;
  if (count > 0) {
    batchBar.classList.remove('hiding');
    batchBar.classList.add('visible');
  } else if (batchBar.classList.contains('visible')) {
    batchBar.classList.add('hiding');
    batchBar.addEventListener('animationend', () => {
      batchBar.classList.remove('visible', 'hiding');
    }, { once: true });
  }
}

batchDeselect.addEventListener('click', () => {
  document.querySelectorAll('.row-checkbox').forEach(cb => {
    cb.checked = false;
    cb.indeterminate = false;
  });
  updateRunBtn();
});

document.querySelectorAll('.row-checkbox').forEach(cb => {
  cb.addEventListener('change', () => {
    const toggleRow = cb.closest('.toggle-row');
    if (toggleRow) {
      const container = toggleRow.parentElement;
      container.querySelectorAll('.row-checkbox').forEach(childCb => {
        if (childCb !== cb) { childCb.checked = cb.checked; childCb.indeterminate = false; }
      });
    }
    updateAncestors(cb);
    updateRunBtn();
  });
});

const sidebarToggle = document.getElementById('sidebar-toggle');
const leftPanel = document.querySelector('.left-panel');

function updateSidebarVar() {
  const w = leftPanel.offsetWidth;
  document.documentElement.style.setProperty('--sidebar-width', w + 'px');
  batchBar.style.left = w + 'px';
}
updateSidebarVar();

const closeSvg = `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m10 15-3-3 3-3"/>`;
const openSvg  = `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/>`;
let savedPanelWidth = null;
let savedContentWidth = null;
sidebarToggle.addEventListener('click', () => {
  const closing = !leftPanel.classList.contains('closed');
  const content = leftPanel.querySelector('.left-panel-content');
  if (closing) {
    savedPanelWidth = leftPanel.style.width || (leftPanel.offsetWidth + 'px');
    savedContentWidth = content.style.width || null;
    leftPanel.style.width = '';
    content.style.width = '';
    document.documentElement.style.setProperty('--sidebar-width', '48px');
    batchBar.style.left = '48px';
  } else {
    if (savedPanelWidth) leftPanel.style.width = savedPanelWidth;
    if (savedContentWidth) content.style.width = savedContentWidth;
    const openWidth = savedPanelWidth || '448px';
    document.documentElement.style.setProperty('--sidebar-width', openWidth);
    batchBar.style.left = openWidth;
  }
  leftPanel.classList.toggle('closed', closing);
  sidebarToggle.querySelector('svg').innerHTML = closing ? openSvg : closeSvg;
  sidebarToggle.dataset.tooltip = closing ? 'Open sidebar' : 'Close sidebar';
  leftPanel.addEventListener('transitionend', function f(e) {
    if (e.target !== leftPanel || e.propertyName !== 'width') return;
    updateSidebarVar();
    leftPanel.removeEventListener('transitionend', f);
  });
});

const expandCollapseBtn = document.querySelector('#expand-btn');
const expandIcon = `<path d="M3 5h8"/><path d="M3 12h8"/><path d="M3 19h8"/><path d="m15 8 3-3 3 3"/><path d="m15 16 3 3 3-3"/>`;
const collapseIcon = `<path d="M3 5h8"/><path d="M3 12h8"/><path d="M3 19h8"/><path d="m15 5 3 3 3-3"/><path d="m15 19 3-3 3 3"/>`;
let allExpanded = false;
expandCollapseBtn.addEventListener('click', () => {
  allExpanded = !allExpanded;
  document.querySelectorAll('.tree-item, .tree-sub-item').forEach(el => {
    el.classList.toggle('expanded', allExpanded);
  });
  expandCollapseBtn.dataset.tooltip = allExpanded ? 'Collapse groups' : 'Expand groups';
  expandCollapseBtn.querySelector('svg').innerHTML = allExpanded ? collapseIcon : expandIcon;
});

// Badge tooltips
document.querySelectorAll('.badge').forEach(badge => {
  const num = badge.textContent.trim();
  if (!num || isNaN(num)) return;
  const s = num === '1' ? '' : 's';
  if (badge.classList.contains('badge-green'))       badge.dataset.tooltip = `${num} test${s} passing`;
  else if (badge.classList.contains('badge-blue'))   badge.dataset.tooltip = `${num} test${s} in maintenance`;
  else if (badge.classList.contains('badge-pink'))   badge.dataset.tooltip = `${num} bug${s}`;
  else if (badge.classList.contains('badge-draft'))  badge.dataset.tooltip = `${num} draft${s}`;
  else if (badge.classList.contains('badge-total'))  badge.dataset.tooltip = `${num} total test${s}`;
});

// Tooltip via event delegation (works for static + dynamic elements)
const tooltip = document.getElementById('tooltip');
function showTooltip(el) {
  tooltip.textContent = el.dataset.tooltip;
  const r = el.getBoundingClientRect();
  tooltip.style.opacity = '0';
  tooltip.style.display = 'block';
  const tw = tooltip.offsetWidth;
  const th = tooltip.offsetHeight;
  const margin = 8;
  const left = Math.max(margin, Math.min(r.left + r.width / 2 - tw / 2, window.innerWidth - tw - margin));
  const top = r.top - th - 6 < margin ? r.bottom + 6 : r.top - th - 6;
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
  tooltip.style.opacity = '1';
}
document.addEventListener('mouseover', e => {
  const el = e.target.closest('[data-tooltip]');
  if (el) showTooltip(el);
});
document.addEventListener('mouseout', e => {
  const el = e.target.closest('[data-tooltip]');
  if (el && !el.contains(e.relatedTarget)) tooltip.style.opacity = '0';
});


// Sidebar resize
const leftPanelContent = document.querySelector('.left-panel-content');
const chatScrollArea = leftPanelContent.querySelector('.chat-scroll-area');
const minWidth = 200;
const maxWidth = 600;

leftPanel.addEventListener('mousedown', e => {
  if (leftPanel.classList.contains('closed')) return;
  if (leftPanel.getBoundingClientRect().right - e.clientX > 6) return;
  e.preventDefault();
  const startX = e.clientX;
  const startWidth = leftPanelContent.offsetWidth;
  leftPanel.style.transition = 'none';
  batchBar.style.transition = 'none';

  function onMouseMove(e) {
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + e.clientX - startX));
    leftPanelContent.style.width = newWidth + 'px';
    leftPanel.style.width = (48 + newWidth) + 'px';
    updateSidebarVar();
  }
  function onMouseUp() {
    leftPanel.style.transition = '';
    batchBar.style.transition = '';
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

// Text input resize from top
const inputResizeHandle = document.getElementById('input-resize');
const leftInputEl = inputResizeHandle.nextElementSibling;
const minInputHeight = 60;
const maxInputHeight = 400;

inputResizeHandle.addEventListener('mousedown', e => {
  e.preventDefault();
  inputResizeHandle.classList.add('dragging');
  const startY = e.clientY;
  const startHeight = leftInputEl.offsetHeight;

  function onInputMouseMove(e) {
    const delta = startY - e.clientY;
    const newHeight = Math.max(minInputHeight, Math.min(maxInputHeight, startHeight + delta));
    leftInputEl.style.height = newHeight + 'px';
  }

  function onInputMouseUp() {
    inputResizeHandle.classList.remove('dragging');
    document.removeEventListener('mousemove', onInputMouseMove);
    document.removeEventListener('mouseup', onInputMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  document.body.style.cursor = 'ns-resize';
  document.body.style.userSelect = 'none';
  document.addEventListener('mousemove', onInputMouseMove);
  document.addEventListener('mouseup', onInputMouseUp);
});

// Search
const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');
const searchBox = searchInput.closest('.search-box');

function runSearch() {
  const query = searchInput.value.trim().toLowerCase();
  searchBox.classList.toggle('has-value', !!searchInput.value);

  if (!query) {
    document.querySelectorAll('.tree-item, .tree-sub-item, .tree-row').forEach(el => el.style.display = '');
    document.querySelectorAll('.tree-item, .tree-sub-item').forEach(el => el.classList.remove('expanded'));
    return;
  }

  const matches = t => t.toLowerCase().includes(query);

  // Leaf rows
  document.querySelectorAll('.tree-row').forEach(row => {
    const text = row.querySelector('span')?.textContent ?? row.textContent;
    row.style.display = matches(text) ? '' : 'none';
  });

  // Sub-items: if the sub-item label matches, show all its children
  document.querySelectorAll('.tree-sub-item').forEach(sub => {
    const label = sub.querySelector(':scope > .toggle-row .row-label span')?.textContent ?? '';
    if (matches(label)) {
      sub.querySelectorAll('.tree-row').forEach(r => r.style.display = '');
    }
    const hasVisible = [...sub.querySelectorAll('.tree-row')].some(r => r.style.display !== 'none');
    sub.style.display = hasVisible ? '' : 'none';
    sub.classList.toggle('expanded', hasVisible);
  });

  // Top-level items: if the item label matches, show all its descendants
  document.querySelectorAll('.tree-item').forEach(item => {
    const label = item.querySelector(':scope > .toggle-row .row-label span')?.textContent ?? '';
    if (matches(label)) {
      item.querySelectorAll('.tree-row, .tree-sub-item').forEach(el => el.style.display = '');
      item.querySelectorAll('.tree-sub-item').forEach(el => el.classList.add('expanded'));
    }
    const hasVisible = [...item.querySelectorAll('.tree-row, .tree-sub-item')].some(el => el.style.display !== 'none');
    item.style.display = hasVisible ? '' : 'none';
    item.classList.toggle('expanded', hasVisible);
  });
}

searchInput.addEventListener('input', runSearch);

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  runSearch();
  searchInput.focus();
});

// Sort
let currentSort = 'bugs-desc';
const sortBtn = document.getElementById('sort-btn');
const sortMenu = document.getElementById('sort-menu');
const sortLabel = document.getElementById('sort-label');

sortBtn.addEventListener('click', e => {
  e.stopPropagation();
  const open = sortMenu.classList.toggle('open');
  sortBtn.classList.toggle('open', open);
});

document.addEventListener('click', () => {
  sortMenu.classList.remove('open');
  sortBtn.classList.remove('open');
});

sortMenu.addEventListener('click', e => {
  const option = e.target.closest('.sort-option');
  if (!option) return;
  currentSort = option.dataset.value;
  sortLabel.textContent = option.textContent;
  sortMenu.querySelectorAll('.sort-option').forEach(o => o.classList.toggle('selected', o === option));
  sortMenu.classList.remove('open');
  sortBtn.classList.remove('open');
  sortTreeItems();
});

function getBugCount(el) {
  const badge = el.querySelector(':scope > .toggle-row .badge-pink');
  if (!badge) return 0;
  const num = parseInt(badge.textContent.trim());
  return isNaN(num) ? 0 : num;
}

function getRowBugPriority(row) {
  if (row.querySelector('.badge-pink'))  return 3;
  if (row.querySelector('.badge-blue'))  return 2;
  if (row.querySelector('.badge-draft')) return 1;
  return 0;
}

function getLabel(el) {
  return el.querySelector(':scope > .toggle-row .row-label span')?.textContent ?? '';
}

function getRowLabel(row) {
  return row.querySelector('.test-item-label span')?.textContent ?? '';
}

function compareFn(a, b, getA, getB) {
  if (currentSort === 'name-asc')  return getA(a).localeCompare(getB(b));
  if (currentSort === 'name-desc') return getB(b).localeCompare(getA(a));
  return 0;
}

function sortTreeItems() {
  const main = document.querySelector('.main');
  const items = [...main.querySelectorAll(':scope > .tree-item')];

  items.forEach(item => {
    const childrenEl = item.querySelector(':scope > .tree-children');
    if (!childrenEl) return;
    const subItems = [...childrenEl.querySelectorAll(':scope > .tree-sub-item')];

    subItems.sort((a, b) => currentSort === 'bugs-desc'
      ? getBugCount(b) - getBugCount(a)
      : compareFn(a, b, getLabel, getLabel));
    subItems.forEach(s => childrenEl.appendChild(s));

    subItems.forEach(sub => {
      const subChildrenEl = sub.querySelector(':scope > .tree-children');
      if (!subChildrenEl) return;
      const rows = [...subChildrenEl.querySelectorAll(':scope > .tree-row')];

      rows.sort((a, b) => currentSort === 'bugs-desc'
        ? getRowBugPriority(b) - getRowBugPriority(a)
        : compareFn(a, b, getRowLabel, getRowLabel));
      rows.forEach(r => subChildrenEl.appendChild(r));
    });
  });

  items.sort((a, b) => currentSort === 'bugs-desc'
    ? getBugCount(b) - getBugCount(a)
    : compareFn(a, b, getLabel, getLabel));

  const emptyState = document.getElementById('empty-state');
  items.forEach(item => main.insertBefore(item, emptyState));
}

sortTreeItems();

// Empty state
const emptyState = document.getElementById('empty-state');

function checkEmptyState() {
  const hasRows = document.querySelectorAll('.tree-row').length > 0;
  emptyState.style.display = hasRows ? 'none' : 'flex';
}

checkEmptyState();

// Delete selected flows
const deleteBtn = document.querySelector('.batch-bar-actions .icon-btn[data-tooltip="Delete flows"]');
deleteBtn.addEventListener('click', () => {
  document.querySelectorAll('.tree-row .row-checkbox:checked').forEach(cb => {
    cb.closest('.tree-row').remove();
  });
  document.querySelectorAll('.tree-sub-item').forEach(sub => {
    if (!sub.querySelector('.tree-row')) sub.remove();
  });
  document.querySelectorAll('.tree-item').forEach(item => {
    if (!item.querySelector('.tree-row')) item.remove();
  });
  updateRunBtn();
  checkEmptyState();
});
