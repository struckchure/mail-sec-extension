import * as toxicity from "@tensorflow-models/toxicity";

// This script will only run on Gmail pages
console.log("Mail Security Extension loaded on Gmail");

// Function to scan email content
function scanEmailContent(content) {
  const suspiciousPatterns = [
    /\[WARNING\]/i,
    /urgent.*action.*required/i,
    /password.*expired/i,
    /account.*suspended/i,
    /verify.*account.*immediately/i,
    /unusual.*activity/i,
    /security.*alert/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(content));
}

function addWarningBanner(container) {
  const warning = document.createElement("div");
  warning.style.backgroundColor = "#ffebee";
  warning.style.padding = "10px";
  warning.style.margin = "10px 0";
  warning.style.border = "1px solid #ef5350";
  warning.style.borderRadius = "4px";
  warning.textContent =
    "⚠️ Warning: This email contains potentially suspicious content.";
  container.parentNode.insertBefore(warning, container);
}

async function loadToxicityModel() {
  if (!window.toxicityModel) {
    window.toxicityModel = await toxicity.load(0.7);
  }
  return window.toxicityModel;
}

async function analyzeWithAI(content) {
  try {
    const model = await loadToxicityModel();
    const predictions = await model.classify([content]);

    const threats = predictions.filter((p) => p.results[0].match);
    const isMalicious = threats.length > 0;

    return {
      isMalicious,
      confidence: isMalicious
        ? Math.max(...threats.map((t) => t.results[0].probabilities[1]))
        : 0,
      reasons: threats.map(
        (t) =>
          `Detected ${t.label} content with ${Math.round(
            t.results[0].probabilities[1] * 100
          )}% confidence`
      ),
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    return null;
  }
}

function addDetailedWarningBanner(container, aiResult) {
  const warning = document.createElement("div");
  warning.style.backgroundColor = "#ffebee";
  warning.style.padding = "15px";
  warning.style.margin = "10px 0";
  warning.style.border = "1px solid #ef5350";
  warning.style.borderRadius = "4px";

  const warningHeader = document.createElement("h3");
  warningHeader.style.margin = "0 0 10px 0";
  warningHeader.style.color = "#c62828";
  warningHeader.textContent = "⚠️ Potential Security Threat Detected";

  const confidenceLevel = document.createElement("div");
  confidenceLevel.textContent = `Confidence Level: ${Math.round(
    aiResult.confidence * 100
  )}%`;

  const reasonsList = document.createElement("ul");
  aiResult.reasons.forEach((reason) => {
    const li = document.createElement("li");
    li.textContent = reason;
    reasonsList.appendChild(li);
  });

  warning.appendChild(warningHeader);
  warning.appendChild(confidenceLevel);
  warning.appendChild(reasonsList);
  container.parentNode.insertBefore(warning, container);
}

async function scanOpenEmail() {
  const emailContainer = document.querySelector('div[role="main"]');
  if (emailContainer) {
    const emailContent = emailContainer.querySelector(".a3s");
    if (emailContent && !emailContent.dataset.scanned) {
      // Basic pattern scanning
      const isBasicSuspicious = scanEmailContent(emailContent.textContent);

      // AI-powered analysis
      const aiResult = await analyzeWithAI(emailContent.textContent);

      if (isBasicSuspicious || (aiResult && aiResult.isMalicious)) {
        addDetailedWarningBanner(
          emailContent,
          aiResult || {
            confidence: 1,
            reasons: ["Suspicious patterns detected"],
          }
        );
      }

      emailContent.dataset.scanned = "true";
    }
  }
}

function observeEmailChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      scanOpenEmail();
    });
  });

  // Observe the entire document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Initial scan and setup observers
document.addEventListener("DOMContentLoaded", () => {
  scanOpenEmail();
  observeEmailChanges();
});

// Also scan when URL changes (Gmail is a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    scanOpenEmail();
  }
}).observe(document, { subtree: true, childList: true });
