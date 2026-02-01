import "./env";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { initializeRedis, closeRedis } from "./cache";
import parcelRoutes from "./routes/parcels";

const app = new Hono();

// Middleware
app.use("*", logger()); // Adds request logging
app.use("*", cors());

// Health Check
app.get("/", (c) => c.json({ message: "Property Parcels API", status: "ok" }));

// Mount Routes
app.route("/v1/api/parcels", parcelRoutes);

// Server Start
const port = Number(process.env.PORT) || 3000;

console.log(`Starting server on port ${port}...`);

// Initialize Redis cache
initializeRedis().catch((err) => {
  console.warn("Failed to initialize Redis, continuing without cache:", err);
});

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing connections...");
  await closeRedis();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing connections...");
  await closeRedis();
  process.exit(0);
});

serve({
  fetch: app.fetch,
  port,
});

export default app;
