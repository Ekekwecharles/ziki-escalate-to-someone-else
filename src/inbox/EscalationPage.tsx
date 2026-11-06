/* Mirrors app/(app)/inbox/escalations/[id]/page.tsx ("Resolve Agent Escalation"). */
import { useEffect, useState } from "react";
import { OWNER, PEOPLE, isWaiting, type Actions, type Escalation, type PersonId } from "../data";
import { Avatar } from "../ziki/chrome";
import {
  AskPanel,
  AskSomeoneButton,
  AskedBanner,
  EscalationAnswerForm,
  EscalationTypeBadge,
  LocalTime,
  NotMeButton,
  QuickResolveButtons,
  WaitingOnSomeone,
  WithPill,
} from "./controls";

export function EscalationPage({ e, viewer, now, actions }: { e: Escalation; viewer: PersonId; now: number; actions: Actions }) {
  const [asking, setAsking] = useState(false);
  const isOwner = viewer === OWNER;
  const waiting = isWaiting(e);
  const mine = waiting && (e.askedTo ?? OWNER) === viewer;
  const withSomeoneElse = waiting && isOwner && !!e.askedTo;

  useEffect(() => { setAsking(false); }, [e.askedTo, e.answer, viewer]);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <article className="mx-auto max-w-2xl space-y-6 pb-10">
      <button
        type="button"
        onClick={() => actions.open(null)}
        className="inline-flex items-center border-0 bg-transparent p-0 text-sm font-semibold text-zk-accent hover:underline"
      >
        ← Back to Escalations
      </button>

      <div className="space-y-4 rounded-[20px] border border-zk-border bg-zk-surface p-5 sm:p-6">
        {!isOwner && e.askedTo === viewer && waiting ? <AskedBanner e={e} /> : null}

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zk-divider pb-4">
          <div className="flex items-center gap-2">
            <EscalationTypeBadge type={e.type} />
            <h1 className="m-0 text-xl font-extrabold tracking-tight text-zk-text">{e.agent}</h1>
          </div>
          <div className="flex items-center gap-2">
            {withSomeoneElse ? <WithPill to={e.askedTo!} /> : null}
            <LocalTime date={e.createdAt} now={now} className="text-xs text-zk-muted" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="m-0 text-[11px] font-bold uppercase tracking-[0.06em] text-zk-accent">Escalation Details</h2>
          <p className="m-0 whitespace-pre-wrap rounded-[12px] border border-zk-border bg-zk-chip/50 p-4 text-sm leading-relaxed text-zk-text">{e.body}</p>
        </div>

        <div className="rounded-[12px] border border-zk-border bg-zk-tint p-3 text-xs">
          <span className="text-zk-muted">Associated issue: </span>
          <span className="font-semibold text-zk-accent hover:underline">
            #{e.issue.number} {e.issue.title}
          </span>
        </div>

        <div className="pt-2">
          <h2 id="response-heading" className="m-0 mb-3 text-sm font-extrabold text-zk-text">
            {e.answer ? "Resolution Provided" : withSomeoneElse ? `Waiting on ${PEOPLE[e.askedTo!].short}` : "Respond to Agent"}
          </h2>

          {e.answer ? (
            <div className="space-y-2 rounded-[12px] border border-zk-border bg-zk-ok-bg/60 p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-zk-ok-fg">
                <span>✓ Resolved</span>
                <LocalTime date={e.answer.at} now={now} className="text-zk-muted" />
              </div>
              <p className="m-0 whitespace-pre-wrap text-sm text-zk-text">{e.answer.text}</p>
              {e.answer.by !== viewer ? (
                <p className="m-0 flex items-center gap-1.5 border-t border-zk-border pt-2 text-xs text-zk-text2">
                  <Avatar id={e.answer.by} size="xs" />
                  Answered by {PEOPLE[e.answer.by].name} for you
                </p>
              ) : null}
            </div>
          ) : withSomeoneElse ? (
            <div className="space-y-3 rounded-[12px] border border-zk-border bg-zk-info-bg/60 p-4">
              <div className="flex items-start gap-2.5">
                <Avatar id={e.askedTo!} size="md" />
                <div className="min-w-0 text-sm">
                  <p className="m-0 font-semibold text-zk-text">{PEOPLE[e.askedTo!].name} is looking at this</p>
                  {e.askedNote ? <p className="m-0 mt-0.5 text-zk-text2">Your note: “{e.askedNote}”</p> : null}
                </div>
              </div>
              <WaitingOnSomeone e={e} now={now} onTakeBack={() => actions.takeBack(e)} />
            </div>
          ) : mine ? (
            <div className="space-y-4">
              <div className="rounded-[12px] border border-zk-border bg-zk-chip/50 p-3">
                <span className="mb-2 block text-xs font-semibold text-zk-muted">Quick Actions:</span>
                {asking ? (
                  <AskPanel e={e} onCancel={() => setAsking(false)} onSend={(to, note) => actions.ask(e, to, note)} />
                ) : (
                  <QuickResolveButtons
                    onAnswer={(t) => actions.answer(e, t)}
                    extra={isOwner ? <AskSomeoneButton onClick={() => setAsking(true)} /> : <NotMeButton onClick={() => actions.takeBack(e)} />}
                  />
                )}
              </div>
              {!asking ? <EscalationAnswerForm onSend={(t) => actions.answer(e, t)} /> : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
