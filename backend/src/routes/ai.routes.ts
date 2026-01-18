import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

router.post("/run", async (req, res) => {
  const { prompt } = req.body;

  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL!,
    });

    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      return res.status(400).json({
        error: "Invalid JSON from AI",
        raw,
      });
    }

    res.json({ output: parsed });
  } catch (err: any) {
    console.error("AI Route Error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error", details: err });
  }
});

export default router;
