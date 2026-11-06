/* Mirrors app/(app)/inbox/page.tsx + escalations-view.tsx. */
import { useEffect, useState } from "react";
import { OWNER, PEOPLE, isWaiting, type Actions, type Escalation, type PersonId } from "../data";
import {
  AskPanel,
  AskSomeoneButton,
  AskedBanner,
  EscalationTypeBadge,
  LocalTime,
  NotMeButton,
  QuickResolveButtons,
  WaitingOnSomeone,
  WithPill,
} from "./controls";

const VIEWS = [
  { value: "waiting", label: "Waiting" },
  { value: "resolved", label: "Resolved" },
  { value: "all", label: "All" },
] as const;
type View = (typeof VIEWS)[number]["value"];

export function InboxPage({
  viewer,
  items,
  waitingOnMe,
  now,
  actions,
}: {
  viewer: PersonId;
  items: Escalation[];
  waitingOnMe: number;
  now: number;
  actions: Actions;
}) {
  const [tab, setTab] = useState<"notifications" | "escalations" | "messages">("escalations");
  const [view, setView] = useState<View>("waiting");
  useEffect(() => { setView("waiting"); }, [viewer]);

  const tabs = [
    { value: "notifications", label: "Notifications", count: notificationsFor(viewer, items).filter((n) => n.unread).length },
    { value: "escalations", label: "Escalations", count: waitingOnMe },
    { value: "messages", label: "Messages", count: 0 },
  ] as const;

  const counts: Record<View, number> = {
    waiting: items.filter(isWaiting).length,
    resolved: items.filter((e) => !isWaiting(e)).length,
    all: items.length,
  };
  const shown = items.filter((e) => (view === "waiting" ? isWaiting(e) : view === "resolved" ? !isWaiting(e) : true));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 pb-10">
      <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-zk-text">Inbox</h1>
      <nav aria-label="Inbox" className="flex gap-1 border-b border-zk-border">
        {tabs.map((item) => {
          const on = item.value === tab;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              aria-current={on ? "page" : undefined}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold ${
                on ? "border-electric-blue-strong text-zk-text" : "border-transparent text-zk-muted hover:text-zk-text"
              }`}
            >
              {item.label}
              {item.count > 0 ? (
                <span className="rounded-full bg-electric-blue-strong px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-white">{item.count}</span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {tab === "notifications" ? (
        <NotificationsList viewer={viewer} items={items} now={now} onOpen={(id) => actions.open(id)} />
      ) : tab === "messages" ? (
        <div className="space-y-4">
          <div>
            <h2 className="m-0 text-lg font-bold text-zk-text">Messages</h2>
            <p className="m-0 mt-1 text-sm text-zk-muted">Write to your agents. This is the one place you talk to them directly.</p>
          </div>
          <div className="rounded-[20px] border border-dashed border-zk-border bg-zk-surface p-6 text-sm text-zk-muted">
            <p className="m-0 font-semibold text-zk-text">No messages yet</p>
            <p className="m-0 mt-1">Messages you send your agents, and their replies, show up here.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="m-0 text-lg font-bold text-zk-text">Escalations</h2>
            <p className="m-0 mt-1 text-sm text-zk-muted">Questions your agents need answered, and redesign proposals waiting on a decision.</p>
          </div>

          <nav aria-label="Filter escalations" className="flex flex-wrap items-center gap-1.5">
            {VIEWS.map(({ value, label }) => {
              const on = view === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setView(value)}
                  aria-current={on ? "page" : undefined}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium ${
                    on ? "border-electric-blue-strong bg-electric-blue-strong text-white" : "border-zk-border bg-zk-surface text-zk-text2 hover:text-zk-text"
                  }`}
                >
                  {label}
                  <span className={`font-mono text-[11px] tabular-nums ${on ? "text-white/80" : "text-zk-muted"}`}>{counts[value]}</span>
                </button>
              );
            })}
          </nav>

          {shown.length > 0 ? (
            <ul className="m-0 flex list-none flex-col divide-y divide-zk-divider overflow-hidden rounded-[20px] border border-zk-border bg-zk-surface p-0">
              {shown.map((e) => (
                <EscalationRow key={e.id} e={e} viewer={viewer} now={now} actions={actions} />
              ))}
            </ul>
          ) : (
            <div className="rounded-[20px] border border-zk-border bg-zk-surface px-4 py-12 text-center">
              <p className="m-0 font-bold text-zk-text">{view === "waiting" ? "Nothing is waiting on you." : "No escalations here."}</p>
              <p className="m-0 mt-1.5 text-sm text-zk-muted">Agents stop here when they need a person: to answer a question or decide on a redesign.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EscalationRow({ e, viewer, now, actions }: { e: Escalation; viewer: PersonId; now: number; actions: Actions }) {
  const [asking, setAsking] = useState(false);
  const isOwner = viewer === OWNER;
  const waiting = isWaiting(e);
  const isQuestion = e.kind === "question";
  const mine = waiting && isQuestion && (e.askedTo ?? OWNER) === viewer;
  const withSomeoneElse = waiting && isOwner && !!e.askedTo;

  useEffect(() => { setAsking(false); }, [e.askedTo, e.answer, viewer]);

  return (
    <li className="flex flex-col gap-3 p-4 sm:p-5">
      {!isOwner && e.askedTo === viewer && waiting ? <AskedBanner e={e} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <EscalationTypeBadge type={e.type} />
          <button
            type="button"
            onClick={() => isQuestion && actions.open(e.id)}
            className="border-0 bg-transparent p-0 font-semibold text-zk-accent hover:underline"
          >
            {isQuestion ? e.agent : e.title}
          </button>
          {!isQuestion ? <span className="text-xs text-zk-muted">{e.agent}</span> : null}
          <span className="text-xs text-zk-muted">·</span>
          <LocalTime date={e.createdAt} now={now} className="text-xs text-zk-muted" />
        </div>
        {!waiting ? (
          <span className="inline-flex items-center rounded-full bg-zk-ok-bg px-2.5 py-0.5 text-xs font-semibold text-zk-ok-fg">Resolved</span>
        ) : withSomeoneElse ? (
          <WithPill to={e.askedTo!} />
        ) : (
          <span className="inline-flex items-center rounded-full border border-zk-warn-bd bg-zk-warn-bg px-2.5 py-0.5 text-xs font-semibold text-zk-warn-fg">
            Waiting on you
          </span>
        )}
      </div>

      <p className="m-0 whitespace-pre-wrap text-sm text-zk-text">{e.body}</p>

      <p className="m-0 text-xs">
        <span className="text-zk-muted">Issue: </span>
        <span className="font-semibold text-zk-accent hover:underline">
          #{e.issue.number} {e.issue.title}
        </span>
      </p>

      {mine && !asking ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zk-divider pt-2">
          <QuickResolveButtons
            onAnswer={(t) => actions.answer(e, t)}
            extra={isOwner ? <AskSomeoneButton onClick={() => setAsking(true)} /> : <NotMeButton onClick={() => actions.takeBack(e)} />}
          />
          <button type="button" onClick={() => actions.open(e.id)} className="border-0 bg-transparent p-0 text-xs font-semibold text-zk-accent hover:underline">
            Write a response →
          </button>
        </div>
      ) : null}

      {mine && asking ? <AskPanel e={e} onCancel={() => setAsking(false)} onSend={(to, note) => actions.ask(e, to, note)} /> : null}

      {withSomeoneElse ? (
        <div className="border-t border-zk-divider pt-2">
          <WaitingOnSomeone e={e} now={now} onTakeBack={() => actions.takeBack(e)} />
        </div>
      ) : null}

      {waiting && !isQuestion ? (
        <div className="border-t border-zk-divider pt-2">
          <span className="text-xs font-semibold text-zk-accent hover:underline">Review proposal →</span>
        </div>
      ) : null}

      {e.answer ? (
        <div className="rounded-[12px] border border-zk-border bg-zk-chip/60 p-3 text-xs text-zk-text2">
          <span className="font-semibold text-zk-muted">
            {e.answer.by === viewer ? "Your answer:" : `${PEOPLE[e.answer.by].short} answered for you:`}
          </span>
          <p className="m-0 mt-1 whitespace-pre-wrap">{e.answer.text}</p>
        </div>
      ) : null}
    </li>
  );
}

/* ---------------- Notifications (mirrors notifications-view.tsx) ---------------- */

type Note = { id: string; questionId: string; title: string; at: number; unread: boolean };

/** The in-app notifications Ziki sends for these escalations (lib/notifications.ts wording). */
export function notificationsFor(viewer: PersonId, items: Escalation[]): Note[] {
  const quote = (t: string) => `“${t}”`;
  const notes: Note[] = [];
  for (const e of items) {
    if (e.kind !== "question") continue;
    if (viewer === OWNER) {
      notes.push({
        id: `q-${e.id}`,
        questionId: e.id,
        title: `${e.agent} has a question for you about ${quote(e.issue.title)}`,
        at: e.createdAt,
        unread: isWaiting(e) && !e.askedTo,
      });
      if (e.answer && e.answer.by !== OWNER) {
        notes.push({
          id: `a-${e.id}`,
          questionId: e.id,
          title: `${PEOPLE[e.answer.by].short} answered ${e.agent}'s question for you about ${quote(e.issue.title)}`,
          at: e.answer.at,
          unread: true,
        });
      }
    } else if (e.askedTo === viewer || e.answer?.by === viewer) {
      notes.push({
        id: `p-${e.id}`,
        questionId: e.id,
        title: `${PEOPLE[OWNER].short} asked you to answer a question from ${e.agent} about ${quote(e.issue.title)}`,
        at: e.askedAt ?? e.createdAt,
        unread: isWaiting(e),
      });
    }
  }
  return notes.sort((a, b) => b.at - a.at);
}

function NotificationsList({
  viewer,
  items,
  now,
  onOpen,
}: {
  viewer: PersonId;
  items: Escalation[];
  now: number;
  onOpen: (questionId: string) => void;
}) {
  const notes = notificationsFor(viewer, items);
  const unread = notes.filter((n) => n.unread).length;
  return (
    <div className="space-y-4">
      <div>
        <h2 className="m-0 text-lg font-bold text-zk-text">Notifications</h2>
        <p className="m-0 mt-1 text-sm text-zk-muted">{unread === 0 ? "You're all caught up." : `${unread} unread`}</p>
      </div>
      {notes.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-zk-border bg-zk-surface p-6 text-sm text-zk-muted">
          <p className="m-0 font-semibold text-zk-text">No notifications yet</p>
          <p className="m-0 mt-1">New comments, mentions, assignments and status changes on issues you&apos;re watching will show up here.</p>
        </div>
      ) : (
        <ul className="m-0 list-none divide-y divide-zk-divider overflow-hidden rounded-[20px] border border-zk-border bg-zk-surface p-0">
          {notes.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => onOpen(n.questionId)}
                className={`flex w-full items-start gap-3 border-0 px-4 py-3 text-left text-sm transition-colors hover:bg-zk-tint ${n.unread ? "bg-zk-tint/50" : "bg-transparent"}`}
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.unread ? "bg-electric-blue-strong" : "bg-transparent"}`} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className={`block break-words ${n.unread ? "font-semibold text-zk-text" : "text-zk-text2"}`}>{n.title}</span>
                  <span className="mt-0.5 block text-xs text-zk-muted">
                    <LocalTime date={n.at} now={now} />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
