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
        {/* Clean Logo */}
        <Link href="/" className="orbit-logo">
          ORBIT
        </Link>

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
            Simulate
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
        </div>
      </nav>
    </header>
  );
}
