import * as schema from "../db/schema";
import { ResilientWhatsAppService } from "./whatsapp";

export const SETTING_KEYS = {
  META_WA_TOKEN: "meta_wa_token",
  META_PHONE_NUMBER_ID: "meta_phone_number_id",
  FONNTE_TOKEN: "fonnte_token",
  RESEND_API_KEY: "resend_api_key",
} as const;

export interface SystemGatewayConfig {
  metaWaToken?: string;
  metaPhoneNumberId?: string;
  fonnteToken?: string;
  resendApiKey?: string;
}

/**
 * Resolves gateway configurations with D1 system_settings taking precedence,
 * falling back to Cloudflare Worker environment variables.
 */
export async function getSystemSettings(db: any, env: any): Promise<SystemGatewayConfig> {
  const config: SystemGatewayConfig = {
    metaWaToken: env?.META_WA_TOKEN,
    metaPhoneNumberId: env?.META_PHONE_NUMBER_ID,
    fonnteToken: env?.FONNTE_TOKEN,
    resendApiKey: env?.RESEND_API_KEY,
  };

  if (db) {
    try {
      const rows = await db.select().from(schema.systemSettings).all();
      for (const row of rows) {
        if (row.key === SETTING_KEYS.META_WA_TOKEN && row.value) config.metaWaToken = row.value;
        if (row.key === SETTING_KEYS.META_PHONE_NUMBER_ID && row.value) config.metaPhoneNumberId = row.value;
        if (row.key === SETTING_KEYS.FONNTE_TOKEN && row.value) config.fonnteToken = row.value;
        if (row.key === SETTING_KEYS.RESEND_API_KEY && row.value) config.resendApiKey = row.value;
      }
    } catch (err) {
      console.error("Failed to query system_settings from D1:", err);
    }
  }

  return config;
}

/**
 * Shared factory helper to construct ResilientWhatsAppService with resolved settings.
 */
export async function createConfiguredWhatsAppService(db: any, env: any): Promise<ResilientWhatsAppService> {
  const settings = await getSystemSettings(db, env);
  return new ResilientWhatsAppService({
    META_WA_TOKEN: settings.metaWaToken,
    META_PHONE_NUMBER_ID: settings.metaPhoneNumberId,
    FONNTE_TOKEN: settings.fonnteToken,
  });
}
