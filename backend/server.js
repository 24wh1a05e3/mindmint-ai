import multer from "multer";
import fs from "fs";
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
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024
    }
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
app.post("/upload/pdf", upload.single("pdf"), async (req,res)=>{

    try{

        const buffer = fs.readFileSync(req.file.path);

        const pdf = await pdfParse(buffer);

        fs.unlinkSync(req.file.path);

        res.json({
            text: pdf.text
        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({
            error:"Unable to read PDF"
        });

    }

});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});