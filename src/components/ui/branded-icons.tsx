import React from "react";
import { cn } from "@/lib/utils";

type IconProps = React.SVGProps<SVGSVGElement> & {
    className?: string;
    size?: number | string;
};

// Common Brand Colors
const COLORS = {
    orange: "#FF6A00",
    yellow: "#FFC700",
};

// BaseIcon (kept for legacy icons)
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
        className={cn(className)}
        {...props}
    >
        {children}
    </svg>
);

export const IconTruck = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
                    <path d="M22 17H2c0 0 1-5 1-6h13l1-4h3l3 4v6z" />
                    <circle cx="8" cy="17" r="2.5" />
                    <circle cx="18" cy="17" r="2.5" />
                    <path d="M17 11h3l-2-3h-1v3z" fill="currentColor" fillOpacity="0.2" stroke="none" />
    </svg>
);

export const IconMapPin = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" fill="#F36C1A" stroke="currentColor" />
    </svg>
);

export const IconMap = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M3 6l6 -3l6 3l6 -3v15l-6 3l-6 -3l-6 3v-15" />
                    <path d="M9 3v15" />
                    <path d="M15 6v15" />
    </svg>
);

export const IconStar = (props: IconProps) => (
    <BaseIcon {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        <path d="M12 2L15.09 8.26" stroke={COLORS.orange} />
        <path d="M12 2L8.91 8.26" stroke={COLORS.orange} />
    </BaseIcon>
);
export const IconHeart = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M19.5 13.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.566z" />
    </svg>
);

export const IconSearch = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35 -4.35" />
    </svg>
);

export const IconFilter = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

export const IconClock = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="9" />
                    <path d="M12 6v6l4 2" />
    </svg>
);

export const IconUtensils = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M3 2v7c0 1.1 .9 2 2 2h4a2 2 0 0 0 2 -2v-7" />
                    <path d="M7 2v20" />
                    <path d="M21 15v7" />
                    <path d="M21 2v4a5 5 0 0 1 -10 0v-4" />
    </svg>
);

export const IconChefHat = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                    <line x1="6" y1="17" x2="18" y2="17" />
    </svg>
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
export const IconArrowLeft = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
    </svg>
);

export const IconArrowLeftCircle = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="10" />
                    <polyline points="12 8 8 12 12 16" />
                    <line x1="16" y1="12" x2="8" y2="12" />
    </svg>
);

export const IconChevronDown = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <polyline points="6 9 12 15 18 9" />
    </svg>
);

export const IconChevronUp = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <polyline points="18 15 12 9 6 15" />
    </svg>
);

export const IconChevronLeft = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <polyline points="15 18 9 12 15 6" />
    </svg>
);

export const IconChevronRight = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <polyline points="9 18 15 12 9 6" />
    </svg>
);

export const IconNavigation = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
);

export const IconLocateFixed = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <line x1="2" y1="12" x2="5" y2="12" />
                    <line x1="19" y1="12" x2="22" y2="12" />
                    <line x1="12" y1="2" x2="12" y2="5" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                    <circle cx="12" cy="12" r="7" />
                    <circle cx="12" cy="12" r="3" />
    </svg>
);

export const IconCrosshair = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="10" />
                    <line x1="22" y1="12" x2="18" y2="12" />
                    <line x1="6" y1="12" x2="2" y2="12" />
                    <line x1="12" y1="6" x2="12" y2="2" />
                    <line x1="12" y1="22" x2="12" y2="18" />
    </svg>
);

export const IconPanelLeft = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
);

export const IconCheck = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <polyline points="20 6 9 17 4 12" />
    </svg>
);

export const IconCheckCircle = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

export const IconX = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export const IconXCircle = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
);

export const IconAlertTriangle = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

export const IconLoader2 = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export const IconRotateCcw = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M1 4v6h6" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
);

export const IconSave = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
    </svg>
);

export const IconEdit = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

export const IconEye = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
    </svg>
);

export const IconUser = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
    </svg>
);

export const IconUserPlus = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
);

export const IconLogIn = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
);

export const IconSettings = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
    </svg>
);

export const IconShoppingCart = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
);

export const IconPlusCircle = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

export const IconMinusCircle = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="10" />
                    <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

export const IconGift = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <polyline points="20 12 20 22 4 22 4 12" />
                    <rect x="2" y="7" width="20" height="5" />
                    <line x1="12" y1="22" x2="12" y2="7" />
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
);

export const IconAward = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
);

export const IconMedal = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
                    <path d="M11 12 5.12 2.2" />
                    <path d="m13 12 5.88-9.8" />
                    <path d="M8 7h8" />
                    <circle cx="12" cy="17" r="5" />
                    <path d="M12 18v-2h-.5" />
    </svg>
);

export const IconTrophy = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
);

export const IconBarChart3 = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <line x1="12" y1="20" x2="12" y2="10" />
                    <line x1="18" y1="20" x2="18" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
);

export const IconLineChart = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
    </svg>
);

export const IconTrendingUp = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
    </svg>
);

export const IconLayoutDashboard = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <rect x="3" y="3" width="7" height="9" />
                    <rect x="14" y="3" width="7" height="5" />
                    <rect x="14" y="12" width="7" height="9" />
                    <rect x="3" y="16" width="7" height="5" />
    </svg>
);

export const IconCalendarClock = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
                    <path d="M16 2v4" />
                    <path d="M8 2v4" />
                    <path d="M3 10h5" />
                    <path d="M17.5 17.5 16 16.25V14" />
                    <path d="M22 16a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" />
    </svg>
);

export const IconInstagram = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

export const IconFacebook = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

export const IconGlobe = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

export const IconMail = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
    </svg>
);

export const IconPhone = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

export const IconMessageSquare = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

export const IconLifeBuoy = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                    <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
                    <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
                    <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
                    <line x1="14.83" y1="9.17" x2="18.36" y2="5.64" />
                    <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
    </svg>
);

export const IconMoon = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

export const IconSun = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

export const IconCircle = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="10" />
    </svg>
);

export const IconCamera = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
    </svg>
);

export const IconUpload = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

export const IconImage = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
    </svg>
);

export const IconMenu = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
);

export const IconLogOut = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

export const IconHelpCircle = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

export const IconShieldCheck = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
    </svg>
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
export const IconInfo = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

export const IconCreditCard = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
);

export const IconShoppingBag = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);

export const IconDollarSign = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

export const IconArrowRight = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M5 12h14" stroke={COLORS.orange} />
        <path d="m12 5 7 7-7 7" stroke={COLORS.orange} />
    </BaseIcon>
);
export const IconList = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);

export const IconUsers = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

export const IconMoreVertical = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
    </svg>
);

export const IconTrash2 = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

export const IconFlag = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
);

export const IconHeartOff = (props: IconProps) => (
    <BaseIcon {...props}>
        <line x1="2" y1="2" x2="22" y2="22" stroke={COLORS.orange} />
        <path d="M16.5 16.5 12 21l-7-7c-1.5-1.45-3-3.2-3-5.5a5.5 5.5 0 0 1 2.14-4.35" />
        <path d="M8.76 3.1c1.15.22 2.13.78 3.24 1.9 1.5-1.5 2.74-2 4.5-2A5.5 5.5 0 0 1 22 8.5c0 2.12-1.3 3.78-2.67 5.17" stroke={COLORS.orange} />
    </BaseIcon>
);
export const IconExternalLink = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

export const IconCalendar = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

export const IconZap = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

export const IconTag = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
);

export const IconRefreshCw = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" stroke={COLORS.orange} />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" stroke={COLORS.orange} />
    </BaseIcon>
);
export const IconPlus = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

export const IconPower = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                    <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
);

export const IconRadio = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="2" />
                    <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
    </svg>
);

export const IconPercent = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <line x1="19" y1="5" x2="5" y2="19" />
                    <circle cx="6.5" cy="6.5" r="2.5" />
                    <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
);

export const IconShield = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

export const IconBan = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
);

export const IconSparkles = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    <path d="M5 3v4" />
                    <path d="M9 5H3" />
    </svg>
);

export const IconSmartphone = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
);

export const IconLeaf = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M11 20.8A6 6 0 0 1 2 12a10 10 0 1 1 15.6 4.1L22 20.8" />
                    <path d="M2 12c5.5 0 8-2.5 8-8" />
    </svg>
);

export const IconPizza = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M3 20 L 12 2 L 21 20 L 12 18 Z" />
                    <path d="M10 6 L 14 6" />
                    <circle cx="12" cy="10" r="1.5" />
                    <circle cx="10" cy="15" r="1.5" />
                    <circle cx="15" cy="16" r="1.5" />
                    <path d="M7 21 Q 8 23 9 21" />
    </svg>
);

export const IconCoffee = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                    <path d="M2 8h16v9a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z" />
                    <line x1="6" y1="1" x2="6" y2="4" />
                    <line x1="10" y1="1" x2="10" y2="4" />
                    <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
);

export const IconSoup = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M4 10h16v3a8 8 0 0 1-16 0z" />
                    <path d="M6 4v3" />
                    <path d="M12 2v5" />
                    <path d="M18 4v3" />
    </svg>
);

export const IconFish = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M6.5 12c.5-5.5 6.5-8 11.5-3c2 2 4 1 4 1l-1 2l1 2s-2-1-4 1c-5 5-11 2.5-11.5-3Z" />
                    <path d="M13 12a1 1 0 1 0 2 0a1 1 0 0 0-2 0" />
                    <path d="M6.5 12h-3.5" />
    </svg>
);

export const IconBeef = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M12.5 7c-2.5 0-5.5 2-7.5 5c-1.5 2.5-3 6.5-1 9s6-.5 8.5-2c3-2 5-5 5-7.5s-2.5-4.5-5-4.5Z" />
                    <path d="M7 14c1.5-1.5 3.5-2.5 5.5-2.5" />
    </svg>
);

export const IconIceCream = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M7 11.5a5 5 0 0 1 10 0v1.5h-10z" />
                    <path d="M7 13l5 9l5-9" />
    </svg>
);

export const IconCheckCircle2 = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="10" />
                    <polyline points="16 10 10 16 8 13.9" />
    </svg>
);

export const IconReply = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <polyline points="9 17 4 12 9 7" />
                    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
);

export const IconGripVertical = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="9" cy="12" r="1" />
                    <circle cx="9" cy="5" r="1" />
                    <circle cx="9" cy="19" r="1" />
                    <circle cx="15" cy="12" r="1" />
                    <circle cx="15" cy="5" r="1" />
                    <circle cx="15" cy="19" r="1" />
    </svg>
);

export const IconEdit2 = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
);

export const IconShare2 = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
);

export const IconCrown = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
);

export const IconCalendarDays = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <path d="M8 14h.01" />
                    <path d="M12 14h.01" />
                    <path d="M16 14h.01" />
                    <path d="M8 18h.01" />
                    <path d="M12 18h.01" />
                    <path d="M16 18h.01" />
    </svg>
);

export const IconEyeOff = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

export const IconAlertCircle = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

export const IconSend = ({ className, size = 24, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={cn(className)}
        stroke="url(#goldOutline)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#strokeBevel)"
        {...props}
    >
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="40%" stopColor="#FFCA28" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#A67C00" />
            </linearGradient>
            <filter id="strokeBevel">
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" lightingColor="#FFF" result="spec">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
                <feMerge>
                    <feMergeNode in="SourceGraphic"/>
                    <feMergeNode in="specOut"/>
                </feMerge>
            </filter>
          </defs>
          <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);


export const IconImageIcon = IconImage;