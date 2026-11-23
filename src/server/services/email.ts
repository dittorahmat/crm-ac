export interface SendEmailParams {
  apiKey: string;
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendTransactionalEmail(params: SendEmailParams): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!params.apiKey) {
    return { success: false, error: "Resend API key not configured" };
  }

  const recipients = Array.isArray(params.to) ? params.to : [params.to];

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: params.from || "KoolSync Invoicing <billing@koolsync.com>",
        to: recipients,
        subject: params.subject,
        html: params.html,
      }),
    });

    const data = await resp.json();
    return {
      success: resp.ok,
      data,
      error: resp.ok ? undefined : JSON.stringify(data),
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}
