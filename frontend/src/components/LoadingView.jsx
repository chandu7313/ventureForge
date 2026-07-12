import { RefreshCcw, User, Paperclip, FileText } from "lucide-react";

export default function LoadingView({ companyName }) {
  return (
    <div className="loading-view">
      <RefreshCcw size={32} className="spin-icon" />
      <h2 className="loading-title">Researching {companyName}...</h2>
      <p className="loading-subtitle">
        Aggregating institutional data, analyzing order flow, and synthesizing market signals.
      </p>

      <div className="progress-indicator">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        Retrieving fundamental data...
      </div>

      <div className="progress-line"></div>

      <div className="mock-terminal">
        <div className="mock-terminal-top">
          <div className="mock-avatar">
            <User size={18} />
          </div>
          <div className="mock-prompt">
            Generate a comprehensive equity research report for {companyName} Ltd. Focus on unit economics, growth trajectory, and competitive moats.
          </div>
        </div>
        <div className="mock-terminal-bottom">
          <div className="mock-icons">
            <Paperclip size={16} />
            <FileText size={16} />
          </div>
          <button className="mock-btn">GENERATE</button>
        </div>
      </div>

      <div className="loading-footer-links">
        <span>SEC Filings</span>
        <span>Price Action</span>
        <span>News Sentiment</span>
      </div>
    </div>
  );
}
