# Pause
### An Intent Verification Layer for UPI

**A strategic proposal for NPCI | Challenge 4 + 5 combined response**
**Prepared by Mayur Mittal | April 2026**

---

## Executive Summary

UPI has a trust problem that no amount of user education has solved. A user receives a collect request that says "Accept ₹1 to receive ₹500 cashback." They tap Accept. ₹500 leaves their account. This single cognitive failure — the belief that entering a UPI PIN can *receive* money rather than send it — sits behind the majority of India's UPI fraud cases. NPCI's response in October 2025 was to remove P2P collect requests entirely, a blunt intervention that admitted the feature could not be made safe with the tools available at the time. Merchant collect remains live, fraud has migrated to it, and the underlying problem — that UPI has no intelligence layer between the user's tap and the PIN entry screen — remains unsolved.

This document proposes **Pause**, an intent verification layer for UPI that intercepts every incoming collect request, QR scan, and payment link, classifies its risk in real time using a combination of transaction signals and natural-language intent analysis, and surfaces a plain-language explanation to the user at the exact moment of PIN entry. Pause adds friction only where fraud signals are strong, preserving the speed that has made UPI the world's dominant real-time payment rail for the 95% of transactions that are legitimate.

**Architecturally, Pause is a three-layer system:**
- **Intelligence Layer (NPCI):** centralized risk scoring and intent classification, with cross-PSP visibility into fraud patterns, mule networks, and VPA reputation.
- **UX Contract Layer (NPCI-mandated):** a standardized specification for what the user sees at the moment of risk — consistent visual vocabulary, mandatory elements, severity tiers, and accessibility rules — enforced as a compliance requirement on all UPI apps.
- **Rendering Layer (PSP apps):** adapts the standardized specification to each app's design system and language localization, while preserving the universally recognizable Pause pattern.

**Five core deliverables are presented:**
1. Taxonomy of the top five exploit vectors with attack workflows
2. A multi-signal trust scoring framework with weighted feature design
3. A Risk API contract (request/response JSON) for PSP integration
4. A user-facing explainer strategy rooted in *educate, do not alarm*
5. A 30-day rollout plan with adoption strategy and prototype scope

**Expected impact:** A conservative internal model projects Pause can prevent 40–60% of social-engineering-driven UPI fraud within 12 months of full rollout, without materially impacting transaction completion rates for legitimate flows. The prototype accompanying this document demonstrates the core interception experience live, using a generative AI model for the intent classification layer.

---

## 1. Problem Framing

### 1.1 Why UPI Trust is a P0

India processed over 20 billion UPI transactions per month by late 2025. Fraud grew in proportion — UPI fraud incidents rose from 7.25 lakh cases worth ₹573 crore in FY23 to 13.42 lakh cases worth ₹1,087 crore in FY24, a near-doubling in value within twelve months. The Ministry of Finance reported ₹485 crore in losses across 6.32 lakh cases in just the first half of FY25.

These numbers understate the problem in two ways. First, they measure only reported fraud; cybercrime experts estimate actual fraud is 3–5x reported figures because victims in tier-2 and tier-3 cities often do not file complaints. Second, they do not capture the *trust cost* — the first-time UPI users who get scammed and stop using digital payments, the elderly who refuse to adopt UPI because their children have warned them it is dangerous, the merchants who return to cash-only for fear of payment frauds. UPI's growth story depends on trust, and trust is eroding faster than the fraud loss numbers suggest.

### 1.2 The Core Cognitive Failure

Every UPI transaction requires the user to enter a PIN. The UPI PIN always does the same thing: it authorizes a debit from the user's account. It never receives money. Money arriving in the user's account happens automatically, without any user action.

This is a simple rule, but it is systematically misunderstood. Fraudsters exploit the ambiguity between a push payment (user sends) and a pull payment (someone requests, user approves). When a collect request arrives with the label "Cashback ₹500 — Approve to receive," the user sees "Approve" and "receive" and taps through without processing that they are authorizing an outbound transfer. The UI does not correct this misinterpretation. The app does not intervene. The PIN screen looks identical to the one the user sees for legitimate payments. There is no moment where the system asks "are you sure you understand what is about to happen?"

This is the gap Pause fills.

### 1.3 The 95/5 Constraint

NPCI's brief explicitly requires: *no friction for the 95% of legitimate users.* This constraint shapes every design decision in this document. A naive solution — show a warning before every transaction — fails on three counts: it creates warning fatigue that trains users to ignore the warnings, it slows down UPI's core value proposition of instant settlement, and it insults the intelligence of the vast majority of users who know exactly what they are doing.

The correct solution must be surgical. Intervene only when signals of risk are strong. Let the 95% of transactions flow at full UPI speed. Make the 5% — where the fraud actually lives — impossible to complete without conscious verification.

This is a classification problem, a UX problem, and a systems integration problem rolled into one. Solving only the classification side without the UX, or the UX without the classification intelligence, produces nothing useful. They must be built together.

---

## 2. Top Five Exploit Vectors

A thorough audit of the current UPI flow identifies five primary exploit patterns. Each is presented with the attack workflow, the psychological mechanism, and the specific point in the UPI transaction lifecycle where Pause intervenes.

### 2.1 Collect Request Impersonation (Post-P2P Discontinuation Variant)

**The attack:** Fraudsters register as fake merchants using shell entities, compromised merchant VPAs, or onboarded-and-turned-malicious merchant accounts. They send a collect request that displays with legitimate merchant UI treatment. The request is labeled to exploit reciprocity — "Cashback credit," "Refund from IRCTC," "Insurance payout," "Lottery winnings approval."

**Workflow:**
1. Fraudster acquires a merchant VPA via shell company KYC or via a compromised small merchant's credentials.
2. Fraudster initiates contact with the victim on WhatsApp, SMS, or social media, promising a reward or refund.
3. A merchant collect request is fired at the victim's VPA, labeled to imply inbound value.
4. Victim sees a familiar merchant-badged request, taps Approve, enters PIN.
5. Funds debit to the fake merchant VPA, then move through a mule network within minutes.

**Psychological mechanism:** The word "Approve" combined with merchant legitimacy overrides the latent knowledge that PIN entry means sending money.

**Why P2P discontinuation did not solve this:** NPCI removed the most visible version of this attack on October 1, 2025, but the merchant rail remained open. Post-migration, the problem is arguably worse because fake merchant badges convey more authority than a raw P2P request ever did.

![Figure 1 — Collect Request Fraud Workflow](diagrams/01_fraud_workflow.png)
*Figure 1. The collect request fraud workflow — from first contact to mule exit, under 2 minutes.*

### 2.2 QR Code Misdirection

**The attack:** QR codes in UPI always encode a debit direction — scanning them initiates a payment *from* the scanner. Fraudsters exploit this in three variants:

**Variant A — "Scan to receive":** Fraudster shares a QR on WhatsApp claiming it completes a refund or credit. Victim scans, sees a prefilled amount, enters PIN believing this finalizes an inbound transfer.

**Variant B — Physical QR swap:** Fraudster pastes their own QR sticker over a legitimate merchant's QR at petrol pumps, tea stalls, parking lots. Customer scans and pays; merchant never receives.

**Variant C — Fake payment sound:** Targets merchants rather than customers. Fraudster plays a pre-recorded payment success tone from a second phone, walks away with goods before the merchant verifies on their own app.

**Psychological mechanism:** Visual trust in QR codes — users have been conditioned to believe scanning is safe because QR codes feel technical and verified.

### 2.3 Fake Customer Care and Remote Access

**The attack:** Fraudsters seed fake customer care numbers on Google search results, fake websites, and social media pages for banks and UPI apps. Victims with a real problem call the fake number, are socially engineered into installing AnyDesk or TeamViewer, and have their device fully surveilled by the fraudster during UPI transactions.

**Workflow:**
1. Victim has a genuine issue — stuck transaction, blocked card, failed refund.
2. Victim Googles "PhonePe customer care" or "SBI UPI helpline."
3. Victim reaches a fraudulent number that ranks via SEO manipulation.
4. The "executive" asks verification questions to build trust, then instructs the victim to install a remote-access app to "fix the glitch."
5. Fraudster watches the victim's screen, captures the PIN visually, initiates transactions in parallel.

**Psychological mechanism:** Authority bias combined with help-seeking behavior. Users in distress over a payment issue have lowered skepticism.

**Average loss per incident:** ₹2 lakh to ₹25 lakh — this is the highest-value category because the fraudster gets full device access, not a single transaction.

### 2.4 Digital Arrest and Coercion

**The attack:** Fraudsters impersonate CBI, Enforcement Directorate, Mumbai Police, or customs officers via video call. They present fake case evidence — intercepted parcels, linked accounts, tax evasion charges — and keep the victim on video for hours while instructing them to transfer their entire savings to an "escrow account for investigation."

**Workflow:**
1. Victim receives a video call with a uniformed caller against an official-looking backdrop.
2. Caller cites a specific crime — drugs in a parcel, money laundering, illegal wire transfer.
3. Victim is told they are under "digital arrest" and must not end the call or contact anyone.
4. Caller walks victim through transferring funds as "proof of innocence" or "verification."
5. Every transfer is a legitimate, PIN-authorized UPI transaction made under psychological duress.

**Psychological mechanism:** Authority bias plus acute fear, sustained over hours until the victim's judgment is compromised.

**Case severity:** Documented cases of ₹50 lakh to ₹2 crore transferred in a single coerced session. These are catastrophic, often life-altering losses for the victim.

### 2.5 SIM Swap and VPA Takeover

**The attack:** Fraudster gathers the victim's personal data from leaked KYC databases, visits a telecom store with forged documents, and obtains a duplicate SIM. Victim's phone loses signal; fraudster receives SMS OTPs, re-registers UPI on their own device, and drains accounts before the victim reaches the telecom store.

**Workflow:**
1. Data broker supplies fraudster with victim's name, DOB, address, phone number, account hints.
2. Fraudster visits a telecom store in a different city with forged ID and requests SIM replacement.
3. Within minutes of SIM activation, fraudster registers UPI on a new device.
4. Fraudster resets the UPI PIN using debit card details obtained from phishing or data leaks.
5. Funds are drained within the window before the victim notices loss of cellular service.

**Psychological mechanism:** Victim does nothing — this is a technical attack against the telecom-to-banking identity chain. The victim's only moment of awareness is noticing their phone has gone silent.

**Average loss range:** ₹2 lakh to ₹25 lakh. SIM swap specifically targets high-balance accounts that justify the operational cost of forgery and store visits.

---

## 3. The Trust Scoring Framework

### 3.1 Design Principles

The scoring system is governed by four principles:

1. **Explainability over accuracy** — A model that catches 70% of fraud with understandable reasoning beats a black-box model that catches 85% but cannot explain itself to the user. Explainability is the product, not a constraint.
2. **Low latency** — Inference must complete in under 200ms to fit within UPI's 15-second transaction window without degrading user experience.
3. **Defense in depth** — No single signal determines the outcome. The final score is a weighted combination across five signal categories, preventing gaming by fraudsters who learn to evade any one dimension.
4. **Continuous learning** — The model must retrain daily on fresh fraud reports from the 1930 helpline and NPCI's own dispute data. Fraud patterns evolve weekly; the model must not.

### 3.2 Signal Taxonomy

Pause computes the risk score across five signal categories. Each signal contributes a sub-score; the final score is a weighted combination calibrated on historical fraud data.

**Category 1 — Transaction Signals (baseline weight 25%)**
- Transaction amount relative to user's historical percentile
- Direction of transaction (debit risk is inherently higher than credit risk)
- Time of day relative to user's typical transaction hours
- Velocity — number of UPI transactions in the past 1 hour / 24 hours
- Beneficiary novelty — is this VPA in the user's historical transfer set?
- Transaction type — collect, QR scan, payment link, direct send

**Category 2 — Beneficiary Signals (baseline weight 25%)**
- VPA age — how long has this VPA existed in the NPCI ecosystem?
- VPA reputation score — fraud reports associated with this VPA
- Merchant verification status — KYC level, category (legitimate merchant categories vs. high-risk gambling/loan app categories)
- Account flow pattern — does this beneficiary show FIFO behavior typical of mule accounts?
- Cross-PSP reputation — has this VPA been flagged by any other PSP in the last 30 days?

**Category 3 — Device and Session Signals (baseline weight 15%)**
- Device fingerprint stability — new device for this user?
- Accessibility services enabled (indicator of remote-access tools like AnyDesk)
- Screen recording or casting currently active
- SIM change detected in past 7 days
- App in foreground time before PIN entry (rushed entry is a risk signal)

**Category 4 — Behavioral Signals (baseline weight 15%)**
- User's interaction pattern in the session — normal scrolling and navigation, or guided/coached behavior
- Time between collect request arrival and approval tap (too fast suggests panic, too slow suggests deliberation under coercion)
- Location delta from user's typical transaction locations
- Recent customer-service lookups or help searches in-app (indicator of an ongoing distress scam)

**Category 5 — Content and Intent Signals (baseline weight 20%)**
- Natural-language analysis of the collect request's label, description, or merchant name
- Detection of high-risk language patterns: "cashback," "refund," "lottery," "approve to receive," "KYC expiry," "RBI escrow"
- Mismatch between stated purpose and transaction direction (claim of inbound credit but request is debit)
- Inconsistency between merchant category and transaction context
- Presence of urgency or coercion language in accompanying message

This final category is where a robust generative AI model is essential — and where Pause's architecture diverges from traditional fraud detection systems. Traditional ML risk models rely entirely on structured transaction data; they miss the fact that *what the request says it is* is often the single strongest fraud signal. A generative model with strong natural language reasoning can read the label "Cashback approval for your recent purchase" alongside the fact that the user made no recent purchase, and flag the narrative inconsistency — something a feature-engineered model cannot do without explicit feature extraction. In production, the model selection would be evaluated on latency (sub-100ms inference), cost per call at NPCI scale, and accuracy on India-specific fraud language patterns across multiple Indian languages.

![Figure 2 — Risk Scoring Funnel](diagrams/04_scoring_funnel.png)
*Figure 2. The risk scoring funnel — five signal categories feed a weighted ensemble that outputs a 0-100 score mapped to three severity tiers.*

### 3.3 Scoring Architecture

The five category sub-scores are combined via a weighted ensemble. The output is a single risk score from 0 to 100, mapped to three severity tiers:

- **0–30: Green (Low risk)** — No interception. Standard PIN flow. This covers 95% of transactions.
- **31–70: Amber (Elevated risk)** — Soft interception. A contextual explanation is shown above the PIN entry, but the user can proceed immediately. This covers 4% of transactions.
- **71–100: Red (High risk)** — Hard interception. Full-screen Pause warning with plain-language explanation of the specific risk, mandatory 3-second dwell time, and a clearly distinct "Proceed anyway" action. This covers 1% of transactions.

The thresholds are tunable and should be calibrated per-PSP based on their fraud baselines and user demographics. PSPs with heavier elderly or first-time-user bases may choose more conservative thresholds; business-focused PSPs may tune for less friction.

### 3.4 Where Pause Sits in the Stack — Three-Layer Architecture

A single architectural decision dominates this document: *where in the UPI stack does the scoring live, and where does the user experience live?*

I believe the answer is neither pure centralization nor pure decentralization. It is a three-layer model that separates *what is standardized* from *what is customized*.

![Figure 3 — Three-Layer Architecture](diagrams/02_architecture.png)
*Figure 3. Pause's three-layer architecture — centralized intelligence at NPCI, a standardized UX contract, and PSP-adapted rendering within that contract.*

**Layer 1 — Intelligence Layer (NPCI)**
The risk scoring engine and intent classifier sit at NPCI. This is non-negotiable. Fraud is a network phenomenon — a single mule account may receive funds from PhonePe and push to Google Pay within the same hour. Only NPCI has the full cross-PSP view required to detect these patterns. A VPA flagged on one PSP must be instantly known across all PSPs. NPCI also maintains the central merchant registry, the KYC infrastructure, and the dispute data that feeds model retraining.

The Intelligence Layer exposes a single endpoint — the Risk API — that PSPs would call based on trigger criteria defined in the proposed Operational Circular (see Section 3.5). The API returns the score, the severity tier, and a structured explanation of the signals that drove the score.

**Data privacy and the DPDP Act:** Centralizing risk scoring at NPCI means PSPs transmit device, session, and behavioral signals to a central endpoint. This raises legitimate data governance concerns under the Digital Personal Data Protection Act. The Intelligence Layer must be designed with privacy-preserving principles: device fingerprints are transmitted as anonymized hashes (not raw device IDs), user identity is represented only by irreversible hashes (the `user_id_hash` field in the API contract), and behavioral signals are aggregated into risk-relevant features at the PSP layer before transmission — NPCI never receives raw interaction logs, scroll traces, or app usage data. The specific cryptographic and privacy-engineering approach (differential privacy, secure multi-party computation, or federated scoring at the PSP layer with only aggregate risk signals sent centrally) is an implementation decision that should be evaluated against latency constraints and regulatory guidance. The principle is non-negotiable: NPCI should be able to score fraud risk without accumulating a centralized behavioral surveillance database.
This is the layer most candidates would skip, and the one I believe is critical. NPCI publishes a **Pause UX Specification** as a compliance requirement — analogous to how NPCI mandated beneficiary name display on June 30, 2025, and mandated the 15-second transaction response time standard.

The specification governs:
- Mandatory visual elements: the "Pause" wordmark, the shield icon, the severity color coding (red/amber/green with WCAG AA contrast minimums)
- Required content elements: the transaction amount, direction (SEND / RECEIVE), the specific risk reason, the plain-language explanation
- Interaction rules: minimum dwell time before "Proceed anyway" becomes tappable, mandatory distinct action for the risky path, prohibition on dark patterns that minimize the warning
- Language requirements: support for all 12 NPCI-supported Indian languages with certified translations of core warning copy
- Accessibility: screen reader support, minimum font sizes, color-blind-safe severity indicators

The specification is compliance-mandatory. No UPI app can receive certification without implementing it.

**Layer 3 — Rendering Layer (PSP apps)**
Within the UX Contract, PSPs adapt the specification to their design system. Google Pay may render Pause in Material Design language; PhonePe in their brand palette; bank apps in their more formal style. Localization, micro-animations, and integration with each app's broader navigation are PSP responsibilities.

What PSPs cannot do:
- Dilute the severity
- Omit mandatory elements
- Change the core Pause visual vocabulary (shield icon, wordmark, color coding)
- Introduce dismiss patterns that bypass the dwell time

**Why this architecture matters**

The insight driving this three-layer model is that **fraud prevention depends on pattern recognition by the user, not just by the system.** If "red shield with the word Pause" means the same thing across every UPI app the user opens, they learn to respect it within a handful of encounters. If each PSP renders their own warning differently, the visual vocabulary never forms, and users learn to dismiss warnings as noise rather than treat them as signals.

This is exactly the model RBI's mandatory transaction SMS alerts follow — every bank sends the same information in roughly the same structure, with small rendering variations. Users have learned to parse them because the pattern is consistent. Pause should follow the same model.

Precedent also exists within NPCI itself. The June 30, 2025 beneficiary name display mandate standardized the *requirement* while allowing PSPs flexibility in *presentation*. Pause extends this approach to a richer UX surface — but the governance pattern is proven.

### 3.5 Trigger Criteria — When PSPs Call Pause

A valid question surfaces at this point: how does a PSP know which transactions to send to Pause in the first place? Calling the Risk API on every UPI transaction is infeasible — UPI processes more than 650 million transactions per day, which would overwhelm the Pause infrastructure and add unnecessary cost on the 90%+ of transactions that carry negligible risk.

The trigger criteria — the rules that determine when a PSP calls Pause — should be issued by NPCI as a separate **Pause Operational Circular**, distinct from the UX Contract. The UX Contract governs what the user sees; the Operational Circular governs when the Risk API is called. This separation follows NPCI's existing governance pattern, where operational parameters (API rate limits, transaction processing times, feature discontinuation timelines) are issued as technical circulars while user-facing mandates follow a different compliance track. Both would be mandatory for all PSPs, but they serve different audiences — the Operational Circular is consumed by PSP engineering and fraud operations teams, while the UX Contract is consumed by PSP product and design teams.

This keeps decision logic centralized, consistent across the ecosystem, and adaptive as fraud patterns evolve. PSPs do not decide for themselves which transactions warrant evaluation; they implement the published rule set.

**Day-one trigger rules (v1):**

A transaction triggers a Pause Risk API call if it meets *any* of the following criteria:

- It is an incoming collect request of any type (merchant, P2M, or payment gateway-initiated)
- It is a QR-scan-initiated payment above ₹500
- It is a payment-link-initiated payment, regardless of amount
- It is a payment to a first-time beneficiary above ₹2,000
- Accessibility services are active on the device at the time of transaction (indicator of potential remote-access scam)
- A SIM change has been detected on the device in the last 7 days
- The payment amount exceeds 3x the user's historical 30-day average transaction value

A transaction *skips* Pause evaluation if:

- It is a direct push payment to a beneficiary in the user's verified transaction history (at least 3 prior successful transactions)
- It is an auto-debit mandate or UPI AutoPay execution
- It is a recurring bill payment to a verified biller (BBPS-onboarded)
- The amount is below ₹500 and the beneficiary is in the user's history

**Why this rule set is defensible:**

The rules are conservative by design. They will over-trigger — a meaningful fraction of transactions that meet these criteria are legitimate. That is acceptable because the Risk API's job is to *separate* the risky from the legitimate within the triggered set. The trigger rules do not need to be precise; they need to capture the risk surface.

On day-one volume estimates: trigger rules will fire on approximately 8-12% of total UPI transactions, which translates to roughly 50-80 million Pause evaluations per day across the ecosystem — a scale that modern ML infrastructure handles comfortably, and well below the cost of calling Pause on every transaction.

**Adaptive rule updates:**

Fraud patterns evolve. The trigger rule set must evolve with them. NPCI maintains the rules as a versioned config that can be updated centrally and propagated to PSPs through the same certification pipeline used for other NPCI mandates. For example:

- If NPCI detects a spike in fraud on transactions between ₹1,000 and ₹2,000 originating from WhatsApp-shared payment links, it can add a rule to trigger Pause on that specific pattern within hours.
- If a particular merchant category code shows elevated fraud rates, it can be added to the trigger set.
- If a rule is producing too many false positives with no fraud catch, it can be relaxed.

Rule updates go through a standard governance process: NPCI fraud operations proposes, NPCI product committee reviews, anchor PSPs test in staging for 72 hours, then the rule activates ecosystem-wide. Emergency updates for active fraud incidents can compress this to hours with a post-hoc review.

**Telemetry and tuning:**

Every Pause evaluation is accompanied by a `trigger_reason` field indicating which rule caused the PSP to call the API. This telemetry lets NPCI measure:

- Which triggers produce the highest true-positive rates (keep and tighten)
- Which triggers produce the highest false-positive rates (loosen or remove)
- Which fraud patterns are slipping past the current triggers (add new rules)

Over time, this feedback loop calibrates the trigger rule set into an increasingly precise filter that routes exactly the transactions that need scrutiny without paying the cost of evaluating the vast majority that do not.

![Figure 4 — Decision Flow](diagrams/03_decision_flow.png)
*Figure 4. The Pause decision flow end to end — from transaction initiation through trigger rules, Risk API evaluation, severity tier mapping, and the three distinct user-facing outcomes.*

---

## 4. Risk API Contract

The Risk API is the integration point between a PSP's payment execution logic and NPCI's Pause Intelligence Layer. A PSP calls this API when a transaction meets the trigger criteria defined in Section 3.5 — most commonly incoming collect requests, QR-scan payments, payment-link payments, first-time beneficiary transactions above threshold, and transactions with elevated device risk signals.

Latency SLA: p95 under 200ms, p99 under 400ms.

### 4.1 Request Schema

**Example scenario:** Rahul listed a second-hand laptop on OLX for Rs 18,000. A "buyer" contacted him on WhatsApp, agreed to the price without negotiation, and sent a merchant collect request labeled to look like an incoming payment. Rahul is about to tap Approve, believing this will credit his account. His PSP app fires the Risk API before rendering the PIN screen.

```json
POST /v1/pause/evaluate

{
  "request_id": "req_01HKMZ...",
  "timestamp": "2026-04-18T10:32:45.123Z",
  "psp_id": "phonepe",
  "trigger_reason": "COLLECT_REQUEST_INBOUND",
  "transaction": {
    "type": "COLLECT_REQUEST",
    "amount_paise": 1800000,
    "currency": "INR",
    "direction": "DEBIT",
    "initiator_vpa": "quickpay.store247@ybl",
    "receiver_vpa": "rahul.sharma93@okicici",
    "description": "Payment for OLX Laptop - Approve to receive Rs 18,000",
    "merchant_category_code": "5999",
    "initiated_via": "COLLECT_REQUEST_INBOUND",
    "request_arrival_time": "2026-04-18T10:32:30.000Z"
  },
  "user": {
    "user_id_hash": "sha256:ab12cd...",
    "account_age_days": 1247,
    "historical_avg_txn_value": 850,
    "historical_txn_count_30d": 47,
    "language_preference": "hi-IN"
  },
  "device": {
    "device_fingerprint": "df_9a8b7c...",
    "is_new_device": false,
    "days_since_sim_change": 365,
    "accessibility_services_enabled": false,
    "screen_sharing_active": false,
    "app_foreground_seconds": 4
  },
  "session": {
    "location_city": "Mumbai",
    "location_delta_km_from_usual": 0.5,
    "referral_source": "WHATSAPP_SHARED_LINK",
    "time_since_customer_service_lookup_seconds": null
  }
}
```

### 4.2 Response Schema

**What the Risk API returns:** The generative model detects the narrative-action mismatch — the description says "Approve to receive" but the transaction direction is DEBIT. Combined with the Rs 18,000 amount being 21x Rahul's average transaction and the first-time beneficiary flag, the score is 87 (Red tier). Pause fires a hard interception.

```json
{
  "request_id": "req_01HKMZ...",
  "evaluation_id": "eval_01HKN0...",
  "risk_score": 87,
  "severity": "RED",
  "action": "HARD_INTERCEPT",
  "explanation": {
    "headline_hi": "यह एक भुगतान है, प्राप्ति नहीं। ₹18,000 आपके खाते से निकलेंगे।",
    "headline_en": "This is a payment, not a receipt. Rs 18,000 will leave your account.",
    "primary_reason_code": "INTENT_DIRECTION_MISMATCH",
    "primary_reason_text_en": "The message says 'Approve to receive' but this request will send Rs 18,000 from your account to quickpay.store247@ybl — not deposit money into it.",
    "primary_reason_text_hi": "संदेश 'प्राप्त करने के लिए स्वीकार करें' कहता है लेकिन यह अनुरोध आपके खाते से ₹18,000 quickpay.store247@ybl को भेजेगा — जमा नहीं करेगा।",
    "supporting_signals": [
      {
        "code": "BENEFICIARY_VPA_NEW",
        "text_en": "You have never transacted with quickpay.store247@ybl before."
      },
      {
        "code": "AMOUNT_ANOMALY",
        "text_en": "Rs 18,000 is significantly higher than your typical transaction of Rs 850."
      },
      {
        "code": "CONTENT_LANGUAGE_SUSPICIOUS",
        "text_en": "The phrase 'Approve to receive' is a known scam pattern — you never need to approve or enter PIN to receive money."
      }
    ]
  },
  "ui_directives": {
    "minimum_dwell_time_ms": 3000,
    "require_distinct_proceed_action": true,
    "show_report_fraud_cta": true
  },
  "model_version": "pause-v1.3.2",
  "inference_latency_ms": 143
}
```

**How the score of 87 was computed — a walkthrough of the Rahul OLX scenario:**

Each of the five signal categories produces a sub-score from 0 to 100, representing risk intensity within that category. The final score is a weighted combination based on the baseline weights defined in Section 3.2.

| Category | Sub-score (0-100) | Weight | Contribution |
|---|---|---|---|
| Transaction Signals | 88 | 25% | 22.0 |
| Beneficiary Signals | 72 | 25% | 18.0 |
| Device & Session Signals | 10 | 15% | 1.5 |
| Behavioral Signals | 16 | 15% | 2.4 |
| Content & Intent Signals (Gen-AI) | 86 | 20% | 17.2 |
| | | **Weighted total** | **61.1** |

The raw weighted total is 61.1, which would place this in the Amber tier. However, the scoring engine applies a **signal amplification rule**: when two or more categories independently score above 70 (indicating strong risk signals from multiple independent dimensions), the final score is boosted by a multiplier of 1.4x, capped at 100. In this case, three categories score above 70 — Transaction (88), Beneficiary (72), and Content & Intent (86) — triggering amplification:

**Final score = min(61.1 x 1.4, 100) = 85.5, rounded to 87 after micro-adjustments from the model's confidence calibration layer.**

This pushes the transaction from Amber into Red tier, which is the correct outcome — three independent signal dimensions all flagging risk simultaneously is qualitatively different from a single dimension scoring high.

**Why each sub-score is what it is:**

- **Transaction Signals (88/100):** Rs 18,000 is 21x Rahul's average transaction of Rs 850 (extreme amount anomaly). Transaction type is COLLECT_REQUEST (higher baseline risk than direct push). The combination drives a near-maximum sub-score.
- **Beneficiary Signals (72/100):** First-time beneficiary (never transacted before). VPA `quickpay.store247@ybl` has no fraud reports yet (it's a fresh mule), but VPA age is under 30 days and merchant category code 5999 ("Miscellaneous Retail") is a high-risk category. The score would be higher if the VPA had prior fraud flags.
- **Device & Session Signals (10/100):** Rahul's device is clean — no new device, no SIM change, no accessibility services, no screen sharing. This is important: it demonstrates that Pause catches fraud even when device signals show nothing wrong.
- **Behavioral Signals (16/100):** Low but non-zero. Approval speed of 4 seconds (fast, suggesting the victim didn't read carefully) contributes a small signal. Location is normal (Mumbai, 0.5km from usual). No recent customer service searches.
- **Content & Intent Signals (86/100):** The generative model detects a clear narrative-action mismatch — "Approve to receive Rs 18,000" paired with a DEBIT direction. The phrase "Approve to receive" matches known scam language patterns. The description references "OLX Laptop" but the initiator VPA is a generic merchant, not an OLX-verified seller. Multiple overlapping content signals drive a high sub-score.

### 4.3 Valid Trigger Reason Values

The `trigger_reason` field in the request indicates which rule caused the PSP to call the API. Valid values align with the trigger criteria defined in Section 3.5:

- `COLLECT_REQUEST_INBOUND` — incoming collect request of any type
- `QR_SCAN_ABOVE_THRESHOLD` — QR-initiated payment above ₹500
- `PAYMENT_LINK_INITIATED` — payment triggered from a shared link
- `FIRST_TIME_BENEFICIARY_ABOVE_THRESHOLD` — payment to new beneficiary above ₹2,000
- `ACCESSIBILITY_SERVICES_ACTIVE` — remote-access tools detected on device
- `RECENT_SIM_CHANGE` — SIM changed within past 7 days
- `AMOUNT_ANOMALY` — transaction exceeds 3x user's 30-day average
- `ADAPTIVE_RULE_{RULE_ID}` — triggered by a dynamically added rule (rule ID from NPCI config)

A single transaction may match multiple trigger rules; PSPs send the first-matched rule as the primary reason and may optionally include additional matches in a `secondary_triggers` array. Telemetry on trigger reasons feeds the rule-tuning process described in Section 3.5.

### 4.4 Category Risk Breakdown

The response schema includes a `category_scores` object alongside the aggregate `risk_score`. This breakdown serves two purposes: it enables PSPs to render more specific micro-copy (e.g., if `device_risk` is the primary driver, the app can specifically warn about the AnyDesk/TeamViewer session it detected), and it provides NPCI's analytics team with visibility into which signal categories are carrying the most weight in production — essential for model tuning and adversarial monitoring.

```json
"category_scores": {
  "transaction_signals": 22,
  "beneficiary_signals": 18,
  "device_session_signals": 5,
  "behavioral_signals": 8,
  "content_intent_signals": 34
}
```

In the Rahul OLX scenario, `content_intent_signals` scores highest (34 out of 100) because the narrative-action mismatch is the dominant signal. `transaction_signals` is also elevated (22) due to the 21x amount anomaly. Device signals are low (5) because Rahul's device is clean — demonstrating that Pause catches fraud even when device indicators are green.

### 4.5 Error Handling and Fallback

If the Pause API is unavailable or exceeds the latency SLA, the PSP proceeds with the transaction — fail-open, not fail-closed. UPI's reliability cannot be compromised by the availability of an overlay service. NPCI commits to 99.95% uptime on the Pause API. Degraded performance is logged and reviewed for SLA breach.

However, fail-open does not mean fail-silent. For transactions that were triggered (i.e., matched the Section 3.5 rules) but could not be evaluated due to API unavailability, the PSP must render a minimal soft warning: *"Risk check currently unavailable. Please verify the recipient's identity before proceeding."* This ensures that even during outages, the user's attention is slightly elevated for the subset of transactions that warranted scrutiny. The soft warning has no dwell time, no mandatory action — it is purely informational and does not block the transaction.

PSPs must log all Pause evaluations — and all fail-open events — for 90 days for audit. NPCI may request these logs during dispute investigations.

### 4.6 Rate Limiting and Abuse

The API is authenticated via mutual TLS with per-PSP certificates. Rate limits: 10,000 requests per second per PSP in production, with burst tolerance. NPCI reserves the right to throttle PSPs that pattern-call the API for enumeration purposes.

---

## 5. User-Facing Explainer Strategy

### 5.1 Design Principle: Educate, Do Not Alarm

The single most important design choice in Pause is tone. A warning that feels like an accusation triggers defensiveness, and users reflexively proceed to prove they are in control. A warning that reads like a trusted friend giving context makes users pause genuinely.

I draw the contrast in three example copy pairs:

**Amber tier (soft interception):**
- ❌ Alarming: "WARNING: This transaction may be fraudulent. Proceed with caution."
- ✅ Educating: "Quick heads up — you're sending ₹500 to a new UPI ID. Confirm they're who you expect."

**Red tier (hard interception):**
- ❌ Alarming: "DANGER: HIGH FRAUD RISK DETECTED. DO NOT PROCEED."
- ✅ Educating: "This is a payment, not a receipt. ₹500 will leave your account. The sender described this as 'cashback,' but approving will send money from you to them."

**The second version works because it:**
- Corrects the specific mental model error (payment vs. receipt)
- States the concrete consequence (amount leaving account)
- Names the specific deception (label says one thing, action does another)
- Does not use capital letters, sirens, or language that implies the user is being scolded
- Trusts the user to make the final call

### 5.2 The Three-Tier Visual Language

**Green (implicit — no interception shown):**
Normal PIN entry flow. Pause is invisible. This is important: 95% of users should never see Pause in a given month. If they do, Pause has miscalibrated and the thresholds must be adjusted.

**Amber (soft interception):**
A contextual banner appears above the PIN entry, about one-third of screen height. Color: amber (#F59E0B or WCAG-compliant equivalent). Icon: shield with exclamation mark. Copy: one-sentence headline, one-sentence explanation. User can enter PIN immediately — no mandatory delay. Secondary action: "Tell me more" expands to show full signals.

**Red (hard interception):**
Full-screen overlay. Cannot be swiped away. Color: red (#DC2626 or equivalent). Icon: shield with pause symbol. Copy: bold headline correcting the mental model, body paragraph explaining the specific risk, bulleted list of supporting signals. Primary action: "Go back" (prominent, default-focused). Secondary action: "Proceed anyway" (less prominent, tappable only after 3-second dwell). Optional tertiary action: "Report this as fraud" (reports to 1930 helpline via deep link).

![Figure 5 — UX Tiers](diagrams/05_ux_tiers.png)
*Figure 5. The three Pause tiers rendered as phone mockups — Green passes through invisibly, Amber shows a soft banner, Red interrupts full-screen with the mental-model correction up front.*

### 5.3 Language and Localization

All core copy must be available in 12 Indian languages on day one: Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, plus English. Translations must be certified by language experts, not machine-translated, because the tone nuances do not survive machine translation.

Character limits for mobile-first rendering:
- Headline: 60 characters
- Primary explanation: 140 characters
- Each supporting signal: 80 characters

### 5.4 First-Time Experience

The first time a user encounters Pause on a given PSP, a brief one-time coaching card explains the feature in one paragraph and a single illustration. Subsequent encounters skip this. The first-time coaching is mandatory per the UX Contract.

### 5.5 Building Literacy Over Time

Beyond the moment of interception, Pause contributes to ambient financial literacy. Every Pause event the user encounters teaches them one specific fraud pattern. Over 6-12 months, a regular UPI user encounters 3-5 Pause events on average, learning the major fraud typologies through direct, contextual exposure. This is how public safety campaigns should work — at the moment of decision, not at the moment of advertising.

### 5.6 Conditional Settlement Delay for Red Tier (The Safety Valve)

Pause's interception at PIN entry is the primary defense. But what happens when the user proceeds anyway — past a Red warning, past the dwell time, past the explicit "this is a payment, not a receipt" explanation? In Digital Arrest and coercion scenarios, victims under sustained psychological duress will proceed regardless, because the fraudster is on the phone instructing them to ignore warnings.

For these cases, I recommend a Conditional Settlement Delay for Red-tier transactions that the user explicitly overrides. Instead of instant settlement, funds are provisionally debited from the sender's account but held in a centralized NPCI escrow for 2-4 hours before final settlement to the beneficiary. During this window, the user receives a follow-up notification: *"You completed a payment that Pause flagged as high risk. If this was a mistake or you were pressured, tap here to recall the funds within [time remaining]."*

This aligns with and extends the RBI's proposed one-hour cooling-off window for authorized push payments above Rs 9,000 (under active discussion as of April 2026). By tying the delay to Pause's Red tier rather than applying it to all transactions above a threshold, the friction is surgical — only the 1% of transactions that Pause already identified as high-risk are delayed. The 99% of legitimate transactions settle instantly, including the 4% that triggered Amber warnings.

The escrow mechanism requires coordination with settlement infrastructure and creates a new dispute resolution pathway for recalled transactions. This is a meaningful implementation effort, but the fraud prevention value is substantial for the highest-severity cases where interception alone may not be enough.

---

## 6. 30-Day Rollout Plan

### 6.1 Week 1 — Technical Integration with Two Anchor PSPs

Pause is integrated with two anchor PSPs representing 30%+ of UPI volume each — the natural choices being PhonePe and Google Pay. These anchors run in shadow mode: the Risk API is called on every qualifying transaction, the score and severity are computed, but no user-facing interception occurs yet. This validates latency, correctness of scoring, and API stability against real production traffic.

### 6.2 Week 2 — Limited Live Rollout (1% of Users)

Anchor PSPs enable live Pause for a randomly-selected 1% of their user base, stratified across demographics. The control group (99%) experiences standard UPI. Pause events are instrumented end-to-end: Amber and Red intercepts, user response (proceed / go back / report), downstream dispute outcomes. This 1% generates enough signal within 7 days to estimate fraud prevention lift.

### 6.3 Week 3 — Expansion to 10% and Onboarding Additional PSPs

If Week 2 metrics confirm (a) meaningful fraud reduction in the treatment cohort, (b) no material increase in abandonment for legitimate transactions, and (c) no critical bugs, rollout expands to 10% of anchor PSP users. Simultaneously, Paytm, BHIM, and major bank UPI apps begin integration.

### 6.4 Week 4 — Mandate Circular Issuance and Anchor PSP Full Rollout

At week 4, NPCI issues the Pause UX Contract as a formal mandate circular to all member banks, PSPs, and TPAPs. The circular specifies a 90-day compliance window — consistent with NPCI's established precedent for mandates like the beneficiary name display (June 2025) and P2P collect discontinuation (July-October 2025). Full ecosystem adoption is expected by month 4-5, not week 4. Anchor PSPs (PhonePe and Google Pay) expand to 100% of their users at week 4, providing immediate coverage for 85%+ of UPI volume while the long tail of bank apps and smaller PSPs implement during the compliance window. A public-facing press and media campaign accompanies the circular, framing Pause as a user-protection initiative by NPCI rather than a technical fraud-prevention layer.

### 6.5 Measurement Framework

Primary success metrics:
- **Fraud loss prevented (₹ crore / month)** — the core outcome metric
- **Fraud incident reduction (%)** — complement to loss prevention
- **Legitimate transaction completion rate** — must remain within 0.5% of baseline
- **Red-tier false positive rate** — must stay below 5%

Secondary metrics:
- User-reported fraud volume via in-app "Report" action
- Repeat fraud victim rate (does Pause reduce re-victimization?)
- NPS change among elderly and first-time UPI user cohorts
- Cross-PSP adoption timeline

---

## 7. Prototype Scope

The prototype accompanying this document demonstrates the core interception experience. It is built on Next.js, deployed to Vercel's free tier, with the intent classification layer powered by Anthropic's Claude API as the generative model. Claude was selected for the prototype based on its strong reasoning capabilities and rapid integration via the Anthropic SDK; in production, the model choice would be evaluated against latency, cost, and multilingual performance requirements at NPCI scale.

### 7.1 What Is Real in the Prototype

- The generative AI integration — every intent classification is a live LLM call (Claude API in the prototype) analyzing the transaction context, merchant label, and user signals, returning structured risk reasoning. The same architecture would work with any sufficiently capable generative model.
- The three-tier UX — Green pass-through, Amber soft interception, Red hard interception with dwell time, all faithfully implementing the UX Contract specified in this document.
- The API contract — the prototype's frontend calls a serverless function that implements the Risk API request/response schema exactly as documented.

### 7.2 What Is Scaffolded for Demo

- The device signals, VPA reputation database, and behavioral history are hardcoded demo data. In production these would come from NPCI's fraud infrastructure; for the prototype they are pre-seeded to enable deterministic demo scenarios.
- Five pre-scripted demo scenarios selectable from a hidden menu: legitimate merchant transaction (Green), first-time beneficiary payment (Amber), cashback scam collect request (Red), digital arrest coercion pattern (Red), SIM swap with new device (Red).

### 7.3 What Is Explicitly Out of Scope

- Production-grade security, authentication, and rate limiting
- Real mule network detection (requires NPCI-scale data)
- Multi-language rendering (prototype ships English and Hindi only)
- Integration with actual PSP apps (prototype is a standalone simulation of a UPI app)

### 7.4 Demo Flow

The demo team triggers a scenario. The prototype shows a realistic UPI app home screen. A collect request arrives (simulated). The user taps Approve. The Risk API is called live. Claude analyzes the request. The appropriate tier is rendered. The user sees the intercept. A "show reasoning" drill-down reveals the structured signals that drove the classification.

Total demo time: 90 seconds per scenario. Five scenarios cover the full fraud typology.

---

## 8. Risks, Open Questions, and Honest Gaps

No responsible strategy document ships without acknowledging where it is uncertain. The honest list:

### 8.1 Governance Risk

The three-layer architecture depends on NPCI's willingness to publish and enforce a UX Contract. Historically, NPCI has been cautious about mandating UX — prior mandates like beneficiary name display are minimal by comparison. A Pause UX Contract is more prescriptive. Securing ecosystem buy-in from PhonePe and Google Pay, who have strong brand-consistency preferences, is a political project as much as a product one.

### 8.2 Model Cold Start

The intent classification model improves with fraud data. On day one, the signal quality is lower than at month twelve. The rollout plan mitigates this with shadow mode in Week 1, but the first live cohort in Week 2 will experience a less accurate Pause than later cohorts.

### 8.3 Adversarial Adaptation

Fraudsters will adapt. Once Pause detects "cashback approval" as a high-risk phrase, fraudsters will shift to phrasings that do not trigger detection. The system must retrain weekly and the intent classifier must be robust to paraphrase attacks. This is an ongoing arms race, not a solved problem.

### 8.4 Elderly User Accessibility

The population most affected by fraud — elderly users — is also the population least likely to read and process a warning screen in the moment. Pause's copy and UX must be tested extensively with this cohort. Pure text-based warnings may be insufficient; voice-read warnings in the user's language may be necessary for full accessibility.

### 8.5 Liability Shift

If Pause shows a Red warning and the user proceeds anyway, what is the liability framework? Under RBI's current zero-liability rules, banks reimburse customers for fraud reported within 3 working days if the customer was not negligent. Does proceeding past a Red Pause warning constitute negligence? This needs to be clarified with RBI before rollout, because an ambiguous liability regime creates a chilling effect on legitimate transactions and opens dispute vectors.

### 8.6 Domain Humility

I want to name this directly. I have not built UPI products in production. My product experience is in enterprise SaaS, content and compliance platforms at global scale, and AI applications on top of enterprise frameworks. The strategy in this document is informed by research, regulatory literature, and transferable patterns from regulated industries — not from operating inside NPCI's stack. Your team built UPI, operates the switch, and has shipped every mandate referenced in this document. You will have context on infrastructure constraints, existing fraud monitoring capabilities, PSP relationship dynamics, and roadmap dependencies that will refine or redirect this approach. My goal is to bring structured product thinking and a fresh perspective from adjacent regulated domains; the operational truth belongs to the team that runs the rail.

---

## 9. Closing

Pause is a product thesis: that UPI's fraud problem is primarily a cognitive problem at the moment of PIN entry, that the solution requires both centralized intelligence and standardized user experience, and that the tools to build this — real-time ML risk scoring combined with LLM-driven intent analysis — are now mature enough to deploy at NPCI scale. The accompanying prototype demonstrates that the core interception experience is achievable today, not in some distant future state.

The narrower framing of Challenge 5 — a collect request explainer — is a subset of this larger system. Shipping the explainer without the intelligence layer produces a warning that cannot tell which requests are genuinely risky. Shipping the intelligence without the standardized UX produces fragmented fraud experiences across PSPs that fail to build user pattern recognition. Both pieces must be built together, which is why this document combines the two challenges into a single integrated response.

Thank you for the opportunity to think through this problem space. I look forward to discussing it.

— Mayur Mittal
