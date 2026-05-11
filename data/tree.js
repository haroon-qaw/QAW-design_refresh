// Tree data for the Map view.
// Each top-level item has groups; each group has tests.
// status: 'green' (passing), 'blue' (maintenance), 'pink' (bug), 'draft'
window.TREE_DATA = [
  {
    name: 'Mobile App',
    groups: [
      {
        name: 'Onboarding & Auth',
        tests: [
          { status: 'green', label: 'Guest checkout completes without account creation' },
          { status: 'green', label: 'Returns existing user to home screen after login' },
          { status: 'blue',  label: 'Add biometric login for returning users' },
          { status: 'pink',  label: 'Validate password reset link triggers successful recovery email' },
          { status: 'draft', label: 'Implement social login via Google' },
        ],
      },
      {
        name: 'Location & Store',
        tests: [
          { status: 'green', label: 'Detects nearest store using device GPS' },
          { status: 'green', label: 'Displays store hours and pickup availability' },
          { status: 'green', label: 'Allows manual store search by zip code' },
          { status: 'blue',  label: 'Improve store filter by drive-thru availability' },
          { status: 'draft', label: 'Add favorite store persistence across sessions' },
        ],
      },
      {
        name: 'Royal Perks',
        tests: [
          { status: 'green', label: 'Displays current crown points balance on home screen' },
          { status: 'green', label: 'Redeems earned reward at checkout successfully' },
          { status: 'blue',  label: 'Add push notification for expiring rewards' },
          { status: 'pink',  label: 'Verify Crowns balance updates immediately after purchase' },
          { status: 'draft', label: 'Show points earned in order confirmation' },
        ],
      },
    ],
  },
  {
    name: 'Menu & Customization',
    groups: [
      {
        name: 'Product Discovery',
        tests: [
          { status: 'green', label: 'Browses menu categories without errors' },
          { status: 'green', label: 'Displays item calories and allergen info' },
          { status: 'green', label: 'Shows featured items on home screen' },
          { status: 'blue',  label: 'Improve search to include ingredient keywords' },
          { status: 'draft', label: 'Add seasonal items carousel to home screen' },
        ],
      },
      {
        name: 'Configuration',
        tests: [
          { status: 'green', label: 'Adds bacon to Whopper successfully' },
          { status: 'green', label: 'Removes pickles from sandwich' },
          { status: 'green', label: 'Selects no-onion modification and persists to cart' },
          { status: 'blue',  label: 'Add multi-item bulk customization option' },
          { status: 'pink',  label: 'Confirm premium add-on charges (Bacon/Cheese) calculate correctly' },
        ],
      },
    ],
  },
  {
    name: 'Checkout & Payment',
    groups: [
      {
        name: 'Cart Management',
        tests: [
          { status: 'green', label: 'Adds multiple items to cart without duplication' },
          { status: 'green', label: 'Updates item quantity from cart screen' },
          { status: 'blue',  label: 'Show estimated wait time in cart summary' },
          { status: 'green', label: 'Test manual promo code application for valid discount' },
          { status: 'draft', label: 'Allow saving cart as a favorite order' },
        ],
      },
      {
        name: 'Payment Processing',
        tests: [
          { status: 'green', label: 'Completes payment with saved credit card' },
          { status: 'green', label: 'Applies valid promo code discount at checkout' },
          { status: 'green', label: 'Processes Apple Pay transaction end-to-end' },
          { status: 'blue',  label: 'Support split payment across two methods' },
          { status: 'draft', label: 'Add PayPal as payment option' },
        ],
      },
    ],
  },
  {
    name: 'Fulfillment & Logistics',
    groups: [
      {
        name: 'Order Method',
        tests: [
          { status: 'green', label: 'Places drive-thru mobile order with correct ETA' },
          { status: 'green', label: 'Selects dine-in and assigns table number' },
          { status: 'blue',  label: 'Add curbside pickup option for all store types' },
          { status: 'green', label: 'Validate delivery address pin-drop accuracy on map' },
          { status: 'draft', label: 'Support delivery via third-party integration' },
        ],
      },
      {
        name: 'Post-Order',
        tests: [
          { status: 'green', label: 'Displays live order status tracker after purchase' },
          { status: 'green', label: 'Sends push notification when order is ready' },
          { status: 'green', label: 'Allows order cancellation within 60-second window' },
          { status: 'blue',  label: 'Improve ETA accuracy during peak hours' },
          { status: 'draft', label: 'Add receipt email with itemized order details' },
        ],
      },
    ],
  },
  {
    name: 'Store Operations & Kiosk',
    groups: [
      {
        name: 'Hardware & Sync',
        tests: [
          { status: 'green', label: 'Kiosk order syncs to kitchen display within 5 seconds' },
          { status: 'green', label: 'Payment terminal accepts contactless tap to pay' },
          { status: 'blue',  label: 'Add idle screen reset after 2-minute timeout' },
          { status: 'green', label: 'Verify real-time inventory sync hides out-of-stock items' },
          { status: 'draft', label: 'Support multi-language display on kiosk UI' },
        ],
      },
    ],
  },
];

// ── Renderer ──────────────────────────────────────────────────────────────
// SVG icons used by the tree. Inlined here so the rendered HTML matches the
// original markup byte-for-byte (so the existing CSS selectors keep working).
const SVG = {
  chevron: '<svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  badge16: {
    green: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    blue:  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/></svg>',
    pink:  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20v-9"/><path d="M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z"/><path d="M14.12 3.88 16 2"/><path d="M21 21a4 4 0 0 0-3.81-4"/><path d="M21 5a4 4 0 0 1-3.55 3.97"/><path d="M22 13h-4"/><path d="M3 21a4 4 0 0 1 3.81-4"/><path d="M3 5a4 4 0 0 0 3.55 3.97"/><path d="M6 13H2"/><path d="m8 2 1.88 1.88"/><path d="M9 7.13V6a3 3 0 1 1 6 0v1.13"/></svg>',
    draft: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
  },
  badge12: {
    green: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    blue:  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/></svg>',
    pink:  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20v-9"/><path d="M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z"/><path d="M14.12 3.88 16 2"/><path d="M21 21a4 4 0 0 0-3.81-4"/><path d="M21 5a4 4 0 0 1-3.55 3.97"/><path d="M22 13h-4"/><path d="M3 21a4 4 0 0 1 3.81-4"/><path d="M3 5a4 4 0 0 0 3.55 3.97"/><path d="M6 13H2"/><path d="m8 2 1.88 1.88"/><path d="M9 7.13V6a3 3 0 1 1 6 0v1.13"/></svg>',
    draft: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
  },
};

const STATUS_ORDER = ['green', 'blue', 'pink', 'draft'];

// Escape `&` and `<` in user-supplied labels so we can interpolate into HTML safely.
function escapeText(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

function countByStatus(tests) {
  const counts = { green: 0, blue: 0, pink: 0, draft: 0 };
  tests.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
  return counts;
}

function renderBadges(counts, size) {
  const svgs = size === 16 ? SVG.badge16 : SVG.badge12;
  return STATUS_ORDER
    .filter(status => counts[status] > 0)
    .map(status => `<div class="badge badge-${status}">${svgs[status]}${counts[status]}</div>`)
    .join('');
}

function renderTestRow(test) {
  const svg = SVG.badge12[test.status];
  return `<div class="tree-row"><div class="test-item-label"><div class="badge badge-${test.status}">${svg}</div><span>${escapeText(test.label)}</span></div></div>`;
}

function renderSubItem(group) {
  const counts = countByStatus(group.tests);
  const rows = group.tests.map(renderTestRow).join('');
  return `
    <div class="tree-sub-item">
      <div class="toggle-row">
        <div class="row-label">
          ${SVG.chevron}
          <span>${escapeText(group.name)}</span>
        </div>
        <div class="badges">${renderBadges(counts, 16)}</div>
      </div>
      <div class="tree-children">${rows}</div>
    </div>`;
}

function renderTreeItem(item) {
  const totalCounts = { green: 0, blue: 0, pink: 0, draft: 0 };
  let total = 0;
  item.groups.forEach(g => {
    const c = countByStatus(g.tests);
    STATUS_ORDER.forEach(s => totalCounts[s] += c[s]);
    total += g.tests.length;
  });
  const subItems = item.groups.map(renderSubItem).join('');
  return `
    <div class="tree-item">
      <div class="toggle-row">
        <div class="row-label">
          ${SVG.chevron}
          <span>${escapeText(item.name)}</span>
        </div>
        <div class="badges">${renderBadges(totalCounts, 16)}</div>
        <div class="badge badge-total">${total}</div>
      </div>
      <div class="tree-children">${subItems}</div>
    </div>`;
}

// ── Mapped flows data ─────────────────────────────────────────────────────
window.MAPPED_FLOWS_DATA = [
  {
    name: 'Royal Perks',
    groups: [
      {
        name: 'Crown Points',
        tests: [
          {
            label: 'Applies double Crown Points during BK promotional period',
            arrange: 'Sign in to a Royal Perks account and ensure a double-points promotion is active.',
            act: 'Add a Whopper combo to the cart and complete checkout.',
            assert: 'Crown Points balance reflects double points for the qualifying purchase.',
          },
          {
            label: 'Prevents Crown Points accrual on already-discounted items',
            arrange: 'Sign in to a Royal Perks account and add a BOGO-discounted item to the cart.',
            act: 'Complete checkout with the discounted item and no other items.',
            assert: 'No Crown Points are awarded and the points balance remains unchanged.',
          },
        ],
      },
      {
        name: 'Reward Redemption',
        tests: [
          {
            label: 'Blocks free Whopper redemption below minimum cart threshold',
            arrange: 'Sign in to a Royal Perks account with a free Whopper reward available.',
            act: 'Attempt to redeem the reward with an empty cart.',
            assert: 'Redemption is blocked and a minimum order requirement message is shown.',
          },
          {
            label: 'Shows expiry warning 7 days before reward deadline',
            arrange: 'Sign in to a Royal Perks account with a reward expiring in 6 days.',
            act: 'Open the Rewards tab in the app.',
            assert: 'A yellow expiry warning badge is displayed on the qualifying reward card.',
          },
        ],
      },
      {
        name: 'Streak Rewards',
        tests: [
          {
            label: 'Awards streak bonus after 5 consecutive weekly purchases',
            arrange: 'Sign in to a Royal Perks account with a 4-week active purchase streak.',
            act: 'Complete a qualifying purchase to trigger the 5th consecutive week.',
            assert: 'A streak bonus of 250 Crown Points is credited and a celebration animation plays.',
          },
          {
            label: 'Resets weekly streak counter when no qualifying purchase is made',
            arrange: 'Sign in to a Royal Perks account with a 3-week active purchase streak.',
            act: 'Allow one full calendar week to pass without making any qualifying purchase.',
            assert: 'The streak counter resets to zero and the streak progress indicator clears.',
          },
        ],
      },
    ],
  },
  {
    name: 'Promotions',
    groups: [
      {
        name: 'Coupon Codes',
        tests: [
          {
            label: 'Rejects expired BK coupon codes at checkout',
            arrange: 'Add a Crispy Chicken Sandwich to the cart and navigate to checkout.',
            act: 'Enter an expired promo code in the coupon field and tap Apply.',
            assert: 'An inline error reads "This offer has expired" and no discount is applied.',
          },
          {
            label: 'Prevents stacking multiple single-use coupon codes',
            arrange: 'Apply a valid single-use coupon code and verify the discount appears.',
            act: 'Enter a second single-use coupon code in the promo field and tap Apply.',
            assert: 'The second code is rejected with a message that only one offer can be applied.',
          },
        ],
      },
      {
        name: 'Limited Time Offers',
        tests: [
          {
            label: 'Hides LTO menu items after campaign end date passes',
            arrange: 'Set the system date to one day after the LTO campaign end date.',
            act: 'Open the BK app and navigate to the full menu.',
            assert: 'The limited-time item no longer appears in any menu category or search results.',
          },
          {
            label: 'Surfaces active LTO on home screen during promotion window',
            arrange: 'Set the system date to within the active LTO campaign window.',
            act: 'Launch the BK app and land on the home screen.',
            assert: 'The LTO banner is displayed in the featured items carousel above the fold.',
          },
        ],
      },
    ],
  },
];

const SVG_TRASH = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
const SVG_SAVE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>';

function renderRowActions() {
  return `<div class="row-actions">
    <button class="icon-btn row-action-discard" data-tooltip="Discard">${SVG_TRASH}</button>
    <button class="icon-btn row-action-save" data-tooltip="Save">${SVG_SAVE_ICON}</button>
  </div>`;
}

function renderMappedFlowItem(test) {
  return `
    <div class="mapped-flow-item">
      <div class="toggle-row">
        <div class="row-label">
          ${SVG.chevron}
          <span class="flow-label">${escapeText(test.label)}</span>
        </div>
        ${renderRowActions()}
      </div>
      <div class="tree-children">
        <div class="flow-aaa-line"><span class="aaa-prefix">Arrange:</span> ${escapeText(test.arrange)}</div>
        <div class="flow-aaa-line"><span class="aaa-prefix">Act:</span> ${escapeText(test.act)}</div>
        <div class="flow-aaa-line"><span class="aaa-prefix">Assert:</span> ${escapeText(test.assert)}</div>
      </div>
    </div>`;
}

function renderMappedSubItem(group) {
  const rows = group.tests.map(renderMappedFlowItem).join('');
  return `
    <div class="tree-sub-item">
      <div class="toggle-row">
        <div class="row-label">
          ${SVG.chevron}
          <span>${escapeText(group.name)}</span>
        </div>
        ${renderRowActions()}
      </div>
      <div class="tree-children">${rows}</div>
    </div>`;
}

function renderMappedTreeItem(item) {
  const subItems = item.groups.map(renderMappedSubItem).join('');
  return `
    <div class="tree-item">
      <div class="toggle-row">
        <div class="row-label">
          ${SVG.chevron}
          <span>${escapeText(item.name)}</span>
        </div>
        ${renderRowActions()}
      </div>
      <div class="tree-children">${subItems}</div>
    </div>`;
}

window.SVG_TREE = SVG;

window.renderMappedTree = function renderMappedTree(data, container) {
  const html = data.map(renderMappedTreeItem).join('');
  container.insertAdjacentHTML('beforeend', html);
};

// Flat ordered list of all mapped flows for incremental rendering
window.MAPPED_FLOWS_FLAT = [];
window.MAPPED_FLOWS_DATA.forEach(item => {
  item.groups.forEach(group => {
    group.tests.forEach(test => {
      window.MAPPED_FLOWS_FLAT.push({ parentName: item.name, subName: group.name, test });
    });
  });
});

window.renderMappedFlowItemHTML = renderMappedFlowItem;

window.renderMappedSubItemShellHTML = function(subName) {
  return `<div class="tree-sub-item expanded" data-group-name="${escapeText(subName)}">
    <div class="toggle-row">
      <div class="row-label">${SVG.chevron}<span>${escapeText(subName)}</span></div>
      ${renderRowActions()}
    </div>
    <div class="tree-children"></div>
  </div>`;
};

window.renderMappedTreeItemShellHTML = function(parentName) {
  return `<div class="tree-item expanded" data-group-name="${escapeText(parentName)}">
    <div class="toggle-row">
      <div class="row-label">${SVG.chevron}<span>${escapeText(parentName)}</span></div>
      ${renderRowActions()}
    </div>
    <div class="tree-children"></div>
  </div>`;
};

window.renderTree = function renderTree(data, container, emptyStateEl) {
  const html = data.map(renderTreeItem).join('');
  // Insert before the empty-state element so it stays at the bottom of <main>.
  if (emptyStateEl && emptyStateEl.parentElement === container) {
    emptyStateEl.insertAdjacentHTML('beforebegin', html);
  } else {
    container.insertAdjacentHTML('beforeend', html);
  }
};
