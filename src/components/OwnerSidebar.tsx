'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconLayoutDashboard, IconLineChart, IconCalendarClock, IconEdit, IconEye, IconUtensils } from "@/components/ui/branded-icons";

const menu = [
  { href: "/owner/dashboard", label: "Dashboard", icon: <IconLayoutDashboard className="w-5 h-5" /> },
  { href: "/owner/profile", label: "Truck Profile", icon: <IconEdit className="w-5 h-5" /> },
  { href: "/owner/menu", label: "Menu", icon: <IconUtensils className="w-5 h-5" /> },
  { href: "/owner/schedule", label: "Schedule", icon: <IconCalendarClock className="w-5 h-5" /> },
  { href: "/owner/orders", label: "Orders", icon: <IconEye className="w-5 h-5" /> },
  { href: "/owner/analytics", label: "Analytics", icon: <IconLineChart className="w-5 h-5" /> },
];

const OwnerSidebar = () => {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-asphalt border-r border-subtle px-4 py-6">
      <nav className="space-y-1">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-3 rounded-xl transition-all font-medium text-sm gap-3 ${pathname === item.href
              ? "bg-gradient-to-r from-primary to-yellow-500/80 text-white shadow-lg"
              : "text-warm-secondary hover:bg-elevated hover:text-warm-white"
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

