export function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 7 17 17M17 17V9M17 17H9" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

/* ---- Membership feature icons (purple line style) ---- */
const FI = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function WpIcon() {
  return (
    <svg {...FI}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M6.3 8.4l2 7.2 1.9-5.4M9.7 8.4l2 7.2 2-7.2M13.5 8.4l2 7.2 1.9-7.2" />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg {...FI}>
      <path d="M12 3v11" />
      <path d="M7.5 10.5 12 15l4.5-4.5" />
      <path d="M5 19h14" />
    </svg>
  );
}

export function RefreshIcon() {
  return (
    <svg {...FI}>
      <path d="M20 11.5a8 8 0 1 0-.6 4.5" />
      <path d="M20 5v5h-5" />
      <path d="M9 12.3l2.2 2.2L15.5 10" />
    </svg>
  );
}

export function BadgeIcon() {
  return (
    <svg {...FI}>
      <circle cx="12" cy="9" r="5.3" />
      <path d="M9.6 9l1.7 1.7 3.1-3.4" />
      <path d="M8.6 13.2 7 21l5-2.6L17 21l-1.6-7.8" />
    </svg>
  );
}

export function InfinityIcon() {
  return (
    <svg {...FI}>
      <path d="M6.6 12c0-1.7 1.3-3 3-3 2.6 0 3.2 6 5.8 6 1.7 0 3-1.3 3-3s-1.3-3-3-3c-2.6 0-3.2 6-5.8 6-1.7 0-3-1.3-3-3Z" />
    </svg>
  );
}

export function MegaphoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M3 11v2a1 1 0 0 0 1 1h2.4L11 17.5v-11L6.4 10H4a1 1 0 0 0-1 1Z" />
      <path d="M14 9.3a3.6 3.6 0 0 1 0 5.4" />
      <path d="M6.6 14v3a1.6 1.6 0 0 0 3.2 0v-1.6" />
    </svg>
  );
}

export function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M13 2 5 13.5h5.5L9.5 22 19 10h-5.5L13 2Z" />
    </svg>
  );
}

export function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M4 8.5 7.5 12 12 5l4.5 7L20 8.5 18.3 19H5.7L4 8.5Z" />
      <path d="M5.7 19h12.6" />
    </svg>
  );
}

export function GiftIcon() {
  return (
    <svg {...FI}>
      <path d="M4 11h16v3H4z" />
      <path d="M5.5 14h13v6.5h-13z" />
      <path d="M12 8v12.5" />
      <path d="M12 8C12 5.5 10.5 4 9 4.7 7.6 5.4 8.5 8 12 8Z" />
      <path d="M12 8c0-2.5 1.5-4 3-3.3 1.4.7.5 3.3-3 3.3Z" />
    </svg>
  );
}

export function CheckLine({ text }) {
  return (
    <div className="check-line">
      <span>✓</span>
      {text}
    </div>
  );
}
