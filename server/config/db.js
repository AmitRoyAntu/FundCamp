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
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Dr. Robert Chen',
      email: 'r.chen@university.edu',
      password: '$2b$10$44CiuM.wN1E3ENkFx/zlW.ZX3JgNhYtkQNs1w5.1A6TzyFq0yOIbq', // 12345678
      department: 'Robotics Lab',
      user_type: 'Faculty',
      created_at: new Date().toISOString()
    }
  ],
  campaigns: [
    {
      id: 1,
      title: 'Robotics Lab Equipment Upgrade',
      description: 'Funding for high-precision sensors and microcontrollers for the university robotics competition team.',
      category: 'Research',
      tags: ['Robotics', 'Hardware', 'Microcontrollers', 'Competition'],
      goal_amount: 5001,
      amount_raised: 3200,
      creator_id: 2,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Student Emergency Medical Support Fund',
      description: 'Raising funds to support fellow student Sarah who needs urgent cardiac procedure assistance.',
      category: 'Medical',
      tags: ['MedicalEmergency', 'StudentAid', 'Urgent'],
      goal_amount: 12000,
      amount_raised: 8500,
      creator_id: 1,
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
  ]
};

export const query = async (text, params = []) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    return handleInMemoryQuery(text, params);
  }
};

function handleInMemoryQuery(text, params) {
  const queryStr = text.trim().toLowerCase();

  // USERS QUERIES
  if (queryStr.includes('select * from users where email =')) {
    const email = params[0];
    const user = inMemoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return { rows: user ? [user] : [] };
  }

  if (queryStr.includes('select id, name, email, department, user_type') || queryStr.includes('select * from users where id =')) {
    const id = parseInt(params[0], 10);
    const user = inMemoryStore.users.find(u => u.id === id);
    if (!user) return { rows: [] };
    const { password, ...userWithoutPassword } = user;
    return { rows: [userWithoutPassword] };
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
        creator_department: creator ? creator.department : ''
      }]
    };
  }

  if (queryStr.includes('select c.*, u.name as creator_name')) {
    const campaigns = inMemoryStore.campaigns.map(c => {
      const creator = inMemoryStore.users.find(u => u.id === c.creator_id);
      return {
        ...c,
        creator_name: creator ? creator.name : 'Unknown Creator',
        creator_department: creator ? creator.department : ''
      };
    });
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
    let title, description, category, department, image, goal_amount, tags, creator_id;
    if (params.length === 8) {
      [title, description, category, department, image, goal_amount, tags, creator_id] = params;
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
      tags: Array.isArray(tags) ? tags : [],
      creator_id: parseInt(creator_id, 10),
      created_at: new Date().toISOString()
    };
    inMemoryStore.campaigns.push(newCampaign);
    return { rows: [newCampaign] };
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
  if (queryStr.includes('from campaign_comments') || queryStr.includes('from "campaign_comments"')) {
    const campaignId = parseInt(params[0], 10);
    const list = inMemoryStore.comments
      .filter(c => c.campaign_id === campaignId)
      .map(c => {
        const u = inMemoryStore.users.find(user => user.id === c.user_id);
        return {
          ...c,
          user_name: u ? u.name : 'Campus Backer',
          user_department: u ? u.department : 'University Department',
          user_type: u ? u.user_type : 'Student'
        };
      });
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: list };
  }

  if (queryStr.includes('insert into campaign_comments')) {
    const [campaign_id, user_id, content] = params;
    const user = inMemoryStore.users.find(u => u.id === parseInt(user_id, 10));
    const newComment = {
      id: inMemoryStore.comments.length + 1,
      campaign_id: parseInt(campaign_id, 10),
      user_id: parseInt(user_id, 10),
      content,
      created_at: new Date().toISOString(),
      user_name: user ? user.name : 'Campus Backer',
      user_department: user ? user.department : 'University Department',
      user_type: user ? user.user_type : 'Student'
    };
    inMemoryStore.comments.push(newComment);
    return { rows: [newComment] };
  }

  // DONATIONS QUERIES
  if (queryStr.includes('from donations') || queryStr.includes('from "donations"')) {
    const campaignId = parseInt(params[0], 10);
    const list = inMemoryStore.donations.filter(d => d.campaign_id === campaignId);
    list.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    return { rows: list.slice(0, 10) };
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
