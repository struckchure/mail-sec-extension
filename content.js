import * as toxicity from "@tensorflow-models/toxicity";
import compromise from "compromise"; // NLP library for text analysis

class GmailSecurityExtension {
  constructor() {
    this.models = {
      toxicity: null,
      spam: null,
      sentiment: null,
      nlp: null,
    };
    this.lastUrl = window.location.href;
  }

  // Check if the extension is in a valid Gmail environment
  isValidEnvironment() {
    return window.location.hostname.includes("mail.google.com");
  }

  // Initialize the extension
  async initialize() {
    // Check if we're in a valid Gmail environment
    if (!this.isValidEnvironment()) {
      console.warn("Not in Gmail environment. Extension cannot initialize.");
      return false;
    }

    // Load AI models
    const modelsLoaded = await this.loadModels();
    if (!modelsLoaded) {
      console.error("Failed to load security models");
      return false;
    }

    // Set up event observers and listeners
    this.setupObservers();
    this.attachEventListeners();

    return true;
  }

  // Set up mutation observers to detect email changes
  setupObservers() {
    const emailListObserver = new MutationObserver(async (mutations) => {
      await Promise.all(
        mutations.map(async (mutation) => {
          if (mutation.type === "childList") {
            // Check if the URL has changed (indicating a new email or page)
            if (window.location.href !== this.lastUrl) {
              this.lastUrl = window.location.href;
              return await this.scanOpenEmail();
            }
          }

          // return null promise
          return Promise.resolve();
        })
      );
    });

    // Configure and start observing the email container
    const emailContainer = document.querySelector('div[role="main"]');
    if (emailContainer) {
      emailListObserver.observe(emailContainer, {
        childList: true,
        subtree: true,
      });
    }
  }

  // Attach event listeners for manual scanning
  attachEventListeners() {
    // Optional: Add a manual scan button or keyboard shortcut
    document.addEventListener("keydown", async (event) => {
      // Example: Ctrl+Shift+Q for manual scan
      if (event.ctrlKey && event.shiftKey && event.key === "Q") {
        await this.scanOpenEmail();
      }
    });
  }

  // Enhanced model loading with multiple threat detection models
  async loadModels() {
    try {
      console.log("Loading AI models...");

      // Toxicity model for offensive content
      this.models.toxicity = await toxicity.load(0.7);

      // NLP model for advanced text analysis
      this.models.nlp = compromise;

      // Comprehensive spam keywords
      const spamKeywords = [
        // Financial scam keywords
        "urgent",
        "winner",
        "lottery",
        "inheritance",
        "million dollars",
        "bank details",
        "wire transfer",
        "prince",
        "unclaimed funds",
        "cash prize",
        "money transfer",
        "financial opportunity",
        "investment opportunity",
        "stock picks",
        "crypto giveaway",
        "high returns",
        "tax evasion",
        "offshore account",
        "guaranteed profits",
        "credit repair",
        "debt consolidation",
        "free money",
        "grant money",
        "secret fortune",
        "easy profits",
        "alternative investment",
        "forex trading",
        "Ponzi scheme",
        "pyramid scheme",
        "binary options",
        "pre-approved loan",
        "low interest rate",
        "reverse mortgage",
        "structured settlement",
        "gold investment",
        "silver investment",
        "diamond investment",
        "rare coins",
        "collectible items",
        "business opportunity",
        "franchise opportunity",
        "venture capital",
        "angel investor",
        "sponsorship offer",
        "charity donation",
        "crowdfunding campaign",
        "economic stimulus",
        "government bonds",
        "fast cash", // New
        "no risk investment", // New
        "double your money", // New
        "hidden assets", // New
        "treasure trove", // New
        "wealth transfer", // New
        "miracle savings plan", // New
        "secret wealth formula", // New
        "exclusive membership", // New
        "VIP investor program", // New
        "private equity fund", // New
        "real estate flipping", // New
        "luxury property deal", // New
        "off-market property", // New
        "land banking", // New
        "oil and gas drilling", // New
        "carbon credits", // New
        "green energy scheme", // New
        "renewable energy grants", // New
        "windfall profits", // New
        "asset protection", // New
        "trust fund", // New

        // Phishing attempt keywords
        "click here",
        "verify account",
        "reset password",
        "suspicious activity",
        "account locked",
        "confirm identity",
        "urgent action required",
        "security alert",
        "login required",
        "update your details",
        "payment failed",
        "invoice attached",
        "download now",
        "open this link",
        "your account has been compromised",
        "security notice",
        "important information",
        "critical update",
        "reactivate account",
        "form submission",
        "password change",
        "2FA bypass",
        "security question",
        "personal information",
        "SSN",
        "social security number",
        "credit card number",
        "CVV",
        "expiration date",
        "PIN",
        "one-time code",
        "verification code",
        "recovery email",
        "recovery phone",
        "digital signature",
        "encrypted message",
        "secure file transfer",
        "webmail access",
        "cloud storage",
        "document sharing",
        "account verification", // New
        "secure login", // New
        "fraud alert", // New
        "unauthorized access", // New
        "session expired", // New
        "log out detected", // New
        "sensitive data", // New
        "identity theft", // New
        "data breach", // New
        "compromised credentials", // New
        "secure portal", // New
        "password reset request", // New

        // Manipulation tactics
        "limited offer",
        "one-time opportunity",
        "exclusive deal",
        "act now",
        "don't miss out",
        "time-sensitive",
        "immediate response",
        "last chance",
        "final notice",
        "special offer",
        "you've been selected",
        "congratulations",
        "as a valued customer",
        "for a limited time only",
        "while supplies last",
        "risk-free trial",
        "no obligation",
        "pressure tactics",
        "emotional appeal",
        "fear-mongering",
        "sense of urgency",
        "false scarcity",
        "social proof",
        "authority bias",
        "reciprocity",
        "commitment and consistency",
        "liking",
        "scarcity",
        "unity",
        "bandwagon effect",
        "groupthink",
        "cult tactics",
        "brainwashing",
        "mind control",
        "gaslighting",
        "love bombing",
        "isolation",
        "information overload",
        "cognitive dissonance",
        "too good to be true", // New
        "life-changing opportunity", // New
        "once-in-a-lifetime", // New
        "exclusive access", // New
        "limited seats available", // New
        "early bird discount", // New
        "flash sale", // New
        "countdown timer", // New
        "bonus offer", // New
        "free upgrade", // New
        "instant approval", // New

        // Impersonation attempts
        "dear customer",
        "dear sir/madam",
        "official communication",
        "government agency",
        "tax refund",
        "legal department",
        "support team",
        "service provider",
        "your bank",
        "shipping company",
        "delivery notice",
        "police department",
        "court order",
        "social security",
        "IRS",
        "customs",
        "admin",
        "notice of violation",
        "from your friend",
        "CEO",
        "CFO",
        "CIO",
        "COO",
        "HR department",
        "IT department",
        "customer service",
        "technical support",
        "sales department",
        "marketing department",
        "vendor",
        "supplier",
        "partner",
        "affiliate",
        "representative",
        "agent",
        "ambassador",
        "spokesperson",
        "public figure",
        "celebrity",
        "influencer",
        "religious leader",
        "community leader",
        "foreign official",
        "international organization",
        "trusted advisor", // New
        "confidential source", // New
        "verified sender", // New
        "authorized representative", // New
        "official document", // New
        "legal compliance", // New
        "urgent correspondence", // New
        "priority message", // New
        "classified information", // New
        "restricted access", // New
        "confidential briefing", // New

        // Technical scam keywords
        "virus detected",
        "system error",
        "security breach",
        "malware warning",
        "computer infected",
        "urgent update",
        "remote access",
        "technical support",
        "fix your computer",
        "software download",
        "driver update",
        "your device is at risk",
        "internet security",
        "firewall alert",
        "data loss",
        "ransomware",
        "keylogger",
        "spyware",
        "adware",
        "rootkit",
        "botnet",
        "DDoS attack",
        "pharming",
        "vishing",
        "smishing",
        "SIM swapping",
        "account takeover",
        "man-in-the-middle attack",
        "zero-day exploit",
        "patch update",
        "system restore",
        "data backup",
        "cloud migration",
        "API access",
        "database error",
        "network outage",
        "server maintenance",
        "device compromise", // New
        "encryption failure", // New
        "cyber threat", // New
        "hardware malfunction", // New
        "software vulnerability", // New
        "emergency patch", // New
        "critical vulnerability", // New
        "unauthorized login", // New
        "data corruption", // New
        "file encryption", // New
        "system lockdown", // New

        // Romance/personal scam keywords
        "lonely",
        "looking for love",
        "secret admirer",
        "personal connection",
        "private message",
        "confidential offer",
        "long distance",
        "trust me",
        "true love",
        "destiny",
        "soulmate",
        "need your help",
        "emergency situation",
        "family tragedy",
        "travel expenses",
        "financial hardship",
        "sick relative",
        "military service",
        "foreign country",
        "widow",
        "widower",
        "orphan",
        "refugee",
        "doctor",
        "engineer",
        "artist",
        "entrepreneur",
        "humanitarian",
        "missionary",
        "online dating",
        "matchmaking service",
        "pen pal",
        "virtual friend",
        "emotional support",
        "financial support",
        "visa assistance",
        "legal assistance",
        "inheritance claim",
        "missing person",
        "heartbroken", // New
        "desperate for love", // New
        "divorce recovery", // New
        "single parent", // New
        "lost connection", // New
        "rekindle romance", // New
        "fate brought us together", // New
        "spiritual bond", // New
        "urgent companionship", // New
        "emotional healing", // New

        // Job/employment scam keywords
        "work from home",
        "easy money",
        "instant income",
        "no experience needed",
        "unlimited earning potential",
        "get rich quick",
        "mystery shopper",
        "package forwarding",
        "data entry",
        "online surveys",
        "make money online",
        "start immediately",
        "high salary",
        "part-time job",
        "full-time job",
        "flexible hours",
        "recruiters",
        "hiring now",
        "job offer",
        "application form",
        "commission-based",
        "referral program",
        "multi-level marketing",
        "MLM",
        "direct sales",
        "home-based business",
        "freelance opportunity",
        "contract work",
        "remote position",
        "virtual assistant",
        "content creator",
        "social media manager",
        "affiliate marketing",
        "e-commerce",
        "drop shipping",
        "business owner",
        "entrepreneurship",
        "startup",
        "investment opportunity",
        "training program",
        "certification course",
        "license required",
        "background check",
        "quick hire", // New
        "immediate start", // New
        "guaranteed income", // New
        "residual income", // New
        "passive earnings", // New
        "career advancement", // New
        "dream job", // New
        "side hustle", // New
        "income stream", // New
        "lucrative opportunity", // New
      ];

      // Custom spam detection model using multiple techniques
      this.models.spam = {
        predict: async (text) => {
          // Check keyword frequency
          const spamScore = spamKeywords.reduce(
            (score, keyword) =>
              text.toLowerCase().includes(keyword.toLowerCase())
                ? score + 0.2
                : score,
            0
          );

          // Additional spam indicators
          const doc = this.models.nlp(text);
          const hasPersonNames = doc.people().found;
          const hasWeirdPunctuation = /[!]{2,}|\${2,}|[%]{2,}/.test(text);
          const hasSuspiciousDomains =
            /\b(free|win|cash|prize)\.[a-z]{3}\b/i.test(text);

          // Combine scores
          const additionalScores = [
            hasPersonNames ? 0.2 : 0,
            hasWeirdPunctuation ? 0.3 : 0,
            hasSuspiciousDomains ? 0.4 : 0,
          ];

          const totalScore =
            spamScore + additionalScores.reduce((a, b) => a + b, 0);
          return Math.min(totalScore, 1);
        },
      };

      // Local AI-based threat detection using TensorFlow toxicity
      this.models.localThreat = {
        predict: async (text) => {
          try {
            // Use toxicity model for threat assessment
            const predictions = await this.models.toxicity.classify([text]);
            const toxicityScore = predictions
              .filter((p) => p.results[0].match)
              .reduce((score, p) => score + p.results[0].probabilities[1], 0);

            return Math.min(toxicityScore, 1);
          } catch (error) {
            console.warn("Local threat detection failed", error);
            return 0;
          }
        },
      };

      console.log("✅ AI models loaded successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to load models:", error);
      return false;
    }
  }

  // Scan the currently open email
  async scanOpenEmail() {
    const emailContainer = document.querySelector('div[role="main"]');
    if (!emailContainer) return;

    const emailContent = emailContainer.querySelector(".a3s");
    if (!emailContent || emailContent.dataset.scanned) return;

    // Show loading banner immediately
    this.createBanner({ status: "loading" }, emailContainer);

    // Slightly delay the actual scanning to ensure banner is visible
    setTimeout(async () => {
      const emailText = emailContent.textContent || "";
      const aiResult = await this.analyzeEmail(emailText);

      // Update or replace banner based on analysis
      this.createBanner(aiResult, emailContainer);

      if (aiResult.isMalicious) {
        emailContent.dataset.scanned = "true";
      }
    }, 500);
  }

  // Create banner for different statuses
  createBanner(aiResult, emailContainer) {
    // Remove existing banners to prevent duplicates
    const existingBanners = emailContainer.querySelectorAll(
      ".gmail-security-banner"
    );
    existingBanners.forEach((banner) => banner.remove());

    const banner = document.createElement("div");
    banner.className = "gmail-security-banner";

    // Dynamic styling based on status
    let backgroundColor, borderColor, icon, title;
    switch (aiResult.status) {
      case "loading":
        backgroundColor = "#fff3e0";
        borderColor = "#ff9800";
        icon = "⏳";
        title = "Analyzing Email Security...";
        break;
      case "threat":
        backgroundColor = "#ffebee";
        borderColor = "#ef5350";
        icon = "⚠️";
        title = "Potential Email Threat Detected";
        break;
      case "safe":
        backgroundColor = "#e8f5e9";
        borderColor = "#4caf50";
        icon = "✅";
        title = "Email Appears Safe";
        break;
      default:
        backgroundColor = "#f5f5f5";
        borderColor = "#9e9e9e";
        icon = "ℹ️";
        title = "Security Analysis Complete";
    }

    banner.style.cssText = `
      width: 100%;
      background: ${backgroundColor};
      border: 2px solid ${borderColor};
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
      position: relative;
    `;

    banner.innerHTML = `
      <h3 style="color:${borderColor};margin:0 0 10px;font-size:16px;">${icon} ${title}</h3>
      ${
        aiResult.status !== "loading"
          ? `
        <p style="margin:5px 0;font-weight:bold;">
          ${
            aiResult.status === "threat"
              ? "Threat Confidence:"
              : "Safety Confidence:"
          } 
          ${aiResult.confidence || 0}%
        </p>
      `
          : ""
      }
      ${
        aiResult.reasons && aiResult.reasons.length > 0
          ? `
        <ul style="padding-left:20px;margin:5px 0;">
          ${aiResult.reasons
            .map((r) => `<li style="font-size:14px;">${r}</li>`)
            .join("")}
        </ul>
      `
          : ""
      }
    `;

    // Insert banner at the beginning of the email body
    const firstChild = emailContainer.firstChild;
    if (firstChild) {
      emailContainer.insertBefore(banner, firstChild);
    } else {
      emailContainer.appendChild(banner);
    }
  }

  // Comprehensive threat analysis
  async analyzeEmail(content) {
    if (!this.models.toxicity) {
      console.warn("Models not loaded");
      return {
        status: "loading",
        confidence: 0,
        reasons: ["Initializing security models..."],
      };
    }

    try {
      console.log("Starting comprehensive analysis...");

      // Multiple threat detection approaches
      const [toxicityPredictions, spamScore, localThreatScore] =
        await Promise.all([
          this.models.toxicity.classify([content]),
          this.models.spam.predict(content),
          this.models.localThreat.predict(content),
        ]);

      // Process toxicity predictions
      const toxicThreats = toxicityPredictions.filter(
        (p) => p.results[0].match
      );

      // Combine scores for more comprehensive threat assessment
      const confidenceScores = [
        ...toxicThreats.map((t) => t.results[0].probabilities[1]),
        spamScore,
        localThreatScore,
      ];

      console.log("Confidence scores:", confidenceScores);

      const avgConfidence =
        confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;
      const confidencePercent = Math.round(avgConfidence * 100);
      const isMalicious = confidencePercent > 10;

      console.log("Confidence %:", confidencePercent);

      return {
        status: isMalicious ? "threat" : "safe",
        isMalicious,
        confidence: confidencePercent,
        reasons: [
          ...toxicThreats.map(
            (t) =>
              `Detected ${t.label} content with ${Math.round(
                t.results[0].probabilities[1] * 100
              )}% confidence`
          ),
          ...(spamScore > 0.5
            ? [
                `Potential spam indicators detected (${Math.round(
                  spamScore * 100
                )}%)`,
              ]
            : []),
          ...(localThreatScore > 0.5
            ? [
                `Local threat detection raised concerns (${Math.round(
                  localThreatScore * 100
                )}%)`,
              ]
            : []),
        ],
      };
    } catch (error) {
      console.error("Comprehensive analysis failed:", error);
      return {
        status: "error",
        isMalicious: false,
        confidence: 0,
        reasons: ["Analysis failed due to an unexpected error"],
      };
    } finally {
      console.log("Finished analysis.");
    }
  }
}

// Extension initialization
async function initializeExtension() {
  const extension = new GmailSecurityExtension();
  try {
    await extension.initialize();
  } catch (error) {
    console.error("Failed to initialize Gmail Security Extension:", error);
  }
}

// Run initialization
initializeExtension();
