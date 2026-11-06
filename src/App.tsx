import { useEffect, useState } from "react";
import { ZikiHeader } from "./ziki/chrome";
import { InboxPage, notificationsFor } from "./inbox/EscalationsView";
import { EscalationPage } from "./inbox/EscalationPage";
import { COME_BACK_AFTER, MIN, OWNER, PEOPLE, holderOf, isWaiting, seed, type Actions, type Escalation, type PersonId } from "./data";


// Routes: the Inbox, or one escalation at #escalation-<id> (Ziki: /inbox/escalations/<id>).
function readHash(): string | null {
  try {
    const m = window.location.hash.match(/^#escalation-([a-z0-9]+)$/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [items, setItems] = useState<Escalation[]>(seed);
  const [viewer, setViewer] = useState<PersonId>(OWNER);
  const [openId, setOpenId] = useState<string | null>(readHash);
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onHash = () => setOpenId(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Nobody answered in time: it comes back to the owner on its own.
  useEffect(() => {
    setItems((list) =>
      list.map((e) =>
        e.askedTo && !e.answer && e.askedAt && now - e.askedAt > COME_BACK_AFTER * MIN
          ? { ...e, askedTo: undefined, askedNote: undefined, askedAt: undefined }
          : e
      )
    );
  }, [now]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const patch = (id: string, p: Partial<Escalation>) => setItems((l) => l.map((e) => (e.id === id ? { ...e, ...p } : e)));

  const open = (id: string | null) => {
    setOpenId(id);
    try {
      if (id) window.location.hash = `escalation-${id}`;
      else history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch {
      /* the preview frame may not allow it; state still works */
    }
  };

  const actions: Actions = {
    open,
    ask(e, to, note) {
      patch(e.id, { askedTo: to, askedNote: note || undefined, askedAt: Date.now() });
      setToast(`Sent to ${PEOPLE[to].short}. ${e.agent} will wait.`);
    },
    takeBack(e) {
      patch(e.id, { askedTo: undefined, askedNote: undefined, askedAt: undefined });
      if (viewer !== OWNER) open(null);
      setToast(viewer === OWNER ? "It's back with you." : `Sent back to ${PEOPLE[OWNER].short}.`);
    },
    answer(e, text) {
      patch(e.id, { answer: { by: viewer, text, at: Date.now() } });
      setToast(`${e.agent} got your answer and is working again.`);
    },
  };

  const switchViewer = (id: PersonId) => {
    setViewer(id);
    open(null);
  };

  const visible =
    viewer === OWNER ? items : items.filter((e) => e.kind === "question" && (e.askedTo === viewer || e.answer?.by === viewer));
  // Like countPendingEscalations: agent questions waiting on this person.
  const waitingFor = (id: PersonId) => items.filter((e) => e.kind === "question" && isWaiting(e) && holderOf(e) === id).length;
  const waitingOnMe = waitingFor(viewer);
  const unreadNotes = notificationsFor(viewer, items).filter((n) => n.unread).length;
  const current = openId ? visible.find((e) => e.id === openId && e.kind === "question") : undefined;

  return (
    <div className="min-h-screen bg-zk-bg">
      <ZikiHeader
        viewer={viewer}
        count={unreadNotes + waitingOnMe}
        waitingFor={waitingFor}
        onSwitch={switchViewer}
      />
      <main className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        {current ? (
          <EscalationPage e={current} viewer={viewer} now={now} actions={actions} />
        ) : (
          <InboxPage viewer={viewer} items={visible} waitingOnMe={waitingOnMe} now={now} actions={actions} />
        )}
      </main>
      {toast ? (
        <div role="status" className="zk-pop fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-deep-ocean px-4 py-2.5 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
