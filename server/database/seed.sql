-- Seed Script for FundCamp

INSERT INTO users (name, email, password, department, user_type)
VALUES 
('Sarah Jenkins', 'sarah.j@university.edu', '$2a$10$89.Q9mJkOQpC.l3p2bN2e.fC.s6fM/S9v4aJg1A8k0P0o7XyK9A.O', 'Computer Science', 'Student'),
('Dr. Robert Chen', 'r.chen@university.edu', '$2a$10$89.Q9mJkOQpC.l3p2bN2e.fC.s6fM/S9v4aJg1A8k0P0o7XyK9A.O', 'Robotics Lab', 'Faculty')
ON CONFLICT (email) DO NOTHING;

INSERT INTO campaigns (title, description, category, department, image, goal_amount, creator_id)
VALUES 
('Robotics Lab Equipment Upgrade', 'Funding for high-precision sensors and microcontrollers for the university robotics competition team.', 'Research', 'Robotics Lab', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200', 5001.00, 2),
('Student Emergency Medical Support Fund', 'Raising funds to support fellow student Sarah who needs urgent cardiac procedure assistance.', 'Medical', 'Computer Science', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1200', 12000.00, 1)
ON CONFLICT DO NOTHING;

INSERT INTO campaign_updates (campaign_id, title, content)
VALUES 
(1, 'Milestone 1 Reached: Microcontrollers Acquired!', 'Thanks to initial backers, we have successfully ordered 10 high-precision STM32 microcontrollers and sensor breakout boards for team calibration.'),
(1, 'Lab Testing Session Scheduled', 'Our engineering team will be hosting an open demonstration next Tuesday in Lab 304 to showcase initial hardware telemetry.')
ON CONFLICT DO NOTHING;

INSERT INTO campaign_comments (campaign_id, user_id, content)
VALUES 
(1, 1, 'So excited for the robotics team! Let me know if you need help with software integration.'),
(1, 2, 'Thank you Sarah! Appreciate the support from CSE department.')
ON CONFLICT DO NOTHING;
