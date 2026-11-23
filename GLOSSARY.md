# CRM AC (Air Conditioning Service Management)

A specialized B2B CRM and field service management system for commercial AC maintenance, scheduling, tracking, and billing.

## Language

### Organizational & Asset Hierarchy

**Customer**:
A legal entity (e.g., PT, CV, enterprise office) contracting for AC maintenance or repair services.
_Avoid_: Client, buyer, account

**Location**:
A distinct physical building, branch, or site owned or leased by a Customer.
_Avoid_: Branch, facility, premise

**Zone**:
A designated floor, section, or room within a Location where AC units are situated (e.g., "Lantai 2 - Ruang Server").
_Avoid_: Area, compartment

**ACUnit**:
An individual air conditioner physical asset bearing a unique tag/barcode, specifications, and service history.
_Avoid_: Machine, equipment, device

**AssetTag**:
A unique identifier encoded into a printable barcode/QR Code label affixed to an ACUnit.
_Avoid_: Label code, sticker serial

### Field Operations & Evidence

**ServiceOrder**:
A formal work ticket requested or scheduled for inspection, routine cleaning, or repair at a Location.
_Avoid_: Job, ticket, task, order

**ServiceItem**:
The specific service, inspection record, or repair action performed on an individual ACUnit within a ServiceOrder.
_Avoid_: Task item, subtask

**ServiceEvidence**:
Structured proof captured during service: before/after photos, diagnostic parameters (pressure/temperature), and PIC digital signature.
_Avoid_: Proof of work, attachment

**Technician**:
A field service engineer assigned to execute ServiceOrders on-site.
_Avoid_: Worker, mechanic, field staff

### Scheduling & Billing

**MaintenanceSchedule**:
A recurring schedule rule (e.g., every 3, 4, or 6 months) generating future ServiceOrder reminders for ACUnits.
_Avoid_: Periodic plan, recurring timer

**Invoice**:
A bill generated for completed ServiceOrders containing itemized service fees and replacement parts.
_Avoid_: Bill, receipt, payment statement

**PortalPass**:
A time-limited or cryptographically signed token enabling Customer PICs to view unit service histories and invoices without an account.
_Avoid_: Guest login, magic link
