import type { CompanyData } from '../types';

export const mockCompanies: CompanyData[] = [
  {
    id: 'google',
    name: 'Google',
    description: 'Google is known for its structured, data-driven interview process with strong emphasis on problem-solving, algorithms, and behavioral questions using the STAR method.',
    commonRoles: ['Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'Business Analyst'],
    interviewStyle: 'Structured with behavioral + technical rounds. Focus on problem-solving and leadership principles.',
    tipsList: [
      'Prepare for algorithmic and system design questions if applying for technical roles.',
      'Use the STAR format for all behavioral questions.',
      'Demonstrate data-driven decision making where possible.',
      'Show curiosity — ask thoughtful questions at the end.',
      'Google values intellectual humility — be honest about what you don\'t know.',
    ],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    description: 'Amazon interviews are heavily based on their 16 Leadership Principles. Every answer should reflect at least one of these principles with concrete examples.',
    commonRoles: ['Software Development Engineer', 'Data Analyst', 'Product Manager', 'Business Analyst', 'Operations Manager'],
    interviewStyle: 'Leadership Principle-focused behavioral interviews combined with technical or analytical assessments.',
    tipsList: [
      'Study all 16 Amazon Leadership Principles and prepare examples for each.',
      'Use the STAR method for every behavioral question.',
      'Quantify your impact — numbers and metrics matter.',
      'Prepare "Tell me about a time when you failed" — Amazon values learning from failure.',
      'Demonstrate customer obsession in every answer where relevant.',
    ],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    description: 'Microsoft focuses on growth mindset, collaboration, and technical excellence. Interviews typically include a mix of behavioral, technical, and design questions.',
    commonRoles: ['Software Engineer', 'Product Manager', 'Data Scientist', 'Cloud Solution Architect', 'Business Development'],
    interviewStyle: 'Collaborative and growth-mindset focused. Mix of technical depth and behavioral questions.',
    tipsList: [
      'Demonstrate a growth mindset — show how you learn from challenges.',
      'Collaboration is key — show how you work effectively with others.',
      'For technical roles, be ready for system design and coding questions.',
      'Show genuine passion for technology and its impact on people.',
      'Be specific about your contributions in team projects.',
    ],
  },
  {
    id: 'infosys',
    name: 'Infosys',
    description: 'Infosys interviews typically include aptitude tests, technical assessments, and HR rounds. They value communication skills, adaptability, and a willingness to learn.',
    commonRoles: ['Systems Engineer', 'Software Developer', 'Business Analyst', 'Data Analyst', 'Consultant'],
    interviewStyle: 'Multi-round process: aptitude → technical → HR. Communication and attitude are important.',
    tipsList: [
      'Prepare for logical reasoning and quantitative aptitude questions.',
      'Know the fundamentals of your technical domain thoroughly.',
      'Show flexibility — Infosys values candidates who adapt across projects.',
      'Communication skills are highly valued — practice speaking clearly.',
      'Be prepared to discuss your career goals and why you want to join Infosys.',
    ],
  },
  {
    id: 'tcs',
    name: 'TCS',
    description: 'TCS uses a standardized selection process including cognitive assessments, technical interviews, and managerial/HR rounds focused on communication and attitude.',
    commonRoles: ['Assistant System Engineer', 'Software Developer', 'Data Analyst', 'Business Analyst', 'IT Analyst'],
    interviewStyle: 'Structured: TCS NQT → technical → managerial/HR. Fundamentals and communication focused.',
    tipsList: [
      'Clear your TCS NQT by practicing coding, verbal, and aptitude sections.',
      'Be strong in programming fundamentals and DBMS concepts.',
      'Practice describing your final year project clearly.',
      'Show that you are a team player and quick learner.',
      'Be prepared for HR questions about relocation and work flexibility.',
    ],
  },
  {
    id: 'zoho',
    name: 'Zoho',
    description: 'Zoho has a unique interview process that focuses heavily on logical thinking, coding skills, and creativity rather than traditional credentials. They value problem-solvers.',
    commonRoles: ['Software Developer', 'Product Engineer', 'Technical Support', 'Marketing Executive', 'UI/UX Designer'],
    interviewStyle: 'Logic and problem-solving focused. Multiple rounds testing thinking ability and technical depth.',
    tipsList: [
      'Focus on logical thinking and coding — Zoho values problem-solvers.',
      'Prepare for pattern-based reasoning and programming challenges.',
      'Show curiosity and a genuine interest in building products.',
      'Zoho values self-learners — demonstrate how you learn independently.',
      'Be honest — Zoho interviews often probe depth of knowledge deeply.',
    ],
  },
];

export const companyNames = mockCompanies.map(c => c.name);
