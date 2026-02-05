import { onRequest } from "firebase-functions/v2/https";
import { handleApiRequest } from "./handler";
import type { Request, Response } from "express";

// Firebase Function Entry Point (No Express in production)
export const api = onRequest({
  region: "us-central1",
  cors: true,
  timeoutSeconds: 300,
  memory: "256MiB"
}, async (req: any, res: any) => {
  try {
    const { path, method, query, body } = req;
    const result = await handleApiRequest(path, method, query, body);
    res.json(result);
  } catch (error: any) {
    console.error("API Error:", error);
    res.status(error.status || 500).json({
      message: error.message || "Internal Server Error"
    });
  }
});

// Local Development Server (Uses Express only for Vite middleware)
if (process.env.NODE_ENV !== "production" || !process.env.FUNCTION_NAME) {
  (async () => {
    const express = (await import("express")).default;
    const { createServer } = await import("http");
    const app = express();
    const httpServer = createServer(app);

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // API Routes for local dev
    app.use("/api", async (req, res) => {
      try {
        // Express .use() trims the mount point from req.path
        // We add it back or just use req.originalUrl/req.baseUrl
        const fullPath = "/api" + req.path;
        const result = await handleApiRequest(fullPath, req.method, req.query, req.body);
        res.json(result);
      } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message });
      }
    });

    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);

    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen({ port, host: "0.0.0.0" }, () => {
      console.log(`[Dev] serving on port ${port}`);
    });
  })();
}

