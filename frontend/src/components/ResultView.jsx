export default function ResultView({ data, onReset }) {
  const { company, ticker, sector, decision } = data;
  if (!decision) return null;

  const { verdict, confidence, reasoning, risks, keyMetrics } = decision;
  const isInvest = verdict === "INVEST";

  return (
    <div className="result-view">
      <a className="result-back" onClick={onReset}>
        ← Research another company
      </a>

      <div className="result-header">
        <h1 className="result-title">{company}</h1>
        <div className="result-score-container">
          <span className="score-text">Confidence Score</span>
          <span className="score-value">{confidence}%</span>
          <span className={`verdict-btn ${isInvest ? "invest" : "pass"}`}>
            {verdict}
          </span>
        </div>
      </div>

      <div className="result-grid">
        <div className="result-left">
          <h3 className="section-title">Reasoning</h3>
          <div className="reasoning-content">
            {reasoning.map((r, i) => {
              // Try to split into a title and description if there's a colon or period
              // Since Gemini returns bullet points, let's artificially split it for the bold title effect
              let title = `Point ${i + 1}`;
              let desc = r;
              
              // Example heuristic: "Dominant Market Share: Maintaining a duopoly..."
              const splitIdx = r.indexOf(":");
              if (splitIdx > 0 && splitIdx < 50) {
                title = r.substring(0, splitIdx);
                desc = r.substring(splitIdx + 1).trim();
              } else if (r.length > 50) {
                // Just use first 3-4 words as title if no colon
                const words = r.split(" ");
                title = words.slice(0, 4).join(" ");
                desc = r;
              }

              return (
                <div key={i} className="reasoning-item">
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="result-right">
          <h3 className="section-title">Key Metrics</h3>
          <table className="metrics-table">
            <tbody>
              {Object.entries(keyMetrics).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {risks && risks.length > 0 && (
        <div className="risks-section">
          <h3 className="section-title">Key Risks</h3>
          <div className="risks-grid">
            {risks.slice(0, 3).map((r, i) => {
              let title = `Risk Factor ${i + 1}`;
              let desc = r;
              
              const splitIdx = r.indexOf(":");
              if (splitIdx > 0 && splitIdx < 40) {
                title = r.substring(0, splitIdx);
                desc = r.substring(splitIdx + 1).trim();
              } else {
                const words = r.split(" ");
                title = words.slice(0, 3).join(" ");
                desc = r;
              }

              return (
                <div key={i} className="risk-item">
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
