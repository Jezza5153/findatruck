import React from "react";
import { cn } from "@/lib/utils";

type IconProps = React.SVGProps<SVGSVGElement> & {
    className?: string;
    size?: number | string;
};

// Common Brand Colors
const COLORS = {
    orange: "#FF6A00", // Brand Orange
    yellow: "#FFC700", // Brand Yellow
};

const BaseIcon = ({ children, className, size = 24, ...props }: IconProps & { children: React.ReactNode }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("text-warm-white", className)}
        {...props}
    >
        {children}
    </svg>
);

// ==========================================
// 🚀 TIER 1: HERO ICONS (Core Brand)
// ==========================================

export const IconTruck = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M10 17h4V5H2v12h3" />
        <path d="M20 17h2v-3.354a4 4 0 0 0-1.172-2.828L19.172 9.172A4 4 0 0 0 16.343 8 H14" />
        <circle cx="7.5" cy="17.5" r="2.5" stroke={COLORS.orange} />
        <circle cx="16.5" cy="17.5" r="2.5" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconMapPin = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconMap = (props: IconProps) => (
    <BaseIcon {...props}>
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" />
        <line x1="9" x2="9" y1="3" y2="18" stroke={COLORS.orange} opacity="0.5" />
        <line x1="15" x2="15" y1="6" y2="21" stroke={COLORS.orange} opacity="0.5" />
    </BaseIcon>
);

export const IconStar = (props: IconProps) => (
    <BaseIcon {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        <path d="M12 2L15.09 8.26" stroke={COLORS.orange} />
        <path d="M12 2L8.91 8.26" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconHeart = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M16.5 3c-1.76 0-3 .5-4.5 2" stroke={COLORS.orange} />
    </BaseIcon>
);

// ==========================================
// 🎯 TIER 2: FEATURE ICONS
// ==========================================

export const IconSearch = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconFilter = (props: IconProps) => (
    <BaseIcon {...props}>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        <line x1="2" x2="22" y1="3" y2="3" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconClock = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconUtensils = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconChefHat = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
        <line x1="6" x2="18" y1="17" y2="17" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconBell = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconBellOff = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5" />
        <path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" stroke={COLORS.orange} />
        <line x1="1" x2="23" y1="1" y2="23" stroke={COLORS.orange} />
    </BaseIcon>
);

// ==========================================
// 🧭 NAVIGATION ICONS
// ==========================================

export const IconArrowLeft = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" stroke={COLORS.orange} style={{ strokeDasharray: "4 12", strokeDashoffset: "2" }} />
        {/* Just accenting the tail slightly if possible, or just the line */}
        <path d="M19 12H12" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconArrowLeftCircle = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="m12 8-4 4 4 4" stroke={COLORS.orange} />
        <path d="M16 12H8" />
    </BaseIcon>
);

export const IconChevronDown = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="m6 9 6 6 6-6" stroke={COLORS.orange} strokeLinecap="square" />
    </BaseIcon>
);

export const IconChevronUp = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="m18 15-6-6-6 6" stroke={COLORS.orange} strokeLinecap="square" />
    </BaseIcon>
);

export const IconChevronLeft = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="m15 18-6-6 6-6" stroke={COLORS.orange} strokeLinecap="square" />
    </BaseIcon>
);

export const IconChevronRight = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="m9 18 6-6-6-6" stroke={COLORS.orange} strokeLinecap="square" />
    </BaseIcon>
);

export const IconNavigation = (props: IconProps) => (
    <BaseIcon {...props}>
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
        <line x1="13" x2="13" y1="21" y2="21" stroke={COLORS.orange} strokeWidth="4" strokeLinecap="round" />
        {/* Small orange dot at tip */}
    </BaseIcon>
);

export const IconLocateFixed = (props: IconProps) => (
    <BaseIcon {...props}>
        <line x1="2" x2="5" y1="12" y2="12" />
        <line x1="19" x2="22" y1="12" y2="12" />
        <line x1="12" x2="12" y1="2" y2="5" />
        <line x1="12" x2="12" y1="19" y2="22" />
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="3" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconCrosshair = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="22" x2="18" y1="12" y2="12" stroke={COLORS.orange} />
        <line x1="6" x2="2" y1="12" y2="12" stroke={COLORS.orange} />
        <line x1="12" x2="12" y1="6" y2="2" stroke={COLORS.orange} />
        <line x1="12" x2="12" y1="22" y2="18" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconPanelLeft = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" stroke={COLORS.orange} />
    </BaseIcon>
);

// ==========================================
// ✅ ACTION & STATUS ICONS
// ==========================================

export const IconCheck = (props: IconProps) => (
    <BaseIcon {...props}>
        <polyline points="20 6 9 17 4 12" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconCheckCircle = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconX = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconXCircle = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" stroke={COLORS.orange} />
        <path d="m9 9 6 6" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconAlertTriangle = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" x2="12" y1="9" y2="13" stroke={COLORS.orange} />
        <line x1="12" x2="12.01" y1="17" y2="17" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconLoader2 = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        {/* Spinning accent */}
        <path d="M21 12a9 9 0 0 0 0 .1" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconRotateCcw = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconSave = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconEdit = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        {/* Pencil tip orange */}
        <path d="M2 22l1.5-5.5L7.5 20.5 2 22" fill={COLORS.orange} stroke="none" />
    </BaseIcon>
);

export const IconEye = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" stroke={COLORS.orange} />
    </BaseIcon>
);

// ==========================================
// 👤 USER & AUTH ICONS
// ==========================================

export const IconUser = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconUserPlus = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" x2="19" y1="8" y2="14" stroke={COLORS.orange} />
        <line x1="22" x2="16" y1="11" y2="11" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconLogIn = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" stroke={COLORS.orange} />
        <line x1="15" x2="3" y1="12" y2="12" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconSettings = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" stroke={COLORS.orange} />
    </BaseIcon>
);

// ==========================================
// 🛒 COMMERCE ICONS
// ==========================================

export const IconShoppingCart = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        <path d="M5.12 7.05h14.93" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconPlusCircle = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" stroke={COLORS.orange} />
        <path d="M12 8v8" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconMinusCircle = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconGift = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13" />
        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.9 4.9 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconAward = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconMedal = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
        <path d="M11 12 5.12 2.88" />
        <path d="m13 12 5.88-9.12" />
        <path d="M12 22a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconTrophy = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 1 0-5H18" />
        <path d="M4 2h16" />
        <path d="M2.2 2H21.8C22.6 2 23 3 22 5l-2.7 6.3c-.9 2-2.5 3.7-4.5 4.7H9.2c-2-1-3.6-2.7-4.5-4.7L2 5c-1-2-.6-3 .2-3z" />
        <path d="M12 16v6" stroke={COLORS.orange} />
        <path d="M8 22h8" stroke={COLORS.orange} />
    </BaseIcon>
);

// ==========================================
// 📈 ANALYTICS & DASHBOARD
// ==========================================

export const IconBarChart3 = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M3 3v18h18" />
        {/* Bars ascending orange */}
        <path d="M18 17V9" stroke={COLORS.orange} />
        <path d="M13 17V5" stroke={COLORS.orange} />
        <path d="M8 17v-3" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconLineChart = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconTrendingUp = (props: IconProps) => (
    <BaseIcon {...props}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke={COLORS.orange} />
        <polyline points="17 6 23 6 23 12" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconLayoutDashboard = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" stroke={COLORS.orange} />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconCalendarClock = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h5" />
        <path d="M17.5 17.5 16 16.25V14" stroke={COLORS.orange} />
        <path d="M22 16a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" stroke={COLORS.orange} />
    </BaseIcon>
);

// ==========================================
// 📱 SOCIAL & CONTACT
// ==========================================

export const IconInstagram = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke={COLORS.orange} />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconFacebook = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke={COLORS.orange} />
        {/* Outline standard circle or box usually but Lucide Fbook is just the F, let's circle it for style? No, keep standard. */}
        {/* Actually the standard lucide `Facebook` is just the f-shape. */}
    </BaseIcon>
);

export const IconGlobe = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" x2="22" y1="12" y2="12" stroke={COLORS.orange} />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </BaseIcon>
);

export const IconMail = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconPhone = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconMessageSquare = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        {/* Dot or lines inside? */}
        <path d="M9 10h.01" stroke={COLORS.orange} strokeWidth="3" strokeLinecap="round" />
        <path d="M12 10h.01" stroke={COLORS.orange} strokeWidth="3" strokeLinecap="round" />
        <path d="M15 10h.01" stroke={COLORS.orange} strokeWidth="3" strokeLinecap="round" />
    </BaseIcon>
);

export const IconLifeBuoy = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" stroke={COLORS.orange} />
        <line x1="4.93" x2="9.17" y1="4.93" y2="9.17" />
        <line x1="14.83" x2="19.07" y1="14.83" y2="19.07" />
        <line x1="14.83" x2="19.07" y1="9.17" y2="4.93" />
        <line x1="14.83" x2="9.17" y1="9.17" y2="14.83" /> {/* Fixed diagonal? Lucide is simpler. */}
        <line x1="4.93" x2="9.17" y1="19.07" y2="14.83" />
    </BaseIcon>
);

// ==========================================
// 🌓 UI CONTROL ICONS
// ==========================================

export const IconMoon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconSun = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="4" stroke={COLORS.orange} />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
    </BaseIcon>
);

export const IconCircle = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconCamera = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconUpload = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" stroke={COLORS.orange} />
        <line x1="12" x2="12" y1="3" y2="15" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconImage = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" stroke={COLORS.orange} />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </BaseIcon>
);

export const IconImageIcon = IconImage; // Alias

// ==========================================
// 🆕 ADDITIONAL ICONS
// ==========================================

export const IconMenu = (props: IconProps) => (
    <BaseIcon {...props}>
        <line x1="4" x2="20" y1="12" y2="12" stroke={COLORS.orange} />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
    </BaseIcon>
);

export const IconLogOut = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" stroke={COLORS.orange} />
        <line x1="21" x2="9" y1="12" y2="12" stroke={COLORS.orange} />
    </BaseIcon>
);





export const IconHelpCircle = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={COLORS.orange} />
        <path d="M12 17h.01" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconShieldCheck = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="m9 12 2 2 4-4" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconFileText = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" stroke={COLORS.orange} />
        <path d="M16 13H8" stroke={COLORS.orange} />
        <path d="M16 17H8" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconNewspaper = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8" stroke={COLORS.orange} />
        <path d="M15 18h-5" stroke={COLORS.orange} />
        <path d="M10 6h8v4h-8V6z" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconInfo = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" stroke={COLORS.orange} />
        <path d="M12 8h.01" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconCreditCard = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconShoppingBag = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconDollarSign = (props: IconProps) => (
    <BaseIcon {...props}>
        <line x1="12" x2="12" y1="2" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconArrowRight = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M5 12h14" stroke={COLORS.orange} />
        <path d="m12 5 7 7-7 7" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconList = (props: IconProps) => (
    <BaseIcon {...props}>
        <line x1="8" x2="21" y1="6" y2="6" stroke={COLORS.orange} />
        <line x1="8" x2="21" y1="12" y2="12" />
        <line x1="8" x2="21" y1="18" y2="18" />
        <line x1="3" x2="3.01" y1="6" y2="6" />
        <line x1="3" x2="3.01" y1="12" y2="12" />
        <line x1="3" x2="3.01" y1="18" y2="18" />
    </BaseIcon>
);

export const IconUsers = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke={COLORS.orange} />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconMoreVertical = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="1" stroke={COLORS.orange} />
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="19" r="1" />
    </BaseIcon>
);

export const IconTrash2 = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" stroke={COLORS.orange} />
        <line x1="14" x2="14" y1="11" y2="17" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconFlag = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" x2="4" y1="22" y2="15" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconHeartOff = (props: IconProps) => (
    <BaseIcon {...props}>
        <line x1="2" y1="2" x2="22" y2="22" stroke={COLORS.orange} />
        <path d="M16.5 16.5 12 21l-7-7c-1.5-1.45-3-3.2-3-5.5a5.5 5.5 0 0 1 2.14-4.35" />
        <path d="M8.76 3.1c1.15.22 2.13.78 3.24 1.9 1.5-1.5 2.74-2 4.5-2A5.5 5.5 0 0 1 22 8.5c0 2.12-1.3 3.78-2.67 5.17" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconExternalLink = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M15 3h6v6" stroke={COLORS.orange} />
        <path d="M10 14 21 3" stroke={COLORS.orange} />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </BaseIcon>
);

export const IconCalendar = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconZap = (props: IconProps) => (
    <BaseIcon {...props}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconTag = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
        <circle cx="7.5" cy="7.5" r="1.5" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconRefreshCw = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" stroke={COLORS.orange} />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconPlus = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M5 12h14" stroke={COLORS.orange} />
        <path d="M12 5v14" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconPower = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
        <line x1="12" x2="12" y1="2" y2="12" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconRadio = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
        <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" stroke={COLORS.orange} />
        <circle cx="12" cy="12" r="2" stroke={COLORS.orange} />
        <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" stroke={COLORS.orange} />
        <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
    </BaseIcon>
);

export const IconPercent = (props: IconProps) => (
    <BaseIcon {...props}>
        <line x1="19" x2="5" y1="5" y2="19" />
        <circle cx="6.5" cy="6.5" r="2.5" stroke={COLORS.orange} />
        <circle cx="17.5" cy="17.5" r="2.5" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconShield = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconBan = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="m4.9 4.9 14.2 14.2" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconSparkles = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" stroke={COLORS.orange} />
        <path d="M20 3v4M22 5h-4M4 17v2M5 18H3" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconSmartphone = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
        <path d="M12 18h.01" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconLeaf = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" stroke={COLORS.orange} />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </BaseIcon>
);

export const IconPizza = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M15 11h.01M11 15h.01M16 16h.01M2 16.5a10.5 10.5 0 0 1 21 0" />
        <path d="m12.5 2.5-6.5 18" stroke={COLORS.orange} />
        <path d="m18.5 2.5-6.5 18" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconCoffee = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" x2="6" y1="2" y2="4" stroke={COLORS.orange} />
        <line x1="10" x2="10" y1="2" y2="4" stroke={COLORS.orange} />
        <line x1="14" x2="14" y1="2" y2="4" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconSoup = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
        <path d="M7 21h10M19.5 12 22 6" stroke={COLORS.orange} />
        <path d="M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62" stroke={COLORS.orange} />
        <path d="M11.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconFish = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
        <path d="M18 12v.5M4 19 2 12l2-7" stroke={COLORS.orange} />
        <path d="M12 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconBeef = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12.5" cy="8.5" r="2.5" />
        <path d="M12.5 2a6.5 6.5 0 0 0-6.22 4.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3A6.5 6.5 0 0 0 12.5 2Z" stroke={COLORS.orange} />
        <path d="m18.5 6 2.19 4.5a6.5 6.5 0 0 1 .31 2v.5" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconIceCream = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11" />
        <path d="M17 7A5 5 0 0 0 7 7" stroke={COLORS.orange} />
        <path d="M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconCheckCircle2 = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconReply = (props: IconProps) => (
    <BaseIcon {...props}>
        <polyline points="9 17 4 12 9 7" stroke={COLORS.orange} />
        <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </BaseIcon>
);

export const IconGripVertical = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="9" cy="12" r="1" stroke={COLORS.orange} />
        <circle cx="9" cy="5" r="1" stroke={COLORS.orange} />
        <circle cx="9" cy="19" r="1" stroke={COLORS.orange} />
        <circle cx="15" cy="12" r="1" />
        <circle cx="15" cy="5" r="1" />
        <circle cx="15" cy="19" r="1" />
    </BaseIcon>
);

export const IconEdit2 = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" stroke={COLORS.orange} />
        <path d="m15 5 4 4" />
    </BaseIcon>
);

export const IconShare2 = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="18" cy="5" r="3" stroke={COLORS.orange} />
        <circle cx="6" cy="12" r="3" stroke={COLORS.orange} />
        <circle cx="18" cy="19" r="3" stroke={COLORS.orange} />
        <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
        <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </BaseIcon>
);

export const IconCrown = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconCalendarDays = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M8 2v4M16 2v4" stroke={COLORS.orange} />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconEyeOff = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" stroke={COLORS.orange} />
        <line x1="2" x2="22" y1="2" y2="22" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconAlertCircle = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" stroke={COLORS.orange} />
        <line x1="12" x2="12.01" y1="16" y2="16" stroke={COLORS.orange} />
    </BaseIcon>
);

export const IconSend = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="m22 2-7 20-4-9-9-4Z" stroke={COLORS.orange} />
        <path d="M22 2 11 13" />
    </BaseIcon>
);
