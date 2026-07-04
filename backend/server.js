import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
app.get("/", (req, res) => {
    res.send("MindMint AI Backend Running 🚀");
});
app.post("/generate", async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });
        res.json({
            result: response.text
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to generate response."
        });
    }
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});