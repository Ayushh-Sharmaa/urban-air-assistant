"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Wind, Menu, X, Home, Calendar, House, Car, BarChart2, MessageSquare, Users, BookOpen } from "lucide-react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/",           label: "Dashboard",    icon: Home },
  { href: "/planner",    label: "Planner",      icon: Calendar },
  { href: "/indoor",     label: "Indoor",       icon: House },
  { href: "/commute",    label: "Commute",      icon: Car },
  { href: "/impact",     label: "Impact",       icon: BarChart2 },
  { href: "/assistant",  label: "AI Assistant", icon: MessageSquare },
  { href: "/community",  label: "Community",    icon: Users },
  { href: "/research",   label: "Research",     icon: BookOpen },
];

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

  return (
    <header className="header">
      <div className="container">
        <Link href="/" className="logo" aria-label="Urban Air Quality Assistant — go to home">
          Urban<span>Air</span>
        </Link>

        <button
          ref={burgerRef}
          className="burger"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>

        <nav
          ref={navRef}
          id="main-nav"
          className={`nav${open ? " open" : ""}`}
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((l) => (
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
          <Link href="/assistant" className="nav-cta" onClick={() => setOpen(false)}>
            <Wind size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            Ask AI
          </Link>
        </nav>
      </div>
    </header>
  );
}
