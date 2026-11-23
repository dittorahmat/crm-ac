# 7. Real WebRTC Camera Barcode/QR Scanner & D1 Asset Picker

Date: 2026-11-24

## Status

Accepted

## Context

Previously, the sidebar featured a button labeled *"Simulasi Scan Barcode AC"* which hardcoded the asset tag `"AC-MSF-SRV-01"` and opened the unit passport view. This served as a pseudo-code shortcut rather than an authentic field-service workflow.

Technicians on site require the ability to aim their smartphone camera at physical asset tags (printed on Tom & Jerry die-cut sticker sheets) to instantly locate units and log service measurements. Meanwhile, operators in desktop demo environments without webcams need a fallback mode that selects real units from Cloudflare D1 rather than hardcoded mock strings.

## Decision

### 1. Dual-Mode Barcode & QR Scanner Dialog
Replace the hardcoded button shortcut with a responsive modal dialog (`BarcodeScanModal`) offering two modes:
1. **Live Camera Scanner (Hardware WebRTC)**: Uses the browser's `navigator.mediaDevices.getUserMedia` / `BarcodeDetector` / `html5-qrcode` to stream the device camera (preferring `facingMode: "environment"` for rear smartphone cameras), detecting asset tag QR codes in real-time with visual target reticle and audio/haptic feedback.
2. **D1 Asset Picker Fallback**: Fetches live `ACUnit` records directly from `/api/ac-units` in Cloudflare D1 with searchable tags, customer names, and zones.

### 2. Role-Based Post-Scan Routing
Upon successful scan or selection of an Asset Tag:
- **Technician Role**: Automatically sets the scanned unit as active in `FieldTrackingView` so the technician can immediately log pressure PSI, current, temperature, and upload R2 photos.
- **Admin Role**: Directs the user to `ACUnitDetailView` (Digital Asset Passport) displaying full service history, customer metadata, and health status.
- **URL Sync**: Pushes `/ac/:assetTag` into the browser history for deep-linking.

### 3. Fail-Safe Permissions
If camera permission is denied, unsecure (non-HTTPS in production), or unavailable, the scanner gracefully falls back to the D1 live picker without throwing unhandled exceptions.

## Consequences

- Eliminates hardcoded pseudo-code shortcuts across the entire navigation bar.
- Field technicians can physically scan equipment stickers on commercial job sites.
- Desktop administrators can test and inspect any real AC unit from D1 without a physical camera.
