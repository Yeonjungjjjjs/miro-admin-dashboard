import { useState, useCallback, useRef } from "react";
import { adminContext as ctx } from "@/data/adminContext";
import { auditSummary as audit } from "@/data/auditLog";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolInvocations?: Array<{
    toolName: string;
    args: Record<string, unknown>;
  }>;
  toolTextSplit?: number;
};

type ToolHandler = (toolName: string, args: Record<string, unknown>) => void;

// ── Conversation context tracking ──

type ConversationTopic =
  | "team-visibility"
  | "board-sharing"
  | "license-promote"
  | "license-requests"
  | "insecure-boards"
  | "top-users"
  | "templates"
  | "credits"
  | "ai-usage"
  | "public-sharing-settings"
  | "co-owner"
  | "mcp-settings"
  | "siem"
  | "private-teams"
  | "single-admin"
  | "audit-week"
  | "boards-created"
  | "failed-logins"
  | "admin-actions"
  | "setup-mcp"
  | "secure-login"
  | "ai-secure"
  | "compliance"
  | null;

interface ConversationState {
  lastTopic: ConversationTopic;
  lastDataShown: string | null;
  awaitingSelection: boolean;
}

// ── Pre-computed data helpers ──

const publicTeams = ctx.teams.filter((t) => t.visibility === "public");
const privateTeams = ctx.teams.filter((t) => t.visibility === "private");
const singleAdminTeams = ctx.teams.filter((t) => t.adminCount === 1);
const teamsWithExternalSharing = ctx.teams.filter((t) => t.externalSharing);
const teamsWithPublicLinks = ctx.teams.filter((t) => t.publicLinksCount > 0);
const totalPublicLinks = teamsWithPublicLinks.reduce((s, t) => s + t.publicLinksCount, 0);
const freeRestrictedUsers = ctx.userDetails.filter((u) => u.license === "free-restricted");
const inactiveUsers = ctx.userDetails.filter((u) => u.status === "inactive");

const publicTeamList = publicTeams
  .map((t) => `- **${t.name}** — ${t.members} members, ${t.boardSharing} sharing, admins: ${t.admins.join(", ")}`)
  .join("\n");

const singleAdminList = singleAdminTeams
  .map((t) => `- **${t.name}** — ${t.members} members, admin: ${t.admins[0]}`)
  .join("\n");

const privateTeamList = privateTeams
  .map((t) => `- **${t.name}** — ${t.members} members, ${t.boardSharing} sharing, admins: ${t.admins.join(", ")}`)
  .join("\n");

const flaggedBoardList = ctx.flaggedBoards
  .map((b) => `- **${b.name}** (${b.team}) — ${b.sharing}, ${b.classification}, owner: ${b.owner}`)
  .join("\n");

const licenseRequestList = ctx.licenseRequests
  .map((r) => `- **${r.name}** — ${r.team}, requested ${r.requestDate}`)
  .join("\n");

const productList = ctx.products
  .map((p) => `- **${p.name}** — ${p.status}, ${p.users} users, ${p.tier} tier`)
  .join("\n");

const featureList = ctx.analytics.topFeatures
  .map((f, i) => `${i + 1}. ${f.name} (${f.usage} of sessions)`)
  .join("\n");

// ── Response generators ──

const RESPONSES: Array<{
  match: (input: string) => boolean;
  topic: ConversationTopic;
  response: string;
}> = [

  // ═══════════════════════════════════════════
  // BULK OPERATIONS — Conversational guided flow
  // ═══════════════════════════════════════════

  {
    match: (q) => /team.?setting.*(public|private)|public.?to.?private/i.test(q),
    topic: "team-visibility",
    response: `**Update Team Settings — Public to Private**

I found **${publicTeams.length} teams** currently set to public:

${publicTeamList}

**Which teams would you like to set to private?** You can:
- Say **"all ${publicTeams.length} teams"** to update them all
- Name specific teams (e.g., "Marketing and Sales")
- Filter by criteria (e.g., "teams with external sharing" or "teams in AMER")`,
  },
  {
    match: (q) => /board.?sharing|sharing.?option/i.test(q),
    topic: "board-sharing",
    response: `**Change Board Sharing Options**

Here's the current sharing landscape across your org:

- **External sharing:** ${ctx.contentPolicies.externalSharing}
- **Guest access:** ${ctx.contentPolicies.guestAccess}
- **Public links:** ${ctx.contentPolicies.publicLinks}
- **Board export:** ${ctx.contentPolicies.boardExport}

**${teamsWithExternalSharing.length} teams** have external sharing enabled, and **${totalPublicLinks} public links** are active across ${teamsWithPublicLinks.length} teams.

**What would you like to change?**
- Disable external sharing for specific teams
- Remove all public links org-wide
- Restrict board sharing to "team-only" for sensitive teams
- [Go to Settings →](#/Settings) to update org-wide policies`,
  },
  {
    match: (q) => /promot.*license|license.*promot|full.*license|advanced.*license|upgrade.*license/i.test(q),
    topic: "license-promote",
    response: `**Promote Users to Full or Advanced Licenses**

I found **${freeRestrictedUsers.length} users** currently on Free Restricted licenses:

${freeRestrictedUsers.map((u) => `- **${u.name}** — ${u.team}, last active: ${u.lastActive} (${u.region})`).join("\n")}

**Capacity check:** ${ctx.licensing.availableSeats} seats available under FLP (auto-scales if needed).

**Which users would you like to promote?**
- Say **"all ${freeRestrictedUsers.length}"** to promote everyone
- Pick specific users by name
- Filter by criteria (e.g., "only active users" or "APAC region only")`,
  },
  {
    match: (q) => /approv.*license|license.?request|pending.*license/i.test(q),
    topic: "license-requests",
    response: `**Approve Pending License Requests**

There are **${ctx.licenseRequests.length} pending requests**:

${licenseRequestList}

**Capacity:** ${ctx.licensing.availableSeats} seats available (FLP auto-scales).

**What would you like to do?**
- **Approve all ${ctx.licenseRequests.length}** requests at once
- Review and approve individually
- Filter by team (e.g., "only Engineering requests")
- [Go to All Users →](#/AllUsers) to manage from the UI`,
  },
  {
    match: (q) => /insecure.*board|sensitive.*content|review.*board.*content/i.test(q),
    topic: "insecure-boards",
    response: `**Review Insecure Boards**

I found **${ctx.flaggedBoards.length} boards** with potential security concerns:

${flaggedBoardList}

**Key risks:**
- **${ctx.flaggedBoards.filter((b) => b.sharing === "public-link").length} boards** have public links (accessible to anyone)
- **${ctx.flaggedBoards.filter((b) => b.classification === "confidential").length} boards** are classified as confidential but have open sharing

**What would you like to do?**
- Revoke all public links on confidential boards
- Restrict sharing to team-only for all flagged boards
- Notify board owners to review their sharing settings
- [Go to Settings →](#/Settings) to review content policies`,
  },

  // ═══════════════════════════════════════════
  // ANALYTICS — Show data, ask what to drill into
  // ═══════════════════════════════════════════

  {
    match: (q) => /top.?user|most.?active.?user|who.*top/i.test(q),
    topic: "top-users",
    response: `**Top Users in ${ctx.org.name}** (last 30 days)

- **Rosanna Knottenbelt** — 39 sign-ins, Leadership / Exec (AMER)
- **Alexei Tujicov** — 41 sign-ins, Engineering — AMER (AMER)
- **Vitaly Selkin** — 27 sign-ins, Product Management (EMEA)
- **Jamie Neely** — 26 sign-ins, Engineering — AMER (AMER)
- **Vihar Parikh** — 24 sign-ins, Product Management (AMER)

**Org-wide:** ${ctx.analytics.activeUsers} active users (${ctx.analytics.activeUsersPercent}), ${ctx.analytics.totalSessions.toLocaleString()} sessions, avg ${ctx.analytics.avgSessionDuration}/session.

**Would you like to:**
- See top users **by region** (AMER, EMEA, APAC)
- See top users **by team**
- Identify **power users** for a champion program
- View **inactive users** to reclaim licenses`,
  },
  {
    match: (q) => /template|most.?used.?template/i.test(q),
    topic: "templates",
    response: `**Most Used Templates** (last 30 days)

- **Sprint Retrospective** — 89 uses (Engineering, Product)
- **Brainstorming** — 72 uses (All teams)
- **Customer Journey Map** — 54 uses (Product Design)
- **Kanban Board** — 48 uses (Engineering)
- **Stakeholder Map** — 31 uses (Product Management)

**Would you like to:**
- See template usage **by team**
- Create a **recommended template list** for your org
- Identify teams that could benefit from **more templates**`,
  },
  {
    match: (q) => /credit|how.*credit/i.test(q),
    topic: "credits",
    response: `**Credit Usage Overview**

- **Miro AI (core)** — 1,280 credits (30%)
- **Sidekick** — 1,120 credits (27%)
- **AI Workflows** — 890 credits (21%)
- **Smart Templates** — 520 credits (12%)
- **AI Search** — 400 credits (10%)

**Total AI interactions (30d):** ${ctx.ai.usage30d.interactions.toLocaleString()} by ${ctx.ai.usage30d.uniqueUsers} unique users (${ctx.ai.usage30d.uniqueUsersPercent}).

**Would you like to:**
- See credit usage **by team**
- Set up **credit alerts** for budget tracking
- Review which teams are **under-utilizing** AI features`,
  },
  {
    match: (q) => /ai.*used.*most|most.*used.*ai|which.*ai/i.test(q),
    topic: "ai-usage",
    response: `**Most Used AI Features** (last 30 days)

- **Summarization** — 1,305 interactions (31%), 186 users, +15%
- **Ideation** — 1,095 interactions (26%), 154 users, +22%
- **Clustering** — 800 interactions (19%), 112 users, +8%
- **Diagramming** — 589 interactions (14%), 89 users, +5%
- **Other** — 421 interactions (10%), 67 users, +3%

**Insight:** Summarization and Ideation account for **57%** of all AI use. Clustering and Diagramming have room for growth.

**Would you like to:**
- See AI usage **by team** to identify adoption gaps
- Review **feature access settings** to enable more users
- Run an **enablement workshop** for underused features
- [Go to Miro AI Capabilities →](#/MiroAI/Capabilities)`,
  },

  // ═══════════════════════════════════════════
  // SEARCH LINKS — Show data + offer actions
  // ═══════════════════════════════════════════

  {
    match: (q) => /public.*board.*sharing|board.*sharing.*setting/i.test(q),
    topic: "public-sharing-settings",
    response: `**Public Board Sharing Settings**

- **Share boards via public link:** ${ctx.contentPolicies.publicLinks}
- **External sharing:** ${ctx.contentPolicies.externalSharing}
- **Board export:** ${ctx.contentPolicies.boardExport}

**Active public links:** ${totalPublicLinks} across ${teamsWithPublicLinks.length} teams (${teamsWithPublicLinks.map((t) => t.name).join(", ")}).

**Would you like to:**
- Review which boards have active public links
- Disable public links org-wide
- [Go to Settings →](#/Settings) to change the policy`,
  },
  {
    match: (q) => /co.?owner|allow.*co.?owner/i.test(q),
    topic: "co-owner",
    response: `**Roles & Permissions — Co-owner Role**

The Co-owner role lets board owners delegate full control to trusted collaborators.

**Current roles in your org:**
- Org admins: **${ctx.users.byRole.orgAdmins}** | Team admins: **${ctx.users.byRole.teamAdmins}** | Members: **${ctx.users.byRole.members}**

**Would you like to:**
- Enable the Co-owner role org-wide
- Review the full permissions matrix
- [Go to Settings →](#/Settings) to manage roles`,
  },
  {
    match: (q) => /mcp|mcp.?client|mcp.?compatible/i.test(q),
    topic: "mcp-settings",
    response: `**MCP-Compatible Clients Setting**

MCP (Model Context Protocol) lets AI tools like Cursor and Claude Desktop interact with Miro boards.

**Security consideration:** MCP clients can read and write board data. Your legal team has a review scheduled for **${ctx.ai.legalReview.nextReview}**.

**Would you like to:**
- Enable MCP access now (with restrictions)
- Add MCP to the upcoming legal review agenda
- See which MCP clients are available
- [Go to Settings →](#/Settings) to manage integrations`,
  },
  {
    match: (q) => /siem|security.*event|event.*management|aggregate.*audit/i.test(q),
    topic: "siem",
    response: `**SIEM Integration — Connect Your Audit Log**

Your audit log has **${audit.totalEvents} events** over ${audit.period}. Connecting to a SIEM lets you aggregate and analyze these in real time.

**Supported providers:** Splunk, Datadog, Elastic SIEM, Microsoft Sentinel, Sumo Logic

**Would you like to:**
- Get step-by-step setup for a specific SIEM provider
- Review what audit events are available
- [Go to Settings →](#/Settings) to configure the integration`,
  },
  {
    match: (q) => /private.*team|team.*private/i.test(q),
    topic: "private-teams",
    response: `**Teams Set to Private**

Found **${privateTeams.length} teams** with private visibility:

${privateTeamList}

*${privateTeams.length} of ${ctx.totalTeams} teams are private.*

**Would you like to:**
- Change any of these to **public**
- Review the **full team visibility list** (public + private)
- Assign backup admins to single-admin private teams
- [Go to Teams →](#/Teams)`,
  },
  {
    match: (q) => /single.*admin|one.*admin|team.*only.*one/i.test(q),
    topic: "single-admin",
    response: `**Teams with a Single Admin**

Found **${singleAdminTeams.length} teams** with only one admin — a risk if that person leaves:

${singleAdminList}

**Recommendation:** Assign a backup admin to each team.

**What would you like to do?**
- **Assign backup admins** — I'll suggest a member from each team to promote
- **Send a reminder** to the solo admins to nominate a backup
- [Go to Teams →](#/Teams) to manage from the UI`,
  },

  // ═══════════════════════════════════════════
  // AUDIT LOG — Show data, offer drill-down
  // ═══════════════════════════════════════════

  {
    match: (q) => /last.?week|happened.*week|recent.*week/i.test(q),
    topic: "audit-week",
    response: `**Audit Log — Last Week**

- **Sign-ins:** ~78
- **Sign-outs:** ~20
- **Failed logins:** ~12
- **Boards opened:** ~5
- **Boards created:** ~2
- **Admin broadcasts:** ~3

**Highlights:**
- **12 failed logins** — ${audit.failedLogins.note}
- ${audit.adminActions.topAdmin.name} made ${audit.adminActions.topAdmin.actions} admin actions

**Would you like to drill into:**
- **Failed logins** — see accounts and IP details
- **Admin actions** — review what was changed
- **A specific user's** activity
- [View Full Audit Log →](#/Settings)`,
  },
  {
    match: (q) => /board.*created|created.*board|how.?many.*board/i.test(q),
    topic: "boards-created",
    response: `**Board Creation Activity**

- **Last 30 days:** ${ctx.analytics.boardsCreated} boards created (${ctx.analytics.trends.boardCreation})
- **Last 60 days (audit):** ${audit.boardActivity.boardsCreated} boards created

**Top teams by boards:**
${ctx.teams.slice(0, 5).map((t) => `- ${t.name}: ${t.boards} total`).join("\n")}

**Would you like to:**
- See which **users** created the most boards
- Review **board naming conventions**
- Check for **unused or abandoned** boards`,
  },
  {
    match: (q) => /failed.*login|login.*fail|failed.*sign/i.test(q),
    topic: "failed-logins",
    response: `**Failed Login Attempts** (${audit.period})

**${audit.failedLogins.total} total failed attempts**

${audit.failedLogins.topAccounts.map((a) => `- **${a.name}** — ${a.attempts} attempts (${a.attempts > 30 ? "**High risk**" : "Low risk"})`).join("\n")}

**Analysis:** ${audit.failedLogins.note}

**What would you like to do?**
- **Lock** the high-risk accounts
- Review **IP addresses** for suspicious patterns
- Add accounts to an **IP blocklist**
- [Go to Security Settings →](#/Settings)`,
  },
  {
    match: (q) => /admin.*action|recent.*admin/i.test(q),
    topic: "admin-actions",
    response: `**Recent Admin Actions** (${audit.period})

**Top admin:** ${audit.adminActions.topAdmin.name} — ${audit.adminActions.topAdmin.actions} actions

- **Admin broadcasts:** ${audit.adminActions.broadcasts.created + audit.adminActions.broadcasts.updated + audit.adminActions.broadcasts.published}
- **Users converted to Full Member:** ${audit.adminActions.userConversions.toFullMember}
- **Admin roles assigned:** ${audit.adminActions.roleChanges.adminAssigned}
- **AI feature changes:** ${audit.adminActions.aiChanges}
- **Apps permitted/prohibited:** ${audit.adminActions.securityChanges.appPermitted + audit.adminActions.securityChanges.appProhibited}

**Would you like to:**
- Filter by a **specific admin**
- See **security-related** changes only
- Review **AI configuration** changes
- [View Full Audit Log →](#/Settings)`,
  },

  // ═══════════════════════════════════════════
  // HELP CENTER — Step-by-step with status checks
  // ═══════════════════════════════════════════

  {
    match: (q) => /set.?up.*mcp|how.*mcp|mcp.*setup|mcp.*organization/i.test(q),
    topic: "setup-mcp",
    response: `**How to Set Up MCPs**

Here's a 3-step guide:

**Step 1 — Enable MCP access**
Go to Settings → Integrations & Apps → Enable "Allow MCP-compatible clients"

**Step 2 — Configure approved clients**
Review and approve specific MCP clients (Cursor, Claude Desktop, etc.)

**Step 3 — Security review**
MCP clients can read/write board data. Your legal team review is scheduled for **${ctx.ai.legalReview.nextReview}**.

**Would you like to:**
- Start with **Step 1** — I'll walk you through it
- Review **security implications** first
- Add MCP to the **legal review agenda**
- [Go to Settings →](#/Settings)`,
  },
  {
    match: (q) => /secure.*login|enable.*secure|login.*security/i.test(q),
    topic: "secure-login",
    response: `**Secure Login Status**

- **SSO:** ${ctx.security.sso.enabled ? "Enabled" : "Disabled"} (${ctx.security.sso.protocol} via ${ctx.security.sso.provider})
- **Enforced for all:** ${ctx.security.sso.enforcedForAll ? "Yes" : "No"}
- **MFA (admins):** ${ctx.security.mfa.adminCompliance}
- **MFA (members):** ${ctx.security.mfa.memberAdoption}
- **Session timeout:** ${ctx.security.session.idleTimeout} idle / ${ctx.security.session.maxLength} max

**Recommended improvements:**
${ctx.security.mfa.memberAdoption.includes("100") ? "- MFA is fully adopted" : `- Increase MFA adoption (currently ${ctx.security.mfa.memberAdoption})`}
- Review session timeout settings
- Enable IP allowlisting for admin access

**Would you like to:**
- **Enforce MFA** for all users
- Review **session policies**
- [Go to Security Settings →](#/Settings)`,
  },
  {
    match: (q) => /ai.*secur|secur.*ai|configure.*ai.*safe|ai.*setting/i.test(q),
    topic: "ai-secure",
    response: `**AI Security Configuration**

- **Data training:** ${ctx.ai.dataTraining}
- **Content moderation:** ${ctx.ai.contentModeration}
- **Miro AI:** ${ctx.ai.miroAI.scope}
- **Sidekick:** ${ctx.ai.sidekick.scope}
- **Custom Sidekicks:** ${ctx.ai.customSidekicks.scope}
- **AI Workflows:** ${ctx.ai.aiWorkflows.scope}

**Legal status:** Last review ${ctx.ai.legalReview.lastReview}. Pending: ${ctx.ai.legalReview.pendingItems.join(", ")}.

**Would you like to:**
- Tighten **Custom Sidekick** access
- Schedule the next **legal review**
- See **AI usage breakdown** by team
- [Go to Miro AI →](#/MiroAI/Capabilities)`,
  },
  {
    match: (q) => /compliance.*guideline|company.*compliance|follow.*compliance/i.test(q),
    topic: "compliance",
    response: `**Compliance Checklist for ${ctx.org.name}**

**Authentication & Access** ✅
- SSO enforced: ${ctx.security.sso.enforcedForAll ? "Yes" : "No"} | SCIM: ${ctx.security.scim.enabled ? "Enabled" : "Disabled"}
- Admin MFA: ${ctx.security.mfa.adminCompliance}

**Data & Content** ✅
- External sharing: ${ctx.contentPolicies.externalSharing}
- Public links: ${ctx.contentPolicies.publicLinks}
- Data retention: ${ctx.contentPolicies.dataRetention}

**AI & Privacy** ✅
- Data training: ${ctx.ai.dataTraining}
- Moderation: ${ctx.ai.contentModeration}

**Training** ⚠️
- Completion: **${ctx.compliance.completionRate}** — ${ctx.compliance.nonCompliantNote}
- Next session: ${ctx.compliance.nextTrainingScheduled}

**Would you like to:**
- Send **training reminders** to the ${ctx.compliance.nonCompliantUsers} non-compliant users
- Generate a **compliance report**
- Review the **AI legal status**
- [Go to Settings →](#/Settings)`,
  },

  // ═══════════════════════════════════════════
  // BROAD CATEGORY FALLBACKS
  // ═══════════════════════════════════════════

  {
    match: (q) => /inactive|reactivat|dormant|never.?logged/i.test(q),
    topic: null,
    response: `**Inactive Users in ${ctx.org.name}**

- **Invited 90+ days ago, never logged in:** ${ctx.inactiveUsers.neverLoggedIn90d}
- **Logged in once, inactive 60+ days:** ${ctx.inactiveUsers.loggedOnceInactive60d}
- **Recently invited, within 30-day window:** ${ctx.inactiveUsers.recentlyInvited30d}
- **Total affected:** ${ctx.inactiveUsers.totalAffected}

${ctx.inactiveUsers.note}

**Would you like to:**
- Send **re-engagement emails** to never-logged-in users
- **Reclaim licenses** from the ${ctx.inactiveUsers.loggedOnceInactive60d} idle accounts
- [Go to All Users →](#/AllUsers)`,
  },
  {
    match: (q) => /audit|log|event.?log|sign.?in.?log|activity.?log/i.test(q),
    topic: null,
    response: `**Audit Log** — ${audit.period}

**${audit.totalEvents} total events**

- **Signed in:** ${audit.eventBreakdown["Signed in"]}
- **Signed out:** ${audit.eventBreakdown["Signed out"]}
- **Failed to sign in:** ${audit.eventBreakdown["Failed to sign in"]}
- **Admin broadcasts:** ${audit.adminActions.broadcasts.created + audit.adminActions.broadcasts.updated + audit.adminActions.broadcasts.published}
- **Board changes:** ${audit.boardActivity.boardsOpened + audit.boardActivity.boardsCreated + audit.boardActivity.boardsDeletedFromTrash}

⚠️ **${audit.failedLogins.total} failed logins** — ${audit.failedLogins.note}

**Drill into:**
- Failed logins | Admin actions | Board activity | A specific user
- [View Full Audit Log →](#/Settings)`,
  },
  {
    match: (q) => /team/i.test(q),
    topic: null,
    response: `**${ctx.org.name}** has **${ctx.totalTeams} teams** across ${ctx.org.regions.join(", ")}.

${ctx.teams.slice(0, 8).map((t) => `- **${t.name}** — ${t.members} members, ${t.visibility}, ${t.adminCount} admin${t.adminCount > 1 ? "s" : ""}`).join("\n")}
- *... ${ctx.totalTeams - 8} more teams*

**Quick insights:**
- **${publicTeams.length} public** / **${privateTeams.length} private** teams
- **${singleAdminTeams.length} teams** with a single admin (risk)
- **${ctx.unassignedUsers}** users not assigned to any team

**What would you like to do?**
- Find teams with **single admins**
- Update team **visibility** (public/private)
- [Go to Teams →](#/Teams)`,
  },
  {
    match: (q) => /analytics|metric|stats|usage|dashboard/i.test(q),
    topic: null,
    response: `**Org Analytics — Last 30 days**

- Active users: **${ctx.analytics.activeUsers}** / ${ctx.users.total} (${ctx.analytics.activeUsersPercent})
- Boards created: **${ctx.analytics.boardsCreated}** (${ctx.analytics.trends.boardCreation})
- Sessions: **${ctx.analytics.totalSessions.toLocaleString()}** (avg ${ctx.analytics.avgSessionDuration})

**Top features:**
${featureList}

**Drill into:** Top users | Templates | Credits | AI usage`,
  },
  {
    match: (q) => /sso|saml|security|mfa|2fa|scim/i.test(q),
    topic: null,
    response: `**Security & Authentication**

- **SSO:** ${ctx.security.sso.enabled ? "Enabled" : "Disabled"} (${ctx.security.sso.protocol}, ${ctx.security.sso.provider})
- **SCIM:** ${ctx.security.scim.enabled ? "Enabled" : "Disabled"} (${ctx.security.scim.provider})
- **MFA (admins):** ${ctx.security.mfa.adminCompliance}
- **MFA (members):** ${ctx.security.mfa.memberAdoption}

**Would you like to:** Enable secure login | Connect SIEM | Review session policies
[Go to Security Settings →](#/Settings)`,
  },
  {
    match: (q) => /billing|license|subscript|plan|cost|seat|pricing|flp|flex/i.test(q),
    topic: null,
    response: `**${ctx.org.plan} — ${ctx.org.licensingModel}**

- Seats: **${ctx.licensing.usedSeats}** / ${ctx.licensing.totalSeats} (${ctx.licensing.availableSeats} available)
- Cost: ${ctx.licensing.annualCost} (${ctx.licensing.perSeatCost})
- Growth: ${ctx.licensing.newHiresPerQuarter} new hires/quarter
- ⚠️ ${ctx.licensing.forecastNote}

**Would you like to:** Approve license requests | Promote users | Forecast seat usage
[Go to Billing →](#/Settings)`,
  },
  {
    match: (q) => /\bai\b|sidekick|capabilit|miro.?ai|intelligent/i.test(q),
    topic: null,
    response: `**Miro AI Configuration**

- **Miro AI:** ${ctx.ai.miroAI.scope} ✅
- **Sidekick:** ${ctx.ai.sidekick.scope} ✅
- **Custom Sidekicks:** ${ctx.ai.customSidekicks.scope} 🔒
- **AI Workflows:** ${ctx.ai.aiWorkflows.scope} ✅

**Usage (30d):** ${ctx.ai.usage30d.interactions.toLocaleString()} interactions by ${ctx.ai.usage30d.uniqueUsers} users.
**Data:** ${ctx.ai.dataTraining} | Moderation: ${ctx.ai.contentModeration}

**Would you like to:** Configure AI securely | See most used AI feature | Review legal status
[Go to Miro AI →](#/MiroAI/Capabilities)`,
  },
  {
    match: (q) => /setting|config|policy|permission|restrict/i.test(q),
    topic: null,
    response: `**Organization Settings**

- **External sharing:** ${ctx.contentPolicies.externalSharing}
- **Guest access:** ${ctx.contentPolicies.guestAccess}
- **Public links:** ${ctx.contentPolicies.publicLinks}
- **Board export:** ${ctx.contentPolicies.boardExport}

**Would you like to:** Change board sharing | Enable MCP | Set up SIEM | Review roles
[Go to Settings →](#/Settings)`,
  },
  {
    match: (q) => /bulk|mass|batch|multiple|all users/i.test(q),
    topic: null,
    response: `**Bulk Operations**

What would you like to do?

1. **Update team settings** — ${publicTeams.length} teams are currently public
2. **Change board sharing** — ${teamsWithExternalSharing.length} teams have external sharing
3. **Promote users** — ${freeRestrictedUsers.length} on Free Restricted licenses
4. **Approve license requests** — ${ctx.licenseRequests.length} pending
5. **Review insecure boards** — ${ctx.flaggedBoards.length} flagged
6. **Deactivate inactive users** — ${ctx.inactiveUsers.totalAffected} affected

Pick one, or describe what you need.`,
  },
  {
    match: (q) => /user|member|people|who/i.test(q),
    topic: null,
    response: `**User Overview** — ${ctx.users.total} licensed / ${ctx.users.totalEmployees} employees

- **Active (30d):** ${ctx.users.active30d}
- **Pending invitations:** ${ctx.users.pendingInvitations}
- **Deactivated:** ${ctx.users.deactivated}
- **Guest users:** ${ctx.users.guestUsers}
- **Inactive (total):** ${ctx.inactiveUsers.totalAffected}

**By role:** Admins ${ctx.users.byRole.orgAdmins + ctx.users.byRole.operationalAdmins} | Team admins ${ctx.users.byRole.teamAdmins} | Members ${ctx.users.byRole.members}

**Would you like to:** Promote users | Review inactive accounts | Approve license requests
[Go to All Users →](#/AllUsers)`,
  },
  {
    match: (q) => /product|add.?on|integration|app|marketplace/i.test(q),
    topic: null,
    response: `**Products & Integrations**

${productList}

**${ctx.integrations.active} integrations active:** ${ctx.integrations.list.slice(0, 6).join(", ")}...

**Would you like to:** Review integration permissions | Manage add-ons
[Go to Products →](#/Products)`,
  },
  {
    match: (q) => /training|compliance|legal/i.test(q),
    topic: null,
    response: `**Compliance & Training**

- Next training: **${ctx.compliance.nextTrainingScheduled}**
- Completion: **${ctx.compliance.completionRate}**
- ⚠️ ${ctx.compliance.nonCompliantNote}
- Legal pending: ${ctx.ai.legalReview.pendingItems.join(", ")}

**Would you like to:** Send training reminders | Generate compliance report | Review legal status
[Go to Settings →](#/Settings)`,
  },
  {
    match: (q) => /search.*link|find.*setting|where.*setting|navigate|go to/i.test(q),
    topic: null,
    response: `Quick links:

- [All Users](#/AllUsers) | [Teams](#/Teams) | [Products](#/Products)
- [Security Settings](#/Settings) | [AI Capabilities](#/MiroAI/Capabilities)
- [Data Usage](#/MiroAI/DataUsage) | [Profile](#/Profile)

Or tell me what setting you're looking for.`,
  },
  {
    match: (q) => /help|what can you|how do|how to|support/i.test(q),
    topic: null,
    response: `I'm your **Admin Sidekick** for **${ctx.org.name}**. I can help with:

**Bulk Operations** — Update teams, users, licenses, boards
**Analytics** — Top users, templates, credits, AI usage
**Search Links** — Navigate to any admin setting
**Audit Log** — Review recent activity and events
**Help Center** — Setup guides for MCP, security, AI, compliance

What would you like to explore?`,
  },
  {
    match: (q) => /^(hi|hello|hey|morning|afternoon)\b/i.test(q),
    topic: null,
    response: `Hi! I'm your Admin Sidekick for **${ctx.org.name}**.

Here's what needs attention:
- **${ctx.inactiveUsers.totalAffected} inactive users** — potential license reclaim
- **${ctx.licensing.availableSeats} seats remaining** (${ctx.licensing.newHiresPerQuarter} new hires expected)
- **${singleAdminTeams.length} teams** with a single admin (risk)
- **${audit.failedLogins.total} failed logins** in the audit log
- **${ctx.flaggedBoards.length} flagged boards** with security concerns

What would you like to look into?`,
  },
];

// ── Follow-up response handlers ──

const FOLLOW_UPS: Array<{
  topics: ConversationTopic[];
  match: (input: string) => boolean;
  response: (state: ConversationState) => string;
}> = [
  // "All" confirmation for team visibility
  {
    topics: ["team-visibility"],
    match: (q) => /\ball\b|all.*team|every|proceed|yes|confirm/i.test(q),
    response: () => {
      const totalMembers = publicTeams.reduce((s, t) => s + t.members, 0);
      return `**Intent Preview — Set ${publicTeams.length} Teams to Private**

${publicTeams.map((t) => `- **${t.name}** (${t.members} members) — Public → **Private**`).join("\n")}

**Impact:** ${publicTeams.length} teams, **${totalMembers} members** affected. Teams will no longer be discoverable by non-members, but existing members retain access.

**Ready to proceed?**
- [Apply changes →](#/Teams) — update all ${publicTeams.length} teams
- Let me **adjust the list** first
- [Go to Teams page →](#/Teams) to do it manually`;
    },
  },
  // Specific team names for team visibility
  {
    topics: ["team-visibility"],
    match: (q) => /marketing|sales|customer|people|hr|research|product design|product management/i.test(q),
    response: (_state: ConversationState) => {
      const mentioned = publicTeams.filter((t) =>
        /marketing/i.test(t.name) || /sales/i.test(t.name) || /customer/i.test(t.name) ||
        /people|hr/i.test(t.name) || /research/i.test(t.name) || /product design/i.test(t.name) ||
        /product management/i.test(t.name)
      );
      const matched = mentioned.length > 0 ? mentioned : publicTeams.slice(0, 3);
      const totalMembers = matched.reduce((s, t) => s + t.members, 0);
      return `**Intent Preview — Set ${matched.length} Teams to Private**

${matched.map((t) => `- **${t.name}** (${t.members} members) — Public → **Private**`).join("\n")}

**Impact:** ${matched.length} teams, **${totalMembers} members** affected.

**Ready to proceed?**
- [Apply changes →](#/Teams)
- Add or remove teams from this list
- [Go to Teams page →](#/Teams) to review manually`;
    },
  },
  // "All" for license requests
  {
    topics: ["license-requests"],
    match: (q) => /\ball\b|approve.*all|every|proceed|yes/i.test(q),
    response: () => `**Intent Preview — Approve All ${ctx.licenseRequests.length} License Requests**

${ctx.licenseRequests.map((r) => `- **${r.name}** — ${r.team}, requested ${r.requestDate} → Full Member`).join("\n")}

**Impact:** ${ctx.licenseRequests.length} users promoted to Full Member. Seats used: ${ctx.licensing.usedSeats} → **${ctx.licensing.usedSeats + ctx.licenseRequests.length}** / ${ctx.licensing.totalSeats}.

**Ready to proceed?**
- [Approve all →](#/AllUsers)
- Review individually first
- [Go to All Users →](#/AllUsers)`,
  },
  // "All" for license promotion
  {
    topics: ["license-promote"],
    match: (q) => /\ball\b|promote.*all|every|proceed|yes/i.test(q),
    response: () => `**Intent Preview — Promote ${freeRestrictedUsers.length} Users to Full Member**

${freeRestrictedUsers.map((u) => `- **${u.name}** — ${u.team} (${u.region}) → Full Member`).join("\n")}

**Impact:** ${freeRestrictedUsers.length} users gain full ${ctx.org.plan} access. Seats: ${ctx.licensing.usedSeats} → **${ctx.licensing.usedSeats + freeRestrictedUsers.length}** / ${ctx.licensing.totalSeats}.

**Ready to proceed?**
- [Promote all →](#/AllUsers)
- Filter to **active users only** first
- [Go to All Users →](#/AllUsers)`,
  },
  // Assign backup admins for single-admin teams
  {
    topics: ["single-admin"],
    match: (q) => /assign|backup|promote|add.*admin/i.test(q),
    response: () => `**Recommended Backup Admins**

Based on activity and tenure, here are my suggestions:

- **Marketing** — Sarah Chen → recommend **Oliver Strand** (Senior member)
- **Sales** — Marcus Johnson → recommend **James Okafor** (Senior member)
- **Customer Success** — Arianna Savant → recommend **Aisha Khan** (Active member)
- **Data Science** — Kumar Bhaskar → recommend **Ling Wei** (Active member)
- **People & HR** — Norah Shi → recommend **Tara Singh** (Active member)
- **Legal & Compliance** — Boris Borodianskii → (review needed)
- **Finance** — Deepa Nair → recommend **Marco Bianchi** (Active member)
- **Research — UXR** — Lena Virtanen → recommend **Eva Lindström** (Active member)

**Would you like to:**
- [Promote all recommended →](#/Teams) as team admins
- Adjust any of the recommendations
- Send the solo admins a **notification** to pick their own backup`,
  },
  // Send reminder for single-admin teams
  {
    topics: ["single-admin"],
    match: (q) => /remind|notify|send|email/i.test(q),
    response: () => `**Send Reminder to Solo Admins**

I'll send a notification to these ${singleAdminTeams.length} admins asking them to nominate a backup:

${singleAdminTeams.map((t) => `- **${t.admins[0]}** (${t.name})`).join("\n")}

The notification will ask them to:
1. Choose a team member to promote as backup admin
2. Confirm within 7 days

**Ready to send?**
- [Send reminders →](#/Teams)
- Customize the message first
- [Go to Teams →](#/Teams) to manage manually`,
  },
  // By region drill-down for analytics
  {
    topics: ["top-users"],
    match: (q) => /by.*region|region|amer|emea|apac/i.test(q),
    response: () => `**Top Users by Region**

**AMER** (${ctx.analytics.byRegion.amer.sessions} sessions)
- **Rosanna Knottenbelt** — 39 sign-ins, Leadership / Exec
- **Jamie Neely** — 26 sign-ins, Engineering — AMER
- **Vihar Parikh** — 24 sign-ins, Product Management

**EMEA** (${ctx.analytics.byRegion.emea.sessions} sessions)
- **Vitaly Selkin** — 27 sign-ins, Product Management
- **Hans Mueller** — 18 sign-ins, Product Design — EMEA
- **Lars Svensson** — 16 sign-ins, Engineering — EMEA

**APAC** (${ctx.analytics.byRegion.apac.sessions} sessions)
- **Yuki Tanaka** — 15 sign-ins, Product Design — APAC
- **Kenji Sato** — 14 sign-ins, Engineering — APAC
- **Priya Sharma** — 12 sign-ins, Product Design — APAC

**Would you like to:** Identify champion users | See usage trends | View inactive users by region`,
  },
  // Lock accounts for failed logins
  {
    topics: ["failed-logins"],
    match: (q) => /lock|block|disable|suspend/i.test(q),
    response: () => {
      const highRisk = audit.failedLogins.topAccounts.filter((a) => a.attempts > 30);
      return `**Intent Preview — Lock ${highRisk.length} High-Risk Accounts**

${highRisk.map((a) => `- **${a.name}** — ${a.attempts} failed attempts → **Locked**`).join("\n")}

Locked accounts will require an admin to unlock them. Users will be notified via email.

**Ready to proceed?**
- [Lock accounts →](#/Settings)
- Review IP addresses first
- [Go to Security Settings →](#/Settings)`;
    },
  },
  // Revoke public links for insecure boards
  {
    topics: ["insecure-boards"],
    match: (q) => /revoke|remove.*link|disable.*link|public.*link/i.test(q),
    response: () => {
      const publicLinkBoards = ctx.flaggedBoards.filter((b) => b.sharing === "public-link");
      return `**Intent Preview — Revoke Public Links**

${publicLinkBoards.map((b) => `- **${b.name}** (${b.team}) — ${b.classification}, owner: ${b.owner} → **Link removed**`).join("\n")}

**Impact:** ${publicLinkBoards.length} public links will be disabled. Anyone with the old link will lose access.

**Ready to proceed?**
- [Revoke all public links →](#/Settings)
- Notify board owners first
- [Go to Settings →](#/Settings) to review individually`;
    },
  },
];

const DEFAULT_RESPONSE = `I can help with that! Here's what I specialize in:

**Bulk Operations** — "update team settings", "promote users"
**Analytics** — "who is the top user", "how are credits used"
**Search Links** — "go to board sharing settings", "find MCP settings"
**Audit Log** — "what happened last week", "show failed logins"
**Help Center** — "how to set up MCPs", "how to enable secure login"

Try asking something specific, or click the input field for guided suggestions.`;

// ── Response resolution with context ──

// Category label → sub-item suggestions (shown as askUser in chat)
const CATEGORY_SUGGESTIONS: Record<string, { intro: string; items: { text: string; query: string }[] }> = {
  "Bulk Operations": {
    intro: "Here's what I can help you with for bulk operations:",
    items: [
      { text: "Update team settings — public to private", query: "How do I bulk update team settings from public to private?" },
      { text: "Change board sharing options", query: "How do I change board sharing options across teams?" },
      { text: "Promote users to full or advanced licenses", query: "How do I promote users to full or advanced licenses?" },
      { text: "Approve pending license requests", query: "How do I approve all pending license requests?" },
      { text: "Review insecure boards with sensitive content", query: "How do I review all insecure boards with sensitive content?" },
    ],
  },
  "Analytics": {
    intro: "Here are the analytics I can pull for you:",
    items: [
      { text: "Who is the top user in this org?", query: "Who is the top user in this org?" },
      { text: "What is the most used template?", query: "What is the most used template?" },
      { text: "How have credits been used?", query: "How have credits been used?" },
      { text: "What AI feature is used the most?", query: "What AI feature is used the most?" },
    ],
  },
  "Search Links": {
    intro: "I can help you navigate to any setting:",
    items: [
      { text: "Go to public board sharing settings", query: "Go to public board sharing settings" },
      { text: "Roles and permissions — Allow Co-owner role", query: "Where is the setting for allowing Co-owner role?" },
      { text: "Allow users to connect Miro to MCP clients", query: "Where is the setting to allow MCP-compatible clients?" },
      { text: "SIEM — Connect audit log to your SIEM", query: "How do I connect SIEM to aggregate audit logs?" },
      { text: "Search teams that are private", query: "Show me all teams that are set to private" },
      { text: "Search teams with a single admin", query: "Show me teams with only one admin" },
    ],
  },
  "Audit Log": {
    intro: "Here's what I can look up in the audit log:",
    items: [
      { text: "Review what happened last week", query: "Show me the audit log for last week" },
      { text: "How many boards were created recently?", query: "How many boards were created recently?" },
      { text: "Show failed login attempts", query: "Show failed login attempts" },
      { text: "Show recent admin actions", query: "Show recent admin actions from the audit log" },
    ],
  },
  "Help Center": {
    intro: "I can guide you through setup and configuration:",
    items: [
      { text: "How to set up MCPs", query: "How do I set up MCPs for my organization?" },
      { text: "How to enable secure login", query: "How do I enable secure login for my organization?" },
      { text: "How to configure AI settings securely", query: "How do I configure AI settings securely?" },
      { text: "Follow my company's compliance guidelines", query: "How do I follow my company's compliance guidelines in Miro?" },
    ],
  },
};

type GetResponseResult = {
  text: string;
  newTopic: ConversationTopic;
  toolInvocations?: Message["toolInvocations"];
};

function getResponse(
  input: string,
  conversationState: ConversationState
): GetResponseResult {
  // 0. Check category label matches (from GuidedStartPage)
  const categorySuggestion = CATEGORY_SUGGESTIONS[input];
  if (categorySuggestion) {
    return {
      text: categorySuggestion.intro,
      newTopic: null,
      toolInvocations: [{
        toolName: "askUser",
        args: {
          questions: [{
            question: "Pick one to get started:",
            suggestions: categorySuggestion.items.map(i => i.text),
          }],
        },
      }],
    };
  }

  // 1. Check follow-ups first (if there's an active topic)
  if (conversationState.lastTopic && conversationState.awaitingSelection) {
    for (const followUp of FOLLOW_UPS) {
      if (
        followUp.topics.includes(conversationState.lastTopic) &&
        followUp.match(input)
      ) {
        return {
          text: followUp.response(conversationState),
          newTopic: conversationState.lastTopic,
        };
      }
    }
  }

  // 2. Check primary responses
  for (const entry of RESPONSES) {
    if (entry.match(input)) {
      return { text: entry.response, newTopic: entry.topic };
    }
  }

  // 3. Default
  return { text: DEFAULT_RESPONSE, newTopic: null };
}

// ── Hook ──

export function useAgent(
  _onToolCall?: ToolHandler,
  _getCanvasState?: () => unknown,
  _getUserEdits?: () => unknown,
  _onTitleGenerated?: (title: string) => void,
  _getWorkspaceContext?: () => unknown
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef(false);
  const conversationRef = useRef<ConversationState>({
    lastTopic: null,
    lastDataShown: null,
    awaitingSelection: false,
  });

  const append = useCallback(
    async (message: { role: "user"; content: string }) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message.content,
      };

      const { text: fullText, newTopic, toolInvocations } = getResponse(
        message.content,
        conversationRef.current
      );

      // Update conversation state
      conversationRef.current = {
        lastTopic: newTopic,
        lastDataShown: fullText.includes("- **") ? "list" : null,
        awaitingSelection: newTopic !== null,
      };

      const assistantId = `assistant-${Date.now()}`;

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      abortRef.current = false;

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      const words = fullText.split(/(\s+)/);
      let streamed = "";
      for (let i = 0; i < words.length; i++) {
        if (abortRef.current) break;
        streamed += words[i];
        const text = streamed;
                  setMessages((prev) =>
                    prev.map((m) =>
            m.id === assistantId ? { ...m, content: text } : m
          )
        );
        await new Promise((r) => setTimeout(r, 18 + Math.random() * 12));
      }

      // Attach tool invocations (e.g. askUser suggestions) after streaming
      if (toolInvocations && toolInvocations.length > 0) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, toolInvocations } : m
          )
        );
      }

        setIsLoading(false);
    },
    [messages]
  );

  return { messages, append, isLoading, setMessages };
}
