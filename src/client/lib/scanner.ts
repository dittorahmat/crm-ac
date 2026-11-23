/**
 * Robustly parses and extracts the canonical Asset Tag from a scanned text or URL.
 * Handles:
 * - Direct tags: "AC-MSF-SRV-01"
 * - Full URLs: "https://crm-ac.tech1solusi.workers.dev/ac/AC-MSF-SRV-01"
 * - URLs with query strings: "https://host/ac/AC-MSF-SRV-01?ref=qr"
 * - Trailing slashes: "/ac/AC-MSF-SRV-01/"
 */
export function parseAssetTagFromUrl(scannedText: string): string {
  if (!scannedText) return "";
  const trimmed = scannedText.trim();

  // If contains /ac/ path
  if (trimmed.includes("/ac/")) {
    const afterAc = trimmed.split("/ac/")[1];
    // Split by query param, hash, or trailing slash
    const clean = afterAc.split("?")[0].split("#")[0].split("/")[0];
    return decodeURIComponent(clean).trim();
  }

  // If full URL with pathname ending
  try {
    const parsed = new URL(trimmed);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const acIdx = segments.indexOf("ac");
    if (acIdx !== -1 && segments[acIdx + 1]) {
      return decodeURIComponent(segments[acIdx + 1]).trim();
    }
  } catch {
    // Not a valid URL, treat as raw tag
  }

  return trimmed;
}

/**
 * Triggers sensory feedback (audio beep + haptic vibration) upon successful barcode scan.
 */
export function triggerScanSuccessFeedback() {
  // 1. Haptic Vibration (Supported on mobile devices)
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }
  } catch {
    // Ignore unsupported environment
  }

  // 2. Audio Chime via Web Audio API (No external sound asset required)
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6 note

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch {
    // Ignore environments where Web Audio is restricted
  }
}
