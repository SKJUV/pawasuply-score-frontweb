interface IconProps {
  className?: string;
  size?: number;
}

export function IconBank({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M10 2L2 7h16L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="3" y="7" width="2" height="7" rx="0.5" fill="currentColor" opacity="0.3"/>
      <rect x="7" y="7" width="2" height="7" rx="0.5" fill="currentColor" opacity="0.3"/>
      <rect x="11" y="7" width="2" height="7" rx="0.5" fill="currentColor" opacity="0.3"/>
      <rect x="15" y="7" width="2" height="7" rx="0.5" fill="currentColor" opacity="0.3"/>
      <rect x="2" y="14" width="16" height="2" rx="0.5" fill="currentColor"/>
    </svg>
  );
}

export function IconStore({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M3 8V17h14V8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M1 8h18M5 8V5a2 2 0 014 0v3M11 8V5a2 2 0 014 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="7" y="11" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export function IconBolt({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M11 2L4 11h6l-1 7 7-9h-6l1-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconCreditCard({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="1" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M1 8h18" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="11" width="4" height="2" rx="0.5" fill="currentColor" opacity="0.4"/>
    </svg>
  );
}

export function IconCheck({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6.5 10l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconWarning({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M10 2L1 17h18L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M10 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="14.5" r="0.75" fill="currentColor"/>
    </svg>
  );
}

export function IconChart({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M2 14l4-5 4 3 4-6 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconRefresh({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M3.5 10A6.5 6.5 0 0110 3.5c2.2 0 4.1 1.1 5.3 2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16.5 10A6.5 6.5 0 0110 16.5c-2.2 0-4.1-1.1-5.3-2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14 3l1.5 3-3 .5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 17l-1.5-3 3-.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconArrowRight({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconArrowLeft({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M16 10H4M9 5L4 10l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconSearch({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconSend({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M17 3L2 9l6 2 2 6 7-14Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 11l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconClock({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconX({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconLive({ className = '', size = 8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" className={className} aria-hidden="true">
      <circle cx="4" cy="4" r="3" fill="currentColor"/>
    </svg>
  );
}

export function IconLogs({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 7h10M5 10h7M5 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconLock({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="14" r="1.5" fill="currentColor"/>
    </svg>
  );
}

export function IconTrash({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M3 5h14M8 5V3h4v2M6 5l1 12h6l1-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconChevronDown({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconMenu({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconClose({ className = '', size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
