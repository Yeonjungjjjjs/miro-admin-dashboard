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

function initCharts() {
  var blue = '#97a8fe';
  drawChart('chart-boards', [280, 310, 300, 320, 340, 330, 335, 320], blue);
  drawChart('chart-teams', [60, 65, 62, 68, 72, 75, 78, 82], blue);
  drawChart('chart-users', [100, 108, 105, 112, 115, 118, 122, 126], blue);
  drawChart('chart-licenses', [180, 190, 195, 200, 205, 210, 204, 200], blue);
}

// Apply persona on initial boot (top bar, sidebar, org picker)
if (typeof applyPersona === 'function') applyPersona();

// Fragment route map
var fragmentRoutes = {
  'home': 'pages/home.html',
  'products': 'pages/products.html',
  'aiworkflow': 'pages/aiworkflow.html',
  'allusers': 'pages/allusers.html',
  'teams': 'pages/teams.html',
  'miroai-capabilities': 'pages/miroai-capabilities.html',
  'miroai-cap-entguard': 'pages/miroai-cap-entguard.html',
  'miroai-cap-noaddons': 'pages/miroai-cap-noaddons.html',
  'miroai-cap-none': 'pages/miroai-cap-none.html',
  'miroai-datausage': 'pages/miroai-datausage.html',
  'profile': 'pages/profile.html',
  'profile-new': 'pages/profile-new.html',
  'home-new': 'pages/home-new.html'
};
var pageCache = {};

// Routing
function navigateTo(route) {
  document.querySelectorAll('.page-section').forEach(function(s) { s.classList.remove('active'); });
  var pageContent = document.getElementById('page-content');

  if (fragmentRoutes[route]) {
    var cached = pageCache[route];
    if (cached) {
      pageContent.innerHTML = cached;
      pageContent.classList.add('active');
      updateNavState(route);
      initPageBindings(route);
    } else {
      fetch(fragmentRoutes[route] + '?v=' + Date.now())
        .then(function(r) { return r.text(); })
        .then(function(html) {
          pageCache[route] = html;
          pageContent.innerHTML = html;
          pageContent.classList.add('active');
          updateNavState(route);
          initPageBindings(route);
        })
        .catch(function() {
          pageContent.innerHTML = '<section class="main-content"><h1>Page not found</h1></section>';
          pageContent.classList.add('active');
        });
    }
  } else {
    pageContent.innerHTML = '';
    pageContent.classList.remove('active');
    var page = document.getElementById('page-' + route);
    if (page) page.classList.add('active');
    updateNavState(route);
  }
}

function updateNavState(route) {
  document.querySelectorAll('.sidebar-nav a[data-route]').forEach(function(a) { a.classList.remove('active'); a.classList.remove('parent-active'); });
  document.querySelectorAll('.subnav-item').forEach(function(a) { a.classList.remove('active'); });
  var miroaiRoutes = ['miroai-capabilities', 'miroai-cap-entguard', 'miroai-cap-noaddons', 'miroai-cap-none', 'miroai-datausage', 'miroai-moderation'];
  var profileRoutes = ['profile', 'profile-new'];
  var homeRoutes = ['home', 'home-new'];
  var activeRoute = route === 'aiworkflow' ? 'products' : (miroaiRoutes.indexOf(route) !== -1 ? 'miroai-capabilities' : (profileRoutes.indexOf(route) !== -1 ? 'profile' : (homeRoutes.indexOf(route) !== -1 ? 'home' : route)));
  var navLink = document.querySelector('.sidebar-nav a[data-route="' + activeRoute + '"]:not(.subnav-item)');
  if (navLink && !navLink.classList.contains('has-subnav')) navLink.classList.add('active');

  var capVariantRoutes = ['miroai-capabilities', 'miroai-cap-entguard', 'miroai-cap-noaddons', 'miroai-cap-none'];
  var subnavRoute = capVariantRoutes.indexOf(route) !== -1 ? 'miroai-capabilities' : route;
  var subnavItem = document.querySelector('.subnav-item[data-route="' + subnavRoute + '"]');
  if (subnavItem) {
    subnavItem.classList.add('active');
    var parentNav = subnavItem.closest('.sidebar-subnav');
    if (parentNav) {
      parentNav.classList.add('open');
      var parentLink = parentNav.previousElementSibling;
      if (parentLink) { parentLink.classList.add('parent-active'); parentLink.classList.add('expanded'); }
    }
  }

  if (route === 'home' || route === 'home-new') setTimeout(initCharts, 50);

  if (route === 'aiworkflow') {
    var aiwTab = aiwTabFromHash();
    document.querySelectorAll('.aiw-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.aiw-panel').forEach(function(p) { p.classList.remove('active'); });
    var targetTab = document.querySelector('.aiw-tab[data-aiw-tab="' + aiwTab + '"]');
    if (targetTab) targetTab.classList.add('active');
    var targetPanel = document.getElementById('aiw-panel-' + aiwTab);
    if (targetPanel) targetPanel.classList.add('active');
    // Auto-open assign seats panel if hash ends with /Assign
    if ((location.hash || '').indexOf('/Assign') !== -1 && window._openAssignSeatsPanel) {
      setTimeout(window._openAssignSeatsPanel, 60);
    }
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

  var hashMap = { home: '#/Home', 'home-new': '#/Home-new', allusers: '#/Users/AllUsers', profile: '#/Profile', 'profile-new': '#/Profile-new', 'miroai-capabilities': '#/MiroAI/Capabilities', 'miroai-cap-entguard': '#/MiroAI/Capabilities-ent.guard', 'miroai-cap-noaddons': '#/MiroAI/Capabilities-No-add-ons', 'miroai-cap-none': '#/MiroAI/Capabilities-none', 'miroai-datausage': '#/MiroAI/DataUsage', 'miroai-moderation': '#/MiroAI/Moderation' };
  var hash;
  if (route === 'aiworkflow') {
    var activeAiwTab = document.querySelector('.aiw-tab.active');
    var tabName = activeAiwTab ? activeAiwTab.getAttribute('data-aiw-tab') : 'users';
    var tabLabel = tabName.charAt(0).toUpperCase() + tabName.slice(1);
    var assignSuffix = (location.hash || '').indexOf('/Assign') !== -1 ? '/Assign' : '';
    hash = '#/Product/AIworkflow/' + tabLabel + assignSuffix;
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
  if (hash.indexOf('/MiroAI/Capabilities') !== -1) return 'miroai-capabilities';
  if (hash.indexOf('/MiroAI') !== -1) return 'miroai-capabilities';
  if (hash.indexOf('/Profile-new') !== -1) return 'profile-new';
  if (hash.indexOf('/Profile') !== -1) return 'profile';
  if (hash.indexOf('/Product/AIworkflow') !== -1) return 'aiworkflow';
  if (hash.indexOf('/Product/Explore') !== -1) return 'products';
  if (hash.indexOf('/Product/Active') !== -1) return 'products';
  if (hash.indexOf('/Product') !== -1) return 'products';
  if (hash.indexOf('/Home-new') !== -1) return 'home-new';
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
function initBulkActions() {
  var bulkBar = document.getElementById('bulk-actions-bar');
  var bulkToggle = document.getElementById('bulk-actions-toggle');
  var bulkMenu = document.getElementById('bulk-menu');
  var bulkClear = document.getElementById('bulk-clear');
  var selectedCountEl = document.getElementById('selected-count');
  if (!bulkBar || !bulkToggle || !bulkMenu || !bulkClear) return;
  var allUserCheckboxes = document.querySelectorAll('.allusers-table tbody .mds-checkbox');
  var headerCheckbox = document.querySelector('.allusers-table thead .mds-checkbox');

  function updateBulkBar() {
    var checked = document.querySelectorAll('.allusers-table tbody .mds-checkbox:checked');
    var count = checked.length;
    if (count > 0) {
      bulkBar.classList.add('visible');
      if (selectedCountEl) selectedCountEl.textContent = count + ' user' + (count > 1 ? 's' : '') + ' selected';
    } else {
      bulkBar.classList.remove('visible');
      bulkMenu.classList.remove('open');
    }
    allUserCheckboxes.forEach(function(cb) {
      var row = cb.closest('tr');
      if (row) row.classList.toggle('row-selected', cb.checked);
    });
  }
  window._updateBulkBar = updateBulkBar;

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
}
initBulkActions();

document.addEventListener('click', function(e) {
  var bd = document.getElementById('bulk-dropdown');
  if (bd && !bd.contains(e.target)) {
    var bulkMenu = document.getElementById('bulk-menu');
    if (bulkMenu) {
      bulkMenu.classList.remove('open');
      bulkMenu.querySelectorAll('.active').forEach(function(el) { el.classList.remove('active'); });
    }
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

// ===== SIDEKICK PANEL (React) =====
(function() {
  var trigger = document.getElementById('sidekick-trigger');
  if (!trigger) return;
  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    if (window.AdminSidekick) {
      window.AdminSidekick.toggle();
    } else {
      window.dispatchEvent(new CustomEvent('sidekick:toggle'));
    }
  });
})();

// ===== PROFILE DROPDOWN =====
(function() {
  var trigger = document.getElementById('profile-trigger');
  var dropdown = document.getElementById('profile-dropdown');
  if (!trigger || !dropdown) return;
  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = dropdown.classList.toggle('open');
    trigger.classList.toggle('active', isOpen);
  });
  document.addEventListener('click', function(e) {
    if (!trigger.contains(e.target)) {
      dropdown.classList.remove('open');
      trigger.classList.remove('active');
    }
  });
})();

// ===== ORG PICKER =====
(function() {
  var orgTrigger = document.getElementById('org-trigger');
  var orgPicker = document.getElementById('org-picker');
  if (!orgTrigger || !orgPicker) return;

  orgTrigger.addEventListener('click', function(e) {
    e.stopPropagation();
    var wasOpen = orgPicker.classList.contains('open');
    orgPicker.classList.toggle('open');
    orgTrigger.classList.toggle('picker-open', !wasOpen);
    if (!wasOpen) {
      var rect = orgTrigger.getBoundingClientRect();
      orgPicker.style.top = (rect.bottom + 4) + 'px';
      orgPicker.style.left = rect.left + 'px';
    }
  });

  orgPicker.querySelectorAll('.org-picker-item').forEach(function(item) {
    item.addEventListener('click', function() {
      orgPicker.querySelectorAll('.org-picker-item').forEach(function(i) { i.classList.remove('active'); });
      item.classList.add('active');
      var name = item.querySelector('.org-picker-item-name').textContent;
      var tag = item.querySelector('.org-picker-item-tag').textContent;
      var color = item.querySelector('.org-picker-item-icon').style.background;
      var orgIcon = orgTrigger.querySelector('.sidebar-org-icon');
      var orgName = orgTrigger.querySelector('.sidebar-org-name');
      var orgTag = orgTrigger.querySelector('.sidebar-org-tag');
      orgName.textContent = name;
      orgTag.textContent = tag;
      orgIcon.textContent = name.charAt(0).toUpperCase();
      orgIcon.style.background = color;
      orgPicker.classList.remove('open');
      orgTrigger.classList.remove('picker-open');
    });
  });

  document.addEventListener('click', function(e) {
    if (!orgTrigger.contains(e.target) && !orgPicker.contains(e.target)) {
      orgPicker.classList.remove('open');
      orgTrigger.classList.remove('picker-open');
    }
  });
})();

// ===== PAGE-SPECIFIC BINDING INITIALIZATION =====
function initPageBindings(route) {
  // Apply persona data to newly loaded page content
  if (typeof applyPersona === 'function') applyPersona();

  // Breadcrumb clicks
  document.querySelectorAll('.breadcrumb a[data-route]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      navigateTo(this.getAttribute('data-route'));
    });
  });

  // Products tabs
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

  // Product row clicks
  document.querySelectorAll('.product-row-clickable').forEach(function(row) {
    row.addEventListener('click', function() {
      navigateTo(this.getAttribute('data-route'));
    });
  });

  // All Users tabs
  document.querySelectorAll('.allusers-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.allusers-tab').forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // Filter pills
  document.querySelectorAll('.filter-pill').forEach(function(pill) {
    pill.addEventListener('click', function() {
      if (this.getAttribute('data-filter') === 'ai-workflow') {
        this.classList.toggle('active');
        if (typeof applyAllusersFilters === 'function') applyAllusersFilters();
      } else {
        this.classList.toggle('active');
      }
    });
  });

  // Bulk actions
  initBulkActions();

  // Products tooltip
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

  // AI Models tag tooltip
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

  // Teams column picker & filter panel
  initTeamsColumnPicker();
  initTeamsFilterPanel();

  // Cap variant navigation — intercept cap-nav-option clicks before the generic handler
  var capSelector = document.getElementById('cap-variant-selector');
  if (capSelector) {
    capSelector.querySelectorAll('.cap-nav-option').forEach(function(opt) {
      opt.addEventListener('click', function(e) {
        e.stopPropagation();
        var route = opt.getAttribute('data-route');
        var trig = capSelector.querySelector('.feat-select-trigger');
        var dd = capSelector.querySelector('.feat-select-dropdown');
        if (trig) { trig.classList.remove('open'); }
        if (dd) { dd.classList.remove('open'); }
        if (route && fragmentRoutes[route]) {
          delete pageCache[route];
          navigateTo(route);
        }
      });
    });
  }

  // Profile variant navigation — switch between profile and profile-new
  var profileSelector = document.getElementById('profile-variant-selector');
  if (profileSelector) {
    profileSelector.querySelectorAll('.profile-nav-option').forEach(function(opt) {
      opt.addEventListener('click', function(e) {
        e.stopPropagation();
        var route = opt.getAttribute('data-route');
        var trig = profileSelector.querySelector('.feat-select-trigger');
        var dd = profileSelector.querySelector('.feat-select-dropdown');
        if (trig) { trig.classList.remove('open'); }
        if (dd) { dd.classList.remove('open'); }
        if (route && fragmentRoutes[route]) {
          delete pageCache[route];
          navigateTo(route);
        }
      });
    });
  }

  // Home variant navigation — switch between home and home-new
  var homeSelector = document.getElementById('home-variant-selector');
  if (homeSelector) {
    homeSelector.querySelectorAll('.home-nav-option').forEach(function(opt) {
      opt.addEventListener('click', function(e) {
        e.stopPropagation();
        var route = opt.getAttribute('data-route');
        var trig = homeSelector.querySelector('.feat-select-trigger');
        var dd = homeSelector.querySelector('.feat-select-dropdown');
        if (trig) { trig.classList.remove('open'); }
        if (dd) { dd.classList.remove('open'); }
        if (route && fragmentRoutes[route]) {
          delete pageCache[route];
          navigateTo(route);
        }
      });
    });
  }

  // Profile page tabs
  if (route === 'profile' || route === 'profile-new') {
    document.querySelectorAll('.profile-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.profile-tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
      });
    });

    document.querySelectorAll('.profile-dm-wrapper').forEach(function(wrapper) {
      var trigger = wrapper.querySelector('.profile-dm-trigger');
      var dropdown = wrapper.querySelector('.profile-dm');
      var valueSpan = wrapper.querySelector('.profile-dm-value');
      if (!trigger || !dropdown) return;

      trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        var wasOpen = trigger.classList.contains('open');
        document.querySelectorAll('.profile-dm-trigger.open').forEach(function(t) {
          t.classList.remove('open');
          t.closest('.profile-dm-wrapper').querySelector('.profile-dm').classList.remove('open');
        });
        if (!wasOpen) {
          trigger.classList.add('open');
          dropdown.classList.add('open');
          var sel = dropdown.querySelector('.profile-dm-item.selected');
          if (sel) sel.scrollIntoView({ block: 'nearest' });
        }
      });

      dropdown.querySelectorAll('.profile-dm-item').forEach(function(opt) {
        opt.addEventListener('click', function() {
          dropdown.querySelectorAll('.profile-dm-item').forEach(function(o) { o.classList.remove('selected'); });
          opt.classList.add('selected');
          valueSpan.textContent = opt.getAttribute('data-value');
          trigger.classList.remove('open');
          dropdown.classList.remove('open');
        });
      });
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.profile-dm-wrapper')) {
        document.querySelectorAll('.profile-dm-trigger.open').forEach(function(t) {
          t.classList.remove('open');
          t.closest('.profile-dm-wrapper').querySelector('.profile-dm').classList.remove('open');
        });
      }
    });
  }

  // Cap sub-tabs
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

  // Add-on close
  var addonClose = document.getElementById('addon-close');
  if (addonClose) {
    addonClose.addEventListener('click', function() {
      this.closest('.addon-card').style.display = 'none';
    });
  }

  // Custom sidekick switch
  var customSidekickSwitch = document.getElementById('custom-sidekick-switch-cs');
  if (customSidekickSwitch) {
    customSidekickSwitch.addEventListener('click', function() {
      var isOn = this.classList.toggle('checked');
      this.setAttribute('aria-checked', isOn ? 'true' : 'false');
      var selectorWrap = document.querySelector('.custom-sidekick-selector-cs');
      if (selectorWrap) selectorWrap.style.display = isOn ? '' : 'none';
    });
  }

  // Accordion chevrons
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

  // Apply-to-category toggles
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
        if (textEl) textEl.innerHTML = '<strong>' + name + '</strong> ' + state;
        if (toast) {
          toast.classList.add('visible');
          clearTimeout(toast._timer);
          toast._timer = setTimeout(function() { toast.classList.remove('visible'); }, 3000);
        }
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
      if (group) group.querySelectorAll('.mds-radio').forEach(function(r) { r.classList.remove('checked'); });
      this.querySelector('.mds-radio').classList.add('checked');
    });
  });

  // Row context menu triggers
  initContextMenuTriggers();

  // AIW bulk actions
  if (typeof window.bindAiwBulkActions === 'function') window.bindAiwBulkActions();

  // Assign seats button — open panel and update URL
  var btnAssign = document.getElementById('btn-assign-seats');
  if (btnAssign && window._openAssignSeatsPanel) {
    btnAssign.addEventListener('click', function() {
      history.pushState(null, '', '#/Product/AIworkflow/Users/Assign');
      window._openAssignSeatsPanel();
    });
  }

}

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
function initTeamsColumnPicker() {
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
}
initTeamsColumnPicker();

// Teams filter panel
function initTeamsFilterPanel() {
  var btn = document.getElementById('teams-filter-btn');
  var panel = document.getElementById('teams-filter-panel');
  var closeBtn = document.getElementById('teams-filter-close');
  var clearBtn = document.getElementById('teams-filter-clear');
  var confirmBtn = document.getElementById('teams-filter-confirm');
  if (!btn || !panel) return;

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
}
initTeamsFilterPanel();

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
    document.querySelectorAll('.mds-select-dropdown.open').forEach(function(d) { d.classList.remove('open'); d.classList.remove('open-up'); });
    document.querySelectorAll('.mds-select-trigger.open').forEach(function(t) { t.classList.remove('open'); });
    if (!isOpen) {
      dropdown.classList.remove('open-up');
      dropdown.classList.add('open');
      trigger.classList.add('open');
      // Flip upward if dropdown overflows viewport bottom
      var trigRect = trigger.getBoundingClientRect();
      var ddRect = dropdown.getBoundingClientRect();
      if (ddRect.bottom > window.innerHeight - 8) {
        dropdown.classList.add('open-up');
      }
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
  document.querySelectorAll('.mds-select-dropdown.open').forEach(function(d) { d.classList.remove('open'); d.classList.remove('open-up'); });
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
  var pc = document.getElementById('page-content');
  if (pc && pc.classList.contains('active') && pc.querySelector('.aicap-list')) return pc;
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
  if (!panel) return;
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
    if ((location.hash || '').indexOf('/Assign') !== -1) {
      history.pushState(null, '', '#/Product/AIworkflow/Users');
    }
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

  window._openAssignSeatsPanel = openPanel;
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
var _ctxMenuState = { currentRowUser: null, lastTrigger: null };
function initContextMenuTriggers() {
  var ctxMenu = document.getElementById('row-ctx-menu');
  if (!ctxMenu) return;
  document.querySelectorAll('.allusers-table .allusers-more-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (_ctxMenuState.lastTrigger === this && ctxMenu.classList.contains('open')) {
        ctxMenu.classList.remove('open');
        _ctxMenuState.lastTrigger = null;
        return;
      }
      _ctxMenuState.lastTrigger = this;
      ctxMenu.querySelectorAll('.active').forEach(function(el) { el.classList.remove('active'); });
      var row = this.closest('tr');
      if (!row) return;

      var nameEl = row.querySelector('.allusers-user-name');
      var emailEl = row.querySelector('.allusers-user-email');
      var avatarEl = row.querySelector('.allusers-avatar img');
      _ctxMenuState.currentRowUser = {
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
}
initContextMenuTriggers();
(function() {
  var ctxMenu = document.getElementById('row-ctx-menu');
  if (!ctxMenu) return;
  var currentRowUser = _ctxMenuState.currentRowUser;

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
      if (_ctxMenuState.currentRowUser && window.openSingleAssignModal) {
        window.openSingleAssignModal(_ctxMenuState.currentRowUser);
      }
    });
  }

  var unassignSingleBtn = ctxMenu.querySelector('[data-action="unassign-single"]');
  if (unassignSingleBtn) {
    unassignSingleBtn.addEventListener('click', function() {
      ctxMenu.classList.remove('open');
      ctxMenu.querySelectorAll('.active').forEach(function(el) { el.classList.remove('active'); });
      if (_ctxMenuState.currentRowUser && window.openSingleUnassignModal) {
        window.openSingleUnassignModal(_ctxMenuState.currentRowUser);
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
  if (!bulkBar || !bulkToggle || !bulkMenu) return;

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


