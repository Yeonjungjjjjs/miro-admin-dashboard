// ────────────────────────────────────────────────────────────────
// Admin Context — your organization's data
//
// Edit this file with your real data. It powers:
//   - Mock responses (option 3, current)
//   - System prompt for LLM (option 2, future)
//
// When migrating to option 2, this entire object gets serialized
// into the system prompt so the LLM "knows" your org.
// ────────────────────────────────────────────────────────────────

export const adminContext = {

  // ── Organization ──
  org: {
    name: "Flex fund",
    domain: "flexfund.com",
    plan: "Enterprise",
    licensingModel: "FLP (Flexible Licensing Plan)",
    industry: "SaaS",
    dataResidency: "US-East (primary), EU-West (EMEA mirror)",
    contractRenewal: "Sep 15, 2026",
    regions: ["AMER", "EMEA", "APAC"],
    teamStructure: "EPD (Engineering, Product, Design) pods across all regions",
  },

  // ── Licensing ──
  licensing: {
    totalSeats: 500,
    flexibleLicensing: true,
    flexNote: "+flexible licensing pool — seats auto-scale with active usage",
    usedSeats: 487,
    availableSeats: 13,
    fullTimeEmployees: 630,
    licensedScope: "Full-time employees only (contractors via guest access)",
    annualCost: "$60,000/yr",
    perSeatCost: "$120/yr base (FLP flex rate applies)",
    overageRate: "Auto-scaled under FLP — no hard overage, billed quarterly",
    newHiresPerQuarter: 20,
    growthRate: "~20 new hires/quarter (~7/month)",
    forecastNote: "At current hiring pace, 13 available seats will be consumed in ~2 months. FLP will auto-scale but review budget allocation.",
  },

  // ── Users ──
  users: {
    total: 487,
    totalEmployees: 630,
    active30d: 412,
    pendingInvitations: 23,
    deactivated: 38,
    guestUsers: 45,
    newThisWeek: 8,
    removedThisWeek: 2,
    expiredInvitations: 5,
    byRole: {
      orgAdmins: 4,
      operationalAdmins: 3,
      teamAdmins: 112,
      members: 368,
    },
    byRegion: {
      amer: 210,
      emea: 168,
      apac: 109,
    },
  },

  // ── Admin team ──
  adminTeam: {
    orgAdmins: 4,
    operationalAdmins: 3,
    totalAdminStaff: 7,
    teamAdmins: 112,
    description: "4 org admins + 3 operational admins manage the Miro instance. 112 team admins are delegated to manage their respective teams.",
    legalCollaboration: "Admin team works closely with Legal to review AI model policies, data processing agreements, and compliance requirements before enabling new AI features.",
    complianceTraining: "Quarterly compliance training sessions sent to all users covering Miro usage policies, data handling, and approved workflows.",
    lastTrainingSent: "Jan 2026",
    nextTrainingScheduled: "Apr 2026",
    trainingCompletionRate: "89% (last quarter)",
  },

  // ── Inactive users breakdown ──
  inactiveUsers: {
    neverLoggedIn90d: 52,
    loggedOnceInactive60d: 41,
    recentlyInvited30d: 18,
    totalAffected: 111,
    note: "Many inactive accounts are from employees who onboarded but haven't adopted Miro in their workflow yet. Consider targeted enablement sessions by team.",
  },

  // ── Teams (enriched with visibility, sharing, admin details) ──
  teams: [
    { name: "Product Design — AMER", members: 32, boards: 245, created: "Jan 2024", visibility: "public" as const, boardSharing: "org-wide" as const, adminCount: 3, admins: ["Mira Balani", "Jun Takeda", "Elena Rossi"], externalSharing: false, publicLinksCount: 0, region: "AMER" },
    { name: "Product Design — EMEA", members: 24, boards: 178, created: "Jan 2024", visibility: "public" as const, boardSharing: "org-wide" as const, adminCount: 2, admins: ["Elena Rossi", "Hans Mueller"], externalSharing: false, publicLinksCount: 0, region: "EMEA" },
    { name: "Product Design — APAC", members: 18, boards: 112, created: "Mar 2024", visibility: "public" as const, boardSharing: "org-wide" as const, adminCount: 2, admins: ["Yuki Tanaka", "Priya Sharma"], externalSharing: false, publicLinksCount: 0, region: "APAC" },
    { name: "Engineering — AMER", members: 48, boards: 356, created: "Jan 2024", visibility: "private" as const, boardSharing: "team-only" as const, adminCount: 3, admins: ["Jamie Neely", "Carlos Rivera", "Tanya Okafor"], externalSharing: false, publicLinksCount: 0, region: "AMER" },
    { name: "Engineering — EMEA", members: 38, boards: 289, created: "Jan 2024", visibility: "private" as const, boardSharing: "team-only" as const, adminCount: 2, admins: ["Lars Svensson", "Anya Petrova"], externalSharing: false, publicLinksCount: 0, region: "EMEA" },
    { name: "Engineering — APAC", members: 28, boards: 198, created: "Mar 2024", visibility: "private" as const, boardSharing: "team-only" as const, adminCount: 2, admins: ["Kenji Sato", "Wei Chen"], externalSharing: false, publicLinksCount: 0, region: "APAC" },
    { name: "Product Management", members: 22, boards: 134, created: "Jan 2024", visibility: "public" as const, boardSharing: "org-wide" as const, adminCount: 2, admins: ["Vihar Parikh", "Sarah Lim"], externalSharing: true, publicLinksCount: 2, region: "AMER" },
    { name: "Marketing", members: 18, boards: 89, created: "Mar 2024", visibility: "public" as const, boardSharing: "org-wide" as const, adminCount: 1, admins: ["Sarah Chen"], externalSharing: true, publicLinksCount: 5, region: "AMER" },
    { name: "Sales", members: 25, boards: 67, created: "Mar 2024", visibility: "public" as const, boardSharing: "org-wide" as const, adminCount: 1, admins: ["Marcus Johnson"], externalSharing: true, publicLinksCount: 8, region: "AMER" },
    { name: "Customer Success", members: 16, boards: 54, created: "Jun 2024", visibility: "public" as const, boardSharing: "org-wide" as const, adminCount: 1, admins: ["Arianna Savant"], externalSharing: true, publicLinksCount: 3, region: "AMER" },
    { name: "Data Science", members: 14, boards: 78, created: "Jun 2024", visibility: "private" as const, boardSharing: "restricted" as const, adminCount: 1, admins: ["Kumar Bhaskar"], externalSharing: false, publicLinksCount: 0, region: "AMER" },
    { name: "DevOps / Platform", members: 12, boards: 92, created: "Jan 2024", visibility: "private" as const, boardSharing: "team-only" as const, adminCount: 2, admins: ["Alex Rivera", "Tomoko Ito"], externalSharing: false, publicLinksCount: 0, region: "AMER" },
    { name: "People & HR", members: 10, boards: 45, created: "Mar 2024", visibility: "public" as const, boardSharing: "org-wide" as const, adminCount: 1, admins: ["Norah Shi"], externalSharing: false, publicLinksCount: 0, region: "AMER" },
    { name: "Legal & Compliance", members: 6, boards: 28, created: "Jun 2024", visibility: "private" as const, boardSharing: "restricted" as const, adminCount: 1, admins: ["Boris Borodianskii"], externalSharing: false, publicLinksCount: 0, region: "AMER" },
    { name: "Finance", members: 8, boards: 32, created: "Mar 2024", visibility: "private" as const, boardSharing: "restricted" as const, adminCount: 1, admins: ["Deepa Nair"], externalSharing: false, publicLinksCount: 0, region: "EMEA" },
    { name: "Leadership / Exec", members: 12, boards: 56, created: "Jan 2024", visibility: "private" as const, boardSharing: "restricted" as const, adminCount: 2, admins: ["Rosanna Knottenbelt", "David Park"], externalSharing: false, publicLinksCount: 0, region: "AMER" },
    { name: "Research — UXR", members: 10, boards: 88, created: "Jun 2024", visibility: "public" as const, boardSharing: "org-wide" as const, adminCount: 1, admins: ["Lena Virtanen"], externalSharing: false, publicLinksCount: 1, region: "EMEA" },
  ],
  totalTeams: 130,
  topTeamsShown: 17,
  remainingTeams: 113,
  remainingTeamsNote: "113 additional teams (project-specific, cross-functional pods, and regional squads)",
  unassignedUsers: 34,

  // ── Sample user details (for conversational guidance) ──
  userDetails: [
    { name: "Rosanna Knottenbelt", email: "rosanna@acmecorp.com", role: "org-admin", license: "full", team: "Leadership / Exec", lastActive: "Today", status: "active" as const, region: "AMER" },
    { name: "Alexei Tujicov", email: "alexei@acmecorp.com", role: "org-admin", license: "full", team: "Engineering — AMER", lastActive: "Today", status: "active" as const, region: "AMER" },
    { name: "Vitaly Selkin", email: "vitaly@acmecorp.com", role: "org-admin", license: "full", team: "Product Management", lastActive: "Yesterday", status: "active" as const, region: "EMEA" },
    { name: "Jamie Neely", email: "jamie@acmecorp.com", role: "team-admin", license: "full", team: "Engineering — AMER", lastActive: "2 days ago", status: "active" as const, region: "AMER" },
    { name: "Vihar Parikh", email: "vihar@acmecorp.com", role: "team-admin", license: "full", team: "Product Management", lastActive: "1 day ago", status: "active" as const, region: "AMER" },
    { name: "Kumar Bhaskar", email: "kumar@acmecorp.com", role: "team-admin", license: "full", team: "Data Science", lastActive: "1 day ago", status: "active" as const, region: "AMER" },
    { name: "Arianna Savant", email: "arianna@acmecorp.com", role: "team-admin", license: "full", team: "Customer Success", lastActive: "3 days ago", status: "active" as const, region: "AMER" },
    { name: "Sarah Chen", email: "sarah@acmecorp.com", role: "team-admin", license: "full", team: "Marketing", lastActive: "Today", status: "active" as const, region: "AMER" },
    { name: "Boris Borodianskii", email: "boris@acmecorp.com", role: "team-admin", license: "full", team: "Legal & Compliance", lastActive: "5 days ago", status: "active" as const, region: "AMER" },
    { name: "Norah Shi", email: "norah@acmecorp.com", role: "team-admin", license: "full", team: "People & HR", lastActive: "1 week ago", status: "active" as const, region: "AMER" },
    { name: "Lena Virtanen", email: "lena@acmecorp.com", role: "team-admin", license: "full", team: "Research — UXR", lastActive: "4 days ago", status: "active" as const, region: "EMEA" },
    { name: "Marcus Johnson", email: "marcus@acmecorp.com", role: "team-admin", license: "full", team: "Sales", lastActive: "Today", status: "active" as const, region: "AMER" },
    { name: "Deepa Nair", email: "deepa@acmecorp.com", role: "team-admin", license: "full", team: "Finance", lastActive: "2 days ago", status: "active" as const, region: "EMEA" },
    { name: "Carlos Rivera", email: "carlos@acmecorp.com", role: "member", license: "full", team: "Engineering — AMER", lastActive: "Today", status: "active" as const, region: "AMER" },
    { name: "Priya Sharma", email: "priya@acmecorp.com", role: "member", license: "full", team: "Product Design — APAC", lastActive: "Today", status: "active" as const, region: "APAC" },
    { name: "Tom O'Brien", email: "tom@acmecorp.com", role: "member", license: "free-restricted", team: "Marketing", lastActive: "Never", status: "inactive" as const, region: "AMER" },
    { name: "Fatima Al-Rashid", email: "fatima@acmecorp.com", role: "member", license: "free-restricted", team: "Sales", lastActive: "Never", status: "inactive" as const, region: "EMEA" },
    { name: "Chris Lee", email: "chris@acmecorp.com", role: "member", license: "free-restricted", team: "Engineering — APAC", lastActive: "92 days ago", status: "inactive" as const, region: "APAC" },
    { name: "Nina Petrovska", email: "nina@acmecorp.com", role: "member", license: "basic", team: "Customer Success", lastActive: "68 days ago", status: "inactive" as const, region: "EMEA" },
    { name: "Raj Patel", email: "raj@acmecorp.com", role: "member", license: "basic", team: "Engineering — APAC", lastActive: "71 days ago", status: "inactive" as const, region: "APAC" },
  ],

  // ── Pending license requests ──
  licenseRequests: [
    { name: "Alex Rivera", team: "Engineering — APAC", requestDate: "Apr 15, 2026", currentRole: "free-restricted" },
    { name: "Maya Santos", team: "Product Design — AMER", requestDate: "Apr 14, 2026", currentRole: "free-restricted" },
    { name: "Oliver Strand", team: "Marketing", requestDate: "Apr 13, 2026", currentRole: "free-restricted" },
    { name: "Ling Wei", team: "Data Science", requestDate: "Apr 12, 2026", currentRole: "free-restricted" },
    { name: "Sophia Müller", team: "Engineering — EMEA", requestDate: "Apr 11, 2026", currentRole: "free-restricted" },
    { name: "James Okafor", team: "Sales", requestDate: "Apr 10, 2026", currentRole: "free-restricted" },
    { name: "Yumi Nakamura", team: "Product Design — APAC", requestDate: "Apr 9, 2026", currentRole: "free-restricted" },
    { name: "Aisha Khan", team: "Customer Success", requestDate: "Apr 8, 2026", currentRole: "free-restricted" },
    { name: "Daniel Cho", team: "DevOps / Platform", requestDate: "Apr 7, 2026", currentRole: "free-restricted" },
    { name: "Eva Lindström", team: "Research — UXR", requestDate: "Apr 6, 2026", currentRole: "free-restricted" },
    { name: "Marco Bianchi", team: "Engineering — EMEA", requestDate: "Apr 5, 2026", currentRole: "free-restricted" },
    { name: "Tara Singh", team: "People & HR", requestDate: "Apr 4, 2026", currentRole: "free-restricted" },
  ],

  // ── Boards with security flags (for insecure board review) ──
  flaggedBoards: [
    { name: "Q3 Revenue Projections", team: "Finance", sharing: "public-link", classification: "confidential", owner: "Deepa Nair", lastModified: "Apr 18, 2026" },
    { name: "Client Onboarding Flow", team: "Customer Success", sharing: "external-domain", classification: "internal", owner: "Arianna Savant", lastModified: "Apr 16, 2026" },
    { name: "Competitor Analysis 2026", team: "Product Management", sharing: "public-link", classification: "confidential", owner: "Vihar Parikh", lastModified: "Apr 15, 2026" },
    { name: "Salary Bands & Comp Data", team: "People & HR", sharing: "org-wide", classification: "restricted", owner: "Norah Shi", lastModified: "Apr 12, 2026" },
    { name: "Partnership Agreement Draft", team: "Legal & Compliance", sharing: "external-domain", classification: "confidential", owner: "Boris Borodianskii", lastModified: "Apr 10, 2026" },
    { name: "Sales Pipeline Q2", team: "Sales", sharing: "public-link", classification: "internal", owner: "Marcus Johnson", lastModified: "Apr 20, 2026" },
    { name: "User Research — PII Data", team: "Research — UXR", sharing: "org-wide", classification: "restricted", owner: "Lena Virtanen", lastModified: "Apr 8, 2026" },
  ],

  // ── Analytics (last 30 days) ──
  analytics: {
    activeUsers: 412,
    activeUsersPercent: "84.6%",
    boardsCreated: 234,
    totalSessions: 6842,
    avgSessionDuration: "42 min",
    trends: {
      activeUsers: "+9%",
      boardCreation: "+14%",
      collaboration: "+18%",
    },
    topFeatures: [
      { name: "Sticky notes", usage: "91%" },
      { name: "Frames", usage: "78%" },
      { name: "Comments", usage: "72%" },
      { name: "Diagrams & flowcharts", usage: "58%" },
      { name: "Voting", usage: "44%" },
      { name: "Timer", usage: "36%" },
      { name: "Miro AI", usage: "34%" },
    ],
    byRegion: {
      amer: { sessions: 2890, avgDuration: "45 min" },
      emea: { sessions: 2456, avgDuration: "40 min" },
      apac: { sessions: 1496, avgDuration: "38 min" },
    },
  },

  // ── Security ──
  security: {
    sso: {
      enabled: true,
      protocol: "SAML 2.0",
      provider: "Okta",
      lastMetadataUpdate: "2 weeks ago",
      enforcedForAll: true,
      guestBypass: false,
    },
    mfa: {
      adminRequired: true,
      adminCompliance: "7/7 (100%)",
      memberOptional: true,
      memberAdoption: "298/368 (81%)",
    },
    session: {
      maxLength: "12 hours",
      idleTimeout: "2 hours",
      concurrentSessions: 3,
    },
    scim: {
      enabled: true,
      provider: "Okta SCIM",
      autoProvisioning: true,
      autoDeprovisioning: true,
      lastSync: "2 hours ago",
    },
  },

  // ── Content policies ──
  contentPolicies: {
    externalSharing: "Restricted to approved domains",
    guestAccess: "Enabled (approval required, limited to project boards)",
    boardExport: "Allowed for admins and team admins only",
    publicLinks: "Disabled",
    dataRetention: "90-day audit log retention, board backups daily",
  },

  // ── AI configuration ──
  ai: {
    miroAI: { enabled: true, scope: "all users" },
    sidekick: { enabled: true, scope: "all users" },
    customSidekicks: { enabled: true, scope: "admins only" },
    aiSearch: { enabled: true, scope: "all users" },
    smartTemplates: { enabled: true, scope: "all users" },
    aiWorkflows: { enabled: true, scope: "112 seats assigned to team admins + leads" },
    dataTraining: "Opted out — reviewed and confirmed by Legal team (last review: Dec 2025)",
    contentModeration: "Strict mode",
    legalReview: {
      status: "Ongoing",
      description: "Legal & Compliance team reviews all new AI model updates and data processing changes before org-wide rollout.",
      lastReview: "Dec 2025 — reviewed Miro AI model update v2.3",
      nextReview: "Scheduled for Q2 2026 — Sidekick custom model evaluation",
      pendingItems: ["Custom Sidekick data boundaries", "Third-party model connector policy"],
    },
    usage30d: {
      interactions: 4210,
      uniqueUsers: 286,
      uniqueUsersPercent: "69%",
      topUseCase: "Summarization (31%), Ideation (26%), Clustering (19%), Diagramming (14%)",
    },
  },

  // ── Compliance & training ──
  compliance: {
    quarterlyTraining: true,
    lastTrainingSent: "Jan 2026",
    nextTrainingScheduled: "Apr 2026",
    trainingTopics: ["Miro usage policies", "Data handling & classification", "Approved workflows & integrations", "AI feature guidelines"],
    completionRate: "89%",
    nonCompliantUsers: 53,
    nonCompliantNote: "53 users haven't completed Q1 2026 training — mostly from recent hires and APAC region",
  },

  // ── Products & integrations ──
  products: [
    { name: "Miro (core)", status: "Active", users: 487, tier: "Enterprise" },
    { name: "Miro AI", status: "Active", users: 487, tier: "Included" },
    { name: "AI Workflows", status: "Active", users: "112 seats (team admins + leads)", tier: "Add-on" },
    { name: "Sidekick", status: "Active", users: 487, tier: "Included" },
    { name: "Custom Sidekicks", status: "Active", users: "7 (admin team)", tier: "Add-on" },
    { name: "Intelligent Canvas", status: "Active", users: 487, tier: "Included" },
  ],
  integrations: {
    active: 14,
    list: ["Jira", "Confluence", "Slack", "Microsoft Teams", "Figma", "Asana", "GitHub", "Google Drive", "OneDrive", "Zoom", "Notion", "Linear", "Okta (SCIM)", "ServiceNow"],
    topUsed: [
      { name: "Jira", usage: "1,245 syncs/mo" },
      { name: "Slack", usage: "892 notifications/mo" },
      { name: "Confluence", usage: "456 embeds/mo" },
      { name: "Figma", usage: "334 imports/mo" },
    ],
    leastUsed: [
      { name: "Linear", usage: "18 syncs/mo" },
      { name: "ServiceNow", usage: "12 tickets/mo" },
    ],
  },
};

// ────────────────────────────────────────────────────────────────
// System prompt — used when migrating to option 2 (real LLM)
// ────────────────────────────────────────────────────────────────

export function buildSystemPrompt(): string {
  const ctx = adminContext;
  return `You are Admin Sidekick, an AI assistant for managing the Miro organization "${ctx.org.name}".

ORGANIZATION:
- Plan: ${ctx.org.plan} (${ctx.org.licensingModel}) | Industry: ${ctx.org.industry}
- Domain: ${ctx.org.domain} | Data residency: ${ctx.org.dataResidency}
- Regions served: ${ctx.org.regions.join(", ")}
- Team structure: ${ctx.org.teamStructure}
- Contract renewal: ${ctx.org.contractRenewal}

LICENSING (FLP — Flexible Licensing Plan):
- ${ctx.licensing.usedSeats} / ${ctx.licensing.totalSeats} seats used (${ctx.licensing.availableSeats} available, ${ctx.licensing.flexNote})
- Total employees: ${ctx.licensing.fullTimeEmployees} — licenses for full-time employees only
- New hires: ${ctx.licensing.newHiresPerQuarter} per quarter
- Annual cost: ${ctx.licensing.annualCost} (${ctx.licensing.perSeatCost})
- ${ctx.licensing.forecastNote}

USERS:
- Licensed users: ${ctx.users.total} | Total employees: ${ctx.users.totalEmployees} | Active (30d): ${ctx.users.active30d}
- Pending: ${ctx.users.pendingInvitations} | Deactivated: ${ctx.users.deactivated} | Guests: ${ctx.users.guestUsers}
- By role: Org admins: ${ctx.users.byRole.orgAdmins} | Operational admins: ${ctx.users.byRole.operationalAdmins} | Team admins: ${ctx.users.byRole.teamAdmins} | Members: ${ctx.users.byRole.members}
- By region: AMER: ${ctx.users.byRegion.amer} | EMEA: ${ctx.users.byRegion.emea} | APAC: ${ctx.users.byRegion.apac}

ADMIN TEAM:
- ${ctx.adminTeam.description}
- ${ctx.adminTeam.legalCollaboration}
- ${ctx.adminTeam.complianceTraining}
- Training completion: ${ctx.adminTeam.trainingCompletionRate}

INACTIVE USERS:
- Never logged in (90+ days): ${ctx.inactiveUsers.neverLoggedIn90d}
- Logged once, inactive 60+ days: ${ctx.inactiveUsers.loggedOnceInactive60d}
- Recently invited (30-day window): ${ctx.inactiveUsers.recentlyInvited30d}
- Total affected: ${ctx.inactiveUsers.totalAffected}
- ${ctx.inactiveUsers.note}

TEAMS: ${ctx.totalTeams} total teams
${ctx.teams.map(t => `- ${t.name}: ${t.members} members, ${t.boards} boards`).join("\n")}
- Plus ${ctx.remainingTeams} additional teams (${ctx.remainingTeamsNote})
- Unassigned users: ${ctx.unassignedUsers}

SECURITY:
- SSO: ${ctx.security.sso.enabled ? "Enabled" : "Disabled"} (${ctx.security.sso.protocol}, ${ctx.security.sso.provider}, enforced for all)
- SCIM: ${ctx.security.scim.enabled ? "Enabled" : "Disabled"} (${ctx.security.scim.provider}, auto-provision: ${ctx.security.scim.autoProvisioning})
- MFA: Required for admins (${ctx.security.mfa.adminCompliance}), optional for members (${ctx.security.mfa.memberAdoption})

AI FEATURES:
- Miro AI: ${ctx.ai.miroAI.enabled ? "On" : "Off"} (${ctx.ai.miroAI.scope})
- Data training: ${ctx.ai.dataTraining}
- Legal review: ${ctx.ai.legalReview.description}
  - Last: ${ctx.ai.legalReview.lastReview}
  - Next: ${ctx.ai.legalReview.nextReview}
  - Pending: ${ctx.ai.legalReview.pendingItems.join(", ")}
- AI usage (30d): ${ctx.ai.usage30d.interactions} interactions, ${ctx.ai.usage30d.uniqueUsers} unique users

COMPLIANCE:
- Quarterly training: ${ctx.compliance.quarterlyTraining ? "Yes" : "No"} (next: ${ctx.compliance.nextTrainingScheduled})
- Completion rate: ${ctx.compliance.completionRate}
- ${ctx.compliance.nonCompliantNote}

ROLE:
You are a proactive admin co-pilot. Don't just answer questions — guide admins
through decisions step-by-step. Think of yourself as a senior IT admin helping
a colleague.

CONVERSATION STYLE:
- Always ask clarifying questions before taking action
- Show relevant data FIRST, then ask what to do with it
- Offer 2-3 specific options as next steps (not open-ended)
- Use tables for structured data, keep them to 5-10 rows max
- Include impact numbers (e.g., "affects 142 members across 8 teams")

BULK OPERATIONS FLOW:
When a user wants to make bulk changes, ALWAYS follow this pattern:
1. ASK: "Which [items] do you want to update?" + show example criteria
2. SHOW: Display matching items in a preview table with current state
3. CONFIRM: Show what will change with impact numbers, offer [Apply] or [Go to page]
4. GUIDE: Walk through the steps or link to the admin page
Never execute changes without showing a preview first.
Never ask "Are you sure?" — instead show exactly what will happen.

SEARCH & INSIGHTS FLOW:
When a user asks to find or search something:
1. SHOW: Display the results with a short insight summary
2. ASK: "What would you like to do?" with specific options
3. GUIDE: Either help them act in chat or link to the relevant page

RESPONSE FORMAT:
- Use markdown tables for data (max 5-10 rows, mention total count)
- Use **bold** for key numbers and actions
- End every response with a follow-up question or 2-3 action options
- Link to admin pages: #/AllUsers, #/Teams, #/Products, #/Settings, #/MiroAI/Capabilities, #/Profile
- Format links as: [Go to Teams →](#/Teams)

TONE:
- Professional but approachable, concise, data-driven, action-oriented
- Every response should move toward a decision
`;
}
