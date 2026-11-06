/* Sample workspace data and shared helpers. In Ziki this comes from
   listOwnerQuestions() and the RedesignProposal table. */

export type PersonId = "charles" | "kunle" | "amaka" | "ifeoma";
export const OWNER: PersonId = "charles";

export const PEOPLE: Record<PersonId, { name: string; short: string; initials: string; color: string }> = {
  charles: { name: "Charles Ekekwe", short: "Charles", initials: "CE", color: "bg-emerald-700" },
  kunle: { name: "Kunle Bello", short: "Kunle", initials: "KB", color: "bg-sky-700" },
  amaka: { name: "Amaka Eze", short: "Amaka", initials: "AE", color: "bg-rose-700" },
  ifeoma: { name: "Ifeoma Obi", short: "Ifeoma", initials: "IO", color: "bg-amber-700" },
};

export type EscType = "Blocker" | "Work Authorization" | "Human Approval" | "Scope Expansion" | "Question" | "Redesign";

export interface Suggestion {
  id: PersonId;
  why: string;
}

export interface Escalation {
  id: string;
  kind: "question" | "redesign";
  type: EscType;
  agent: string;
  /** Redesign proposals show their title instead of the agent name, like Ziki. */
  title?: string;
  body: string;
  issue: { number: number; title: string };
  createdAt: number;
  suggestions: Suggestion[];
  // --- New: "Ask someone else" ---
  askedTo?: PersonId;
  askedNote?: string;
  askedAt?: number;
  answer?: { by: PersonId; text: string; at: number };
  /** Redesign proposals are decided on their own page; this only marks them done. */
  decided?: boolean;
}

export const MIN = 60_000;
export const COME_BACK_AFTER = 60; // minutes

export function seed(): Escalation[] {
  const now = Date.now();
  return [
    {
      id: "e1",
      kind: "question",
      type: "Human Approval",
      agent: "Snow Ziki",
      body: "Can I run a migration on production that permanently drops the old legacy_phone column?",
      issue: { number: 212, title: "Add phone verification to signup" },
      createdAt: now - 12 * MIN,
      suggestions: [
        { id: "kunle", why: "Built most of the database" },
        { id: "amaka", why: "Runs the finance reports" },
        { id: "ifeoma", why: "Ziki reviewer on this project" },
      ],
    },
    {
      id: "e2",
      kind: "question",
      type: "Work Authorization",
      agent: "Cart Bot",
      body:
        "To test refunds with real money I need a live payment key, and I don't have one. Can someone give me a key that can only refund up to ₦500?",
      issue: { number: 219, title: "Test the refund flow with live payments" },
      createdAt: now - 26 * MIN,
      suggestions: [
        { id: "amaka", why: "Manages payments and passwords" },
        { id: "kunle", why: "Set up the payment system" },
      ],
    },
    {
      id: "r1",
      kind: "redesign",
      type: "Redesign",
      agent: "Copy Crow",
      title: "Simpler pricing table",
      body: "Three plans side by side instead of a long list, with the most popular one highlighted.",
      issue: { number: 231, title: "Pricing page is hard to scan" },
      createdAt: now - 34 * MIN,
      suggestions: [],
    },
    {
      id: "e3",
      kind: "question",
      type: "Scope Expansion",
      agent: "Copy Crow",
      body: "The task is only the homepage headline, but the line under it won't match anymore. Can I update both?",
      issue: { number: 224, title: "New homepage headline" },
      createdAt: now - 40 * MIN,
      suggestions: [
        { id: "amaka", why: "Approved the last copy changes" },
        { id: "ifeoma", why: "Ziki reviewer on this project" },
      ],
    },
    {
      id: "e4",
      kind: "question",
      type: "Question",
      agent: "Snow Ziki",
      body: "Should the verification code expire after 5 or 10 minutes?",
      issue: { number: 212, title: "Add phone verification to signup" },
      createdAt: now - 3 * 60 * MIN,
      suggestions: [],
      answer: { by: "charles", text: "10 minutes.", at: now - 170 * MIN },
    },
  ];
}

export const isWaiting = (e: Escalation) => (e.kind === "redesign" ? !e.decided : !e.answer);
export const holderOf = (e: Escalation): PersonId => e.askedTo ?? OWNER;

/** Ziki's lib/format.ts formatTimeAgo, unchanged ("12 mins ago", "3 hours ago", "yesterday"). */
export function formatTimeAgo(value: number, now: number): string {
  const diffMs = now - value;
  const future = diffMs < 0;
  const minutes = Math.floor(Math.abs(diffMs) / 60_000);
  const say = (n: number, unit: string) => {
    const amount = `${n} ${unit}${n === 1 ? "" : "s"}`;
    return future ? `in ${amount}` : `${amount} ago`;
  };
  if (minutes < 1) return "just now";
  if (minutes < 60) return say(minutes, "min");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return say(hours, "hour");
  const days = Math.floor(hours / 24);
  if (days === 1) return future ? "tomorrow" : "yesterday";
  if (days < 7) return say(days, "day");
  if (days < 30) return say(Math.floor(days / 7), "week");
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

/** Ziki's formatDate, used in the time tooltip ("Nov 6, 2026, 1:23 AM"). */
export function formatDate(value: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

export interface Actions {
  open: (id: string | null) => void;
  ask: (e: Escalation, to: PersonId, note: string) => void;
  takeBack: (e: Escalation) => void;
  answer: (e: Escalation, text: string) => void;
}
