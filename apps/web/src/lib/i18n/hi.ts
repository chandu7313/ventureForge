import { TranslationKey } from './en';

export const hi: Record<TranslationKey, string> = {
  // Navigation & Global
  'nav.dashboard': 'डैशबोर्ड (Dashboard)',
  'nav.newReport': 'नई रिपोर्ट (New Report)',
  'nav.billing': 'बिलिंग (Billing)',
  'nav.settings': 'सेटिंग्स (Settings)',
  'nav.logout': 'लॉग आउट (Log Out)',
  'nav.upgrade': 'प्लान अपग्रेड करें',

  // Validation Wizard
  'wizard.step1.title': 'विचार (The Idea)',
  'wizard.step1.desc': 'आप क्या बना रहे हैं?',
  'wizard.step2.title': 'विवरण (Context & Details)',
  'wizard.step2.desc': 'लक्षित बाज़ार और शर्तें',
  'wizard.step3.title': 'समीक्षा करें (Review & Confirm)',
  'wizard.step3.desc': 'रिपोर्ट बनाने के लिए तैयार',
  'wizard.next': 'अगला कदम (Next Step)',
  'wizard.back': 'पीछे (Back)',
  'wizard.submit': 'पूरी रिपोर्ट बनाएँ',
  'wizard.generating': 'आपकी व्यापक StartupIQ रिपोर्ट बन रही है...',

  // Wizard Fields
  'field.startupName': 'स्टार्टअप का नाम',
  'field.startupName.placeholder': 'उदाहरण: FarmAI',
  'field.problem': 'समस्या (The Problem)',
  'field.problem.placeholder': 'आप कौन सी विशिष्ट समस्या हल कर रहे हैं?',
  'field.targetUsers': 'लक्षित उपयोगकर्ता (Target Users)',
  'field.targetUsers.placeholder': 'उदाहरण: छोटे किसान',
  'field.industry': 'उद्योग (Industry)',
  'field.geography': 'भूगोल (Geography)',
  'field.geography.placeholder': 'उदाहरण: भारत, वैश्विक',
  'field.stage': 'वर्तमान चरण (Current Stage)',
  'field.teamSize': 'टीम का आकार (Team Size)',
  'field.budget': 'उपलब्ध बजट (Available Budget)',
  'field.budget.placeholder': 'उदाहरण: ₹5 लाख से कम',
  'field.primarySkill': 'प्राथमिक कौशल (Primary Skill)',
  'field.primarySkill.placeholder': 'उदाहरण: तकनीकी, बिक्री',
  'field.focusIndia': 'भारतीय बाजार पर ध्यान दें (Focus on Indian market)',

  // Report Dashboard
  'report.tabs.market': 'बाज़ार (Market)',
  'report.tabs.competitors': 'प्रतिस्पर्धी (Competitors)',
  'report.tabs.risks': 'जोखिम (Risks)',
  'report.tabs.monetization': 'मुद्रीकरण (Monetization)',
  'report.tabs.roadmap': 'MVP रोडमैप (Roadmap)',
  'report.tabs.gtm': 'गो-टू-मार्केट (GTM)',
  'report.tabs.investor': 'निवेशक स्कोर (Investor Score)',
  'report.tabs.pitch': 'पिच डेक (Pitch Deck)',
  'report.downloadPdf': 'PDF डाउनलोड करें',

  // Score Labels
  'score.idea': 'आइडिया स्कोर (Idea Score)',
  'score.market': 'बाज़ार स्कोर (Market Score)',
  'score.moat': 'खाई स्कोर (Moat Score)',
  'score.risk': 'जोखिम स्कोर (Risk Score)',
  'score.investor': 'निवेशक स्कोर (Investor Score)',
};
