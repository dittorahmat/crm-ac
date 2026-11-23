# 3. Direct R2 Object Storage for ServiceEvidence and Printable Asset Labels

Date: 2026-11-23

## Status

Accepted

## Context

Field technicians must capture before/after photos, technical parameters (amperage, refrigerant PSI, delta temperatures), and client digital signatures directly from mobile devices. Furthermore, the system must generate printable barcode/QR asset labels matching specific sticker grids (Tom & Jerry #108 / #103) with configurable starting offsets to minimize paper waste.

## Decision

1. **ServiceEvidence Storage**:
   - Technicians upload images directly via Hono endpoints into **Cloudflare R2** with pathing keyed as `evidence/{service_order_id}/{ac_unit_id}/{evidence_type}_{timestamp}.webp`.
   - Client-side image compression (HTML5 Canvas to WebP) runs before upload to conserve mobile bandwidth and R2 storage limits.
   - PIC signatures are captured on an HTML5 canvas as vector paths or PNG/WebP and stored in R2.
2. **AssetTag Label Generation**:
   - The React SPA implements a client-side print layout engine parameterized by Tom & Jerry dimensions (grid rows/columns, label dimensions, margins, and gutter gaps).
   - A `startOffset` integer allows starting the print from any cell index (skipping previously printed labels on a physical sheet).

## Consequences

### Positive
- Zero third-party S3 hosting bills.
- Fast, bandwidth-efficient field uploads.
- Complete operational utility on Tom & Jerry sticker sheets without specialized label printers.

### Negative / Trade-offs
- Client-side print CSS requires strict millimeter (`mm`) page setups (`@page { size: A4; margin: 0; }`) to ensure browser print dialogs line up exactly with physical die-cut stickers.
