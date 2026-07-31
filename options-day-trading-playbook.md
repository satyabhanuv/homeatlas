# Options Day-Trading Playbook

**For:** Satya — Schwab/Thinkorswim, $5k–$25k account, aggressive risk appetite
**Trading window:** 6:30–8:00 AM PST (the first 90 minutes of the cash session)
**Built:** June 29, 2026

> **Read this first.** This is an educational training document, not financial advice. I'm not a financial advisor. Options can lose 100% of premium fast, and 0DTE can do it in minutes. Everything below is a *system to practice and stress-test*, not a promise of profit. The single biggest determinant of your survival is the risk rules in Section 5 — not the setups.

---

## 0. The mindset this whole plan is built on

You already said the thing most traders never learn: **wins come from discipline, not bigger size.** So this playbook is engineered around one principle:

**Your job is not to make money. Your job is to execute your rules. Money is the byproduct of doing that repeatedly.**

A "good day" is a day you followed your rules — even if you lost. A "bad day" is a day you broke a rule — even if you won, because a rule broken profitably is the most expensive lesson in trading (it teaches you the wrong habit).

Because you chose **aggressive / high risk** with a **small account**, we have to be honest about the math: aggressive sizing on a small account is the classic blow-up profile. So the deal I'm proposing is — *aggressive on conviction and setup quality, disciplined on capital at risk.* You can be aggressive in **how you trade a setup** without being reckless in **how much you can lose**. That distinction is the entire game.

---

## 1. Your constraints, and what they mean

**The PDT rule is gone (as of June 2026).** The $25,000 minimum and the 3-day-trades-per-5-days cap were eliminated when the SEC approved amendments to FINRA Rule 4210 (effective June 4, 2026; Schwab implemented June 8). You can now day trade freely in a sub-$25k account.

**What replaced it:** intraday buying power is now based on your **real-time intraday margin excess**, not an end-of-day equity floor. Practically, for someone trading defined-risk options (you're buying premium, not selling naked), this matters less — your max loss per options trade is the premium you pay, and you'll be sizing well below your buying power anyway.

**Your 90-minute window is a feature, not a limitation.** 6:30–8:00 AM PST = 9:30–11:00 AM ET = the open. This is the highest-volume, highest-volatility, most-tradeable stretch of the day. Most professional intraday edges live in the first 60–90 minutes. You are trading the best window and then walking away — that's structurally healthy. It removes the biggest killer of day traders: overtrading out of boredom in the dead midday chop.

**The clock works against options buyers.** Theta (time decay) accelerates intraday on short-dated contracts and is brutal on 0DTE. Translation: you get paid for being *right and fast*. If a trade isn't working within your expected timeframe, decay is actively bleeding you even when price goes nowhere. This is why every setup below has a time stop, not just a price stop.

---

## 2. Instruments — what you actually trade

You chose a **mix**: index options as bread-and-butter, single stocks on catalyst days. That's the right call. Here's the discipline around each.

**Bread-and-butter: SPY / QQQ.**
- Deepest liquidity, tightest spreads, you'll never have trouble getting filled or out.
- Use them for the daily opening-range and VWAP setups in Section 4.
- Strike/expiry: for day trades, use slightly-in-the-money or at-the-money contracts **0–2 DTE**. ITM gives you higher delta (moves more with the underlying) and lower theta-as-%-of-premium than far OTM lottery tickets. Avoid cheap far-OTM "I only paid $15" contracts — those are where small accounts go to die slowly.
- **0DTE is allowed but caged:** only on days with a clear directional setup, only in the first hour, only with your time stop armed. 0DTE is a scalpel, not a default.

**Catalyst days: liquid single names (NVDA, TSLA, AAPL, AMD, META, etc.).**
- Only trade these when there's a *reason* the stock will move in your window: earnings reaction (the morning after), a major product/news event, or it's the clear market leader gapping that day.
- Use weeklies, **at least 1–5 DTE** (not 0DTE on single names — gaps and wider spreads make 0DTE single-stock options a coin flip).
- One catalyst name per day, max. You are not trying to cover the whole market.

**Hard rule:** if the spread on the contract is wider than ~5–8% of the premium, skip it. Wide spreads mean you lose on entry and exit before the trade even moves.

---

## 3. The daily routine (timed to your window)

Consistency starts with the same sequence every single day. This is your pre-flight checklist.

**The night before (10 min):**
- Glance at tomorrow's economic calendar. Note the time of any major release (CPI, FOMC, jobs, PCE). **If a major number drops inside your 6:30–8:00 window, plan to sit out the first 5–15 min after it** — the spike is noise, not signal.
- Check the earnings calendar for your watchlist names that reported after-hours or report pre-market.
- Write down 1–3 names you'll actually watch tomorrow. No more.

**5:55–6:25 AM PST — Pre-market prep (30 min):**
1. Mark the **key levels** on SPY/QQQ and your catalyst name: prior day high/low/close, pre-market high/low, and any obvious overnight range. These are your battle lines.
2. Note where price is *now* relative to those levels and where VWAP is likely to open.
3. Define your bias in one sentence: *"SPY gapped above yesterday's high on strong futures; I'm looking long on a pullback to VWAP unless it loses [level]."* If you can't write the sentence, you don't have a bias — that's fine, you wait.
4. Set alerts at your key levels in TOS so you're not staring.

**6:30–6:45 AM PST — The opening range (do NOT trade yet):**
- The first 15 minutes set the **opening range (OR)**. Let it form. Most blow-ups happen in the first 5 minutes chasing the open. You are watching, marking the OR high and low, reading whether buyers or sellers are in control.

**6:45–8:00 AM PST — Execution window:**
- Now you take setups from Section 4 that trigger. You are hunting for **A+ setups only** — alignment of level + direction + your bias. If nothing sets up, you take nothing. A no-trade day is a successful day.
- Max **2–3 trades** for the day. Quality over quantity is now a *choice* you make (PDT no longer forces it), so you must enforce it yourself.

**8:00 AM PST — Hard stop on new entries.**
- No *new* day trades after 8:00. You can manage an existing position to its exit, but you don't open anything new. This protects you from the "one more trade to get it back" spiral, which is the #1 account killer.

**After the close of your window (10–15 min, same day or evening):**
- Journal every trade (template in Section 6) *while it's fresh*. This is non-negotiable. The journal is where the actual learning happens — the trading is just data collection.

---

## 4. The strategy — concrete setups

You get **three core setups**. Master these before adding anything. Each has a trigger, an entry, a stop (price AND time), and a target. Discipline = you only take trades that match one of these exactly.

### Setup A — Opening Range Breakout (ORB)
*The bread-and-butter directional play.*
- **Context:** After the 6:30–6:45 opening range forms, price consolidates near the high or low of that range with momentum in one direction.
- **Trigger:** Price breaks and *holds* above the OR high (long) or below the OR low (short) — ideally with a retest that holds.
- **Entry:** Buy ATM/slightly-ITM calls (breakout up) or puts (breakdown) on the confirmed break. Avoid buying the first 1-second spike; wait for the candle to close beyond the level or for a retest.
- **Stop (price):** Underlying closes back inside the opening range. That invalidates the breakout — out, no debate.
- **Stop (time):** If it hasn't moved in your favor within ~10–15 min, exit. Theta is eating you.
- **Target:** First target = measured move equal to the OR height projected from the break. Take partial profit there, trail the rest.

### Setup B — VWAP Reclaim / Rejection
*The highest-probability "fade the noise" play.*
- **Context:** VWAP (volume-weighted average price) is the intraday line institutions anchor to. Price tends to react at it.
- **Reclaim (long):** Price was below VWAP, pushes back above it, and *holds* on a retest → momentum shifting up. Buy calls.
- **Rejection (short):** Price rallies into VWAP from below, stalls, and rolls over → sellers defending. Buy puts.
- **Entry:** On the hold/rejection confirmation, not the first touch.
- **Stop (price):** A clean close back through VWAP against you (e.g., for a reclaim long, a decisive close back below VWAP).
- **Stop (time):** ~10 min.
- **Target:** Prior day high/low or the next marked level. Partial out at the first level.

### Setup C — Gap Fade (counter-trend, more aggressive)
*Only when the gap is unsupported.*
- **Context:** Stock/index gaps up or down at the open with no fresh news justifying it (i.e., not an earnings gap), into a known resistance/support level.
- **Trigger:** Price fails to continue in the gap direction in the first 15–30 min and starts reverting toward the prior close.
- **Entry:** Puts on a failed gap-up at resistance; calls on a failed gap-down at support.
- **Stop (price):** New high/low beyond the gap extreme — if it keeps going, you're wrong, get out fast.
- **Stop (time):** ~10 min; fades work quickly or not at all.
- **Target:** The gap fill (prior day's close) is the classic objective. Take most of the position there.

### The overnight / swing variant (your stated interest)
You asked about holding overnight. Here's the disciplined version:
- **Don't hold a day-trade setup overnight to "save" a loser.** That's not swing trading, that's hoping. The decision to swing must be made *at entry*, not as a bailout.
- **Legit swing entry:** a setup that closes the day strong *in your direction* near the highs/lows, where you want continuation tomorrow. Use **longer-dated options (1–2 weeks DTE)** so overnight theta and a small adverse open don't wreck you. Far-dated reduces the gamma/theta knife-edge.
- **Overnight risk is real:** gaps can blow through your mental stop before you can act. So size swing positions *smaller* than day trades, and only swing when the daily/4h chart agrees with your intraday read.
- Treat swing as a **separate strategy with its own journal tag** — don't blur the two or you'll never know which one actually makes money.

---

## 5. Risk management — the rules that actually keep you alive

This section overrides everything else. You can have a mediocre strategy and survive with great risk rules. You cannot survive great setups with bad risk rules. Given **aggressive appetite + small account**, these are tighter than you might like — that's the point.

**Per-trade risk: 1–2% of account, max.**
- On a $10k account, that's **$100–$200 of *defined loss* per trade** — meaning the amount you'll lose if your stop hits, not the premium you paid (though for OTM lotto buys those are the same, which is another reason to avoid them).
- "Aggressive" lives in *setup selection and conviction sizing within this cap* — e.g., you size toward 2% on an A+ setup and 0.5–1% on a marginal one. It does **not** mean betting 20% of the account on a 0DTE flier. That's not aggressive, that's terminal.

**Daily max loss: 3–4% (2–3 losing trades). Then you're done for the day.**
- Hit it and you close the platform. No revenge trade. The market is open every single day for the rest of your life; there is always tomorrow. Most catastrophic losses come from the trades taken *after* the day was already lost.

**Daily profit "consider stopping" level.**
- If you're up a strong day early (say +5–8%), strongly consider banking it and walking. Giving back a green day to overtrading is demoralizing and erodes discipline.

**Position sizing math (do this every trade):**
1. Account × risk% = dollars at risk (e.g., $10,000 × 2% = $200).
2. Estimate your loss per contract if the price stop hits (use TOS's analyze tab / the option's delta to estimate the premium move).
3. Contracts = dollars at risk ÷ estimated loss per contract, rounded **down**.
4. If that's less than 1 contract at acceptable risk, **the trade is too big for your account — skip it.** Don't force it.

**Never:**
- Average down on a losing day trade. (Adding to losers is how small losses become account-ending losses.)
- Hold a 0DTE through your time stop hoping for a reversal — it's the fastest decay there is.
- Trade size you can't emotionally handle. If a position makes you check it every 10 seconds, it's too big.
- Trade through a major scheduled news release inside your window without a plan.

---

## 6. The consistency system — journal + review

This is what converts random trading into a repeatable edge. **No journal = no edge, period.**

**Trade journal — log every trade, same day.** Track at minimum:

| Field | Why it matters |
|---|---|
| Date / time of entry & exit | Spot if certain times are losers for you |
| Ticker + contract (strike/DTE) | Track 0DTE vs swing performance separately |
| Setup (A / B / C / swing) | Find out *which setup actually makes you money* |
| Bias sentence (your pre-trade thesis) | Did you have a real reason or did you wing it? |
| Entry / stop / target (planned) | Were these set *before* entry? |
| Actual exit + P/L | The result |
| **Rule followed? Y/N** | The single most important column |
| Emotion/notes | "Chased," "revenge trade," "perfect patience" |

**Weekly review (Sunday, 20–30 min):**
- Win rate and average win vs. average loss (your **avg win should be ≥ your avg loss** — ideally 1.5x+; a 45% win rate with 2:1 winners is very profitable).
- Which setup has the best expectancy? Do more of that, cut the worst.
- **What % of trades were "rule followed = Y"?** Target 90%+. If you're profitable but rule-following is low, you got lucky and it won't last. If you're following rules but losing, the strategy needs adjusting — but at least it's *fixable* because you have clean data.
- Pick **one** thing to improve next week. Just one.

**Monthly:** decide whether to scale size (see Section 7).

---

## 7. The phased ramp — how we actually start

You're experienced, so I won't make you re-learn calls and puts. But aggressive + small account means we earn the right to risk real money by proving the system works *for you* first. Proposed phases:

**Phase 1 — Paper trade in TOS (2–3 weeks, ~10–15 trades minimum).**
- Thinkorswim's paperMoney is excellent and free. Run the *exact* routine and setups above on live market data with fake money.
- Goal isn't profit — it's **proving you can follow the routine and hit 90%+ rule-following.** This builds the habit loop with zero financial risk.

**Phase 2 — Live, minimum size (3–4 weeks).**
- Trade real money but at the *smallest* size (1 contract, cheapest acceptable ITM contract). Real money changes your psychology — that's exactly what you're training for. Stay at min size until your live journal shows positive expectancy AND 90%+ rule-following over ~20 trades.

**Phase 3 — Scale to your full risk rules.**
- Only now do you size up to the 1–2% per-trade rules. Scale gradually. If a drawdown hits or rule-following drops, you step *back down* a phase. Scaling is earned, not assumed.

**Phase 4 — Add the swing/overnight strategy** as a separate tracked book, once the intraday system is consistent.

The hard truth on aggressive appetite: the fastest way to *be* aggressive is, counterintuitively, to survive long enough to compound. A trader who makes 5%/week and doesn't blow up obliterates a trader who swings for 50% and resets to zero twice a year. Aggression without survivorship is just gambling with extra steps.

---

## 8. Your first week (starting Monday, June 29, 2026)

1. **Today/tonight:** Open paperMoney in TOS, set up a clean chart layout (1-min and 5-min, VWAP, prior-day levels). Build your watchlist: SPY, QQQ, and 4–5 liquid single names.
2. **Each morning this week:** Run the full routine in Section 3 on paper. Mark the opening range. Take *only* A/B/C setups. Max 2–3 trades.
3. **Each day after:** Journal every trade with the Section 6 template.
4. **Sunday:** First weekly review. Bring me the journal and we'll find your edge and your leaks together.

---

## Open questions for me to keep coaching you

- Want me to build this journal as a ready-to-use spreadsheet (auto-calculating win rate, expectancy, rule-following %)?
- Want a one-page printable version of the morning routine + setups to keep next to your screen?
- Want to walk through reading VWAP and opening range on a real recent SPY chart so the setups are concrete?

---

*Educational material only. Not financial advice. Trade at your own risk; you can lose your entire investment.*
