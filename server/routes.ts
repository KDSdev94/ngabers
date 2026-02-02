import type { Express } from "express";
import type { Server } from "http";
import { api } from "@shared/routes";
import { z } from "zod";

const BASE_API_URL = "https://zeldvorik.ru/apiv3/api.php";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Proxy for listing categories
  app.get(api.movies.list.path, async (req, res) => {
    try {
      const category = req.params.category;
      const page = req.query.page || 1;
      
      // Map our category names to API actions
      // 1. Trending: /api.php?action=trending&page=1
      // 2. Film Indonesia: /api.php?action=indonesian-movies&page=1
      // 3. Drama Indonesia: /api.php?action=indonesian-drama&page=1
      // 4. K-Drama: /api.php?action=kdrama&page=1
      // 5. Short TV: /api.php?action=short-tv&page=1
      // 6. Anime: /api.php?action=anime&page=1
      
      const response = await fetch(`${BASE_API_URL}?action=${category}&page=${page}`);
      if (!response.ok) {
        throw new Error(`Upstream API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('API Proxy Error:', error);
      res.status(500).json({ message: "Failed to fetch data from upstream API" });
    }
  });

  // Proxy for search
  app.get(api.movies.search.path, async (req, res) => {
    try {
      const q = req.query.q as string;
      if (!q) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      const response = await fetch(`${BASE_API_URL}?action=search&q=${encodeURIComponent(q)}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Search Proxy Error:', error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Proxy for details
  app.get(api.movies.detail.path, async (req, res) => {
    try {
      const path = req.query.path as string;
      if (!path) {
        return res.status(400).json({ message: "Query parameter 'path' is required" });
      }
      
      const response = await fetch(`${BASE_API_URL}?action=detail&detailPath=${encodeURIComponent(path)}`);
      const data = await response.json();
      
      // Unwrap data if it's nested under a 'data' property
      const finalData = data.data || data;
      res.json(finalData);
    } catch (error) {
      console.error('Detail Proxy Error:', error);
      res.status(500).json({ message: "Failed to fetch movie details" });
    }
  });

  return httpServer;
}
