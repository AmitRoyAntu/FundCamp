import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/fundcamp';

export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' && !connectionString.includes('localhost') && !connectionString.includes('postgres:') ? { rejectUnauthorized: false } : false
});

// Memory storage fallback for development / preview when Postgres is not running
const inMemoryStore = {
  users: [
    {
      id: 1,
      name: 'Sarah Jenkins',
      email: 'sarah.j@university.edu',
      password: '$2b$10$44CiuM.wN1E3ENkFx/zlW.ZX3JgNhYtkQNs1w5.1A6TzyFq0yOIbq', // 12345678
      department: 'Computer Science',
      user_type: 'Student',
      status: 'active',
      university_id: 'STU-2026-101',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Dr. Robert Chen',
      email: 'r.chen@university.edu',
      password: '$2b$10$44CiuM.wN1E3ENkFx/zlW.ZX3JgNhYtkQNs1w5.1A6TzyFq0yOIbq', // 12345678
      department: 'Robotics Lab',
      user_type: 'Faculty',
      status: 'active',
      university_id: 'FAC-2026-042',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Campus Administrator',
      email: 'admin@university.edu',
      password: '$2b$10$44CiuM.wN1E3ENkFx/zlW.ZX3JgNhYtkQNs1w5.1A6TzyFq0yOIbq', // 12345678
      department: 'Office of Student Affairs & Research Administration',
      user_type: 'Admin',
      status: 'active',
      university_id: 'ADM-2026-001',
      created_at: new Date().toISOString()
    }
  ],
  campaigns: [
    {
      id: 1,
      title: 'Robotics Lab Equipment Upgrade',
      description: 'Funding for high-precision sensors and microcontrollers for the university robotics competition team.',
      category: 'Research',
      department: 'Robotics Lab',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
      tags: ['Robotics', 'Hardware', 'Microcontrollers', 'Competition'],
      goal_amount: 5001,
      amount_raised: 3200,
      status: 'approved',
      creator_id: 2,
      documents: [
        { name: 'Lab_Budget_Breakdown.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: '142 KB' },
        { name: 'Faculty_Advisor_Endorsement.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: '98 KB' }
      ],
      admin_feedback: null,
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Student Emergency Medical Support Fund',
      description: 'Raising funds to support fellow student Sarah who needs urgent cardiac procedure assistance.',
      category: 'Medical',
      department: 'Computer Science',
      image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1200',
      tags: ['MedicalEmergency', 'StudentAid', 'Urgent'],
      goal_amount: 12000,
      amount_raised: 8500,
      status: 'approved',
      creator_id: 1,
      documents: [
        { name: 'Hospital_Admission_Letter.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: '215 KB' },
        { name: 'University_Medical_Board_Approval.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: '180 KB' }
      ],
      admin_feedback: null,
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Autonomous Campus Drone Delivery System',
      description: 'Research grant to build an AI-powered payload quadcopter for delivering critical medical supplies and documents across campus faculties.',
      category: 'Research',
      department: 'Electrical & Electronic Engineering',
      image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=1200',
      tags: ['Drones', 'AI', 'Logistics', 'Robotics'],
      goal_amount: 8500,
      amount_raised: 0,
      status: 'pending',
      creator_id: 2,
      documents: [
        { name: 'Department_Approval_Letter.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: '184 KB' },
        { name: 'Student_ID_Cards_Team.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: '320 KB' },
        { name: 'Bill_of_Materials_Quotation.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: '145 KB' }
      ],
      admin_feedback: null,
      verified_at: null,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      title: 'Urgent Chemotherapy Aid for Student Kabir',
      description: 'Freshman student Kabir from Department of CSE has been diagnosed with Acute Lymphoblastic Leukemia requiring intensive chemotherapy sessions.',
      category: 'Medical',
      department: 'Computer Science',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1200',
      tags: ['MedicalEmergency', 'Chemotherapy', 'StudentWelfare'],
      goal_amount: 25000,
      amount_raised: 0,
      status: 'pending',
      creator_id: 1,
      documents: [
        { name: 'Specialist_Doctor_Prescription.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: '410 KB' },
        { name: 'Hospital_Cost_Estimate_Certificate.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: '290 KB' },
        { name: 'University_Student_ID.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'application/pdf', size: '115 KB' }
      ],
      admin_feedback: null,
      verified_at: null,
      created_at: new Date().toISOString()
    }
  ],
  updates: [
    {
      id: 1,
      campaign_id: 1,
      title: 'Milestone 1 Reached: Microcontrollers Acquired!',
      content: 'Thanks to initial backers, we have successfully ordered 10 high-precision STM32 microcontrollers and sensor breakout boards for team calibration.',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 2,
      campaign_id: 1,
      title: 'Lab Testing Session Scheduled',
      content: 'Our engineering team will be hosting an open demonstration next Tuesday in Lab 304 to showcase initial hardware telemetry.',
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  comments: [
    {
      id: 1,
      campaign_id: 1,
      user_id: 1,
      content: 'So excited for the robotics team! Let me know if you need help with software integration.',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2,
      campaign_id: 1,
      user_id: 2,
      content: 'Thank you Sarah! Appreciate the support from CSE department.',
      created_at: new Date(Date.now() - 43200000).toISOString()
    }
  ],
  donations: [
    {
      id: 1,
      campaign_id: 1,
      user_id: 1,
      donor_name: 'Sarah Jenkins',
      amount: 1500,
      payment_method: 'bKash',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2,
      campaign_id: 1,
      user_id: null,
      donor_name: 'Alumni Network Supporter',
      amount: 1700,
      payment_method: 'Card',
      created_at: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: 3,
      campaign_id: 2,
      user_id: 2,
      donor_name: 'Dr. Robert Chen',
      amount: 3000,
      payment_method: 'Card',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 4,
      campaign_id: 2,
      user_id: null,
      donor_name: 'CSE Alumni Association',
      amount: 3500,
      payment_method: 'bKash',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 5,
      campaign_id: 2,
      user_id: null,
      donor_name: 'University Student Welfare Club',
      amount: 2000,
      payment_method: 'Nagad',
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  expense_receipts: [
    {
      id: 1,
      campaign_id: 1,
      title: 'STM32F407 Microcontrollers Bulk Purchase (10x Units)',
      amount: 1450.00,
      vendor: 'TechShop BD Ltd.',
      category: 'Hardware/Equipment',
      receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
      receipt_name: 'Invoice-TSBD-8921.jpg',
      status: 'verified',
      admin_notes: 'Verified with original supplier invoice and lab inventory log.',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 2,
      campaign_id: 1,
      title: 'Ultrasonic & LiDAR Range Sensors Calibration Kit',
      amount: 1200.00,
      vendor: 'RoboTech Components Ltd.',
      category: 'Hardware/Sensors',
      receipt_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=800',
      receipt_name: 'Invoice-RoboTech-4029.jpg',
      status: 'pending',
      admin_notes: 'Submitted by Dr. Chen; pending verification of shipment packing slip.',
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  campaign_reports: [
    {
      id: 1,
      campaign_id: 2,
      reporter_id: 2,
      reporter_name: 'Dr. Robert Chen',
      reporter_email: 'r.chen@university.edu',
      reason: 'Suspected Fake Proof Documents',
      description: 'The uploaded medical admission certificate does not have an authorized hospital seal or attending doctor signature. Please verify with university health center.',
      status: 'pending',
      admin_notes: null,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    }
  ]
};

let isPostgresAvailable = null;

export const query = async (text, params = []) => {
  if (isPostgresAvailable === false) {
    return handleInMemoryQuery(text, params);
  }
  try {
    const res = await pool.query(text, params);
    isPostgresAvailable = true;
    return res;
  } catch (error) {
    if (isPostgresAvailable === null) {
      isPostgresAvailable = false;
    }
    return handleInMemoryQuery(text, params);
  }
};

function handleInMemoryQuery(text, params) {
  const queryStr = text.trim().toLowerCase().replace(/\s+/g, ' ');

  // USERS QUERIES
  if (queryStr.includes('select * from users where email =')) {
    const email = params[0];
    const user = inMemoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return { rows: user ? [user] : [] };
  }

  // Find user by ID (single user)
  if (queryStr.includes('from users') && (queryStr.includes('where id =') || queryStr.includes('where u.id ='))) {
    const id = parseInt(params[0], 10);
    const user = inMemoryStore.users.find(u => u.id === id);
    if (!user) return { rows: [] };
    const { password, ...userWithoutPassword } = user;
    return { rows: [{ ...userWithoutPassword, status: user.status || 'active' }] };
  }

  if (queryStr.includes('update users') && queryStr.includes('status =')) {
    const [status, id] = params;
    const user = inMemoryStore.users.find(u => u.id === parseInt(id, 10));
    if (user) {
      user.status = status;
      const { password, ...userWithoutPassword } = user;
      return { rows: [userWithoutPassword] };
    }
    return { rows: [] };
  }

  // List all users for admin directory
  if (queryStr.includes('from users') && !queryStr.includes('insert into')) {
    let list = inMemoryStore.users.map(u => {
      const { password, ...userWithoutPassword } = u;
      const userCampaigns = inMemoryStore.campaigns.filter(c => c.creator_id === u.id);
      return {
        ...userWithoutPassword,
        status: u.status || 'active',
        campaign_count: userCampaigns.length
      };
    });
    if (params && params.length > 0 && queryStr.includes('status = $')) {
      const targetStatus = params[0];
      if (targetStatus && targetStatus !== 'all') {
        list = list.filter(u => u.status === targetStatus);
      }
    }
    return { rows: list };
  }

  if (queryStr.includes('insert into users')) {
    const [name, email, password, department, user_type] = params;
    const newUser = {
      id: inMemoryStore.users.length + 1,
      name,
      email,
      password,
      department,
      user_type: user_type || params[4] || 'Student',
      status: 'active',
      created_at: new Date().toISOString()
    };
    inMemoryStore.users.push(newUser);
    return { rows: [newUser] };
  }

  // CAMPAIGNS QUERIES
  if (queryStr.includes('where c.id =')) {
    const id = parseInt(params[0], 10);
    const campaign = inMemoryStore.campaigns.find(c => c.id === id);
    if (!campaign) return { rows: [] };
    const creator = inMemoryStore.users.find(u => u.id === campaign.creator_id);
    return {
      rows: [{
        ...campaign,
        creator_name: creator ? creator.name : 'Unknown Creator',
        creator_department: creator ? creator.department : '',
        creator_email: creator ? creator.email : '',
        creator_type: creator ? (creator.user_type || creator.userType) : 'Student',
        creator_university_id: creator ? (creator.university_id || creator.universityId) : 'STU-2026'
      }]
    };
  }

  if (queryStr.includes('from campaigns') && (queryStr.includes('where creator_id =') || queryStr.includes('where c.creator_id ='))) {
    const creatorId = parseInt(params[0], 10);
    let list = inMemoryStore.campaigns.filter(c => c.creator_id === creatorId);
    list = list.map(c => {
      const creator = inMemoryStore.users.find(u => u.id === c.creator_id);
      return {
        ...c,
        creator_name: creator ? creator.name : 'Unknown Creator',
        creator_department: creator ? creator.department : '',
        creator_email: creator ? creator.email : '',
        creator_type: creator ? (creator.user_type || creator.userType) : 'Student',
        creator_university_id: creator ? (creator.university_id || creator.universityId) : 'STU-2026'
      };
    });
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: list };
  }

  if (queryStr.includes('update campaigns') && queryStr.includes('status =')) {
    // UPDATE campaigns SET status = $1, admin_feedback = $2, verified_at = $3, verified_by = $4 WHERE id = $5
    let status, admin_feedback, verified_at, verified_by, id;
    if (params.length === 5) {
      [status, admin_feedback, verified_at, verified_by, id] = params;
    } else if (params.length === 4) {
      [status, admin_feedback, verified_by, id] = params;
      verified_at = new Date().toISOString();
    } else {
      [status, id] = params;
    }
    const camp = inMemoryStore.campaigns.find(c => c.id === parseInt(id, 10));
    if (camp) {
      camp.status = status;
      if (admin_feedback !== undefined) camp.admin_feedback = admin_feedback;
      camp.verified_at = verified_at || new Date().toISOString();
      if (verified_by) camp.verified_by = parseInt(verified_by, 10);
      return { rows: [camp] };
    }
    return { rows: [] };
  }

  if (queryStr.includes('delete from campaigns where id =')) {
    const id = parseInt(params[0], 10);
    const idx = inMemoryStore.campaigns.findIndex(c => c.id === id);
    if (idx !== -1) {
      const deleted = inMemoryStore.campaigns.splice(idx, 1)[0];
      // Cascade delete associated entities
      inMemoryStore.campaign_reports = (inMemoryStore.campaign_reports || []).filter(r => r.campaign_id !== id);
      inMemoryStore.expense_receipts = (inMemoryStore.expense_receipts || []).filter(e => e.campaign_id !== id);
      inMemoryStore.donations = (inMemoryStore.donations || []).filter(d => d.campaign_id !== id);
      inMemoryStore.updates = (inMemoryStore.updates || []).filter(u => u.campaign_id !== id);
      inMemoryStore.comments = (inMemoryStore.comments || []).filter(c => c.campaign_id !== id);
      return { rows: [deleted] };
    }
    return { rows: [] };
  }

  if (queryStr.includes('from campaigns c') && queryStr.includes('join users u')) {
    let campaigns = inMemoryStore.campaigns.map(c => {
      const creator = inMemoryStore.users.find(u => u.id === c.creator_id);
      return {
        ...c,
        creator_name: creator ? creator.name : 'Unknown Creator',
        creator_department: creator ? creator.department : '',
        creator_email: creator ? creator.email : '',
        creator_type: creator ? (creator.user_type || creator.userType) : 'Student',
        creator_university_id: creator ? (creator.university_id || creator.universityId) : 'STU-2026'
      };
    });

    // Check if public route requested only approved campaigns:
    if (queryStr.includes("c.status = 'approved'")) {
      campaigns = campaigns.filter(c => (c.status || 'approved') === 'approved');
    } else if (queryStr.includes('c.status = $') && params && params.length > 0) {
      const targetStatus = params[0];
      if (targetStatus && targetStatus !== 'all') {
        campaigns = campaigns.filter(c => (c.status || 'pending') === targetStatus);
      }
    }

    return { rows: campaigns };
  }

  if (queryStr.includes('update campaigns') && queryStr.includes('amount_raised')) {
    const amount = parseFloat(params[0]);
    const id = parseInt(params[1], 10);
    const campaign = inMemoryStore.campaigns.find(c => c.id === id);
    if (campaign) {
      campaign.amount_raised = (campaign.amount_raised || 0) + amount;
      return { rows: [campaign] };
    }
    return { rows: [] };
  }

  if (queryStr.includes('insert into campaigns')) {
    let title, description, category, department, image, goal_amount, tags, creator_id, documents;
    if (params.length >= 8) {
      [title, description, category, department, image, goal_amount, tags, creator_id, documents] = params;
    } else {
      [title, description, category, department, image, goal_amount, creator_id] = params;
      tags = [];
    }
    const newCampaign = {
      id: inMemoryStore.campaigns.length + 1,
      title,
      description,
      category: category || 'Education',
      department: department || 'University Department',
      image: image || null,
      goal_amount: parseFloat(goal_amount),
      amount_raised: 0,
      tags: Array.isArray(tags) ? tags : [],
      status: 'pending', // default for newly submitted campaigns
      documents: Array.isArray(documents) ? documents : [],
      admin_feedback: null,
      verified_at: null,
      creator_id: parseInt(creator_id, 10),
      created_at: new Date().toISOString()
    };
    inMemoryStore.campaigns.push(newCampaign);
    return { rows: [newCampaign] };
  }

  // EXPENSE RECEIPTS QUERIES
  if (queryStr.includes('from expense_receipts') || queryStr.includes('from "expense_receipts"')) {
    let list = inMemoryStore.expense_receipts || [];
    if (params && params.length > 0 && queryStr.includes('where')) {
      if (queryStr.includes('campaign_id = $1') || queryStr.includes('campaign_id =')) {
        const campId = parseInt(params[0], 10);
        list = list.filter(e => e.campaign_id === campId);
      } else if (queryStr.includes('status = $1')) {
        const st = params[0];
        if (st && st !== 'all') {
          list = list.filter(e => e.status === st);
        }
      }
    }
    const enriched = list.map(e => {
      const camp = inMemoryStore.campaigns.find(c => c.id === e.campaign_id);
      const creator = camp ? inMemoryStore.users.find(u => u.id === camp.creator_id) : null;
      return {
        ...e,
        campaign_title: camp ? camp.title : 'University Campaign',
        campaign_category: camp ? camp.category : 'General',
        creator_name: creator ? creator.name : 'Campus Creator'
      };
    });
    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: enriched };
  }

  if (queryStr.includes('update expense_receipts') && queryStr.includes('status =')) {
    // UPDATE expense_receipts SET status = $1, admin_notes = $2 WHERE id = $3
    const [status, admin_notes, id] = params;
    const item = (inMemoryStore.expense_receipts || []).find(e => e.id === parseInt(id, 10));
    if (item) {
      item.status = status;
      if (admin_notes !== undefined) item.admin_notes = admin_notes;
      return { rows: [item] };
    }
    return { rows: [] };
  }

  // CAMPAIGN REPORTS QUERIES
  if (queryStr.includes('from campaign_reports') || queryStr.includes('from "campaign_reports"')) {
    let list = inMemoryStore.campaign_reports || [];
    if (params && params.length > 0 && queryStr.includes('status = $')) {
      const targetStatus = params[0];
      if (targetStatus && targetStatus !== 'all') {
        list = list.filter(r => r.status === targetStatus);
      }
    }
    const enriched = list.map(r => {
      const camp = inMemoryStore.campaigns.find(c => c.id === r.campaign_id);
      const creator = camp ? inMemoryStore.users.find(u => u.id === camp.creator_id) : null;
      return {
        ...r,
        campaign_title: camp ? camp.title : 'Deleted Campaign',
        campaign_category: camp ? camp.category : 'General',
        creator_id: camp ? camp.creator_id : null,
        creator_name: creator ? creator.name : 'Unknown Creator',
        creator_email: creator ? creator.email : '',
        creator_department: creator ? creator.department : '',
        creator_status: creator ? (creator.status || 'active') : 'active'
      };
    });
    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: enriched };
  }

  if (queryStr.includes('insert into campaign_reports')) {
    let campaign_id, reporter_id, reporter_name, reporter_email, reason, description;
    if (params.length >= 6) {
      [campaign_id, reporter_id, reporter_name, reporter_email, reason, description] = params;
    } else {
      [campaign_id, reason, description] = params;
    }
    const newReport = {
      id: (inMemoryStore.campaign_reports || []).length + 1,
      campaign_id: parseInt(campaign_id, 10),
      reporter_id: reporter_id ? parseInt(reporter_id, 10) : null,
      reporter_name: reporter_name || 'Campus Member',
      reporter_email: reporter_email || '',
      reason: reason || 'Policy Violation',
      description: description || '',
      status: 'pending',
      admin_notes: null,
      created_at: new Date().toISOString()
    };
    if (!inMemoryStore.campaign_reports) inMemoryStore.campaign_reports = [];
    inMemoryStore.campaign_reports.push(newReport);
    return { rows: [newReport] };
  }

  if (queryStr.includes('update campaign_reports') && queryStr.includes('status =')) {
    // UPDATE campaign_reports SET status = $1, admin_notes = $2 WHERE id = $3
    const [status, admin_notes, id] = params;
    const report = (inMemoryStore.campaign_reports || []).find(r => r.id === parseInt(id, 10));
    if (report) {
      report.status = status;
      if (admin_notes !== undefined) report.admin_notes = admin_notes;
      return { rows: [report] };
    }
    return { rows: [] };
  }

  // UPDATES QUERIES
  if (queryStr.includes('from campaign_updates') || queryStr.includes('from "campaign_updates"')) {
    const campaignId = parseInt(params[0], 10);
    const list = inMemoryStore.updates.filter(u => u.campaign_id === campaignId);
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: list };
  }

  if (queryStr.includes('insert into campaign_updates')) {
    const [campaign_id, title, content, image, pdf_url, pdf_name] = params;
    const newUpdate = {
      id: inMemoryStore.updates.length + 1,
      campaign_id: parseInt(campaign_id, 10),
      title,
      content,
      image: image || null,
      pdf_url: pdf_url || null,
      pdf_name: pdf_name || null,
      created_at: new Date().toISOString()
    };
    inMemoryStore.updates.push(newUpdate);
    return { rows: [newUpdate] };
  }

  // COMMENTS QUERIES
  if (queryStr.includes('delete from campaign_comments where id =')) {
    const id = parseInt(params[0], 10);
    const idx = (inMemoryStore.comments || []).findIndex(c => c.id === id);
    if (idx !== -1) {
      const deleted = inMemoryStore.comments.splice(idx, 1)[0];
      return { rows: [deleted] };
    }
    return { rows: [] };
  }

  if (queryStr.includes('from campaign_comments') || queryStr.includes('from "campaign_comments"')) {
    let list = inMemoryStore.comments || [];

    // Single comment lookup:
    if (queryStr.includes('where id = $') || queryStr.includes('where c.id = $')) {
      const commentId = parseInt(params[0], 10);
      const c = list.find(item => item.id === commentId);
      return { rows: c ? [c] : [] };
    }

    // Filter by user_id if present
    const userMatch = queryStr.match(/c\.user_id = \$(\d+)|user_id = \$(\d+)/);
    if (userMatch && params) {
      const pIdx = parseInt(userMatch[1] || userMatch[2], 10) - 1;
      const targetUserId = parseInt(params[pIdx], 10);
      list = list.filter(c => c.user_id === targetUserId);
    }

    // Filter by campaign_id if present
    const campMatch = queryStr.match(/c\.campaign_id = \$(\d+)|campaign_id = \$(\d+)/);
    if (campMatch && params) {
      const pIdx = parseInt(campMatch[1] || campMatch[2], 10) - 1;
      const targetCampId = parseInt(params[pIdx], 10);
      list = list.filter(c => c.campaign_id === targetCampId);
    }

    let enriched = list.map(c => {
      const u = inMemoryStore.users.find(user => user.id === c.user_id);
      const camp = inMemoryStore.campaigns.find(cp => cp.id === c.campaign_id);
      return {
        ...c,
        user_name: u ? u.name : 'Campus Backer',
        user_email: u ? u.email : '',
        user_department: u ? u.department : 'University Department',
        user_type: u ? (u.user_type || u.userType) : 'Student',
        campaign_title: camp ? camp.title : 'University Initiative',
        campaign_category: camp ? camp.category : 'General'
      };
    });

    // Search filter if present
    const searchMatch = queryStr.match(/ilike \$(\d+)/);
    if (searchMatch && params) {
      const pIdx = parseInt(searchMatch[1], 10) - 1;
      const rawTerm = (params[pIdx] || '').replace(/%/g, '').toLowerCase().trim();
      if (rawTerm) {
        enriched = enriched.filter(c =>
          (c.content && c.content.toLowerCase().includes(rawTerm)) ||
          (c.user_name && c.user_name.toLowerCase().includes(rawTerm)) ||
          (c.campaign_title && c.campaign_title.toLowerCase().includes(rawTerm))
        );
      }
    }

    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: enriched };
  }

  if (queryStr.includes('insert into campaign_comments')) {
    const [campaign_id, user_id, content] = params;
    const user = inMemoryStore.users.find(u => u.id === parseInt(user_id, 10));
    const newComment = {
      id: (inMemoryStore.comments || []).length + 1,
      campaign_id: parseInt(campaign_id, 10),
      user_id: parseInt(user_id, 10),
      content,
      created_at: new Date().toISOString(),
      user_name: user ? user.name : 'Campus Backer',
      user_department: user ? user.department : 'University Department',
      user_type: user ? user.user_type : 'Student'
    };
    if (!inMemoryStore.comments) inMemoryStore.comments = [];
    inMemoryStore.comments.push(newComment);
    return { rows: [newComment] };
  }

  // DONATIONS QUERIES
  if (queryStr.includes('from donations') || queryStr.includes('from "donations"')) {
    let list = inMemoryStore.donations || [];

    if (queryStr.includes('user_id = $1') || queryStr.includes('d.user_id = $1')) {
      const userId = parseInt(params[0], 10);
      const userDonations = list.filter(d => d.user_id === userId);
      const enriched = userDonations.map(d => {
        const camp = inMemoryStore.campaigns.find(c => c.id === d.campaign_id);
        const creator = camp ? inMemoryStore.users.find(u => u.id === camp.creator_id) : null;
        return {
          ...d,
          campaign_title: camp ? camp.title : 'University Campaign',
          campaign_category: camp ? camp.category : 'General',
          campaign_image: camp ? camp.image : null,
          creator_name: creator ? creator.name : 'Campaign Creator'
        };
      });
      enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return { rows: enriched };
    }

    if (params && params.length > 0 && (queryStr.includes('campaign_id = $1') || queryStr.includes('campaign_id ='))) {
      const campaignId = parseInt(params[0], 10);
      list = list.filter(d => d.campaign_id === campaignId);
    }

    list.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    return { rows: list.slice(0, 20) };
  }

  if (queryStr.includes('insert into donations')) {
    const [campaign_id, donor_name, amount, payment_method] = params;
    const newDonation = {
      id: inMemoryStore.donations.length + 1,
      campaign_id: parseInt(campaign_id, 10),
      donor_name: donor_name || 'Anonymous Backer',
      amount: parseFloat(amount),
      payment_method: payment_method || 'bKash',
      created_at: new Date().toISOString()
    };
    inMemoryStore.donations.push(newDonation);
    return { rows: [newDonation] };
  }

  return { rows: [] };
}
