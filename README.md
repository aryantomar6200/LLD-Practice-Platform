# LLD Practice Platform

A focused MVP that helps learners practice Low-Level Design problems (Parking Lot, Elevator, etc.) and get structured, explainable feedback — instead of a static reference solution or unscoped AI chat with no memory of past attempts.

> Built as a 2-day take-home engineering assignment.

## The problem

LLD is easy to attempt but hard to self-assess. A learner can design a Parking Lot system and still have no idea whether their classes, abstractions, and responsibilities are actually good — existing options are either static (course reference solutions that don't react to *your* design) or unstructured (pasting a design into a general AI chat with no consistent rubric or memory across attempts).

## The core loop

```
Choose problem → Design → Submit → Evaluate → Branch:
  ├─ Needs improvement → corrective feedback, unlimited free retries
  └─ Satisfactory      → follow-up question (often a new requirement, testing
                          extensibility) — counts toward a 3-round cap
→ Final verdict summarizing improvement → stored in attempt history
```

Evaluation combines **deterministic checks** (does a required abstraction actually exist — objective, rule-based) with **LLM-based reasoning** (is it a *good* abstraction — a judgment call). A failing deterministic check always overrides an LLM "satisfactory" opinion.

## Where the actual design work is

All the LLD-relevant code lives in [`backend/domain/`](./backend/domain) — plain classes with zero dependency on Express or MongoDB, independently unit-tested. See [`backend/README.md`](./backend/README.md) for the full class-by-class breakdown.

## Tech stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **AI evaluation:** Groq API
- **Testing:** Node's built-in test runner (`node:test`), zero external dependencies

## Repo structure

```
.
├── backend/              # Express API + domain logic (see backend/README.md)
├── DESIGN_NOTE.md         # MVP summary, user flow, class/interface design, trade-offs
├── RESEARCH_NOTE.md        # Learner problem, existing tools researched, product direction
├── AI_USAGE.md            # AI-assisted decisions made during this assignment
└── README.md              # this file
```

## Quick start

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI and GROQ_API_KEY
node data/seedProblems.js
node server.js
```

Full API reference and testing instructions: [`backend/README.md`](./backend/README.md).

## Documentation

- [Research Note](./RESEARCH_NOTE.md) — the learner problem, what already exists, and why this direction
- [Design Note](./DESIGN_NOTE.md) — MVP scope, user flow, domain model, evaluation approach, trade-offs
- [AI Usage](./AI_USAGE.md) — where AI input shaped decisions, and what was accepted, rejected, or changed

## Known limitations (MVP scope)

- No frontend — tested end-to-end via Postman for this submission
- No authentication — a simple string identifier stands in for a real user system
- Deterministic checks are regex-based over submitted text, not a full parser/AST
- Two seeded problems (Parking Lot, Elevator) rather than a full problem library
