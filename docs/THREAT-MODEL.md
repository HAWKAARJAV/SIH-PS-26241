# Threat model

Assets: family transcripts, outcome datasets, staff accounts.

| Threat | Mitigation |
| --- | --- |
| Stolen transcript | Consent gate, delete control, admin cannot open chats |
| Forged statistic | Maker-checker, checksum, tiers, number guard |
| Credential stuffing | Rate limits, bcrypt hashes, staff-only auth |
| XSS | React escaping, CSP, no HTML from the model |
| Cross-site posts | Same-site cookies via Auth.js, Zod on bodies |

Residual: the demo OTP is not a real consent manager. Do not use this build for production child data.
