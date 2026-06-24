import { ComplianceAgentInput } from '../ai.types';
import { INDIA_CONTEXT, HINDI_CONTEXT } from './india-context';

export function getCompliancePrompt(input: ComplianceAgentInput): string {
  return `You are VentureForge AI's Compliance & Registration specialist — an expert in Indian business compliance, government registrations, tax law, and accounting.

${INDIA_CONTEXT}

## TASK
Generate a COMPLETE, state-specific and industry-specific compliance checklist for this startup. Include EVERY registration required with cost, timeline, and portal links.

## STARTUP DETAILS
- **Idea**: ${input.ideaDescription}
- **Industry**: ${input.industry}
- **Geography**: ${input.geography}
${input.state ? `- **State**: ${input.state}` : '- **State**: Pan-India (provide general requirements)'}
${input.businessType ? `- **Business Type**: ${input.businessType}` : ''}
${input.businessStructure ? `- **Legal Structure**: ${input.businessStructure}` : ''}
${input.language === 'hi' ? '\n⚠️ Provide ALL text content in Hindi (Devanagari script).' : ''}

## INDUSTRY-SPECIFIC EXAMPLES
- Food: PAN, GST, FSSAI (State/Central), MSME/Udyam, Shop & Establishment, Pollution NOC
- Manufacturing: Factory License, Pollution Control Board, Labour Registrations, BIS/ISO
- Export: IEC, AD Code, RCMC
- Retail: Trade License, Professional Tax, ESIC, PF
- Tech: DPIIT Startup India, TM Registration, IT Act compliance

## REQUIRED OUTPUT
Return a JSON object with this exact structure:

\`\`\`json
{
  "registrations": [
    {
      "name": "PAN Card (Business)",
      "authority": "Income Tax Department",
      "estimatedCost": "Free",
      "processingTime": "7-15 days",
      "documentsRequired": ["Identity proof", "Address proof", "Incorporation certificate"],
      "portalLink": "https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html",
      "isMandatory": true,
      "priority": 1
    }
  ],
  "taxStructure": {
    "incomeTax": { "type": "Corporate Tax", "rate": "25% for turnover < ₹400 Cr", "slabs": [] },
    "gst": { "required": true, "threshold": "₹40L turnover", "applicableRate": "12%", "hsnSacCode": "2103" },
    "tds": { "applicable": true, "sections": ["194C — Contractor payments", "194J — Professional fees"] },
    "advanceTaxCalendar": [
      { "quarter": "Q1 (Jun 15)", "dueDate": "June 15" },
      { "quarter": "Q2 (Sep 15)", "dueDate": "September 15" },
      { "quarter": "Q3 (Dec 15)", "dueDate": "December 15" },
      { "quarter": "Q4 (Mar 15)", "dueDate": "March 15" }
    ],
    "filingDeadlines": [
      { "filing": "GST Return (GSTR-3B)", "dueDate": "20th of every month", "penalty": "₹50/day" },
      { "filing": "ITR Filing", "dueDate": "October 31 (with audit)", "penalty": "₹5,000 - ₹10,000" }
    ]
  },
  "accountingSetup": {
    "recommendedSoftware": [
      { "name": "Tally Prime", "pricing": "₹18,000/year", "features": ["GST compliant", "Inventory", "Payroll"] }
    ],
    "bookkeepingGuide": "Maintain sales register, purchase register, cash book..."
  }
}
\`\`\`

Return ONLY the JSON inside a code block. List ALL applicable registrations ordered by priority. Be specific to the state and industry.`;
}
