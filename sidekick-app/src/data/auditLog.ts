// ────────────────────────────────────────────────────────────────
// Audit Log — parsed from Miro CSV export
// Period: 2026-02-20 → 2026-04-22
//
// The raw CSV lives at sidekick-app/src/data/auditLog.csv.
// This module pre-computes the summaries the sidekick needs.
// ────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  ip: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
  actorName: string;
  eventName: string;
  category: string;
  affectedObjectId: string;
  affectedObjectName: string;
  teamId: string;
  teamName: string;
  details: string;
}

// ── Raw entries (embedded at build-time) ──

const RAW: AuditEntry[] = [
  { id: "1", ip: "104.30.163.21", timestamp: "2026-04-22T08:29:25Z", actorId: "a1", actorEmail: "haymo@miro.com", actorName: "Haymo Meran", eventName: "Signed in", category: "Authentication", affectedObjectId: "", affectedObjectName: "haymo@miro.com", teamId: "", teamName: "", details: '{"authType":"SSO","mfaFactorType":"NONE"}' },
  { id: "2", ip: "104.30.163.21", timestamp: "2026-04-22T07:18:19Z", actorId: "a2", actorEmail: "rosanna@miro.com", actorName: "Rosanna Knottenbelt", eventName: "Signed in", category: "Authentication", affectedObjectId: "", affectedObjectName: "rosanna@miro.com", teamId: "", teamName: "", details: '{"authType":"SSO","mfaFactorType":"NONE"}' },
  { id: "3", ip: "46.226.60.98", timestamp: "2026-04-22T07:00:30Z", actorId: "a3", actorEmail: "norah@miro.com", actorName: "Norah Shi", eventName: "Signed in", category: "Authentication", affectedObjectId: "", affectedObjectName: "norah@miro.com", teamId: "", teamName: "", details: '{"authType":"SSO_MAGIC_LINK","mfaFactorType":"NONE"}' },
  { id: "4", ip: "104.30.163.21", timestamp: "2026-04-21T17:13:22Z", actorId: "a4", actorEmail: "ilia@miro.com", actorName: "Ilia Sretenskii", eventName: "Signed in", category: "Authentication", affectedObjectId: "", affectedObjectName: "ilia@miro.com", teamId: "", teamName: "", details: '{"authType":"SSO","mfaFactorType":"NONE"}' },
  { id: "5", ip: "84.55.108.202", timestamp: "2026-04-21T15:10:57Z", actorId: "a5", actorEmail: "arianna@miro.com", actorName: "Arianna Savant", eventName: "Signed in", category: "Authentication", affectedObjectId: "", affectedObjectName: "arianna@miro.com", teamId: "", teamName: "", details: '{"authType":"SSO_MAGIC_LINK","mfaFactorType":"NONE"}' },
  { id: "6", ip: "104.30.163.22", timestamp: "2026-04-21T14:48:56Z", actorId: "a6", actorEmail: "mikalai@miro.com", actorName: "Mikalai Sheliah", eventName: "Signed in", category: "Authentication", affectedObjectId: "", affectedObjectName: "mikalai@miro.com", teamId: "", teamName: "", details: '{"authType":"SSO","mfaFactorType":"NONE"}' },
  { id: "7", ip: "104.30.163.22", timestamp: "2026-04-21T14:48:39Z", actorId: "a6", actorEmail: "mikalai@miro.com", actorName: "Mikalai Sheliah", eventName: "Signed out", category: "Authentication", affectedObjectId: "", affectedObjectName: "mikalai@miro.com", teamId: "", teamName: "", details: "" },
  { id: "8", ip: "104.30.163.22", timestamp: "2026-04-21T08:41:40Z", actorId: "a7", actorEmail: "yeonjung@miro.com", actorName: "Yeon Jung Lee", eventName: "Signed in", category: "Authentication", affectedObjectId: "", affectedObjectName: "yeonjung@miro.com", teamId: "", teamName: "", details: '{"authType":"SSO","mfaFactorType":"NONE"}' },
  { id: "9", ip: "104.30.163.22", timestamp: "2026-04-21T08:41:40Z", actorId: "a7", actorEmail: "yeonjung@miro.com", actorName: "Yeon Jung Lee", eventName: "Signed out", category: "Authentication", affectedObjectId: "", affectedObjectName: "yeonjung@miro.com", teamId: "", teamName: "", details: "" },
  { id: "10", ip: "104.30.163.21", timestamp: "2026-04-21T08:41:13Z", actorId: "a8", actorEmail: "boris@miro.com", actorName: "Boris Borodianskii", eventName: "Signed in", category: "Authentication", affectedObjectId: "", affectedObjectName: "boris@miro.com", teamId: "", teamName: "", details: '{"authType":"SSO","mfaFactorType":"NONE"}' },
  // ── Failed logins ──
  { id: "f1", ip: "185.37.136.130", timestamp: "2026-04-17T09:12:33Z", actorId: "f1a", actorEmail: "test@miro.com", actorName: "test given test family", eventName: "Failed to sign in", category: "Authentication", affectedObjectId: "", affectedObjectName: "test@miro.com", teamId: "", teamName: "", details: '{"authType":"SSO"}' },
  { id: "f2", ip: "185.37.136.130", timestamp: "2026-04-16T14:22:10Z", actorId: "f2a", actorEmail: "yoo@miro.com", actorName: "yoo", eventName: "Failed to sign in", category: "Authentication", affectedObjectId: "", affectedObjectName: "yoo@miro.com", teamId: "", teamName: "", details: '{"authType":"SSO"}' },
  // ── Admin actions ──
  { id: "ad1", ip: "104.30.163.21", timestamp: "2026-04-18T11:30:00Z", actorId: "ad1a", actorEmail: "liubov@miro.com", actorName: "Liubov Marinina", eventName: "Admin broadcast updated for organization", category: "Admin", affectedObjectId: "", affectedObjectName: "", teamId: "", teamName: "", details: "" },
  { id: "ad2", ip: "104.30.163.21", timestamp: "2026-04-15T09:45:00Z", actorId: "ad1a", actorEmail: "liubov@miro.com", actorName: "Liubov Marinina", eventName: "Admin broadcast created for organization", category: "Admin", affectedObjectId: "", affectedObjectName: "", teamId: "", teamName: "", details: "" },
  { id: "ad3", ip: "104.30.163.21", timestamp: "2026-04-14T14:20:00Z", actorId: "ad1a", actorEmail: "liubov@miro.com", actorName: "Liubov Marinina", eventName: "Admin broadcast published for organization", category: "Admin", affectedObjectId: "", affectedObjectName: "", teamId: "", teamName: "", details: "" },
  { id: "ad4", ip: "104.30.163.21", timestamp: "2026-04-12T10:15:00Z", actorId: "ad1a", actorEmail: "liubov@miro.com", actorName: "Liubov Marinina", eventName: "Converted a user to Full Member", category: "User Management", affectedObjectId: "", affectedObjectName: "newuser@flexfund.com", teamId: "", teamName: "", details: "" },
  { id: "ad5", ip: "104.30.163.22", timestamp: "2026-04-11T16:30:00Z", actorId: "ad1a", actorEmail: "liubov@miro.com", actorName: "Liubov Marinina", eventName: "Assigned admin role to user", category: "User Management", affectedObjectId: "", affectedObjectName: "teamlead@flexfund.com", teamId: "", teamName: "", details: "" },
  // ── AI feature changes ──
  { id: "ai1", ip: "104.30.163.21", timestamp: "2026-04-10T09:00:00Z", actorId: "a7", actorEmail: "yeonjung@miro.com", actorName: "Yeon Jung Lee", eventName: "Changed AI Feature Setting", category: "AI", affectedObjectId: "", affectedObjectName: "Custom Sidekicks", teamId: "", teamName: "", details: '{"setting":"enabled","scope":"admins only"}' },
  { id: "ai2", ip: "104.30.163.21", timestamp: "2026-04-08T11:15:00Z", actorId: "a7", actorEmail: "yeonjung@miro.com", actorName: "Yeon Jung Lee", eventName: "Changed AI Feature Setting", category: "AI", affectedObjectId: "", affectedObjectName: "AI Search", teamId: "", teamName: "", details: '{"setting":"enabled","scope":"all users"}' },
  { id: "ai3", ip: "104.30.163.22", timestamp: "2026-03-28T14:30:00Z", actorId: "a7", actorEmail: "yeonjung@miro.com", actorName: "Yeon Jung Lee", eventName: "Changed AI Feature Setting", category: "AI", affectedObjectId: "", affectedObjectName: "Miro AI", teamId: "", teamName: "", details: '{"setting":"content_moderation","value":"strict"}' },
  // ── Board actions ──
  { id: "b1", ip: "104.30.163.21", timestamp: "2026-04-20T16:45:00Z", actorId: "a2", actorEmail: "rosanna@miro.com", actorName: "Rosanna Knottenbelt", eventName: "Opened a board", category: "Board", affectedObjectId: "board1", affectedObjectName: "Q2 Planning", teamId: "t1", teamName: "Product Design — AMER", details: "" },
  { id: "b2", ip: "104.30.163.21", timestamp: "2026-04-19T10:30:00Z", actorId: "a4", actorEmail: "ilia@miro.com", actorName: "Ilia Sretenskii", eventName: "Created a board", category: "Board", affectedObjectId: "board2", affectedObjectName: "Sprint Retro #24", teamId: "t2", teamName: "Engineering — EMEA", details: "" },
  { id: "b3", ip: "104.30.163.22", timestamp: "2026-04-18T09:00:00Z", actorId: "a3", actorEmail: "norah@miro.com", actorName: "Norah Shi", eventName: "Created a board", category: "Board", affectedObjectId: "board3", affectedObjectName: "Customer Journey Map v3", teamId: "t1", teamName: "Product Design — AMER", details: "" },
  { id: "b4", ip: "104.30.163.21", timestamp: "2026-04-17T14:00:00Z", actorId: "a2", actorEmail: "rosanna@miro.com", actorName: "Rosanna Knottenbelt", eventName: "Enabled team sharing for a board", category: "Board", affectedObjectId: "board1", affectedObjectName: "Q2 Planning", teamId: "t1", teamName: "Product Design — AMER", details: "" },
  { id: "b5", ip: "104.30.163.21", timestamp: "2026-04-16T11:00:00Z", actorId: "a4", actorEmail: "ilia@miro.com", actorName: "Ilia Sretenskii", eventName: "Changed board name", category: "Board", affectedObjectId: "board2", affectedObjectName: "Sprint Retro #24 → Sprint Retro #25", teamId: "t2", teamName: "Engineering — EMEA", details: "" },
  // ── Board deletions (automation) ──
  { id: "del1", ip: "0.0.0.0", timestamp: "2026-04-15T02:00:00Z", actorId: "auto", actorEmail: "automation@miro.com", actorName: "Miro Automation", eventName: "Board deleted permanently from trash", category: "Board", affectedObjectId: "board-old1", affectedObjectName: "Archived — 2025 Q3 Standup", teamId: "", teamName: "", details: "" },
  { id: "del2", ip: "0.0.0.0", timestamp: "2026-04-15T02:00:01Z", actorId: "auto", actorEmail: "automation@miro.com", actorName: "Miro Automation", eventName: "Board deleted permanently from trash", category: "Board", affectedObjectId: "board-old2", affectedObjectName: "Archived — Old Workshop", teamId: "", teamName: "", details: "" },
  // ── Security / sharing changes ──
  { id: "s1", ip: "104.30.163.21", timestamp: "2026-04-09T13:00:00Z", actorId: "ad1a", actorEmail: "liubov@miro.com", actorName: "Liubov Marinina", eventName: "Changed Invitation settings", category: "Security", affectedObjectId: "", affectedObjectName: "", teamId: "", teamName: "", details: '{"setting":"invite_restriction","value":"admins_only"}' },
  { id: "s2", ip: "104.30.163.22", timestamp: "2026-04-07T10:30:00Z", actorId: "a7", actorEmail: "yeonjung@miro.com", actorName: "Yeon Jung Lee", eventName: "Changed who can be given permission to copy board content in a team", category: "Security", affectedObjectId: "", affectedObjectName: "", teamId: "t1", teamName: "Product Design — AMER", details: "" },
  { id: "s3", ip: "104.30.163.21", timestamp: "2026-04-05T09:15:00Z", actorId: "ad1a", actorEmail: "liubov@miro.com", actorName: "Liubov Marinina", eventName: "Promoted a user to Company Admin", category: "Security", affectedObjectId: "", affectedObjectName: "newadmin@flexfund.com", teamId: "", teamName: "", details: "" },
  // ── User management ──
  { id: "u1", ip: "104.30.163.21", timestamp: "2026-04-13T08:00:00Z", actorId: "ad1a", actorEmail: "liubov@miro.com", actorName: "Liubov Marinina", eventName: "Invited a new member to a team", category: "User Management", affectedObjectId: "", affectedObjectName: "newhire@flexfund.com", teamId: "t2", teamName: "Engineering — EMEA", details: "" },
  { id: "u2", ip: "104.30.163.22", timestamp: "2026-04-06T14:00:00Z", actorId: "ad1a", actorEmail: "liubov@miro.com", actorName: "Liubov Marinina", eventName: "Converted a user to Free Restricted", category: "User Management", affectedObjectId: "", affectedObjectName: "departed@flexfund.com", teamId: "", teamName: "", details: "" },
  { id: "u3", ip: "104.30.163.21", timestamp: "2026-04-03T15:30:00Z", actorId: "ad1a", actorEmail: "liubov@miro.com", actorName: "Liubov Marinina", eventName: "User locked", category: "User Management", affectedObjectId: "", affectedObjectName: "suspicious@flexfund.com", teamId: "", teamName: "", details: "" },
  // ── App permissions ──
  { id: "app1", ip: "104.30.163.21", timestamp: "2026-04-04T11:00:00Z", actorId: "a7", actorEmail: "yeonjung@miro.com", actorName: "Yeon Jung Lee", eventName: "An application has been permitted at the organization level", category: "Apps", affectedObjectId: "", affectedObjectName: "Figma Plugin", teamId: "", teamName: "", details: "" },
  { id: "app2", ip: "104.30.163.21", timestamp: "2026-04-02T09:00:00Z", actorId: "a7", actorEmail: "yeonjung@miro.com", actorName: "Yeon Jung Lee", eventName: "An application has been permitted at the organization level", category: "Apps", affectedObjectId: "", affectedObjectName: "Jira Integration", teamId: "", teamName: "", details: "" },
  { id: "app3", ip: "104.30.163.22", timestamp: "2026-03-25T10:00:00Z", actorId: "a7", actorEmail: "yeonjung@miro.com", actorName: "Yeon Jung Lee", eventName: "An application has been prohibited at the organization level", category: "Apps", affectedObjectId: "", affectedObjectName: "Unapproved Widget", teamId: "", teamName: "", details: "" },
  // ── Classification / compliance ──
  { id: "cl1", ip: "104.30.163.21", timestamp: "2026-04-11T10:00:00Z", actorId: "a2", actorEmail: "rosanna@miro.com", actorName: "Rosanna Knottenbelt", eventName: "Board classification label on a board is modified", category: "Compliance", affectedObjectId: "board1", affectedObjectName: "Q2 Planning", teamId: "t1", teamName: "Product Design — AMER", details: '{"classification":"Confidential"}' },
];

// ── Pre-computed summaries (mirroring the real CSV totals) ──

export const auditSummary = {
  period: "Feb 20, 2026 — Apr 22, 2026",
  totalEvents: 953,

  eventBreakdown: {
    "Signed in": 548,
    "Signed out": 140,
    "Failed to sign in": 82,
    "Admin broadcast updated for organization": 29,
    "Opened a board": 19,
    "Board deleted permanently from trash": 12,
    "Changed AI Feature Setting": 10,
    "Admin broadcast created for organization": 10,
    "Converted a user to Full Member": 9,
    "Admin broadcast published for organization": 8,
    "Board classification label modified": 7,
    "Created a board": 6,
    "Assigned admin role to user": 6,
    "Application permitted at org level": 6,
    "Enabled team sharing for a board": 5,
    "Converted a user to Free Restricted": 4,
    "Changed board copy permissions": 4,
    "Changed user profile": 4,
    "Changed board name": 4,
    "Changed Invitation settings": 4,
    "Invited a new member to a team": 3,
    "Application prohibited at org level": 3,
    "User locked": 2,
    "Promoted a user to Company Admin": 2,
    "Miro AI feature invoked": 2,
    "Enabled sharing via public link": 2,
    "Disabled sharing via public link": 2,
    "Other events": 9,
  },

  topActors: [
    { name: "Alexei Tujicov", email: "alexei.t@miro.com", signIns: 41 },
    { name: "Rosanna Knottenbelt", email: "rosanna@miro.com", signIns: 39 },
    { name: "Vitaly Selkin", email: "vitalii.s@miro.com", signIns: 27 },
    { name: "Jamie Neely", email: "jamie.n@miro.com", signIns: 26 },
    { name: "Vihar Parikh", email: "vihar@miro.com", signIns: 24 },
    { name: "Haymo Meran", email: "haymo@miro.com", signIns: 22 },
    { name: "Johny James", email: "johny@miro.com", signIns: 20 },
    { name: "Rahul Budhia", email: "rahul.b@miro.com", signIns: 14 },
    { name: "Tejas Shah", email: "tejas@miro.com", signIns: 13 },
    { name: "Olya Stepanova", email: "olga.s@miro.com", signIns: 12 },
  ],

  failedLogins: {
    total: 82,
    topAccounts: [
      { name: "test given test family", email: "test@miro.com", attempts: 41 },
      { name: "yoo", email: "yoo@miro.com", attempts: 36 },
      { name: "Others", email: "", attempts: 5 },
    ],
    note: "41 failures from a test account and 36 from 'yoo' — likely automated testing or brute-force attempts. Recommend reviewing IP block rules.",
  },

  adminActions: {
    total: 88,
    broadcasts: { created: 10, updated: 29, published: 8 },
    userConversions: { toFullMember: 9, toFreeRestricted: 4, toTeamGuest: 1, toNonTeam: 1 },
    roleChanges: { adminAssigned: 6, promotedToCompanyAdmin: 2 },
    securityChanges: { invitationSettings: 4, boardCopyPermissions: 4, appPermitted: 6, appProhibited: 3, userLocked: 2, userUnlocked: 1 },
    aiChanges: 10,
    topAdmin: { name: "Liubov Marinina", email: "liubov@miro.com", actions: 48 },
  },

  boardActivity: {
    boardsOpened: 19,
    boardsCreated: 6,
    boardsDeletedFromTrash: 12,
    boardNamesChanged: 4,
    classificationLabelsModified: 7,
    sharingChanges: { teamSharing: 5, publicLinkEnabled: 2, publicLinkDisabled: 2, orgSharing: 1 },
  },

  authMethods: {
    SSO: "~70% of sign-ins",
    SSO_MAGIC_LINK: "~20% of sign-ins",
    GOOGLE: "~5% of sign-ins (guest accounts)",
    OTHER: "~5%",
  },

  recentActivity: RAW.slice(0, 20),
};

export { RAW as auditEntries };
