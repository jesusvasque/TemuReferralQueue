var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index-render.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertQueueEntrySchema: () => insertQueueEntrySchema,
  insertUserSchema: () => insertUserSchema,
  queueEntries: () => queueEntries,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var queueEntries = pgTable("queue_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  referralCode: text("referral_code").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  position: integer("position").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  expiresAt: timestamp("expires_at")
});
var insertQueueEntrySchema = createInsertSchema(queueEntries, {
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre no puede tener m\xE1s de 50 caracteres"),
  referralCode: z.string().min(3, "El c\xF3digo de referido es requerido").max(500, "El c\xF3digo es muy largo")
}).pick({
  name: true,
  referralCode: true
});
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, asc, sql as sql2, count } from "drizzle-orm";
var DatabaseStorage = class {
  async addToQueue(entry, ipAddress) {
    const existingEntry = await this.getEntryByIp(ipAddress);
    if (existingEntry && !existingEntry.isCompleted) {
      throw new Error("Ya tienes un c\xF3digo en la cola. Solo se permite un c\xF3digo por IP.");
    }
    const [{ maxPosition }] = await db.select({ maxPosition: sql2`COALESCE(MAX(${queueEntries.position}), 0)` }).from(queueEntries).where(eq(queueEntries.isCompleted, false));
    const nextPosition = (maxPosition || 0) + 1;
    const activeEntry = await this.getActiveEntry();
    const shouldBeActive = !activeEntry;
    const now = /* @__PURE__ */ new Date();
    const expiresAt = shouldBeActive ? new Date(now.getTime() + 20 * 60 * 1e3) : null;
    const [newEntry] = await db.insert(queueEntries).values({
      ...entry,
      ipAddress,
      position: nextPosition,
      isActive: shouldBeActive,
      startedAt: shouldBeActive ? now : null,
      expiresAt
    }).returning();
    return newEntry;
  }
  async getActiveEntry() {
    const [entry] = await db.select().from(queueEntries).where(and(eq(queueEntries.isActive, true), eq(queueEntries.isCompleted, false))).limit(1);
    return entry || void 0;
  }
  async getQueueByPosition() {
    return await db.select().from(queueEntries).where(eq(queueEntries.isCompleted, false)).orderBy(asc(queueEntries.position));
  }
  async getQueueStats() {
    const [stats] = await db.select({
      total: count(),
      active: sql2`SUM(CASE WHEN ${queueEntries.isActive} = true AND ${queueEntries.isCompleted} = false THEN 1 ELSE 0 END)`,
      waiting: sql2`SUM(CASE WHEN ${queueEntries.isActive} = false AND ${queueEntries.isCompleted} = false THEN 1 ELSE 0 END)`,
      completed: sql2`SUM(CASE WHEN ${queueEntries.isCompleted} = true THEN 1 ELSE 0 END)`
    }).from(queueEntries);
    return {
      total: Number(stats.total),
      active: Number(stats.active),
      waiting: Number(stats.waiting),
      completed: Number(stats.completed)
    };
  }
  async getEntryByIp(ipAddress) {
    const [entry] = await db.select().from(queueEntries).where(and(eq(queueEntries.ipAddress, ipAddress), eq(queueEntries.isCompleted, false))).limit(1);
    return entry || void 0;
  }
  async markCompleted(id) {
    const [updated] = await db.update(queueEntries).set({ isCompleted: true, isActive: false }).where(eq(queueEntries.id, id)).returning();
    if (updated) {
      await this.activateNextEntry();
      return true;
    }
    return false;
  }
  async activateNextEntry() {
    const nextEntry = await db.select().from(queueEntries).where(and(eq(queueEntries.isActive, false), eq(queueEntries.isCompleted, false))).orderBy(asc(queueEntries.position)).limit(1);
    if (nextEntry.length === 0) return void 0;
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(now.getTime() + 20 * 60 * 1e3);
    const [activated] = await db.update(queueEntries).set({
      isActive: true,
      startedAt: now,
      expiresAt
    }).where(eq(queueEntries.id, nextEntry[0].id)).returning();
    return activated;
  }
  async updateEntryExpiration(id, expiresAt) {
    const [updated] = await db.update(queueEntries).set({ expiresAt }).where(eq(queueEntries.id, id)).returning();
    return !!updated;
  }
  async getExpiredEntries() {
    const now = /* @__PURE__ */ new Date();
    return await db.select().from(queueEntries).where(
      and(
        eq(queueEntries.isActive, true),
        eq(queueEntries.isCompleted, false),
        sql2`${queueEntries.expiresAt} < ${now}`
      )
    );
  }
  async removeExpiredEntry(id) {
    const [updated] = await db.update(queueEntries).set({ isActive: false }).where(eq(queueEntries.id, id)).returning();
    return !!updated;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z as z2 } from "zod";
import cors from "cors";
async function registerRoutes(app2) {
  app2.use(cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5000",
      /\.infinityfreeapp\.com$/,
      /\.000webhostapp\.com$/,
      /\.onrender\.com$/,
      ...process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(",") : []
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = /* @__PURE__ */ new Set();
  wss.on("connection", (ws2) => {
    clients.add(ws2);
    console.log("Client connected to WebSocket");
    sendQueueUpdate();
    ws2.on("close", () => {
      clients.delete(ws2);
      console.log("Client disconnected from WebSocket");
    });
    ws2.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws2);
    });
  });
  function broadcast(message) {
    const messageStr = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      } else {
        clients.delete(client);
      }
    });
  }
  async function sendQueueUpdate() {
    try {
      const [queue, stats, activeEntry] = await Promise.all([
        storage.getQueueByPosition(),
        storage.getQueueStats(),
        storage.getActiveEntry()
      ]);
      broadcast({
        type: "queue_update",
        data: {
          queue: queue.map((entry) => ({
            ...entry,
            referralCode: entry.isActive ? entry.referralCode : maskReferralCode(entry.referralCode)
          })),
          stats,
          activeEntry
        }
      });
    } catch (error) {
      console.error("Error sending queue update:", error);
    }
  }
  function maskReferralCode(code) {
    if (code.length <= 6) return "***" + code.slice(-3);
    return "***" + code.slice(-6);
  }
  function getClientIp(req) {
    return req.headers["x-forwarded-for"]?.split(",")[0] || req.headers["x-real-ip"] || req.connection.remoteAddress || req.socket.remoteAddress || "127.0.0.1";
  }
  app2.get("/api/queue", async (req, res) => {
    try {
      const [queue, stats, activeEntry] = await Promise.all([
        storage.getQueueByPosition(),
        storage.getQueueStats(),
        storage.getActiveEntry()
      ]);
      const maskedQueue = queue.map((entry) => ({
        ...entry,
        referralCode: entry.isActive ? entry.referralCode : maskReferralCode(entry.referralCode)
      }));
      res.json({
        queue: maskedQueue,
        stats,
        activeEntry
      });
    } catch (error) {
      console.error("Error fetching queue:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.post("/api/queue", async (req, res) => {
    try {
      const clientIp = getClientIp(req);
      const validatedData = insertQueueEntrySchema.parse(req.body);
      const existingEntry = await storage.getEntryByIp(clientIp);
      if (existingEntry && !existingEntry.isCompleted) {
        return res.status(400).json({
          message: "Ya tienes un c\xF3digo en la cola. Solo se permite un c\xF3digo por IP."
        });
      }
      const newEntry = await storage.addToQueue(validatedData, clientIp);
      await sendQueueUpdate();
      res.status(201).json(newEntry);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Datos inv\xE1lidos",
          errors: error.errors
        });
      }
      console.error("Error adding to queue:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Error interno del servidor" });
    }
  });
  app2.post("/api/queue/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const clientIp = getClientIp(req);
      const entry = await storage.getEntryByIp(clientIp);
      if (!entry || entry.id !== id) {
        return res.status(403).json({ message: "No tienes permiso para completar esta entrada" });
      }
      const success = await storage.markCompleted(id);
      if (!success) {
        return res.status(404).json({ message: "Entrada no encontrada" });
      }
      await sendQueueUpdate();
      res.json({ message: "Entrada marcada como completada" });
    } catch (error) {
      console.error("Error completing entry:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.get("/api/my-entry", async (req, res) => {
    try {
      const clientIp = getClientIp(req);
      const entry = await storage.getEntryByIp(clientIp);
      if (!entry) {
        return res.status(404).json({ message: "No tienes ninguna entrada en la cola" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching user entry:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  setInterval(async () => {
    try {
      const expiredEntries = await storage.getExpiredEntries();
      for (const entry of expiredEntries) {
        await storage.removeExpiredEntry(entry.id);
        console.log(`Expired entry removed: ${entry.id}`);
      }
      if (expiredEntries.length > 0) {
        await storage.activateNextEntry();
        await sendQueueUpdate();
      }
    } catch (error) {
      console.error("Error processing expired entries:", error);
    }
  }, 6e4);
  return httpServer;
}

// server/index-render.ts
import cors2 from "cors";
var app = express();
app.use(cors2({
  origin: [
    /\.infinityfreeapp\.com$/,
    /\.000webhostapp\.com$/,
    /\.onrender\.com$/,
    /\.netlify\.app$/,
    /\.vercel\.app$/,
    ...process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(",") : []
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      console.log(logLine);
    }
  });
  next();
});
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
(async () => {
  try {
    const server = await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Error:", err);
      res.status(status).json({ message });
    });
    app.use("*", (req, res) => {
      res.status(404).json({ message: "Route not found" });
    });
    const port = parseInt(process.env.PORT || "8000", 10);
    server.listen({
      port,
      host: "0.0.0.0"
    }, () => {
      console.log(`\u{1F680} Temu Referidos Backend serving on port ${port}`);
      console.log(`\u{1F4CA} Database URL configured: ${!!process.env.DATABASE_URL}`);
      console.log(`\u{1F310} Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
