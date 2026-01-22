'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LineChart, CalendarClock, Edit, Eye, Utensils } from "lucide-react";

const menu = [
  { href: "/owner/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/owner/profile", label: "Truck Profile", icon: <Edit className="w-5 h-5" /> },
  { href: "/owner/menu", label: "Menu", icon: <Utensils className="w-5 h-5" /> },
  { href: "/owner/schedule", label: "Schedule", icon: <CalendarClock className="w-5 h-5" /> },
  { href: "/owner/orders", label: "Orders", icon: <Eye className="w-5 h-5" /> },
  { href: "/owner/analytics", label: "Analytics", icon: <LineChart className="w-5 h-5" /> },
];

const OwnerSidebar = () => {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-slate-900 border-r border-slate-700 px-4 py-6">
      <nav className="space-y-1">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-3 rounded-xl transition-all font-medium text-sm gap-3 ${pathname === item.href
                ? "bg-gradient-to-r from-primary to-yellow-500/80 text-white shadow-lg"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default OwnerSidebar;

