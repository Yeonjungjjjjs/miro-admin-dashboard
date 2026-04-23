import {
  IconLightning,
  IconChartBarY,
  IconLink,
  IconListBullets,
  IconQuestionMark,
} from "@mirohq/design-system-icons";

export interface GuidedItem {
  text: string;
  query: string;
}

export interface Category {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  items: GuidedItem[];
}

export const CATEGORIES: Category[] = [
  {
    id: "bulk",
    label: "Bulk Operations",
    description: "Update teams, users, and boards in bulk",
    icon: <IconLightning />,
    items: [
      { text: "Update team settings — public to private", query: "How do I bulk update team settings from public to private?" },
      { text: "Change board sharing options", query: "How do I change board sharing options across teams?" },
      { text: "Promote users to full or advanced licenses", query: "How do I promote users to full or advanced licenses?" },
      { text: "Approve pending license requests", query: "How do I approve all pending license requests?" },
      { text: "Review insecure boards with sensitive content", query: "How do I review all insecure boards with sensitive content?" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Usage insights, top users, and trends",
    icon: <IconChartBarY />,
    items: [
      { text: "Who is the top user in this org?", query: "Who is the top user in this org?" },
      { text: "What is the most used template?", query: "What is the most used template?" },
      { text: "How have credits been used?", query: "How have credits been used?" },
      { text: "What AI feature is used the most?", query: "What AI feature is used the most?" },
    ],
  },
  {
    id: "search",
    label: "Search Links",
    description: "Navigate to settings, teams, and policies",
    icon: <IconLink />,
    items: [
      { text: "Go to public board sharing settings", query: "Go to public board sharing settings" },
      { text: "Roles and permissions — Allow Co-owner role", query: "Where is the setting for allowing Co-owner role?" },
      { text: "Allow users to connect Miro to MCP clients", query: "Where is the setting to allow MCP-compatible clients?" },
      { text: "SIEM — Connect audit log to your SIEM", query: "How do I connect SIEM to aggregate audit logs?" },
      { text: "Search teams that are private", query: "Show me all teams that are set to private" },
      { text: "Search teams with a single admin", query: "Show me teams with only one admin" },
    ],
  },
  {
    id: "audit",
    label: "Audit Log",
    description: "Review recent activity and events",
    icon: <IconListBullets />,
    items: [
      { text: "Review what happened last week", query: "Show me the audit log for last week" },
      { text: "How many boards were created recently?", query: "How many boards were created recently?" },
      { text: "Show failed login attempts", query: "Show failed login attempts" },
      { text: "Show recent admin actions", query: "Show recent admin actions from the audit log" },
    ],
  },
  {
    id: "help",
    label: "Help Center",
    description: "Guides for setup, security, and compliance",
    icon: <IconQuestionMark />,
    items: [
      { text: "How to set up MCPs", query: "How do I set up MCPs for my organization?" },
      { text: "How to enable secure login", query: "How do I enable secure login for my organization?" },
      { text: "How to configure AI settings securely", query: "How do I configure AI settings securely?" },
      { text: "Follow my company's compliance guidelines", query: "How do I follow my company's compliance guidelines in Miro?" },
    ],
  },
];
