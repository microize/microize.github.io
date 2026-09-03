---
title: "Stock-Picking Basics, the SMILE Checklist, and Macro Lessons from Ray Dalio"
date: 2026-08-28
excerpt: "Notes from two different angles on investing — bottom-up stock-picking fundamentals (market cap, a small-cap screener recipe, gold vs. interest rates) and top-down macro lessons from Ray Dalio's Masterclass, including why losing 50% means you need to make 100% back."
tags: ["stock-market", "investing", "macro-investing", "learning-notes"]
layout: post.njk
image: ""
---

These notes cover two different angles on investing that I happened to study back to back — bottom-up **stock-picking fundamentals** (what actually moves a price, how to screen for small-cap candidates), and top-down **macro investing**, from Ray Dalio's Masterclass. Cleaned up and organized below.

*Standard disclaimer: personal learning notes, not investment advice.*

---

## Part 1 — Stock-Picking Fundamentals

### What actually moves a share price?

At the most basic level: **supply and demand**. More buyers than sellers at a price → the price rises, and vice versa. Everything else — earnings, news, sentiment — ultimately works by shifting that supply/demand balance.

### Market Capitalization

**Market Cap = number of outstanding shares × share price.**

In India, large/mid/small cap isn't actually a fixed rupee cutoff — SEBI defines it by **rank**:

- **Large Cap** — the 1st to 100th company by market cap
- **Mid Cap** — the 101st to 250th company
- **Small Cap** — everything beyond the 250th

The rupee cutoffs people quote for each band shift over time as the overall market grows (SEBI re-ranks companies periodically), which is why my raw notes had overlapping numbers for mid and small cap — worth remembering it's a moving, rank-based line, not a fixed number to memorize.

### The "SMILE" checklist

A mnemonic I came across for small-cap stock picking, common in Indian investing circles:

- **S** — Small cap
- **M** — Management with roughly 10–20 years of experience
- **I** — Some institutional sponsorship, even as little as 1% (a sign smart money has started noticing the stock)
- **L** — Promoter/founder holding above 60%, with **zero** pledging of those shares
- **E** — Sales & profit growth in the 20–35% range over the last 5 years

### Turning that into an actual screener

From the same notes, a concrete rule set you could plug into a stock screener:

```
Market Capitalization < 5,000 Cr AND
Promoter holding > 60% AND
Pledged percentage = 0 AND
Sales growth (3Y) > 25% AND
Sales growth (5Y) > 25% AND
Profit growth (3Y) > 25% AND
Profit growth (5Y) > 25%
```

This is essentially the SMILE checklist compressed into hard filters — small, fast-growing, founder-owned-and-committed (no pledging = no financial stress signal), with growth backed by multiple years of data instead of a single good quarter.

### A cause-effect chain worth remembering: rates, gold, and gold-loan companies

```
Interest rates ↑  →  Gold price ↓  →  Gold retail stocks benefit  →  Gold loan companies suffer
```

Worth unpacking *why* each link holds:

- **Rates up → gold down**: gold pays no interest or dividend. When rates rise, interest-bearing assets become relatively more attractive, so demand (and price) for gold tends to soften.
- **Gold down → retail jewellers benefit**: gold is their raw material. Cheaper input cost improves margins, and cheaper jewellery can also boost demand volume.
- **Gold down → gold-loan NBFCs hurt**: companies like gold-loan lenders hold pledged gold as *collateral*. When gold prices fall, the collateral backing existing loans is worth less — tightening loan-to-value ratios, capping how much they can lend against new gold, and shrinking recovery value if a loan defaults.

Same underlying driver (interest rates), opposite effect on two businesses that both touch gold — a good example of why "which sector benefits" questions need you to trace the actual mechanism, not just the headline.

---

## Part 2 — Macro Investing Lessons (Ray Dalio's Masterclass)

Where Part 1 is bottom-up (picking one company), this half is top-down: reading the broader economic environment as a **macro investor**.

### Seek out people who think differently

A recurring theme: actively look for people with genuinely different opinions from your own, and weigh their view seriously instead of just seeking agreement. The point isn't to be contrarian for its own sake — it's that a decision stress-tested against real disagreement is more robust than one made in an echo chamber.

### The diversification "Holy Grail"

One of Dalio's more concrete, quantified claims: holding around **15 good, uncorrelated investments** can cut portfolio risk by roughly **80%** compared to holding just one — without necessarily sacrificing expected return. The key word is *uncorrelated* — 15 stocks that all move together in a downturn don't give you this benefit; 15 genuinely independent return streams do.

### Turn decisions into rules, then backtest them

Rather than re-deciding from scratch (and from emotion) every time, write your decision criteria down as an explicit **rule**, then **backtest** it against history to see whether it would actually have worked. This is how you turn "gut feel" into something you can evaluate and improve.

### Alpha vs. Beta

Two words in my notes that are worth spelling out properly:

- **Beta** — the return you get simply from being exposed to the market/index. It's the "free" return of just showing up.
- **Alpha** — the *excess* return a strategy or manager generates **above** that benchmark. Alpha is the actual skill component — Beta isn't.

### The four macro environments

Dalio's framework boils the economy down to two variables — **Growth** (rising or falling) and **Inflation** (rising or falling) — giving four regimes:

| | Inflation Rising | Inflation Falling |
|---|---|---|
| **Growth Rising** | Best for equities/commodities | Best for equities/bonds ("goldilocks") |
| **Growth Falling** | Stagflation — hardest regime, favors cash/inflation-linked assets | Deflation/recession — favors bonds |

Different asset classes are built for different quadrants, which is the whole logic behind building an "all-weather" portfolio instead of betting on one regime persisting forever.

### Debt, money printing, and the stock market

`Printing more money → increases the stock market` is a real, if simplified, relationship: more money circulating (looser monetary policy) means more liquidity chasing the same assets, pushing nominal prices — including equities — higher. It ties into a bigger idea Dalio focuses on: economies build up debt over long cycles, and when that debt becomes unsustainable, central banks often turn to printing money to manage it. Also worth watching: **oil price shocks**, which are exactly why companies and investors use **commodity hedging** — to blunt a sudden spike they didn't see coming.

### The math of losses (and why capital preservation matters)

A simple but easy-to-underestimate point: losses and the gains needed to recover from them are **not symmetric**.

| Loss | Gain needed to break even |
|---|---|
| 10% | 11% |
| 25% | 33% |
| 50% | **100%** |
| 75% | 300% |

Lose half your capital, and you don't need a 50% gain to get back to even — you need to **double** what's left. This asymmetry is the real argument for diversification and risk management: avoiding large drawdowns matters more than chasing large gains.

### "Pain + Reflection = Progress"

One of Dalio's more repeated lines. The point isn't that pain itself teaches you anything — it's that pain **combined with deliberate reflection** on what caused it is what actually produces improvement. Skip the reflection, and you just have the pain.

### History rhymes

Not "history repeats itself" — but patterns (debt cycles, growth/inflation regimes, bubbles) tend to recur in recognizable shape even if the specifics differ. Studying past cycles is how you recognize the current one earlier.

---

## Closing checklist

Pulling both halves together, the basics worth returning to:

1. **Build a real portfolio** — not a single bet.
2. **Financial security is freedom and power** — it buys you optionality in life decisions, not just a bigger number.
3. **Know your own strengths** — invest in what you actually understand.
4. **Diversify** — aim for genuinely uncorrelated positions, not just "many" positions.
5. **Write your decisions down as rules**, and **backtest** them.
6. **Remember history rhymes** — debt cycles and growth/inflation regimes recur.
7. **Avoid the common mistakes** before chasing the clever ones — capital preservation compounds too.
