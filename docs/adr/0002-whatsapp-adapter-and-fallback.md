# 2. WhatsApp Notification Adapter Pattern with Official API and Multi-Gateway Fallback

Date: 2026-11-23

## Status

Accepted

## Context

Customer reminder notifications (3-6 month routine maintenance schedules) and operational alerts (service dispatch, invoice ready) require WhatsApp delivery. The primary channel is the Official Meta Cloud API (WhatsApp Business Platform), but rate limits, template approval requirements, or connectivity hurdles make it necessary to support community gateways (such as Fonnte or Waha) as seamless fallbacks.

## Decision

We introduce a unified `WhatsAppGateway` interface with an adapter design pattern:
- **`MetaWhatsAppProvider`**: Implements official WhatsApp Business Cloud API with structured message templates.
- **`FonnteWhatsAppProvider` / `WahaWhatsAppProvider`**: Implements direct REST webhook/message endpoints as configurable secondary providers or fallbacks.
- **`NotificationService`**: Orchestrates sending. If the primary provider returns an unrecoverable failure or is toggled off in system settings, it falls back to the configured secondary provider and logs the delivery status in D1.

## Consequences

### Positive
- Business operations are resilient to gateway outages and template rejection.
- Zero vendor lock-in; easy to switch or A/B test between official Meta API and Fonnte/Waha.

### Negative / Trade-offs
- Message templates must be kept synchronized across providers (or fallback to plain text on non-official gateways).
- Requires storing and managing multiple API credentials in Cloudflare Worker secrets or D1 settings.
