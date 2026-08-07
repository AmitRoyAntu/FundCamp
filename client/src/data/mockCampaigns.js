export const INITIAL_MOCK_CAMPAIGNS = [
  {
    id: 'camp-1',
    title: 'Autonomous Solar-Powered Campus Transit Shuttle',
    description: 'A student-led engineering initiative to design, construct, and deploy an electric solar shuttle designed to transport students with mobility impairments across campus grounds.',
    category: 'Research',
    goalAmount: 25000,
    amountRaised: 18450,
    creator: {
      name: 'Alex Rivera',
      userType: 'Student',
      universityId: 'STU-2023-4109',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
    },
    department: 'Computer Science & Engineering',
    createdAt: '2026-06-12',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
    story: 'The Autonomous Solar Shuttle project aims to bridge campus transportation gaps for students with disabilities while serving as an open research platform for self-driving technology. Funds raised will go directly toward high-capacity lithium phosphate battery cells, solar PV roof panel integration, optical LIDAR sensors, and chassis manufacturing in the department machine shop.',
    objectives: [
      'Purchase high-resolution LIDAR & camera arrays',
      'Construct lightweight aluminum chassis',
      'Install 400W rooftop solar panel array',
      'Conduct rigorous safety trials with campus security'
    ]
  },
  {
    id: 'camp-2',
    title: '3D Bioprinting Lab Expansion for Cancer Therapeutics',
    description: 'Acquiring high-precision bioprinting equipment to allow undergraduate researchers to fabricate micro-vascular tissue models for targeted chemotherapy testing.',
    category: 'Medical',
    goalAmount: 40000,
    amountRaised: 32100,
    creator: {
      name: 'Dr. Sarah Jenkins',
      userType: 'Faculty',
      universityId: 'FAC-2024-8832',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
    },
    department: 'Biomedical Sciences & Medicine',
    createdAt: '2026-06-20',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1200',
    story: 'Modern oncology research requires lifelike 3D cellular tissue cultures rather than flat Petri dishes. By expanding our 3D Bioprinting Facility, we will provide over 45 undergraduate medical students hands-on research access to test low-toxicity drug delivery vectors on synthetic tumor micro-environments.',
    objectives: [
      'Acquire dual-extruder pneumatic bio-printer',
      'Purchase sterile laminar airflow biological safety cabinet',
      'Fund bio-ink reagents and collagen scaffolding materials',
      'Provide 6 summer undergraduate student research stipends'
    ]
  },
  {
    id: 'camp-3',
    title: 'First-Generation STEM Student Opportunity Endowment',
    description: 'Providing emergency textbook grants, conference travel stipends, and laptop hardware access to first-generation university students pursuing engineering degrees.',
    category: 'Scholarship',
    goalAmount: 15000,
    amountRaised: 15000,
    creator: {
      name: 'Marcus Vance',
      userType: 'Alumni',
      universityId: 'ALU-2018-0912',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
    },
    department: 'Business & Entrepreneurship',
    createdAt: '2026-05-10',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
    story: 'As a first-generation engineering alumnus, I know firsthand the financial stress of hidden course costs—specialized CAD software, high-performance computing laptops, and technical license fees. This fund ensures no student falls behind due to financial barriers.',
    objectives: [
      'Provide 20 laptop hardware packages for incoming freshmen',
      'Fund travel stipends for national IEEE conference presenters',
      'Establish a emergency textbook voucher program'
    ]
  },
  {
    id: 'camp-4',
    title: 'Community Urban Hydroponic Greenhouse Initiative',
    description: 'Transforming an unused rooftop into an automated zero-pesticide hydroponic farm supplying fresh organic produce to local campus food pantries.',
    category: 'Environment',
    goalAmount: 12000,
    amountRaised: 8750,
    creator: {
      name: 'Elena Rostova',
      userType: 'Student',
      universityId: 'STU-2024-1102',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300'
    },
    department: 'Environmental & Agricultural Sciences',
    createdAt: '2026-07-01',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=1200',
    story: 'Food insecurity affects up to 20% of university students nationwide. Our Student Sustainability Collective is constructing a vertical NFT (Nutrient Film Technique) hydroponic system that will harvest up to 300 lbs of leafy greens per month for immediate distribution to campus and community food drives.',
    objectives: [
      'Build weather-resistant rooftop enclosure framing',
      'Install recirculating water pumps and nutrient sensors',
      'Purchase LED grow lighting and organic seed stocks',
      'Host weekly community urban farming workshops'
    ]
  },
  {
    id: 'camp-5',
    title: 'Campus Open Digital Library & Rare Manuscript Digitization',
    description: 'Equipping our university archives with high-resolution overhead scanners to digitize historical university publications, regional maps, and rare manuscripts for public access.',
    category: 'Education',
    goalAmount: 18000,
    amountRaised: 9200,
    creator: {
      name: 'Prof. David Chen',
      userType: 'Faculty',
      universityId: 'FAC-2019-1044',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'
    },
    department: 'Humanities & Social Sciences',
    createdAt: '2026-07-05',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=1200',
    story: 'Preserving our regional history requires making fragile 19th-century manuscripts accessible online without damage. With non-destructive v-shaped book scanners, student archivists will transcribe and host over 10,000 historic documents on an open-access digital commons platform.',
    objectives: [
      'Acquire cold-light LED book scanner with vacuum platen',
      'Purchase archival storage servers and optical character recognition (OCR) tools',
      'Hire 4 student archive interns'
    ]
  },
  {
    id: 'camp-6',
    title: 'AI-Assisted Prosthetics & Assistive Robotics Lab',
    description: 'Designing affordable, custom 3D-printed bionic hands and upper-limb prosthetics integrated with low-latency EMG muscle sensors for pediatric patients.',
    category: 'Research',
    goalAmount: 30000,
    amountRaised: 22400,
    creator: {
      name: 'Maya Patel',
      userType: 'Student',
      universityId: 'STU-2022-7741',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300'
    },
    department: 'Electrical & Electronic Engineering',
    createdAt: '2026-06-28',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
    story: 'Commercial myoelectric prosthetics can cost upwards of $40,000—putting them far out of reach for growing children. Our multidisciplinary robotics team develops lightweight, customizable 3D-printed prosthetic limbs at less than $500 in material costs.',
    objectives: [
      'Develop micro-EMG sensor boards with real-time signal filtering',
      'Source durable motor micro-actuators and silicone grips',
      'Conduct fitting sessions in partnership with local pediatric clinics'
    ]
  },
  {
    id: 'camp-7',
    title: 'Mobile Free Health Clinic for Rural Communities',
    description: 'A student-faculty collaborative outreach converting a sprinter van into a mobile healthcare unit providing free health screenings and dental hygiene to underserved rural areas.',
    category: 'Community',
    goalAmount: 35000,
    amountRaised: 31000,
    creator: {
      name: 'Dr. Robert Lawson',
      userType: 'Faculty',
      universityId: 'FAC-2015-3390',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300'
    },
    department: 'Biomedical Sciences & Medicine',
    createdAt: '2026-06-01',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200',
    story: 'Medical students gain invaluable clinical experience while directly addressing healthcare disparities in surrounding rural counties. Funds will purchase diagnostic ultrasound tools, blood glucose monitoring equipment, and portable exam tables.',
    objectives: [
      'Fit medical van interior with sterile supply storage & generator',
      'Procure point-of-care diagnostic analyzers',
      'Provide monthly free screening clinics serving over 1,000 residents'
    ]
  },
  {
    id: 'camp-8',
    title: 'Zero-Waste Campus Pavilion & Living Design Workshop',
    description: 'An architectural design-build project constructing an outdoor shade pavilion made entirely from upcycled timber, recycled ocean plastics, and bio-composite insulation.',
    category: 'Environment',
    goalAmount: 16000,
    amountRaised: 11200,
    creator: {
      name: 'Sofia Al-Mansoor',
      userType: 'Student',
      universityId: 'STU-2023-9081',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300'
    },
    department: 'Architecture & Design',
    createdAt: '2026-07-10',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    story: 'Our design pavilion showcases sustainable building practices right at the heart of campus. Architecture students will gain hands-on construction experience while transforming salvaged demolition materials into an outdoor study space for all students.',
    objectives: [
      'Collect and refine 2,000 lbs of campus recycled plastic composite',
      'Perform structural stress testing on upcycled timber beams',
      'Erect solar-powered study benches and green living roof'
    ]
  }
];
