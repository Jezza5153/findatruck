'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuSquare, LineChart, CalendarClock, CreditCard, Edit, Eye } from "lucide-react";

const menu = [
  { href: "/owner/dashboard", label: "Dashboard", icon: <MenuSquare /> },
  { href: "/owner/profile", label: "Truck Profile", icon: <Edit /> },
  { href: "/owner/menu", label: "Menu", icon: <MenuSquare /> },
  { href: "/owner/schedule", label: "Schedule", icon: <CalendarClock /> },
  { href: "/owner/orders", label: "Orders", icon: <Eye /> },
  { href: "/owner/analytics", label: "Analytics", icon: <LineChart /> },
  { href: "/owner/billing", label: "Billing", icon: <CreditCard /> },
];

const OwnerSidebar = () => {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] px-4 py-6">
      <nav className="space-y-1">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-2 rounded-lg transition font-medium text-base gap-3 ${
              pathname === item.href
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-primary))]"
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
