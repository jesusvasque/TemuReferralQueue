// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import { insertQueueEntrySchema } from "../shared/schema"; // Ajusta la ruta
import { z } from "zod";
import { storage } from "./storage"; // Ajusta la ruta también

export async function registerRoutes(app) {
  // Aquí NO configures cors porque ya está configurado en index-render.ts

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = new Set();

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("Client connected to WebSocket");
    sendQueueUpdate();

    ws.on("close", () => {
      clients.delete(ws);
      console.log("Client disconnected from WebSocket");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws);
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

  app.get("/api/queue", async (req, res) => {
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

  app.post("/api/queue", async (req, res) => {
    try {
      const clientIp = getClientIp(req);
      const validatedData = insertQueueEntrySchema.parse(req.body);
      const existingEntry = await storage.getEntryByIp(clientIp);
      if (existingEntry && !existingEntry.isCompleted) {
        return res.status(400).json({
          message: "Ya tienes un código en la cola. Solo se permite un código por IP."
        });
      }
      const newEntry = await storage.addToQueue(validatedData, clientIp);
      await sendQueueUpdate();
      res.status(201).json(newEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Datos inválidos",
          errors: error.errors
        });
      }
      console.error("Error adding to queue:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Error interno del servidor" });
    }
  });

  app.post("/api/queue/:id/complete", async (req, res) => {
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

  app.get("/api/my-entry", async (req, res) => {
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

  // Limpieza periódica de entradas expiradas
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
  }, 60000);

  return httpServer;
}
