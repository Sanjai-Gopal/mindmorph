import Link from "next/link";

const links = ["/dashboard", "/study", "/transform", "/analytics", "/profile"];

export function Sidebar() {
  return (
    <aside className="w-full border-b border-white/10 p-4 md:w-64 md:border-b-0 md:border-r">
      <nav className="flex gap-4 md:flex-col">
        {links.map((link) => (
          <Link key={link} href={link} className="text-sm text-gray-200 hover:text-cyan-300">
            {link.replace("/", "")}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
