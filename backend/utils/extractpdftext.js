const { PDFParse } = require("pdf-parse");

// pdf-parse v2: class-based API (v1 ka pdfParse(buffer) ab kaam nahi karta)
async function extractPdfText(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return (result.text || "")
      .replace(/-- \d+ of \d+ --/g, "") // page separators jo v2 add karta hai
      .replace(/\r/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } finally {
    await parser.destroy();
  }
}

module.exports = extractPdfText;