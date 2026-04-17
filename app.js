// ===== CENTRALIZED DATA STORE =====
window.AIW = {
  status: 'Active',
  analytics: 'On',
  allocatedSeats: 93,
  purchasedSeats: 100,
  users: [
    { name: 'Quinn Odom', email: 'quinn.odom@acme.com', avatar: 'https://i.pravatar.cc/72?u=quinn', license: 'Full', lastActive: 'Sep 19, 2025' },
    { name: 'Jordan Bell', email: 'jordan.bell@acme.com', avatar: 'https://i.pravatar.cc/72?u=jordan', license: 'Full', lastActive: 'Sep 19, 2025' },
    { name: 'Skylar Luna', email: 'skylar.luna@acme.com', avatar: 'https://i.pravatar.cc/72?u=skylar', license: 'Full', lastActive: 'Sep 19, 2025' },
    { name: 'Jamie Stern', email: 'jamie.stern@acme.com', avatar: 'https://i.pravatar.cc/72?u=jamie', license: 'Basic', lastActive: 'Sep 19, 2025' },
    { name: 'Avery Park', email: 'avery.park@acme.com', avatar: 'https://i.pravatar.cc/72?u=avery', license: 'Basic', lastActive: 'Sep 19, 2025' }
  ],

  assignUser: function(user) {
    var exists = this.users.some(function(u) { return u.name === user.name; });
    if (exists) return false;
    var d = new Date();
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var today = months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    this.users.unshift({
      name: user.name,
      email: user.email,
      avatar: user.avatar || 'https://i.pravatar.cc/72?u=' + user.name.toLowerCase().replace(/\s+/g, ''),
      license: 'Full',
      lastActive: today
    });
    this.allocatedSeats++;
    return true;
  },

  unassignUser: function(userName) {
    var idx = -1;
    this.users.forEach(function(u, i) { if (u.name === userName) idx = i; });
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    this.allocatedSeats = Math.max(0, this.allocatedSeats - 1);
    return true;
  },

  unassignAndSyncProducts: function(userName) {
    var rows = document.querySelectorAll('.allusers-table tbody tr');
    rows.forEach(function(row) {
      var nameEl = row.querySelector('.allusers-user-name');
      if (!nameEl || nameEl.textContent.trim() !== userName.trim()) return;
      var tds = row.querySelectorAll('td');
      var prodTd = null;
      tds.forEach(function(td) {
        if (td.querySelector('.allusers-products') || td.querySelector('.allusers-dash')) prodTd = td;
      });
      if (!prodTd) return;
      var existingDiv = prodTd.querySelector('.allusers-products');
      if (!existingDiv) return;
      var products = (existingDiv.getAttribute('data-products') || '').split(',').filter(Boolean);
      var filtered = products.filter(function(p) { return p !== 'AI workflow'; });
      if (filtered.length === 0) {
        prodTd.innerHTML = '<span class="allusers-dash">&ndash;</span>';
      } else {
        existingDiv.setAttribute('data-products', filtered.join(','));
        window.AIW._renderProductTags(existingDiv, filtered);
      }
    });
  },

  syncAllViews: function() {
    var self = this;

    var metricVal = document.querySelector('.overview-metric .metric-value');
    if (metricVal) metricVal.textContent = self.allocatedSeats;
    var metricTotal = document.querySelector('.overview-metric .metric-value-total');
    if (metricTotal) metricTotal.textContent = '/ ' + self.purchasedSeats;

    var prodCell = document.querySelector('.product-row-clickable[data-route="aiworkflow"] td:nth-child(3)');
    if (prodCell) prodCell.textContent = self.allocatedSeats + ' / ' + self.purchasedSeats;

    var usersTab = document.querySelector('[data-aiw-tab="users"]');
    if (usersTab) usersTab.textContent = 'Users (' + self.allocatedSeats + ')';

    var aiwBulkBar = document.getElementById('aiw-bulk-bar');
    if (aiwBulkBar) aiwBulkBar.classList.remove('visible');
    var aiwHeaderCb = document.getElementById('aiw-header-cb');
    if (aiwHeaderCb) aiwHeaderCb.checked = false;

    var tbody = document.querySelector('#aiw-panel-users .users-table tbody');
    if (tbody) {
      tbody.innerHTML = '';
      self.users.forEach(function(u) {
        var tr = document.createElement('tr');
        var tagClass = u.license === 'Basic' ? 'mds-tag--sunshine' : 'mds-tag--lime';
        tr.innerHTML =
          '<td class="td-checkbox"><input type="checkbox" class="mds-checkbox"></td>' +
          '<td class="td-user"><div class="user-cell"><div class="user-avatar"><img src="' + u.avatar + '" alt=""></div><div class="user-info"><span class="user-name">' + u.name + '</span><span class="user-email">' + u.email + '</span></div></div></td>' +
          '<td><span class="mds-tag ' + tagClass + '">' + u.license + '</span></td>' +
          '<td><span class="cell-link">2 User groups</span></td>' +
          '<td><span class="cell-link">2 teams</span></td>' +
          '<td>' + u.lastActive + '</td>' +
          '<td class="td-more"><button class="mds-icon-btn" style="width:32px;height:32px;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/></svg></button></td>';
        tbody.appendChild(tr);
      });
    }

    self.syncAllusersProducts();
    if (window.bindAiwBulkActions) window.bindAiwBulkActions();
  },

  syncAllusersProducts: function() {
    var self = this;
    var aiwNames = self.users.map(function(u) { return u.name; });
    var rows = document.querySelectorAll('.allusers-table tbody tr');
    rows.forEach(function(row) {
      var nameEl = row.querySelector('.allusers-user-name');
      if (!nameEl) return;
      var userName = nameEl.textContent.trim();
      var isAssigned = aiwNames.indexOf(userName) !== -1;

      var tds = row.querySelectorAll('td');
      var prodTd = null;
      tds.forEach(function(td) {
        if (td.querySelector('.allusers-products') || td.querySelector('.allusers-dash')) {
          prodTd = td;
        }
      });
      if (!prodTd) return;

      var existingDiv = prodTd.querySelector('.allusers-products');
      if (existingDiv) {
        var currentProducts = (existingDiv.getAttribute('data-products') || '').split(',').filter(Boolean);
        if (isAssigned && currentProducts.indexOf('AI workflow') === -1) {
          currentProducts.push('AI workflow');
          existingDiv.setAttribute('data-products', currentProducts.join(','));
          self._renderProductTags(existingDiv, currentProducts);
        }
      } else if (isAssigned) {
        prodTd.innerHTML = '';
        var div = document.createElement('div');
        div.className = 'allusers-products mds-tooltip-wrap';
        div.setAttribute('data-products', 'AI workflow');
        div.innerHTML = '<span class="mds-tag mds-tag--ghost">AI workflow</span>';
        prodTd.appendChild(div);
        self._bindTooltip(div);
      }
    });
  },

  _renderProductTags: function(el, products) {
    el.innerHTML = '';
    if (products.length === 0) return;
    var first = document.createElement('span');
    first.className = 'mds-tag mds-tag--ghost';
    first.textContent = products[0];
    el.appendChild(first);
    if (products.length > 1) {
      var more = document.createElement('span');
      more.className = 'mds-tag mds-tag--ghost';
      more.textContent = '+ ' + (products.length - 1) + ' more';
      el.appendChild(more);
    }
    this._bindTooltip(el);
  },

  _bindTooltip: function(wrap) {
    if (wrap._tooltipBound) return;
    wrap._tooltipBound = true;
    wrap.addEventListener('mouseenter', function() {
      var prods = (wrap.getAttribute('data-products') || '').split(',').filter(Boolean);
      if (prods.length < 2) return;
      var tt = document.querySelector('.mds-tooltip-body');
      if (!tt) return;
      tt.innerHTML = '<ul>' + prods.map(function(p) { return '<li>' + p + '</li>'; }).join('') + '</ul>';
      tt.classList.add('visible');
      var rect = wrap.getBoundingClientRect();
      tt.style.left = (rect.left + rect.width / 2 - tt.offsetWidth / 2) + 'px';
      tt.style.top = (rect.top - tt.offsetHeight - 8) + 'px';
    });
    wrap.addEventListener('mouseleave', function() {
      var tt = document.querySelector('.mds-tooltip-body');
      if (tt) tt.classList.remove('visible');
    });
  }
};

// Charts
function drawChart(canvasId, data, color) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.scale(2, 2);
  var w = rect.width, h = rect.height;
  var max = Math.max.apply(null, data);
  var min = Math.min.apply(null, data);
  var range = max - min || 1;
  var padX = 8, padY = 8;
  var points = [];
  ctx.clearRect(0, 0, w, h);
  for (var i = 0; i < data.length; i++) {
    var x = padX + (i / (data.length - 1)) * (w - padX * 2);
    var y = h - padY - ((data[i] - min) / range) * (h - padY * 2);
    points.push({ x: x, y: y });
  }
  ctx.beginPath();
  for (var i = 0; i < points.length; i++) {
    if (i === 0) ctx.moveTo(points[i].x, points[i].y);
    else ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
  for (var i = 0; i < points.length; i++) {
    ctx.beginPath();
    ctx.arc(points[i].x, points[i].y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(points[i].x, points[i].y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
}

// ===== ORG POLICIES DATA STORE =====
window.OrgPolicies = {
  orgStats: {
    totalUsers: 450, activeUsers: 323, inactiveUsers: 127,
    totalTeams: 80, lowActivityTeams: 12,
    totalSpaces: 42, emptySpaces: 8,
    totalBoards: 1240,
    licenses: { full: 200, basic: 150, unused: 47, total: 350 },
    addOns: { prototyping: { allocated: 90, total: 100 }, insights: { allocated: 45, total: 50 } }
  },
  recommendations: [
    { id: 'rec-license', title: 'License Recycling', desc: '47 licenses are unused for 90+ days. Recycle to save costs and reallocate to active teams.' },
    { id: 'rec-reactivate', title: 'Reactivate inactive users', desc: '127 users have expired credentials but remain in project groups. Clean up suggested to maintain audit compliance.' },
    { id: 'rec-spaces', title: 'Space Consolidation', desc: '8 spaces have no active boards. Consolidate or archive to reduce clutter and improve navigation.' },
    { id: 'rec-addon', title: 'Add-on Optimization', desc: '3 teams frequently use diagramming features. Prototyping add-on would increase their productivity by ~30%.' },
    { id: 'rec-access', title: 'Access Policy Review', desc: '15 external guests have board-level access expiring soon. Review and update sharing permissions.' },
    { id: 'rec-compliance', title: 'Compliance Audit', desc: '4 teams have non-compliant content sharing settings. Run audit to align with org security policies.' }
  ]
};

function initCharts() {
  var blue = '#7b9eff';
  drawChart('chart-boards', [280, 310, 300, 320, 340, 330, 335, 320], blue);
  drawChart('chart-teams', [60, 65, 62, 68, 72, 75, 78, 82], blue);
  drawChart('chart-users', [100, 108, 105, 112, 115, 118, 122, 126], blue);
  drawChart('chart-licenses', [180, 190, 195, 200, 205, 210, 204, 200], blue);
}

// Greeting
(function() {
  var h = new Date().getHours();
  var greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  var el = document.getElementById('greeting');
  if (el) el.textContent = greet + ', Taylor';
})();

// Routing
function navigateTo(route) {
  document.querySelectorAll('.page-section').forEach(function(s) { s.classList.remove('active'); });
  var page = document.getElementById('page-' + route);
  if (page) page.classList.add('active');

  document.querySelectorAll('.sidebar-nav a[data-route]').forEach(function(a) { a.classList.remove('active'); a.classList.remove('parent-active'); });
  document.querySelectorAll('.subnav-item').forEach(function(a) { a.classList.remove('active'); });
  var miroaiRoutes = ['miroai-capabilities', 'miroai-cap-entguard', 'miroai-cap-noaddons', 'miroai-cap-none', 'miroai-datausage', 'miroai-moderation'];
  var polRoutes = ['pol-onboard', 'pol-list'];
  var activeRoute = route === 'aiworkflow' ? 'products' : (miroaiRoutes.indexOf(route) !== -1 ? 'miroai-capabilities' : (polRoutes.indexOf(route) !== -1 ? 'pol-onboard' : route));
  var navLink = document.querySelector('.sidebar-nav > a[data-route="' + activeRoute + '"]');
  if (navLink && !navLink.classList.contains('has-subnav')) navLink.classList.add('active');

  var subnavItem = document.querySelector('.subnav-item[data-route="' + route + '"]');
  if (subnavItem) {
    subnavItem.classList.add('active');
    var parentNav = subnavItem.closest('.sidebar-subnav');
    if (parentNav) {
      parentNav.classList.add('open');
      var parentLink = parentNav.previousElementSibling;
      if (parentLink) { parentLink.classList.add('parent-active'); parentLink.classList.add('expanded'); }
    }
  }

  var rp = document.getElementById('right-panel');
  if (rp) rp.style.display = route === 'home' ? '' : 'none';

  if (route === 'home') setTimeout(initCharts, 50);

  if (route === 'aiworkflow') {
    var aiwTab = aiwTabFromHash();
    document.querySelectorAll('.aiw-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.aiw-panel').forEach(function(p) { p.classList.remove('active'); });
    var targetTab = document.querySelector('.aiw-tab[data-aiw-tab="' + aiwTab + '"]');
    if (targetTab) targetTab.classList.add('active');
    var targetPanel = document.getElementById('aiw-panel-' + aiwTab);
    if (targetPanel) targetPanel.classList.add('active');
  }

  if (route === 'products') {
    var pTab = productTabFromHash();
    document.querySelectorAll('.products-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
    var targetProdTab = document.querySelector('.products-tab[data-tab="' + pTab + '"]');
    if (targetProdTab) targetProdTab.classList.add('active');
    var targetProdPanel = document.getElementById(pTab);
    if (targetProdPanel) targetProdPanel.classList.add('active');
  }

  if (route === 'teams') {
    var tTab = teamsTabFromHash();
    document.querySelectorAll('.teams-tab').forEach(function(t) { t.classList.remove('active'); });
    var targetTeamsTab = document.querySelector('.teams-tab[data-teams-tab="' + tTab + '"]');
    if (targetTeamsTab) targetTeamsTab.classList.add('active');
  }

  var hashMap = { home: '#/Home', allusers: '#/Users/AllUsers', 'pol-onboard': '#/Policies/Recommendation', 'pol-list': '#/Policies-list', 'miroai-capabilities': '#/MiroAI/Capabilities', 'miroai-cap-entguard': '#/MiroAI/Capabilities-ent.guard', 'miroai-cap-noaddons': '#/MiroAI/Capabilities-No-add-ons', 'miroai-cap-none': '#/MiroAI/Capabilities-none', 'miroai-cap-customsidekick': '#/MiroAI/Capabilities-custom-sidekick', 'miroai-datausage': '#/MiroAI/DataUsage', 'miroai-moderation': '#/MiroAI/Moderation' };
  var hash;
  if (route === 'aiworkflow') {
    var activeAiwTab = document.querySelector('.aiw-tab.active');
    var tabName = activeAiwTab ? activeAiwTab.getAttribute('data-aiw-tab') : 'users';
    var tabLabel = tabName.charAt(0).toUpperCase() + tabName.slice(1);
    hash = '#/Product/AIworkflow/' + tabLabel;
  } else if (route === 'products') {
    var activeProdTab = document.querySelector('.products-tab.active');
    var prodTabId = activeProdTab ? activeProdTab.getAttribute('data-tab') : 'tab-active';
    hash = prodTabId === 'tab-explore' ? '#/Product/Explore' : '#/Product/Active';
  } else if (route === 'teams') {
    var activeTeamsTab = document.querySelector('.teams-tab.active');
    var teamsTabName = activeTeamsTab ? activeTeamsTab.getAttribute('data-teams-tab') : 'active';
    hash = teamsTabName === 'deleted' ? '#/Teams/Deleted' : '#/Teams/Active';
  } else {
    hash = hashMap[route] || '#/' + route;
  }
  if (location.hash !== hash) history.pushState(null, '', hash);
}

function routeFromHash() {
  var hash = location.hash || '';
  if (hash.indexOf('/Users/AllUsers') !== -1) return 'allusers';
  if (hash.indexOf('/Teams') !== -1) return 'teams';
  if (hash.indexOf('/MiroAI/DataUsage') !== -1) return 'miroai-datausage';
  if (hash.indexOf('/MiroAI/Moderation') !== -1) return 'miroai-moderation';
  if (hash.indexOf('/MiroAI/Capabilities-ent.guard') !== -1) return 'miroai-cap-entguard';
  if (hash.indexOf('/MiroAI/Capabilities-No-add-ons') !== -1) return 'miroai-cap-noaddons';
  if (hash.indexOf('/MiroAI/Capabilities-none') !== -1) return 'miroai-cap-none';
  if (hash.indexOf('/MiroAI/Capabilities-custom-sidekick') !== -1) return 'miroai-cap-customsidekick';
  if (hash.indexOf('/MiroAI/Capabilities') !== -1) return 'miroai-capabilities';
  if (hash.indexOf('/MiroAI') !== -1) return 'miroai-capabilities';
  if (hash.indexOf('/Policies-list') !== -1) return 'pol-list';
  if (hash.indexOf('/Policies/Recommendation') !== -1) return 'pol-onboard';
  if (hash.indexOf('/Policies') !== -1) return 'pol-onboard';
  if (hash.indexOf('/Product/AIworkflow') !== -1) return 'aiworkflow';
  if (hash.indexOf('/Product/Explore') !== -1) return 'products';
  if (hash.indexOf('/Product/Active') !== -1) return 'products';
  if (hash.indexOf('/Product') !== -1) return 'products';
  if (hash.indexOf('/Home') !== -1) return 'home';
  return 'home';
}

function aiwTabFromHash() {
  var hash = location.hash || '';
  var m = hash.match(/\/Product\/AIworkflow\/(\w+)/i);
  if (m) return m[1].toLowerCase();
  return 'users';
}

function productTabFromHash() {
  var hash = location.hash || '';
  if (hash.indexOf('/Product/Explore') !== -1) return 'tab-explore';
  return 'tab-active';
}

function teamsTabFromHash() {
  var hash = location.hash || '';
  if (hash.indexOf('/Teams/Deleted') !== -1) return 'deleted';
  return 'active';
}

// Sidebar sub-nav toggle
document.querySelectorAll('.sidebar-nav a.has-subnav').forEach(function(a) {
  a.addEventListener('click', function(e) {
    e.preventDefault();
    var subnavId = this.getAttribute('data-subnav');
    var subnav = document.getElementById(subnavId);
    if (subnav) {
      var isOpen = subnav.classList.contains('open');
      if (isOpen) {
        subnav.classList.remove('open');
        this.classList.remove('expanded');
      } else {
        subnav.classList.add('open');
        this.classList.add('expanded');
        navigateTo(this.getAttribute('data-route'));
      }
    }
  });
});

// Sidebar subnav item clicks
document.querySelectorAll('.subnav-item[data-route]').forEach(function(a) {
  if (a.classList.contains('has-subnav')) return;
  a.addEventListener('click', function(e) {
    e.preventDefault();
    navigateTo(this.getAttribute('data-route'));
  });
});

// Sidebar nav clicks
document.querySelectorAll('.sidebar-nav > a[data-route]:not(.has-subnav)').forEach(function(a) {
  a.addEventListener('click', function(e) {
    e.preventDefault();
    navigateTo(this.getAttribute('data-route'));
  });
});

// Products tab switching
document.querySelectorAll('.products-tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.products-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
    this.classList.add('active');
    var tabId = this.getAttribute('data-tab');
    var panel = document.getElementById(tabId);
    if (panel) panel.classList.add('active');
    var newHash = tabId === 'tab-explore' ? '#/Product/Explore' : '#/Product/Active';
    if (location.hash !== newHash) history.pushState(null, '', newHash);
  });
});

// Product row click
document.querySelectorAll('.product-row-clickable').forEach(function(row) {
  row.addEventListener('click', function() {
    navigateTo(this.getAttribute('data-route'));
  });
});

// Breadcrumb clicks
document.querySelectorAll('.breadcrumb a[data-route]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    e.preventDefault();
    navigateTo(this.getAttribute('data-route'));
  });
});

// All Users tab switching
document.querySelectorAll('.allusers-tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.allusers-tab').forEach(function(t) { t.classList.remove('active'); });
    this.classList.add('active');
  });
});

// Filter pill toggle + AI workflow smart filter
function applyAllusersFilters() {
  var aiPill = document.querySelector('.filter-pill[data-filter="ai-workflow"]');
  var aiActive = aiPill && aiPill.classList.contains('active');
  var rows = document.querySelectorAll('.allusers-table tbody tr');
  rows.forEach(function(row) {
    var productsDiv = row.querySelector('.allusers-products[data-products]');
    var products = productsDiv ? productsDiv.getAttribute('data-products') : '';
    var show = true;
    if (aiActive) {
      show = products.indexOf('AI workflow') !== -1;
    }
    row.style.display = show ? '' : 'none';
  });
}

document.querySelectorAll('.filter-pill').forEach(function(pill) {
  pill.addEventListener('click', function() {
    if (this.getAttribute('data-filter') === 'ai-workflow') {
      this.classList.toggle('active');
      applyAllusersFilters();
    } else {
      this.classList.toggle('active');
    }
  });
});

// ===== BULK ACTIONS =====
var bulkBar = document.getElementById('bulk-actions-bar');
var bulkToggle = document.getElementById('bulk-actions-toggle');
var bulkMenu = document.getElementById('bulk-menu');
var bulkClear = document.getElementById('bulk-clear');
var selectedCountEl = document.getElementById('selected-count');
var allUserCheckboxes = document.querySelectorAll('.allusers-table tbody .mds-checkbox');
var headerCheckbox = document.querySelector('.allusers-table thead .mds-checkbox');

function updateBulkBar() {
  var checked = document.querySelectorAll('.allusers-table tbody .mds-checkbox:checked');
  var count = checked.length;
  if (count > 0) {
    bulkBar.classList.add('visible');
    selectedCountEl.textContent = count + ' user' + (count > 1 ? 's' : '') + ' selected';
  } else {
    bulkBar.classList.remove('visible');
    bulkMenu.classList.remove('open');
  }
  allUserCheckboxes.forEach(function(cb) {
    var row = cb.closest('tr');
    if (row) row.classList.toggle('row-selected', cb.checked);
  });
}

allUserCheckboxes.forEach(function(cb) {
  cb.addEventListener('change', updateBulkBar);
});

if (headerCheckbox) {
  headerCheckbox.addEventListener('change', function() {
    var isChecked = this.checked;
    allUserCheckboxes.forEach(function(cb) {
      var row = cb.closest('tr');
      if (row && row.style.display !== 'none') cb.checked = isChecked;
    });
    updateBulkBar();
  });
}

bulkToggle.addEventListener('click', function(e) {
  e.stopPropagation();
  bulkMenu.classList.toggle('open');
  if (!bulkMenu.classList.contains('open')) {
    bulkMenu.querySelectorAll('.active').forEach(function(el) { el.classList.remove('active'); });
  }
});

bulkMenu.querySelectorAll('.bulk-menu-item[data-has-sub]').forEach(function(item) {
  item.addEventListener('click', function(e) {
    e.stopPropagation();
    var wasActive = this.classList.contains('active');
    bulkMenu.querySelectorAll('.bulk-menu-item.active').forEach(function(el) { el.classList.remove('active'); });
    bulkMenu.querySelectorAll('.bulk-submenu-item.active').forEach(function(el) { el.classList.remove('active'); });
    if (!wasActive) this.classList.add('active');
  });
});

bulkMenu.querySelectorAll('.bulk-submenu-item[data-has-sub]').forEach(function(item) {
  item.addEventListener('click', function(e) {
    e.stopPropagation();
    var parent = this.closest('.bulk-submenu');
    if (parent) {
      parent.querySelectorAll('.bulk-submenu-item.active').forEach(function(el) { el.classList.remove('active'); });
    }
    this.classList.add('active');
  });
});

bulkClear.addEventListener('click', function() {
  allUserCheckboxes.forEach(function(cb) {
    cb.checked = false;
    var row = cb.closest('tr');
    if (row) row.classList.remove('row-selected');
  });
  if (headerCheckbox) headerCheckbox.checked = false;
  updateBulkBar();
});

document.addEventListener('click', function(e) {
  if (!document.getElementById('bulk-dropdown').contains(e.target)) {
    bulkMenu.classList.remove('open');
    bulkMenu.querySelectorAll('.active').forEach(function(el) { el.classList.remove('active'); });
  }
});

// Products tooltip hover (body-appended for overflow safety)
var productsTooltip = document.createElement('div');
productsTooltip.className = 'mds-tooltip-body';
document.body.appendChild(productsTooltip);

document.querySelectorAll('.allusers-products.mds-tooltip-wrap').forEach(function(wrap) {
  var products = (wrap.getAttribute('data-products') || '').split(',').filter(Boolean);
  if (products.length < 2) return;
  wrap.addEventListener('mouseenter', function() {
    var html = '<ul>' + products.map(function(p) { return '<li>' + p.trim() + '</li>'; }).join('') + '</ul>';
    productsTooltip.innerHTML = html;
    productsTooltip.classList.add('visible');
    var rect = wrap.getBoundingClientRect();
    productsTooltip.style.left = (rect.left + rect.width / 2 - productsTooltip.offsetWidth / 2) + 'px';
    productsTooltip.style.top = (rect.top - productsTooltip.offsetHeight - 8) + 'px';
  });
  wrap.addEventListener('mouseleave', function() {
    productsTooltip.classList.remove('visible');
  });
});

// AI Models tag tooltip (dynamic per-tag, reads data-models)
var aiModelsTooltip = document.createElement('div');
aiModelsTooltip.className = 'ai-models-tooltip';
document.body.appendChild(aiModelsTooltip);

function getModelVendor(name) {
  var n = name.trim();
  if (/^(GPT|O3|O4|o3|o4)/i.test(n)) return 'GPT';
  if (/^Claude/i.test(n)) return 'Claude';
  if (/^(Gemini|Vertex)/i.test(n)) return 'Gemini';
  if (/^(Stable|Stability)/i.test(n)) return 'Stability AI';
  if (/^(Bedrock|Titan|Nova)/i.test(n)) return 'AWS';
  if (/^Miro$/i.test(n)) return 'Miro';
  return 'Other';
}
function buildTooltipHTML(models, titleText) {
  var groups = {};
  var order = [];
  models.forEach(function(m) {
    var v = getModelVendor(m.trim());
    if (!groups[v]) { groups[v] = []; order.push(v); }
    groups[v].push(m.trim());
  });
  var html = '<div class="ai-models-tooltip-title">' + titleText + '</div>';
  order.forEach(function(vendor) {
    html += '<div class="ai-models-tooltip-group">';
    html += '<div class="ai-models-tooltip-group-title">' + vendor + '</div>';
    html += '<ul>';
    groups[vendor].forEach(function(m) { html += '<li>' + m + '</li>'; });
    html += '</ul></div>';
  });
  return html;
}
document.querySelectorAll('.ai-models-tag').forEach(function(tag) {
  tag.addEventListener('mouseenter', function() {
    var modelsAttr = tag.getAttribute('data-models');
    if (!modelsAttr) return;
    var models = modelsAttr.split(',');
    var count = models.length;
    var titleText = count === 1 ? tag.textContent.trim() : count + ' AI models';
    aiModelsTooltip.innerHTML = buildTooltipHTML(models, titleText);
    aiModelsTooltip.classList.add('visible');
    var rect = tag.getBoundingClientRect();
    aiModelsTooltip.style.left = (rect.right + 8) + 'px';
    aiModelsTooltip.style.top = (rect.top + rect.height / 2 - aiModelsTooltip.offsetHeight / 2) + 'px';
    var ttRect = aiModelsTooltip.getBoundingClientRect();
    if (ttRect.top < 8) aiModelsTooltip.style.top = '8px';
    if (ttRect.bottom > window.innerHeight - 8) aiModelsTooltip.style.top = (window.innerHeight - 8 - aiModelsTooltip.offsetHeight) + 'px';
    if (ttRect.right > window.innerWidth - 8) {
      aiModelsTooltip.style.left = (rect.left - aiModelsTooltip.offsetWidth - 8) + 'px';
      aiModelsTooltip.classList.add('arrow-right');
    } else {
      aiModelsTooltip.classList.remove('arrow-right');
    }
  });
  tag.addEventListener('mouseleave', function() {
    aiModelsTooltip.classList.remove('visible');
  });
});

// Hamburger sidebar toggle
document.getElementById('hamburger-btn').addEventListener('click', function() {
  var sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('collapsed');
  document.body.classList.toggle('sidebar-collapsed');
  setTimeout(initCharts, 300);
});

// Popstate
window.addEventListener('popstate', function() { navigateTo(routeFromHash()); });

// Initial route
navigateTo(routeFromHash());

// Teams tabs
document.querySelectorAll('.teams-tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.teams-tab').forEach(function(t) { t.classList.remove('active'); });
    this.classList.add('active');
    var tabName = this.getAttribute('data-teams-tab');
    var newHash = tabName === 'deleted' ? '#/Teams/Deleted' : '#/Teams/Active';
    if (location.hash !== newHash) history.pushState(null, '', newHash);
  });
});

// Teams column picker
(function() {
  var btn = document.getElementById('teams-col-btn');
  var picker = document.getElementById('teams-col-picker');
  var closeBtn = document.getElementById('teams-col-close');
  var confirmBtn = document.getElementById('teams-col-confirm');
  var cancelBtn = document.getElementById('teams-col-cancel');
  var label = document.getElementById('teams-col-label');
  var table = document.querySelector('.teams-table');

  if (!btn || !picker || !table) return;

  function applyVisibility() {
    var onCount = 0;
    var total = 0;
    var switches = picker.querySelectorAll('.col-switch[data-col]');
    switches.forEach(function(sw) {
      total++;
      var col = parseInt(sw.getAttribute('data-col'), 10);
      var isOn = sw.classList.contains('on');
      if (isOn) onCount++;
      var nthIdx = col + 1;
      var ths = table.querySelectorAll('thead tr th');
      var trs = table.querySelectorAll('tbody tr');
      if (ths[nthIdx - 1]) ths[nthIdx - 1].style.display = isOn ? '' : 'none';
      trs.forEach(function(tr) {
        var tds = tr.querySelectorAll('td');
        if (tds[nthIdx - 1]) tds[nthIdx - 1].style.display = isOn ? '' : 'none';
      });
    });
    label.textContent = 'Columns (' + onCount + '/' + total + ')';
  }

  picker.addEventListener('click', function(e) {
    var sw = e.target;
    while (sw && sw !== picker) {
      if (sw.classList && sw.classList.contains('col-switch') && !sw.classList.contains('disabled') && sw.hasAttribute('data-col')) {
        e.stopPropagation();
        sw.classList.toggle('on');
        applyVisibility();
        return;
      }
      sw = sw.parentElement;
    }
  });

  function closePicker() {
    picker.classList.remove('open');
    btn.classList.remove('active');
  }

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = picker.classList.contains('open');
    picker.classList.toggle('open');
    btn.classList.toggle('active', !isOpen);
  });

  closeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    closePicker();
  });

  cancelBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    closePicker();
  });

  confirmBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    closePicker();
  });

  document.addEventListener('click', function(e) {
    if (!picker.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      closePicker();
    }
  });

  applyVisibility();
})();

// Teams filter panel
(function() {
  var btn = document.getElementById('teams-filter-btn');
  var panel = document.getElementById('teams-filter-panel');
  var closeBtn = document.getElementById('teams-filter-close');
  var clearBtn = document.getElementById('teams-filter-clear');
  var confirmBtn = document.getElementById('teams-filter-confirm');

  function closePanel() {
    panel.classList.remove('open');
    btn.classList.remove('active');
  }

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = panel.classList.contains('open');
    panel.classList.toggle('open');
    btn.classList.toggle('active', !isOpen);
  });

  closeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    closePanel();
  });

  clearBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    panel.querySelectorAll('.mds-checkbox').forEach(function(cb) { cb.checked = false; });
    panel.querySelectorAll('input[type="number"]').forEach(function(inp) { inp.value = ''; });
  });

  confirmBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    closePanel();
  });

  document.addEventListener('click', function(e) {
    if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      closePanel();
    }
  });
})();

// AI models tooltip on cap-tag-wrap hover
(function() {
  var tooltip = document.getElementById('cap-models-tooltip');
  document.addEventListener('mouseover', function(e) {
    var tag = e.target.closest('.cap-tag-wrap');
    if (!tag) return;
    var rect = tag.getBoundingClientRect();
    var tipW = 260;
    var tipH = tooltip.offsetHeight || 480;
    var left = rect.right + 8;
    if (left + tipW > window.innerWidth) left = rect.left - tipW - 8;
    var top = rect.top;
    if (top + tipH > window.innerHeight) top = window.innerHeight - tipH - 8;
    if (top < 8) top = 8;
    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
    tooltip.classList.add('visible');
  });
  document.addEventListener('mouseout', function(e) {
    var tag = e.target.closest('.cap-tag-wrap');
    if (!tag) return;
    var related = e.relatedTarget;
    if (related && (related.closest('.cap-tag-wrap') || related.closest('.cap-models-tooltip'))) return;
    tooltip.classList.remove('visible');
  });
  tooltip.addEventListener('mouseleave', function() {
    tooltip.classList.remove('visible');
  });
})();

// Capabilities sub-tabs (Features, AI providers, Your API Keys)
document.querySelectorAll('.cap-tab[data-cap-tab]').forEach(function(tab) {
  tab.addEventListener('click', function() {
    var card = tab.closest('.cap-card');
    if (card) {
      card.querySelectorAll('.cap-tab').forEach(function(t) { t.classList.remove('active'); });
      card.querySelectorAll('.cap-panel').forEach(function(p) { p.classList.remove('active'); });
    }
    tab.classList.add('active');
    var panel = document.getElementById('cap-panel-' + tab.getAttribute('data-cap-tab'));
    if (panel) panel.classList.add('active');
  });
});

// Restrictions expand/collapse
document.querySelectorAll('.feat-restrictions-toggle').forEach(function(toggle) {
  toggle.addEventListener('click', function() {
    var wrap = toggle.closest('.feat-restrictions');
    if (wrap) wrap.classList.toggle('expanded');
  });
});

// Feature MDS select dropdowns
(function() {
  document.addEventListener('click', function(e) {
    if (e.target.closest('.feat-select-apply-row')) return;
    var trigger = e.target.closest('.feat-select-trigger');
    if (trigger) {
      if (trigger.classList.contains('disabled')) return;
      var wrapper = trigger.closest('.feat-select-wrapper');
      var dd = wrapper.querySelector('.feat-select-dropdown');
      var isOpen = trigger.classList.contains('open');
      document.querySelectorAll('.feat-select-trigger.open').forEach(function(t) {
        t.classList.remove('open');
        t.closest('.feat-select-wrapper').querySelector('.feat-select-dropdown').classList.remove('open');
      });
      if (!isOpen) {
        trigger.classList.add('open');
        dd.classList.add('open');
      }
      return;
    }
    var opt = e.target.closest('.feat-select-option');
    if (opt) {
      var wrapper = opt.closest('.feat-select-wrapper');
      var trig = wrapper.querySelector('.feat-select-trigger');
      var dd = wrapper.querySelector('.feat-select-dropdown');
      var val = opt.getAttribute('data-val');
      wrapper.querySelectorAll('.feat-select-option').forEach(function(o) { o.classList.remove('selected'); });
      opt.classList.add('selected');
      trig.childNodes[0].textContent = val;
      trig.setAttribute('data-value', val);
      trig.classList.remove('open');
      dd.classList.remove('open');
      if (val === 'Specific teams') {
        var featItem = opt.closest('.feat-item');
        var featName = featItem ? featItem.querySelector('.feat-item-label').textContent.trim() : 'Feature';
        openTeamPanel(featName, wrapper);
      }
      var applyToggle = dd.querySelector('[data-apply-toggle]');
      if (applyToggle && applyToggle.classList.contains('checked')) {
        var groupId = applyToggle.getAttribute('data-apply-toggle');
        var subItems = document.getElementById(groupId + '-sub');
        if (subItems) {
          subItems.querySelectorAll('.feat-select-trigger').forEach(function(t) {
            t.childNodes[0].textContent = val;
            t.setAttribute('data-value', val);
            t.classList.add('disabled');
            var opts = t.parentElement.querySelectorAll('.feat-select-option');
            opts.forEach(function(o) { o.classList.toggle('selected', o.getAttribute('data-val') === val); });
          });
        }
      }
      var featItem = opt.closest('.feat-item');
      var isCustomSidekickSelector = opt.closest('#custom-sidekick-toggle-cs');
      if (!isCustomSidekickSelector && featItem && featItem.id && featItem.id.indexOf('feat-sidekicks') === 0) {
        if (val === 'No one') {
          var prevVal = trig._sidekickPrevVal || 'Everyone';
          trig.childNodes[0].textContent = prevVal;
          trig.setAttribute('data-value', prevVal);
          wrapper.querySelectorAll('.feat-select-option').forEach(function(o) {
            o.classList.toggle('selected', o.getAttribute('data-val') === prevVal);
          });
          window._pendingSidekickNoOne = { trig: trig, wrapper: wrapper };
          sidekickConfirmOverlay.classList.add('visible');
        } else {
          var pg = getActiveCapPage();
          var wasSidekickDisabled = pg && pg.querySelector('.aicap-list.sidekick-disabled');
          trig._sidekickPrevVal = val;
          if (wasSidekickDisabled) {
            applySidekickEnabled();
          }
        }
      }
      return;
    }
    document.querySelectorAll('.feat-select-trigger.open').forEach(function(t) {
      t.classList.remove('open');
      t.closest('.feat-select-wrapper').querySelector('.feat-select-dropdown').classList.remove('open');
    });
  });
})();

// Team selection side panel
var teamPanelOverlay = document.getElementById('team-panel-overlay');
var teamPanelTitle = document.getElementById('team-panel-title');
var teamPanelClose = document.getElementById('team-panel-close');
var teamPanelCancel = document.getElementById('team-panel-cancel');
var teamPanelSave = document.getElementById('team-panel-save');
var teamPanelSearchInput = document.getElementById('team-panel-search-input');
var teamPanelActiveWrapper = null;

function openTeamPanel(featureName, selectWrapper) {
  teamPanelTitle.textContent = featureName;
  teamPanelActiveWrapper = selectWrapper;
  teamPanelSearchInput.value = '';
  document.querySelectorAll('#team-panel-list .team-panel-row').forEach(function(row) {
    row.style.display = '';
  });
  document.querySelectorAll('#team-panel-list .team-panel-row-checkbox').forEach(function(cb) {
    cb.checked = false;
  });
  teamPanelSave.textContent = 'Save';
  teamPanelSave.disabled = true;
  var selectAllCb = document.getElementById('team-panel-select-all');
  selectAllCb.checked = false;
  selectAllCb.classList.remove('indeterminate');
  updateTeamPanelHeader();
  teamPanelOverlay.classList.add('open');
}

function updateTeamPanelHeader() {
  var total = document.querySelectorAll('#team-panel-list .team-panel-row-checkbox').length;
  var checked = document.querySelectorAll('#team-panel-list .team-panel-row-checkbox:checked').length;
  var label = document.getElementById('team-panel-list-label');
  var selectAllCb = document.getElementById('team-panel-select-all');
  if (checked === 0) {
    label.textContent = 'Teams';
    selectAllCb.checked = false;
    selectAllCb.classList.remove('indeterminate');
  } else if (checked === total) {
    label.textContent = 'Teams (' + checked + ' selected)';
    selectAllCb.checked = true;
    selectAllCb.classList.remove('indeterminate');
  } else {
    label.textContent = 'Teams (' + checked + ' selected)';
    selectAllCb.checked = false;
    selectAllCb.classList.add('indeterminate');
  }
  teamPanelSave.textContent = checked > 0 ? 'Save (' + checked + ')' : 'Save';
  teamPanelSave.disabled = checked === 0;
}

document.getElementById('team-panel-list').addEventListener('change', updateTeamPanelHeader);

document.getElementById('team-panel-select-all').addEventListener('change', function() {
  var shouldCheck = this.checked;
  this.classList.remove('indeterminate');
  document.querySelectorAll('#team-panel-list .team-panel-row').forEach(function(row) {
    if (row.style.display !== 'none') {
      row.querySelector('.team-panel-row-checkbox').checked = shouldCheck;
    }
  });
  updateTeamPanelHeader();
});

function closeTeamPanel() {
  teamPanelOverlay.classList.remove('open');
  teamPanelActiveWrapper = null;
}

teamPanelClose.addEventListener('click', closeTeamPanel);
teamPanelCancel.addEventListener('click', function() {
  if (teamPanelActiveWrapper) {
    var trig = teamPanelActiveWrapper.querySelector('.feat-select-trigger');
    var currentVal = trig.getAttribute('data-value');
    if (currentVal !== 'Specific teams') {
      trig.childNodes[0].textContent = 'Everyone';
      trig.setAttribute('data-value', 'Everyone');
      teamPanelActiveWrapper.querySelectorAll('.feat-select-option').forEach(function(o) { o.classList.remove('selected'); });
      var everyoneOpt = teamPanelActiveWrapper.querySelector('.feat-select-option[data-val="Everyone"]');
      if (everyoneOpt) everyoneOpt.classList.add('selected');
    }
  }
  closeTeamPanel();
});

teamPanelSave.addEventListener('click', function() {
  var featureName = teamPanelTitle.textContent.trim();
  var checked = 0;
  if (teamPanelActiveWrapper) {
    checked = document.querySelectorAll('#team-panel-list .team-panel-row-checkbox:checked').length;
    var trig = teamPanelActiveWrapper.querySelector('.feat-select-trigger');
    if (checked > 0) {
      trig.childNodes[0].textContent = 'Specific teams (' + checked + ')';
      trig.setAttribute('data-value', 'Specific teams');
    } else {
      trig.childNodes[0].textContent = 'Everyone';
      trig.setAttribute('data-value', 'Everyone');
      teamPanelActiveWrapper.querySelectorAll('.feat-select-option').forEach(function(o) { o.classList.remove('selected'); });
      var evOpt = teamPanelActiveWrapper.querySelector('.feat-select-option[data-val="Everyone"]');
      if (evOpt) evOpt.classList.add('selected');
    }
  }
  closeTeamPanel();
  if (checked > 0) {
    var toast = document.getElementById('settings-toast');
    var textEl = document.getElementById('settings-toast-text');
    textEl.innerHTML = '<strong>' + featureName + '</strong> updated — ' + checked + ' team' + (checked > 1 ? 's' : '') + ' selected';
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() { toast.classList.remove('visible'); }, 3000);
  }
});

teamPanelOverlay.addEventListener('click', function(e) {
  if (e.target === teamPanelOverlay) {
    closeTeamPanel();
  }
});

teamPanelSearchInput.addEventListener('input', function() {
  var query = this.value.toLowerCase();
  document.querySelectorAll('#team-panel-list .team-panel-row').forEach(function(row) {
    var name = row.getAttribute('data-team').toLowerCase();
    row.style.display = name.indexOf(query) !== -1 ? '' : 'none';
  });
});

// AI Workflows sub-tabs
document.querySelectorAll('.aiw-tab[data-aiw-tab]').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.aiw-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.aiw-panel').forEach(function(p) { p.classList.remove('active'); });
    this.classList.add('active');
    var tabName = this.getAttribute('data-aiw-tab');
    var panel = document.getElementById('aiw-panel-' + tabName);
    if (panel) panel.classList.add('active');
    var tabLabel = tabName.charAt(0).toUpperCase() + tabName.slice(1);
    var newHash = '#/Product/AIworkflow/' + tabLabel;
    if (location.hash !== newHash) history.pushState(null, '', newHash);
  });
});

// MDS Select Dropdown (event delegation)
document.addEventListener('click', function(e) {
  var trigger = e.target.closest('.mds-select-trigger');
  if (trigger) {
    e.stopPropagation();
    var wrapper = trigger.closest('.mds-select-wrapper');
    var dropdown = wrapper.querySelector('.mds-select-dropdown');
    var isOpen = dropdown.classList.contains('open');
    document.querySelectorAll('.mds-select-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
    document.querySelectorAll('.mds-select-trigger.open').forEach(function(t) { t.classList.remove('open'); });
    if (!isOpen) {
      dropdown.classList.add('open');
      trigger.classList.add('open');
      var si = dropdown.querySelector('.mds-select-dropdown-search');
      if (si) { si.value = ''; si.focus(); }
      dropdown.querySelectorAll('.mds-select-option').forEach(function(o) { o.style.display = ''; });
    }
    return;
  }
  if (e.target.closest('.mds-select-dropdown-search')) return;
  var option = e.target.closest('.mds-select-option');
  if (option) {
    e.stopPropagation();
    var dropdown = option.closest('.mds-select-dropdown');
    var isMulti = dropdown && dropdown.getAttribute('data-multiselect') === 'true';
    var checkSvg = '<svg class="mds-select-option-check" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="m9.55 18-5.7-5.7 1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4 9.55 18Z"/></svg>';
    var wrapper = option.closest('.mds-select-wrapper');
    var trig = wrapper.querySelector('.mds-select-trigger');
    var label = trig.querySelector('.mds-select-label');

    if (isMulti) {
      var isSelected = option.classList.toggle('selected');
      if (isSelected) { if (!option.querySelector('.mds-select-option-check')) option.insertAdjacentHTML('afterbegin', checkSvg); }
      else { var ck = option.querySelector('.mds-select-option-check'); if (ck) ck.remove(); }
      var selected = wrapper.querySelectorAll('.mds-select-option.selected');
      if (selected.length > 0) {
        var names = []; selected.forEach(function(s) { names.push(s.textContent.trim()); });
        var placeholder = trig.getAttribute('data-placeholder') || '';
        label.textContent = names.length === 1 ? names[0] : names.length + ' ' + placeholder.toLowerCase();
        trig.classList.add('filled');
      } else {
        label.textContent = trig.getAttribute('data-placeholder') || 'Select an option';
        trig.classList.remove('filled');
      }
      if (typeof filterSidePanelRows === 'function') filterSidePanelRows();
    } else {
      wrapper.querySelectorAll('.mds-select-option.selected').forEach(function(o) { o.classList.remove('selected'); var ck = o.querySelector('.mds-select-option-check'); if (ck) ck.remove(); });
      option.classList.add('selected');
      label.textContent = option.textContent.trim();
      trig.classList.add('filled');
      trig.setAttribute('data-value', option.getAttribute('data-value'));
      dropdown.classList.remove('open');
      trig.classList.remove('open');
    }
    return;
  }
  document.querySelectorAll('.mds-select-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
  document.querySelectorAll('.mds-select-trigger.open').forEach(function(t) { t.classList.remove('open'); });
});

document.addEventListener('input', function(e) {
  if (e.target.classList.contains('mds-select-dropdown-search')) {
    var query = e.target.value.toLowerCase();
    var dropdown = e.target.closest('.mds-select-dropdown');
    dropdown.querySelectorAll('.mds-select-option').forEach(function(opt) {
      var text = opt.textContent.trim().toLowerCase();
      opt.style.display = text.indexOf(query) !== -1 ? '' : 'none';
    });
  }
});

// Add-on close button
var addonClose = document.getElementById('addon-close');
if (addonClose) {
  addonClose.addEventListener('click', function() {
    this.closest('.addon-card').style.display = 'none';
  });
}

// ===== SIDEKICKS DEPENDENCY LOGIC =====
var sidekickConfirmOverlay = document.getElementById('sidekick-confirm-overlay');

function getActiveCapPage() {
  var pages = document.querySelectorAll('[id^="page-miroai-cap"]');
  for (var i = 0; i < pages.length; i++) {
    if (pages[i].classList.contains('active')) return pages[i];
  }
  return document.getElementById('page-miroai-capabilities');
}





function applySidekickDisabled() {
  var pg = getActiveCapPage();
  var capSection = pg ? pg.querySelector('.aicap-list') : document.querySelector('.aicap-list');
  var restrictions = pg ? pg.querySelector('[id^="sidekicks-restrictions"]') : document.getElementById('sidekicks-restrictions');
  var callout = pg ? pg.querySelector('[id^="sidekicks-disabled-callout"]') : document.getElementById('sidekicks-disabled-callout');
  if (capSection) capSection.classList.add('sidekick-disabled');
  if (restrictions) restrictions.style.display = 'none';
  if (callout) callout.style.display = 'flex';
  var sidekickOffCallout = pg ? pg.querySelector('.sidekick-off-callout') : document.querySelector('.sidekick-off-callout');
  if (sidekickOffCallout) sidekickOffCallout.style.display = 'flex';
  if (capSection) {
    capSection.querySelectorAll('.feat-select-trigger').forEach(function(t) {
      if (!t._sidekickPrev) t._sidekickPrev = t.getAttribute('data-value');
      t.childNodes[0].textContent = 'No one';
      t.setAttribute('data-value', 'No one');
      t.classList.add('disabled');
      t.classList.remove('filled');
    });
    capSection.querySelectorAll('.feat-select-option').forEach(function(o) {
      o.classList.toggle('selected', o.getAttribute('data-val') === 'No one');
    });
  }
  var sidekicksSubSettings = pg ? pg.querySelector('[id^="sidekicks-sub-settings"]') : document.getElementById('sidekicks-sub-settings');
  if (sidekicksSubSettings) sidekicksSubSettings.style.display = 'none';
}

function applySidekickEnabled() {
  var pg = getActiveCapPage();
  var capSection = pg ? pg.querySelector('.aicap-list') : document.querySelector('.aicap-list');
  var restrictions = pg ? pg.querySelector('[id^="sidekicks-restrictions"]') : document.getElementById('sidekicks-restrictions');
  var callout = pg ? pg.querySelector('[id^="sidekicks-disabled-callout"]') : document.getElementById('sidekicks-disabled-callout');
  if (capSection) capSection.classList.remove('sidekick-disabled');
  if (restrictions) restrictions.style.display = '';
  if (callout) callout.style.display = 'none';
  var sidekickOffCallout = pg ? pg.querySelector('.sidekick-off-callout') : document.querySelector('.sidekick-off-callout');
  if (sidekickOffCallout) sidekickOffCallout.style.display = 'none';
  if (capSection) {
    capSection.querySelectorAll('.feat-select-trigger.disabled').forEach(function(t) {
      var prev = t._sidekickPrev || 'Everyone';
      t._sidekickPrev = null;
      t.childNodes[0].textContent = prev;
      t.setAttribute('data-value', prev);
      t.classList.add('filled');
      var applyRow = t.closest('.feat-select-wrapper') && t.closest('.feat-select-wrapper').querySelector('[data-apply-toggle]');
      if (applyRow && applyRow.classList.contains('checked')) {
        /* keep sub-selectors disabled per apply-to-category */
      } else {
        t.classList.remove('disabled');
      }
    });
    capSection.querySelectorAll('.feat-select-wrapper').forEach(function(w) {
      var t = w.querySelector('.feat-select-trigger');
      var v = t.getAttribute('data-value');
      w.querySelectorAll('.feat-select-option').forEach(function(o) {
        o.classList.toggle('selected', o.getAttribute('data-val') === v);
      });
    });
  }
  var sidekicksSubSettings = pg ? pg.querySelector('[id^="sidekicks-sub-settings"]') : document.getElementById('sidekicks-sub-settings');
  if (sidekicksSubSettings) sidekicksSubSettings.style.display = '';
}

document.getElementById('sidekick-confirm-close').addEventListener('click', function() {
  sidekickConfirmOverlay.classList.remove('visible');
  window._pendingSidekickNoOne = null;
});
document.getElementById('sidekick-confirm-cancel').addEventListener('click', function() {
  sidekickConfirmOverlay.classList.remove('visible');
  window._pendingSidekickNoOne = null;
});
document.getElementById('sidekick-confirm-ok').addEventListener('click', function() {
  sidekickConfirmOverlay.classList.remove('visible');
  var pending = window._pendingSidekickNoOne;
  if (pending) {
    pending.trig.childNodes[0].textContent = 'No one';
    pending.trig.setAttribute('data-value', 'No one');
    pending.trig._sidekickPrevVal = pending.trig._sidekickPrevVal || 'Everyone';
    pending.wrapper.querySelectorAll('.feat-select-option').forEach(function(o) {
      o.classList.toggle('selected', o.getAttribute('data-val') === 'No one');
    });
    applySidekickDisabled();
    window._pendingSidekickNoOne = null;
  }
});


// Custom Sidekicks toggle on Capabilities-custom-sidekick page
var customSidekickSwitch = document.getElementById('custom-sidekick-switch-cs');
if (customSidekickSwitch) {
  customSidekickSwitch.addEventListener('click', function() {
    var isOn = this.classList.toggle('checked');
    this.setAttribute('aria-checked', isOn ? 'true' : 'false');
    var selectorWrap = document.querySelector('.custom-sidekick-selector-cs');
    if (selectorWrap) {
      if (isOn) {
        selectorWrap.style.display = '';
      } else {
        selectorWrap.style.display = 'none';
      }
    }
  });
}

// Accordion toggle for Content/Image sub-items
document.querySelectorAll('.aicap-accordion-chevron').forEach(function(chevron) {
  chevron.addEventListener('click', function() {
    var targetId = this.getAttribute('data-accordion');
    var sub = document.getElementById(targetId);
    if (!sub) return;
    this.classList.toggle('open');
    if (sub.classList.contains('collapsed')) {
      sub.classList.remove('collapsed');
      sub.style.maxHeight = sub.scrollHeight + 'px';
      setTimeout(function() { sub.style.maxHeight = ''; }, 260);
    } else {
      sub.style.maxHeight = sub.scrollHeight + 'px';
      requestAnimationFrame(function() {
        sub.classList.add('collapsed');
        sub.style.maxHeight = '0';
      });
    }
  });
});

// "Apply to entire category" toggle
function applyParentToSubs(sw) {
  var dropdown = sw.closest('.feat-select-dropdown');
  var wrapper = sw.closest('.feat-select-wrapper');
  if (!dropdown || !wrapper) return;
  var trigger = wrapper.querySelector('.feat-select-trigger');
  var selectedVal = trigger ? trigger.getAttribute('data-value') : 'Everyone';
  var groupId = sw.getAttribute('data-apply-toggle');
  var subItems = document.getElementById(groupId + '-sub');
  if (!subItems) return;
  var subTriggers = subItems.querySelectorAll('.feat-select-trigger');
  if (sw.classList.contains('checked')) {
    subTriggers.forEach(function(t) {
      t.childNodes[0].textContent = selectedVal;
      t.setAttribute('data-value', selectedVal);
      t.classList.add('disabled');
      var opts = t.parentElement.querySelectorAll('.feat-select-option');
      opts.forEach(function(o) {
        o.classList.toggle('selected', o.getAttribute('data-val') === selectedVal);
      });
    });
  } else {
    subTriggers.forEach(function(t) { t.classList.remove('disabled'); });
  }
}

document.querySelectorAll('[data-apply-toggle]').forEach(function(sw) {
  applyParentToSubs(sw);
  sw.addEventListener('click', function(e) {
    e.stopPropagation();
    var isChecked = this.classList.toggle('checked');
    this.setAttribute('aria-checked', isChecked ? 'true' : 'false');
    applyParentToSubs(this);
  });
});

// MDS Switch toggle
document.querySelectorAll('.mds-switch').forEach(function(sw) {
  if (sw.hasAttribute('data-apply-toggle')) return;
  sw.addEventListener('click', function() {
    var isChecked = this.classList.toggle('checked');
    this.setAttribute('aria-checked', isChecked ? 'true' : 'false');

    if (this.closest('#aiw-panel-settings')) {
      var item = this.closest('.settings-toggle-item');
      if (!item) return;
      var labelEl = item.querySelector('.settings-toggle-top-label');
      if (!labelEl) return;
      var name = labelEl.textContent.trim();
      var state = isChecked ? 'turned on' : 'turned off';
      var toast = document.getElementById('settings-toast');
      var textEl = document.getElementById('settings-toast-text');
      textEl.innerHTML = '<strong>' + name + '</strong> ' + state;
      toast.classList.add('visible');
      clearTimeout(toast._timer);
      toast._timer = setTimeout(function() { toast.classList.remove('visible'); }, 3000);
    }

    var featRow = this.closest('.feat-item-row');
    if (featRow) {
      var selWrapper = featRow.querySelector('.feat-select-wrapper');
      if (!selWrapper) return;
      var trig = selWrapper.querySelector('.feat-select-trigger');
      var dd = selWrapper.querySelector('.feat-select-dropdown');
      if (!isChecked) {
        if (!trig._prevValue) trig._prevValue = trig.getAttribute('data-value');
        trig.classList.add('disabled');
        trig.classList.remove('open', 'filled');
        dd.classList.remove('open');
        selWrapper.querySelectorAll('.feat-select-option').forEach(function(o) { o.classList.remove('selected'); });
        trig.childNodes[0].textContent = 'No one';
        trig.setAttribute('data-value', 'No one');
        var restrictions = this.closest('.feat-item').querySelector('.feat-restrictions');
        if (restrictions) restrictions.style.display = 'none';
      } else {
        trig.classList.remove('disabled');
        var restoreVal = trig._prevValue || 'Everyone';
        trig._prevValue = null;
        trig.classList.add('filled');
        selWrapper.querySelectorAll('.feat-select-option').forEach(function(o) { o.classList.remove('selected'); });
        var targetOpt = selWrapper.querySelector('.feat-select-option[data-val="' + restoreVal + '"]');
        if (targetOpt) targetOpt.classList.add('selected');
        trig.childNodes[0].textContent = restoreVal;
        trig.setAttribute('data-value', restoreVal);
        var restrictions = this.closest('.feat-item').querySelector('.feat-restrictions');
        if (restrictions) restrictions.style.display = '';
      }
    }
  });
});

// MDS Radio
document.querySelectorAll('.settings-radio-row').forEach(function(row) {
  row.addEventListener('click', function() {
    var group = this.closest('.settings-radio-group');
    group.querySelectorAll('.mds-radio').forEach(function(r) { r.classList.remove('checked'); });
    this.querySelector('.mds-radio').classList.add('checked');
  });
});

// ===== ASSIGN SEATS SIDE PANEL =====
(function() {
  var panel = document.getElementById('assign-seats-panel');
  var btnOpen = document.getElementById('btn-assign-seats');
  var btnClose = document.getElementById('assign-seats-close');
  var btnCancel = document.getElementById('assign-seats-cancel');
  var assignBtn = document.getElementById('assign-seats-submit');
  var headerCb = document.getElementById('sp-select-all');
  var searchInput = document.getElementById('sp-search');
  var table = document.getElementById('sp-table');

  function getVisibleRows() {
    return Array.prototype.filter.call(table.querySelectorAll('tbody tr'), function(tr) {
      return tr.style.display !== 'none';
    });
  }

  function getCheckedCount() {
    var count = 0;
    getVisibleRows().forEach(function(tr) {
      if (tr.querySelector('.sp-row-cb').checked) count++;
    });
    return count;
  }

  function updateAssignBtn() {
    var count = getCheckedCount();
    if (count > 0) {
      assignBtn.disabled = false;
      assignBtn.textContent = 'Assign ' + count + ' seat' + (count > 1 ? 's' : '');
    } else {
      assignBtn.disabled = true;
      assignBtn.textContent = 'Assign seats';
    }
  }

  function updateHeaderCb() {
    var visible = getVisibleRows();
    if (visible.length === 0) { headerCb.checked = false; return; }
    var allChecked = visible.every(function(tr) { return tr.querySelector('.sp-row-cb').checked; });
    headerCb.checked = allChecked;
  }

  function openPanel() {
    panel.classList.add('open');
    document.body.style.overflow = 'hidden';
    resetPanel();
  }

  function closePanel() {
    panel.classList.remove('open');
    document.body.style.overflow = '';
  }

  function resetPanel() {
    searchInput.value = '';
    headerCb.checked = false;
    table.querySelectorAll('.sp-row-cb').forEach(function(cb) { cb.checked = false; });
    table.querySelectorAll('tbody tr').forEach(function(tr) { tr.style.display = ''; });
    // Reset dropdowns in panel
    panel.querySelectorAll('.mds-select-option.selected').forEach(function(opt) {
      opt.classList.remove('selected');
      var ck = opt.querySelector('.mds-select-option-check');
      if (ck) ck.remove();
    });
    panel.querySelectorAll('.mds-select-trigger').forEach(function(trig) {
      trig.classList.remove('filled');
      trig.querySelector('.mds-select-label').textContent = trig.getAttribute('data-placeholder');
    });
    updateAssignBtn();
  }

  btnOpen.addEventListener('click', openPanel);
  btnClose.addEventListener('click', closePanel);
  btnCancel.addEventListener('click', closePanel);
  panel.addEventListener('click', function(e) { if (e.target === panel) closePanel(); });

  assignBtn.addEventListener('click', function() {
    var selectedRows = [];
    getVisibleRows().forEach(function(tr) {
      if (tr.querySelector('.sp-row-cb').checked) {
        selectedRows.push({
          name: tr.getAttribute('data-name'),
          email: tr.getAttribute('data-email')
        });
      }
    });
    if (selectedRows.length === 0) return;
    closePanel();
    if (window.startBulkAssign) window.startBulkAssign(selectedRows);
  });

  headerCb.addEventListener('change', function() {
    var checked = this.checked;
    getVisibleRows().forEach(function(tr) { tr.querySelector('.sp-row-cb').checked = checked; });
    updateAssignBtn();
  });

  table.addEventListener('change', function(e) {
    if (e.target.classList.contains('sp-row-cb')) {
      updateHeaderCb();
      updateAssignBtn();
    }
  });

  // Search filter
  searchInput.addEventListener('input', function() {
    filterSidePanelRows();
  });

  window.filterSidePanelRows = function() {
    var query = searchInput.value.toLowerCase().trim();

    var ugDropdown = document.getElementById('sp-ug-dropdown');
    var teamsDropdown = document.getElementById('sp-teams-dropdown');
    var selectedUGs = [];
    var selectedTeams = [];
    if (ugDropdown) ugDropdown.querySelectorAll('.mds-select-option.selected').forEach(function(o) { selectedUGs.push(o.getAttribute('data-value')); });
    if (teamsDropdown) teamsDropdown.querySelectorAll('.mds-select-option.selected').forEach(function(o) { selectedTeams.push(o.getAttribute('data-value')); });

    table.querySelectorAll('tbody tr').forEach(function(tr) {
      var name = (tr.getAttribute('data-name') || '').toLowerCase();
      var email = (tr.getAttribute('data-email') || '').toLowerCase();
      var usergroup = tr.getAttribute('data-usergroup') || '';
      var team = tr.getAttribute('data-team') || '';

      var matchSearch = !query || name.indexOf(query) !== -1 || email.indexOf(query) !== -1;
      var matchUG = selectedUGs.length === 0 || selectedUGs.indexOf(usergroup) !== -1;
      var matchTeam = selectedTeams.length === 0 || selectedTeams.indexOf(team) !== -1;

      tr.style.display = (matchSearch && matchUG && matchTeam) ? '' : 'none';
    });

    updateHeaderCb();
    updateAssignBtn();
  };
})();

// ===== ROW CONTEXT MENU =====
(function() {
  var ctxMenu = document.getElementById('row-ctx-menu');
  var currentRowUser = null;
  var lastTrigger = null;

  document.querySelectorAll('.allusers-table .allusers-more-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (lastTrigger === this && ctxMenu.classList.contains('open')) {
        ctxMenu.classList.remove('open');
        lastTrigger = null;
        return;
      }
      lastTrigger = this;
      ctxMenu.querySelectorAll('.active').forEach(function(el) { el.classList.remove('active'); });
      var row = this.closest('tr');
      if (!row) return;

      var nameEl = row.querySelector('.allusers-user-name');
      var emailEl = row.querySelector('.allusers-user-email');
      var avatarEl = row.querySelector('.allusers-avatar img');
      currentRowUser = {
        name: nameEl ? nameEl.textContent : '',
        email: emailEl ? emailEl.textContent : '',
        avatar: avatarEl ? avatarEl.src : ''
      };

      var rect = this.getBoundingClientRect();
      ctxMenu.style.visibility = 'hidden';
      ctxMenu.classList.add('open');
      var menuH = ctxMenu.offsetHeight;
      ctxMenu.style.visibility = '';
      var top = rect.top - menuH - 6;
      if (top < 0) top = rect.bottom + 6;
      ctxMenu.style.top = top + 'px';
      ctxMenu.style.left = (rect.right - 240) + 'px';
      ctxMenu.classList.add('open');
    });
  });

  ctxMenu.querySelectorAll('.row-ctx-item[data-has-sub]').forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      var wasActive = this.classList.contains('active');
      ctxMenu.querySelectorAll('.row-ctx-item.active').forEach(function(el) { el.classList.remove('active'); });
      ctxMenu.querySelectorAll('.row-ctx-sub-item.active').forEach(function(el) { el.classList.remove('active'); });
      if (!wasActive) this.classList.add('active');
    });
  });

  ctxMenu.querySelectorAll('.row-ctx-sub-item[data-has-sub]').forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      var parent = this.closest('.row-ctx-sub');
      if (parent) {
        parent.querySelectorAll('.row-ctx-sub-item.active').forEach(function(el) { el.classList.remove('active'); });
      }
      this.classList.add('active');
    });
  });

  document.addEventListener('click', function(e) {
    if (!ctxMenu.contains(e.target)) {
      ctxMenu.classList.remove('open');
      ctxMenu.querySelectorAll('.active').forEach(function(el) { el.classList.remove('active'); });
    }
  });

  var assignSingleBtn = ctxMenu.querySelector('[data-action="assign-single"]');
  if (assignSingleBtn) {
    assignSingleBtn.addEventListener('click', function() {
      ctxMenu.classList.remove('open');
      ctxMenu.querySelectorAll('.active').forEach(function(el) { el.classList.remove('active'); });
      if (currentRowUser && window.openSingleAssignModal) {
        window.openSingleAssignModal(currentRowUser);
      }
    });
  }

  var unassignSingleBtn = ctxMenu.querySelector('[data-action="unassign-single"]');
  if (unassignSingleBtn) {
    unassignSingleBtn.addEventListener('click', function() {
      ctxMenu.classList.remove('open');
      ctxMenu.querySelectorAll('.active').forEach(function(el) { el.classList.remove('active'); });
      if (currentRowUser && window.openSingleUnassignModal) {
        window.openSingleUnassignModal(currentRowUser);
      }
    });
  }
})();

// ===== ASSIGN CONFIRM MODAL (from bulk actions) =====
(function() {
  var modalOverlay = document.getElementById('assign-modal-overlay');
  var modalTitle = document.getElementById('assign-modal-title');
  var modalSeats = document.getElementById('assign-modal-seats');
  var modalUsers = document.getElementById('assign-modal-users');
  var modalConfirm = document.getElementById('assign-modal-confirm');
  var modalCancel = document.getElementById('assign-modal-cancel');
  var modalClose = document.getElementById('assign-modal-close');

  // Seat data is read from window.AIW

  function closeModal() { modalOverlay.classList.remove('visible'); }

  modalCancel.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) closeModal();
  });

  window.openAssignModal = function() {
    var checked = document.querySelectorAll('.allusers-table tbody .mds-checkbox:checked');
    var users = [];
    checked.forEach(function(cb) {
      var row = cb.closest('tr');
      if (!row) return;
      var nameEl = row.querySelector('.allusers-user-name');
      var emailEl = row.querySelector('.allusers-user-email');
      var avatarEl = row.querySelector('.allusers-avatar img');
      if (nameEl) {
        users.push({
          name: nameEl.textContent,
          email: emailEl ? emailEl.textContent : '',
          avatar: avatarEl ? avatarEl.src : ''
        });
      }
    });
    if (users.length === 0) return;

    var count = users.length;
    modalTitle.textContent = 'Assign ' + count + ' AI Workflow seats';
    modalSeats.textContent = '(' + window.AIW.allocatedSeats + '/' + window.AIW.purchasedSeats + ' seats)';
    modalConfirm.textContent = 'Assign ' + count + ' seats';

    modalUsers.innerHTML = '';
    users.forEach(function(u) {
      var row = document.createElement('div');
      row.className = 'assign-modal-user';
      row.innerHTML =
        '<input type="checkbox" class="mds-checkbox" checked disabled>' +
        '<div class="assign-modal-user-avatar"><img src="' + u.avatar + '" alt=""></div>' +
        '<div class="assign-modal-user-info"><span class="assign-modal-user-name">' + u.name + '</span><span class="assign-modal-user-email">' + u.email + '</span></div>';
      modalUsers.appendChild(row);
    });

    modalOverlay.classList.add('visible');

    modalConfirm.onclick = function() {
      closeModal();
      document.getElementById('bulk-menu').classList.remove('open');
      if (window.startBulkAssign) {
        window.startBulkAssign(users);
      }
      document.querySelectorAll('.allusers-table tbody .mds-checkbox:checked').forEach(function(cb) {
        cb.checked = false;
        var r = cb.closest('tr');
        if (r) r.classList.remove('row-selected');
      });
      var hcb = document.querySelector('.allusers-table thead .mds-checkbox');
      if (hcb) hcb.checked = false;
      document.getElementById('bulk-actions-bar').classList.remove('visible');
    };
  };

  window.openSingleAssignModal = function(user) {
    if (!user || !user.name) return;

    modalTitle.textContent = 'Assign 1 AI Workflow seat';
    modalSeats.textContent = '(' + window.AIW.allocatedSeats + '/' + window.AIW.purchasedSeats + ' seats)';
    modalConfirm.textContent = 'Assign 1 seat';

    modalUsers.innerHTML = '';
    var row = document.createElement('div');
    row.className = 'assign-modal-user';
    row.innerHTML =
      '<input type="checkbox" class="mds-checkbox" checked disabled>' +
      '<div class="assign-modal-user-avatar"><img src="' + (user.avatar || '') + '" alt=""></div>' +
      '<div class="assign-modal-user-info"><span class="assign-modal-user-name">' + user.name + '</span><span class="assign-modal-user-email">' + user.email + '</span></div>';
    modalUsers.appendChild(row);

    modalOverlay.classList.add('visible');

    modalConfirm.onclick = function() {
      closeModal();
      if (window.startBulkAssign) {
        window.startBulkAssign([user]);
      }
    };
  };

  var bulkAssignItem = document.querySelector('[data-action="bulk-assign"]');
  if (bulkAssignItem) {
    bulkAssignItem.addEventListener('click', function() {
      window.openAssignModal();
    });
  }

  var bulkUnassignItem = document.querySelector('[data-action="bulk-unassign"]');
  if (bulkUnassignItem) {
    bulkUnassignItem.addEventListener('click', function() {
      if (window.openUnassignModal) window.openUnassignModal();
    });
  }
})();

// ===== AIW USERS BULK ACTIONS =====
(function() {
  var bulkBar = document.getElementById('aiw-bulk-bar');
  var bulkToggle = document.getElementById('aiw-bulk-toggle');
  var bulkMenu = document.getElementById('aiw-bulk-menu');
  var bulkClear = document.getElementById('aiw-bulk-clear');
  var selectedCountEl = document.getElementById('aiw-selected-count');
  var headerCb = document.getElementById('aiw-header-cb');

  function getCheckboxes() {
    return document.querySelectorAll('#aiw-users-table tbody .mds-checkbox');
  }

  function updateBar() {
    var cbs = getCheckboxes();
    var count = 0;
    cbs.forEach(function(cb) { if (cb.checked) count++; });
    if (count > 0) {
      bulkBar.classList.add('visible');
      selectedCountEl.textContent = count + ' user' + (count > 1 ? 's' : '') + ' selected';
    } else {
      bulkBar.classList.remove('visible');
    }
  }

  function clearAll() {
    getCheckboxes().forEach(function(cb) {
      cb.checked = false;
      var r = cb.closest('tr');
      if (r) r.classList.remove('row-selected');
    });
    if (headerCb) headerCb.checked = false;
    bulkBar.classList.remove('visible');
    bulkMenu.classList.remove('open');
  }

  window.bindAiwBulkActions = function() {
    headerCb = document.getElementById('aiw-header-cb');
    var cbs = getCheckboxes();
    cbs.forEach(function(cb) {
      cb.addEventListener('change', function() {
        var row = this.closest('tr');
        if (row) {
          if (this.checked) row.classList.add('row-selected');
          else row.classList.remove('row-selected');
        }
        updateBar();
        if (headerCb) {
          var all = true;
          cbs.forEach(function(c) { if (!c.checked) all = false; });
          headerCb.checked = all && cbs.length > 0;
        }
      });
    });
    if (headerCb) {
      headerCb.onchange = function() {
        var checked = this.checked;
        getCheckboxes().forEach(function(cb) {
          cb.checked = checked;
          var r = cb.closest('tr');
          if (r) {
            if (checked) r.classList.add('row-selected');
            else r.classList.remove('row-selected');
          }
        });
        updateBar();
      };
    }
  };

  window.bindAiwBulkActions();

  bulkToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    bulkMenu.classList.toggle('open');
  });

  bulkClear.addEventListener('click', clearAll);

  document.addEventListener('click', function(e) {
    if (!document.getElementById('aiw-bulk-dropdown').contains(e.target)) {
      bulkMenu.classList.remove('open');
    }
  });

  var unassignItem = document.querySelector('[data-action="aiw-unassign-bulk"]');
  if (unassignItem) {
    unassignItem.addEventListener('click', function() {
      bulkMenu.classList.remove('open');
      var cbs = getCheckboxes();
      var users = [];
      cbs.forEach(function(cb) {
        if (!cb.checked) return;
        var row = cb.closest('tr');
        if (!row) return;
        var nameEl = row.querySelector('.user-name');
        var emailEl = row.querySelector('.user-email');
        var avatarEl = row.querySelector('.user-avatar img');
        if (nameEl) {
          users.push({
            name: nameEl.textContent.trim(),
            email: emailEl ? emailEl.textContent : '',
            avatar: avatarEl ? avatarEl.src : ''
          });
        }
      });
      if (users.length === 0) return;

      if (window.openAiwUnassignModal) {
        window.openAiwUnassignModal(users);
      }
    });
  }

  window.openAiwUnassignModal = function(users) {
    var overlay = document.getElementById('unassign-modal-overlay');
    var titleEl = document.getElementById('unassign-modal-title');
    var seatsEl = document.getElementById('unassign-modal-seats');
    var usersEl = document.getElementById('unassign-modal-users');
    var confirmBtn = document.getElementById('unassign-modal-confirm');

    var count = users.length;
    titleEl.textContent = 'Unassign ' + count + ' AI workflow seat' + (count > 1 ? 's' : '');
    seatsEl.textContent = '(' + window.AIW.allocatedSeats + '/' + window.AIW.purchasedSeats + ' seats)';
    confirmBtn.textContent = 'Unassign ' + count + ' seat' + (count > 1 ? 's' : '');

    usersEl.innerHTML = '';
    users.forEach(function(u) {
      var row = document.createElement('div');
      row.className = 'assign-modal-user';
      row.innerHTML =
        '<input type="checkbox" class="mds-checkbox" checked disabled>' +
        '<div class="assign-modal-user-avatar"><img src="' + (u.avatar || '') + '" alt=""></div>' +
        '<div class="assign-modal-user-info"><span class="assign-modal-user-name">' + u.name + '</span><span class="assign-modal-user-email">' + u.email + '</span></div>';
      usersEl.appendChild(row);
    });

    overlay.classList.add('visible');

    confirmBtn.onclick = function() {
      overlay.classList.remove('visible');
      var names = users.map(function(u) { return u.name; });
      clearAll();
      if (window.startBulkUnassign) window.startBulkUnassign(names);
    };
  };
})();

// ===== UNASSIGN CONFIRM MODAL =====
(function() {
  var overlay = document.getElementById('unassign-modal-overlay');
  var titleEl = document.getElementById('unassign-modal-title');
  var seatsEl = document.getElementById('unassign-modal-seats');
  var usersEl = document.getElementById('unassign-modal-users');
  var confirmBtn = document.getElementById('unassign-modal-confirm');
  var cancelBtn = document.getElementById('unassign-modal-cancel');
  var closeBtn = document.getElementById('unassign-modal-close');

  function closeModal() { overlay.classList.remove('visible'); }
  cancelBtn.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });

  function populateModal(users) {
    var count = users.length;
    titleEl.textContent = 'Unassign ' + count + ' AI workflow seat' + (count > 1 ? 's' : '');
    seatsEl.textContent = '(' + window.AIW.allocatedSeats + '/' + window.AIW.purchasedSeats + ' seats)';
    confirmBtn.textContent = 'Unassign ' + count + ' seat' + (count > 1 ? 's' : '');

    usersEl.innerHTML = '';
    users.forEach(function(u) {
      var row = document.createElement('div');
      row.className = 'assign-modal-user';
      var avatar = u.avatar || 'https://i.pravatar.cc/72?u=' + u.name.toLowerCase().replace(/\s+/g, '');
      row.innerHTML =
        '<input type="checkbox" class="mds-checkbox" checked disabled>' +
        '<div class="assign-modal-user-avatar"><img src="' + avatar + '" alt=""></div>' +
        '<div class="assign-modal-user-info"><span class="assign-modal-user-name">' + u.name + '</span><span class="assign-modal-user-email">' + (u.email || '') + '</span></div>';
      usersEl.appendChild(row);
    });
    overlay.classList.add('visible');
    return users;
  }

  window.openUnassignModal = function() {
    var checked = document.querySelectorAll('.allusers-table tbody .mds-checkbox:checked');
    var users = [];
    checked.forEach(function(cb) {
      var row = cb.closest('tr');
      if (!row) return;
      var nameEl = row.querySelector('.allusers-user-name');
      var emailEl = row.querySelector('.allusers-user-email');
      var avatarEl = row.querySelector('.allusers-avatar img');
      if (nameEl) {
        users.push({
          name: nameEl.textContent.trim(),
          email: emailEl ? emailEl.textContent : '',
          avatar: avatarEl ? avatarEl.src : ''
        });
      }
    });
    if (users.length === 0) return;

    document.getElementById('bulk-menu').classList.remove('open');
    document.getElementById('bulk-menu').querySelectorAll('.active').forEach(function(el) { el.classList.remove('active'); });

    var userData = populateModal(users);

    confirmBtn.onclick = function() {
      closeModal();
      var names = userData.map(function(u) { return u.name; });
      if (window.startBulkUnassign) window.startBulkUnassign(names);
      checked.forEach(function(cb) {
        cb.checked = false;
        var r = cb.closest('tr');
        if (r) r.classList.remove('row-selected');
      });
      var hcb = document.querySelector('.allusers-table thead .mds-checkbox');
      if (hcb) hcb.checked = false;
      document.getElementById('bulk-actions-bar').classList.remove('visible');
    };
  };

  window.openSingleUnassignModal = function(user) {
    if (!user || !user.name) return;
    var userData = populateModal([user]);

    confirmBtn.onclick = function() {
      closeModal();
      if (window.startBulkUnassign) window.startBulkUnassign([user.name]);
    };
  };
})();

// ===== BULK ASSIGN PROGRESS =====
(function() {
  var toast = document.getElementById('bulk-toast');
  var toastLabel = document.getElementById('bulk-toast-label');
  var toastSub = document.getElementById('bulk-toast-sub');
  var toastSpinner = document.getElementById('bulk-toast-spinner');
  var toastStop = document.getElementById('bulk-toast-stop');
  var toastClose = document.getElementById('bulk-toast-close');
  var progressTimer = null;
  var stopped = false;

  function formatNow() {
    var d = new Date();
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var h = d.getHours(); var m = d.getMinutes();
    var ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ', ' + h + ':' + (m < 10 ? '0' : '') + m + ampm;
  }

  function formatToday() {
    var d = new Date();
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  window.startBulkAssign = function(users) {
    stopped = false;
    var total = users.length;
    var current = 0;

    toastLabel.textContent = 'Assign seats (0/' + total + ')';
    toastSub.textContent = 'Started ' + formatNow();
    toastSpinner.style.display = '';
    toastSpinner.className = 'bulk-toast-spinner';
    toastStop.style.display = '';
    toast.classList.add('visible');

    function processNext() {
      if (stopped || current >= total) {
        finishBulk();
        return;
      }
      current++;
      toastLabel.textContent = 'Assign seats (' + current + '/' + total + ')';
      window.AIW.assignUser(users[current - 1]);
      window.AIW.syncAllViews();

      if (current < total) {
        progressTimer = setTimeout(processNext, 1200);
      } else {
        progressTimer = setTimeout(finishBulk, 800);
      }
    }

    function finishBulk() {
      clearTimeout(progressTimer);
      var assigned = current;
      toastLabel.textContent = 'Assign seats (' + assigned + '/' + total + ')';
      toastSub.textContent = 'Completed ' + formatNow();
      toastSpinner.style.display = 'none';
      toastStop.style.display = 'none';

      setTimeout(function() {
        toast.classList.remove('visible');
      }, 4000);
    }

    progressTimer = setTimeout(processNext, 800);
  };

  window.startBulkUnassign = function(userNames) {
    stopped = false;
    var total = userNames.length;
    var current = 0;

    toastLabel.textContent = 'Unassign seats (0/' + total + ')';
    toastSub.textContent = 'Started ' + formatNow();
    toastSpinner.style.display = '';
    toastSpinner.className = 'bulk-toast-spinner';
    toastStop.style.display = '';
    toast.classList.add('visible');

    function processNext() {
      if (stopped || current >= total) {
        finishUnassign();
        return;
      }
      current++;
      toastLabel.textContent = 'Unassign seats (' + current + '/' + total + ')';
      var name = userNames[current - 1];
      window.AIW.unassignUser(name);
      window.AIW.unassignAndSyncProducts(name);

      if (current < total) {
        progressTimer = setTimeout(processNext, 1200);
      } else {
        progressTimer = setTimeout(finishUnassign, 800);
      }
    }

    function finishUnassign() {
      clearTimeout(progressTimer);
      toastLabel.textContent = 'Unassign seats (' + current + '/' + total + ')';
      toastSub.textContent = 'Completed ' + formatNow();
      toastSpinner.style.display = 'none';
      toastStop.style.display = 'none';
      window.AIW.syncAllViews();

      setTimeout(function() {
        toast.classList.remove('visible');
      }, 4000);
    }

    progressTimer = setTimeout(processNext, 800);
  };

  toastStop.addEventListener('click', function() {
    stopped = true;
    clearTimeout(progressTimer);
    toastSub.textContent = 'Stopped ' + formatNow();
    toastSpinner.style.display = 'none';
    toastStop.style.display = 'none';
  });

  toastClose.addEventListener('click', function() {
    stopped = true;
    clearTimeout(progressTimer);
    toast.classList.remove('visible');
  });
})();

// ===== POLICY CHATBOT ENGINE =====
(function() {
  var overlay = document.getElementById('pol-chat-overlay');
  var messagesEl = document.getElementById('pol-chat-messages');
  var chipsEl = document.getElementById('pol-chat-chips');
  var inputEl = document.getElementById('pol-chat-input');
  var sendBtn = document.getElementById('pol-chat-send');
  var closeBtn = document.getElementById('pol-chat-close');
  var progressFill = document.getElementById('pol-chat-progress-fill');
  var titleEl = document.getElementById('pol-chat-title');

  var currentPolicy = null;
  var currentStep = 0;
  var collectedData = {};
  var isProcessing = false;

  // ── Conversation templates for all 6 policies ──

  var policyFlows = {
    'license-recycling': {
      title: 'License Recycling',
      recId: 'rec-license',
      steps: [
        {
          ai: [
            "I've analyzed your organization's license usage. Here's what I found:",
            { type: 'data-card', title: 'License Analysis', rows: [
              { label: 'Total licenses', value: '340', cls: '' },
              { label: 'Active (last 30 days)', value: '293', cls: 'ok' },
              { label: 'Inactive 60+ days', value: '28', cls: 'warn' },
              { label: 'Inactive 90+ days', value: '19', cls: 'danger' },
              { label: 'Est. annual savings', value: '$14,100', cls: 'ok' }
            ]},
            "I recommend recycling <strong>47 unused licenses</strong> (inactive 60+ days). Shall we proceed with the default scope, or would you like to customize?"
          ],
          chips: [
            { label: 'Use recommended scope', value: 'recommended', primary: true },
            { label: 'Only 90+ days inactive', value: '90-only' },
            { label: 'Customize threshold', value: 'custom' }
          ],
          field: 'scope'
        },
        {
          ai: [
            "Great choice. Before recycling, I'll configure how affected users are handled:",
            { type: 'form', fields: [
              { id: 'notifyUsers', label: 'Notify users before recycling', kind: 'switch', defaultOn: true },
              { id: 'gracePeriod', label: 'Grace period', kind: 'select', options: [
                { value: '7', text: '7 days' }, { value: '14', text: '14 days' }, { value: '30', text: '30 days' }
              ], defaultValue: '14' },
              { id: 'autoReassign', label: 'Auto-reassign to waitlist', kind: 'switch', defaultOn: false }
            ]},
            { type: 'callout', variant: 'info', text: 'Users will receive an email notification and have the grace period to reactivate before the license is recycled.' }
          ],
          chips: [
            { label: 'Looks good, continue', value: 'confirm', primary: true },
            { label: 'Adjust settings', value: 'adjust' }
          ],
          field: 'config'
        },
        {
          ai: [
            "How often should this policy run?",
            { type: 'form', fields: [
              { id: 'cadence', label: 'Recurrence', kind: 'select', options: [
                { value: 'once', text: 'One-time only' },
                { value: 'monthly', text: 'Every month' },
                { value: 'quarterly', text: 'Every 3 months' },
                { value: 'biannual', text: 'Every 6 months' }
              ], defaultValue: 'quarterly' },
              { id: 'requireApproval', label: 'Require admin approval before each run', kind: 'switch', defaultOn: true }
            ]}
          ],
          chips: [
            { label: 'Continue to review', value: 'review', primary: true }
          ],
          field: 'schedule'
        },
        {
          ai: [
            "Here's your policy summary. Review and activate when ready:",
            { type: 'summary' },
            { type: 'callout', variant: 'success', text: 'This policy is estimated to save ~$14,100/year by recycling unused licenses and reallocating them to active teams.' }
          ],
          chips: [
            { label: 'Activate policy', value: 'activate', cls: 'success' },
            { label: 'Save as draft', value: 'draft' },
            { label: 'Go back', value: 'back', cls: 'danger' }
          ],
          field: 'action'
        }
      ],
      buildPolicy: function(data) {
        var scope = data.scope === '90-only' ? 19 : 47;
        var cadence = (data.schedule_cadence) || 'quarterly';
        var cadenceLabels = { once: 'One-time only', monthly: 'Every month', quarterly: 'Every 3 months', biannual: 'Every 6 months' };
        var intervalMonths = { once: 0, monthly: 1, quarterly: 3, biannual: 6 }[cadence] || 3;
        var nextRun = null;
        if (intervalMonths > 0) {
          var nr = new Date(); nr.setMonth(nr.getMonth() + intervalMonths);
          var mos = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          nextRun = mos[nr.getMonth()] + ' ' + nr.getDate() + ', ' + nr.getFullYear();
        }
        return {
          name: 'License Recycling', targetUsers: scope,
          deadline: parseInt(data.config_gracePeriod) || 14,
          cadence: cadence, cadenceLabel: cadenceLabels[cadence] || 'Every 3 months',
          nextRun: nextRun, requireApproval: data.schedule_requireApproval !== false,
          config: { sendEmail: data.config_notifyUsers !== false, deadline: parseInt(data.config_gracePeriod) || 14, autoRemove: false, recycleLicense: true, announcement: true, autoReassign: !!data.config_autoReassign, schedule: 'Immediately' }
        };
      }
    },
    'reactivate-users': {
      title: 'Reactivate Inactive Users',
      recId: 'rec-reactivate',
      steps: [
        {
          ai: [
            "I've identified inactive users in your organization who need attention:",
            { type: 'data-card', title: 'Inactive User Segments', rows: [
              { label: 'Invited 90+ days ago, never logged in', value: '68 users', cls: 'danger' },
              { label: 'Logged in once, inactive 60+ days', value: '34 users', cls: 'warn' },
              { label: 'Recently invited, within 30-day window', value: '25 users', cls: '' },
              { label: 'Total affected', value: '127 users', cls: '' }
            ]},
            "Which user segments should be included in this reactivation campaign?"
          ],
          chips: [
            { label: 'All 127 users (recommended)', value: 'all', primary: true },
            { label: 'High priority only (68)', value: 'high-only' },
            { label: 'High + Medium (102)', value: 'high-med' }
          ],
          field: 'scope'
        },
        {
          ai: [
            "Now let's configure how to reach these users:",
            { type: 'form', fields: [
              { id: 'sendEmail', label: 'Send reactivation email', kind: 'switch', defaultOn: true },
              { id: 'deadline', label: 'Response deadline', kind: 'select', options: [
                { value: '7', text: '7 days' }, { value: '14', text: '14 days' }, { value: '30', text: '30 days' }
              ], defaultValue: '14' },
              { id: 'autoRemove', label: 'Auto-remove from groups after deadline', kind: 'switch', defaultOn: false },
              { id: 'recycleLicense', label: 'Recycle license if no response', kind: 'switch', defaultOn: false },
              { id: 'announcement', label: 'Show in-app announcement', kind: 'switch', defaultOn: true }
            ]}
          ],
          chips: [{ label: 'Continue', value: 'confirm', primary: true }],
          field: 'config'
        },
        {
          ai: [
            "Set the recurrence for this policy:",
            { type: 'form', fields: [
              { id: 'cadence', label: 'Run frequency', kind: 'select', options: [
                { value: 'once', text: 'One-time only' }, { value: 'monthly', text: 'Every month' },
                { value: 'quarterly', text: 'Every 3 months' }, { value: 'biannual', text: 'Every 6 months' },
                { value: 'annual', text: 'Every 12 months' }
              ], defaultValue: 'quarterly' },
              { id: 'requireApproval', label: 'Require admin approval before each run', kind: 'switch', defaultOn: true }
            ]},
            { type: 'callout', variant: 'info', text: 'Recurring runs will re-scan for newly inactive users matching the same criteria and apply the policy automatically.' }
          ],
          chips: [{ label: 'Review summary', value: 'review', primary: true }],
          field: 'schedule'
        },
        {
          ai: [
            "Here's your reactivation policy summary:",
            { type: 'summary' },
            { type: 'callout', variant: 'success', text: 'Based on similar campaigns, we expect ~40% of users to reactivate within the deadline period.' }
          ],
          chips: [
            { label: 'Activate policy', value: 'activate', cls: 'success' },
            { label: 'Save as draft', value: 'draft' },
            { label: 'Go back', value: 'back', cls: 'danger' }
          ],
          field: 'action'
        }
      ],
      buildPolicy: function(data) {
        var scopeMap = { 'all': 127, 'high-only': 68, 'high-med': 102 };
        var users = scopeMap[data.scope] || 127;
        var cadence = data.schedule_cadence || 'quarterly';
        var cadenceLabels = { once: 'One-time only', monthly: 'Every month', quarterly: 'Every 3 months', biannual: 'Every 6 months', annual: 'Every 12 months' };
        var intervalMonths = { once: 0, monthly: 1, quarterly: 3, biannual: 6, annual: 12 }[cadence] || 3;
        var nextRun = null;
        if (intervalMonths > 0) {
          var nr = new Date(); nr.setMonth(nr.getMonth() + intervalMonths);
          var mos = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          nextRun = mos[nr.getMonth()] + ' ' + nr.getDate() + ', ' + nr.getFullYear();
        }
        return {
          name: 'Reactivate inactive users', targetUsers: users,
          deadline: parseInt(data.config_deadline) || 14,
          cadence: cadence, cadenceLabel: cadenceLabels[cadence] || 'Every 3 months',
          nextRun: nextRun, requireApproval: data.schedule_requireApproval !== false,
          config: { sendEmail: data.config_sendEmail !== false, deadline: parseInt(data.config_deadline) || 14, autoRemove: !!data.config_autoRemove, recycleLicense: !!data.config_recycleLicense, announcement: data.config_announcement !== false, schedule: 'Immediately' }
        };
      }
    },
    'space-consolidation': {
      title: 'Space Consolidation',
      recId: 'rec-spaces',
      steps: [
        {
          ai: [
            "I've scanned your organization's spaces and found consolidation opportunities:",
            { type: 'data-card', title: 'Space Analysis', rows: [
              { label: 'Total spaces', value: '42', cls: '' },
              { label: 'Active spaces (updated last 30d)', value: '34', cls: 'ok' },
              { label: 'Empty spaces (0 boards)', value: '3', cls: 'warn' },
              { label: 'Stale spaces (no activity 90+ days)', value: '5', cls: 'danger' },
              { label: 'Duplicate/overlapping spaces', value: '2 pairs', cls: 'warn' }
            ]},
            "What should we do with inactive spaces?"
          ],
          chips: [
            { label: 'Archive all 8 inactive', value: 'archive-all', primary: true },
            { label: 'Archive empty only (3)', value: 'archive-empty' },
            { label: 'Notify owners first', value: 'notify-first' }
          ],
          field: 'scope'
        },
        {
          ai: [
            "Configure the consolidation settings:",
            { type: 'form', fields: [
              { id: 'notifyOwners', label: 'Notify space owners before action', kind: 'switch', defaultOn: true },
              { id: 'gracePeriod', label: 'Grace period for owners to respond', kind: 'select', options: [
                { value: '7', text: '7 days' }, { value: '14', text: '14 days' }, { value: '30', text: '30 days' }
              ], defaultValue: '14' },
              { id: 'moveBoards', label: 'Move remaining boards to a general space', kind: 'switch', defaultOn: true },
              { id: 'deleteEmpty', label: 'Permanently delete empty spaces', kind: 'switch', defaultOn: false }
            ]},
            { type: 'callout', variant: 'warning', text: 'Archived spaces can be restored by admins. Deleted spaces are permanent.' }
          ],
          chips: [{ label: 'Continue', value: 'confirm', primary: true }],
          field: 'config'
        },
        {
          ai: [
            "Set the schedule:",
            { type: 'form', fields: [
              { id: 'cadence', label: 'Run frequency', kind: 'select', options: [
                { value: 'once', text: 'One-time only' }, { value: 'quarterly', text: 'Every 3 months' }, { value: 'biannual', text: 'Every 6 months' }
              ], defaultValue: 'quarterly' },
              { id: 'requireApproval', label: 'Require admin approval', kind: 'switch', defaultOn: true }
            ]}
          ],
          chips: [{ label: 'Review summary', value: 'review', primary: true }],
          field: 'schedule'
        },
        {
          ai: [
            "Here's your space consolidation policy:",
            { type: 'summary' },
            { type: 'callout', variant: 'success', text: 'Consolidating unused spaces improves navigation and reduces admin overhead.' }
          ],
          chips: [
            { label: 'Activate policy', value: 'activate', cls: 'success' },
            { label: 'Save as draft', value: 'draft' },
            { label: 'Go back', value: 'back', cls: 'danger' }
          ],
          field: 'action'
        }
      ],
      buildPolicy: function(data) {
        var scopeMap = { 'archive-all': 8, 'archive-empty': 3, 'notify-first': 8 };
        var cadence = data.schedule_cadence || 'quarterly';
        var cadenceLabels = { once: 'One-time only', quarterly: 'Every 3 months', biannual: 'Every 6 months' };
        var im = { once: 0, quarterly: 3, biannual: 6 }[cadence] || 3;
        var nextRun = null;
        if (im > 0) { var nr = new Date(); nr.setMonth(nr.getMonth() + im); var mos = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; nextRun = mos[nr.getMonth()] + ' ' + nr.getDate() + ', ' + nr.getFullYear(); }
        return { name: 'Space Consolidation', targetUsers: scopeMap[data.scope] || 8, deadline: parseInt(data.config_gracePeriod) || 14, cadence: cadence, cadenceLabel: cadenceLabels[cadence] || 'Every 3 months', nextRun: nextRun, requireApproval: data.schedule_requireApproval !== false, config: { sendEmail: data.config_notifyOwners !== false, deadline: parseInt(data.config_gracePeriod) || 14, autoRemove: false, recycleLicense: false, announcement: true, schedule: 'Immediately' } };
      }
    },
    'addon-optimization': {
      title: 'Add-on Optimization',
      recId: 'rec-addon',
      steps: [
        {
          ai: [
            "I've analyzed feature usage patterns across your teams:",
            { type: 'data-card', title: 'Add-on Usage Insights', rows: [
              { label: 'Teams using diagramming heavily', value: '3 teams', cls: 'ok' },
              { label: 'Avg. diagramming sessions/week', value: '47', cls: '' },
              { label: 'Teams that would benefit from prototyping', value: '2 teams', cls: '' },
              { label: 'Est. productivity gain', value: '+30%', cls: 'ok' },
              { label: 'Monthly add-on cost', value: '$450/mo', cls: 'warn' }
            ]},
            "Would you like to proceed with the add-on recommendation for these teams?"
          ],
          chips: [
            { label: 'Recommend to all 3 teams', value: 'all-teams', primary: true },
            { label: 'Select specific teams', value: 'select-teams' },
            { label: 'Just generate a report', value: 'report-only' }
          ],
          field: 'scope'
        },
        {
          ai: [
            "Configure the recommendation rollout:",
            { type: 'form', fields: [
              { id: 'trialPeriod', label: 'Trial period before full rollout', kind: 'select', options: [
                { value: '14', text: '14 days' }, { value: '30', text: '30 days' }, { value: '0', text: 'No trial, enable immediately' }
              ], defaultValue: '30' },
              { id: 'notifyTeamLeads', label: 'Notify team leads about add-on', kind: 'switch', defaultOn: true },
              { id: 'trackUsage', label: 'Track usage metrics during trial', kind: 'switch', defaultOn: true },
              { id: 'autoActivate', label: 'Auto-activate after successful trial', kind: 'switch', defaultOn: false }
            ]},
            { type: 'callout', variant: 'info', text: 'During the trial, team members will have full access. Usage data will help decide on permanent activation.' }
          ],
          chips: [{ label: 'Continue', value: 'confirm', primary: true }],
          field: 'config'
        },
        {
          ai: [
            "Set the optimization review schedule:",
            { type: 'form', fields: [
              { id: 'cadence', label: 'Review frequency', kind: 'select', options: [
                { value: 'once', text: 'One-time only' }, { value: 'quarterly', text: 'Every 3 months' }, { value: 'biannual', text: 'Every 6 months' }
              ], defaultValue: 'quarterly' },
              { id: 'requireApproval', label: 'Require approval for activation', kind: 'switch', defaultOn: true }
            ]}
          ],
          chips: [{ label: 'Review summary', value: 'review', primary: true }],
          field: 'schedule'
        },
        {
          ai: [
            "Here's your add-on optimization policy:",
            { type: 'summary' },
            { type: 'callout', variant: 'success', text: 'Teams with the right tools are 30% more productive. This policy ensures optimal add-on allocation.' }
          ],
          chips: [
            { label: 'Activate policy', value: 'activate', cls: 'success' },
            { label: 'Save as draft', value: 'draft' },
            { label: 'Go back', value: 'back', cls: 'danger' }
          ],
          field: 'action'
        }
      ],
      buildPolicy: function(data) {
        var cadence = data.schedule_cadence || 'quarterly';
        var cadenceLabels = { once: 'One-time only', quarterly: 'Every 3 months', biannual: 'Every 6 months' };
        var im = { once: 0, quarterly: 3, biannual: 6 }[cadence] || 3;
        var nextRun = null;
        if (im > 0) { var nr = new Date(); nr.setMonth(nr.getMonth() + im); var mos = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; nextRun = mos[nr.getMonth()] + ' ' + nr.getDate() + ', ' + nr.getFullYear(); }
        return { name: 'Add-on Optimization', targetUsers: data.scope === 'select-teams' ? 2 : 3, deadline: parseInt(data.config_trialPeriod) || 30, cadence: cadence, cadenceLabel: cadenceLabels[cadence] || 'Every 3 months', nextRun: nextRun, requireApproval: data.schedule_requireApproval !== false, config: { sendEmail: data.config_notifyTeamLeads !== false, deadline: parseInt(data.config_trialPeriod) || 30, autoRemove: false, recycleLicense: false, announcement: true, schedule: 'Immediately' } };
      }
    },
    'access-review': {
      title: 'Access Policy Review',
      recId: 'rec-access',
      steps: [
        {
          ai: [
            "I've audited sharing permissions across your organization:",
            { type: 'data-card', title: 'Access Audit Results', rows: [
              { label: 'External guests with board access', value: '23', cls: '' },
              { label: 'Guests with access expiring in 7 days', value: '15', cls: 'danger' },
              { label: 'Boards shared publicly', value: '4', cls: 'warn' },
              { label: 'Orphaned sharing links', value: '12', cls: 'warn' },
              { label: 'Teams with external guest access', value: '6', cls: '' }
            ]},
            "How would you like to handle expiring guest access?"
          ],
          chips: [
            { label: 'Revoke all expiring access', value: 'revoke-all', primary: true },
            { label: 'Extend by 30 days', value: 'extend' },
            { label: 'Review each individually', value: 'review-each' }
          ],
          field: 'scope'
        },
        {
          ai: [
            "Configure the access review settings:",
            { type: 'form', fields: [
              { id: 'notifyGuests', label: 'Notify guests before access changes', kind: 'switch', defaultOn: true },
              { id: 'notifyBoardOwners', label: 'Notify board owners', kind: 'switch', defaultOn: true },
              { id: 'revokePublicLinks', label: 'Revoke orphaned public sharing links', kind: 'switch', defaultOn: true },
              { id: 'gracePeriod', label: 'Grace period before revocation', kind: 'select', options: [
                { value: '3', text: '3 days' }, { value: '7', text: '7 days' }, { value: '14', text: '14 days' }
              ], defaultValue: '7' }
            ]},
            { type: 'callout', variant: 'warning', text: 'Revoking access is immediate after the grace period. Affected users will lose board access.' }
          ],
          chips: [{ label: 'Continue', value: 'confirm', primary: true }],
          field: 'config'
        },
        {
          ai: [
            "Set the review schedule:",
            { type: 'form', fields: [
              { id: 'cadence', label: 'Review frequency', kind: 'select', options: [
                { value: 'once', text: 'One-time only' }, { value: 'monthly', text: 'Every month' }, { value: 'quarterly', text: 'Every 3 months' }
              ], defaultValue: 'monthly' },
              { id: 'requireApproval', label: 'Require admin approval', kind: 'switch', defaultOn: true }
            ]}
          ],
          chips: [{ label: 'Review summary', value: 'review', primary: true }],
          field: 'schedule'
        },
        {
          ai: [
            "Here's your access review policy:",
            { type: 'summary' },
            { type: 'callout', variant: 'success', text: 'Regular access reviews help maintain security compliance and reduce unauthorized data exposure.' }
          ],
          chips: [
            { label: 'Activate policy', value: 'activate', cls: 'success' },
            { label: 'Save as draft', value: 'draft' },
            { label: 'Go back', value: 'back', cls: 'danger' }
          ],
          field: 'action'
        }
      ],
      buildPolicy: function(data) {
        var cadence = data.schedule_cadence || 'monthly';
        var cadenceLabels = { once: 'One-time only', monthly: 'Every month', quarterly: 'Every 3 months' };
        var im = { once: 0, monthly: 1, quarterly: 3 }[cadence] || 1;
        var nextRun = null;
        if (im > 0) { var nr = new Date(); nr.setMonth(nr.getMonth() + im); var mos = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; nextRun = mos[nr.getMonth()] + ' ' + nr.getDate() + ', ' + nr.getFullYear(); }
        return { name: 'Access Policy Review', targetUsers: 15, deadline: parseInt(data.config_gracePeriod) || 7, cadence: cadence, cadenceLabel: cadenceLabels[cadence] || 'Every month', nextRun: nextRun, requireApproval: data.schedule_requireApproval !== false, config: { sendEmail: data.config_notifyGuests !== false, deadline: parseInt(data.config_gracePeriod) || 7, autoRemove: true, recycleLicense: false, announcement: data.config_notifyBoardOwners !== false, schedule: 'Immediately' } };
      }
    },
    'compliance-audit': {
      title: 'Compliance Audit',
      recId: 'rec-compliance',
      steps: [
        {
          ai: [
            "I've scanned your organization's content sharing and security settings:",
            { type: 'data-card', title: 'Compliance Scan Results', rows: [
              { label: 'Teams audited', value: '18', cls: '' },
              { label: 'Non-compliant teams', value: '4', cls: 'danger' },
              { label: 'Public boards with sensitive content', value: '2', cls: 'danger' },
              { label: 'Missing data classification labels', value: '31 boards', cls: 'warn' },
              { label: 'Overall compliance score', value: '72%', cls: 'warn' }
            ]},
            "How would you like to handle non-compliant teams?"
          ],
          chips: [
            { label: 'Enforce compliance on all 4 teams', value: 'enforce-all', primary: true },
            { label: 'Send warning to team leads', value: 'warn-leads' },
            { label: 'Generate audit report only', value: 'report-only' }
          ],
          field: 'scope'
        },
        {
          ai: [
            "Configure the audit enforcement:",
            { type: 'form', fields: [
              { id: 'restrictPublicSharing', label: 'Restrict public sharing for non-compliant teams', kind: 'switch', defaultOn: true },
              { id: 'enforceLabels', label: 'Require data classification labels', kind: 'switch', defaultOn: true },
              { id: 'notifyTeamLeads', label: 'Notify team leads of violations', kind: 'switch', defaultOn: true },
              { id: 'remediationPeriod', label: 'Remediation period', kind: 'select', options: [
                { value: '7', text: '7 days' }, { value: '14', text: '14 days' }, { value: '30', text: '30 days' }
              ], defaultValue: '14' }
            ]},
            { type: 'callout', variant: 'danger', text: '2 boards with sensitive content are currently shared publicly. Immediate action is recommended.' }
          ],
          chips: [{ label: 'Continue', value: 'confirm', primary: true }],
          field: 'config'
        },
        {
          ai: [
            "Set the audit schedule:",
            { type: 'form', fields: [
              { id: 'cadence', label: 'Audit frequency', kind: 'select', options: [
                { value: 'once', text: 'One-time only' }, { value: 'monthly', text: 'Every month' }, { value: 'quarterly', text: 'Every 3 months' }
              ], defaultValue: 'monthly' },
              { id: 'requireApproval', label: 'Require admin approval', kind: 'switch', defaultOn: true }
            ]}
          ],
          chips: [{ label: 'Review summary', value: 'review', primary: true }],
          field: 'schedule'
        },
        {
          ai: [
            "Here's your compliance audit policy:",
            { type: 'summary' },
            { type: 'callout', variant: 'success', text: 'Regular compliance audits can improve your score from 72% to 95%+ within 2 audit cycles.' }
          ],
          chips: [
            { label: 'Activate policy', value: 'activate', cls: 'success' },
            { label: 'Save as draft', value: 'draft' },
            { label: 'Go back', value: 'back', cls: 'danger' }
          ],
          field: 'action'
        }
      ],
      buildPolicy: function(data) {
        var cadence = data.schedule_cadence || 'monthly';
        var cadenceLabels = { once: 'One-time only', monthly: 'Every month', quarterly: 'Every 3 months' };
        var im = { once: 0, monthly: 1, quarterly: 3 }[cadence] || 1;
        var nextRun = null;
        if (im > 0) { var nr = new Date(); nr.setMonth(nr.getMonth() + im); var mos = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; nextRun = mos[nr.getMonth()] + ' ' + nr.getDate() + ', ' + nr.getFullYear(); }
        return { name: 'Compliance Audit', targetUsers: 4, deadline: parseInt(data.config_remediationPeriod) || 14, cadence: cadence, cadenceLabel: cadenceLabels[cadence] || 'Every month', nextRun: nextRun, requireApproval: data.schedule_requireApproval !== false, config: { sendEmail: data.config_notifyTeamLeads !== false, deadline: parseInt(data.config_remediationPeriod) || 14, autoRemove: false, recycleLicense: false, announcement: true, schedule: 'Immediately' } };
      }
    }
  };

  // ── Rendering helpers ──

  function scrollToBottom() {
    setTimeout(function() { messagesEl.scrollTop = messagesEl.scrollHeight; }, 50);
  }

  function addTyping() {
    var el = document.createElement('div');
    el.className = 'pol-chat-typing';
    el.id = 'pol-chat-typing-indicator';
    el.innerHTML = '<div class="pol-chat-typing-dot"></div><div class="pol-chat-typing-dot"></div><div class="pol-chat-typing-dot"></div>';
    messagesEl.appendChild(el);
    scrollToBottom();
    return el;
  }

  function removeTyping() {
    var t = document.getElementById('pol-chat-typing-indicator');
    if (t) t.remove();
  }

  function addMessage(content, sender) {
    var wrap = document.createElement('div');
    wrap.className = 'pol-chat-msg pol-chat-msg--' + sender;
    var label = document.createElement('div');
    label.className = 'pol-chat-msg-label';
    label.textContent = sender === 'ai' ? 'Miro AI' : 'You';
    var bubble = document.createElement('div');
    bubble.className = 'pol-chat-msg-bubble';
    if (typeof content === 'string') {
      bubble.innerHTML = content;
    } else {
      bubble.appendChild(content);
    }
    if (sender === 'ai') { wrap.appendChild(label); wrap.appendChild(bubble); }
    else { wrap.appendChild(bubble); wrap.appendChild(label); }
    messagesEl.appendChild(wrap);
    scrollToBottom();
    return bubble;
  }

  function addDivider(text) {
    var d = document.createElement('div');
    d.className = 'pol-chat-divider';
    d.textContent = text;
    messagesEl.appendChild(d);
  }

  function addSpacer() {
    var s = document.createElement('div');
    s.className = 'pol-chat-spacer';
    messagesEl.appendChild(s);
  }

  function renderDataCard(card) {
    var el = document.createElement('div');
    el.className = 'pol-chat-data-card';
    var title = '<div class="pol-chat-data-card-title"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>' + card.title + '</div>';
    var rows = '';
    card.rows.forEach(function(r) {
      var cls = r.cls ? ' pol-chat-data-val--' + r.cls : '';
      rows += '<div class="pol-chat-data-row"><span>' + r.label + '</span><span class="pol-chat-data-val' + cls + '">' + r.value + '</span></div>';
    });
    el.innerHTML = title + rows;
    return el;
  }

  function renderForm(form) {
    var el = document.createElement('div');
    el.className = 'pol-chat-inline-form';
    form.fields.forEach(function(f) {
      if (f.kind === 'switch') {
        var row = document.createElement('div');
        row.className = 'pol-chat-switch-row';
        row.innerHTML = '<span class="pol-chat-switch-label">' + f.label + '</span>';
        var sw = document.createElement('div');
        sw.className = 'mds-switch' + (f.defaultOn ? ' checked' : '');
        sw.setAttribute('data-chat-field', f.id);
        sw.setAttribute('role', 'switch');
        sw.setAttribute('aria-checked', f.defaultOn ? 'true' : 'false');
        sw.addEventListener('click', function() {
          var on = sw.classList.toggle('checked');
          sw.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        row.appendChild(sw);
        el.appendChild(row);
      } else if (f.kind === 'select') {
        var field = document.createElement('div');
        field.className = 'pol-chat-form-field';
        field.innerHTML = '<label class="pol-chat-form-label">' + f.label + '</label>';
        var sel = document.createElement('select');
        sel.className = 'pol-chat-form-select';
        sel.setAttribute('data-chat-field', f.id);
        f.options.forEach(function(o) {
          var opt = document.createElement('option');
          opt.value = o.value; opt.textContent = o.text;
          if (o.value === f.defaultValue) opt.selected = true;
          sel.appendChild(opt);
        });
        field.appendChild(sel);
        el.appendChild(field);
      } else if (f.kind === 'input') {
        var field2 = document.createElement('div');
        field2.className = 'pol-chat-form-field';
        field2.innerHTML = '<label class="pol-chat-form-label">' + f.label + '</label>';
        var inp = document.createElement('input');
        inp.className = 'pol-chat-form-input';
        inp.type = 'text';
        inp.setAttribute('data-chat-field', f.id);
        if (f.placeholder) inp.placeholder = f.placeholder;
        if (f.defaultValue) inp.value = f.defaultValue;
        field2.appendChild(inp);
        el.appendChild(field2);
      }
    });
    return el;
  }

  function renderCallout(c) {
    var icons = {
      info: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
      warning: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
      success: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="m9.55 18-5.7-5.7 1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4 9.55 18Z"/></svg>',
      danger: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z"/></svg>'
    };
    var el = document.createElement('div');
    el.className = 'pol-chat-callout pol-chat-callout--' + c.variant;
    el.innerHTML = '<span class="pol-chat-callout-icon">' + (icons[c.variant] || '') + '</span><span>' + c.text + '</span>';
    return el;
  }

  function renderSummary() {
    var flow = policyFlows[currentPolicy];
    if (!flow) return document.createElement('div');
    var el = document.createElement('div');
    el.className = 'pol-chat-summary';
    var title = '<div class="pol-chat-summary-title"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M10.586 13 7.293 9.707l1.414-1.414L12 11.586l6.293-6.293 1.414 1.414-7 7h-2.12ZM4 17h16v2H4v-2Z"/></svg>' + flow.title + '</div>';
    var rows = '';
    var scopeChip = '';
    var flow0 = flow.steps[0];
    if (flow0 && flow0.chips) {
      flow0.chips.forEach(function(c) { if (c.value === collectedData.scope) scopeChip = c.label; });
    }
    rows += '<div class="pol-chat-summary-row"><span>Scope</span><span class="pol-chat-summary-val">' + (scopeChip || collectedData.scope || 'Default') + '</span></div>';
    var cadenceVal = collectedData.schedule_cadence || 'quarterly';
    var cadenceMap = { once: 'One-time only', monthly: 'Every month', quarterly: 'Every 3 months', biannual: 'Every 6 months', annual: 'Every 12 months' };
    rows += '<div class="pol-chat-summary-row"><span>Recurrence</span><span class="pol-chat-summary-val">' + (cadenceMap[cadenceVal] || cadenceVal) + '</span></div>';
    rows += '<div class="pol-chat-summary-row"><span>Approval required</span><span class="pol-chat-summary-val">' + (collectedData.schedule_requireApproval !== false ? 'Yes' : 'No') + '</span></div>';
    var configCount = 0;
    Object.keys(collectedData).forEach(function(k) { if (k.indexOf('config_') === 0 && collectedData[k] === true) configCount++; });
    rows += '<div class="pol-chat-summary-row"><span>Active settings</span><span class="pol-chat-summary-val">' + configCount + ' enabled</span></div>';
    el.innerHTML = title + rows;
    return el;
  }

  function collectFormData(stepField) {
    var switches = messagesEl.querySelectorAll('.mds-switch[data-chat-field]');
    switches.forEach(function(sw) {
      collectedData[stepField + '_' + sw.getAttribute('data-chat-field')] = sw.classList.contains('checked');
    });
    var selects = messagesEl.querySelectorAll('.pol-chat-form-select[data-chat-field]');
    selects.forEach(function(sel) {
      collectedData[stepField + '_' + sel.getAttribute('data-chat-field')] = sel.value;
    });
    var inputs = messagesEl.querySelectorAll('.pol-chat-form-input[data-chat-field]');
    inputs.forEach(function(inp) {
      collectedData[stepField + '_' + inp.getAttribute('data-chat-field')] = inp.value;
    });
  }

  function updateProgress() {
    var flow = policyFlows[currentPolicy];
    if (!flow) return;
    var pct = Math.round(((currentStep + 1) / flow.steps.length) * 100);
    progressFill.style.width = pct + '%';
  }

  function showChips(chips) {
    chipsEl.innerHTML = '';
    chipsEl.style.display = 'flex';
    chips.forEach(function(c) {
      var chip = document.createElement('button');
      var cls = 'pol-chat-chip';
      if (c.primary) cls += ' pol-chat-chip--primary';
      if (c.cls === 'success') cls += ' pol-chat-chip--success';
      if (c.cls === 'danger') cls += ' pol-chat-chip--danger';
      chip.className = cls;
      chip.textContent = c.label;
      chip.addEventListener('click', function() { handleChipClick(c); });
      chipsEl.appendChild(chip);
    });
    scrollToBottom();
  }

  function hideChips() { chipsEl.style.display = 'none'; chipsEl.innerHTML = ''; }

  // ── Step processing ──

  function processStep(stepIndex) {
    var flow = policyFlows[currentPolicy];
    if (!flow || stepIndex >= flow.steps.length) return;
    currentStep = stepIndex;
    updateProgress();
    isProcessing = true;
    hideChips();

    var step = flow.steps[stepIndex];
    var aiMessages = step.ai;

    addSpacer();
    if (stepIndex > 0) {
      addDivider('Step ' + (stepIndex + 1) + ' of ' + flow.steps.length);
    }

    function processAiMsg(idx) {
      if (idx >= aiMessages.length) {
        isProcessing = false;
        if (step.chips) showChips(step.chips);
        return;
      }
      var typing = addTyping();
      var msg = aiMessages[idx];
      var typingDelay = typeof msg === 'string' ? 600 + Math.min(msg.length * 5, 1200) : 800;

      setTimeout(function() {
        removeTyping();
        if (typeof msg === 'string') {
          addMessage(msg, 'ai');
        } else if (msg.type === 'data-card') {
          addMessage(renderDataCard(msg), 'ai');
        } else if (msg.type === 'form') {
          addMessage(renderForm(msg), 'ai');
        } else if (msg.type === 'callout') {
          addMessage(renderCallout(msg), 'ai');
        } else if (msg.type === 'summary') {
          addMessage(renderSummary(), 'ai');
        }
        processAiMsg(idx + 1);
      }, typingDelay);
    }

    processAiMsg(0);
  }

  function handleChipClick(chip) {
    if (isProcessing) return;
    var flow = policyFlows[currentPolicy];
    var step = flow.steps[currentStep];

    collectFormData(step.field);
    collectedData[step.field] = chip.value;
    addMessage(chip.label, 'user');
    hideChips();

    if (chip.value === 'activate' || chip.value === 'draft') {
      finishPolicy(chip.value);
      return;
    }
    if (chip.value === 'back') {
      if (currentStep > 0) processStep(currentStep - 1);
      return;
    }
    if (currentStep < flow.steps.length - 1) {
      processStep(currentStep + 1);
    }
  }

  function finishPolicy(action) {
    var flow = policyFlows[currentPolicy];
    if (!flow) return;
    isProcessing = true;

    var typing = addTyping();
    setTimeout(function() {
      removeTyping();
      var status = action === 'activate' ? 'active' : 'draft';
      var policyData = flow.buildPolicy(collectedData);
      var policy = {
        id: 'pol-' + Date.now(),
        recId: flow.recId,
        name: policyData.name,
        status: status,
        health: status === 'active' ? 'healthy' : 'pending',
        targetUsers: policyData.targetUsers,
        segments: '',
        reactivated: 0,
        violationCount: 0,
        deadline: policyData.deadline,
        createdAt: new Date().toISOString(),
        cadence: policyData.cadence,
        cadenceLabel: policyData.cadenceLabel,
        nextRun: policyData.nextRun,
        requireApproval: policyData.requireApproval,
        config: policyData.config,
        logs: [],
        nextAction: policyData.nextRun ? 'Next run: ' + policyData.nextRun : null
      };
      window.OrgPolicies.activePolicies.push(policy);
      if (window.refreshRecommendationCards) window.refreshRecommendationCards();
      if (window.refreshPolicyBanners) window.refreshPolicyBanners();
      if (window.refreshRecBanners) window.refreshRecBanners();

      var statusText = status === 'active' ? 'activated' : 'saved as draft';
      addMessage('Your <strong>' + flow.title + '</strong> policy has been ' + statusText + ' successfully! You can review and manage it from the <strong>Policy list</strong>.', 'ai');

      progressFill.style.width = '100%';

      setTimeout(function() {
        showChips([
          { label: 'Go to Policy list', value: '_nav_list', primary: true },
          { label: 'Create another policy', value: '_nav_onboard' },
          { label: 'Close', value: '_close' }
        ]);
        var navChips = chipsEl.querySelectorAll('.pol-chat-chip');
        navChips.forEach(function(nc) {
          nc.addEventListener('click', function(e) {
            e.stopPropagation();
            var val = nc.textContent;
            if (val.indexOf('Policy list') !== -1) { closeChat(); navigateTo('pol-list'); }
            else if (val.indexOf('another') !== -1) { closeChat(); navigateTo('pol-onboard'); }
            else { closeChat(); }
          });
        });
        isProcessing = false;
      }, 300);

      var toast = document.createElement('div');
      toast.className = 'pol-wiz-toast';
      toast.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="m9.55 18-5.7-5.7 1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4 9.55 18Z"/></svg> Policy ' + statusText;
      document.body.appendChild(toast);
      requestAnimationFrame(function() { toast.classList.add('visible'); });
      setTimeout(function() { toast.classList.remove('visible'); setTimeout(function() { toast.remove(); }, 300); }, 3000);
    }, 1000);
  }

  // ── Open / Close ──

  function openChat(policyId) {
    currentPolicy = policyId;
    currentStep = 0;
    collectedData = {};
    messagesEl.innerHTML = '';
    hideChips();
    progressFill.style.width = '0%';

    var flow = policyFlows[policyId];
    if (!flow) return;

    titleEl.textContent = flow.title;
    overlay.classList.add('open');

    setTimeout(function() {
      var typing = addTyping();
      setTimeout(function() {
        removeTyping();
        addMessage("Hi! I\u2019m your Miro AI Policy Assistant. Let\u2019s set up the <strong>" + flow.title + "</strong> policy together. I\u2019ll guide you through each step.", 'ai');
        addSpacer();
        processStep(0);
      }, 800);
    }, 300);
  }

  function closeChat() {
    overlay.classList.remove('open');
    currentPolicy = null;
  }

  if (closeBtn) closeBtn.addEventListener('click', closeChat);

  function handleSend() {
    var val = inputEl.value.trim();
    if (!val || isProcessing) return;
    addMessage(val, 'user');
    inputEl.value = '';
  }
  if (sendBtn) sendBtn.addEventListener('click', handleSend);
  if (inputEl) inputEl.addEventListener('keydown', function(e) { if (e.key === 'Enter') handleSend(); });

  document.querySelectorAll('.pol-card-btn[data-policy]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var policyId = btn.getAttribute('data-policy');
      if (policyFlows[policyId]) openChat(policyId);
    });
  });

  window.openPolicyChat = openChat;
})();

// Add mock data segments to OrgPolicies
window.OrgPolicies.inactiveUserSegments = [
  { id: 'seg-high', label: 'Invited 90+ days ago, never logged in', count: 68, priority: 'high', checked: true },
  { id: 'seg-med', label: 'Logged in once, inactive 60+ days', count: 34, priority: 'medium', checked: true },
  { id: 'seg-low', label: 'Recently invited, within 30-day window', count: 25, priority: 'low', checked: false }
];

// Active policies storage
window.OrgPolicies.activePolicies = [];

// ===== POLICY LIST PAGE LOGIC =====
(function() {
  var reviewPanel = document.getElementById('pol-review-panel');

  function formatDate(d) {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function now() { return new Date(); }

  // Refresh the policy list page
  function renderPolicyList() {
    var policies = window.OrgPolicies.activePolicies;
    var active = policies.filter(function(p) { return p.status === 'active'; });
    var drafts = policies.filter(function(p) { return p.status === 'draft'; });
    var paused = policies.filter(function(p) { return p.status === 'paused'; });

    // Update summary counts
    var acEl = document.getElementById('pol-mgmt-active-count');
    var dcEl = document.getElementById('pol-mgmt-draft-count');
    if (acEl) acEl.textContent = active.length;
    if (dcEl) dcEl.textContent = drafts.length;

    var summaryEl = document.getElementById('pol-mgmt-summary');
    if (summaryEl) {
      var parts = [];
      if (active.length) parts.push('<strong>' + active.length + '</strong> active ' + (active.length === 1 ? 'policy' : 'policies'));
      if (drafts.length) parts.push('<strong>' + drafts.length + '</strong> ' + (drafts.length === 1 ? 'draft' : 'drafts'));
      if (paused.length) parts.push('<strong>' + paused.length + '</strong> paused');
      summaryEl.innerHTML = 'You have ' + parts.join(', ') + '. Here\u2019s what\u2019s happening:';
    }

    // Render activity items
    var activityEl = document.getElementById('pol-mgmt-activity');
    if (activityEl) {
      var html = '';
      active.forEach(function(p) {
        var days = Math.floor((now() - new Date(p.createdAt)) / 86400000);
        if (days < 1) {
          html += '<div class="pol-mgmt-activity-item"><div class="pol-mgmt-activity-icon pol-mgmt-activity-icon--ok"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="m9.55 18-5.7-5.7 1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4 9.55 18Z"/></svg></div><div class="pol-mgmt-activity-text"><strong>' + p.name + '</strong> was just activated. Emails are being sent to ' + p.targetUsers + ' users.</div></div>';
        } else if (p.health === 'violation') {
          html += '<div class="pol-mgmt-activity-item"><div class="pol-mgmt-activity-icon pol-mgmt-activity-icon--warn"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z"/></svg></div><div class="pol-mgmt-activity-text"><strong>' + p.name + '</strong> needs review &mdash; ' + (p.violationCount || 0) + ' users haven\u2019t responded and the deadline is approaching.</div></div>';
        } else {
          html += '<div class="pol-mgmt-activity-item"><div class="pol-mgmt-activity-icon pol-mgmt-activity-icon--info"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg></div><div class="pol-mgmt-activity-text"><strong>' + p.name + '</strong> is running smoothly. Day ' + days + ' of ' + (p.deadline || 14) + '. ' + (p.reactivated || 0) + ' users reactivated so far.</div></div>';
        }
      });
      drafts.forEach(function(p) {
        html += '<div class="pol-mgmt-activity-item"><div class="pol-mgmt-activity-icon pol-mgmt-activity-icon--info"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg></div><div class="pol-mgmt-activity-text"><strong>' + p.name + '</strong> is saved as draft. Ready to activate when you are.</div></div>';
      });
      if (!html) html = '<div class="pol-mgmt-activity-item"><div class="pol-mgmt-activity-icon pol-mgmt-activity-icon--ok"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="m9.55 18-5.7-5.7 1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4 9.55 18Z"/></svg></div><div class="pol-mgmt-activity-text">All policies are running as expected. No action needed.</div></div>';
      activityEl.innerHTML = html;
    }

    // Render policy table
    var tbody = document.getElementById('pol-mgmt-tbody');
    var countEl = document.getElementById('pol-mgmt-list-count');
    if (countEl) countEl.textContent = policies.length + ' ' + (policies.length === 1 ? 'policy' : 'policies');
    if (tbody) {
      tbody.innerHTML = '';
      policies.forEach(function(p, idx) {
        var statusClass = 'pol-mgmt-status--' + p.status;
        var healthDot = 'pol-mgmt-health-dot--' + (p.health || 'pending');
        var healthLabel = p.health === 'healthy' ? 'Healthy' : (p.health === 'warning' ? 'Needs review' : (p.health === 'violation' ? 'Violation' : 'Pending'));
        var nextAction = p.status === 'draft' ? 'Activate' : (p.health === 'warning' || p.health === 'violation' ? 'Review now' : (p.nextAction || 'Day ' + (p.deadline || 14) + ' deadline'));

        var tr = document.createElement('tr');
        tr.setAttribute('data-pol-idx', idx);
        tr.innerHTML = '<td class="pol-mgmt-name">' + p.name + '</td>' +
          '<td><span class="pol-mgmt-status ' + statusClass + '">' + p.status.charAt(0).toUpperCase() + p.status.slice(1) + '</span></td>' +
          '<td><span class="pol-mgmt-health"><span class="pol-mgmt-health-dot ' + healthDot + '"></span>' + healthLabel + '</span></td>' +
          '<td>' + p.targetUsers + ' users</td>' +
          '<td>' + formatDate(new Date(p.createdAt)) + '</td>' +
          '<td>' + nextAction + '</td>' +
          '<td><button class="pol-mgmt-more" title="More actions"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/></svg></button></td>';
        tr.addEventListener('click', function(e) {
          if (e.target.closest('.pol-mgmt-more')) return;
          openPolicyReview(idx);
        });
        tbody.appendChild(tr);
      });
    }

    // Empty state
    var emptyEl = document.getElementById('pol-mgmt-empty');
    var tableWrap = document.querySelector('.pol-mgmt-table-wrap');
    if (policies.length === 0) {
      if (emptyEl) emptyEl.style.display = '';
      if (tableWrap) tableWrap.style.display = 'none';
    } else {
      if (emptyEl) emptyEl.style.display = 'none';
      if (tableWrap) tableWrap.style.display = '';
    }

    // Render remaining recommendation cards
    var recsGrid = document.getElementById('pol-mgmt-recs-grid');
    if (recsGrid) {
      var allRecs = window.OrgPolicies.recommendations;
      var createdIds = policies.map(function(p) { return p.recId; });
      var remaining = allRecs.filter(function(r) { return createdIds.indexOf(r.id) === -1; });
      recsGrid.innerHTML = '';
      var icons = {
        'rec-license': { bg: '#eef2ff', color: '#3859ff', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M17 3a4 4 0 0 0-4 4h2a2 2 0 1 1 4 0v3h-6v2h1v7h-2v-7H5a3 3 0 0 1-3-3V7a4 4 0 0 1 4-4h11ZM4 7v2a1 1 0 0 0 1 1h7V5H6a2 2 0 0 0-2 2Zm17 7v10h-2V14h2Z"/></svg>' },
        'rec-reactivate': { bg: '#fff4e6', color: '#e5710b', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M9.45 7.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Zm-2 0a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0Zm4.5 5.5a7.077 7.077 0 0 0-7.042 6.373L4.755 20.9l1.99.2.153-1.528A5.077 5.077 0 0 1 11.95 15v-2Zm9.843 1.61-5 6.5-1.552.04-3-3.5 1.518-1.3 2.198 2.564 4.25-5.523 1.586 1.218Z"/></svg>' },
        'rec-spaces': { bg: '#ecfdf5', color: '#0ca678', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3v18h18V3ZM5 5h14v14H5V5Z"/></svg>' },
        'rec-addon': { bg: '#f0f9ff', color: '#0891b2', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M18 3a3 3 0 0 1 3 3v6.757l-1.5 1.5L18 15.757V14a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.757l1.5 1.5H7a3 3 0 0 1-3-3v-6H2v-2h2V6a3 3 0 0 1 3-3h11Z"/></svg>' },
        'rec-access': { bg: '#fef3f2', color: '#dc2626', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M4.5 17a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM7 4a5.001 5.001 0 0 1 4.9 4H21l1 1v5h-2v-4h-2v4h-2v-4h-4.1A5.001 5.001 0 1 1 7 4Z" clip-rule="evenodd"/></svg>' },
        'rec-compliance': { bg: '#f5f3ff', color: '#7c3aed', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm-1 3v6h2V7h-2Zm0 8v2h2v-2h-2Z"/></svg>' }
      };
      remaining.forEach(function(rec) {
        var ic = icons[rec.id] || { bg: '#f1f2f5', color: '#7b7f95', svg: '' };
        var card = document.createElement('div');
        card.className = 'pol-card';
        card.innerHTML = '<div class="pol-card-icon" style="background:' + ic.bg + ';color:' + ic.color + ';">' + ic.svg + '</div>' +
          '<div class="pol-card-body"><div class="pol-card-title">' + rec.title + '</div><div class="pol-card-desc">' + rec.desc + '</div><button class="pol-card-btn">Start now</button></div>';
        recsGrid.appendChild(card);
      });
    }
  }

  // Open the policy review side panel
  function openPolicyReview(idx) {
    var p = window.OrgPolicies.activePolicies[idx];
    if (!p || !reviewPanel) return;

    reviewPanel.setAttribute('data-pol-idx', idx);

    document.getElementById('pol-sp-title').textContent = p.name;

    var badge = document.getElementById('pol-sp-status');
    badge.textContent = p.status.charAt(0).toUpperCase() + p.status.slice(1);
    badge.className = 'pol-sp-badge pol-sp-badge--' + p.status;

    var healthEl = document.getElementById('pol-sp-health');
    var hLabel = p.health === 'healthy' ? 'Healthy' : (p.health === 'warning' ? 'Needs review' : (p.health === 'violation' ? 'Violation' : 'Pending'));
    var hColor = p.health === 'healthy' ? '#0ca678' : (p.health === 'warning' ? '#e5710b' : (p.health === 'violation' ? '#dc2626' : '#a0a4b8'));
    healthEl.innerHTML = '<span class="pol-sp-health-dot" style="background:' + hColor + ';"></span> ' + hLabel;

    document.getElementById('pol-sp-date').textContent = 'Created ' + formatDate(new Date(p.createdAt));

    document.getElementById('pol-sp-m-users').textContent = p.targetUsers;
    document.getElementById('pol-sp-m-reactivated').textContent = p.reactivated || 0;
    document.getElementById('pol-sp-m-pending').textContent = (p.targetUsers - (p.reactivated || 0));
    var savings = (p.reactivated || 0) * 300;
    document.getElementById('pol-sp-m-savings').textContent = savings ? '$' + savings.toLocaleString() : '$0';

    // AI assessment
    var aiText = document.getElementById('pol-sp-ai-text');
    var days = Math.floor((now() - new Date(p.createdAt)) / 86400000);
    var cadenceSuffix = p.cadence && p.cadence !== 'once' && p.nextRun ? ' Next automatic run scheduled for ' + p.nextRun + '.' : '';
    if (days < 1) {
      aiText.textContent = 'Policy was just activated. Reactivation emails are being sent now. Check back in a few hours for early response data.' + cadenceSuffix;
    } else if (p.health === 'warning') {
      aiText.textContent = (p.targetUsers - (p.reactivated || 0)) + ' users still haven\u2019t responded with ' + Math.max(0, (p.deadline || 14) - days) + ' days remaining. Consider sending a reminder or extending the deadline.' + cadenceSuffix;
    } else if (p.health === 'violation') {
      aiText.textContent = 'The deadline has passed and ' + (p.targetUsers - (p.reactivated || 0)) + ' users remain inactive. Review the auto-actions or create a follow-up policy.' + cadenceSuffix;
    } else {
      aiText.textContent = 'Policy is performing within expected range. ' + (p.reactivated || 0) + ' users have reactivated so far. Estimated completion rate: ~40% by deadline.' + cadenceSuffix;
    }

    // Config
    var configEl = document.getElementById('pol-sp-config');
    var cfg = p.config || {};
    var cadenceDisplay = p.cadenceLabel || 'One-time only';
    var nextRunDisplay = p.nextRun || '—';
    var approvalDisplay = p.requireApproval ? 'Yes' : 'No';
    configEl.innerHTML =
      '<div class="pol-sp-config-row"><span class="pol-sp-config-key">Reactivation email</span><span class="pol-sp-config-val">' + (cfg.sendEmail !== false ? 'Enabled' : 'Disabled') + '</span></div>' +
      '<div class="pol-sp-config-row"><span class="pol-sp-config-key">Deadline</span><span class="pol-sp-config-val">' + (cfg.deadline || 14) + ' days</span></div>' +
      '<div class="pol-sp-config-row"><span class="pol-sp-config-key">Auto-remove from groups</span><span class="pol-sp-config-val">' + (cfg.autoRemove ? 'Enabled' : 'Disabled') + '</span></div>' +
      '<div class="pol-sp-config-row"><span class="pol-sp-config-key">Recycle license</span><span class="pol-sp-config-val">' + (cfg.recycleLicense ? 'Enabled' : 'Disabled') + '</span></div>' +
      '<div class="pol-sp-config-row"><span class="pol-sp-config-key">In-app announcement</span><span class="pol-sp-config-val">' + (cfg.announcement !== false ? 'Enabled' : 'Disabled') + '</span></div>' +
      '<div class="pol-sp-config-row"><span class="pol-sp-config-key">Schedule</span><span class="pol-sp-config-val">' + (cfg.schedule || 'Immediately') + '</span></div>' +
      '<div class="pol-sp-config-row"><span class="pol-sp-config-key">Recurrence</span><span class="pol-sp-config-val">' + cadenceDisplay + '</span></div>' +
      (p.nextRun ? '<div class="pol-sp-config-row"><span class="pol-sp-config-key">Next run</span><span class="pol-sp-config-val" style="color:#7c3aed;font-weight:600;">' + nextRunDisplay + '</span></div>' : '') +
      '<div class="pol-sp-config-row"><span class="pol-sp-config-key">Approval required</span><span class="pol-sp-config-val">' + approvalDisplay + '</span></div>';

    // Activity log
    var logEl = document.getElementById('pol-sp-log');
    var logs = p.logs || [];
    if (logs.length === 0) {
      logs = [{ text: 'Policy created', time: 'Just now', active: true }];
      if (p.status === 'active') {
        logs.push({ text: 'Reactivation emails sent to ' + p.targetUsers + ' users', time: 'Just now', active: false });
        if (cfg.announcement !== false) logs.push({ text: 'In-app announcement enabled', time: 'Just now', active: false });
      }
    }
    logEl.innerHTML = '';
    logs.forEach(function(log) {
      logEl.innerHTML += '<div class="pol-sp-log-item"><span class="pol-sp-log-dot' + (log.active ? ' pol-sp-log-dot--active' : '') + '"></span><span class="pol-sp-log-text">' + log.text + '</span><span class="pol-sp-log-time">' + log.time + '</span></div>';
    });

    // Action buttons
    var pauseBtn = document.getElementById('pol-sp-pause');
    var deleteBtn = document.getElementById('pol-sp-delete');
    if (p.status === 'active') {
      pauseBtn.textContent = 'Pause policy';
      pauseBtn.className = 'pol-sp-action-btn pol-sp-action-btn--pause';
      pauseBtn.style.display = '';
    } else if (p.status === 'paused') {
      pauseBtn.textContent = 'Resume policy';
      pauseBtn.className = 'pol-sp-action-btn pol-sp-action-btn--resume';
      pauseBtn.style.display = '';
    } else if (p.status === 'draft') {
      pauseBtn.textContent = 'Activate policy';
      pauseBtn.className = 'pol-sp-action-btn pol-sp-action-btn--activate';
      pauseBtn.style.display = '';
    }

    reviewPanel.classList.add('open');
  }

  function closePolicyReview() {
    if (reviewPanel) reviewPanel.classList.remove('open');
  }

  // Close panel
  var closeBtn = document.getElementById('pol-review-close');
  if (closeBtn) closeBtn.addEventListener('click', closePolicyReview);
  if (reviewPanel) reviewPanel.addEventListener('click', function(e) {
    if (e.target === reviewPanel) closePolicyReview();
  });

  // Pause/Resume/Activate from side panel
  var pauseBtn = document.getElementById('pol-sp-pause');
  if (pauseBtn) pauseBtn.addEventListener('click', function() {
    var idx = parseInt(reviewPanel.getAttribute('data-pol-idx'));
    var p = window.OrgPolicies.activePolicies[idx];
    if (!p) return;
    if (p.status === 'active') {
      p.status = 'paused';
      p.health = 'pending';
    } else if (p.status === 'paused') {
      p.status = 'active';
      p.health = 'healthy';
    } else if (p.status === 'draft') {
      p.status = 'active';
      p.health = 'healthy';
    }
    closePolicyReview();
    renderPolicyList();
  });

  // Delete from side panel
  var deleteBtn = document.getElementById('pol-sp-delete');
  if (deleteBtn) deleteBtn.addEventListener('click', function() {
    var idx = parseInt(reviewPanel.getAttribute('data-pol-idx'));
    window.OrgPolicies.activePolicies.splice(idx, 1);
    closePolicyReview();
    renderPolicyList();
  });

  // Header link to onboard page
  var goOnboard = document.getElementById('pol-go-onboard');
  if (goOnboard) goOnboard.addEventListener('click', function(e) {
    e.preventDefault();
    navigateTo('pol-onboard');
  });

  // Header link to policy list page
  var goList = document.getElementById('pol-go-list');
  if (goList) goList.addEventListener('click', function(e) {
    e.preventDefault();
    navigateTo('pol-list');
  });

  // Map data-policy attr to recId used in activePolicies
  var policyToRecId = {
    'license-recycling': 'rec-license',
    'reactivate-users': 'rec-reactivate',
    'space-consolidation': 'rec-spaces',
    'addon-optimization': 'rec-addon',
    'access-review': 'rec-access',
    'compliance-audit': 'rec-compliance'
  };

  function refreshRecommendationCards() {
    var created = window.OrgPolicies.activePolicies.map(function(p) { return p.recId; });
    document.querySelectorAll('#page-pol-onboard .pol-card-btn[data-policy]').forEach(function(btn) {
      var card = btn.closest('.pol-card');
      if (!card) return;
      var recId = policyToRecId[btn.getAttribute('data-policy')];
      card.style.display = (recId && created.indexOf(recId) !== -1) ? 'none' : '';
    });
    var visibleCards = document.querySelectorAll('#page-pol-onboard .pol-card');
    var visibleCount = 0;
    visibleCards.forEach(function(c) { if (c.style.display !== 'none') visibleCount++; });
    var recsHeader = document.querySelector('#page-pol-onboard .pol-recs-header');
    if (recsHeader) {
      recsHeader.style.display = visibleCount === 0 ? 'none' : '';
    }
  }
  window.refreshRecommendationCards = refreshRecommendationCards;

  // Policy-to-page banner mapping
  var policyBanners = {
    'rec-reactivate': {
      bannerId: 'pol-banner-allusers',
      titleId: 'pol-banner-allusers-title',
      descId: 'pol-banner-allusers-desc',
      statusId: 'pol-banner-allusers-status',
      viewId: 'pol-banner-allusers-view',
      pageRoute: 'allusers',
      descFn: function(p) {
        var days = Math.floor((new Date() - new Date(p.createdAt)) / 86400000);
        var reactivated = p.reactivated || 0;
        var pending = p.targetUsers - reactivated;
        if (p.status === 'draft') return 'Draft policy targeting ' + p.targetUsers + ' users. Activate to start reactivation.';
        if (days < 1) return 'Policy is active \u2014 reactivation emails being sent to ' + p.targetUsers + ' users.';
        return 'Day ' + days + ' of ' + p.deadline + ' \u2014 ' + reactivated + ' reactivated, ' + pending + ' pending.' + (p.nextRun ? ' Next run: ' + p.nextRun : '');
      }
    },
    'rec-addon': {
      bannerId: 'pol-banner-products',
      titleId: 'pol-banner-products-title',
      descId: 'pol-banner-products-desc',
      statusId: 'pol-banner-products-status',
      viewId: 'pol-banner-products-view',
      pageRoute: 'products',
      descFn: function(p) {
        var days = Math.floor((new Date() - new Date(p.createdAt)) / 86400000);
        if (p.status === 'draft') return 'Draft policy for ' + p.targetUsers + ' teams. Activate to begin the add-on trial rollout.';
        if (days < 1) return 'Policy is active \u2014 monitoring ' + p.targetUsers + ' teams for add-on optimization.';
        return 'Day ' + days + ' of ' + p.deadline + ' trial \u2014 tracking usage across ' + p.targetUsers + ' teams.' + (p.nextRun ? ' Next review: ' + p.nextRun : '');
      }
    }
  };

  function refreshPolicyBanners() {
    var policies = window.OrgPolicies.activePolicies;
    Object.keys(policyBanners).forEach(function(recId) {
      var cfg = policyBanners[recId];
      var banner = document.getElementById(cfg.bannerId);
      if (!banner) return;
      var policy = null;
      for (var i = 0; i < policies.length; i++) {
        if (policies[i].recId === recId) { policy = policies[i]; break; }
      }
      if (!policy) {
        banner.style.display = 'none';
        return;
      }
      banner.style.display = 'flex';
      var titleEl = document.getElementById(cfg.titleId);
      var descEl = document.getElementById(cfg.descId);
      var statusEl = document.getElementById(cfg.statusId);
      if (titleEl) titleEl.textContent = policy.name;
      if (statusEl) {
        statusEl.textContent = policy.status.charAt(0).toUpperCase() + policy.status.slice(1);
        statusEl.className = 'mds-tag mds-tag--' + (policy.status === 'active' ? 'success' : (policy.status === 'draft' ? 'warning' : 'neutral'));
      }
      if (descEl && cfg.descFn) {
        descEl.textContent = cfg.descFn(policy);
      }
    });
  }
  // Toggle rec banners: hide rec when policy exists, show active banner instead
  var recBannerMap = {
    'rec-reactivate': 'pol-rec-allusers',
    'rec-addon': 'pol-rec-products'
  };

  function refreshRecBanners() {
    var created = window.OrgPolicies.activePolicies.map(function(p) { return p.recId; });
    Object.keys(recBannerMap).forEach(function(recId) {
      var recEl = document.getElementById(recBannerMap[recId]);
      if (recEl) recEl.style.display = created.indexOf(recId) !== -1 ? 'none' : '';
    });
  }
  window.refreshRecBanners = refreshRecBanners;

  window.refreshPolicyBanners = refreshPolicyBanners;

  // Wire rec banner "Set up policy" buttons to open chatbot
  document.querySelectorAll('.pol-page-banner-action[data-policy]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var policyId = btn.getAttribute('data-policy');
      if (window.openPolicyChat) window.openPolicyChat(policyId);
    });
  });

  // Wire banner "View policy" buttons
  Object.keys(policyBanners).forEach(function(recId) {
    var cfg = policyBanners[recId];
    var viewBtn = document.getElementById(cfg.viewId);
    if (viewBtn) viewBtn.addEventListener('click', function() {
      var policies = window.OrgPolicies.activePolicies;
      for (var i = 0; i < policies.length; i++) {
        if (policies[i].recId === recId) {
          navigateTo('pol-list');
          break;
        }
      }
    });
  });

  // Hook into navigation to refresh policy list view
  var _prevNav = window.navigateTo;
  window.navigateTo = navigateTo = function(route) {
    _prevNav(route);
    if (route === 'pol-list') {
      renderPolicyList();
    }
    if (route === 'pol-onboard') {
      refreshRecommendationCards();
    }
    refreshPolicyBanners();
    refreshRecBanners();
  };

  // Initial render
  renderPolicyList();
  refreshRecommendationCards();
  refreshPolicyBanners();
  refreshRecBanners();
})();
