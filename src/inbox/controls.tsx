/* Mirrors app/(app)/inbox/escalation-controls.tsx and components/local-time.tsx.
   Everything marked NEW is the "Ask someone else" feature. */
import { useState } from "react";
import { Avatar } from "../ziki/chrome";
import { COME_BACK_AFTER, MIN, OWNER, PEOPLE, formatDate, formatTimeAgo, type EscType, type Escalation, type PersonId } from "../data";

export function LocalTime({ date, now, className }: { date: number; now: number; className?: string }) {
  return (
    <time dateTime={new Date(date).toISOString()} className={className} title={formatDate(date)}>
      {formatTimeAgo(date, now)}
    </time>
  );
}

export function EscalationTypeBadge({ type }: { type: EscType }) {
  const styles: Record<EscType, string> = {
    Blocker: "bg-zk-bad-bg text-zk-bad-fg border-zk-bad-bd",
    "Work Authorization": "bg-zk-warn-bg text-zk-warn-fg border-zk-warn-bd",
    "Human Approval": "bg-zk-info-bg text-zk-info-fg border-zk-border",
    "Scope Expansion": "bg-zk-warn-bg text-zk-warn-fg border-zk-warn-bd",
    Question: "bg-zk-chip text-zk-text2 border-zk-border",
    Redesign: "bg-zk-info-bg text-zk-info-fg border-zk-border",
  };
  const icons: Record<EscType, string> = {
    Blocker: "🛑",
    "Work Authorization": "🛡️",
    "Human Approval": "👤",
    "Scope Expansion": "⚠️",
    Question: "❓",
    Redesign: "✎",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[type]}`}>
      <span aria-hidden="true">{icons[type]}</span>
      <span>{type}</span>
    </span>
  );
}

/** Ziki's QuickResolveButtons. The replies are Ziki's own fixed texts. */
export function QuickResolveButtons({ onAnswer, extra }: { onAnswer: (text: string) => void; extra?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onAnswer("Approved. Proceed with your proposed approach.")}
        className="rounded-full bg-zk-ok-fg px-3.5 py-2 text-xs font-semibold text-white hover:opacity-90"
      >
        ✓ Approve &amp; Unblock
      </button>
      <button
        type="button"
        onClick={() => onAnswer("Work authorized. You may begin implementation.")}
        className="rounded-full border border-zk-border bg-zk-surface px-3.5 py-2 text-xs font-semibold text-zk-text hover:bg-zk-chip"
      >
        Authorize Work
      </button>
      {extra}
    </div>
  );
}

/** Ziki's EscalationAnswerForm. */
export function EscalationAnswerForm({ onSend }: { onSend: (t: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      className="space-y-3"
      onSubmit={(ev) => {
        ev.preventDefault();
        if (text.trim()) onSend(text.trim());
      }}
    >
      <textarea
        id="answer"
        rows={4}
        required
        maxLength={2000}
        value={text}
        onChange={(ev) => setText(ev.target.value)}
        aria-labelledby="response-heading"
        placeholder="Provide decision, unblocking guidance, or instructions..."
        className="w-full resize-y rounded-[12px] border border-zk-border bg-zk-surface px-3 py-2 text-sm text-zk-text placeholder:text-zk-muted focus:outline-2 focus:outline-electric-blue"
      />
      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-full bg-electric-blue-strong px-4 py-2 font-semibold text-white hover:opacity-90">
          Send response
        </button>
        <span className="text-xs text-zk-muted">The response cannot be edited once dispatched to the agent.</span>
      </div>
    </form>
  );
}

/* ----------------------------- NEW ----------------------------- */

/** NEW: pill shown to the owner while someone else holds the question. */
export function WithPill({ to }: { to: PersonId }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zk-border bg-zk-info-bg py-0.5 pl-0.5 pr-2.5 text-xs font-semibold text-zk-info-fg">
      <Avatar id={to} size="xs" />
      With {PEOPLE[to].short}
    </span>
  );
}

/** NEW: banner shown to the person who was asked. */
export function AskedBanner({ e }: { e: Escalation }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[12px] bg-zk-tint px-3 py-2.5">
      <Avatar id={OWNER} size="sm" />
      <div className="min-w-0 text-sm">
        <p className="m-0 text-zk-text">
          <span className="font-semibold">{PEOPLE[OWNER].short}</span> asked you to answer this
        </p>
        {e.askedNote ? <p className="m-0 mt-0.5 text-zk-text2">“{e.askedNote}”</p> : null}
      </div>
    </div>
  );
}

/** NEW: what the owner sees while waiting on someone else. */
export function WaitingOnSomeone({ e, now, onTakeBack }: { e: Escalation; now: number; onTakeBack: () => void }) {
  const left = Math.max(1, COME_BACK_AFTER - Math.round((now - e.askedAt!) / MIN));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="m-0 text-xs text-zk-muted">
        You asked {PEOPLE[e.askedTo!].short} {formatTimeAgo(e.askedAt!, now)}. If there's no answer, it comes back to you in {left} min
        {left === 1 ? "" : "s"}.
      </p>
      <button type="button" onClick={onTakeBack} className="text-xs font-semibold text-zk-accent hover:underline">
        Take it back
      </button>
    </div>
  );
}

/** NEW: the "not me" button for the person who was asked. */
export function NotMeButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full px-2 py-2 text-xs font-semibold text-zk-muted hover:text-zk-text">
      I'm not the right person
    </button>
  );
}

/** NEW */
export function AskSomeoneButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-zk-border bg-zk-surface px-3.5 py-2 text-xs font-semibold text-zk-text hover:bg-zk-chip"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6M22 11h-6" />
      </svg>
      Ask someone else
    </button>
  );
}

export function AskPanel({ e, onCancel, onSend }: { e: Escalation; onCancel: () => void; onSend: (to: PersonId, note: string) => void }) {
  const [to, setTo] = useState<PersonId>(e.suggestions[0]?.id ?? "kunle");
  const [note, setNote] = useState("");
  const first = PEOPLE[to].short;
  return (
    <div className="zk-pop flex flex-col gap-3 border-t border-zk-divider pt-3">
      <p className="m-0 text-sm font-semibold text-zk-text">Who knows this best?</p>
      <div role="radiogroup" className="flex flex-col gap-2">
        {e.suggestions.map((s, i) => {
          const on = to === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setTo(s.id)}
              className={`flex items-center gap-3 rounded-[12px] border px-3 py-2.5 text-left ${
                on ? "border-electric-blue-strong bg-zk-tint" : "border-zk-border bg-zk-surface hover:bg-zk-chip"
              }`}
            >
              <Avatar id={s.id} size="md" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-zk-text">{PEOPLE[s.id].name}</span>
                <span className="block text-xs text-zk-muted">{s.why}</span>
              </span>
              {i === 0 ? <span className="rounded-full bg-zk-ok-bg px-2 py-0.5 text-[11px] font-semibold text-zk-ok-fg">Best fit</span> : null}
              <span
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 rounded-full border-2 ${on ? "border-[5px] border-electric-blue-strong" : "border-zk-border"}`}
              />
            </button>
          );
        })}
      </div>
      <textarea
        rows={2}
        value={note}
        onChange={(ev) => setNote(ev.target.value)}
        placeholder={`Add a note for ${first} (optional)`}
        className="w-full resize-y rounded-[12px] border border-zk-border bg-zk-surface px-3 py-2 text-sm text-zk-text placeholder:text-zk-muted focus:outline-2 focus:outline-electric-blue"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => onSend(to, note.trim())} className="rounded-full bg-electric-blue-strong px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          Send to {first}
        </button>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-zk-muted hover:text-zk-text">
          Cancel
        </button>
        <span className="text-xs text-zk-muted">
          {e.agent} will wait. If {first} doesn't answer within an hour, it comes back to you.
        </span>
      </div>
    </div>
  );
}

