---
title: Privacy and data
order: 60
summary: Learn what licence check-in sends and where to read the full privacy policy.
---

# Privacy and data

Read the [VargaLABS privacy policy](https://vargalabs.com/privacy/) for the full terms. This page is a short summary.

## Licence check-in

A licence check-in sends:

- The install key that identifies your licence.
- A machine fingerprint, supplied as a one-way SHA-256 hash.
- The product name.
- The product version, when supplied.
- The current signed licence token, when supplied.

The check-in request does not contain user names. The service records when each machine was first and last seen. It uses the fingerprint to count active machines and issue a token for that machine.

## Account linking is separate

If you [link an account](/sigma/account-linking/), the sign-in provider supplies an account identifier, a display name, and an email address when available. For GitHub, linking requires a verified primary email address.

This account information is separate from the licence check-in request. VargaLABS does not receive your sign-in password.

## Payments and requests

Stripe handles payment details. VargaLABS does not receive your full card number.

For data access, correction, deletion, or account unlinking, contact [info@vargalabs.com](mailto:info@vargalabs.com). The [privacy policy](https://vargalabs.com/privacy/) explains retention, service providers, and your rights.
