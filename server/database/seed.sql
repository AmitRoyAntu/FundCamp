-- Seed Script for FundCamp

INSERT INTO users (name, email, password, department, user_type)
VALUES 
('Sarah Jenkins', 'sarah.j@university.edu', '$2a$10$89.Q9mJkOQpC.l3p2bN2e.fC.s6fM/S9v4aJg1A8k0P0o7XyK9A.O', 'Computer Science', 'Student'),
('Dr. Robert Chen', 'r.chen@university.edu', '$2a$10$89.Q9mJkOQpC.l3p2bN2e.fC.s6fM/S9v4aJg1A8k0P0o7XyK9A.O', 'Robotics Lab', 'Faculty')
ON CONFLICT (email) DO NOTHING;

INSERT INTO campaigns (title, description, goal_amount, creator_id)
VALUES 
('Robotics Lab Equipment Upgrade', 'Funding for high-precision sensors and microcontrollers for the university robotics competition team.', 5001.00, 2),
('Student Emergency Medical Support Fund', 'Raising funds to support fellow student Sarah who needs urgent cardiac procedure assistance.', 12000.00, 1)
ON CONFLICT DO NOTHING;
