"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postErrorNotification = void 0;
const config_1 = require("../models/config");
const postErrorNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const { message, context } = req.body;
        // Usar Optional Chaining (?.) y valores por defecto para evitar crashes
        const publicMessage = ((_a = context === null || context === void 0 ? void 0 : context.err) === null || _a === void 0 ? void 0 : _a.message) || (context === null || context === void 0 ? void 0 : context.message) || "No public message provided";
        // Aquí suele haber fallos si context.err o context.err.error no existen
        const errorMessage = ((_c = (_b = context === null || context === void 0 ? void 0 : context.err) === null || _b === void 0 ? void 0 : _b.error) === null || _c === void 0 ? void 0 : _c.message) || ((_d = context === null || context === void 0 ? void 0 : context.err) === null || _d === void 0 ? void 0 : _d.name) || "No technical details provided";
        const statusCode = ((_e = context === null || context === void 0 ? void 0 : context.err) === null || _e === void 0 ? void 0 : _e.status) || (context === null || context === void 0 ? void 0 : context.statusCode) || "N/A";
        const url = (context === null || context === void 0 ? void 0 : context.url) || req.headers.referer || "N/A";
        const userAgent = req.headers["user-agent"] || "N/A";
        const authToken = ((_f = req.cookies) === null || _f === void 0 ? void 0 : _f["access_token"]) || "No token";
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
        const resp = yield fetch(config_1.SLACK_UI_CRITICAL_ERRORS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!resp.ok) {
            const slackErr = yield resp.text();
            throw new Error(`Slack API error: ${slackErr}`);
        }
        return res.json({ ok: true });
    }
    catch (error) {
        console.error("Error en Slack Controller:", error);
        // IMPORTANTE: No envíes el objeto error directamente, envía el string
        return res.status(500).json({
            ok: false,
            message: error.message || "Error interno del servidor"
        });
    }
});
exports.postErrorNotification = postErrorNotification;
