// Render the existing tree into the all-flows panel.
const allFlowsPanel = document.getElementById('panel-all-flows');
const mainEl = document.querySelector('.main');
const emptyStateEl = document.getElementById('empty-state');
window.renderTree(window.TREE_DATA, allFlowsPanel, emptyStateEl);

document.querySelectorAll('#panel-all-flows .tree-item > .toggle-row, #panel-all-flows .tree-sub-item > .toggle-row').forEach(row => {
  row.addEventListener('click', () => {
    row.parentElement.classList.toggle('expanded');
  });
});

// Inject checkboxes into the all-flows panel
document.querySelectorAll('#panel-all-flows .toggle-row, #panel-all-flows .tree-row').forEach(row => {
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

document.getElementById('playground-status').addEventListener('click', () => {
  const statusEl = document.getElementById('playground-status');
  if (!statusEl.classList.contains('expandable')) return;
  const flowList = document.getElementById('mapped-flow-list');
  const expanded = statusEl.classList.toggle('expanded');
  flowList.classList.toggle('open', expanded);
  if (expanded) flowList.scrollTop = flowList.scrollHeight;
});

const mapNewFlowsBtn = document.getElementById('map-new-flows-btn');
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
      addNextMappedFlow();
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
      setTimeout(() => {
        browserPlaceholder.remove();
        playgroundBlock.style.position = 'static';
        if (preMappingPanelWidth) {
          leftPanelContent.style.width = preMappingContentWidth;
          leftPanel.style.width = preMappingPanelWidth;
          updateSidebarVar();
        }
      }, 400);
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

  // Reset mapped flows panel for a fresh run
  mappedFlowIndex = 0;
  mappedTreeInitialized = false;
  document.getElementById('panel-new-mapped-flows').querySelectorAll('.tree-item').forEach(el => el.remove());

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
    preMappingContentWidth = leftPanelContent.style.width || (leftPanelContent.offsetWidth + 'px');
    preMappingPanelWidth = leftPanel.style.width || (leftPanel.offsetWidth + 'px');
    leftPanelContent.style.width = maxWidth + 'px';
    leftPanel.style.width = (48 + maxWidth) + 'px';
    updateSidebarVar();
    // Reveal the NMF tab now that flows are incoming
    const nmfTab = document.querySelector('[data-tab="new-mapped-flows"]');
    nmfTab.style.display = '';
    document.getElementById('main-tabs').classList.remove('single');
    switchTab('new-mapped-flows');
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

const runBtn = document.getElementById('run-all-flows-btn');

const batchBar = document.getElementById('batch-bar');
const batchCount = document.getElementById('batch-count');
const batchRunBtn = document.getElementById('batch-run-btn');
const batchDeselect = document.getElementById('batch-deselect');
const mainWrap = document.querySelector('.main-wrap');

// Keep batch bar left edge flush with main-wrap regardless of sidebar width.
new ResizeObserver(() => {
  batchBar.style.left = mainWrap.getBoundingClientRect().left + 'px';
}).observe(mainWrap);

function getActiveTab() {
  return document.querySelector('.main-tab.active')?.dataset.tab || 'all-flows';
}

function updateRunBtn() {
  const isAllFlows = getActiveTab() === 'all-flows';
  const count = isAllFlows
    ? document.querySelectorAll('#panel-all-flows .tree-row .row-checkbox:checked').length
    : document.querySelectorAll('#panel-new-mapped-flows .mapped-flow-item .row-checkbox:checked').length;
  const s = count === 1 ? '' : 's';
  if (isAllFlows) {
    runBtn.textContent = count > 0 ? `Run ${count} flow${s}` : 'Run all flows';
  }
  batchCount.textContent = `${count} flow${s} selected`;
  batchRunBtn.textContent = `Run ${count} flow${s}`;
  const batchSaveBtn = document.getElementById('batch-save-selected-btn');
  if (batchSaveBtn) batchSaveBtn.textContent = `Save ${count} flow${s}`;
  const batchDiscardBtn = document.getElementById('batch-discard-selected-btn');
  if (batchDiscardBtn) batchDiscardBtn.textContent = `Discard ${count} flow${s}`;
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
  const panel = getActiveTab() === 'all-flows' ? '#panel-all-flows' : '#panel-new-mapped-flows';
  document.querySelectorAll(`${panel} .row-checkbox`).forEach(cb => {
    cb.checked = false;
    cb.indeterminate = false;
  });
  updateRunBtn();
});

document.querySelectorAll('#panel-all-flows .row-checkbox').forEach(cb => {
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
}
updateSidebarVar();

const closeSvg = `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m10 15-3-3 3-3"/>`;
const openSvg  = `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/>`;
let savedPanelWidth = null;
let preMappingPanelWidth = null;
let preMappingContentWidth = null;
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
  } else {
    if (savedPanelWidth) leftPanel.style.width = savedPanelWidth;
    if (savedContentWidth) content.style.width = savedContentWidth;
    document.documentElement.style.setProperty('--sidebar-width', savedPanelWidth || '448px');
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
  allFlowsPanel.querySelectorAll('.tree-item, .tree-sub-item').forEach(el => {
    el.classList.toggle('expanded', allExpanded);
  });
  expandCollapseBtn.dataset.tooltip = allExpanded ? 'Collapse groups' : 'Expand groups';
  expandCollapseBtn.querySelector('svg').innerHTML = allExpanded ? collapseIcon : expandIcon;
});

const mappedExpandBtn = document.getElementById('mapped-expand-btn');
let mappedAllExpanded = true;
mappedExpandBtn.addEventListener('click', () => {
  mappedAllExpanded = !mappedAllExpanded;
  const panel = document.getElementById('panel-new-mapped-flows');
  panel.querySelectorAll('.tree-item, .tree-sub-item').forEach(el => {
    el.classList.toggle('expanded', mappedAllExpanded);
  });
  mappedExpandBtn.dataset.tooltip = mappedAllExpanded ? 'Collapse groups' : 'Expand groups';
  mappedExpandBtn.querySelector('svg').innerHTML = mappedAllExpanded ? collapseIcon : expandIcon;
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
  else if (badge.classList.contains('badge-total'))  badge.dataset.tooltip = `${num} total flow${s}`;
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

  function onMouseMove(e) {
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + e.clientX - startX));
    leftPanelContent.style.width = newWidth + 'px';
    leftPanel.style.width = (48 + newWidth) + 'px';
    updateSidebarVar();
  }
  function onMouseUp() {
    leftPanel.style.transition = '';
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
    allFlowsPanel.querySelectorAll('.tree-item, .tree-sub-item, .tree-row').forEach(el => el.style.display = '');
    allFlowsPanel.querySelectorAll('.tree-item, .tree-sub-item').forEach(el => el.classList.remove('expanded'));
    return;
  }

  const matches = t => t.toLowerCase().includes(query);

  // Leaf rows
  allFlowsPanel.querySelectorAll('.tree-row').forEach(row => {
    const text = row.querySelector('span')?.textContent ?? row.textContent;
    row.style.display = matches(text) ? '' : 'none';
  });

  // Sub-items: if the sub-item label matches, show all its children
  allFlowsPanel.querySelectorAll('.tree-sub-item').forEach(sub => {
    const label = sub.querySelector(':scope > .toggle-row .row-label span')?.textContent ?? '';
    if (matches(label)) {
      sub.querySelectorAll('.tree-row').forEach(r => r.style.display = '');
    }
    const hasVisible = [...sub.querySelectorAll('.tree-row')].some(r => r.style.display !== 'none');
    sub.style.display = hasVisible ? '' : 'none';
    sub.classList.toggle('expanded', hasVisible);
  });

  // Top-level items: if the item label matches, show all its descendants
  allFlowsPanel.querySelectorAll('.tree-item').forEach(item => {
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

// Mapped search
const mappedSearchInput = document.getElementById('mapped-search-input');
const mappedSearchClear = document.getElementById('mapped-search-clear');
const mappedSearchBox = mappedSearchInput.closest('.search-box');

function runMappedSearch() {
  const query = mappedSearchInput.value.trim().toLowerCase();
  mappedSearchBox.classList.toggle('has-value', !!mappedSearchInput.value);
  const panel = document.getElementById('panel-new-mapped-flows');

  if (!query) {
    panel.querySelectorAll('.tree-item, .tree-sub-item, .mapped-flow-item').forEach(el => el.style.display = '');
    return;
  }

  const matches = t => t.toLowerCase().includes(query);

  // Leaf flows
  panel.querySelectorAll('.mapped-flow-item').forEach(item => {
    const text = item.querySelector('.flow-label')?.textContent ?? item.textContent;
    item.style.display = matches(text) ? '' : 'none';
  });

  // Sub-items: if label matches, show all its flows
  panel.querySelectorAll('.tree-sub-item').forEach(sub => {
    const label = sub.querySelector(':scope > .toggle-row .row-label span')?.textContent ?? '';
    if (matches(label)) {
      sub.querySelectorAll('.mapped-flow-item').forEach(f => f.style.display = '');
    }
    const hasVisible = [...sub.querySelectorAll('.mapped-flow-item')].some(f => f.style.display !== 'none');
    sub.style.display = hasVisible ? '' : 'none';
    if (hasVisible) sub.classList.add('expanded');
  });

  // Top-level items: if label matches, show all descendants
  panel.querySelectorAll('.tree-item').forEach(item => {
    const label = item.querySelector(':scope > .toggle-row .row-label span')?.textContent ?? '';
    if (matches(label)) {
      item.querySelectorAll('.mapped-flow-item, .tree-sub-item').forEach(el => el.style.display = '');
      item.querySelectorAll('.tree-sub-item').forEach(el => el.classList.add('expanded'));
    }
    const hasVisible = [...item.querySelectorAll('.mapped-flow-item, .tree-sub-item')].some(el => el.style.display !== 'none');
    item.style.display = hasVisible ? '' : 'none';
    if (hasVisible) item.classList.add('expanded');
  });
}

mappedSearchInput.addEventListener('input', runMappedSearch);

mappedSearchClear.addEventListener('click', () => {
  mappedSearchInput.value = '';
  runMappedSearch();
  mappedSearchInput.focus();
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
  const main = allFlowsPanel;
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

// ── Tab switching ──────────────────────────────────────────────────────────
let mappedTreeInitialized = false;
let mappedFlowIndex = 0;

function initMappedTree() {
  if (mappedTreeInitialized) return;
  mappedTreeInitialized = true;
  const panel = document.getElementById('panel-new-mapped-flows');
  panel.insertAdjacentHTML('beforeend', mappedSkeletonHTML());
}

function handleMappedCbChange(cb) {
  const tr = cb.closest('.toggle-row');
  if (tr) {
    const container = tr.parentElement;
    container.querySelectorAll('.row-checkbox').forEach(c => {
      if (c !== cb) { c.checked = cb.checked; c.indeterminate = false; }
    });
  }
  ['tree-sub-item', 'tree-item'].forEach(cls => {
    const anc = cb.closest('.' + cls);
    if (!anc) return;
    const parentCb = anc.querySelector(':scope > .toggle-row .row-checkbox');
    if (!parentCb) return;
    const childCbs = [...anc.querySelectorAll('.row-checkbox')].filter(c => c !== parentCb);
    const checked = childCbs.filter(c => c.checked).length;
    const indet = childCbs.filter(c => c.indeterminate).length;
    parentCb.indeterminate = false;
    if (checked === childCbs.length) parentCb.checked = true;
    else if (checked > 0 || indet > 0) { parentCb.checked = false; parentCb.indeterminate = true; }
    else parentCb.checked = false;
  });
  updateRunBtn();
}

function attachMappedCb(toggleRow) {
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'row-checkbox';
  cb.addEventListener('click', e => e.stopPropagation());
  cb.addEventListener('change', () => handleMappedCbChange(cb));
  toggleRow.appendChild(cb);
  return cb;
}

function mappedSkeletonHTML() {
  return `<div class="mapped-skeleton" id="mapped-skeleton">
    <div class="mapped-skeleton-inner">
      <div class="sk-line" style="width:32%"></div>
      <div class="sk-line" style="width:24%;margin-left:20px"></div>
      <div class="sk-line" style="width:52%;margin-left:40px"></div>
      <div class="sk-line" style="width:44%;margin-left:40px"></div>
    </div>
  </div>`;
}

function addNextMappedFlow() {
  const flows = window.MAPPED_FLOWS_FLAT;
  if (mappedFlowIndex >= flows.length) return;
  const { parentName, subName, test } = flows[mappedFlowIndex++];
  const panel = document.getElementById('panel-new-mapped-flows');

  // Find or create tree-item
  let treeItem = [...panel.querySelectorAll(':scope > .tree-item')].find(
    el => el.dataset.groupName === parentName
  );
  if (!treeItem) {
    document.getElementById('mapped-skeleton')?.remove();
    panel.insertAdjacentHTML('beforeend', window.renderMappedTreeItemShellHTML(parentName));
    treeItem = panel.lastElementChild;
    const tr = treeItem.querySelector(':scope > .toggle-row');
    tr.addEventListener('click', () => treeItem.classList.toggle('expanded'));
    attachMappedCb(tr);
  }

  // Find or create tree-sub-item
  const treeChildren = treeItem.querySelector(':scope > .tree-children');
  let subItem = [...treeChildren.querySelectorAll(':scope > .tree-sub-item')].find(
    el => el.dataset.groupName === subName
  );
  if (!subItem) {
    treeChildren.insertAdjacentHTML('beforeend', window.renderMappedSubItemShellHTML(subName));
    subItem = treeChildren.lastElementChild;
    const tr = subItem.querySelector(':scope > .toggle-row');
    tr.addEventListener('click', () => subItem.classList.toggle('expanded'));
    attachMappedCb(tr);
  }

  // Add flow item
  const subChildren = subItem.querySelector(':scope > .tree-children');
  subChildren.insertAdjacentHTML('beforeend', window.renderMappedFlowItemHTML(test));
  const flowItem = subChildren.lastElementChild;
  const flowTr = flowItem.querySelector(':scope > .toggle-row');
  flowTr.addEventListener('click', e => {
    if (e.target.closest('.row-actions')) return;
    flowItem.classList.toggle('expanded');
  });
  attachMappedCb(flowTr);
  const discardBtn = flowItem.querySelector('.row-action-discard');
  if (discardBtn) {
    discardBtn.addEventListener('click', e => {
      e.stopPropagation();
      flowItem.remove();
      updateRunBtn();
      const tabBadge = document.getElementById('mapped-tab-count');
      if (tabBadge) tabBadge.textContent = panel.querySelectorAll('.mapped-flow-item').length;
      checkMappedPanelEmpty();
    });
  }
  const saveBtn = flowItem.querySelector('.row-action-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', e => {
      e.stopPropagation();
      saveFlowsToAllFlows([flowItem]);
    });
  }

  // Populate sidebar flow list
  const flowList = document.getElementById('mapped-flow-list');
  const statusEl = document.getElementById('playground-status');
  if (flowList && statusEl) {
    const item = document.createElement('div');
    item.className = 'mapped-flow-list-item';
    const label = `${parentName} / ${subName} / ${test.label}`;
    item.textContent = label;
    item.title = label;
    flowList.appendChild(item);
    if (!statusEl.classList.contains('expandable')) {
      statusEl.classList.add('expandable');
    }
    if (flowList.classList.contains('open')) {
      flowList.scrollTop = flowList.scrollHeight;
    }
  }

  // Update tab count badge
  const tabBadge = document.getElementById('mapped-tab-count');
  if (tabBadge) tabBadge.textContent = panel.querySelectorAll('.mapped-flow-item').length;

  // If the next flow starts a new parent group, show a skeleton placeholder
  const nextFlow = flows[mappedFlowIndex];
  if (nextFlow && nextFlow.parentName !== parentName) {
    panel.insertAdjacentHTML('beforeend', mappedSkeletonHTML());
  }
}

function switchTab(tabName) {
  const isAllFlows = tabName === 'all-flows';
  allFlowsPanel.style.display = isAllFlows ? '' : 'none';
  const mappedPanel = document.getElementById('panel-new-mapped-flows');
  mappedPanel.style.display = isAllFlows ? 'none' : '';
  document.querySelectorAll('.main-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
  batchBar.classList.toggle('tab-mapped', !isAllFlows);
  if (!isAllFlows) initMappedTree();
  updateRunBtn();
}

document.getElementById('main-tabs').addEventListener('click', e => {
  const tab = e.target.closest('.main-tab');
  if (tab) switchTab(tab.dataset.tab);
});

// Empty state
const emptyState = document.getElementById('empty-state');

function checkEmptyState() {
  const hasRows = allFlowsPanel.querySelectorAll('.tree-row').length > 0;
  emptyState.style.display = hasRows ? 'none' : 'flex';
}

checkEmptyState();

// ── Save mapped flows → all-flows ─────────────────────────────────────────

function attachAllFlowsCb(row, isGroupRow) {
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'row-checkbox';
  cb.addEventListener('click', e => e.stopPropagation());
  cb.addEventListener('change', () => {
    if (isGroupRow) {
      const container = row.parentElement;
      container.querySelectorAll('.row-checkbox').forEach(c => {
        if (c !== cb) { c.checked = cb.checked; c.indeterminate = false; }
      });
    }
    updateAncestors(cb);
    updateRunBtn();
  });
  row.appendChild(cb);
}

function updateAllFlowsBadges(treeItem) {
  const svgs16 = window.SVG_TREE.badge16;
  function badgesHTML(counts) {
    return ['green','blue','pink','draft']
      .filter(s => counts[s] > 0)
      .map(s => `<div class="badge badge-${s}">${svgs16[s]}${counts[s]}</div>`)
      .join('');
  }
  function countRows(rows) {
    const c = { green: 0, blue: 0, pink: 0, draft: 0 };
    rows.forEach(r => {
      ['green','blue','pink','draft'].forEach(s => { if (r.querySelector('.badge-' + s)) c[s]++; });
    });
    return c;
  }
  treeItem.querySelectorAll(':scope > .tree-children > .tree-sub-item').forEach(sub => {
    const subBadges = sub.querySelector(':scope > .toggle-row .badges');
    if (subBadges) subBadges.innerHTML = badgesHTML(countRows([...sub.querySelectorAll('.tree-row')]));
  });
  const itemBadges = treeItem.querySelector(':scope > .toggle-row .badges');
  if (itemBadges) itemBadges.innerHTML = badgesHTML(countRows([...treeItem.querySelectorAll('.tree-row')]));
  const totalBadge = treeItem.querySelector(':scope > .toggle-row .badge-total');
  if (totalBadge) totalBadge.textContent = treeItem.querySelectorAll('.tree-row').length;
}

function checkMappedPanelEmpty() {
  const mappedPanel = document.getElementById('panel-new-mapped-flows');
  if (mappedPanel.querySelectorAll('.mapped-flow-item').length === 0) {
    switchTab('all-flows');
    const nmfTab = document.querySelector('[data-tab="new-mapped-flows"]');
    nmfTab.style.display = 'none';
    document.getElementById('main-tabs').classList.add('single');
  }
}

function saveFlowsToAllFlows(flowItems) {
  if (!flowItems.length) return;
  const chevron = window.SVG_TREE.chevron;
  const draftIcon12 = window.SVG_TREE.badge12.draft;

  [...flowItems].forEach(flowItem => {
    const label = flowItem.querySelector('.flow-label')?.textContent ?? '';
    const parentName = flowItem.closest('.tree-item')?.dataset.groupName ?? 'Saved Flows';
    const subName = flowItem.closest('.tree-sub-item')?.dataset.groupName ?? 'General';

    // Find or create tree-item in all-flows
    let treeItem = [...allFlowsPanel.querySelectorAll(':scope > .tree-item')].find(
      el => el.querySelector(':scope > .toggle-row .row-label span')?.textContent === parentName
    );
    if (!treeItem) {
      emptyState.insertAdjacentHTML('beforebegin', `
        <div class="tree-item expanded">
          <div class="toggle-row">
            <div class="row-label">${chevron}<span>${parentName}</span></div>
            <div class="badges"></div>
            <div class="badge badge-total">0</div>
          </div>
          <div class="tree-children"></div>
        </div>`);
      treeItem = emptyState.previousElementSibling;
      const tr = treeItem.querySelector(':scope > .toggle-row');
      tr.addEventListener('click', () => treeItem.classList.toggle('expanded'));
      attachAllFlowsCb(tr, true);
    }

    // Find or create tree-sub-item
    const treeChildren = treeItem.querySelector(':scope > .tree-children');
    let subItem = [...treeChildren.querySelectorAll(':scope > .tree-sub-item')].find(
      el => el.querySelector(':scope > .toggle-row .row-label span')?.textContent === subName
    );
    if (!subItem) {
      treeChildren.insertAdjacentHTML('beforeend', `
        <div class="tree-sub-item expanded">
          <div class="toggle-row">
            <div class="row-label">${chevron}<span>${subName}</span></div>
            <div class="badges"></div>
          </div>
          <div class="tree-children"></div>
        </div>`);
      subItem = treeChildren.lastElementChild;
      const tr = subItem.querySelector(':scope > .toggle-row');
      tr.addEventListener('click', () => subItem.classList.toggle('expanded'));
      attachAllFlowsCb(tr, true);
    }

    // Add draft tree-row
    const subChildren = subItem.querySelector(':scope > .tree-children');
    subChildren.insertAdjacentHTML('beforeend', `
      <div class="tree-row">
        <div class="test-item-label">
          <div class="badge badge-draft">${draftIcon12}</div>
          <span>${label}</span>
        </div>
      </div>`);
    attachAllFlowsCb(subChildren.lastElementChild, false);

    updateAllFlowsBadges(treeItem);
    flowItem.remove();
  });

  // Remove empty parents from mapped panel
  const mappedPanel = document.getElementById('panel-new-mapped-flows');
  mappedPanel.querySelectorAll('.tree-sub-item').forEach(sub => {
    if (!sub.querySelector('.mapped-flow-item')) sub.remove();
  });
  mappedPanel.querySelectorAll('.tree-item').forEach(item => {
    if (!item.querySelector('.mapped-flow-item')) item.remove();
  });

  const tabBadge = document.getElementById('mapped-tab-count');
  if (tabBadge) tabBadge.textContent = mappedPanel.querySelectorAll('.mapped-flow-item').length;

  updateRunBtn();
  checkEmptyState();
  checkMappedPanelEmpty();
}

// Save all flows button
document.getElementById('save-all-mapped-btn').addEventListener('click', () => {
  saveFlowsToAllFlows([...document.querySelectorAll('#panel-new-mapped-flows .mapped-flow-item')]);
});

// Batch save selected
document.getElementById('batch-save-selected-btn').addEventListener('click', () => {
  const checked = [...document.querySelectorAll('#panel-new-mapped-flows .mapped-flow-item .row-checkbox:checked')]
    .map(cb => cb.closest('.mapped-flow-item'));
  saveFlowsToAllFlows(checked);
  batchDeselect.click();
});

// Batch discard selected
document.getElementById('batch-discard-selected-btn').addEventListener('click', () => {
  const mappedPanel = document.getElementById('panel-new-mapped-flows');
  document.querySelectorAll('#panel-new-mapped-flows .mapped-flow-item .row-checkbox:checked').forEach(cb => {
    cb.closest('.mapped-flow-item').remove();
  });
  mappedPanel.querySelectorAll('.tree-sub-item').forEach(sub => {
    if (!sub.querySelector('.mapped-flow-item')) sub.remove();
  });
  mappedPanel.querySelectorAll('.tree-item').forEach(item => {
    if (!item.querySelector('.mapped-flow-item')) item.remove();
  });
  const tabBadge = document.getElementById('mapped-tab-count');
  if (tabBadge) tabBadge.textContent = mappedPanel.querySelectorAll('.mapped-flow-item').length;
  batchDeselect.click();
  checkMappedPanelEmpty();
});

// Delete selected flows
const deleteBtn = document.querySelector('#batch-actions-all .icon-btn[data-tooltip="Delete flows"]');
deleteBtn.addEventListener('click', () => {
  allFlowsPanel.querySelectorAll('.tree-row .row-checkbox:checked').forEach(cb => {
    cb.closest('.tree-row').remove();
  });
  allFlowsPanel.querySelectorAll('.tree-sub-item').forEach(sub => {
    if (!sub.querySelector('.tree-row')) sub.remove();
  });
  allFlowsPanel.querySelectorAll('.tree-item').forEach(item => {
    if (!item.querySelector('.tree-row')) item.remove();
  });
  updateRunBtn();
  checkEmptyState();
});
