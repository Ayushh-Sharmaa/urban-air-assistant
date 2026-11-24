"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { HeartHandshake } from "lucide-react";

interface Props {
  currentCity: string;
  cities: string[];
}

export default function CitySelector({ currentCity, cities }: Props) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCity = e.target.value;
    router.push(`/?city=${encodeURIComponent(nextCity)}`);
  };

  return (
    <div className="flex justify-center mt-2">
      <form
        method="GET"
        onSubmit={(e) => e.preventDefault()}
        style={{
          display: "inline-flex",
          gap: ".5rem",
          alignItems: "center",
          flexWrap: "wrap",
          background: "rgba(255,255,255,0.08)",
          padding: "0.5rem 0.8rem",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(8px)",
        }}
      >
        <label
          htmlFor="city-select"
          className="text-xs uppercase font-bold"
          style={{ color: "rgba(244,237,224,0.8)" }}
        >
          Station Monitor:
        </label>
        <select
          id="city-select"
          name="city"
          value={currentCity}
          onChange={handleChange}
          style={{
            padding: ".55rem .9rem",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,.25)",
            background: "#14213d",
            color: "#fff",
            fontSize: ".92rem",
            cursor: "pointer",
          }}
        >
          {cities.map((c) => (
            <option key={c} value={c} style={{ color: "#fff", background: "#14213d" }}>
              {c} (Continuous Ambient)
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => router.push(`/?city=${encodeURIComponent(currentCity)}`)}
          className="btn btn-sm"
        >
          Switch Station
        </button>
        <Link
          href="/onboarding"
          className="btn btn-outline btn-sm hide-mobile"
          style={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff" }}
        >
          <HeartHandshake size={13} /> Household Setup
        </Link>
      </form>
    </div>
  );
}

