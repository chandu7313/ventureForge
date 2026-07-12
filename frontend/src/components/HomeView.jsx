import { useState } from "react";
import { Search, Zap } from "lucide-react";

export default function HomeView({ onSearch, recentSearches }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="home-view">
      <div className="home-logo-container">
        <div className="home-square"></div>
        <h1 className="home-title">EQUITYMETRIC</h1>
        <p className="home-subtitle">Institutional Grade Investment Research</p>
      </div>

      <form className="search-container" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Enter a company name or ticker..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="search-btn" disabled={!query.trim()}>
            Research
          </button>
        </div>
      </form>

      <div className="section-label">SUGGESTED COVERAGE</div>
      <div className="suggested-chips">
        <div className="chip" onClick={() => onSearch("Tata Motors")}>
          <div className="dot green"></div> Tata Motors <span className="chip-ticker">TTM</span>
        </div>
        <div className="chip" onClick={() => onSearch("Infosys")}>
          <div className="dot green"></div> Infosys <span className="chip-ticker">INFY</span>
        </div>
        <div className="chip" onClick={() => onSearch("Zomato")}>
          <div className="dot green"></div> Zomato <span className="chip-ticker">ZOMATO</span>
        </div>
        <div className="chip" onClick={() => onSearch("HDFC Bank")}>
          <div className="dot red"></div> HDFC Bank <span className="chip-ticker">HDB</span>
        </div>
      </div>

      {recentSearches && recentSearches.length > 0 && (
        <div className="recent-searches-container">
          <div className="section-label">RECENT SEARCHES</div>
          <div className="recent-grid">
            {recentSearches.slice(0, 3).map((item, idx) => {
              const isInvest = item.verdict === "INVEST";
              
              // Simple relative time approximation
              const diffMs = Date.now() - new Date(item.timestamp).getTime();
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMins / 60);
              let timeStr = "Just now";
              if (diffMins > 0 && diffMins < 60) timeStr = `${diffMins} mins ago`;
              else if (diffHours > 0 && diffHours < 24) timeStr = `${diffHours} hours ago`;
              else if (diffHours >= 24) timeStr = "Yesterday";

              return (
                <div key={idx} className="recent-card" onClick={() => onSearch(item.companyName)}>
                  <div className="recent-card-top">
                    <div className="recent-company">{item.companyName}</div>
                    <Zap size={16} className="lightning-icon" />
                  </div>
                  <div className="recent-badges">
                    <span className={`badge ${isInvest ? "invest" : "pass"}`}>
                      {item.verdict}
                    </span>
                    <span className="badge cached">CACHED</span>
                  </div>
                  <div className="recent-time">{timeStr}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
