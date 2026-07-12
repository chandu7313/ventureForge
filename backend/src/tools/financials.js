const FMP_BASE = "https://financialmodelingprep.com/api/v3";

export async function fetchFinancials(ticker) {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) throw new Error("FMP_API_KEY not set");

  const [profileRes, ratiosRes] = await Promise.all([
    fetch(`${FMP_BASE}/profile/${ticker}?apikey=${apiKey}`),
    fetch(`${FMP_BASE}/ratios-ttm/${ticker}?apikey=${apiKey}`),
  ]);

  const profileData = await profileRes.json();
  const ratiosData = await ratiosRes.json();

  const profile = Array.isArray(profileData) && profileData.length > 0
    ? profileData[0]
    : null;

  const ratios = Array.isArray(ratiosData) && ratiosData.length > 0
    ? ratiosData[0]
    : null;

  return { profile, ratios };
}
