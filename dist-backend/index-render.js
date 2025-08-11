// server/index-render.ts
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { registerRoutes } from "./server/routes"; // Ajusta la ruta según tu estructura

const app = express();

app.use(cors({
  origin: [
    'http://referidostemuco.infinityfree.me',
    /\.infinityfreeapp\.com$/,
    /\.000webhostapp\.com$/,
    /\.onrender\.com$/,
    /\.netlify\.app$/,
    /\.vercel\.app$/,
    ...(process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(",") : [])
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware para loguear solicitudes API con tiempos
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: any;
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
        logLine = logLine.slice(0, 79) + "…";
      }
      console.log(logLine);
    }
  });
  next();
});

// Ruta de salud básica
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

(async () => {
  try {
    const httpServer = await registerRoutes(app);

    // Manejo de errores generales
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Error:", err);
      res.status(status).json({ message });
    });

    // Ruta catch-all para no encontradas
    app.use("*", (req, res) => {
      res.status(404).json({ message: "Route not found" });
    });

    const port = parseInt(process.env.PORT || "8000", 10);
    httpServer.listen({
      port,
      host: "0.0.0.0"
    }, () => {
      console.log(`🚀 Temu Referidos Backend serving on port ${port}`);
      console.log(`📊 Database URL configured: ${!!process.env.DATABASE_URL}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
