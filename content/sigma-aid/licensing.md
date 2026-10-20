---
title: Licensing
order: 60
summary: Where the licence rules for sigma-aid are.
---

# Licensing

The licence terms, tiers and team rules for all SIGMA products are on the general pages:

- [Licensing](/sigma/licensing/)
- [Team setup](/sigma/team-setup/)

Those pages apply to sigma-aid.

## What the daemon checks

Each build of sigma-aid carries the date it was built and a validity period. At startup the daemon prints the expiry date of the binary it is running. An expired build still starts, so that you can still configure it, but it refuses every chat request until a current build is installed. The daemon checks this again about once an hour while it runs.
