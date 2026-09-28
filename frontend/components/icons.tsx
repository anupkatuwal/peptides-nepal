import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const CartIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2" />
    <circle cx="9.5" cy="19.5" r="1.3" />
    <circle cx="17" cy="19.5" r="1.3" />
  </svg>
);

export const UserIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
);

export const MenuIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ChevronDown = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ArrowRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const FlaskIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M9 3h6M10 3v6.2L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.2V3" />
    <path d="M7.5 15h9" />
  </svg>
);

export const ShieldIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3 5 6v5.5c0 4.3 3 8 7 9.5 4-1.5 7-5.2 7-9.5V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const TruckIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" />
    <circle cx="7" cy="18" r="1.7" />
    <circle cx="17.5" cy="18" r="1.7" />
  </svg>
);

export const SnowflakeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 2v20M4.2 6.5l15.6 11M19.8 6.5 4.2 17.5" />
    <path d="m9.5 4 2.5 2 2.5-2M9.5 20l2.5-2 2.5 2" />
  </svg>
);

export const DocumentIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const MailIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

export const InstagramIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
  </svg>
);

export const WhatsAppIcon = (p: IconProps) => (
  <svg width={26} height={26} viewBox="0 0 32 32" aria-hidden="true" {...p}>
    <path
      fill="currentColor"
      d="M16.02 3C8.84 3 3 8.8 3 15.95c0 2.29.6 4.52 1.75 6.49L3 29l6.73-1.76a13.05 13.05 0 0 0 6.29 1.6h.01C23.2 28.84 29 23.04 29 15.9 29 8.8 23.2 3 16.02 3Zm0 23.64h-.01a10.8 10.8 0 0 1-5.5-1.5l-.4-.23-4 1.04 1.07-3.88-.26-.4a10.67 10.67 0 0 1-1.65-5.72c0-5.94 4.85-10.77 10.8-10.77a10.77 10.77 0 0 1 10.78 10.76c0 5.94-4.85 10.7-10.83 10.7Zm5.92-8.04c-.32-.16-1.93-.95-2.22-1.06-.3-.1-.52-.16-.73.16-.22.32-.84 1.05-1.03 1.27-.19.21-.38.24-.7.08-.33-.16-1.38-.5-2.62-1.6a9.8 9.8 0 0 1-1.82-2.25c-.19-.32-.02-.5.14-.66.15-.14.33-.38.49-.56.16-.19.21-.32.32-.54.1-.21.05-.4-.03-.56-.08-.16-.73-1.75-1-2.4-.26-.63-.53-.54-.73-.55h-.62c-.22 0-.57.08-.86.4-.3.32-1.14 1.1-1.14 2.7 0 1.58 1.17 3.12 1.33 3.33.16.22 2.3 3.5 5.57 4.9.78.34 1.39.54 1.86.69.78.25 1.5.21 2.06.13.63-.1 1.93-.79 2.2-1.55.28-.76.28-1.4.2-1.54-.08-.14-.3-.22-.62-.38Z"
    />
  </svg>
);
