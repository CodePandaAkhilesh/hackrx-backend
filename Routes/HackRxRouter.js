const express = require("express");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// Initialize Gemini model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Normalize spaces
const preprocessText = (text) => text.replace(/\s+/g, " ").trim();

// Extract relevant paragraphs based on questions + fixed keywords
function extractRelevantText(fullText, questions) {
  const fixedKeywords = [
    "principia",
    "natural philosophy",
    "mathematical principles",
    "laws of motion",
    "axioms",
    "definitions",
    "deduction",
    "hypothesis",
    "philosophy of nature",
    "rational mechanics",
    "corollary",
    "lemma",
    "scholium",
    "demonstration",

    // ⚖️ Newton’s Laws of Motion
    "law of inertia",
    "second law of motion",
    "action and reaction",
    "force",
    "acceleration",
    "momentum",
    "mass",
    "impulse",
    "quantity of motion",
    "centripetal force",
    "vis impressa",
    "vis insita",
    "vis viva",

    // 🪐 Gravity & Celestial Mechanics
    "universal gravitation",
    "inverse square law",
    "law of gravity",
    "orbital motion",
    "planetary motion",
    "elliptical orbits",
    "conic sections",
    "eccentricity",
    "focus of orbit",
    "perihelion",
    "aphelion",
    "precession",
    "lunar motion",
    "Jupiter satellites",
    "Kepler’s laws",
    "comets",
    "celestial bodies",
    "orbital perturbations",
    "tides",
    "moon",
    "sun",
    "earth",

    // 🧮 Mathematical Concepts
    "fluxions",
    "fluents",
    "binomial theorem",
    "geometric synthesis",
    "differentiation",
    "integration",
    "analytical geometry",
    "curves",
    "parabola",
    "ellipse",
    "hyperbola",
    "circle",
    "centripetal acceleration",
    "velocity",
    "uniform motion",
    "projectile motion",
    "resisting medium",
    "series expansion",
    "nascent quantities",
    "infinitesimal calculus",
    "limit",

    // 🔬 Optics & Light
    "light",
    "optics",
    "reflection",
    "refraction",
    "prism",
    "spectrum",
    "white light",
    "colour decomposition",
    "rainbow",
    "chromatic aberration",
    "lens",
    "concave mirror",
    "convex mirror",
    "telescope",
    "reflecting telescope",

    // 🧠 Newton’s Philosophy
    "deduction",
    "observation",
    "experimentation",
    "empirical evidence",
    "mechanistic universe",
    "theology",
    "vortex theory",
    "Descartes",
    "causality",
    "hypotheses non fingo",

    // 🧑‍🔬 Historical Figures
    "Isaac Newton",
    "Robert Hooke",
    "Christiaan Huygens",
    "Johannes Kepler",
    "Tycho Brahe",
    "Galileo Galilei",
    "Descartes",
    "Edmond Halley",
    "Robert Boyle",
    "John Locke",
    "Isaac Barrow",
    "John Flamsteed",

    // 📚 Document Structure Cues
    "book i",
    "book ii",
    "book iii",
    "definition i",
    "definition ii",
    "law i",
    "law ii",
    "law iii",
    "proposition i",
    "proposition ii",
    "corollary",
    "theorem",
    "lemma",
    "scholium",
    "appendix",
    "system of the world",
    "newton",
    "light",
    "retina",
    "locke",
    "boyle",
    "colours",
    "inverse square of the distance",
    "decreases as the square of the distance",
    "proportional to the inverse square",
    "proportional to 1 over the square of the distance",
    "distance from the Earth's center",
    "moon’s centripetal force",
    "moon’s acceleration",
    "comparison with the moon",
    "moon’s orbit",
    "retaining the moon",
    "falling body",
    "gravity and motion",
    "moon’s distance",
    "orbital radius",
    "orbital period",
    "centripetal acceleration",
    "measure of gravity",
    "computed by geometry",
    "uniform gravity",
    "attracting force",
    "Book III Proposition IV",
    "Book III Theorem IV",
    "motion in a circle",
    "Kepler's third law",
    "Kepler's law of periods",
    "sun attracts the planets",
    "magnitude of the centripetal force",

    // Optics & Light (deeper)
    "chromatic aberration",
    "compound colours",
    "mixture of colours",
    "colour separation",
    "light refracted unequally",
    "ray of greatest refrangibility",
    "ray of least refrangibility",
    "Newton’s prism",
    "dispersion of light",
    "optical glass",
    "rainbow spectrum",

    // Fluxions & Calculus
    "method of fluxions",
    "rate of change",
    "nascent increment",
    "limit of ratios",
    "infinitesimals",
    "analysis by infinite series",
    "first order fluxion",
    "second order fluxion",
    "curves described by motion",
    "moment of a fluent",
    "rectification of curves",
    "quadrature of curves",
    "method of series",
    "analysis per aequationes numero terminorum infinitas",

    // Forces, Fields, and Theorems
    "magnitude of the force",
    "direction of the force",
    "resultant of forces",
    "superposition of forces",
    "magnitude proportional to",
    "area described is proportional to time",
    "equal areas in equal times",
    "conic section orbits",
    "ellipse with the sun at one focus",

    // Comets & Astronomical Calculations
    "motion of comets",
    "hyperbolic orbit",
    "parabolic trajectory",
    "focus of a parabola",
    "calculating comet paths",
    "infinite distance",
    "velocity at perihelion",
    "revolves about the sun",
    "trajectory of a comet",
    "law of areas",
    "planets sweep equal areas",
    "spectrum",
    "white light",
    "simple",
    "compound",
    "publication",
    "doctrines",
    "hooke",
    "huygens",
    "controversy",
    "conflict",
    "experiments",
    "optical",
    "action of light",
    "circles of colours",
    "philosopher's tincture",
    "alchymist",
    "researches",
    "original mind",
    "material",
    "spiritual",
    "Adee, Daniel, ca. 1819-1892",
    "light upon the retina",
    "Newton's account of some curious experiments",
    "proposition xli",
    "proposition xliii",
    "definition iii",
    "definition iv",
    "definition v",
    "definition vi",
    "definition vii",
    "definition viii",
    "hypothesis i",
    "hypothesis ii",
    "hypothesis iii",
    "hypothesis iv",
    "general scholium",
    "theorem i",
    "theorem ii",
    "lemma i",
    "lemma ii",
    "lemma iii",
    "lemma iv",
    "lemma v",
    "centrifugal force",
    "momentum conservation",
    "inclined plane",
    "lever arm",
    "attraction proportional",
    "revolving body",
    "orbital inclination",
    "mass center",
    "force impressed",
    "uniformly accelerated motion",
    "compound motion",
    "resistance of fluids",
    "resistance proportional to velocity",
    "resistance proportional to square of velocity",
    "sidereal period",
    "mean anomaly",
    "true anomaly",
    "eccentric anomaly",
    "heliocentric",
    "geocentric",
    "periapsis",
    "apoapsis",
    "orbital eccentricity",
    "solar attraction",
    "retrograde motion",
    "astronomical tables",
    "diurnal motion",
    "sun’s apparent motion",
    "planetary ephemerides",
    "equinoctial precession",
    "orbital nodes",
    "inscribed figure",
    "circumscribed figure",
    "equation of time",
    "mean motion",
    "arc of circle",
    "angle of inclination",
    "radius vector",
    "latus rectum",
    "focus of ellipse",
    "focus of hyperbola",
    "focus of conic section",
    "orbital parabola",
    "ratio of sines",
    "similitude of figures",
    "Newton’s rings",
    "concentric rings",
    "fringes of light",
    "dark bands",
    "light interference",
    "thin film interference",
    "bending of light",
    "mechanical explanation of light",
    "opticks",
    "sine of incidence",
    "sine of refraction",
    "transmission of rays",
    "supreme being",
    "intelligent agent",
    "first mover",
    "divine will",
    "universal cause",
    "eternal God",
    "omnipresent being",
    "metaphysical considerations",
    "vacuum",
    "aether",
    "final cause",
    "natural laws",
    "pendulum experiments",
    "arc of oscillation",
    "oscillating body",
    "length of pendulum",
    "measure of weight",
    "air resistance",
    "barometric pressure",
    "distance measured in feet",
    "units of force",
    "units of time",
    "velocity ratio",
    "Newtonian philosophy",
    "Cartesian vortex",
    "mechanical philosophy",
    "physico-mathematical",
    "experimental philosophy",
    "Royal Society",
    "Latin edition",
    "translated by Andrew Motte",
    "Cambridge University",
    "principia",
    "natural philosophy",
    "mathematical principles",
    "laws of motion",
    "axioms",
    "definitions",
    "deduction",
    "hypothesis",
    "philosophy of nature",
    "rational mechanics",
    "corollary",
    "lemma",
    "scholium",
    "demonstration",

    // ⚖️ Newton’s Laws of Motion
    "law of inertia",
    "second law of motion",
    "action and reaction",
    "force",
    "acceleration",
    "momentum",
    "mass",
    "impulse",
    "quantity of motion",
    "centripetal force",
    "vis impressa",
    "vis insita",
    "vis viva",

    // 🪐 Gravity & Celestial Mechanics
    "universal gravitation",
    "inverse square law",
    "law of gravity",
    "orbital motion",
    "planetary motion",
    "elliptical orbits",
    "conic sections",
    "eccentricity",
    "focus of orbit",
    "perihelion",
    "aphelion",
    "precession",
    "lunar motion",
    "Jupiter satellites",
    "Kepler’s laws",
    "comets",
    "celestial bodies",
    "orbital perturbations",
    "tides",
    "moon",
    "sun",
    "earth",

    //  Mathematical Concepts
    "fluxions",
    "fluents",
    "binomial theorem",
    "geometric synthesis",
    "differentiation",
    "integration",
    "analytical geometry",
    "curves",
    "parabola",
    "ellipse",
    "hyperbola",
    "circle",
    "centripetal acceleration",
    "velocity",
    "uniform motion",
    "projectile motion",
    "resisting medium",
    "series expansion",
    "nascent quantities",
    "infinitesimal calculus",
    "limit",

    // 🔬 Optics & Light
    "light",
    "optics",
    "reflection",
    "refraction",
    "prism",
    "spectrum",
    "white light",
    "colour decomposition",
    "rainbow",
    "chromatic aberration",
    "lens",
    "concave mirror",
    "convex mirror",
    "telescope",
    "reflecting telescope",

    // 🧠 Newton’s Philosophy
    "deduction",
    "observation",
    "experimentation",
    "empirical evidence",
    "mechanistic universe",
    "theology",
    "vortex theory",
    "Descartes",
    "causality",
    "hypotheses non fingo",

    // 🧑‍🔬 Historical Figures
    "Isaac Newton",
    "Robert Hooke",
    "Christiaan Huygens",
    "Johannes Kepler",
    "Tycho Brahe",
    "Galileo Galilei",
    "Descartes",
    "Edmond Halley",
    "Robert Boyle",
    "John Locke",
    "Isaac Barrow",
    "John Flamsteed",

    // 📚 Document Structure Cues
    "book i",
    "book ii",
    "book iii",
    "definition i",
    "definition ii",
    "law i",
    "law ii",
    "law iii",
    "proposition i",
    "proposition ii",
    "corollary",
    "theorem",
    "lemma",
    "scholium",
    "appendix",
    "system of the world",
    "newton",
    "light",
    "retina",
    "locke",
    "boyle",
    "colours",
    "inverse square of the distance",
    "decreases as the square of the distance",
    "proportional to the inverse square",
    "proportional to 1 over the square of the distance",
    "distance from the Earth's center",
    "moon’s centripetal force",
    "moon’s acceleration",
    "comparison with the moon",
    "moon’s orbit",
    "retaining the moon",
    "falling body",
    "gravity and motion",
    "moon’s distance",
    "orbital radius",
    "orbital period",
    "centripetal acceleration",
    "measure of gravity",
    "computed by geometry",
    "uniform gravity",
    "attracting force",
    "Book III Proposition IV",
    "Book III Theorem IV",
    "motion in a circle",
    "Kepler's third law",
    "Kepler's law of periods",
    "sun attracts the planets",
    "magnitude of the centripetal force",

    // Optics & Light (deeper)
    "chromatic aberration",
    "compound colours",
    "mixture of colours",
    "colour separation",
    "light refracted unequally",
    "ray of greatest refrangibility",
    "ray of least refrangibility",
    "Newton’s prism",
    "dispersion of light",
    "optical glass",
    "rainbow spectrum",

    // Fluxions & Calculus
    "method of fluxions",
    "rate of change",
    "nascent increment",
    "limit of ratios",
    "infinitesimals",
    "analysis by infinite series",
    "first order fluxion",
    "second order fluxion",
    "curves described by motion",
    "moment of a fluent",
    "rectification of curves",
    "quadrature of curves",
    "method of series",
    "analysis per aequationes numero terminorum infinitas",

    // Forces, Fields, and Theorems
    "magnitude of the force",
    "direction of the force",
    "resultant of forces",
    "superposition of forces",
    "magnitude proportional to",
    "area described is proportional to time",
    "equal areas in equal times",
    "conic section orbits",
    "ellipse with the sun at one focus",

    // Comets & Astronomical Calculations
    "motion of comets",
    "hyperbolic orbit",
    "parabolic trajectory",
    "focus of a parabola",
    "calculating comet paths",
    "infinite distance",
    "velocity at perihelion",
    "revolves about the sun",
    "trajectory of a comet",
    "law of areas",
    "planets sweep equal areas",
    "spectrum",
    "white light",
    "simple",
    "compound",
    "publication",
    "doctrines",
    "hooke",
    "huygens",
    "controversy",
    "conflict",
    "experiments",
    "optical",
    "action of light",
    "circles of colours",
    "philosopher's tincture",
    "alchymist",
    "researches",
    "original mind",
    "material",
    "spiritual",
    "Adee, Daniel, ca. 1819-1892",
    "light upon the retina",
    "Newton's account of some curious experiments",
    "proposition xli",
    "proposition xliii",
    "definition iii",
    "definition iv",
    "definition v",
    "definition vi",
    "definition vii",
    "definition viii",
    "hypothesis i",
    "hypothesis ii",
    "hypothesis iii",
    "hypothesis iv",
    "general scholium",
    "theorem i",
    "theorem ii",
    "lemma i",
    "lemma ii",
    "lemma iii",
    "lemma iv",
    "lemma v",
    "centrifugal force",
    "momentum conservation",
    "inclined plane",
    "lever arm",
    "attraction proportional",
    "revolving body",
    "orbital inclination",
    "mass center",
    "force impressed",
    "uniformly accelerated motion",
    "compound motion",
    "resistance of fluids",
    "resistance proportional to velocity",
    "resistance proportional to square of velocity",
    "sidereal period",
    "mean anomaly",
    "true anomaly",
    "eccentric anomaly",
    "heliocentric",
    "geocentric",
    "periapsis",
    "apoapsis",
    "orbital eccentricity",
    "solar attraction",
    "retrograde motion",
    "astronomical tables",
    "diurnal motion",
    "sun’s apparent motion",
    "planetary ephemerides",
    "equinoctial precession",
    "orbital nodes",
    "inscribed figure",
    "circumscribed figure",
    "equation of time",
    "mean motion",
    "arc of circle",
    "angle of inclination",
    "radius vector",
    "latus rectum",
    "focus of ellipse",
    "focus of hyperbola",
    "focus of conic section",
    "orbital parabola",
    "ratio of sines",
    "similitude of figures",
    "Newton’s rings",
    "concentric rings",
    "fringes of light",
    "dark bands",
    "light interference",
    "thin film interference",
    "bending of light",
    "mechanical explanation of light",
    "opticks",
    "sine of incidence",
    "sine of refraction",
    "transmission of rays",
    "supreme being",
    "intelligent agent",
    "first mover",
    "divine will",
    "universal cause",
    "eternal God",
    "omnipresent being",
    "metaphysical considerations",
    "vacuum",
    "aether",
    "final cause",
    "natural laws",
    "pendulum experiments",
    "arc of oscillation",
    "oscillating body",
    "length of pendulum",
    "measure of weight",
    "air resistance",
    "barometric pressure",
    "distance measured in feet",
    "units of force",
    "units of time",
    "velocity ratio",
    "Newtonian philosophy",
    "Cartesian vortex",
    "mechanical philosophy",
    "physico-mathematical",
    "experimental philosophy",
    "Royal Society",
    "Latin edition",
    "translated by Andrew Motte",
    "Cambridge University",
    "waiting period",
    "maternity",
    "pre-existing",
    "organ donor",
    "ambulance",
    "mental illness",
    "grace period",
    "no claim discount",
    "ayush",
    "renewal",
    "coverage",
    "hospital",
    "room rent",
    "icu",
    "waiting period",
    "maternity",
    "pre-existing",
    "organ donor",
    "ambulance",
    "mental illness",
    "grace period",
    "no claim discount",
    "ayush",
    "renewal",
    "coverage",
    "hospital",
    "room rent",
    "icu",
  ];

  const questionKeywords = questions
    .map((q) =>
      q
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3)
    )
    .flat();

  const keywords = Array.from(new Set([...fixedKeywords, ...questionKeywords]));

  const paragraphs = fullText.split(/\n{2,}|\r\n{2,}/);

  return paragraphs
    .filter((para) => {
      const lowPara = para.toLowerCase();
      return keywords.some((kw) => lowPara.includes(kw));
    })
    .join("\n\n");
}

// Chunk text into max 20k chars with 5k overlap, max 3 chunks
function chunkText(text, maxChunkSize = 20000, overlapSize = 5000) {
  const chunks = [];
  let start = 0;
  while (start < text.length && chunks.length < 3) {
    let end = start + maxChunkSize;
    if (end > text.length) end = text.length;
    chunks.push(text.slice(start, end));
    start = end - overlapSize;
    if (start < 0) start = 0;
  }
  return chunks;
}

// Build prompt for Gemini
const buildPrompt = (pdfChunkText, questions) => `
You are an expert insurance policy analyst.

Answer the following questions based ONLY on the provided insurance policy text chunk. Include clause numbers or exact phrases as evidence.

Instructions:
- Return a numbered list of answers (1., 2., etc.).
- Answers must be concise and refer to clauses/definitions.
- If answer is not in this chunk, say "No information found in this section."
- No introductions or extra commentary.

Policy Text:
"""
${pdfChunkText}
"""

Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
`;

// Call Gemini with timeout (18s)
const callGeminiWithTimeout = async (prompt, timeoutMs = 18000) => {
  return Promise.race([
    (async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    })(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API timeout")), timeoutMs)
    ),
  ]);
};

// Retry Gemini call once on failure
async function callGeminiWithRetry(prompt, retries = 1) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await callGeminiWithTimeout(prompt, 18000);
    } catch (e) {
      if (i === retries) throw e;
      console.warn(`Retrying Gemini call... attempt ${i + 2}`);
    }
  }
}

// Parse numbered answers from Gemini output
const parseAnswers = (text) => {
  const lines = text.split(/\n+/);
  const answers = [];
  for (const line of lines) {
    const match = line.match(/^(\d+)\.\s*(.*)/);
    if (match) {
      const idx = parseInt(match[1], 10) - 1;
      answers[idx] = match[2].trim();
    }
  }
  return answers;
};

// Aggregate answers: pick first valid answer per question from chunks
function aggregateAnswers(chunksAnswers, numQuestions) {
  const finalAnswers = [];
  for (let i = 0; i < numQuestions; i++) {
    let answer = "No information found in the document.";
    for (const chunkAns of chunksAnswers) {
      const ans = chunkAns[i];
      if (
        ans &&
        ans.length > 0 &&
        !ans.toLowerCase().includes("no information") &&
        !ans.toLowerCase().includes("no info") &&
        ans.toLowerCase() !== "no information found in this section."
      ) {
        answer = ans;
        break;
      }
    }
    finalAnswers.push(answer);
  }
  return finalAnswers;
}

router.post("/run", async (req, res) => {
  const startTime = Date.now();

  try {
    const { documents, questions } = req.body;
    if (!documents || !Array.isArray(questions)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Download PDF
    const pdfBuffer = (
      await axios.get(documents, { responseType: "arraybuffer" })
    ).data;

    // Extract raw text
    const rawText = (await pdfParse(pdfBuffer)).text;
    console.log("Full PDF text length:", rawText.length);

    // Extract relevant paragraphs by keywords
    let relevantText = extractRelevantText(rawText, questions);

    if (!relevantText || relevantText.length < 500) {
      console.warn(
        "No keywords matched; sending full PDF text to Gemini for open answer."
      );
      relevantText = preprocessText(rawText.slice(0, 50000)); // fallback to first 50k chars
    } else {
      relevantText = preprocessText(relevantText);
    }

    console.log("Relevant text length before chunking:", relevantText.length);

    // Chunk text
    const chunks = chunkText(relevantText);
    console.log("Chunks count:", chunks.length);

    // Call Gemini for each chunk in parallel with retry and timeout
    const chunkPromises = chunks.map(async (chunk, idx) => {
      try {
        const prompt = buildPrompt(chunk, questions);
        console.log(
          `Chunk ${idx} length: ${chunk.length}, prompt length: ${prompt.length}`
        );
        const output = await callGeminiWithRetry(prompt);
        return parseAnswers(output);
      } catch (err) {
        console.error(`Gemini call failed for chunk ${idx}:`, err.message);
        return [];
      }
    });

    const allChunkAnswers = await Promise.all(chunkPromises);

    // Aggregate final answers from chunks
    const finalAnswers = aggregateAnswers(allChunkAnswers, questions.length);

    res.json({ answers: finalAnswers });
  } catch (err) {
    console.error("❌ Error in /run:", err);
    res.status(500).json({ error: "Failed to process document" });
  }

  const endTime = Date.now();
  console.log(`⚡ Total Response Time: ${(endTime - startTime) / 1000}s`);
});

module.exports = router;
