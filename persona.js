/**
 * Admin Persona Configuration
 * ─────────────────────────────────────────────────────────
 * Single source of truth for the logged-in admin user and
 * their assigned organizations. Edit this file to update
 * persona data across the entire site (top bar, sidebar,
 * home greeting, profile pages, org picker).
 *
 * After editing, just hard-refresh the browser — no build
 * step needed.
 * ─────────────────────────────────────────────────────────
 */

var ADMIN_PERSONA = {

  /* ── User ─────────────────────────────────────────────── */
  name:       'Winnie Lee',
  firstName:  'Winnie',
  email:      'winnie@flexfund.com',
  photo:      'images/winnie-profile.png',
  role:       'Company admin',

  /* ── Domain shown in setup guide / domain control ────── */
  domain:     'flexfund.com',

  /* ── Active (selected) organization ──────────────────── */
  activeOrgId: 'flexfund',

  /* ── All assigned organizations ─────────────────────── */
  orgs: [
    { id: 'flexfund',       name: 'Flex fund',          plan: 'Enterprise', role: 'Company admin', color: '#4262FF' },
    { id: 'flexfund-latam', name: 'Flex fund - LATAM',  plan: 'Enterprise', role: 'Company admin', color: '#ffae57' },
    { id: 'flexfund-apac',  name: 'Flexfund - APAC',    plan: 'Enterprise', role: 'Company admin', color: '#f565eb' },
    { id: 'flexfund-emea',  name: 'Flex fund - EMEA',   plan: 'Enterprise', role: 'Company admin', color: '#3492ff' },
    { id: 'business-org',   name: 'Business org',       plan: 'Business',   role: 'Company admin', color: '#2cddb7' },
    { id: 'free-org',       name: 'Free org',           plan: 'Free',       role: 'Team admin',    color: '#a3a3a3' },
    { id: 'starter-org',    name: 'Starter org',        plan: 'Starter',    role: 'Team admin',    color: '#f5a623' }
  ]
};


/* ── Applicator ─────────────────────────────────────────
 * Reads ADMIN_PERSONA and stamps values into the DOM.
 * Called once per page load (after navigateTo inserts HTML)
 * and also on initial boot.
 * ────────────────────────────────────────────────────── */

function applyPersona() {
  var p = ADMIN_PERSONA;
  var active = null;
  for (var i = 0; i < p.orgs.length; i++) {
    if (p.orgs[i].id === p.activeOrgId) { active = p.orgs[i]; break; }
  }
  if (!active) active = p.orgs[0];

  /* — Top-bar avatar + profile dropdown — */
  document.querySelectorAll('#profile-trigger > img, .mds-dropdown-menu-avatar').forEach(function(img) {
    img.src = p.photo;
    img.alt = p.name;
  });
  var nameEl = document.querySelector('.mds-dropdown-menu-name');
  if (nameEl) nameEl.textContent = p.name;

  /* — Sidebar org — */
  var orgIcon = document.querySelector('.sidebar-org-icon');
  if (orgIcon) {
    orgIcon.textContent = active.name.charAt(0).toUpperCase();
    orgIcon.style.background = active.color;
  }
  var orgName = document.querySelector('.sidebar-org-name');
  if (orgName) orgName.textContent = active.name;
  var orgTag = document.querySelector('.sidebar-org-tag');
  if (orgTag) orgTag.textContent = active.role;

  /* — Org picker list — */
  var pickerList = document.querySelector('.org-picker-list');
  if (pickerList) {
    var otherOrgs = p.orgs.filter(function(o) { return o.id !== p.activeOrgId; });
    pickerList.innerHTML = otherOrgs.map(function(o) {
      return '<div class="org-picker-item" data-org-id="' + o.id + '">'
           + '<div class="org-picker-item-icon" style="background:' + o.color + ';"></div>'
           + '<div class="org-picker-item-info">'
           + '<div class="org-picker-item-name">' + o.name + '</div>'
           + '<div class="org-picker-item-tag">' + o.role + '</div>'
           + '</div></div>';
    }).join('');
  }

  /* — Home greeting — */
  var greeting = document.getElementById('greeting');
  if (greeting) {
    var h = new Date().getHours();
    var greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    greeting.textContent = greet + ', ' + p.firstName;
  }

  /* — Setup guide domain references — */
  document.querySelectorAll('.setup-title').forEach(function(el) {
    el.textContent = el.textContent.replace(/[\w.-]+\.com/g, p.domain);
  });
  document.querySelectorAll('.setup-desc').forEach(function(el) {
    el.textContent = el.textContent.replace(/[\w.-]+\.com/g, p.domain);
  });

  /* — Profile page — */
  var profileNameInput = document.querySelector('.profile-tab-content input[value]');
  if (profileNameInput) profileNameInput.value = p.name;

  var profilePhoto = document.querySelector('.profile-tab-content img[alt="Profile photo"]');
  if (profilePhoto) profilePhoto.src = p.photo;

  var profileEmail = document.querySelector('.profile-tab-content');
  if (profileEmail) {
    profileEmail.querySelectorAll('p').forEach(function(para) {
      if (para.textContent.indexOf('@') !== -1 && para.textContent.indexOf('Delete') === -1) {
        para.textContent = p.email;
      }
    });
  }
}
