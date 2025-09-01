import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all cafes
  app.get("/api/cafes", async (req, res) => {
    try {
      const cafes = await storage.getCafes();
      res.json(cafes);
    } catch (error) {
      console.error("Error fetching cafes:", error);
      res.status(500).json({ error: "Failed to fetch cafes" });
    }
  });

  // Search cafes
  app.get("/api/cafes/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const cafes = await storage.searchCafes(query);
      res.json(cafes);
    } catch (error) {
      console.error("Error searching cafes:", error);
      res.status(500).json({ error: "Failed to search cafes" });
    }
  });

  // Get single cafe
  app.get("/api/cafes/:id", async (req, res) => {
    try {
      const cafe = await storage.getCafe(req.params.id);
      if (!cafe) {
        return res.status(404).json({ error: "Cafe not found" });
      }
      res.json(cafe);
    } catch (error) {
      console.error("Error fetching cafe:", error);
      res.status(500).json({ error: "Failed to fetch cafe" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
