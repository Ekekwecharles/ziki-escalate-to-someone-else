/* Mirrors components/app-header.tsx and components/avatar.tsx from emerjent/ziki. */
import { useEffect, useRef, useState } from "react";
import { PEOPLE, type PersonId } from "../data";

/* ----------------------------- Avatar ----------------------------- */

// lib/avatar.ts: the same name always gets the same tone.
const AVATAR_TONES = [
  "bg-teal-100 text-teal-800",
  "bg-sky-100 text-sky-800",
  "bg-indigo-100 text-indigo-800",
  "bg-violet-100 text-violet-800",
  "bg-fuchsia-100 text-fuchsia-800",
  "bg-rose-100 text-rose-800",
  "bg-amber-100 text-amber-900",
  "bg-lime-100 text-lime-900",
] as const;

function avatarTone(name: string): string {
  const key = name.trim().toLowerCase();
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return AVATAR_TONES[(hash >>> 0) % AVATAR_TONES.length];
}

const AVATAR_SIZES = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
} as const;

export function Avatar({ id, size = "sm", variant = "tone" }: { id: PersonId; size?: keyof typeof AVATAR_SIZES; variant?: "tone" | "solid" }) {
  const p = PEOPLE[id];
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold ${AVATAR_SIZES[size]} ${
        variant === "solid" ? "bg-emerald-700 text-white" : avatarTone(p.name)
      }`}
    >
      {p.initials}
    </span>
  );
}

/* ----------------------------- Header ----------------------------- */

const linkFocus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2";

function ZikiMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <rect width="100" height="100" rx="22" fill="currentColor" />
      <path d="M22 22H78L22 78H78M30 50H70" stroke="var(--zk-surface)" strokeWidth="12" fill="none" />
    </svg>
  );
}

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      {children}
    </svg>
  );
}

function MenuItem({ children, onClick, active = false }: { children: React.ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold ${linkFocus} ${
        active ? "bg-zk-tint text-zk-accent" : "text-zk-text hover:bg-zk-chip"
      }`}
    >
      {children}
    </button>
  );
}

export function ZikiHeader({
  viewer,
  count,
  waitingFor,
  onSwitch,
}: {
  viewer: PersonId;
  /** The envelope's number: unread notifications plus escalations waiting on this person. */
  count: number;
  /** Escalations waiting on each person, for the account switcher. */
  waitingFor: (id: PersonId) => number;
  onSwitch: (id: PersonId) => void;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const navItem = `inline-flex h-9 items-center gap-2 rounded-full px-2.5 text-[13px] font-medium text-zk-text2 hover:bg-zk-chip hover:text-zk-text ${linkFocus}`;
  const others = (Object.keys(PEOPLE) as PersonId[]).filter((id) => id !== viewer);
  const close = () => setOpen(false);

  return (
    <header className="relative z-40 border-b border-zk-border bg-zk-surface shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:sticky lg:top-0">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <a href="#" aria-label="Ziki" className={`flex shrink-0 items-center gap-2 rounded-full ${linkFocus}`}>
            <ZikiMark className="h-8 w-8 text-zk-text" />
          </a>
          <span aria-hidden="true" className="h-[18px] w-px bg-zk-border max-sm:hidden" />
          <button type="button" className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] font-semibold text-zk-text hover:bg-zk-chip ${linkFocus}`}>
            Acme
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zk-muted" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        <nav aria-label="Workspace" className="ml-6 flex items-center gap-1 max-lg:hidden">
          <a href="#" className={navItem}>
            <NavIcon>
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
            </NavIcon>
            Your App
          </a>
          <a href="#" className={navItem}>
            <NavIcon>
              <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
            </NavIcon>
            Marketing
          </a>
          <a href="#" className={navItem}>
            <NavIcon>
              <path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z" />
              <path d="m9 12 2 2 4-4" />
            </NavIcon>
            Security
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div ref={boxRef} className="relative">
            <button
              ref={buttonRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls="account-menu"
              onClick={() => setOpen((v) => !v)}
              className={`inline-flex h-11 max-w-full items-center gap-2 rounded-full border border-zk-border bg-zk-surface py-[5px] pl-[5px] pr-3 text-zk-text hover:bg-zk-chip ${linkFocus}`}
            >
              <span className="sr-only">Account menu for </span>
              <Avatar id={viewer} size="md" variant="solid" />
              <span className="max-w-40 truncate text-[13px] font-medium max-sm:sr-only">{PEOPLE[viewer].name}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="shrink-0 text-zk-muted max-sm:hidden">
                <path d={open ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"} />
              </svg>
            </button>

            {open ? (
              <div
                id="account-menu"
                role="menu"
                aria-label="Account"
                className="absolute right-0 top-[54px] z-50 flex w-[300px] max-w-[calc(100vw-2rem)] origin-top-right flex-col gap-1 rounded-[20px] border border-zk-border bg-zk-surface p-2 shadow-[0_24px_56px_rgba(11,23,51,0.22)]"
              >
                <div className="flex items-center gap-3 rounded-[14px] bg-zk-tint p-3">
                  <Avatar id={viewer} size="lg" variant="solid" />
                  <div className="min-w-0">
                    <p className="m-0 truncate text-base font-extrabold text-zk-text">{PEOPLE[viewer].name}</p>
                    <p className="m-0 mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="rounded-full bg-zk-surface px-2 py-0.5 font-bold text-zk-text2">Member</span>
                    </p>
                  </div>
                </div>
                <MenuItem onClick={close}>Profile</MenuItem>
                <div className="mx-2 h-px bg-zk-divider" />
                <MenuItem onClick={close}>Activity</MenuItem>
                <MenuItem onClick={close}>Organization settings</MenuItem>
                <MenuItem onClick={close}>Manage agents</MenuItem>
                <MenuItem onClick={close}>All agents</MenuItem>
                <MenuItem onClick={close}>Settings</MenuItem>
                <MenuItem onClick={close}>Documentation</MenuItem>
                <div className="mx-2 h-px bg-zk-divider" />
                <p className="m-0 px-3 pb-0.5 pt-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-zk-muted">Switch account</p>
                {others.map((id) => {
                  const n = waitingFor(id);
                  return (
                    <MenuItem
                      key={id}
                      onClick={() => {
                        setOpen(false);
                        onSwitch(id);
                      }}
                    >
                      <Avatar id={id} size="sm" />
                      <span className="min-w-0 flex-1 truncate">{PEOPLE[id].name}</span>
                      {n > 0 ? (
                        <span className="rounded-full bg-electric-blue-strong px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-white">{n}</span>
                      ) : null}
                    </MenuItem>
                  );
                })}
                <div className="mx-2 h-px bg-zk-divider" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={close}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold text-zk-bad-fg hover:bg-zk-bad-soft ${linkFocus}`}
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>

          {/* The envelope (#inbox), last, like Ziki. */}
          <a
            href="#"
            aria-label={count > 0 ? `Inbox, ${count} unread` : "Inbox"}
            title={count > 0 ? `Inbox, ${count} unread` : "Inbox"}
            className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full text-zk-accent hover:bg-zk-chip ${linkFocus}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            {count > 0 ? (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-zk-surface bg-electric-blue-strong px-1 text-[11px] font-bold text-white"
              >
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </a>
        </div>
      </div>
    </header>
  );
}
