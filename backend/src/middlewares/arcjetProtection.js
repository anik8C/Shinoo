import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
    try {
        // Diagnostic: see what IP Arcjet is actually detecting
        const details = aj.clientIpDetails(req);

        console.log({
            expressIp: req.ip,
            socketIp: req.socket?.remoteAddress,
            forwardedFor: req.get("x-forwarded-for"),
            realIp: req.get("x-real-ip"),
            forwarded: req.get("forwarded"),

            arcjetIp: details.ip,
            provenance: details.provenance,
            verified: details.verified,
            header: details.header,
        });

        const decision = await aj.protect(req);

        if (decision.isDenied()) {
            console.log({
                userAgent: req.get("user-agent"),
                ip: req.ip,
                denied: decision.isDenied(),
                reason: decision.reason,
                spoofed: decision.results.some(isSpoofedBot),
                results: decision.results
            });

            if (decision.reason.isRateLimit()) {
                return res.status(403).json({
                    message: "Rate limit exceeded. Please try again later."
                });
            }
            else if (decision.reason.isBot()) {
                return res.status(403).json({
                    message: "Bot activity detected. Please try again later."
                });
            }
            else {
                return res.status(403).json({
                    message: "Access denied. Please try again later."
                });
            }
        }

        if (decision.results.some(isSpoofedBot)) {
            console.log({
                userAgent: req.get("user-agent"),
                ip: req.ip,
                denied: decision.isDenied(),
                reason: decision.reason,
                spoofed: decision.results.some(isSpoofedBot),
                results: decision.results
            });

            return res.status(403).json({
                error: "Spoof bot detected",
                message: "Malicious bot activity detected. Please try again later."
            });
        }

        console.log({
            userAgent: req.get("user-agent"),
            ip: req.ip,
            denied: decision.isDenied(),
            reason: decision.reason,
            spoofed: decision.results.some(isSpoofedBot),
            results: decision.results
        });

        next();

    } catch (error) {
        console.error("Error in Arcjet protection middleware:", error);
        return res.status(500).json({
            message: "Internal server error."
        });
    }
};