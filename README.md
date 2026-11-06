# Ziki · Ask someone else

A human–agent interaction improvement for [Ziki](https://ziki.dev), built on top of Ziki's existing **Inbox → Escalations** page.

## The problem

Ziki agents only escalate when a human really has to decide. But every escalation goes to the project owner, and the owner is often not the person who knows the answer. A non-technical owner gets asked about deleting a database column. An owner gets asked for a payment key that a co-founder holds.

## The change

There's one new button on each escalation: **Ask someone else**.

1. The owner picks who knows best. Ziki suggests people, with a one-line reason each, such as "Built most of the database". The owner can add a note.
2. That person sees the question in their own Inbox, with "Charles asked you to answer this". They answer with the same buttons Ziki already has, or press "I'm not the right person".
3. The owner sees "With Kunle" while waiting, then "Kunle answered for you". The agent waits the whole time. If nobody answers within an hour, the question comes back to the owner.

Nothing else on the page changes.

## Built on Ziki's design

Every class, colour token, badge, pill and button is copied from `emerjent/ziki`:
- `app/globals.css` and `app/theme-brand.css` (the `zk-*` tokens, Electric Blue)
- `app/(app)/inbox/page.tsx` and `escalations-view.tsx` (layout, tabs, filter pills, list)
- `escalation-controls.tsx` (type badges, Approve & Unblock, Authorize Work, response form)
- `components/app-header.tsx` (top bar)

- `app/(app)/inbox/escalations/[id]/page.tsx` (the page for one escalation)
- `lib/format.ts` (the "12 mins ago" time format)

So the components can move into Ziki with almost no styling changes.

## Files

| File | Mirrors in Ziki |
|---|---|
| `src/ziki/chrome.tsx` | `components/app-header.tsx` and `components/avatar.tsx` |
| `src/inbox/EscalationsView.tsx` | `app/(app)/inbox/page.tsx` + `escalations-view.tsx` |
| `src/inbox/EscalationPage.tsx` | `app/(app)/inbox/escalations/[id]/page.tsx` |
| `src/inbox/controls.tsx` | `escalation-controls.tsx` + `components/local-time.tsx`. Everything marked `NEW` there is the feature. |
| `src/data.ts` | Sample workspace data. In Ziki this comes from `listOwnerQuestions()` |

## What it would need in Ziki

- An escalation gets an `askedTo` user, an optional `askedNote` and an `askedAt` time.
- The answer records who gave it, and the agent's inbox receives it as usual.
- Suggested people come from who has worked on the issue's area (PR authors, reviewers, project members).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
```

## Deploy on Vercel

`vercel.json` is included, so Vercel picks the right settings on its own (Vite, `npm run build`, output folder `dist`).

1. Push this folder to GitHub.
2. In Vercel, choose **Add New → Project**, import the repo, and press **Deploy**.

To open one escalation directly, add `#escalation-e1` to the URL.

## Seeing both sides

Open the account menu (your name, top right) and use **Switch account** to see the Inbox as Kunle, the person Charles asked, then switch back.
