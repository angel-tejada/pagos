# Pagos — Market Analysis

Compiled 2026-08-29. All review evidence gathered by direct API harvest, not from
marketing copy or secondary summaries.

---

## 0. Method, evidence base, and where the data is thin

### What I actually collected

| Source | Method | Volume |
|---|---|---|
| Apple App Store reviews | `itunes.apple.com` customer-reviews RSS, 29 apps × 14 storefronts (us, gb, ca, au, ie, es, mx, ar, co, cl, pe, ve, do, pr), all pages | 9,399 raw |
| Google Play reviews | `google-play-scraper`, 18 apps × 3 locales (us/en, mx/es, es/es), newest-first | 5,871 raw |
| App Store catalogue | iTunes Search API, 10 English + 6 Spanish query terms × 5 countries | 254 distinct apps |
| Play catalogue | Play search, 7 query terms | 100+ distinct apps |
| **Deduplicated review corpus** | title+body normalised, near-duplicate collapse | **12,217 reviews** |
| — of which Spanish-language storefronts | mx, es, ar, co, cl, pe, ve, do | **5,737** |

### Where the data is thin — read this before trusting anything below

1. **Neither store's review API is a random sample.** The Apple RSS feed returns
   roughly the most recent 500 reviews per storefront, sorted newest-first. Google
   Play was capped at ~600 newest per app. So every "% of low reviews" figure below
   describes **recent, self-selected opinion**, not the lifetime user base.
   Splitwise's lifetime App Store average is 3.97 across 27,413 ratings, but its
   *recent* App Store reviews in my pull are 51% one-to-three star. Both numbers are
   true; they measure different things. The recent skew is itself a finding (§2),
   but do not read 51% as "half of Splitwise users are unhappy."

2. **The apps you named have very little review data.** This is the single biggest
   limitation of this report:
   - Who Owes Me (Voglhuber, iOS): **79 reviews** across 14 storefronts
   - OweMe (AIR APPS, iOS): **14 reviews**
   - Debt Tracker: Personal Debts (Serrano Canales): **172** (iOS + Play combined)
   - OweList: **1 review**

   Conclusions about these specific apps rest on tens of data points, not thousands.
   I flag confidence inline.

3. **`OwedPayTrack` — I could not find it.** Not on the App Store (searched `us`,
   `es`, `mx`) and not on Google Play. Either it is delisted, named differently, or
   region-locked somewhere I did not search. I am not going to invent findings for it.

4. **"IOU / Spend" is ambiguous.** I found several tiny apps named "IOU" (largest:
   IOU by Eric Agredo, 18 ratings, 7 reviews) and nothing matching "Spend" as a
   peer-debt tracker. If you meant a specific app, name it and I will pull it.

5. **Reddit is not in this report as a primary source.** Reddit's public JSON
   endpoints now return an HTML interstitial to unauthenticated clients; I could not
   retrieve thread or comment text. Where I reference the Splitwise backlash from the
   open web, it comes from comparison blogs — which are themselves marketing for
   competing apps and are weak evidence. **All Splitwise complaint quotes below come
   from the store review corpus I harvested, not from Reddit.** You asked
   specifically for Reddit and forum threads; I could not deliver that leg, and the
   store corpus is what stands in for it.

6. **No install or retention telemetry.** `realInstalls` returned zero from the Play
   scraper, and no public source gives per-app retention for apps this small. Every
   retention claim in Q2 is labelled as inference or as an industry benchmark, never
   as measured fact about these apps.

7. **Duplicate reviews across `mx` and `es` storefronts.** Google Play serves the
   same review to both locales. I deduplicated; per-country counts should not be
   summed naively.

**Notation:** **[FOUND]** = directly evidenced in the harvested corpus or a cited
source. **[INFERRED]** = my reasoning from that evidence, which could be wrong.
**[THIN]** = evidenced, but by so few data points that it is a hypothesis to test.

---

## 1. Market map: the category is two different markets wearing one name

### 1a. The same category searched in English vs Spanish returns different industries

**[FOUND]** Querying the App Store for `who owes me money` (US) returns, in the top
10: PayMe – Claim Your Money (35,458 ratings), Settlemate: Claim Savings (72,773),
Payout: Claim Class Actions (11,052), Freedom Debt Relief (20,178). These are
**class-action settlement finders and debt-relief lead generators**, not IOU
trackers. The literal phrase has been captured by a different industry with far more
ASO budget.

**[FOUND]** Querying `prestamos personales` on the Mexican App Store returns almost
exclusively **licensed consumer lenders** (SOFOMs): Prestamos de dinero-Cash App
(43,463 ratings), MexDin (34,018), Prestamos de Dinero: cash app (32,159), MexíCash
(30,611), mexcredtio (27,533), Bretton (25,262), Torre Dinero (21,972). That term is
a payday-loan keyword, not a debt-tracking keyword.

**[INFERRED]** Two of the six search terms in your brief are not viable acquisition
channels. `who owes me money` and `prestamos personales` are owned by better-funded
adjacent industries. The terms that actually reach this category are `quien me debe`,
`control de deudas`, `deudores`, `debt tracker`, and `IOU tracker`.

### 1b. Two distinct markets

**Market A — Group bill splitting.** Splitwise, Tricount, Settle Up, Splid,
Splitser, Kittysplit, Tab. Large, mature, well-funded, English-first. Splitwise:
194,319 Play + 27,413 App Store ratings. Tricount: 193,797 Play ratings (owned by
bunq, a licensed bank).

**Market B — One-to-one debt / receivables ledgers.** Two sub-populations that look
identical in a store listing but are not:

- **B1, English personal IOU:** Who Owes Me (Voglhuber) 794 App Store ratings; Who
  Owes Me (Kolev, Play) 450; My Debts (Anthill) 3,754. Small.
- **B2, Spanish small-merchant receivables** — the surprise:

| App | Play ratings | Score | Framing |
|---|---|---|---|
| Libreta de Fiado – Deudas | **16,287** | 4.78 | corner-store credit tab ledger |
| CobradorApp | 2,503 | 4.76 | debt *collection* rounds |
| Deudores – Control de Deudas | 2,174 | 4.49 | "debtors" |
| Deudores y Cobranza | 1,857 | 4.84 | "debtors and collections" |
| Debt Tracker: Personal Debts | 1,412 | 4.48 | personal (bilingual) |
| Who Owes Me (Kolev) | 450 | 4.45 | personal |

**[FOUND]** The Spanish-language one-to-one debt category on Android is roughly an
order of magnitude larger than the English one, and its vocabulary is *cobros*,
*cobranza*, *deudores*, *fiado* — collections and store credit, not friendship.
"Libreta de fiado" is the paper notebook a neighbourhood shop keeps for customers
buying on credit. That is the job these apps are hired for.

**[FOUND]** That market has a well-funded incumbent: **Treinta** (Y Combinator W21)
reports 5M+ users across 18 countries and has raised $60.1M, targeting the 50M Latin
American microbusinesses still on pen and paper. A Deudores reviewer cites Treinta by
name as the reason Deudores' lack of backup is unacceptable.

---

## 2. Per-app findings

Quotes are verbatim from the harvested corpus, marked with source/storefront/rating.
Spanish quotes appear as written, with translation.

### Splitwise — the category's cautionary tale

*27,413 App Store ratings (3.97 lifetime) · 194,319 Play ratings (4.06) · IAP $0.99–$89.99*
*Corpus: 3,998 reviews. Recent low-star share: 51% (App Store), 53% (Play).*

**Praised.** Simplicity and longevity — 2,810 of 7,194 positive reviews in the
group-splitter set use simplicity language. Long tenure recurs constantly.

**Hated — overwhelmingly one thing.** Of 1,857 low-star App Store reviews, **38%
mention price/paywall and 36% mention the free-tier limit.** That is not a spread of
complaints; it is a single event. Splitwise added a daily cap on expense entries
(users report 3–5/day), a forced wait timer, and interstitial ads.

> "Greed ruined this app. Can only add 3 expenses per day, which is absolutely
> insane, and wants you to pay $5 per month to be able to add more expenses, which is
> also insane. It's a simple app that made things easier, but it is not worth paying
> for." — Play/us/1★

> "It is a shame that you made your app terrible over time. We can't even add more
> than 4 expenses a day now. **At least give us ads instead of blocking features.**
> You are defeating the main purpose of your app." — Play/us/1★

> "This app used to be great... beyond some number of expenses (4 I think), you're
> locked out from adding more expenses for the day unless you poney up for their pro
> subscription. Given that this app is a glorified calculator / spreadsheet and that
> free alternatives exist, I will be uninstalling it." — Play/us/1★

> "Que manera de estropear una app... esto debería ser viendo publicidad pero no
> bloqueando añadir gastos... Uso está app desde 2018 y hasta ahora me habia ido muy
> bien pero **no volveré a usarla**." — Play/es/1★
> *(What a way to ruin an app... this should be by watching an ad, not by blocking
> adding expenses... I've used this app since 2018 and it went very well until now
> but I will not use it again.)*

> "I was using this app for years and it was so helpful tracking expenses for who
> owes who. But now it's *'you want to track who owes you $12? That'll be $60.'* Are
> you serious. I'm deleting this app and using a different, free one."
> — App Store/us/1★

**Where they lose users.** Not at onboarding — at the moment a long-tenured user
discovers the rules changed underneath them. The uninstall is an act of betrayal, not
disappointment. Users name their destination: Spliit, Splitser, Tricount, Google
Sheets, pen and paper, ChatGPT.

**Begged for, unbuilt.** A one-time purchase. 39 Splitwise reviews in my corpus ask
for it explicitly:

> "I am so sick of paying a subscription fee for EVERYTHING. Is there a way that I
> can just pay a flat rate and use this app? I would absolutely opt out of future
> updates and features if it means a one-time..." — App Store/ca/2★

### Splid — the counter-example, and the closest template for you

*3,975 App Store ratings (4.91) · 85,733 Play ratings (4.90) · one-time $3.49*
*Corpus: 3,528 reviews. Recent low-star share: 2% (App Store), 1% (Play).*

**[FOUND]** Splid's recent low-star rate is **1–2% against Splitwise's 51–53%**, in
the same category, harvested the same way on the same day. The difference is not
features. Splid is free for one group, charges **one flat $3.49** for unlimited
groups, requires **no account**, and works **offline**.

> "Doesn't seem to want your data, no need for an account. No hidden necessities
> behind a subscription. Simply records purchases inputted. Nothing flashy, yet a
> solid ui. It took me far too long to find an app that did what I wanted without
> anything sketchy or excessive about it." — App Store/us/5★

> "The best two features though 1) you can use it offline, and 2) you can get the pro
> upgrade for a very reasonable one time fee... **I stopped using Splitwise because a
> subscription for a simple calculator to split up expenses is stupid**"
> — App Store/us/5★

> "Better than Splitwise because you can do it all without having everyone make
> accounts! This app lets one person be in charge and enter all the info so everybody
> else doesn't need to worry about it" — App Store/us/5★

> "If you have multiple groups, pay $3.99 one time, not more $ per year like others."
> — App Store/us/5★

**This is the strongest single piece of evidence in the report**, and it validates
three decisions you have already made: one-time price, no account, offline.

Note Splid's free tier is *one group* — a **scope** limit, exactly like your
12-person limit — and it draws almost no complaints. Splitwise's hated limit is a
**rate** limit that blocks the core action. That distinction matters enormously; see
Q6.

### Tricount — free, bank-owned, losing people to reliability

*6,812 App Store ratings (4.88) · 193,797 Play ratings (4.78) · free, ad-supported*
*Corpus: 1,519 reviews. Recent low-star share: 31% (App Store), 43% (Play).*

**Praised.** Free with no limits; simplicity (248 positive mentions).

**Hated.** Distinct from Splitwise — Tricount's complaints are **data loss and
crashes**, not money. Of 380 low-star App Store reviews: 8% data loss, 9% crash/bug,
8% export problems.

> "I was asked to update the app in order to keep using it in the middle of my trip
> and it completely erased all of the data from a weeklong trip" — App Store/us/1★

> "La he actualizado y cuando la intento usar se me cierra sola. La he desinstalado y
> vuelto a instalar y me sigue dando el mismo problema." — App Store/es/2★
> *(I updated it and when I try to use it, it closes by itself.)*

> "Cambiaron la subscripcion de proyecto a persona — Que asco de sistema de
> subscripcion, todos los miembros de la app deben pagar" — App Store/co/1★
> *(They changed the subscription from per-project to per-person — disgusting
> subscription system, every member has to pay.)*

### Settle Up

*1,707 App Store ratings (4.82) · 49,869 Play ratings (4.72) · IAP to $149.99*
*Corpus: 546 reviews. Recent low-star share: 45% (App Store), 26% (Play).*

Of 102 low-star App Store reviews: **21% price, 21% crash/bug** — the highest
crash-complaint density among the majors. Thin qualitative signal beyond that.

### Who Owes Me (Roman Voglhuber, iOS) — your closest named competitor

*794 ratings (4.63) · subscription*
*Corpus: **79 reviews** — [THIN] throughout.*

Of 38 low-star reviews: 37% price, **24% crash/bug, 13% data loss**. Three distinct
failure modes, all severe.

**1. A subscription wall dropped on existing users.**

> "**Sudden paywall** — 2/5/23 - Suddenly I can no longer use the app. It's locked
> behind a subscription paywall. Been using this app for a long time and suddenly I
> now have to pay a subscription for it. **DO NOT UPDATE TO THE NEWER VERSION.**" — 1★

> "Dark mode is subscription-only — **Only reason I still have this installed is
> because I can't find any other app like it.**" — 1★

**2. Catastrophic data loss.**

> "update: crashed. lost all data. — tried to open app today. nothing is in there.
> **years worth of data gone** due to recent 'update'. 👎🏼" — 1★

> "All of my data suddenly disappeared! I reached out to the developer for help, but
> haven't received a reply in days." — 1★

**3. No support channel — and business users depend on it.**

> "**I run my business through this app** so this problem is a huge inconvenience!" — 1★

> "My app is showing **wrong sum**. There is no way to contact the developer." — 1★

**The most commercially important sentence in this report** is *"Only reason I still
have this installed is because I can't find any other app like it."* That is a user
held by the absence of alternatives, not by satisfaction. **[INFERRED]** That is
exactly the user you can take, and the cheapest acquisition available to you.

**Begged for, unbuilt:** an instalment/payment-plan view.

> "I wish there were a way to make a payment plan for a larger sum of money owed
> (like $100 a month for 12 months to pay off a $1200 debt)." — 3★

### Debt Tracker: Personal Debts (David Serrano Canales)

*60 App Store ratings (4.83) · 1,412 Play ratings (4.48) · ads + IAP $0.99–$28.99*
*Corpus: 172 reviews.*

**Hated:** ads *and* subscription stacked together; sync paywalled.

> "**Forces you to buy subscription** App has ads but that isn't enough for them. They
> cut out basic features like being able to log and track repayments behind a monthly
> fee." — Play/us/1★

> "Hay que pagar para tener sincronización" — Play/mx/2★ *(You have to pay to get sync.)*

**Two findings that bear directly on your spec [THIN — 2 clear instances]:**

> "Too complicated. **Why can't i just add name? Instead of contact?** No color, not
> intuitive to see is i owe them, or they owe me." — Play/us/2★

> "Parece que obligatoria mente hay que darle la lista de contactos a la app"
> — Play/mx/1★ *(It seems you're forced to give the app your contact list.)*

Being honest about strength: I searched all 12,217 reviews for contacts-permission
complaints and found only these two clearly on point (a broader regex returned 82
hits, almost all "can't contact customer service"). So this is a **hypothesis, not a
finding** — but it contradicts your v1 spec, which makes Contacts the *primary* path.

**Also requested:** alphabetical sorting (twice), instalments/*abonos* showing
original amount and remaining balance, phone-to-phone transfer.

### The Spanish receivables cluster

*Libreta de Fiado, CobradorApp, Deudores, Deudores y Cobranza — combined 719 reviews,
overwhelmingly mx/es storefronts.*

Low-star rates here are **much lower** than the English apps (11–22%), which
**[INFERRED]** suggests these apps fit their job better than the English ones fit
theirs. The complaints are concrete and consistent.

**1. Ads at the point of entry — the top complaint.**

> "Una app que empezó muy bien, pero ahora **a cada asiento hay un anuncio.
> Publicidad exagerada.** Y cada vez que actualiza desaparecen los avatares de las
> cuentas y **se pierden datos**. Hasta aquí he llegado: **desintalada**."
> — Libreta de Fiado, Play/mx/1★, **+25 upvotes — the highest-voted negative review
> in the entire Spanish corpus**
> *(An app that started very well, but now there's an ad on every entry. Exaggerated
> advertising. And every time it updates the account avatars disappear and data is
> lost. I've had enough: uninstalled.)*

**2. No backup = existential risk. This contradicts your no-cloud rule.**

> "el problema de que **no se puede registrar con cuenta de Google, osea que si al
> celular le pasa algo, todo lo anotado se pierde** (tengan en cuenta que esto está
> disponible incluso en la versión free de Treinta)... que tan difícil es poner , y .
> para que se lea bien las cifras." — Deudores, Play/mx/2★
> *(The problem is you can't register with a Google account, so if something happens
> to the phone, everything written down is lost — note this is available even in
> Treinta's free version... how hard is it to add , and . so the figures read properly.)*

> "buena app, simple fácil de usar, **faltaría la opción de hacer un backup** de los
> registros cada tanto." — Deudores y Cobranza, Play/mx/4★

> "Fatal pagándo la suscripción **no me hizo la copia de seguridad** que supuestamente
> es automático. por lo que **perdi el historial de mis clientes**."
> — CobradorApp, Play/mx/1★

**3. Receipt photos, because payment moved to bank transfer.**

> "lo que le falta es poder agregar o anexar una **imagen al nuevo cobro
> (comprobante) ya que casi todo ahora es por transferencia** y así se tiene una
> evidencia a la hora de consultarlo o de los reclamos." — CobradorApp, Play/mx/4★

**4. Send the balance by WhatsApp.**

> "Me gustaría una opción en la cuál al momento de agregar una transacción **se envie
> en automático al whatsapp un ticket con balance**" — CobradorApp, Play/mx/4★

**5. Collection reminders and instalments.**

> "Me gustaría que añadieran **recordatorios para realizar los recaudos**."
> — Deudores, Play/us/3★

> "deberían de poner la opción de recibir un aviso para pagar una deuda en
> **distintos pagos (semanales, quincenales o mensuales)**" — My Debts, Play/mx/4★

**6. Subscriptions and hidden trials resented here too.**

> "no pongan toda su información, por qué **solo es gratuito por 7 días**... después
> tu le pagas mensual.... no es gratuito ni en la versión básica...."
> — Gestión de Cobros y Préstamos, Play/mx/2★

### Aggregate: the two markets complain about different things

Deduplicated 1–3★ reviews, as % of that app-set's low reviews:

| Theme | Debt trackers (1:1) n=453 | Bill splitters (group) n=2,962 |
|---|---|---|
| Backup / data loss | **9.1%** | 1.2% |
| Sync / multi-device | **8.2%** | 6.2% |
| Ads | 7.5% | 9.8% |
| Price (generic) | 7.5% | **17.8%** |
| Subscription specifically | 6.8% | **11.2%** |
| Currency / number format | **6.2%** | 2.5% |
| Reminders | 3.8% | 1.5% |

**[FOUND]** The two markets have genuinely different pain. Group splitters are angry
about **money**. One-to-one debt trackers are angry about **losing their ledger**.
Anyone reasoning about Pagos from Splitwise's reviews will optimise the wrong thing.

Also, in *positive* debt-tracker reviews: **export / PDF / WhatsApp sharing appears
289 times** (19% of 1,519 positive reviews) — the most-praised capability in the
category by a wide margin. Your PDF share feature is aimed at the right target.

---

## Q1. What job are people actually hiring these apps for?

Four distinct jobs, with different emotional stakes, session frequencies, and
willingness to pay.

### Job 1 — "Settle this trip fairly without me looking cheap." (Group splitting)

**Who:** 20s–40s; travel, roommates, dinners. **Size:** largest by installs
(Splitwise + Tricount + Splid + Settle Up ≈ 520,000 Play ratings combined).
**Emotional core:** fairness arithmetic under social observation. The app is a
neutral third party so nobody has to be the person doing the accounting.
**[FOUND]** *"This app lets one person be in charge and enter all the info so
everybody else doesn't need to worry about it"*; *"Makes record keeping easy and
transparent."*
**Underserved?** No. Saturated, and Splid is currently winning it on trust.

### Job 2 — "I lent someone real money and I'm afraid of losing it and the relationship."

**Who:** all ages; $20 to thousands; family and close friends.
**Size:** **[FOUND]** LendingTree survey work reports **31% of Americans say friends
or family currently owe them money**; Bankrate-class surveys put lending prevalence
above 60% over five years. The *behaviour* is enormous. The *app market* is tiny (Who
Owes Me: 794 ratings). That gap is the opportunity and the risk.
**Emotional core:** not arithmetic — **avoidance**. See Q3.
**Underserved?** **Yes, badly.** Fewest good tools, and the clearest expression of
being stuck: *"can't find any other app like it."*

### Job 3 — "My customers buy on credit and I need my book." (Micro-merchant receivables)

**Who:** corner stores, market vendors, tradespeople, informal lenders —
overwhelmingly Spanish-speaking in this data.
**Size:** **[FOUND]** the largest *one-to-one* debt segment by review volume in my
corpus. Libreta de Fiado alone has 16,287 Play ratings, more than 20× Who Owes Me.
Treinta claims 5M+ users against a stated 50M-microbusiness market.
**Emotional core:** this is my income; losing the ledger is losing money — hence
backup being the #1 complaint.
**Underserved?** **No** — well served, and about to be better served by a
$60M-funded incumbent. Avoid.

### Job 4 — "Is this on the record?" (Formal-ish loans)

Small, served by contract templates and notaries rather than apps. Not visible in my
corpus beyond the instalment requests. Ignore.

**[INFERRED] Verdict.** Job 2 is the underserved one, and it is what your CLAUDE.md
already describes. But Job 2 is *also* the hardest to build a business on, because
(Q2) it has the weakest natural retention of the four. Job 3 is where the money and
engagement are, and your rules — no interest, no cloud, 12-person cap — deliberately
exclude it. **That exclusion is a real strategic cost and you should make it
knowingly.** A merchant with 40 credit customers is precisely the user who would pay
$4.99 without blinking, and your free tier caps at 12 people with no interest and no
backup.

---

## Q2. Why do people abandon these apps?

I could not obtain retention telemetry for any of these apps, so this section is
inference built on evidence and is labelled as such. Industry benchmarks put
finance-app D30 retention around 11–12% in recent compilations, with wide variance
depending on whether the app is habitual infrastructure or a single-purpose tool.

Five distinct mechanisms appear in the data — and they are not the same mechanism.

### Mechanism 1 — Task completion: the debt settles and the app is done. **[INFERRED, moderate confidence]**

The app's success condition is its own obsolescence. Splid reviews show the shape:
*"I used the app for a trip my sister and I went to. I am trying to add another
trip..."* — a user returning **after a gap**, per-event, not per-day.
**[FOUND]** Splid monetises exactly this by making the *second* group the paid
unlock — charging at the moment of proven repeat use.

This is the mechanism most people assume is the whole story. It is not.

### Mechanism 2 — Trust rupture from a monetisation change. **[FOUND — strongest evidence in the report]**

The clearest, best-evidenced abandonment cause in my data, and entirely
self-inflicted by the developer. Splitwise's 38%/36% price-and-limit concentration;
Who Owes Me's *"Sudden paywall... DO NOT UPDATE"*; Tricount's per-person subscription
switch. Users describe betrayal and uninstall **while actively using the product** —
the opposite of drifting away.

### Mechanism 3 — The ledger is lost, so the relationship ends. **[FOUND]**

9.1% of low-star debt-tracker reviews. *"years worth of data gone"*; *"perdi el
historial de mis clientes"*; *"si al celular le pasa algo, todo lo anotado se
pierde."* A tracker that loses history has destroyed the only asset it held. There is
no recovery — the user does not re-enter two years of data.

### Mechanism 4 — Logging friction exceeds the value of the record. **[INFERRED]**

Evidenced indirectly: ads-at-entry complaints (*"a cada asiento hay un anuncio"*,
*"make you wait 10 seconds to add each expense"*) show users measure the app by
**cost-per-entry** and abandon when it rises. **[FOUND]** They explicitly prefer ads
elsewhere over friction at entry: *"At least give us ads instead of blocking features."*

### Mechanism 5 — Reversion to the substitute, which was never another app. **[FOUND]**

> "Now that this cost $5 I'm going back to **pen and paper**"
> "had to go back to just using **Google Sheets**"
> "I'll **trial the uninstall button**"
> "something you can just do on **ChatGPT** way easier"

**Your real competitor is the Notes app, a paper notebook, and memory** — not
Splitwise. I tried to quantify this and my regex was too loose to trust (1,467 hits
contaminated by "export to Excel" requests), so I am giving you the quotes and **no
number**. **[THIN]**

**[INFERRED] Synthesis.** For Job 2, Mechanisms 1 and 5 dominate and are largely
*structural* — you cannot feature your way out of a product whose job ends. What you
*can* control is Mechanisms 2, 3 and 4, which is exactly where every competitor in
this corpus is failing. **The winning move is not to fight churn; it is to still be
trustworthy and still have the data when the user comes back six months later for the
next loan.**

---

## Q3. The psychology of debt between people

### What the research actually says

**Wherry, F.F., Seefeldt, K.S., & Alvarez, A.S. (2019), "To Lend or Not to Lend to
Friends and Kin: Awkwardness, Obfuscation, and Negative Reciprocity," *Social Forces*
98(2):753–793** — qualitative study of 57 low- and moderate-income individuals. Three
mechanisms:

1. **Awkwardness as constraint.** *"It feels much more awkward to deny a sincere
   request from an honorable requestor than it does to deny one from an insincere
   one."* Refusal is socially expensive, so people lend when they would rather not.
2. **Obfuscation.** Rather than refuse, people **lie about having money**, delay
   delivery, or disguise gifts as loans to protect the borrower's dignity. One
   respondent: *"I have never said no but I've lied...I told them I didn't have it and
   I had it."*
3. **Negative reciprocity.** Past refusals are remembered and repaid with future
   refusals.

**Survey evidence (weaker — industry surveys, not peer-reviewed).** LendingTree
reports ~31% currently owed money by friends/family, and that lending produces guilt,
hurt feelings and regret; roughly **half of informal loans have no agreed repayment
date**, and **over half of lenders had to ask more than once**. Treat exact
percentages as soft; direction is consistent across several independent surveys.

### What this implies for the product — and it is not what most apps built

**Implication 1: The hard part is asking, not remembering.** [INFERRED, tightly
grounded in Wherry et al.] Every app in this corpus is built as a *memory* tool. The
research says memory is not the binding constraint — **social cost is.** The lender
usually knows exactly who owes what. What they cannot do is bring it up.

**Implication 2: A record's real function is to make asking less awkward by making it
not-personal.** [INFERRED] "The app says $340 since March" is a different speech act
from "you owe me $340." Almost nobody has built for this. The one competitor request
pointing at it is the CobradorApp user asking for *"se envie en automático al whatsapp
un ticket con balance"* — a way to communicate the number **without having to author
the sentence.**

**Implication 3: Formalisation cuts both ways — do not force it.** Wherry et al.'s
obfuscation finding means people *deliberately* keep some transfers ambiguous; a
"loan" that is really a gift preserves the borrower's dignity. An app that demands due
dates and sends the borrower dunning notifications converts a relationship
transaction into a creditor–debtor transaction — exactly what the lender was avoiding.
**[INFERRED]** This strongly supports your existing decisions: due dates **off by
default**, nothing the other person approves, nothing social. Those are not merely
"simplicity" choices — they are psychologically correct, and I would promote them from
implementation details to stated product principles.

**Implication 4: Zero is the emotionally loaded moment.** Your CLAUDE.md already says
"zero balance should feel good." The research supports it: ~75% of people who lent or
borrowed say they are no longer as close, and about 1 in 6 say money ruined a
relationship. Reaching zero is relief from that. **[INFERRED]** It is also the correct
moment to ask for a rating — which you already plan — and the only moment in this app
where a delighter is worth the code.

---

## Q4. Interaction design: where competitors fail, specifically

### Fitts's Law (time-to-target ∝ distance / size)

The dominant repeated action is **enter an amount**. Splid and the *cobros* apps put a
large numeric keypad immediately on the entry screen. **[FOUND]** Splitwise currently
inserts an **ad and a wait timer** between intent and target — an infinite-cost
target:

> "After tapping 'Add Expense,' I got an ad, then got dumped on 'Add Contacts' with no
> way back or to exit. Couldn't do what I opened the app for." — App Store/gb/2★

The most severe Fitts violation in the corpus, and it is deliberate. **Your spec's
"two taps to log a payment" is the correct response. Hold it.**

### Hick's Law (decision time ∝ log of number of options)

**[FOUND]** Debt-tracker complaints include *"Too complicated. Why can't i just add
name? Instead of contact?"* — a choice imposed where none was needed. Splitwise's low
reviews mention complexity 121 times; Splid's positive reviews mention simplicity
**1,532 times**. The category rewards fewer options with brutal consistency.

**Where you are at risk:** currency picker per person, note field, due-date toggle,
contacts-vs-manual. That is four decisions attached to "add a person." Each is
justified alone; together they are a Hick's Law problem.

### Recognition over recall

**[FOUND]** Two independent Serrano Canales reviewers ask for **alphabetical sorting**
because they cannot find people. Your spec sorts by amount. For five people that is
fine; at your 12-person cap it may not be. **[INFERRED]** Amount-sort is
recognition-friendly for *"who owes me most"* and recall-hostile for *"where is
María."* Worth a search field or A–Z toggle before you hit the cap, not after.

### Progressive disclosure

Your due-date-off-by-default is textbook correct. **[FOUND]** The failure case in the
corpus is the opposite pattern — apps that disclose the paywall *after* data entry:

> "Only 2 items are free. **I uninstalled it right away as it wasted my time.** That's
> why I gave it 1 star. **They should have mentioned about it in their description
> section**" — Debt Control, Play/us/1★

**A limit discovered after work is done reads as a scam.** If you ship a 12-person
cap, it must be visible before person #1, and in the App Store description.

### Older users (your stated target: 50s–60s)

Published guidance and research:

- **44×44 pt minimum** touch target — Apple HIG / WCAG 2.2 Target Size (Enhanced, AAA).
- Research on adults aged 55–89 finds ~**32px effective for tapping but ~64px for
  steering/drag** tasks — i.e. **anything requiring a drag needs roughly double the
  target size**.
- **≥8 dp spacing** between adjacent interactive elements (Android accessibility
  guidance), to reduce mis-taps.
- **16pt+ body text**, respect system text resizing, high contrast.

**Where competitors fail, and where you might:**

1. **Swipe-to-delete is the big one.** It is a *steering* gesture needing ~64px, with
   no visual affordance — it fails both the target-size research and
   recognition-over-recall. Your "delete any entry" should not be swipe-only.
   **[INFERRED]**
2. **Icon-only controls.** Your CLAUDE.md already says "less reliance on icons." The
   Serrano Canales complaint *"No color, not intuitive to see is i owe them, or they
   owe me"* is exactly this — direction encoded without a label.
3. **Contrast / dark-only.** Your app is dark-mode-only
   (`userInterfaceStyle: "dark"`). Light-on-dark is generally *harder* for ageing eyes
   (increased intraocular light scatter, reduced contrast sensitivity), and common
   guidance for older users is dark-on-light. **[INFERRED — from the accessibility
   literature; I found no review evidence either way.]** Worth reconsidering, or at
   minimum supporting both and following the system setting.
4. **Number formatting.** **[FOUND]** *"que tan difícil es poner , y . para que se lea
   bien las cifras."* Thousands separators — and note Spanish convention differs
   (`1.234,56`). This is legibility for older eyes, not a nicety.

---

## Q5. Latino / Spanish-speaking users — is Spanish-first a real wedge?

**Short answer: yes as a market, but not for the reason you think, and your current
spec points at the wrong half of it.**

### What's real **[FOUND]**

- The Spanish one-to-one debt market on Android is **far larger** than the English
  one: Libreta de Fiado 16,287 ratings; CobradorApp 2,503; Deudores 2,174; Deudores y
  Cobranza 1,857 — versus Who Owes Me (Kolev) 450.
- 5,737 of my 12,217 reviews came from Spanish-language storefronts — 47%.
- Those users are **less satisfied on specific axes** (backup, ads at entry, number
  formatting) and are **articulate about it**.
- Informal lending is culturally structural, not incidental: **tandas** (also
  *cundina*, *susu*, *junta*, *sand*, *cuchubale*, *polla*) are rotating savings and
  credit associations documented in peer-reviewed work — Kim et al., *"The Tanda,"*
  *Journal of Family and Economic Issues* (2023). Tandas function as borrowing and
  saving where formal banking is inaccessible, and have been used to move remittances.
- **FDIC 2023 National Survey:** Hispanic households are **9.5% unbanked** vs 1.9% for
  White households, and **more than 1 in 5 underbanked**. Informal credit fills that gap.

### Where I have to be honest against your thesis

1. **The Spanish demand is mostly Job 3, not Job 2.** The vocabulary is *cobros*,
   *cobranza*, *deudores*, *fiado* — **receivables**, not friendship IOUs. Your app is
   built for Job 2 and priced and capped for Job 2. Spanish-first does not
   automatically capture Spanish demand, because that demand is for a different
   product. **[FOUND — this is the vocabulary of the apps that actually have users.]**
2. **The Spanish market is Android-heavy.** All six substantial Spanish debt apps I
   found are Google Play apps; Libreta de Fiado has an explicit complaint about *not*
   being on iOS. Your v1 is iOS-only with Android deferred. **[INFERRED]** An iOS-only
   Spanish-first app is aiming at the smaller half of its own market.
3. **Spanish-first is table stakes there, not a differentiator.** Every app above is
   already Spanish-native, built by Spanish-speaking developers, in the right idiom.
   You would not be *the* Spanish option; you would be a new entrant against Spanish
   incumbents and a $60M-funded Treinta.
4. **The wedge is not language — it is trust.** **[INFERRED]** What the Spanish corpus
   is asking for is no ads at the point of entry, backup that works, and no surprise
   subscription. Those are the same things the English corpus wants. Language gets you
   considered; trust gets you kept.

### Where Spanish-first *is* genuinely a wedge **[INFERRED]**

For **US-based Spanish-speaking iPhone users doing personal (not merchant) lending** —
the population living between the English apps (which do not speak their language and
are US-subscription-priced) and the LatAm apps (Android-first, ad-heavy,
merchant-framed). That is a real, specific, underserved slice.

It is also **much smaller** than "Spanish speakers," and **I have no data sizing it.**
That is a genuine gap in this report, and I would want it tested before betting the
roadmap on it.

---

## Q6. What would make someone switch, given the cost of re-entering data?

**Switching cost is real and it is the category's main defence.** The Who Owes Me user
who wrote *"Only reason I still have this installed is because I can't find any other
app like it"* is describing lock-in by inertia, not quality.

From the corpus, **[FOUND]** switching happens at four moments:

**1. A monetisation change breaks the deal.** The big one — and the only moment users
switch *while data is still in the old app*. Splitwise's limits produced named
migrations to Spliit, Splitser, Tricount, Sheets and paper. **[INFERRED]** You cannot
cause this; you can only be present when it happens to someone else. Splitwise, Who
Owes Me and Tricount have all done it within roughly two years, so it will recur.

**2. Data was already lost.** Switching cost is *zero* for a user whose ledger just
vanished — 9.1% of low-star debt-tracker reviews describe exactly that. **[INFERRED]**
The highest-intent switcher in the market, and specifically shopping for durability.

**3. Forced platform or device change.**

> "I have moved to ios recently and I am very disappointed to learn that Your App is
> not available on ios... I am compelled now to move to some other App."
> — Libreta de Fiado, Play/us/1★

**4. The next new debt.** **[INFERRED]** Nobody migrates history for a settled debt.
But when a *new* loan happens the user chooses fresh, and old data is irrelevant. For
Job 2 this is the realistic switching moment — meaning **you don't need to win
migration; you need to be the app they find at the moment of the next loan.**

**What actually lowers the barrier, ranked by evidence:**

- **[FOUND, strong]** *"Si costara 20 eurazos, pago único de por vida la compraría,
  pero las subscripciones para apps casual son una animalada"* — a one-time price is
  itself a switching incentive, because it promises Mechanism 2 will never happen to
  them again. **82 reviews in my corpus express this preference unprompted; 41
  explicitly contrast it with subscriptions.**
- **[FOUND]** Your **import from the old web version's JSON** is right for your
  existing users. For competitors' users there is no import path — none of these apps
  export usable data (export complaints appear 30× in Tricount's low reviews alone).
  **[INFERRED]** A "type in current balances only, ignore history" fast-start is the
  realistic migration, because the *balance* is what matters and the history usually
  is not worth re-entering.
- **[FOUND]** No account means nothing to set up, so trial cost is near zero. Splid's
  reviewers cite this repeatedly as why they tried it.

---

## What I'd build, and in what order

Reasoning tied to the findings above. I have flagged where this **contradicts your
current spec**, because a research document that only confirms the plan is not worth
writing.

### Tier 0 — Non-negotiable, because these are the actual failure modes

**1. Make the ledger unloseable.**
*Why: Mechanism 3; 9.1% of low-star debt-tracker reviews; "years worth of data gone";
the highest-upvoted Spanish negative review in the corpus cites data loss on update.*
Concretely: automatic local snapshots before every migration; a one-tap "export
everything to a file" the user can drop in iCloud Drive/Files; never a schema change
without a tested migration.

**⚠️ Tension with your rules.** CLAUDE.md forbids cloud and accounts. I am **not**
proposing accounts. But "no backup at all" is the loudest complaint in the Spanish
corpus, and iOS gives you a middle path your competitors lack: **iCloud Backup already
covers app data**, and a user-initiated file export needs no server of yours. I would
say so explicitly in the app ("your data is included in your iPhone backup"), because
the *fear* is as damaging as the risk.

**2. Zero friction at the moment of entry, permanently.**
*Why: Mechanism 4; Fitts; "a cada asiento hay un anuncio... desintalada"; "at least
give us ads instead of blocking features."* Your two-taps rule is correct. Add a hard
constraint: **no ad, no interstitial, no upsell ever appears between opening the app
and saving an entry.** Note this directly constrains your planned app-open ad — it
must never land in front of a logging session.

**3. State the 12-person limit before the user adds person #1.**
*Why: progressive-disclosure failure; "Only 2 items are free. I uninstalled it right
away as it wasted my time... They should have mentioned about it in their
description."* A cap discovered after work reads as a scam. Put it in the App Store
description too.

### Tier 1 — The differentiator nobody has built

**4. "Send the balance" — one tap, produces a message, does not send itself.**
*Why: this is the Q3 finding. Asking is the hard part, not remembering. Evidence: the
CobradorApp WhatsApp-ticket request; and export/share being the most-praised
capability in the whole debt-tracker corpus (289 positive mentions, 19%).*

Concretely: from a person's screen, one tap produces a short, neutral, pre-written
Spanish/English summary — *"Hola María — resumen al 29/08: prestado $340, pagado $100,
saldo $240"* — dropped into the iOS share sheet. **The user edits and sends it
themselves.** No notification to the other person, no approval, nothing social. You
are not automating the ask; you are **removing the blank page**, which is precisely
what the awkwardness/obfuscation research identifies as the barrier.

This is your wedge. Cheap to build, absent from every competitor in this corpus, and
the only feature here that addresses the *actual* job.

**5. Ship the PDF share you already planned.** Same evidence; the long-form version of
#4 and the corpus's most-praised feature.

### Tier 2 — Correctness for the actual user

**6. Reconsider dark-only.** *Why: accessibility literature on ageing vision favours
dark-on-light; your target is 50s–60s.* At minimum support both and follow the system
setting. **[INFERRED — no review evidence; flagging that honestly.]**

**7. Locale-correct number formatting.** *Why: "que tan difícil es poner , y ."*
Spanish convention is `1.234,56`. You already store integer cents, which is right;
this is display only.

**8. Make typing the primary path and Contacts the option — not the reverse.**
*Why [THIN — 2 reviews]: "Why can't i just add name? Instead of contact?" and "Parece
que obligatoriamente hay que darle la lista de contactos."* This contradicts your v1
spec. The permission prompt is a wall at first run, and the fallback is cheaper than
the primary path. **Low confidence — worth asking five target users, not a rewrite on
my say-so.**

**9. A find-a-person affordance before you hit 12.** *Why: two independent requests for
alphabetical sort.* Search field or A–Z toggle; keep amount-sort as the default.

**10. Delete without requiring a swipe.** *Why: steering targets need ~64px for older
users, and swipe has no affordance.* Provide a visible delete inside the entry.

### Tier 3 — Decide deliberately, don't drift into it

**11. Instalments / *abonos*.** Requested repeatedly in both languages ("payment
plan... $100 a month for 12 months"; "un abono y que muestre el valor inicial junto con
la diferencia restante"; "distintos pagos semanales, quincenales o mensuales"). **But**
your rules ban recurring entries and interest, and this is the doorway to Job 3.
**[INFERRED]** A *display-only* remaining-vs-original view satisfies most of the
request without scheduling or interest. I would go that far and no further.

**12. Receipt photo per entry.** Requested across the Spanish corpus because payment
moved to bank transfer and people want *comprobantes*. **[INFERRED]** Genuinely useful
for Job 2 too (proof the transfer happened). Not in your v1 scope — flagging it as the
strongest *unlisted* feature request I found.

### What I would NOT build, on this evidence

- **Anything targeting merchants** (interest, clients, multi-business, web console).
  That is Job 3, it is served, and Treinta has $60M.
- **Anything the other person must install or approve.** Splid's top praise is
  literally that they don't have to, and the lending research explains why.
- **A subscription.** 82 unprompted requests for one-time pricing; every
  subscription-adopting app in this corpus took reputational damage for it. Your $4.99
  one-time is, on this evidence, the best-supported decision in your entire spec.

### The one strategic risk I'd flag

Your product aims at **Job 2, iOS, US, Spanish-first**. The evidence says Job 2 is
genuinely underserved — and also that it has the weakest natural retention of the four
jobs, and that Spanish-language demand is mostly Job 3 on Android.

Those are not reasons to stop. They are reasons to **expect low engagement and be fine
with it.** A one-time-purchase, no-server app with near-zero marginal cost per user is
arguably the *only* model that works for a job people need three times a year.
Subscription apps must manufacture engagement — which is exactly why Splitwise ended up
putting a timer in front of the Add button. **Your model does not require you to do
that. That is the real advantage, and it is worth protecting deliberately.**

---

## Sources

**Review corpora** (harvested 2026-08-29): Apple App Store customer-reviews RSS
(29 apps × 14 storefronts, 9,399 reviews); Google Play via `google-play-scraper`
(18 apps × 3 locales, 5,871 reviews); 12,217 after deduplication. **The full
deduplicated corpus is checked in at `research/data/reviews-deduped.json` and Play
store metadata at `research/data/play-app-metadata.json`**, so every quote and
percentage in this document can be re-derived.

**Academic / survey**

- Wherry, F.F., Seefeldt, K.S., & Alvarez, A.S. (2019). "To Lend or Not to Lend to Friends and Kin: Awkwardness, Obfuscation, and Negative Reciprocity." *Social Forces* 98(2), 753–793. https://academic.oup.com/sf/article/98/2/753/5308436
- Kim et al. (2023). "The Tanda: An Informal Financial Practice at the Intersection of Culture and Financial Management for Mexican American Families." *Journal of Family and Economic Issues*. https://pmc.ncbi.nlm.nih.gov/articles/PMC10242226/
- FDIC (2024). *2023 National Survey of Unbanked and Underbanked Households*. https://www.fdic.gov/household-survey/2023-fdic-national-survey-unbanked-and-underbanked-households-report
- LendingTree. "31% Say Friends Or Family Owe Them Money." https://www.lendingtree.com/personal/friend-or-family-owes-money-survey/
- LendingTree. "Lending Between Family or Friends Results in Guilt, Hurt Feelings and Regret." https://www.lendingtree.com/personal/study-lending-between-family-friends/

**Accessibility**

- "Target and spacing sizes for smartphone user interfaces for older adults" (participants aged 55–89). https://dl.acm.org/doi/abs/10.5555/2821679.2831275
- "Accessibility Recommendations for Designing Better Mobile Application User Interfaces for Seniors." https://arxiv.org/html/2504.12690v1
- WCAG 2.2 Target Size (Enhanced), Level AAA — 44×44 CSS px.

**Market / competitor context**

- TechCrunch (2021), Treinta funding. https://techcrunch.com/2021/02/11/treinta-announces-500k-in-funding-for-its-microbusiness-financial-app/
- Y Combinator company profile, Treinta. https://www.ycombinator.com/companies/treinta

**Weak sources, flagged as such** — competitor-authored comparison marketing, used
only for the Splitwise-limits narrative, which is independently corroborated by my own
review corpus:

- https://partytab.app/blog/best-splitwise-alternatives
- https://goodshare.app/blog/goodshare-vs-splitwise/
