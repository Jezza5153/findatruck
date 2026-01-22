import React from "react";
import * as Icons from "@/components/ui/branded-icons";

// Helper to categorize icons for the preview (optional, but nice)
const CATEGORIES: Record<string, string[]> = {
    "Hero (Tier 1)": ["IconTruck", "IconMapPin", "IconMap", "IconStar", "IconHeart"],
    "Features (Tier 2)": ["IconSearch", "IconFilter", "IconClock", "IconUtensils", "IconChefHat", "IconBell", "IconBellOff"],
    "Navigation": ["IconArrowLeft", "IconArrowLeftCircle", "IconChevronDown", "IconChevronUp", "IconChevronLeft", "IconChevronRight", "IconNavigation", "IconLocateFixed", "IconCrosshair", "IconPanelLeft"],
    "Actions": ["IconCheck", "IconCheckCircle", "IconX", "IconXCircle", "IconAlertTriangle", "IconLoader2", "IconRotateCcw", "IconSave", "IconEdit", "IconEye"],
    "User & Auth": ["IconUser", "IconUserPlus", "IconLogIn", "IconSettings"],
    "Commerce": ["IconShoppingCart", "IconPlusCircle", "IconMinusCircle", "IconGift", "IconAward", "IconMedal", "IconTrophy"],
    "Analytics": ["IconBarChart3", "IconLineChart", "IconTrendingUp", "IconLayoutDashboard", "IconCalendarClock"],
    "Social": ["IconInstagram", "IconFacebook", "IconGlobe", "IconMail", "IconPhone", "IconMessageSquare", "IconLifeBuoy"],
    "UI Control": ["IconMoon", "IconSun", "IconCircle", "IconCamera", "IconUpload", "IconImage", "IconImageIcon"]
};

// Flatten to find any missing ones
const ALL_LISTED = new Set(Object.values(CATEGORIES).flat());

export default function IconPreviewPage() {
    const allIconNames = Object.keys(Icons);
    const unlistedIcons = allIconNames.filter(name => !ALL_LISTED.has(name) && name !== "default");

    return (
        <div className="min-h-screen bg-asphalt p-12 text-warm-white space-y-12">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold">Branded Icon Pack</h1>
                <p className="text-warm-secondary max-w-lg">
                    Style A: Modern Outline. Complete Inventory ({allIconNames.length} icons).
                </p>
            </div>

            {Object.entries(CATEGORIES).map(([category, iconNames]) => (
                <div key={category} className="space-y-4">
                    <h2 className="text-xl font-semibold text-brand-orange border-b border-subtle pb-2">{category}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {iconNames.map(name => {
                            const Icon = (Icons as any)[name];
                            if (!Icon) return null;
                            return (
                                <div key={name} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-charcoal border border-subtle hover:border-brand-orange/50 transition-colors group">
                                    <Icon size={28} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] text-warm-muted truncate w-full text-center">{name.replace('Icon', '')}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {unlistedIcons.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-brand-orange border-b border-subtle pb-2">Uncategorized</h2>
                    <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {unlistedIcons.map(name => {
                            const Icon = (Icons as any)[name];
                            return (
                                <div key={name} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-charcoal border border-subtle">
                                    <Icon size={28} />
                                    <span className="text-[10px] text-warm-muted truncate w-full text-center">{name.replace('Icon', '')}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
