import { Request, Response } from "express";
import { SLACK_UI_CRITICAL_ERRORS } from "../models/config";

export const postErrorNotification = async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;

    // Usar Optional Chaining (?.) y valores por defecto para evitar crashes
    const publicMessage = context?.err?.message || context?.message || "No public message provided";
    
    // Aquí suele haber fallos si context.err o context.err.error no existen
    const errorMessage = context?.err?.error?.message || context?.err?.name || "No technical details provided";
    
    const statusCode = context?.err?.status || context?.statusCode || "N/A";
    const url = context?.url || req.headers.referer || "N/A";
    const userAgent = req.headers["user-agent"] || "N/A";
    const authToken = req.cookies?.["access_token"] || "No token";

    const payload = {
      text: `Error en Frontend: ${message}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `🚨 ${statusCode} - ${message}`.substring(0, 3000), // Slack tiene límites de caracteres
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Public Message:*\n${publicMessage}`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Error Detail:*\n\`\`\`${errorMessage}\`\`\``, // En bloque de código se ve mejor
          },
        },
        {
            type: "context",
            elements: [
                { type: "mrkdwn", text: `*URL:* ${url}` },
                { type: "mrkdwn", text: `*Browser:* ${userAgent}` },
                { type: "mrkdwn", text: `*Auth Token:* ${authToken}` }
            ]
        }
      ],
    };

    const resp = await fetch(SLACK_UI_CRITICAL_ERRORS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
        const slackErr = await resp.text();
        throw new Error(`Slack API error: ${slackErr}`);
    }

    return res.json({ ok: true });
  } catch (error: any) {
    console.error("Error en Slack Controller:", error);
    // IMPORTANTE: No envíes el objeto error directamente, envía el string
    return res.status(500).json({ 
        ok: false, 
        message: error.message || "Error interno del servidor" 
    });
  }
};
