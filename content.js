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

function scanOpenEmail() {
  const emailContainer = document.querySelector('div[role="main"]');
  if (emailContainer) {
    const emailContent = emailContainer.querySelector(".a3s");
    if (emailContent && !emailContent.dataset.scanned) {
      const isSuspicious = scanEmailContent(emailContent.textContent);
      if (isSuspicious) {
        addWarningBanner(emailContent);
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
