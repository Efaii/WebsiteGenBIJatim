import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import commissariatRoutes from "./routes/commissariat.route";
import contactRoutes from "./routes/contact.route";
import awardeeRoutes from "./routes/awardee.route";
import { errorHandler } from "./middlewares/error.middleware";
import path from "path";
import { requestContext } from "./middlewares/request-context.middleware";
import cookieParser from "cookie-parser";
import v1AuthRoutes from "./routes/v1-auth.route";
import v1NewsRoutes from "./routes/v1-news.route";
import v1HomeRoutes from "./routes/v1-home.route";
import v1FaqRoutes from "./routes/v1-faq.route";
import membershipImportRoutes from "./routes/membership-import.route";
import readinessRoutes from "./routes/readiness.route";
import membershipRoutes from "./routes/membership.route";
import { assertRuntimeConfig } from "./lib/runtime-config";
import masterRoutes from "./routes/master.route";
import programRoutes from "./routes/program.route";
import publicPeriodRoutes from "./routes/public-periods.route";
import publicStructureRoutes from "./routes/public-structure.route";
import publicAwardeeRoutes from "./routes/public-awardee.route";
import cmsAccountRoutes from "./routes/cms-account.route";
import overviewRoutes from "./routes/overview.route";
import helmet from "helmet";
import { prisma } from "./lib/prisma";
import { contactRateLimiter, loginRateLimiter } from "./middlewares/rate-limit.middleware";

dotenv.config();

if (["staging", "production"].includes(process.env.NODE_ENV ?? ""))
  assertRuntimeConfig();

export const app = express();
const portValue = process.env.PORT ?? "5000";
const PORT = Number(portValue);
if (!/^[1-9][0-9]*$/.test(portValue) || !Number.isInteger(PORT) || PORT > 65_535) {
  throw new Error("PORT must be a whole number between 1 and 65535.");
}

// Middleware
app.disable("x-powered-by");
const proxyHopsValue = process.env.TRUST_PROXY_HOPS ?? (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test" ? "1" : "0");
if (!/^(0|[1-9][0-9]*)$/.test(proxyHopsValue)) {
  throw new Error("TRUST_PROXY_HOPS must be a whole number between 0 and 8.");
}
const proxyHops = Number(proxyHopsValue);
if (proxyHops > 8) {
  throw new Error("TRUST_PROXY_HOPS must be between 0 and 8.");
}
if (proxyHops > 0) app.set("trust proxy", proxyHops);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(requestContext);
app.use(
  "/uploads",
  express.static(
    process.env.PUBLIC_STORAGE_ROOT ??
      path.join(__dirname, "../public/uploads"),
    { maxAge: "1d", immutable: false },
  ),
);

// Health Check
app.use(readinessRoutes);

// Rate-limit public abuse targets before dispatching into their routers.
app.use("/api/contact", contactRateLimiter);
app.use("/api/v1/auth/login", loginRateLimiter);

// Feature Routes
app.use("/api/commissariats", commissariatRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/awardee", awardeeRoutes);
app.use("/api/v1/auth", v1AuthRoutes);
app.use("/api/v1/news", v1NewsRoutes);
app.use("/api/v1/home", v1HomeRoutes);
app.use("/api/v1/faqs", v1FaqRoutes);
app.use("/api/v1/membership-imports", membershipImportRoutes);
app.use("/api/v1/memberships", membershipRoutes);
app.use("/api/v1/masters", masterRoutes);
app.use("/api/v1/programs", programRoutes);
app.use("/api/v1/periods", publicPeriodRoutes);
app.use("/api/v1/commissariats", publicStructureRoutes);
app.use("/api/v1/awardees", publicAwardeeRoutes);
app.use("/api/v1/cms-accounts", cmsAccountRoutes);
app.use("/api/v1/overview", overviewRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

// Server Init
if (require.main === module) {
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[server]: API listening on 0.0.0.0:${PORT}`);
  });
  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[server]: ${signal} received; draining connections.`);
    const forceExit = setTimeout(() => process.exit(1), 25_000);
    forceExit.unref();
    server.close(() => {
      void prisma.$disconnect().then(() => {
        clearTimeout(forceExit);
        process.exit(0);
      });
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
