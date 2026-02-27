import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
  { html: "pitch-deck.html", pdf: "pitch-deck.pdf" },
  { html: "pitch-deck-en.html", pdf: "pitch-deck-en.pdf" },
  { html: "pitch-deck-en-v2.html", pdf: "pitch-deck-en-v2.pdf" },
  { html: "pitch-deck-en-v3.html", pdf: "pitch-deck-en-v3.pdf" },
  { html: "pitch-deck-v3.html", pdf: "pitch-deck-v3.pdf" },
  { html: "pitch-deck-v4.html", pdf: "pitch-deck-v4.pdf" },
];

async function generatePdf(browser, htmlFile, outputFile) {
  const htmlPath = path.resolve(__dirname, "../private", htmlFile);
  const outputPath = path.resolve(__dirname, "../private", outputFile);

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });

  const totalSlides = await page.evaluate(
    () => document.querySelectorAll(".slide").length
  );
  console.log(`[${htmlFile}] Found ${totalSlides} slides`);

  const screenshots = [];
  for (let i = 0; i < totalSlides; i++) {
    await page.evaluate((idx) => {
      // Hide nav dots and arrow hints for PDF
      document.querySelectorAll(".nav-dots, .arrow-hint").forEach(el => el.style.display = "none");
      document.querySelectorAll(".slide").forEach((s) => {
        s.classList.remove("active");
        s.style.opacity = "0";
        s.style.pointerEvents = "none";
      });
      const target = document.querySelectorAll(".slide")[idx];
      target.classList.add("active");
      target.style.opacity = "1";
      target.style.pointerEvents = "auto";
      // Force animations to show final state for slide 2 (bar chart)
      if (idx === 1) {
        const startedBar = target.querySelector(".bar.started");
        const finishedBar = target.querySelector(".bar.finished");
        if (startedBar) startedBar.style.height = "200px";
        if (finishedBar) finishedBar.style.height = "48px";
        // v4 uses .not-read / .read classes
        const notReadBar = target.querySelector(".bar.not-read");
        const readBar = target.querySelector(".bar.read");
        if (notReadBar) notReadBar.style.height = "220px";
        if (readBar) readBar.style.height = "50px";
      }
      // For demo slide, show characters entered with books on table
      if (idx === 3) {
        const badge = document.getElementById("readingBadge");
        if (badge) badge.style.opacity = "1";
        const userChar = document.getElementById("userChar");
        if (userChar) userChar.classList.add("entered");
        const userBook = document.getElementById("userBook");
        if (userBook) userBook.classList.add("visible");
      }
    }, i);

    await new Promise((r) => setTimeout(r, 800));

    const screenshot = await page.screenshot({ type: "png", encoding: "binary" });
    screenshots.push(screenshot);
    console.log(`  Captured slide ${i + 1}/${totalSlides}`);
  }

  // Create a new page for building the PDF
  const pdfPage = await browser.newPage();
  await pdfPage.setViewport({ width: 1280, height: 720 });

  const slidesHtml = screenshots
    .map((buf, i) => {
      const b64 = Buffer.from(buf).toString("base64");
      return `<div class="page${i > 0 ? " break" : ""}"><img src="data:image/png;base64,${b64}" /></div>`;
    })
    .join("\n");

  const pdfHtml = `<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; }
  html, body { background: #0a1628; overflow: hidden; }
  .page { width: 1280px; height: 720px; position: relative; overflow: hidden; }
  .page.break { page-break-before: always; }
  .page:last-child { page-break-after: avoid; }
  .page img { width: 100%; height: 100%; object-fit: contain; display: block; }
</style></head>
<body>${slidesHtml}</body></html>`;

  await pdfPage.setContent(pdfHtml, { waitUntil: "networkidle0" });

  await pdfPage.pdf({
    path: outputPath,
    width: "1280px",
    height: "720px",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  console.log(`PDF saved to: ${outputPath}`);
  await page.close();
  await pdfPage.close();
}

async function main() {
  const browser = await puppeteer.launch({ headless: true });

  for (const { html, pdf } of files) {
    await generatePdf(browser, html, pdf);
  }

  await browser.close();
  console.log("\nAll PDFs generated successfully!");
}

main().catch(console.error);
