import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { PaymentGatewayService } from "./src/services/paymentGatewayService.ts";
import { generateThemedQuoteServer, processAIOperationsServer } from "./src/services/aiService.server.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      app: "Quoto Connect", 
      env: process.env.NODE_ENV || 'development',
      time: new Date().toISOString()
    });
  });

  // Module Financier API
  app.post("/api/finance/deposit/crypto", async (req, res) => {
    const { amount, currency, userId } = req.body;
    try {
      const result = await PaymentGatewayService.createNowPaymentsDeposit(amount, currency, `DEP_${userId}_${Date.now()}`);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/finance/deposit/local", async (req, res) => {
    const { amount, email, userId, phoneNumber } = req.body;
    try {
      const result = await PaymentGatewayService.initiateFlutterwavePayment(amount, email, `TX_${userId}_${Date.now()}`, phoneNumber);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/finance/withdraw", async (req, res) => {
    const { amount, method, userId, bankDetails } = req.body;
    try {
      const result = await PaymentGatewayService.initiateWithdrawal(amount, bankDetails, method);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Module API
  app.post("/api/ai/generate-quote", async (req, res) => {
    const { theme } = req.body;
    try {
      const quote = await generateThemedQuoteServer(theme || 'inspiration');
      res.json(quote);
    } catch (err: any) {
      console.error('AI Error:', err);
      res.status(500).json({ error: err.message || 'Erreur lors de la génération de la citation par l\'IA' });
    }
  });

  app.post("/api/ai/process", async (req, res) => {
    const { text, operation } = req.body;
    try {
      const result = await processAIOperationsServer(text, operation);
      res.json({ result });
    } catch (err: any) {
      console.error('AI Error:', err);
      res.status(500).json({ error: err.message || 'Erreur lors du traitement par l\'IA' });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
