import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/campfund';

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
      password: '$2a$10$89.Q9mJkOQpC.l3p2bN2e.fC.s6fM/S9v4aJg1A8k0P0o7XyK9A.O', // 12345678
      department: 'Computer Science',
      user_type: 'Student',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Dr. Robert Chen',
      email: 'r.chen@university.edu',
      password: '$2a$10$89.Q9mJkOQpC.l3p2bN2e.fC.s6fM/S9v4aJg1A8k0P0o7XyK9A.O', // 12345678
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
      goal_amount: 5001,
      creator_id: 2,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Student Emergency Medical Support Fund',
      description: 'Raising funds to support fellow student Sarah who needs urgent cardiac procedure assistance.',
      goal_amount: 12000,
      creator_id: 1,
      created_at: new Date().toISOString()
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

  if (queryStr.includes('insert into campaigns')) {
    const [title, description, goal_amount, creator_id] = params;
    const newCampaign = {
      id: inMemoryStore.campaigns.length + 1,
      title,
      description,
      goal_amount: parseFloat(goal_amount),
      creator_id: parseInt(creator_id, 10),
      created_at: new Date().toISOString()
    };
    inMemoryStore.campaigns.push(newCampaign);
    return { rows: [newCampaign] };
  }

  return { rows: [] };
}
