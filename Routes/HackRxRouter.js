const express = require("express");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// Initialize Google Generative AI with Gemini API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// 🔧 Utility: Preprocess PDF text to limit token usage and improve speed
const preprocessText = (text, maxChars = 12000) => {
  // Remove extra whitespace and trim length
  return text.replace(/\s+/g, " ").trim().slice(0, maxChars);
};

// 🔧 Utility: Build prompt for Gemini
const buildPrompt = (pdfText, questions) => {
  return `
You are a professional insurance analyst. Based on the policy document provided below, carefully read and answer each question in detail.

Instructions:
- Your response must ONLY be a numbered list of answers.
- Each answer should be clear, well-explained, and in full sentences.
- Include reasoning by referencing relevant clauses or sections in the PDF where possible.
- Do NOT include any introduction or summary — only answers.
- Keep your answers concise and accurate.

PDF TEXT:
"""
${pdfText}
"""

QUESTIONS:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
`;
};

// POST route to process PDF and get Gemini answers
router.post("/run", async (req, res) => {
  try {
    const { documents, questions } = req.body;

    // Step 1: Download PDF from provided URL
    const pdfBuffer = (
      await axios.get(documents, { responseType: "arraybuffer" })
    ).data;

    // Step 2: Extract and preprocess PDF text
    const parsedData = await pdfParse(pdfBuffer);
    const rawText = parsedData.text;
    const pdfText = preprocessText(rawText);

    // Step 3: Build optimized prompt for Gemini
    const prompt = buildPrompt(pdfText, questions);

    // Step 4: Send prompt to Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Step 5: Parse structured answers from Gemini response
    const answers = text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => /^\d+\./.test(line))
      .map((line) => line.replace(/^\d+\.\s*/, ""));

    // Step 6: Return final output
    res.json({ answers });
  } catch (error) {
    console.error("Error processing PDF:", error.message);
    res.status(500).json({ error: "Failed to process document" });
  }
});

module.exports = router;
