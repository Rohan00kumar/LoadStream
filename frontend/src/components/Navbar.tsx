"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = pathname === "/";
  const isSimulate = pathname.startsWith("/simulate");

  return (
    <header className="orbit-header">
      <nav className="orbit-navbar">
        {/* Logo with Gradient and Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/" className="orbit-logo">
            ORBIT
          </Link>
          <span className="nav-badge">AI BALANCER</span>
        </div>

        {/* Desktop Navigation */}
        <div className="orbit-nav desktop-nav">
          <Link
            href="/"
            className={`orbit-nav-link ${isHome ? "orbit-nav-link-active" : ""}`}
          >
            Home
          </Link>
          <Link
            href="/simulate"
            className={`orbit-nav-link ${isSimulate ? "orbit-nav-link-active" : ""}`}
          >
            Simulate
          </Link>
          <Link href="/#features" className="orbit-nav-link">
            Features
          </Link>
          <Link href="/#services" className="orbit-nav-link">
            Services
          </Link>

          {/* Live Status Indicator */}
          <div className="nav-status-pill">
            <span className="nav-pulse-dot" />
            <span>PPO Online</span>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-nav-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        {/* Mobile Dropdown Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <Link
            href="/"
            className={`orbit-nav-link ${isHome ? "orbit-nav-link-active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/simulate"
            className={`orbit-nav-link ${isSimulate ? "orbit-nav-link-active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Simulate Labs
          </Link>
          <Link
            href="/#features"
            className="orbit-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="/#services"
            className="orbit-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Services
          </Link>

          <div className="nav-status-pill" style={{ width: "fit-content", marginTop: "4px" }}>
            <span className="nav-pulse-dot" />
            <span>System Active</span>
          </div>
        </div>
      </nav>
    </header>
  );
}
