# Methodology

Tiers: V3 steward-signed, V2 public reference, V1 unverified, V0 synthetic.

Placement is a share of a past cohort, also drawn as an icon array out of 10. Earnings are median and P25–P75, monthly, en-IN grouping. Cohort under `MIN_COHORT` (20) falls back district → state with a sentence that says so.

Resistance Index, 0–100:

RI = 100 × (0.35·U + 0.25·S + 0.20·I + 0.10·E + 0.10·P)

U = min(1, sum of open intensities / 6). S = (1 − parent sentiment) / 2 over the last 3 turns. Stance scores: OPEN 0, HESITANT 0.4, RESISTANT 0.8, VETO 1. E is 1 if escalation was requested. P = min(1, repeats / 3).

Lift = RI at start − RI at end. A hotspot is a district mean more than one state standard deviation above the state mean, with at least 30 sessions in 30 days. Treat lifts as correlation, not cause.
