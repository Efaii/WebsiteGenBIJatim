"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const commissariat_route_1 = __importDefault(require("./routes/commissariat.route"));
const contact_route_1 = __importDefault(require("./routes/contact.route"));
const awardee_route_1 = __importDefault(require("./routes/awardee.route"));
const error_middleware_1 = require("./middlewares/error.middleware");
const path_1 = __importDefault(require("path"));
const request_context_middleware_1 = require("./middlewares/request-context.middleware");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const v1_auth_route_1 = __importDefault(require("./routes/v1-auth.route"));
const v1_news_route_1 = __importDefault(require("./routes/v1-news.route"));
const v1_home_route_1 = __importDefault(require("./routes/v1-home.route"));
const v1_faq_route_1 = __importDefault(require("./routes/v1-faq.route"));
const membership_import_route_1 = __importDefault(require("./routes/membership-import.route"));
const readiness_route_1 = __importDefault(require("./routes/readiness.route"));
const membership_route_1 = __importDefault(require("./routes/membership.route"));
const runtime_config_1 = require("./lib/runtime-config");
const master_route_1 = __importDefault(require("./routes/master.route"));
const program_route_1 = __importDefault(require("./routes/program.route"));
const public_periods_route_1 = __importDefault(require("./routes/public-periods.route"));
const public_structure_route_1 = __importDefault(require("./routes/public-structure.route"));
const public_awardee_route_1 = __importDefault(require("./routes/public-awardee.route"));
const cms_account_route_1 = __importDefault(require("./routes/cms-account.route"));
const overview_route_1 = __importDefault(require("./routes/overview.route"));
const helmet_1 = __importDefault(require("helmet"));
const prisma_1 = require("./lib/prisma");
const rate_limit_middleware_1 = require("./middlewares/rate-limit.middleware");
dotenv_1.default.config();
if (["staging", "production"].includes(process.env.NODE_ENV ?? ""))
    (0, runtime_config_1.assertRuntimeConfig)();
exports.app = (0, express_1.default)();
const portValue = process.env.PORT ?? "5000";
const PORT = Number(portValue);
if (!/^[1-9][0-9]*$/.test(portValue) || !Number.isInteger(PORT) || PORT > 65535) {
    throw new Error("PORT must be a whole number between 1 and 65535.");
}
// Middleware
exports.app.disable("x-powered-by");
const proxyHopsValue = process.env.TRUST_PROXY_HOPS ?? (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test" ? "1" : "0");
if (!/^(0|[1-9][0-9]*)$/.test(proxyHopsValue)) {
    throw new Error("TRUST_PROXY_HOPS must be a whole number between 0 and 8.");
}
const proxyHops = Number(proxyHopsValue);
if (proxyHops > 8) {
    throw new Error("TRUST_PROXY_HOPS must be between 0 and 8.");
}
if (proxyHops > 0)
    exports.app.set("trust proxy", proxyHops);
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
}));
exports.app.use(express_1.default.json({ limit: "1mb" }));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(request_context_middleware_1.requestContext);
exports.app.use("/uploads", express_1.default.static(process.env.PUBLIC_STORAGE_ROOT ??
    path_1.default.join(__dirname, "../public/uploads"), { maxAge: "1d", immutable: false }));
// Health Check
exports.app.use(readiness_route_1.default);
// Rate-limit public abuse targets before dispatching into their routers.
exports.app.use("/api/contact", rate_limit_middleware_1.contactRateLimiter);
exports.app.use("/api/v1/auth/login", rate_limit_middleware_1.loginRateLimiter);
// Feature Routes
exports.app.use("/api/commissariats", commissariat_route_1.default);
exports.app.use("/api/contact", contact_route_1.default);
exports.app.use("/api/awardee", awardee_route_1.default);
exports.app.use("/api/v1/auth", v1_auth_route_1.default);
exports.app.use("/api/v1/news", v1_news_route_1.default);
exports.app.use("/api/v1/home", v1_home_route_1.default);
exports.app.use("/api/v1/faqs", v1_faq_route_1.default);
exports.app.use("/api/v1/membership-imports", membership_import_route_1.default);
exports.app.use("/api/v1/memberships", membership_route_1.default);
exports.app.use("/api/v1/masters", master_route_1.default);
exports.app.use("/api/v1/programs", program_route_1.default);
exports.app.use("/api/v1/periods", public_periods_route_1.default);
exports.app.use("/api/v1/commissariats", public_structure_route_1.default);
exports.app.use("/api/v1/awardees", public_awardee_route_1.default);
exports.app.use("/api/v1/cms-accounts", cms_account_route_1.default);
exports.app.use("/api/v1/overview", overview_route_1.default);
// Global Error Handler Middleware
exports.app.use(error_middleware_1.errorHandler);
// Server Init
if (require.main === module) {
    const server = exports.app.listen(PORT, "0.0.0.0", () => {
        console.log(`[server]: API listening on 0.0.0.0:${PORT}`);
    });
    let shuttingDown = false;
    const shutdown = (signal) => {
        if (shuttingDown)
            return;
        shuttingDown = true;
        console.log(`[server]: ${signal} received; draining connections.`);
        const forceExit = setTimeout(() => process.exit(1), 25000);
        forceExit.unref();
        server.close(() => {
            void prisma_1.prisma.$disconnect().then(() => {
                clearTimeout(forceExit);
                process.exit(0);
            });
        });
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
}
