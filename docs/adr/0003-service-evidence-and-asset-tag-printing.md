# 3. Direct R2 Object Storage for ServiceEvidence and Printable Asset Labels

Date: 2026-11-23

## Status

Accepted

## Context

Field technicians must capture before/after photos, technical parameters (amperage, refrigerant PSI, delta temperatures), and client digital signatures directly from mobile devices. Furthermore, the system must generate printable barcode/QR asset labels matching specific sticker grids (Tom & Jerry #108 / #103) with configurable starting offsets to minimize paper waste.

## Decision

1. **ServiceEvidence Storage**:
   - Technicians upload images directly via Hono endpoints into **Cloudflare R2** with pathing keyed strictly as:
     `evidence/{serviceOrderId}/{acUnitId}/{evidenceType}_{timestamp}.webp`.
   - Client-side image compression (HTML5 Canvas to WebP) runs before upload to conserve mobile bandwidth and R2 storage limits.
   - PIC signatures are captured on an HTML5 canvas as vector paths or PNG/WebP and stored in R2 under `signatures/{serviceOrderId}_{timestamp}.png`.
2. **AssetTag Label Generation & Zero-Margin Print Rules**:
   - The React client implements a print layout engine parameterized by Tom & Jerry dimensions (grid rows/columns, label dimensions, margins, and gutter gaps).
   - A `startOffset` integer allows starting the print from any cell index (skipping previously printed labels on a physical sheet).
   - **Crucial Print Calibrations**: Print CSS must specify `@page { size: A4 portrait; margin: 0 !important; }` and `body { margin: 0 !important; padding: 0 !important; }` to eliminate browser default page margins that distort physical die-cut label alignment.

## Consequences

### Positive
- Zero third-party S3 hosting bills.
- Fast, bandwidth-efficient field uploads.
- Complete operational utility on Tom & Jerry sticker sheets without specialized label printers.

### Negative / Trade-offs
- Client-side print CSS requires strict millimeter (`mm`) page setups (`@page { size: A4; margin: 0; }`) to ensure browser print dialogs line up exactly with physical die-cut stickers.
