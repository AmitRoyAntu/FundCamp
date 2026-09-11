-- Seed Script for FundCamp

INSERT INTO users (name, email, password, department, user_type)
VALUES 
('Sarah Jenkins', 'sarah.j@university.edu', '$2b$10$44CiuM.wN1E3ENkFx/zlW.ZX3JgNhYtkQNs1w5.1A6TzyFq0yOIbq', 'Computer Science', 'Student'),
('Dr. Robert Chen', 'r.chen@university.edu', '$2b$10$44CiuM.wN1E3ENkFx/zlW.ZX3JgNhYtkQNs1w5.1A6TzyFq0yOIbq', 'Robotics Lab', 'Faculty'),
('Campus Administrator', 'admin@university.edu', '$2b$10$44CiuM.wN1E3ENkFx/zlW.ZX3JgNhYtkQNs1w5.1A6TzyFq0yOIbq', 'Office of Student Affairs & Research Administration', 'Admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO campaigns (title, description, category, department, image, goal_amount, amount_raised, tags, status, documents, creator_id)
VALUES 
('Robotics Lab Equipment Upgrade', 'Funding for high-precision sensors and microcontrollers for the university robotics competition team.', 'Research', 'Robotics Lab', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200', 5001.00, 3200.00, ARRAY['Robotics', 'Hardware', 'Microcontrollers', 'Competition'], 'approved', '[{"name":"Lab_Budget_Breakdown.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","type":"application/pdf","size":"142 KB"},{"name":"Faculty_Advisor_Endorsement.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","type":"application/pdf","size":"98 KB"}]'::jsonb, 2),
('Student Emergency Medical Support Fund', 'Raising funds to support fellow student Sarah who needs urgent cardiac procedure assistance.', 'Medical', 'Computer Science', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1200', 12000.00, 8500.00, ARRAY['MedicalEmergency', 'StudentAid', 'Urgent'], 'approved', '[{"name":"Hospital_Admission_Letter.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","type":"application/pdf","size":"215 KB"},{"name":"University_Medical_Board_Approval.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","type":"application/pdf","size":"180 KB"}]'::jsonb, 1),
('Autonomous Campus Drone Delivery System', 'Research grant to build an AI-powered payload quadcopter for delivering critical medical supplies across campus faculties.', 'Research', 'Electrical & Electronic Engineering', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=1200', 8500.00, 0.00, ARRAY['Drones', 'AI', 'Logistics', 'Robotics'], 'pending', '[{"name":"Department_Approval_Letter.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","type":"application/pdf","size":"184 KB"},{"name":"Student_ID_Cards_Team.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","type":"application/pdf","size":"320 KB"},{"name":"Bill_of_Materials_Quotation.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","type":"application/pdf","size":"145 KB"}]'::jsonb, 2),
('Urgent Chemotherapy Aid for Student Kabir', 'Freshman student Kabir from Department of CSE has been diagnosed with Acute Lymphoblastic Leukemia requiring intensive chemotherapy sessions.', 'Medical', 'Computer Science', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1200', 25000.00, 0.00, ARRAY['MedicalEmergency', 'Chemotherapy', 'StudentWelfare'], 'pending', '[{"name":"Specialist_Doctor_Prescription.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","type":"application/pdf","size":"410 KB"},{"name":"Hospital_Cost_Estimate_Certificate.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","type":"application/pdf","size":"290 KB"},{"name":"University_Student_ID.pdf","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","type":"application/pdf","size":"115 KB"}]'::jsonb, 1)
ON CONFLICT DO NOTHING;

INSERT INTO donations (campaign_id, user_id, donor_name, amount, payment_method, created_at)
VALUES 
(1, 1, 'Sarah Jenkins', 1500.00, 'bKash', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(1, NULL, 'Alumni Network supporter', 1700.00, 'Card', CURRENT_TIMESTAMP - INTERVAL '12 hours'),
(2, 2, 'Dr. Robert Chen', 3000.00, 'Card', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(2, NULL, 'CSE Alumni Association', 3500.00, 'bKash', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, NULL, 'University Student Welfare Club', 2000.00, 'Nagad', CURRENT_TIMESTAMP - INTERVAL '1 day')
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

INSERT INTO expense_receipts (campaign_id, title, amount, vendor, category, receipt_url, receipt_name, status, admin_notes)
VALUES
(1, 'STM32F407 Microcontrollers Bulk Purchase (10x Units)', 1450.00, 'TechShop BD Ltd.', 'Hardware/Equipment', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800', 'Invoice-TSBD-8921.jpg', 'verified', 'Verified with original supplier invoice and lab inventory log.'),
(1, 'Ultrasonic & LiDAR Range Sensors Calibration Kit', 1200.00, 'RoboTech Components Ltd.', 'Hardware/Sensors', 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=800', 'Invoice-RoboTech-4029.jpg', 'pending', 'Submitted by Dr. Chen; pending verification of shipment packing slip.')
ON CONFLICT DO NOTHING;
