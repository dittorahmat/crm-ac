import * as schema from "../db/schema";
import { eq } from "drizzle-orm";

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
        if (row.key === "meta_wa_token" && row.value) config.metaWaToken = row.value;
        if (row.key === "meta_phone_number_id" && row.value) config.metaPhoneNumberId = row.value;
        if (row.key === "fonnte_token" && row.value) config.fonnteToken = row.value;
        if (row.key === "resend_api_key" && row.value) config.resendApiKey = row.value;
      }
    } catch (err) {
      console.error("Failed to query system_settings from D1:", err);
    }
  }

  return config;
}
