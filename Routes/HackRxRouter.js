const express = require("express");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// Initialize Gemini 2.0 Flash model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// 🔧 Utility: Preprocess PDF text
const preprocessText = (text, maxChars = 10000) => {
  return text.replace(/\s+/g, " ").trim().slice(0, maxChars);
};

// 🔧 Prompt builder for detailed clause-based answers
const buildPrompt = (pdfText, questions) => {
  return `
You are an expert insurance policy analyst.

Your task is to answer each of the following questions based on the provided insurance policy text. Include clause numbers or exact phrases from the document as supporting evidence.

Instructions:
- Only return a numbered list of answers.
- Each answer should be concise but clearly reference specific clauses or definitions.
- Do not include any introduction, summary, or extra commentary.

Policy Text:
"""
${pdfText}
"""

Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
`;
};

// ✨ Gemini 2.0 API Call Handler
const callGemini = async (prompt) => {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

// 📥 POST /hackrx/run
router.post("/run", async (req, res) => {
  const startTime = Date.now();

  try {
    const { documents, questions } = req.body;
    if (!documents || !Array.isArray(questions)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Step 1: Download PDF
    const pdfBuffer = (
      await axios.get(documents, { responseType: "arraybuffer" })
    ).data;

    // Step 2: Extract and clean PDF text
    const rawText = (await pdfParse(pdfBuffer)).text;
    const pdfText = preprocessText(rawText);

    // Step 3: Generate Gemini prompt
    const prompt = buildPrompt(pdfText, questions);

    // Step 4: Get Gemini response
    const output = await callGemini(prompt);

    // Step 5: Parse response into answers
    const answers = output
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => /^\d+\./.test(line))
      .map((line) => line.replace(/^\d+\.\s*/, ""));

    // Step 6: Send result
    res.json({ answers });
  } catch (err) {
    console.error("❌ Gemini error:", err.message);
    res.status(500).json({ error: "Failed to process document" });
  }

  const endTime = Date.now();
  console.log(`⚡ Response Time: ${(endTime - startTime) / 1000}s`);
});

module.exports = router;
