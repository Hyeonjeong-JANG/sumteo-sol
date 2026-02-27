import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
  { html: "pitch-deck-en.html", pdf: "pitch-deck-en-expanded.pdf" },
  { html: "pitch-deck.html", pdf: "pitch-deck-expanded.pdf" },
  { html: "pitch-deck-en-v2.html", pdf: "pitch-deck-en-v2-expanded.pdf" },
  { html: "pitch-deck-en-v3.html", pdf: "pitch-deck-en-v3-expanded.pdf" },
  { html: "pitch-deck-v3.html", pdf: "pitch-deck-v3-expanded.pdf" },
];

// Demo sub-states to capture for slide 4 (index 3)
const demoStates = [
  {
    name: "Reading Space",
    setup: () => {
      // State: User arrived, friend greeting, Start Focus button visible
      const badge = document.getElementById("readingBadge");
      if (badge) badge.style.opacity = "1";
      const badgeText = document.getElementById("badgeText");
      if (badgeText) badgeText.textContent = document.documentElement.lang === "en" ? "2 reading together" : "2명 함께 독서 중";
      const userChar = document.getElementById("userChar");
      if (userChar) userChar.classList.add("entered");
      const userBook = document.getElementById("userBook");
      if (userBook) userBook.classList.add("visible");
      // Start Focus button visible (default state)
    },
  },
  {
    name: "Timer Running",
    setup: () => {
      // State: Forest shrunk, timer visible at ~15:00, reading in progress
      const badge = document.getElementById("readingBadge");
      if (badge) badge.style.opacity = "1";
      const badgeText = document.getElementById("badgeText");
      if (badgeText) badgeText.textContent = document.documentElement.lang === "en" ? "2 reading together" : "2명 함께 독서 중";
      const userChar = document.getElementById("userChar");
      if (userChar) userChar.classList.add("entered");
      const userBook = document.getElementById("userBook");
      if (userBook) userBook.classList.add("visible");
      // Hide start button
      const startBtn = document.getElementById("startBtn");
      if (startBtn) startBtn.classList.add("hidden");
      // Shrink forest
      const forestScene = document.getElementById("forestScene");
      if (forestScene) forestScene.classList.add("shrunk");
      // Show timer at ~50% progress
      const timerSection = document.getElementById("timerSection");
      if (timerSection) { timerSection.classList.add("visible"); timerSection.style.opacity = "1"; timerSection.style.transform = "translateY(0)"; }
      const timerText = document.getElementById("timerText");
      if (timerText) timerText.textContent = "15:00";
      const timerLabel = document.getElementById("timerLabel");
      if (timerLabel) timerLabel.textContent = document.documentElement.lang === "en" ? "Reading..." : "독서 중...";
      // Show timer ring progress at 50%
      const circle = document.getElementById("timerCircle");
      if (circle) circle.style.strokeDashoffset = "94"; // ~50% of 188
      // Show INK balance
      const inkBalance = document.getElementById("inkBalance");
      if (inkBalance) { inkBalance.style.display = ""; inkBalance.classList.add("visible"); inkBalance.style.opacity = "1"; inkBalance.style.transform = "translateY(0)"; }
      // Show sublabel
      const sublabel = document.querySelector(".timer-info .sublabel");
      if (sublabel) sublabel.style.display = "";
    },
  },
  {
    name: "Session Complete",
    setup: () => {
      // State: Timer done, Complete popup
      const badge = document.getElementById("readingBadge");
      if (badge) badge.style.opacity = "1";
      const userChar = document.getElementById("userChar");
      if (userChar) userChar.classList.add("entered");
      const userBook = document.getElementById("userBook");
      if (userBook) userBook.classList.add("visible");
      const startBtn = document.getElementById("startBtn");
      if (startBtn) startBtn.classList.add("hidden");
      const forestScene = document.getElementById("forestScene");
      if (forestScene) forestScene.classList.add("shrunk");
      // Timer at 00:00
      const timerSection = document.getElementById("timerSection");
      if (timerSection) { timerSection.classList.add("visible"); timerSection.style.opacity = "1"; timerSection.style.transform = "translateY(0)"; }
      const timerText = document.getElementById("timerText");
      if (timerText) timerText.textContent = "00:00";
      const timerLabel = document.getElementById("timerLabel");
      if (timerLabel) timerLabel.textContent = document.documentElement.lang === "en" ? "Session Complete" : "세션 완료";
      const circle = document.getElementById("timerCircle");
      if (circle) circle.style.strokeDashoffset = "0";
      // Complete popup
      const completePopup = document.getElementById("completePopup");
      if (completePopup) { completePopup.classList.add("visible"); completePopup.style.transform = "translate(-50%, -50%) scale(1)"; }
    },
  },
  {
    name: "Tree Growing",
    setup: () => {
      // State: Tree grow overlay with grown tree
      const badge = document.getElementById("readingBadge");
      if (badge) badge.style.opacity = "1";
      const userChar = document.getElementById("userChar");
      if (userChar) userChar.classList.add("entered");
      const startBtn = document.getElementById("startBtn");
      if (startBtn) startBtn.classList.add("hidden");
      // Tree overlay visible
      const treeOverlay = document.getElementById("treeOverlay");
      if (treeOverlay) { treeOverlay.classList.add("visible"); treeOverlay.style.opacity = "1"; }
      const growingTree = document.getElementById("growingTree");
      if (growingTree) { growingTree.classList.add("grown"); growingTree.style.transform = "scale(1)"; }
    },
  },
  {
    name: "My Garden",
    setup: () => {
      // State: Reading garden with multiple trees
      const startBtn = document.getElementById("startBtn");
      if (startBtn) startBtn.classList.add("hidden");
      const gardenOverlay = document.getElementById("gardenOverlay");
      if (gardenOverlay) { gardenOverlay.classList.add("visible"); gardenOverlay.style.opacity = "1"; }
    },
  },
];

async function generateExpandedPdf(browser, htmlFile, outputFile) {
  const htmlPath = path.resolve(__dirname, "../private", htmlFile);
  const outputPath = path.resolve(__dirname, "../private", outputFile);

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });

  const totalSlides = await page.evaluate(
    () => document.querySelectorAll(".slide").length
  );
  console.log(`[${htmlFile}] Found ${totalSlides} slides → expanding demo to ${totalSlides + demoStates.length - 1} pages`);

  const screenshots = [];

  for (let i = 0; i < totalSlides; i++) {
    if (i === 3) {
      // Demo slide: capture multiple states
      for (let s = 0; s < demoStates.length; s++) {
        // Reset the page to base demo slide
        await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
        await page.evaluate((idx) => {
          document.querySelectorAll(".nav-dots, .arrow-hint").forEach(el => el.style.display = "none");
          document.querySelectorAll(".slide").forEach((sl) => {
            sl.classList.remove("active");
            sl.style.opacity = "0";
            sl.style.pointerEvents = "none";
          });
          const target = document.querySelectorAll(".slide")[idx];
          target.classList.add("active");
          target.style.opacity = "1";
          target.style.pointerEvents = "auto";
        }, i);

        // Apply the demo state setup
        const setupFn = demoStates[s].setup;
        await page.evaluate(setupFn);
        await new Promise((r) => setTimeout(r, 600));

        const screenshot = await page.screenshot({ type: "png", encoding: "binary" });
        screenshots.push(screenshot);
        console.log(`  Captured demo state ${s + 1}/${demoStates.length}: ${demoStates[s].name}`);
      }
    } else {
      // Regular slide
      await page.evaluate((idx) => {
        document.querySelectorAll(".nav-dots, .arrow-hint").forEach(el => el.style.display = "none");
        document.querySelectorAll(".slide").forEach((sl) => {
          sl.classList.remove("active");
          sl.style.opacity = "0";
          sl.style.pointerEvents = "none";
        });
        const target = document.querySelectorAll(".slide")[idx];
        target.classList.add("active");
        target.style.opacity = "1";
        target.style.pointerEvents = "auto";
        // Bar chart animation for slide 2
        if (idx === 1) {
          const startedBar = target.querySelector(".bar.started");
          const finishedBar = target.querySelector(".bar.finished");
          if (startedBar) startedBar.style.height = "200px";
          if (finishedBar) finishedBar.style.height = "48px";
        }
      }, i);

      await new Promise((r) => setTimeout(r, 800));

      const screenshot = await page.screenshot({ type: "png", encoding: "binary" });
      screenshots.push(screenshot);
      console.log(`  Captured slide ${i + 1}/${totalSlides}`);
    }
  }

  // Build PDF
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

  console.log(`Expanded PDF saved to: ${outputPath}`);
  await page.close();
  await pdfPage.close();
}

async function main() {
  const browser = await puppeteer.launch({ headless: true });

  for (const { html, pdf } of files) {
    await generateExpandedPdf(browser, html, pdf);
  }

  await browser.close();
  console.log("\nAll expanded PDFs generated successfully!");
}

main().catch(console.error);
