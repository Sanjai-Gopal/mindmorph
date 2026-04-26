"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/study", label: "Study Session" },
  { href: "/transform", label: "Content Transform" },
  { href: "/analytics", label: "Analytics" },
  { href: "/profile", label: "Profile" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-white/10 bg-white/[0.02] p-4 md:w-64 md:border-b-0 md:border-r">
      <nav className="flex gap-2 md:flex-col">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-2 text-sm transition ${
              pathname.startsWith(link.href)
                ? "bg-cyan-400/20 font-semibold text-cyan-200"
                : "text-gray-200 hover:bg-white/5 hover:text-cyan-300"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
