"use client";
import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { Wind, Menu, X, Home, Calendar, House, Car, BarChart2, MessageSquare, Users, BookOpen, HeartHandshake, Layers } from "lucide-react";
import { usePathname } from "next/navigation";
import HackathonDemoBar from "./HackathonDemoBar";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  // Close on navigation
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        navRef.current && !navRef.current.contains(e.target as Node) &&
        burgerRef.current && !burgerRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const OVERVIEW_LINKS = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/planner", label: "Daily Planner", icon: Calendar },
  ];

  const ENVIRONMENT_LINKS = [
    { href: "/indoor", label: "Indoor Coach", icon: House },
    { href: "/commute", label: "Smart Commute", icon: Car },
    { href: "/impact", label: "My Impact", icon: BarChart2 },
  ];

  const DISCOVER_LINKS = [
    { href: "/assistant", label: "AI Assistant", icon: MessageSquare },
    { href: "/research", label: "Research", icon: BookOpen },
    { href: "/community", label: "Community", icon: Users },
    { href: "/onboarding", label: "Household Profile", icon: HeartHandshake },
  ];

  return (
    <>
      <Suspense fallback={null}>
        <HackathonDemoBar />
      </Suspense>
      <header className="header">
        <div className="container">
          <Link href="/" className="logo" aria-label="URBAN AIR — Environmental Intelligence">
            <Wind size={22} style={{ color: "var(--coral)" }} />
            <span>URBAN</span>AIR
          </Link>

          <button
            ref={burgerRef}
            className="burger"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop Navigation */}
          <nav
            ref={navRef}
            id="main-nav"
            className={`nav desktop-nav${open ? " open" : ""}`}
            aria-label="Main application sections"
          >
            {/* OVERVIEW */}
            {OVERVIEW_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={pathname === l.href ? "active" : ""}
                onClick={() => setOpen(false)}
                aria-current={pathname === l.href ? "page" : undefined}
              >
                {l.label}
              </Link>
            ))}

            {/* YOUR ENVIRONMENT */}
            {ENVIRONMENT_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={pathname === l.href ? "active" : ""}
                onClick={() => setOpen(false)}
                aria-current={pathname === l.href ? "page" : undefined}
              >
                {l.label}
              </Link>
            ))}

            {/* DISCOVER */}
            {DISCOVER_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={pathname === l.href ? "active" : ""}
                onClick={() => setOpen(false)}
                aria-current={pathname === l.href ? "page" : undefined}
              >
                {l.label}
              </Link>
            ))}

            <Link href="/assistant" className="btn btn-sm" style={{ marginLeft: ".5rem" }} onClick={() => setOpen(false)}>
              <MessageSquare size={13} /> Ask AI
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Mobile quick navigation">
        <div className="mobile-bottom-nav-inner">
          <Link href="/" className={`mobile-bottom-item ${pathname === "/" ? "active" : ""}`}>
            <Home size={18} />
            <span>Air</span>
          </Link>
          <Link href="/planner" className={`mobile-bottom-item ${pathname === "/planner" ? "active" : ""}`}>
            <Calendar size={18} />
            <span>Planner</span>
          </Link>
          <Link href="/indoor" className={`mobile-bottom-item ${pathname === "/indoor" ? "active" : ""}`}>
            <House size={18} />
            <span>Indoor</span>
          </Link>
          <Link href="/commute" className={`mobile-bottom-item ${pathname === "/commute" ? "active" : ""}`}>
            <Car size={18} />
            <span>Commute</span>
          </Link>
          <Link href="/assistant" className={`mobile-bottom-item ${pathname === "/assistant" ? "active" : ""}`}>
            <MessageSquare size={18} />
            <span>AI</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
