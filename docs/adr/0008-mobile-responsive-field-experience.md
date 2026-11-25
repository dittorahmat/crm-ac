# 8. Mobile-Responsive Field Service Experience & Role-Adaptive Navigation

Date: 2026-11-25

## Status

Accepted

## Context

Technicians operating on physical commercial customer sites (rooftops, server rooms, mechanical basements) interact with the application primarily via handheld mobile smartphones, often single-handed while carrying diagnostic gauges or tools. 

Previously, the application layout relied on desktop-centric conventions:
1. Navigation required opening a side drawer hamburger menu for every screen transition.
2. Field telemetry forms used standard desktop inputs without touch-friendly steppers or optimized mobile keypad modes.
3. The digital signature canvas in `FieldTrackingView` had fixed dimensions that caused overflow or cramped signature inputs on small portrait mobile viewports.
4. Data tables in scheduling and customer asset views required horizontal scrolling, reducing readability and efficiency for field workers.

## Decision

### 1. Role-Adaptive Mobile Bottom Navigation Bar
Implement a persistent, thumb-accessible Bottom Navigation Bar on viewports `< 768px` (`md:hidden`):
- **Technician Role**: Dedicated 4-slot bar:
  1. `service_flow` (Tracking Servis Lapangan)
  2. `schedules` (Jadwal Kerja Lapangan)
  3. Prominent Elevated Center Action: **Pindai Barcode/QR** (triggers WebRTC camera scan modal directly)
  4. Quick Account / Logout menu trigger
- **Admin Role**:
  1. `dashboard` (Metrik)
  2. `schedules` (Penjadwalan)
  3. Elevated Center Action: **Pindai Barcode/QR** (Asset Passport)
  4. "Menu Lainnya" trigger to slide open the comprehensive 9-module drawer.

Safe bottom padding (`pb-20 md:pb-6`) is added across main view containers to prevent bottom navigation overlaps.

### 2. Fullscreen / Dedicated Signature Modal on Mobile
To ensure building PIC signatures are captured cleanly without viewport overflow:
- On mobile viewports, the digital signature step provides an expanded full-width touch canvas with clear reset/submit controls and touch prevention flags (`touch-action: none`) preventing accidental page scrolling while signing.

### 3. Touch-Optimized Field Telemetry & Steppers
In `FieldTrackingView`:
- Numerical inputs (PSI, Ampere, Temperature) are enhanced with `inputMode="decimal"` to auto-invoke numeric keypads on iOS and Android.
- Quick adjustment stepper pills (+/- increments) and minimum 48x48px touch targets ensure technicians can log values comfortably with work gloves or wet hands.

### 4. Adaptive Card Transformations for Mobile
In `ServiceScheduleView` and `CustomerAssetsView`:
- Tables seamlessly transform into stacked touch cards on small viewports (`sm:hidden`).
- Cards display high-priority operational attributes: status badges, customer name, building address, direct PIC call/WhatsApp triggers, and one-tap action buttons. Desktop viewports retain tabular presentation (`hidden sm:table`).

## Consequences

- Dramatically improves on-site field usability, reducing time-to-log for routine maintenance visits.
- Preserves clean B2B design standards without compromising desktop administrator workflows.
- Eliminates multi-directional scrolling and signature truncation on narrow viewports.
