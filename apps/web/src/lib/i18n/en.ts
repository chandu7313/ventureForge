export const en = {
  // Navigation & Global
  'nav.dashboard': 'Dashboard',
  'nav.newReport': 'New Report',
  'nav.billing': 'Billing',
  'nav.settings': 'Settings',
  'nav.logout': 'Log Out',
  'nav.upgrade': 'Upgrade Plan',

  // Validation Wizard
  'wizard.step1.title': 'The Idea',
  'wizard.step1.desc': 'What are you building?',
  'wizard.step2.title': 'Context & Details',
  'wizard.step2.desc': 'Target market and constraints',
  'wizard.step3.title': 'Review & Confirm',
  'wizard.step3.desc': 'Ready to generate',
  'wizard.next': 'Next Step',
  'wizard.back': 'Back',
  'wizard.submit': 'Generate full report',
  'wizard.generating': 'Generating your comprehensive StartupIQ report',

  // Wizard Fields
  'field.startupName': 'Startup Name',
  'field.startupName.placeholder': 'e.g. FarmAI',
  'field.problem': 'The Problem',
  'field.problem.placeholder': 'What specific problem are you solving?',
  'field.targetUsers': 'Target Users',
  'field.targetUsers.placeholder': 'e.g. Small-scale farmers',
  'field.industry': 'Industry',
  'field.geography': 'Geography',
  'field.geography.placeholder': 'e.g. India, Global',
  'field.stage': 'Current Stage',
  'field.teamSize': 'Team Size',
  'field.budget': 'Available Budget',
  'field.budget.placeholder': 'e.g. Under ₹5L',
  'field.primarySkill': 'Primary Skill',
  'field.primarySkill.placeholder': 'e.g. Technical, Sales',
  'field.focusIndia': 'Focus on Indian market (injects local intelligence)',

  // Report Dashboard
  'report.tabs.market': 'Market',
  'report.tabs.competitors': 'Competitors',
  'report.tabs.risks': 'Risks',
  'report.tabs.monetization': 'Monetization',
  'report.tabs.roadmap': 'MVP Roadmap',
  'report.tabs.gtm': 'GTM',
  'report.tabs.investor': 'Investor Score',
  'report.tabs.pitch': 'Pitch Deck',
  'report.downloadPdf': 'Download PDF',

  // Score Labels
  'score.idea': 'Idea Score',
  'score.market': 'Market Score',
  'score.moat': 'Moat Score',
  'score.risk': 'Risk Score',
  'score.investor': 'Investor Score',
};

export type TranslationKey = keyof typeof en;
