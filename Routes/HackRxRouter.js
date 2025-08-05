const express = require("express");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// Initialize Google Generative AI with Gemini API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Define POST route to process PDF and get answers from Gemini
router.post("/run", async (req, res) => {
  try {
    const { documents, questions } = req.body;

    // Step 1: Download the PDF file as a binary buffer
    const pdfBuffer = (
      await axios.get(documents, { responseType: "arraybuffer" })
    ).data;

    // Step 2: Extract text content from the PDF buffer
    const parsedData = await pdfParse(pdfBuffer);
    const pdfText = parsedData.text;

    // Step 3: Construct a prompt to ask Gemini based on the PDF and questions
    const prompt = `
You are a professional insurance analyst. Based on the policy document provided below, carefully read and answer each question in detail.

- Your response must ONLY be a numbered list of answers.
- Each answer should be **well-explained**, clear, and written in full sentences.
- DO NOT include any introduction or conclusion — only the answers.

PDF TEXT:
"""
${pdfText}
"""

QUESTIONS:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
`;

    // Step 4: Send prompt to Gemini model and get the response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Step 5: Parse numbered answers from the response text
    const answers = text
      .split(/\n+/) // Split on new lines
      .map((line) => line.trim()) // Remove extra spaces
      .filter((line) => /^\d+\./.test(line)) // Keep lines starting with "1.", "2.", etc.
      .map((line) => line.replace(/^\d+\.\s*/, "")); // Remove the number prefix

    // Step 6: Return the answers as JSON response
    res.json({ answers });
  } catch (error) {
    console.error("Error processing PDF:", error.message);
    res.status(500).json({ error: "Failed to process document" });
  }
});

// Export the router to use in your main app
module.exports = router;
