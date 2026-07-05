import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
const pdfParseModule = await import("pdf-parse");
const pdfParse = pdfParseModule.default || pdfParseModule;
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20 MB
    }
});
app.get("/", (req, res) => {
    res.send("✅ MindMint AI Backend Running");
});
app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No PDF uploaded."
            });
        }
        console.log("File uploaded:", req.file.originalname);

const buffer = fs.readFileSync(req.file.path);

console.log("Buffer size:", buffer.length);

const pdf = await pdfParse(buffer);

console.log("Extracted characters:", pdf.text.length);

fs.unlinkSync(req.file.path);

res.json({
    success: true,
    text: pdf.text
});
        fs.unlinkSync(req.file.path);
        res.json({
            success: true,
            text: pdf.text
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: "Unable to read PDF."
        });
    }
});
app.post("/generate", async (req, res) => {
    try {
        const { prompt } = req.body;

        console.log("Prompt received");

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        console.log(response);

        const text = response.text || "No response generated.";

        res.json({
            result: text
        });

    } catch (error) {
    console.error("Gemini Error:");
    console.error(error);

    if (error.response) {
        console.error(await error.response.text());
    }

    res.status(500).json({
        error: error.message
    });
}
});
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found."
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server Running`);
    console.log(`http://localhost:${PORT}`);
});