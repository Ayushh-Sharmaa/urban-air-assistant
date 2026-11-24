"use client";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container page-pad">
      <div className="not-found-wrap">
        <AlertTriangle size={60} style={{ color: "var(--coral)", margin: "0 auto 1rem" }} />
        <h1>Something went wrong</h1>
        <p className="not-found-msg" style={{ fontSize: "1rem" }}>
          {error.message ?? "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-2" style={{ justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn" onClick={reset}>
            <RefreshCw size={16} /> Try again
          </button>
          <Link href="/" className="btn btn-outline">
            <Home size={16} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

