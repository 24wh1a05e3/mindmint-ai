import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfParseModule = await import("pdf-parse");
const pdfParse = pdfParseModule.default || pdfParseModule;
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Validate API key on startup
if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️  WARNING: GEMINI_API_KEY is not set in environment variables!");
  console.warn("Please set GEMINI_API_KEY to use the AI features.");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF uploaded." });
    }

    const buffer = fs.readFileSync(req.file.path);
    const pdf = await pdfParse(buffer);

    fs.unlinkSync(req.file.path);

    res.json({ success: true, text: pdf.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Unable to read PDF." });
  }
});

app.post("/generate", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "API key not configured. Please set GEMINI_API_KEY in environment variables.",
      });
    }

    const { prompt } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "No response generated.";
    res.json({ result: text });
  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({
      error: error.message || "Failed to generate content. Check API key and try again.",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.listen(PORT, () => {
  console.log(`🚀 Server Running`);
  console.log(`http://localhost:${PORT}`);
});
