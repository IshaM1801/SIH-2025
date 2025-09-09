// utils/generateCertificate.js
const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");

// Load fonts
registerFont(path.join(__dirname, "../fonts/ARIAL.TTF"), { family: "Arial" });
registerFont(path.join(__dirname, "../fonts/Alice-Regular.ttf"), { family: "Alice" });

// Bold text effect like PIL
function drawTextBold(ctx, text, x, y, font, fill) {
  ctx.font = font;
  ctx.fillStyle = fill;

  // Draw text with 1px offsets for bold effect
  ctx.fillText(text, x - 1, y);
  ctx.fillText(text, x + 1, y);
  ctx.fillText(text, x, y - 1);
  ctx.fillText(text, x, y + 1);

  ctx.fillText(text, x, y); // actual
}

async function generateCertificate({ userName, issueTitle, location, resolutionDate }) {
  // Load template
  const templatePath = path.join(__dirname, "../templates/certificate_template.png");
  const template = await loadImage(templatePath);

  const canvas = createCanvas(template.width, template.height);
  const ctx = canvas.getContext("2d");

  // Draw template background
  ctx.drawImage(template, 0, 0);

  // Overlay dynamic text
  // Coordinates taken from PIL example
  drawTextBold(ctx, userName, 937, 756, "40px Alice", "black");

  ctx.font = "40px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(issueTitle, 550, 1149);
  ctx.fillText(location, 695, 1291);
  ctx.fillText(resolutionDate, 695, 1356);

  // Ensure output folder exists
  const outputDir = path.join(__dirname, "../certificates");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // Save file
  const sanitizedIssue = issueTitle.replace(/[^a-z0-9]/gi, "_").slice(0, 10);
  const outputPath = path.join(outputDir, `${userName}_${sanitizedIssue}.png`);
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputPath, buffer);

  return outputPath;
}

module.exports = { generateCertificate };