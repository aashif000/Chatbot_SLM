import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get chat history
  app.get("/api/messages", async (_req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  // Add new message
  app.post("/api/messages", async (req, res) => {
    const result = insertMessageSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Invalid message format" });
      return;
    }

    const message = await storage.createMessage(result.data);
    res.json(message);
  });

  // Clear chat history
  app.delete("/api/messages", async (_req, res) => {
    await storage.clearMessages();
    res.json({ success: true });
  });

  // Wikipedia API proxy with better error handling
  app.get("/api/wiki/search", async (req, res) => {
    const query = z.string().safeParse(req.query.q);
    if (!query.success) {
      res.status(400).json({ error: "Invalid query" });
      return;
    }

    try {
      // First get the main article content
      const mainParams = new URLSearchParams({
        action: 'query',
        format: 'json',
        prop: 'extracts|categories|links',
        exintro: '1',
        explaintext: '1',
        exsectionformat: 'wiki',
        titles: query.data,
        pllimit: '10',
        plnamespace: '0',
        origin: '*'
      });

      const mainResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?${mainParams.toString()}`
      );

      if (!mainResponse.ok) {
        throw new Error(`Wikipedia API error: ${mainResponse.statusText}`);
      }

      const mainData = await mainResponse.json();

      // Then get the full article content for sections
      const fullParams = new URLSearchParams({
        action: 'query',
        format: 'json',
        prop: 'extracts',
        titles: query.data,
        explaintext: '1',
        origin: '*'
      });

      const fullResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?${fullParams.toString()}`
      );

      if (!fullResponse.ok) {
        throw new Error(`Wikipedia API error: ${fullResponse.statusText}`);
      }

      const fullData = await fullResponse.json();

      res.json({
        main: mainData,
        full: fullData
      });
    } catch (error) {
      console.error('Wikipedia API error:', error);
      res.status(500).json({ 
        error: "Failed to fetch from Wikipedia",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}