// ===== SPACES DATA MODEL =====
window.SPACES = {
  currentSpaceId: null,

  allUsers: [
    { name: 'Emily Carter', email: 'emily.carter@samplemail.com', avatar: 'https://i.pravatar.cc/72?u=emily', license: 'Full' },
    { name: 'Michael Johnson', email: 'michael.j@webmail.com', avatar: 'https://i.pravatar.cc/72?u=michael', license: 'Full' },
    { name: 'Sophia Davis', email: 'sophia.d@domainmail.com', avatar: 'https://i.pravatar.cc/72?u=sophia', license: 'Full' },
    { name: 'Daniel Smith', email: 'daniel.smith@customemail.com', avatar: 'https://i.pravatar.cc/72?u=daniel', license: 'Full' },
    { name: 'Olivia Brown', email: 'olivia.b@personalmail.com', avatar: 'https://i.pravatar.cc/72?u=olivia', license: 'Full' },
    { name: 'James Wilson', email: 'james.w@myemail.com', avatar: 'https://i.pravatar.cc/72?u=james', license: 'Full' },
    { name: 'Ava Miller', email: 'ava.miller@mailbox.com', avatar: 'https://i.pravatar.cc/72?u=ava', license: 'Full' },
    { name: 'Quinn Odom', email: 'quinn.odom@acme.com', avatar: 'https://i.pravatar.cc/72?u=quinn', license: 'Full' },
    { name: 'Jordan Bell', email: 'jordan.bell@acme.com', avatar: 'https://i.pravatar.cc/72?u=jordan', license: 'Full' },
    { name: 'Skylar Luna', email: 'skylar.luna@acme.com', avatar: 'https://i.pravatar.cc/72?u=skylar', license: 'Full' },
    { name: 'Jamie Stern', email: 'jamie.stern@acme.com', avatar: 'https://i.pravatar.cc/72?u=jamie', license: 'Basic' },
    { name: 'Avery Park', email: 'avery.park@acme.com', avatar: 'https://i.pravatar.cc/72?u=avery', license: 'Basic' },
    { name: 'Riley Chen', email: 'riley.chen@acme.com', avatar: 'https://i.pravatar.cc/72?u=riley', license: 'Full' },
    { name: 'Morgan Lee', email: 'morgan.lee@acme.com', avatar: 'https://i.pravatar.cc/72?u=morgan', license: 'Full' },
    { name: 'Casey Brooks', email: 'casey.brooks@acme.com', avatar: 'https://i.pravatar.cc/72?u=casey', license: 'Basic' }
  ],

  allContent: [
    { name: 'Sprint Planning Board', type: 'Board', owner: 'Emily Carter', ownerAvatar: 'https://i.pravatar.cc/72?u=emily', classification: 'Internal' },
    { name: 'User Flow Diagram', type: 'Diagram', owner: 'James Wilson', ownerAvatar: 'https://i.pravatar.cc/72?u=james', classification: 'Confidential' },
    { name: 'Homepage Prototype', type: 'Prototype', owner: 'Sophia Davis', ownerAvatar: 'https://i.pravatar.cc/72?u=sophia', classification: 'Internal' },
    { name: 'PRD: Search Feature', type: 'Doc', owner: 'Daniel Smith', ownerAvatar: 'https://i.pravatar.cc/72?u=daniel', classification: 'Confidential' },
    { name: 'Customer Metrics', type: 'Data Table', owner: 'Quinn Odom', ownerAvatar: 'https://i.pravatar.cc/72?u=quinn', classification: 'Confidential' },
    { name: 'Competitor Analysis Board', type: 'Board', owner: 'Jordan Bell', ownerAvatar: 'https://i.pravatar.cc/72?u=jordan', classification: 'Internal' },
    { name: 'Architecture Diagram', type: 'Diagram', owner: 'Michael Johnson', ownerAvatar: 'https://i.pravatar.cc/72?u=michael', classification: 'Internal' },
    { name: 'Mobile App Prototype', type: 'Prototype', owner: 'Olivia Brown', ownerAvatar: 'https://i.pravatar.cc/72?u=olivia', classification: 'Confidential' },
    { name: 'Team Handbook', type: 'Doc', owner: 'Ava Miller', ownerAvatar: 'https://i.pravatar.cc/72?u=ava', classification: 'Public' },
    { name: 'OKR Tracker', type: 'Data Table', owner: 'Skylar Luna', ownerAvatar: 'https://i.pravatar.cc/72?u=skylar', classification: 'Internal' },
    { name: 'Wireframes Board', type: 'Board', owner: 'Sophia Davis', ownerAvatar: 'https://i.pravatar.cc/72?u=sophia', classification: 'Internal' },
    { name: 'ER Diagram', type: 'Diagram', owner: 'Riley Chen', ownerAvatar: 'https://i.pravatar.cc/72?u=riley', classification: 'Confidential' },
    { name: 'Onboarding Flow Prototype', type: 'Prototype', owner: 'Morgan Lee', ownerAvatar: 'https://i.pravatar.cc/72?u=morgan', classification: 'Internal' },
    { name: 'API Documentation', type: 'Doc', owner: 'James Wilson', ownerAvatar: 'https://i.pravatar.cc/72?u=james', classification: 'Public' },
    { name: 'Revenue Dashboard', type: 'Data Table', owner: 'Casey Brooks', ownerAvatar: 'https://i.pravatar.cc/72?u=casey', classification: 'Confidential' },
    { name: 'Brainstorm Board', type: 'Board', owner: 'Jamie Stern', ownerAvatar: 'https://i.pravatar.cc/72?u=jamie', classification: 'Public' },
    { name: 'Network Topology', type: 'Diagram', owner: 'Daniel Smith', ownerAvatar: 'https://i.pravatar.cc/72?u=daniel', classification: 'Confidential' },
    { name: 'Checkout Prototype', type: 'Prototype', owner: 'Emily Carter', ownerAvatar: 'https://i.pravatar.cc/72?u=emily', classification: 'Internal' },
    { name: 'Release Notes', type: 'Doc', owner: 'Avery Park', ownerAvatar: 'https://i.pravatar.cc/72?u=avery', classification: 'Public' },
    { name: 'Bug Tracker', type: 'Data Table', owner: 'Michael Johnson', ownerAvatar: 'https://i.pravatar.cc/72?u=michael', classification: 'Internal' }
  ],

  spaces: [
    {
      id: 'space-1',
      name: 'Q3 Product Roadmap',
      type: 'Roadmap',
      owner: 'Emily Carter', ownerAvatar: 'https://i.pravatar.cc/72?u=emily',
      access: [
        { name: 'Emily Carter', avatar: 'https://i.pravatar.cc/72?u=emily', entityType: 'User', role: 'Editor' },
        { name: 'Daniel Smith', avatar: 'https://i.pravatar.cc/72?u=daniel', entityType: 'User', role: 'Editor' },
        { name: 'Quinn Odom', avatar: 'https://i.pravatar.cc/72?u=quinn', entityType: 'User', role: 'Viewer' },
        { name: 'Jordan Bell', avatar: 'https://i.pravatar.cc/72?u=jordan', entityType: 'User', role: 'Viewer' },
        { name: 'Skylar Luna', avatar: 'https://i.pravatar.cc/72?u=skylar', entityType: 'User', role: 'Commenter' },
        { name: 'Product Team', initials: 'PT', entityType: 'Team', role: 'Editor' },
        { name: 'Engineering Team', initials: 'ET', entityType: 'Team', role: 'Viewer' },
        { name: 'Leadership', initials: 'LD', entityType: 'User group', role: 'Viewer' }
      ],
      content: [
        { name: 'Sprint Planning Board', type: 'Board', owner: 'Emily Carter', ownerAvatar: 'https://i.pravatar.cc/72?u=emily', section: 'Planning', classification: 'Internal' },
        { name: 'User Flow Diagram', type: 'Diagram', owner: 'James Wilson', ownerAvatar: 'https://i.pravatar.cc/72?u=james', section: 'Design', classification: 'Confidential' },
        { name: 'PRD: Search Feature', type: 'Doc', owner: 'Daniel Smith', ownerAvatar: 'https://i.pravatar.cc/72?u=daniel', section: 'Planning', classification: 'Confidential' },
        { name: 'OKR Tracker', type: 'Data Table', owner: 'Skylar Luna', ownerAvatar: 'https://i.pravatar.cc/72?u=skylar', section: 'Tracking', classification: 'Internal' },
        { name: 'Competitor Analysis Board', type: 'Board', owner: 'Jordan Bell', ownerAvatar: 'https://i.pravatar.cc/72?u=jordan', section: 'Research', classification: 'Internal' }
      ]
    },
    {
      id: 'space-2',
      name: 'Mobile App Redesign',
      type: 'Design',
      owner: 'Sophia Davis', ownerAvatar: 'https://i.pravatar.cc/72?u=sophia',
      access: [
        { name: 'Sophia Davis', avatar: 'https://i.pravatar.cc/72?u=sophia', entityType: 'User', role: 'Editor' },
        { name: 'Olivia Brown', avatar: 'https://i.pravatar.cc/72?u=olivia', entityType: 'User', role: 'Editor' },
        { name: 'James Wilson', avatar: 'https://i.pravatar.cc/72?u=james', entityType: 'User', role: 'Editor' },
        { name: 'Emily Carter', avatar: 'https://i.pravatar.cc/72?u=emily', entityType: 'User', role: 'Viewer' },
        { name: 'Design Team', initials: 'DT', entityType: 'Team', role: 'Editor' },
        { name: 'QA Team', initials: 'QA', entityType: 'Team', role: 'Viewer' },
        { name: 'EMEA Designers', initials: 'ED', entityType: 'User group', role: 'Viewer' }
      ],
      content: [
        { name: 'Wireframes Board', type: 'Board', owner: 'Sophia Davis', ownerAvatar: 'https://i.pravatar.cc/72?u=sophia', section: 'Exploration', classification: 'Internal' },
        { name: 'Mobile App Prototype', type: 'Prototype', owner: 'Olivia Brown', ownerAvatar: 'https://i.pravatar.cc/72?u=olivia', section: 'Prototyping', classification: 'Confidential' },
        { name: 'User Flow Diagram', type: 'Diagram', owner: 'James Wilson', ownerAvatar: 'https://i.pravatar.cc/72?u=james', section: 'Exploration', classification: 'Internal' },
        { name: 'Homepage Prototype', type: 'Prototype', owner: 'Sophia Davis', ownerAvatar: 'https://i.pravatar.cc/72?u=sophia', section: 'Prototyping', classification: 'Internal' },
        { name: 'Design Specs', type: 'Doc', owner: 'Olivia Brown', ownerAvatar: 'https://i.pravatar.cc/72?u=olivia', section: 'Handoff', classification: 'Internal' },
        { name: 'Component Inventory', type: 'Data Table', owner: 'James Wilson', ownerAvatar: 'https://i.pravatar.cc/72?u=james', section: 'Exploration', classification: 'Public' }
      ]
    },
    {
      id: 'space-3',
      name: 'User Research Q3',
      type: 'Research',
      owner: 'Ava Miller', ownerAvatar: 'https://i.pravatar.cc/72?u=ava',
      access: [
        { name: 'Ava Miller', avatar: 'https://i.pravatar.cc/72?u=ava', entityType: 'User', role: 'Editor' },
        { name: 'Morgan Lee', avatar: 'https://i.pravatar.cc/72?u=morgan', entityType: 'User', role: 'Editor' },
        { name: 'Casey Brooks', avatar: 'https://i.pravatar.cc/72?u=casey', entityType: 'User', role: 'Viewer' },
        { name: 'Research Team', initials: 'RT', entityType: 'Team', role: 'Editor' },
        { name: 'Product Managers', initials: 'PM', entityType: 'User group', role: 'Viewer' }
      ],
      content: [
        { name: 'Interview Notes Board', type: 'Board', owner: 'Ava Miller', ownerAvatar: 'https://i.pravatar.cc/72?u=ava', section: 'Interviews', classification: 'Confidential' },
        { name: 'Affinity Diagram', type: 'Diagram', owner: 'Morgan Lee', ownerAvatar: 'https://i.pravatar.cc/72?u=morgan', section: 'Analysis', classification: 'Confidential' },
        { name: 'Research Findings', type: 'Doc', owner: 'Ava Miller', ownerAvatar: 'https://i.pravatar.cc/72?u=ava', section: 'Synthesis', classification: 'Internal' },
        { name: 'Participant Tracker', type: 'Data Table', owner: 'Casey Brooks', ownerAvatar: 'https://i.pravatar.cc/72?u=casey', section: 'Recruitment', classification: 'Confidential' }
      ]
    },
    {
      id: 'space-4',
      name: 'Engineering Onboarding',
      type: 'People',
      owner: 'Michael Johnson', ownerAvatar: 'https://i.pravatar.cc/72?u=michael',
      access: [
        { name: 'Michael Johnson', avatar: 'https://i.pravatar.cc/72?u=michael', entityType: 'User', role: 'Editor' },
        { name: 'Riley Chen', avatar: 'https://i.pravatar.cc/72?u=riley', entityType: 'User', role: 'Editor' },
        { name: 'Daniel Smith', avatar: 'https://i.pravatar.cc/72?u=daniel', entityType: 'User', role: 'Viewer' },
        { name: 'Jamie Stern', avatar: 'https://i.pravatar.cc/72?u=jamie', entityType: 'User', role: 'Viewer' },
        { name: 'Avery Park', avatar: 'https://i.pravatar.cc/72?u=avery', entityType: 'User', role: 'Viewer' },
        { name: 'Engineering Team', initials: 'ET', entityType: 'Team', role: 'Editor' },
        { name: 'Backend Team', initials: 'BT', entityType: 'Team', role: 'Editor' },
        { name: 'Frontend Team', initials: 'FT', entityType: 'Team', role: 'Editor' },
        { name: 'DevOps Team', initials: 'DO', entityType: 'Team', role: 'Viewer' },
        { name: 'Engineering Managers', initials: 'EM', entityType: 'User group', role: 'Editor' },
        { name: 'New Hires Q3', initials: 'NH', entityType: 'User group', role: 'Viewer' },
        { name: 'HR Team', initials: 'HR', entityType: 'User group', role: 'Viewer' }
      ],
      content: [
        { name: 'Team Handbook', type: 'Doc', owner: 'Michael Johnson', ownerAvatar: 'https://i.pravatar.cc/72?u=michael', section: 'Getting Started', classification: 'Public' },
        { name: 'Architecture Diagram', type: 'Diagram', owner: 'Riley Chen', ownerAvatar: 'https://i.pravatar.cc/72?u=riley', section: 'Technical', classification: 'Internal' },
        { name: 'Onboarding Checklist', type: 'Board', owner: 'Michael Johnson', ownerAvatar: 'https://i.pravatar.cc/72?u=michael', section: 'Getting Started', classification: 'Public' }
      ]
    },
    {
      id: 'space-5',
      name: 'Brand Identity Refresh',
      type: 'Design',
      owner: 'Olivia Brown', ownerAvatar: 'https://i.pravatar.cc/72?u=olivia',
      access: [
        { name: 'Olivia Brown', avatar: 'https://i.pravatar.cc/72?u=olivia', entityType: 'User', role: 'Editor' },
        { name: 'Sophia Davis', avatar: 'https://i.pravatar.cc/72?u=sophia', entityType: 'User', role: 'Editor' },
        { name: 'Morgan Lee', avatar: 'https://i.pravatar.cc/72?u=morgan', entityType: 'User', role: 'Viewer' },
        { name: 'Design Team', initials: 'DT', entityType: 'Team', role: 'Editor' },
        { name: 'Marketing Team', initials: 'MT', entityType: 'Team', role: 'Viewer' },
        { name: 'Brand Committee', initials: 'BC', entityType: 'User group', role: 'Viewer' }
      ],
      content: [
        { name: 'Moodboard', type: 'Board', owner: 'Olivia Brown', ownerAvatar: 'https://i.pravatar.cc/72?u=olivia', section: 'Inspiration', classification: 'Internal' },
        { name: 'Logo Exploration Board', type: 'Board', owner: 'Sophia Davis', ownerAvatar: 'https://i.pravatar.cc/72?u=sophia', section: 'Logo', classification: 'Confidential' },
        { name: 'Color System', type: 'Data Table', owner: 'Olivia Brown', ownerAvatar: 'https://i.pravatar.cc/72?u=olivia', section: 'Foundations', classification: 'Internal' },
        { name: 'Typography Exploration', type: 'Board', owner: 'Sophia Davis', ownerAvatar: 'https://i.pravatar.cc/72?u=sophia', section: 'Foundations', classification: 'Internal' },
        { name: 'Brand Guidelines', type: 'Doc', owner: 'Olivia Brown', ownerAvatar: 'https://i.pravatar.cc/72?u=olivia', section: 'Deliverables', classification: 'Public' },
        { name: 'Presentation Template', type: 'Prototype', owner: 'Morgan Lee', ownerAvatar: 'https://i.pravatar.cc/72?u=morgan', section: 'Deliverables', classification: 'Public' }
      ]
    },
    {
      id: 'space-6',
      name: 'Customer Journey Mapping',
      type: 'Research',
      owner: 'Ava Miller', ownerAvatar: 'https://i.pravatar.cc/72?u=ava',
      access: [
        { name: 'Ava Miller', avatar: 'https://i.pravatar.cc/72?u=ava', entityType: 'User', role: 'Editor' },
        { name: 'Quinn Odom', avatar: 'https://i.pravatar.cc/72?u=quinn', entityType: 'User', role: 'Editor' },
        { name: 'Jordan Bell', avatar: 'https://i.pravatar.cc/72?u=jordan', entityType: 'User', role: 'Viewer' },
        { name: 'Casey Brooks', avatar: 'https://i.pravatar.cc/72?u=casey', entityType: 'User', role: 'Viewer' },
        { name: 'CX Team', initials: 'CX', entityType: 'Team', role: 'Editor' },
        { name: 'Product Team', initials: 'PT', entityType: 'Team', role: 'Viewer' },
        { name: 'Support Leads', initials: 'SL', entityType: 'User group', role: 'Viewer' }
      ],
      content: [
        { name: 'Journey Map Board', type: 'Board', owner: 'Ava Miller', ownerAvatar: 'https://i.pravatar.cc/72?u=ava', section: 'Mapping', classification: 'Internal' },
        { name: 'Touchpoint Diagram', type: 'Diagram', owner: 'Quinn Odom', ownerAvatar: 'https://i.pravatar.cc/72?u=quinn', section: 'Mapping', classification: 'Internal' },
        { name: 'Pain Points Tracker', type: 'Data Table', owner: 'Jordan Bell', ownerAvatar: 'https://i.pravatar.cc/72?u=jordan', section: 'Analysis', classification: 'Confidential' },
        { name: 'Recommendations Doc', type: 'Doc', owner: 'Ava Miller', ownerAvatar: 'https://i.pravatar.cc/72?u=ava', section: 'Outcomes', classification: 'Internal' },
        { name: 'Service Blueprint', type: 'Diagram', owner: 'Casey Brooks', ownerAvatar: 'https://i.pravatar.cc/72?u=casey', section: 'Mapping', classification: 'Internal' },
        { name: 'Q4 Priorities Board', type: 'Board', owner: 'Quinn Odom', ownerAvatar: 'https://i.pravatar.cc/72?u=quinn', section: 'Planning', classification: 'Internal' },
        { name: 'Initiative Timeline', type: 'Board', owner: 'Ava Miller', ownerAvatar: 'https://i.pravatar.cc/72?u=ava', section: 'Planning', classification: 'Confidential' }
      ]
    },
    {
      id: 'space-7',
      name: 'Platform Migration Plan',
      type: 'Roadmap',
      owner: 'Riley Chen', ownerAvatar: 'https://i.pravatar.cc/72?u=riley',
      access: [
        { name: 'Riley Chen', avatar: 'https://i.pravatar.cc/72?u=riley', entityType: 'User', role: 'Editor' },
        { name: 'Michael Johnson', avatar: 'https://i.pravatar.cc/72?u=michael', entityType: 'User', role: 'Editor' },
        { name: 'James Wilson', avatar: 'https://i.pravatar.cc/72?u=james', entityType: 'User', role: 'Viewer' },
        { name: 'Platform Team', initials: 'PL', entityType: 'Team', role: 'Editor' },
        { name: 'Engineering Team', initials: 'ET', entityType: 'Team', role: 'Viewer' },
        { name: 'SRE Team', initials: 'SR', entityType: 'Team', role: 'Viewer' },
        { name: 'Tech Leads', initials: 'TL', entityType: 'User group', role: 'Editor' },
        { name: 'Stakeholders', initials: 'SH', entityType: 'User group', role: 'Viewer' }
      ],
      content: [
        { name: 'Migration Timeline Board', type: 'Board', owner: 'Riley Chen', ownerAvatar: 'https://i.pravatar.cc/72?u=riley', section: 'Planning', classification: 'Internal' },
        { name: 'Infrastructure Diagram', type: 'Diagram', owner: 'Michael Johnson', ownerAvatar: 'https://i.pravatar.cc/72?u=michael', section: 'Architecture', classification: 'Confidential' },
        { name: 'Rollback Plan', type: 'Doc', owner: 'Riley Chen', ownerAvatar: 'https://i.pravatar.cc/72?u=riley', section: 'Safety', classification: 'Confidential' },
        { name: 'Dependencies Tracker', type: 'Data Table', owner: 'James Wilson', ownerAvatar: 'https://i.pravatar.cc/72?u=james', section: 'Planning', classification: 'Internal' },
        { name: 'Risk Assessment Board', type: 'Board', owner: 'Michael Johnson', ownerAvatar: 'https://i.pravatar.cc/72?u=michael', section: 'Safety', classification: 'Confidential' },
        { name: 'API Migration Prototype', type: 'Prototype', owner: 'Riley Chen', ownerAvatar: 'https://i.pravatar.cc/72?u=riley', section: 'Architecture', classification: 'Internal' }
      ]
    },
    {
      id: 'space-8',
      name: 'Design System v2',
      type: 'Design',
      owner: 'Sophia Davis', ownerAvatar: 'https://i.pravatar.cc/72?u=sophia',
      access: [
        { name: 'Sophia Davis', avatar: 'https://i.pravatar.cc/72?u=sophia', entityType: 'User', role: 'Editor' },
        { name: 'Olivia Brown', avatar: 'https://i.pravatar.cc/72?u=olivia', entityType: 'User', role: 'Editor' },
        { name: 'James Wilson', avatar: 'https://i.pravatar.cc/72?u=james', entityType: 'User', role: 'Editor' },
        { name: 'Morgan Lee', avatar: 'https://i.pravatar.cc/72?u=morgan', entityType: 'User', role: 'Editor' },
        { name: 'Design Team', initials: 'DT', entityType: 'Team', role: 'Editor' },
        { name: 'Frontend Team', initials: 'FT', entityType: 'Team', role: 'Viewer' },
        { name: 'Engineering Team', initials: 'ET', entityType: 'Team', role: 'Viewer' },
        { name: 'EMEA Designers', initials: 'ED', entityType: 'User group', role: 'Editor' },
        { name: 'APAC Designers', initials: 'AD', entityType: 'User group', role: 'Viewer' }
      ],
      content: [
        { name: 'Component Library Board', type: 'Board', owner: 'Sophia Davis', ownerAvatar: 'https://i.pravatar.cc/72?u=sophia', section: 'Components', classification: 'Public' },
        { name: 'Token System', type: 'Data Table', owner: 'Olivia Brown', ownerAvatar: 'https://i.pravatar.cc/72?u=olivia', section: 'Foundations', classification: 'Public' },
        { name: 'Component Specs', type: 'Doc', owner: 'James Wilson', ownerAvatar: 'https://i.pravatar.cc/72?u=james', section: 'Components', classification: 'Public' },
        { name: 'Interaction Patterns', type: 'Prototype', owner: 'Morgan Lee', ownerAvatar: 'https://i.pravatar.cc/72?u=morgan', section: 'Patterns', classification: 'Internal' },
        { name: 'Icon Set Board', type: 'Board', owner: 'Sophia Davis', ownerAvatar: 'https://i.pravatar.cc/72?u=sophia', section: 'Foundations', classification: 'Public' },
        { name: 'Layout Grid Diagram', type: 'Diagram', owner: 'Olivia Brown', ownerAvatar: 'https://i.pravatar.cc/72?u=olivia', section: 'Foundations', classification: 'Public' },
        { name: 'Accessibility Checklist', type: 'Doc', owner: 'Morgan Lee', ownerAvatar: 'https://i.pravatar.cc/72?u=morgan', section: 'Guidelines', classification: 'Public' },
        { name: 'Color Palette Prototype', type: 'Prototype', owner: 'Sophia Davis', ownerAvatar: 'https://i.pravatar.cc/72?u=sophia', section: 'Foundations', classification: 'Public' },
        { name: 'Product Backlog', type: 'Board', owner: 'James Wilson', ownerAvatar: 'https://i.pravatar.cc/72?u=james', section: 'Planning', classification: 'Internal' },
        { name: 'Quarterly Roadmap', type: 'Board', owner: 'Sophia Davis', ownerAvatar: 'https://i.pravatar.cc/72?u=sophia', section: 'Planning', classification: 'Internal' }
      ]
    },
    {
      id: 'space-9',
      name: 'Team Retrospectives',
      type: 'People',
      owner: 'Emily Carter', ownerAvatar: 'https://i.pravatar.cc/72?u=emily',
      access: [
        { name: 'Emily Carter', avatar: 'https://i.pravatar.cc/72?u=emily', entityType: 'User', role: 'Editor' },
        { name: 'Michael Johnson', avatar: 'https://i.pravatar.cc/72?u=michael', entityType: 'User', role: 'Editor' },
        { name: 'Sophia Davis', avatar: 'https://i.pravatar.cc/72?u=sophia', entityType: 'User', role: 'Editor' },
        { name: 'Daniel Smith', avatar: 'https://i.pravatar.cc/72?u=daniel', entityType: 'User', role: 'Editor' },
        { name: 'Olivia Brown', avatar: 'https://i.pravatar.cc/72?u=olivia', entityType: 'User', role: 'Editor' },
        { name: 'James Wilson', avatar: 'https://i.pravatar.cc/72?u=james', entityType: 'User', role: 'Editor' },
        { name: 'Engineering Team', initials: 'ET', entityType: 'Team', role: 'Editor' },
        { name: 'Design Team', initials: 'DT', entityType: 'Team', role: 'Editor' },
        { name: 'Product Team', initials: 'PT', entityType: 'Team', role: 'Editor' },
        { name: 'All Hands', initials: 'AH', entityType: 'User group', role: 'Viewer' }
      ],
      content: [
        { name: 'Sprint 12 Retro', type: 'Board', owner: 'Emily Carter', ownerAvatar: 'https://i.pravatar.cc/72?u=emily', section: 'Sprint 12', classification: 'Internal' },
        { name: 'Sprint 11 Retro', type: 'Board', owner: 'Michael Johnson', ownerAvatar: 'https://i.pravatar.cc/72?u=michael', section: 'Sprint 11', classification: 'Internal' },
        { name: 'Action Items Tracker', type: 'Data Table', owner: 'Emily Carter', ownerAvatar: 'https://i.pravatar.cc/72?u=emily', section: 'Tracking', classification: 'Internal' }
      ]
    },
    {
      id: 'space-10',
      name: 'API Strategy 2026',
      type: 'Roadmap',
      owner: 'Riley Chen', ownerAvatar: 'https://i.pravatar.cc/72?u=riley',
      access: [
        { name: 'Riley Chen', avatar: 'https://i.pravatar.cc/72?u=riley', entityType: 'User', role: 'Editor' },
        { name: 'Michael Johnson', avatar: 'https://i.pravatar.cc/72?u=michael', entityType: 'User', role: 'Editor' },
        { name: 'Platform Team', initials: 'PL', entityType: 'Team', role: 'Editor' },
        { name: 'API Guild', initials: 'AG', entityType: 'User group', role: 'Viewer' }
      ],
      content: [
        { name: 'API Roadmap Board', type: 'Board', owner: 'Riley Chen', ownerAvatar: 'https://i.pravatar.cc/72?u=riley', section: 'Strategy', classification: 'Internal' },
        { name: 'API Documentation', type: 'Doc', owner: 'Michael Johnson', ownerAvatar: 'https://i.pravatar.cc/72?u=michael', section: 'Documentation', classification: 'Public' },
        { name: 'Endpoint Inventory', type: 'Data Table', owner: 'Riley Chen', ownerAvatar: 'https://i.pravatar.cc/72?u=riley', section: 'Audit', classification: 'Internal' },
        { name: 'API Gateway Diagram', type: 'Diagram', owner: 'Michael Johnson', ownerAvatar: 'https://i.pravatar.cc/72?u=michael', section: 'Architecture', classification: 'Confidential' }
      ]
    }
  ],

  getSpace: function(spaceId) {
    for (var i = 0; i < this.spaces.length; i++) {
      if (this.spaces[i].id === spaceId) return this.spaces[i];
    }
    return null;
  },

  addAccess: function(spaceId, entities, role) {
    var space = this.getSpace(spaceId);
    if (!space) return;
    entities.forEach(function(entity) {
      var exists = space.access.some(function(a) { return a.name === entity.name; });
      if (!exists) {
        space.access.push({
          name: entity.name,
          avatar: entity.avatar || '',
          initials: entity.initials || '',
          entityType: entity.entityType || 'User',
          role: role || 'Editor'
        });
      }
    });
  },

  removeAccess: function(spaceId, entityName) {
    var space = this.getSpace(spaceId);
    if (!space) return;
    space.access = space.access.filter(function(a) { return a.name !== entityName; });
  },

  addContent: function(spaceId, items) {
    var space = this.getSpace(spaceId);
    if (!space) return;
    items.forEach(function(item) {
      var exists = space.content.some(function(c) { return c.name === item.name; });
      if (!exists) {
        space.content.push({
          name: item.name,
          type: item.type,
          owner: item.owner,
          ownerAvatar: item.ownerAvatar || '',
          section: item.section || 'Uncategorized',
          classification: item.classification || 'Internal'
        });
      }
    });
  },

  removeContent: function(spaceId, itemName) {
    var space = this.getSpace(spaceId);
    if (!space) return;
    space.content = space.content.filter(function(c) { return c.name !== itemName; });
  }
};

// ===== RENDER HELPERS =====

function getSpaceTypeTagClass(type) {
  var map = { 'Roadmap': 'space-tag--roadmap', 'Design': 'space-tag--design', 'Research': 'space-tag--research', 'People': 'space-tag--people' };
  return map[type] || 'mds-tag--ghost';
}

function getContentTypeTagClass(type) {
  var map = { 'Board': 'content-tag--board', 'Diagram': 'content-tag--diagram', 'Prototype': 'content-tag--prototype', 'Doc': 'content-tag--doc', 'Data Table': 'content-tag--datatable' };
  return map[type] || 'mds-tag--ghost';
}

function getClassificationTagClass(classification) {
  var map = { 'Confidential': 'classification-tag--confidential', 'Internal': 'classification-tag--internal', 'Public': 'classification-tag--public' };
  return map[classification] || 'mds-tag--ghost';
}

function getAccessSummary(access) {
  var users = 0, teams = 0, groups = 0;
  access.forEach(function(a) {
    if (a.entityType === 'User') users++;
    else if (a.entityType === 'Team') teams++;
    else if (a.entityType === 'User group') groups++;
  });
  var parts = [];
  if (users > 0) parts.push(users + (users === 1 ? ' user' : ' users'));
  if (teams > 0) parts.push(teams + (teams === 1 ? ' team' : ' teams'));
  if (groups > 0) parts.push(groups + (groups === 1 ? ' group' : ' groups'));
  return parts.join(', ');
}

function getEntityAvatar(entity) {
  if (entity.entityType === 'User' && entity.avatar) {
    return '<div class="user-avatar"><img src="' + entity.avatar + '" alt=""></div>';
  }
  var colors = {
    'Team': 'background:#dbeafe;color:#3859ff;border:1px solid #a3bffa;',
    'User group': 'background:#fde8e8;color:#d8182c;border:1px solid #f08786;'
  };
  var style = colors[entity.entityType] || 'background:#e0e2e8;color:#656b81;';
  var initials = entity.initials || entity.name.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 2).toUpperCase();
  return '<div class="user-avatar space-entity-avatar" style="' + style + 'display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;">' + initials + '</div>';
}

// ===== ROADMAP UPSELL DETECTION =====

var ROADMAP_KEYWORDS = ['backlog', 'roadmap', 'sprint', 'planning', 'timeline', 'milestone', 'quarter', 'okr', 'priorit', 'initiative', 'epic', 'release', 'iteration'];

function hasRoadmapSignals(space) {
  if (space.type === 'Roadmap') return false;
  var matches = [];
  space.content.forEach(function(item) {
    var text = (item.name + ' ' + item.section).toLowerCase();
    ROADMAP_KEYWORDS.forEach(function(kw) {
      if (text.indexOf(kw) !== -1 && matches.indexOf(item.name) === -1) {
        matches.push(item.name);
      }
    });
  });
  return matches.length >= 2 ? matches : false;
}

function convertToRoadmap(spaceId) {
  var space = window.SPACES.getSpace(spaceId);
  if (!space) return;
  space.type = 'Roadmap';
  renderSpacesTable();
  // If the panel is open for this space, refresh it
  if (window.SPACES.currentSpaceId === spaceId) {
    document.getElementById('space-panel-name').textContent = space.name;
    var typeTag = document.getElementById('space-panel-type-tag');
    typeTag.textContent = 'Roadmap';
    typeTag.className = 'mds-tag ' + getSpaceTypeTagClass('Roadmap');
    renderUpsellBanner(space);
  }
}

function renderUpsellBanner(space) {
  var container = document.getElementById('space-upsell-banner');
  if (!container) return;
  var signals = hasRoadmapSignals(space);
  if (!signals) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }
  container.style.display = '';
  var matchList = signals.slice(0, 3).map(function(name) {
    return '<span class="upsell-match-item">' + name + '</span>';
  }).join('');
  if (signals.length > 3) {
    matchList += '<span class="upsell-match-more">+' + (signals.length - 3) + ' more</span>';
  }
  container.innerHTML =
    '<div class="upsell-banner">' +
      '<div class="upsell-banner-icon">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M5.5 16A2.5 2.5 0 0 0 8 18.5v1A2.5 2.5 0 0 0 5.5 22h-1A2.5 2.5 0 0 0 2 19.5v-1A2.5 2.5 0 0 0 4.5 16h1Zm5.178-10.793c.325-1.368 2.319-1.37 2.644 0l.027.142.042.255a6.26 6.26 0 0 0 5.26 5.046c1.553.224 1.561 2.473 0 2.699a6.26 6.26 0 0 0-5.302 5.301c-.225 1.563-2.475 1.554-2.699 0a6.26 6.26 0 0 0-5.3-5.3c-1.56-.225-1.557-2.474 0-2.699l.255-.042a6.26 6.26 0 0 0 5.046-5.26l.028-.141ZM19.5 2A2.5 2.5 0 0 0 22 4.5v1A2.5 2.5 0 0 0 19.5 8h-1A2.5 2.5 0 0 0 16 5.5v-1A2.5 2.5 0 0 0 18.5 2h1Z"/></svg>' +
      '</div>' +
      '<div class="upsell-banner-body">' +
        '<div class="upsell-banner-title">This space has roadmap potential</div>' +
        '<div class="upsell-banner-desc">We detected content that looks like roadmap planning: ' + matchList + '. Convert to a Roadmap space to unlock timeline views, milestone tracking, and dependency mapping.</div>' +
      '</div>' +
      '<button class="mds-btn mds-btn--primary mds-btn--medium upsell-convert-btn" id="upsell-convert-btn">Convert to Roadmap</button>' +
      '<button class="upsell-dismiss-btn" id="upsell-dismiss-btn" title="Dismiss">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M19.707 5.707 13.414 12l6.293 6.293-1.414 1.414L12 13.414l-6.293 6.293-1.414-1.414L10.586 12 4.293 5.707l1.414-1.414L12 10.586l6.293-6.293 1.414 1.414Z"/></svg>' +
      '</button>' +
    '</div>';

  document.getElementById('upsell-convert-btn').addEventListener('click', function() {
    convertToRoadmap(window.SPACES.currentSpaceId);
  });
  document.getElementById('upsell-dismiss-btn').addEventListener('click', function() {
    container.style.display = 'none';
  });
}

// ===== RENDER MAIN TABLE =====

function renderSpacesTable() {
  var tbody = document.getElementById('spaces-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  window.SPACES.spaces.forEach(function(space) {
    var tr = document.createElement('tr');
    tr.className = 'product-row-clickable';
    tr.setAttribute('data-space-id', space.id);
    var signals = hasRoadmapSignals(space);
    var upsellBadge = signals ? '<span class="upsell-table-badge" title="This space has roadmap potential — click to learn more"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M5.5 16A2.5 2.5 0 0 0 8 18.5v1A2.5 2.5 0 0 0 5.5 22h-1A2.5 2.5 0 0 0 2 19.5v-1A2.5 2.5 0 0 0 4.5 16h1Zm5.178-10.793c.325-1.368 2.319-1.37 2.644 0l.027.142.042.255a6.26 6.26 0 0 0 5.26 5.046c1.553.224 1.561 2.473 0 2.699a6.26 6.26 0 0 0-5.302 5.301c-.225 1.563-2.475 1.554-2.699 0a6.26 6.26 0 0 0-5.3-5.3c-1.56-.225-1.557-2.474 0-2.699l.255-.042a6.26 6.26 0 0 0 5.046-5.26l.028-.141ZM19.5 2A2.5 2.5 0 0 0 22 4.5v1A2.5 2.5 0 0 0 19.5 8h-1A2.5 2.5 0 0 0 16 5.5v-1A2.5 2.5 0 0 0 18.5 2h1Z"/></svg> Upgrade to Roadmap</span>' : '';
    tr.innerHTML =
      '<td><div class="product-name-value"><div class="product-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" class="product-icon"><path fill="currentColor" d="M3 3h8v8H3V3Zm2 2v4h4V5H5Zm8-2h8v8h-8V3Zm2 2v4h4V5h-4ZM3 13h8v8H3v-8Zm2 2v4h4v-4H5Zm8-2h8v8h-8v-8Zm2 2v4h4v-4h-4Z"/></svg></div><div class="product-label">' + space.name + '</div></div></td>' +
      '<td><div class="space-type-cell"><span class="mds-tag ' + getSpaceTypeTagClass(space.type) + '">' + space.type + '</span>' + upsellBadge + '</div></td>' +
      '<td><div class="user-cell"><div class="user-avatar"><img src="' + space.ownerAvatar + '" alt=""></div><div class="user-info"><span class="user-name">' + space.owner + '</span></div></div></td>' +
      '<td>' + getAccessSummary(space.access) + '</td>' +
      '<td>' + space.content.length + (space.content.length === 1 ? ' item' : ' items') + '</td>';
    tr.addEventListener('click', function() { openSpacePanel(space.id); });
    tbody.appendChild(tr);
  });

  // Render upsell callout above table
  renderUpsellCallout();
}

function renderUpsellCallout() {
  var callout = document.getElementById('upsell-callout');
  if (!callout) return;
  var qualifying = [];
  window.SPACES.spaces.forEach(function(space) {
    if (hasRoadmapSignals(space)) qualifying.push(space);
  });
  if (qualifying.length === 0) {
    callout.style.display = 'none';
    return;
  }
  callout.style.display = '';
  document.getElementById('upsell-callout-text').textContent =
    qualifying.length + (qualifying.length === 1 ? ' space has' : ' spaces have') +
    ' content that could benefit from Roadmap features:';
  var spacesEl = document.getElementById('upsell-callout-spaces');
  spacesEl.innerHTML = '';
  qualifying.forEach(function(space) {
    var chip = document.createElement('button');
    chip.className = 'upsell-callout-chip';
    chip.textContent = space.name;
    chip.addEventListener('click', function() { openSpacePanel(space.id); });
    spacesEl.appendChild(chip);
  });
}

// ===== SPACE DETAIL PANEL =====

function openSpacePanel(spaceId) {
  window.SPACES.currentSpaceId = spaceId;
  var space = window.SPACES.getSpace(spaceId);
  if (!space) return;

  document.getElementById('space-panel-name').textContent = space.name;
  var typeTag = document.getElementById('space-panel-type-tag');
  typeTag.textContent = space.type;
  typeTag.className = 'mds-tag ' + getSpaceTypeTagClass(space.type);

  // Set icon color based on type
  var iconColors = { 'Roadmap': '#2b3ea0', 'Design': '#7c2ea0', 'Research': '#0d6b6b', 'People': '#8a5a00' };
  var iconBgs = { 'Roadmap': '#e8ecfc', 'Design': '#f3e8fc', 'Research': '#e8f8fc', 'People': '#fef3e2' };
  var iconEl = document.getElementById('space-panel-icon');
  iconEl.style.background = iconBgs[space.type] || '#f1f2f5';
  iconEl.style.color = iconColors[space.type] || '#656b81';

  // Owner row
  var ownerRow = document.getElementById('space-panel-owner-row');
  ownerRow.innerHTML = '<span class="space-panel-owner-label">Owner:</span>' +
    '<div class="user-avatar" style="width:20px;height:20px;"><img src="' + space.ownerAvatar + '" alt="" style="width:20px;height:20px;"></div>' +
    '<span class="space-panel-owner-name">' + space.owner + '</span>';

  // Reset to Access tab
  document.querySelectorAll('.space-panel-tab').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.space-tab-panel').forEach(function(p) { p.classList.remove('active'); });
  document.querySelector('[data-space-tab="access"]').classList.add('active');
  document.getElementById('space-panel-access').classList.add('active');

  renderAccessTab(space);
  renderContentTab(space);
  updateTabCounts(space);
  renderUpsellBanner(space);

  document.getElementById('space-detail-panel').classList.add('open');
}

function closeSpacePanel() {
  document.getElementById('space-detail-panel').classList.remove('open');
  window.SPACES.currentSpaceId = null;
}

function updateTabCounts(space) {
  document.getElementById('space-tab-access').textContent = 'Access (' + space.access.length + ')';
  document.getElementById('space-tab-content').textContent = 'Content (' + space.content.length + ')';
}

function renderAccessTab(space) {
  var tbody = document.getElementById('space-access-tbody');
  tbody.innerHTML = '';
  space.access.forEach(function(entity) {
    var tr = document.createElement('tr');
    var isOwner = entity.entityType === 'User' && entity.name === space.owner;
    var ownerBadge = isOwner ? ' <span class="mds-tag space-tag--owner">Owner</span>' : '';
    var coOwnerBadge = entity.isCoOwner ? ' <span class="mds-tag space-tag--coowner">Co-owner</span>' : '';
    tr.innerHTML =
      '<td><div class="user-cell">' + getEntityAvatar(entity) + '<div class="user-info"><span class="user-name">' + entity.name + ownerBadge + coOwnerBadge + '</span></div></div></td>' +
      '<td><span class="mds-tag mds-tag--ghost">' + entity.entityType + '</span></td>' +
      '<td>' + entity.role + '</td>' +
      '<td class="td-actions"><div class="space-user-actions" data-entity-name="' + entity.name + '">' +
        '<button class="mds-icon-btn space-user-actions-btn"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/></svg></button>' +
        '<div class="space-user-actions-menu">' +
          (isOwner ? '<div class="space-user-action-item" data-action="transfer-ownership">Transfer ownership</div>' : '') +
          (entity.entityType === 'User' && !isOwner ? '<div class="space-user-action-item" data-action="make-owner">Make owner</div>' : '') +
          (entity.entityType === 'User' && !isOwner && !entity.isCoOwner ? '<div class="space-user-action-item" data-action="make-coowner">Make co-owner</div>' : '') +
          (entity.entityType === 'User' && entity.isCoOwner ? '<div class="space-user-action-item" data-action="remove-coowner">Remove co-owner</div>' : '') +
          (!isOwner ? '<div class="space-user-action-item space-user-action-danger" data-action="remove">Remove from space</div>' : '') +
        '</div>' +
      '</div></td>';
    tbody.appendChild(tr);
  });

  // Bind 3-dot menus
  tbody.querySelectorAll('.space-user-actions').forEach(function(wrap) {
    var entityName = wrap.getAttribute('data-entity-name');
    var btn = wrap.querySelector('.space-user-actions-btn');
    var menu = wrap.querySelector('.space-user-actions-menu');

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      // Close any other open menus
      document.querySelectorAll('.space-user-actions-menu.open').forEach(function(m) { if (m !== menu) m.classList.remove('open'); });
      menu.classList.toggle('open');
    });

    menu.querySelectorAll('.space-user-action-item').forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        menu.classList.remove('open');
        var action = this.getAttribute('data-action');
        var sp = window.SPACES.getSpace(window.SPACES.currentSpaceId);
        if (!sp) return;

        if (action === 'transfer-ownership') {
          // Open a mini-picker: list other users in the space
          openTransferOwnershipModal(sp);
        } else if (action === 'make-owner') {
          sp.owner = entityName;
          var user = sp.access.find(function(a) { return a.name === entityName; });
          sp.ownerAvatar = user ? (user.avatar || '') : '';
          // Update header owner
          var ownerRow = document.getElementById('space-panel-owner-row');
          ownerRow.innerHTML = '<span class="space-panel-owner-label">Owner:</span>' +
            '<div class="user-avatar" style="width:20px;height:20px;"><img src="' + sp.ownerAvatar + '" alt="" style="width:20px;height:20px;"></div>' +
            '<span class="space-panel-owner-name">' + sp.owner + '</span>';
          renderAccessTab(sp);
          renderSpacesTable();
        } else if (action === 'make-coowner') {
          var entity = sp.access.find(function(a) { return a.name === entityName; });
          if (entity) entity.isCoOwner = true;
          renderAccessTab(sp);
        } else if (action === 'remove-coowner') {
          var ent = sp.access.find(function(a) { return a.name === entityName; });
          if (ent) ent.isCoOwner = false;
          renderAccessTab(sp);
        } else if (action === 'remove') {
          window.SPACES.removeAccess(window.SPACES.currentSpaceId, entityName);
          renderAccessTab(sp);
          updateTabCounts(sp);
          renderSpacesTable();
        }
      });
    });
  });
}

function contentHasRoadmapSignal(item) {
  var text = (item.name + ' ' + item.section).toLowerCase();
  for (var i = 0; i < ROADMAP_KEYWORDS.length; i++) {
    if (text.indexOf(ROADMAP_KEYWORDS[i]) !== -1) return true;
  }
  return false;
}

function renderContentTab(space) {
  var tbody = document.getElementById('space-content-tbody');
  tbody.innerHTML = '';
  var showSignals = space.type !== 'Roadmap';
  space.content.forEach(function(item) {
    var tr = document.createElement('tr');
    var isSignal = showSignals && contentHasRoadmapSignal(item);
    if (isSignal) tr.className = 'roadmap-signal-row';
    var signalBadge = isSignal
      ? '<span class="roadmap-signal-badge" title="This content could benefit from Roadmap features"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M5.5 16A2.5 2.5 0 0 0 8 18.5v1A2.5 2.5 0 0 0 5.5 22h-1A2.5 2.5 0 0 0 2 19.5v-1A2.5 2.5 0 0 0 4.5 16h1Zm5.178-10.793c.325-1.368 2.319-1.37 2.644 0l.027.142.042.255a6.26 6.26 0 0 0 5.26 5.046c1.553.224 1.561 2.473 0 2.699a6.26 6.26 0 0 0-5.302 5.301c-.225 1.563-2.475 1.554-2.699 0a6.26 6.26 0 0 0-5.3-5.3c-1.56-.225-1.557-2.474 0-2.699l.255-.042a6.26 6.26 0 0 0 5.046-5.26l.028-.141ZM19.5 2A2.5 2.5 0 0 0 22 4.5v1A2.5 2.5 0 0 0 19.5 8h-1A2.5 2.5 0 0 0 16 5.5v-1A2.5 2.5 0 0 0 18.5 2h1Z"/></svg></span>'
      : '';
    tr.innerHTML =
      '<td><span class="content-item-name">' + item.name + signalBadge + '</span></td>' +
      '<td><span class="mds-tag ' + getContentTypeTagClass(item.type) + '">' + item.type + '</span></td>' +
      '<td><div class="user-cell"><div class="user-avatar"><img src="' + item.ownerAvatar + '" alt=""></div><div class="user-info"><span class="user-name">' + item.owner + '</span></div></div></td>' +
      '<td>' + item.section + '</td>' +
      '<td><span class="mds-tag ' + getClassificationTagClass(item.classification) + '">' + item.classification + '</span></td>' +
      '<td><span class="space-remove-link" data-content-name="' + item.name + '">Remove</span></td>';
    tbody.appendChild(tr);
  });

  // Bind remove links
  tbody.querySelectorAll('.space-remove-link').forEach(function(link) {
    link.addEventListener('click', function() {
      var name = this.getAttribute('data-content-name');
      window.SPACES.removeContent(window.SPACES.currentSpaceId, name);
      var sp = window.SPACES.getSpace(window.SPACES.currentSpaceId);
      renderContentTab(sp);
      updateTabCounts(sp);
      renderSpacesTable();
    });
  });
}

// ===== TAB SWITCHING =====

document.querySelectorAll('.space-panel-tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.space-panel-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.space-tab-panel').forEach(function(p) { p.classList.remove('active'); });
    this.classList.add('active');
    var tabName = this.getAttribute('data-space-tab');
    document.getElementById('space-panel-' + tabName).classList.add('active');
  });
});

// Close panel
document.getElementById('space-panel-close').addEventListener('click', closeSpacePanel);
document.getElementById('space-detail-panel').addEventListener('click', function(e) {
  if (e.target === this) closeSpacePanel();
});

// ===== ACCESS SEARCH & FILTER =====

document.getElementById('space-access-search').addEventListener('input', function() { filterAccessTable(); });

(function() {
  var trigger = document.getElementById('space-access-type-trigger');
  var dropdown = document.getElementById('space-access-type-dropdown');
  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  dropdown.querySelectorAll('.mds-select-option').forEach(function(opt) {
    opt.addEventListener('click', function(e) {
      e.stopPropagation();
      var val = this.getAttribute('data-value');
      trigger.setAttribute('data-value', val);
      trigger.querySelector('.mds-select-label').textContent = val || 'Filter by type';
      dropdown.classList.remove('open');
      filterAccessTable();
    });
  });
})();

function filterAccessTable() {
  var searchVal = document.getElementById('space-access-search').value.toLowerCase();
  var typeVal = document.getElementById('space-access-type-trigger').getAttribute('data-value');
  var rows = document.querySelectorAll('#space-access-tbody tr');
  rows.forEach(function(row) {
    var name = row.querySelector('.user-name').textContent.toLowerCase();
    var type = row.querySelectorAll('td')[1].textContent.trim();
    var matchSearch = !searchVal || name.indexOf(searchVal) !== -1;
    var matchType = !typeVal || type === typeVal;
    row.style.display = (matchSearch && matchType) ? '' : 'none';
  });
}

// ===== CONTENT SEARCH & FILTER =====

document.getElementById('space-content-search').addEventListener('input', function() { filterContentTable(); });

(function() {
  var trigger = document.getElementById('space-content-type-trigger');
  var dropdown = document.getElementById('space-content-type-dropdown');
  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  dropdown.querySelectorAll('.mds-select-option').forEach(function(opt) {
    opt.addEventListener('click', function(e) {
      e.stopPropagation();
      var val = this.getAttribute('data-value');
      trigger.setAttribute('data-value', val);
      trigger.querySelector('.mds-select-label').textContent = val || 'Filter by type';
      dropdown.classList.remove('open');
      filterContentTable();
    });
  });
})();

function filterContentTable() {
  var searchVal = document.getElementById('space-content-search').value.toLowerCase();
  var typeVal = document.getElementById('space-content-type-trigger').getAttribute('data-value');
  var rows = document.querySelectorAll('#space-content-tbody tr');
  rows.forEach(function(row) {
    var name = row.querySelector('.content-item-name').textContent.toLowerCase();
    var type = row.querySelectorAll('td')[1].textContent.trim();
    var matchSearch = !searchVal || name.indexOf(searchVal) !== -1;
    var matchType = !typeVal || type === typeVal;
    row.style.display = (matchSearch && matchType) ? '' : 'none';
  });
}

// ===== ADD USERS MODAL =====

document.getElementById('space-add-users-btn').addEventListener('click', function() {
  openAddUsersModal();
});

function openAddUsersModal() {
  var space = window.SPACES.getSpace(window.SPACES.currentSpaceId);
  if (!space) return;
  document.getElementById('space-add-users-title').textContent = 'Add users to ' + space.name;

  var tbody = document.getElementById('space-add-users-tbody');
  tbody.innerHTML = '';

  // Show users not already in the space
  var existingNames = space.access.filter(function(a) { return a.entityType === 'User'; }).map(function(a) { return a.name; });
  var availableUsers = window.SPACES.allUsers.filter(function(u) { return existingNames.indexOf(u.name) === -1; });

  availableUsers.forEach(function(user) {
    var tr = document.createElement('tr');
    tr.setAttribute('data-name', user.name);
    tr.setAttribute('data-email', user.email);
    var tagClass = user.license === 'Basic' ? 'mds-tag--sunshine' : 'mds-tag--lime';
    tr.innerHTML =
      '<td style="width:38px;padding-left:2px;padding-right:12px;"><input type="checkbox" class="space-add-user-cb mds-checkbox"></td>' +
      '<td><div class="user-cell"><div class="user-avatar"><img src="' + user.avatar + '" alt=""></div><div class="user-info"><span class="user-name">' + user.name + '</span></div></div></td>' +
      '<td><span class="user-email">' + user.email + '</span></td>' +
      '<td><span class="mds-tag ' + tagClass + '">' + user.license + '</span></td>';
    tbody.appendChild(tr);
  });

  document.getElementById('space-add-select-all').checked = false;
  document.getElementById('space-add-users-submit').disabled = true;
  document.getElementById('space-add-users-search').value = '';
  document.getElementById('space-add-users-overlay').classList.add('visible');
  bindAddUsersCheckboxes();
}

function bindAddUsersCheckboxes() {
  var selectAll = document.getElementById('space-add-select-all');
  var submitBtn = document.getElementById('space-add-users-submit');

  selectAll.addEventListener('change', function() {
    var checked = this.checked;
    document.querySelectorAll('.space-add-user-cb').forEach(function(cb) {
      if (cb.closest('tr').style.display !== 'none') cb.checked = checked;
    });
    updateAddUsersSubmit();
  });

  document.querySelectorAll('.space-add-user-cb').forEach(function(cb) {
    cb.addEventListener('change', function() { updateAddUsersSubmit(); });
  });

  function updateAddUsersSubmit() {
    var count = document.querySelectorAll('.space-add-user-cb:checked').length;
    submitBtn.disabled = count === 0;
    submitBtn.textContent = count > 0 ? 'Add ' + count + ' to space' : 'Add to space';
  }
}

// Search in add users modal
document.getElementById('space-add-users-search').addEventListener('input', function() {
  var val = this.value.toLowerCase();
  document.querySelectorAll('#space-add-users-tbody tr').forEach(function(row) {
    var name = row.getAttribute('data-name').toLowerCase();
    var email = row.getAttribute('data-email').toLowerCase();
    row.style.display = (!val || name.indexOf(val) !== -1 || email.indexOf(val) !== -1) ? '' : 'none';
  });
});

// Role selector
(function() {
  var trigger = document.getElementById('space-add-role-trigger');
  var dropdown = document.getElementById('space-add-role-dropdown');
  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  dropdown.querySelectorAll('.mds-select-option').forEach(function(opt) {
    opt.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdown.querySelectorAll('.mds-select-option').forEach(function(o) { o.classList.remove('selected'); });
      this.classList.add('selected');
      var val = this.getAttribute('data-value');
      trigger.setAttribute('data-value', val);
      trigger.querySelector('.mds-select-label').textContent = val;
      dropdown.classList.remove('open');
    });
  });
})();

// Submit add users
document.getElementById('space-add-users-submit').addEventListener('click', function() {
  var role = document.getElementById('space-add-role-trigger').getAttribute('data-value') || 'Editor';
  var selected = [];
  document.querySelectorAll('.space-add-user-cb:checked').forEach(function(cb) {
    var row = cb.closest('tr');
    var name = row.getAttribute('data-name');
    var user = window.SPACES.allUsers.find(function(u) { return u.name === name; });
    if (user) {
      selected.push({ name: user.name, avatar: user.avatar, entityType: 'User' });
    }
  });

  if (selected.length > 0) {
    window.SPACES.addAccess(window.SPACES.currentSpaceId, selected, role);
    var space = window.SPACES.getSpace(window.SPACES.currentSpaceId);
    renderAccessTab(space);
    updateTabCounts(space);
    renderSpacesTable();
  }

  closeAddUsersModal();
});

// Cancel / close add users modal
document.getElementById('space-add-users-cancel').addEventListener('click', closeAddUsersModal);
document.getElementById('space-add-users-close').addEventListener('click', closeAddUsersModal);
document.getElementById('space-add-users-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeAddUsersModal();
});

function closeAddUsersModal() {
  document.getElementById('space-add-users-overlay').classList.remove('visible');
}

// ===== MANAGE CONTENT MODAL =====

document.getElementById('space-manage-content-btn').addEventListener('click', function() {
  openManageContentModal();
});

function openManageContentModal() {
  var space = window.SPACES.getSpace(window.SPACES.currentSpaceId);
  if (!space) return;
  document.getElementById('space-manage-content-title').textContent = 'Add content to ' + space.name;

  var tbody = document.getElementById('space-manage-content-tbody');
  tbody.innerHTML = '';

  // Show content not already in the space
  var existingNames = space.content.map(function(c) { return c.name; });
  var availableContent = window.SPACES.allContent.filter(function(c) { return existingNames.indexOf(c.name) === -1; });

  availableContent.forEach(function(item) {
    var tr = document.createElement('tr');
    tr.setAttribute('data-name', item.name);
    tr.setAttribute('data-type', item.type);
    tr.innerHTML =
      '<td style="width:38px;padding-left:2px;padding-right:12px;"><input type="checkbox" class="space-add-content-cb mds-checkbox"></td>' +
      '<td><span class="content-item-name">' + item.name + '</span></td>' +
      '<td><span class="mds-tag ' + getContentTypeTagClass(item.type) + '">' + item.type + '</span></td>' +
      '<td><div class="user-cell"><div class="user-avatar"><img src="' + item.ownerAvatar + '" alt=""></div><div class="user-info"><span class="user-name">' + item.owner + '</span></div></div></td>' +
      '<td><span class="mds-tag ' + getClassificationTagClass(item.classification) + '">' + item.classification + '</span></td>';
    tbody.appendChild(tr);
  });

  document.getElementById('space-content-select-all').checked = false;
  document.getElementById('space-manage-content-submit').disabled = true;
  document.getElementById('space-manage-content-search').value = '';
  document.getElementById('space-manage-content-overlay').classList.add('visible');
  bindManageContentCheckboxes();
}

function bindManageContentCheckboxes() {
  var selectAll = document.getElementById('space-content-select-all');
  var submitBtn = document.getElementById('space-manage-content-submit');

  selectAll.addEventListener('change', function() {
    var checked = this.checked;
    document.querySelectorAll('.space-add-content-cb').forEach(function(cb) {
      if (cb.closest('tr').style.display !== 'none') cb.checked = checked;
    });
    updateManageContentSubmit();
  });

  document.querySelectorAll('.space-add-content-cb').forEach(function(cb) {
    cb.addEventListener('change', function() { updateManageContentSubmit(); });
  });

  function updateManageContentSubmit() {
    var count = document.querySelectorAll('.space-add-content-cb:checked').length;
    submitBtn.disabled = count === 0;
    submitBtn.textContent = count > 0 ? 'Add ' + count + ' to space' : 'Add to space';
  }
}

// Search in manage content modal
document.getElementById('space-manage-content-search').addEventListener('input', function() {
  var val = this.value.toLowerCase();
  document.querySelectorAll('#space-manage-content-tbody tr').forEach(function(row) {
    var name = row.getAttribute('data-name').toLowerCase();
    row.style.display = (!val || name.indexOf(val) !== -1) ? '' : 'none';
  });
});

// Content type filter in modal
(function() {
  var trigger = document.getElementById('space-manage-content-type-trigger');
  var dropdown = document.getElementById('space-manage-content-type-dropdown');
  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  dropdown.querySelectorAll('.mds-select-option').forEach(function(opt) {
    opt.addEventListener('click', function(e) {
      e.stopPropagation();
      var val = this.getAttribute('data-value');
      trigger.setAttribute('data-value', val);
      trigger.querySelector('.mds-select-label').textContent = val || 'Filter by type';
      dropdown.classList.remove('open');
      document.querySelectorAll('#space-manage-content-tbody tr').forEach(function(row) {
        var type = row.getAttribute('data-type');
        row.style.display = (!val || type === val) ? '' : 'none';
      });
    });
  });
})();

// Submit manage content
document.getElementById('space-manage-content-submit').addEventListener('click', function() {
  var selected = [];
  document.querySelectorAll('.space-add-content-cb:checked').forEach(function(cb) {
    var row = cb.closest('tr');
    var name = row.getAttribute('data-name');
    var item = window.SPACES.allContent.find(function(c) { return c.name === name; });
    if (item) {
      selected.push({
        name: item.name,
        type: item.type,
        owner: item.owner,
        ownerAvatar: item.ownerAvatar,
        section: 'Uncategorized',
        classification: item.classification
      });
    }
  });

  if (selected.length > 0) {
    window.SPACES.addContent(window.SPACES.currentSpaceId, selected);
    var space = window.SPACES.getSpace(window.SPACES.currentSpaceId);
    renderContentTab(space);
    updateTabCounts(space);
    renderSpacesTable();
  }

  closeManageContentModal();
});

// Cancel / close manage content modal
document.getElementById('space-manage-content-cancel').addEventListener('click', closeManageContentModal);
document.getElementById('space-manage-content-close').addEventListener('click', closeManageContentModal);
document.getElementById('space-manage-content-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeManageContentModal();
});

function closeManageContentModal() {
  document.getElementById('space-manage-content-overlay').classList.remove('visible');
}

// ===== TRANSFER OWNERSHIP MODAL =====

function openTransferOwnershipModal(space) {
  var list = document.getElementById('transfer-owner-list');
  list.innerHTML = '';
  var candidates = space.access.filter(function(a) { return a.entityType === 'User' && a.name !== space.owner; });
  candidates.forEach(function(user) {
    var row = document.createElement('div');
    row.className = 'transfer-owner-row';
    row.setAttribute('data-name', user.name);
    row.innerHTML =
      '<input type="radio" name="transfer-owner" class="mds-checkbox transfer-owner-radio" value="' + user.name + '">' +
      '<div class="user-cell"><div class="user-avatar"><img src="' + (user.avatar || '') + '" alt=""></div>' +
      '<div class="user-info"><span class="user-name">' + user.name + '</span></div></div>';
    list.appendChild(row);
  });

  document.getElementById('transfer-owner-search').value = '';
  document.getElementById('transfer-owner-submit').disabled = true;
  document.getElementById('transfer-owner-overlay').classList.add('visible');

  // Bind radio change
  list.querySelectorAll('.transfer-owner-radio').forEach(function(radio) {
    radio.addEventListener('change', function() {
      document.getElementById('transfer-owner-submit').disabled = false;
    });
  });
}

document.getElementById('transfer-owner-search').addEventListener('input', function() {
  var val = this.value.toLowerCase();
  document.querySelectorAll('#transfer-owner-list .transfer-owner-row').forEach(function(row) {
    var name = row.getAttribute('data-name').toLowerCase();
    row.style.display = (!val || name.indexOf(val) !== -1) ? '' : 'none';
  });
});

document.getElementById('transfer-owner-submit').addEventListener('click', function() {
  var selected = document.querySelector('.transfer-owner-radio:checked');
  if (!selected) return;
  var newOwnerName = selected.value;
  var sp = window.SPACES.getSpace(window.SPACES.currentSpaceId);
  if (!sp) return;

  sp.owner = newOwnerName;
  var user = sp.access.find(function(a) { return a.name === newOwnerName; });
  sp.ownerAvatar = user ? (user.avatar || '') : '';

  var ownerRow = document.getElementById('space-panel-owner-row');
  ownerRow.innerHTML = '<span class="space-panel-owner-label">Owner:</span>' +
    '<div class="user-avatar" style="width:20px;height:20px;"><img src="' + sp.ownerAvatar + '" alt="" style="width:20px;height:20px;"></div>' +
    '<span class="space-panel-owner-name">' + sp.owner + '</span>';

  renderAccessTab(sp);
  renderSpacesTable();
  document.getElementById('transfer-owner-overlay').classList.remove('visible');
});

document.getElementById('transfer-owner-cancel').addEventListener('click', function() {
  document.getElementById('transfer-owner-overlay').classList.remove('visible');
});
document.getElementById('transfer-owner-close').addEventListener('click', function() {
  document.getElementById('transfer-owner-overlay').classList.remove('visible');
});
document.getElementById('transfer-owner-overlay').addEventListener('click', function(e) {
  if (e.target === this) this.classList.remove('visible');
});

// ===== MANAGE SPACE DROPDOWN (3-dot menu) =====
(function() {
  var btn = document.getElementById('space-manage-btn');
  var dropdown = document.getElementById('space-manage-dropdown');
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    document.querySelectorAll('.space-user-actions-menu.open').forEach(function(m) { if (m !== dropdown) m.classList.remove('open'); });
    dropdown.classList.toggle('open');
  });
  dropdown.querySelectorAll('.space-user-action-item').forEach(function(opt) {
    opt.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdown.classList.remove('open');
      var action = this.getAttribute('data-action');
      if (action === 'delete-space') {
        var space = window.SPACES.getSpace(window.SPACES.currentSpaceId);
        if (space && confirm('Are you sure you want to delete "' + space.name + '"?')) {
          window.SPACES.spaces = window.SPACES.spaces.filter(function(s) { return s.id !== window.SPACES.currentSpaceId; });
          closeSpacePanel();
          renderSpacesTable();
        }
      } else if (action === 'change-owner') {
        var sp = window.SPACES.getSpace(window.SPACES.currentSpaceId);
        if (sp) openTransferOwnershipModal(sp);
      }
    });
  });
})();

// ===== CLOSE DROPDOWNS ON OUTSIDE CLICK =====
document.addEventListener('click', function() {
  document.querySelectorAll('.mds-select-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
  // Close any open user action menus
  document.querySelectorAll('.space-user-actions-menu.open').forEach(function(m) { m.classList.remove('open'); });
});

// ===== HAMBURGER SIDEBAR TOGGLE =====
(function() {
  var btn = document.getElementById('hamburger-btn');
  var sidebar = document.getElementById('sidebar');
  if (btn && sidebar) {
    btn.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
    });
  }
})();

// ===== UPSELL CALLOUT DISMISS =====
document.getElementById('upsell-callout-dismiss').addEventListener('click', function() {
  document.getElementById('upsell-callout').style.display = 'none';
});

// ===== INIT =====
renderSpacesTable();
