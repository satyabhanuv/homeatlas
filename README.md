# Conversation Log

Portable transcripts of strategy sessions so this work survives a Cowork session reset or a migration to a personal Claude account.

## How this works

- One markdown file per strategic conversation, filename format: `YYYY-MM-DD_short-topic.md`
- Each file contains: date, session context, what was discussed, what was decided, action items, open questions
- **Not a full turn-by-turn transcript** — a curated summary that preserves reasoning + decisions, not chit-chat
- Read in reverse chronological order to catch up on where things stand

## If you're migrating this to a fresh Claude session

Paste this preamble:

> I'm continuing work on Nearnity — a location-first public-data aggregator. All prior strategic context is in `/Users/svelivela/Documents/Claude/Projects/Personal/nearnity-planning/`. Read in this order:
>
> 1. `Founder_Notes.md` — positioning, decisions log, working rhythm
> 2. `Roadmap_Checklist.md` — what's in flight and what's next
> 3. `Feature_Catalog.md` — what's already built
> 4. `Conversation_Log/*.md` in reverse date order — how we got here
>
> After reading, tell me back in 3 sentences: primary niche, current version, next feature to build. Then we continue.

That preamble lets any Claude re-hydrate context without a 100-message replay.
