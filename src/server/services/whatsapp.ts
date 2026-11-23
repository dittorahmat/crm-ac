export interface SendWhatsAppParams {
  toPhone: string;
  customerName: string;
  messageType: "routine_reminder" | "service_dispatched" | "invoice_ready";
  params: {
    unitCount?: number;
    locationName?: string;
    dueDate?: string;
    portalLink?: string;
    invoiceAmount?: string;
    technicianName?: string;
  };
}

export interface WhatsAppGateway {
  send(payload: SendWhatsAppParams): Promise<{ success: boolean; provider: string; error?: string }>;
}

// 1. Official Meta Cloud API
export class MetaWhatsAppGateway implements WhatsAppGateway {
  constructor(private token?: string, private phoneNumberId?: string) {}

  async send(payload: SendWhatsAppParams): Promise<{ success: boolean; provider: string; error?: string }> {
    if (!this.token || !this.phoneNumberId) {
      return { success: false, provider: "meta", error: "Meta credentials not set" };
    }

    try {
      const resp = await fetch(
        `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: payload.toPhone,
            type: "text",
            text: {
              body: `[KoolSync Service AC]\nHalo ${payload.customerName},\nJadwal perawatan rutin ${payload.params.unitCount || 1} unit AC di ${payload.params.locationName || "kantor Anda"} jatuh tempo pada ${payload.params.dueDate}.\n\nSilakan konfirmasi jadwal teknisi di: ${payload.params.portalLink}`,
            },
          }),
        }
      );
      const data = await resp.json();
      return { success: resp.ok, provider: "meta", error: resp.ok ? undefined : JSON.stringify(data) };
    } catch (err: any) {
      return { success: false, provider: "meta", error: err.message };
    }
  }
}

// 2. Fonnte Gateway (Fallback)
export class FonnteWhatsAppGateway implements WhatsAppGateway {
  constructor(private token?: string) {}

  async send(payload: SendWhatsAppParams): Promise<{ success: boolean; provider: string; error?: string }> {
    if (!this.token) {
      return { success: false, provider: "fonnte", error: "Fonnte token not set" };
    }

    try {
      const message = `*KoolSync AC Maintenance*\nHalo ${payload.customerName},\nJadwal servis berkala untuk *${payload.params.unitCount || 1} unit AC* di *${payload.params.locationName}* jatuh tempo pada *${payload.params.dueDate}*.\n\nKonfirmasi kunjungan teknisi melalui tautan portal:\n${payload.params.portalLink}`;

      const resp = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          Authorization: this.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: payload.toPhone,
          message,
          countryCode: "62",
        }),
      });
      const data = await resp.json();
      return { success: resp.ok, provider: "fonnte", error: resp.ok ? undefined : JSON.stringify(data) };
    } catch (err: any) {
      return { success: false, provider: "fonnte", error: err.message };
    }
  }
}

// 3. Composite Orchestrator with Fallback
export class ResilientWhatsAppService {
  private meta: MetaWhatsAppGateway;
  private fonnte: FonnteWhatsAppGateway;

  constructor(env: { META_WA_TOKEN?: string; META_PHONE_NUMBER_ID?: string; FONNTE_TOKEN?: string }) {
    this.meta = new MetaWhatsAppGateway(env.META_WA_TOKEN, env.META_PHONE_NUMBER_ID);
    this.fonnte = new FonnteWhatsAppGateway(env.FONNTE_TOKEN);
  }

  async dispatch(params: SendWhatsAppParams) {
    // Try primary (Official Meta)
    const primaryResult = await this.meta.send(params);
    if (primaryResult.success) {
      return primaryResult;
    }

    console.warn("Primary WhatsApp provider failed, falling back to Fonnte:", primaryResult.error);
    // Fallback to Fonnte
    const fallbackResult = await this.fonnte.send(params);
    return fallbackResult;
  }
}
