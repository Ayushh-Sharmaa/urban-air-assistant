import type { Metadata } from "next";
import Link from "next/link";
import { Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist. Return to the Urban Air Quality Assistant dashboard.",
};

export default function NotFound() {
  return (
    <div className="container page-pad">
      <div className="not-found-wrap">
        <div className="not-found-code" aria-hidden>404</div>
        <h1 style={{ fontSize: "1.75rem" }}>Page not found</h1>
        <p className="not-found-msg">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn btn-lg">
          <Home size={18} />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
