/**
 * Dynamic Country Context Generator — VentureForge AI
 *
 * Provides locale-specific business context (currency, regulations, funding landscape,
 * market characteristics) based on the selected country and business type.
 *
 * Never hardcoded to a single country — dynamically adapts to any geography.
 */

interface CountryContextInput {
  country: string;
  state?: string;
  language?: string;
}

interface CountryConfig {
  currency: string;
  currencySymbol: string;
  locale: string;
  context: string;
}

const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  india: {
    currency: 'INR',
    currencySymbol: '₹',
    locale: 'en-IN',
    context: `
India-specific business context:
- Currency: Indian Rupees (₹). Provide amounts in both ₹ Crore and $ Million where applicable.
- Reference relevant government schemes: DPIIT Startup India, MSME Udyam Registration, PLI Scheme, Digital India, Make in India, Mudra Loans, PMEGP.
- Include Indian-specific competitors and local alternatives alongside global players.
- GTM channels specific to India: WhatsApp Business, YouTube (regional), Meesho, IndiaMART, JioMart, Amazon India, Flipkart.
- Customer Acquisition: estimate CAC and ARPU in ₹. Consider India's price-sensitive market.
- Regulatory: mention relevant Indian laws (IT Act, DPDP Act 2023, RBI regulations for fintech, FSSAI for food tech, SEBI for securities).
- Business structures: Sole Proprietorship, Partnership, LLP, Private Limited Company, One Person Company (OPC), Section 8 Company.
- Tax: GST (CGST/SGST/IGST), Income Tax, TDS, Professional Tax, Advance Tax.
- Funding: mention active Indian VCs (Peak XV/Sequoia India, Blume Ventures, Accel India, Lightspeed India, Matrix Partners India), Angel Networks (Indian Angel Network, Mumbai Angels, LetsVenture).
- Payments: UPI, Razorpay, PhonePe, Paytm, Cash on Delivery (CoD) for B2C, e-NACH for recurring.
- Registration portals: MCA (ministry of corporate affairs), Udyam Registration portal, GST portal, FSSAI portal, DPIIT startup recognition.
`,
  },
  'united states': {
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
    context: `
US-specific business context:
- Currency: US Dollars ($). Provide amounts in USD.
- Business structures: Sole Proprietorship, LLC, S-Corp, C-Corp, Partnership, B-Corp.
- Federal registrations: EIN (Employer Identification Number) via IRS, state business registration, DBA filing.
- Tax: Federal Income Tax, State Income Tax (varies by state), Self-Employment Tax, Sales Tax (state-level), Quarterly Estimated Taxes.
- Regulatory: SEC regulations for securities, FDA for food/drugs, FTC for consumer protection, FCC for communications, state-specific licensing.
- Funding: mention US VCs (Sequoia Capital, a16z, Y Combinator, Benchmark, Accel, Greylock), Angel Networks (AngelList, Gust), SBA Loans, grants.gov.
- Payments: Stripe, Square, PayPal, ACH transfers, credit card processing.
- GTM channels: Google Ads, Meta Ads, TikTok, LinkedIn, Amazon, Shopify, direct sales.
- SBA programs: SBA 7(a) loans, SBA 504 loans, SBIR/STTR grants, Microloan program.
- Insurance: General Liability, Professional Liability, Workers' Compensation, Health Insurance mandate.
`,
  },
  'united kingdom': {
    currency: 'GBP',
    currencySymbol: '£',
    locale: 'en-GB',
    context: `
UK-specific business context:
- Currency: British Pounds (£). Provide amounts in GBP.
- Business structures: Sole Trader, Partnership, LLP, Private Limited Company (Ltd), PLC, CIC.
- Registrations: Companies House, HMRC registration, VAT registration (threshold £90,000).
- Tax: Corporation Tax (25%), Income Tax (PAYE), National Insurance, VAT (20% standard), Capital Gains Tax.
- Regulatory: FCA for financial services, Ofcom for telecoms, ICO for data protection (UK GDPR), CMA for competition.
- Funding: SEIS/EIS tax relief schemes for investors, British Business Bank, Innovate UK grants, UK VCs (Balderton, Index Ventures, Atomico, LocalGlobe).
- Payments: Stripe, GoCardless, PayPal, Open Banking, Direct Debit.
- GTM channels: Google Ads, Meta, LinkedIn, Amazon UK, Deliveroo, Just Eat.
`,
  },
  canada: {
    currency: 'CAD',
    currencySymbol: 'C$',
    locale: 'en-CA',
    context: `
Canada-specific business context:
- Currency: Canadian Dollars (C$). Provide amounts in CAD.
- Business structures: Sole Proprietorship, Partnership, Corporation (Federal or Provincial incorporation).
- Registrations: Business Number (BN) from CRA, Provincial business registration, GST/HST registration.
- Tax: Federal Corporate Tax + Provincial Tax, GST/HST, Payroll deductions (CPP, EI).
- Regulatory: Competition Bureau, OSFI for financial, Health Canada, CRTC for communications.
- Funding: BDC (Business Development Bank of Canada), SR&ED tax credits, IRAP (NRC), Canadian VCs (OMERS Ventures, BDC Capital, Real Ventures, Golden Ventures).
- Programs: Canada Small Business Financing Program (CSBFP), Startup Visa Program.
`,
  },
  australia: {
    currency: 'AUD',
    currencySymbol: 'A$',
    locale: 'en-AU',
    context: `
Australia-specific business context:
- Currency: Australian Dollars (A$). Provide amounts in AUD.
- Business structures: Sole Trader, Partnership, Company (Pty Ltd), Trust.
- Registrations: ABN (Australian Business Number), ACN for companies, GST registration (threshold A$75,000), TFN.
- Tax: Company Tax (25% base rate), GST (10%), PAYG withholding, FBT (Fringe Benefits Tax).
- Regulatory: ASIC for companies/financial, ACCC for competition, APRA for financial prudential, TGA for health.
- Funding: R&D Tax Incentive, Export Market Development Grants, Australian VCs (Blackbird Ventures, Square Peg Capital, AirTree Ventures), CSIRO Innovation Fund.
`,
  },
  singapore: {
    currency: 'SGD',
    currencySymbol: 'S$',
    locale: 'en-SG',
    context: `
Singapore-specific business context:
- Currency: Singapore Dollars (S$). Provide amounts in SGD.
- Business structures: Sole Proprietorship, Partnership, LLP, Private Limited Company (Pte Ltd).
- Registrations: ACRA (BizFile+), GST registration (threshold S$1M), CPF registration.
- Tax: Corporate Tax 17% (with partial exemptions for startups), GST 9%, no capital gains tax. Startup Tax Exemption (SUTE) scheme.
- Regulatory: MAS for financial, IMDA for infocomm, HSA for health products, NEA for environmental.
- Funding: Enterprise Singapore grants (EDG, MRA, PSG), SPRING SEEDS Capital, Temasek, GIC. Active VC scene: Vertex Ventures, Golden Gate Ventures, Jungle Ventures, Monk's Hill Ventures.
`,
  },
  uae: {
    currency: 'AED',
    currencySymbol: 'AED',
    locale: 'en-AE',
    context: `
UAE-specific business context:
- Currency: UAE Dirham (AED). Provide amounts in AED.
- Business structures: Mainland LLC, Free Zone Company, Offshore Company. Note: 100% foreign ownership now permitted in many sectors.
- Free Zones: DIFC, ADGM, DMCC, JAFZA, Dubai Internet City, Dubai Media City — each with specific benefits.
- Tax: Corporate Tax 9% (from June 2023, on profits above AED 375,000), VAT 5%, no personal income tax.
- Registrations: Trade License (DED or Free Zone Authority), Ejari, Emirates ID, establishment card.
- Funding: Hub71, DTEC, Sheraa, in5, VCs (BECO Capital, Wamda Capital, Global Ventures, STV).
`,
  },
};

/**
 * Get country-specific context for LLM prompts.
 * Falls back to a generic template for unlisted countries.
 */
export function getCountryContext(input: CountryContextInput): string {
  const countryKey = (input.country || 'India').toLowerCase().trim();
  const config = COUNTRY_CONFIGS[countryKey];

  if (config) {
    let context = config.context;
    if (input.state) {
      context += `\n- State/Region: ${input.state}. Include state/region-specific regulations, taxes, and licenses where applicable.`;
    }
    return context;
  }

  // Generic fallback for any country not pre-configured
  return `
Business context for ${input.country}:
- Provide all monetary amounts in the local currency of ${input.country}.
- Include country-specific business registration requirements and legal structures.
- Mention relevant government programs, grants, and subsidies for businesses in ${input.country}.
- Include local competitors and market players specific to ${input.country}.
- Detail local tax obligations (corporate tax, sales/value-added tax, payroll taxes).
- Mention local venture capital firms, angel networks, and funding programs.
- Include local payment methods and e-commerce platforms.
- Reference applicable regulatory bodies and compliance requirements.
${input.state ? `- State/Region: ${input.state}. Include state/region-specific regulations, taxes, and licenses where applicable.` : ''}
`;
}

/**
 * Get the currency configuration for a country.
 */
export function getCountryCurrency(country: string): { currency: string; symbol: string; locale: string } {
  const countryKey = (country || 'India').toLowerCase().trim();
  const config = COUNTRY_CONFIGS[countryKey];

  if (config) {
    return { currency: config.currency, symbol: config.currencySymbol, locale: config.locale };
  }

  return { currency: 'USD', symbol: '$', locale: 'en-US' };
}

/**
 * Get language instruction for non-English responses.
 */
export function getLanguageInstruction(language?: string): string {
  if (!language || language === 'en') return '';

  const languageMap: Record<string, string> = {
    hi: 'IMPORTANT: Respond entirely in Hindi (Devanagari script). Technical terms, brands, and acronyms can remain in English.',
    es: 'IMPORTANT: Respond entirely in Spanish. Technical terms and brand names can remain in English.',
    fr: 'IMPORTANT: Respond entirely in French. Technical terms and brand names can remain in English.',
    de: 'IMPORTANT: Respond entirely in German. Technical terms and brand names can remain in English.',
    pt: 'IMPORTANT: Respond entirely in Portuguese. Technical terms and brand names can remain in English.',
    ar: 'IMPORTANT: Respond entirely in Arabic. Technical terms and brand names can remain in English.',
    zh: 'IMPORTANT: Respond entirely in Simplified Chinese. Technical terms and brand names can remain in English.',
    ja: 'IMPORTANT: Respond entirely in Japanese. Technical terms and brand names can remain in English.',
    ko: 'IMPORTANT: Respond entirely in Korean. Technical terms and brand names can remain in English.',
  };

  return languageMap[language] || `IMPORTANT: Respond entirely in the language specified by code "${language}".`;
}
