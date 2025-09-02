import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all cafes
  app.get("/api/cafes", async (req, res) => {
    try {
      const latitude = req.query.lat ? parseFloat(req.query.lat as string) : 
                      req.query.latitude ? parseFloat(req.query.latitude as string) : undefined;
      const longitude = req.query.lng ? parseFloat(req.query.lng as string) : 
                       req.query.longitude ? parseFloat(req.query.longitude as string) : undefined;
      
      const cafes = await storage.getCafes(latitude, longitude);
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
      const latitude = req.query.lat ? parseFloat(req.query.lat as string) : 
                       req.query.latitude ? parseFloat(req.query.latitude as string) : undefined;
      const longitude = req.query.lng ? parseFloat(req.query.lng as string) : 
                        req.query.longitude ? parseFloat(req.query.longitude as string) : undefined;
      
      const cafes = await storage.searchCafes(query, latitude, longitude);
      res.json(cafes);
    } catch (error) {
      console.error("Error searching cafes:", error);
      res.status(500).json({ error: "Failed to search cafes" });
    }
  });

  // Get single cafe (basic info)
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

  // Get detailed cafe information
  app.get("/api/cafes/:id/details", async (req, res) => {
    try {
      const cafeDetails = await storage.getCafeDetails(req.params.id);
      if (!cafeDetails) {
        return res.status(404).json({ error: "Cafe not found" });
      }
      res.json(cafeDetails);
    } catch (error) {
      console.error("Error fetching cafe details:", error);
      res.status(500).json({ error: "Failed to fetch cafe details" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
