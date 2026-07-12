import { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import HomeView from "./components/HomeView.jsx";
import LoadingView from "./components/LoadingView.jsx";
import ResultView from "./components/ResultView.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function App() {
  const [view, setView] = useState("HOME"); // HOME, LOADING, RESULT
  const [searchQuery, setSearchQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    fetchRecentSearches();
  }, []);

  async function fetchRecentSearches() {
    try {
      const res = await fetch(`${API_URL}/api/recent-searches`);
      if (res.ok) {
        const data = await res.json();
        setRecentSearches(data);
      }
    } catch (err) {
      console.error("Failed to fetch recent searches", err);
    }
  }

  async function handleResearch(companyName) {
    setSearchQuery(companyName);
    setView("LOADING");
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
      setView("RESULT");
      fetchRecentSearches();
    } catch (err) {
      setError(err.message || "Something went wrong");
      setView("HOME");
    }
  }

  return (
    <div className="app-container">
      {view !== "HOME" && <Header />}

      <main className="main-content">
        {view === "HOME" ? (
          <HomeView onSearch={handleResearch} recentSearches={recentSearches} />
        ) : (
          <div className="content-wrapper">
            {error && <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>}
            
            {view === "LOADING" && <LoadingView companyName={searchQuery} />}
            
            {view === "RESULT" && result && (
              <ResultView data={result} onReset={() => setView("HOME")} />
            )}
          </div>
        )}
      </main>

      {view !== "HOME" && <Footer />}
    </div>
  );
}
