/* Solvanta Consulting
   Browser-only interaction layer.
   No backend. No storage. No mysterious data goblin.
*/

document.addEventListener("DOMContentLoaded", () => {
  initRotaryNavigation();
  initCareerTabs();
  initResumeMaker();
  initCoverLetterMaker();
  initDeviceCheck();
  initPracticeTabs();
  initTypingTest();
  initReactionTest();
  initAptitudePractice();
  initChartQuiz();
});

/* -----------------------------
   ROTARY NAVIGATION
----------------------------- */

function initRotaryNavigation() {
  const rotaryWrap = document.getElementById("rotaryWrap");
  const homeButton = document.getElementById("homeButton");
  const dialItems = document.querySelectorAll(".dial-item");
  const views = document.querySelectorAll(".view");

  if (!rotaryWrap || !homeButton || !dialItems.length || !views.length) return;

  function openSection(sectionName) {
    const targetView = document.getElementById(`view-${sectionName}`);
    if (!targetView) return;

    views.forEach((view) => {
      view.classList.remove("active-view");
    });

    targetView.classList.add("active-view");

    dialItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.section === sectionName);
    });

    rotaryWrap.classList.add("open");

    if (sectionName === "home") {
      setTimeout(() => {
        rotaryWrap.classList.remove("open");
      }, 450);
    }
  }

  homeButton.addEventListener("click", () => {
    openSection("home");
  });

  dialItems.forEach((item) => {
    item.addEventListener("click", () => {
      const section = item.dataset.section;
      openSection(section);
    });
  });
}

/* -----------------------------
   CAREER TOOL TABS
----------------------------- */

function initCareerTabs() {
  const tabs = document.querySelectorAll("[data-tool]");
  const toolViews = document.querySelectorAll(".tool-view");

  if (!tabs.length || !toolViews.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tool = tab.dataset.tool;

      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");

      toolViews.forEach((view) => {
        view.classList.toggle("active-tool", view.id === `tool-${tool}`);
      });
    });
  });
}

/* -----------------------------
   RESUME MAKER
----------------------------- */

function initResumeMaker() {
  const fields = {
    name: document.getElementById("resumeName"),
    contact: document.getElementById("resumeContact"),
    summary: document.getElementById("resumeSummary"),
    skills: document.getElementById("resumeSkills"),
    experience: document.getElementById("resumeExperience"),
    education: document.getElementById("resumeEducation")
  };

  const preview = {
    name: document.getElementById("previewName"),
    contact: document.getElementById("previewContact"),
    summary: document.getElementById("previewSummary"),
    skills: document.getElementById("previewSkills"),
    experience: document.getElementById("previewExperience"),
    education: document.getElementById("previewEducation")
  };

  const printButton = document.getElementById("printResume");
  const clearButton = document.getElementById("clearResume");

  if (!fields.name || !preview.name) return;

  function cleanText(value, fallback) {
    return value && value.trim() ? value.trim() : fallback;
  }

  function linesToHtml(value, fallback) {
    const cleaned = cleanText(value, fallback);

    return cleaned
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        if (line.startsWith("-")) {
          return `<li>${escapeHtml(line.replace(/^-/, "").trim())}</li>`;
        }
        return `<p>${escapeHtml(line)}</p>`;
      })
      .join("");
  }

  function updatePreview() {
    preview.name.textContent = cleanText(fields.name.value, "Your Name");
    preview.contact.textContent = cleanText(
      fields.contact.value,
      "Email · Phone · City · LinkedIn"
    );

    preview.summary.textContent = cleanText(
      fields.summary.value,
      "Your professional summary will appear here."
    );

    preview.skills.textContent = cleanText(
      fields.skills.value,
      "Your skills will appear here."
    );

    const expHtml = linesToHtml(
      fields.experience.value,
      "Your experience will appear here."
    );

    if (expHtml.includes("<li>")) {
      preview.experience.innerHTML = `<ul>${expHtml}</ul>`;
    } else {
      preview.experience.innerHTML = expHtml;
    }

    preview.education.textContent = cleanText(
      fields.education.value,
      "Your education will appear here."
    );
  }

  Object.values(fields).forEach((field) => {
    field.addEventListener("input", updatePreview);
  });

  printButton?.addEventListener("click", () => {
    window.print();
  });

  clearButton?.addEventListener("click", () => {
    Object.values(fields).forEach((field) => {
      field.value = "";
    });
    updatePreview();
  });

  updatePreview();
}

/* -----------------------------
   COVER LETTER MAKER
----------------------------- */

function initCoverLetterMaker() {
  const fields = {
    name: document.getElementById("coverName"),
    company: document.getElementById("coverCompany"),
    role: document.getElementById("coverRole"),
    background: document.getElementById("coverBackground"),
    strengths: document.getElementById("coverStrengths")
  };

  const preview = {
    name: document.getElementById("letterName"),
    company: document.getElementById("letterCompany"),
    role: document.getElementById("letterRole"),
    background: document.getElementById("letterBackground"),
    strengths: document.getElementById("letterStrengths")
  };

  const copyButton = document.getElementById("copyCover");
  const printButton = document.getElementById("printCover");

  if (!fields.name || !preview.name) return;

  function valueOrFallback(value, fallback) {
    return value && value.trim() ? value.trim() : fallback;
  }

  function updateLetter() {
    preview.name.textContent = valueOrFallback(fields.name.value, "[Your Name]");
    preview.company.textContent = valueOrFallback(fields.company.value, "[Company]");
    preview.role.textContent = valueOrFallback(fields.role.value, "[Role]");

    preview.background.textContent = valueOrFallback(
      fields.background.value,
      "Your background summary will appear here."
    );

    preview.strengths.textContent = valueOrFallback(
      fields.strengths.value,
      "Your key strengths will appear here."
    );
  }

  Object.values(fields).forEach((field) => {
    field.addEventListener("input", updateLetter);
  });

  copyButton?.addEventListener("click", async () => {
    const text = buildCoverLetterText(fields);

    try {
      await navigator.clipboard.writeText(text);
      copyButton.textContent = "Copied";
      setTimeout(() => {
        copyButton.textContent = "Copy Letter";
      }, 1200);
    } catch {
      alert("Copy failed. Please select the letter text manually.");
    }
  });

  printButton?.addEventListener("click", () => {
    window.print();
  });

  updateLetter();
}

function buildCoverLetterText(fields) {
  const name = fields.name.value.trim() || "[Your Name]";
  const company = fields.company.value.trim() || "[Company]";
  const role = fields.role.value.trim() || "[Role]";
  const background =
    fields.background.value.trim() || "Your background summary will appear here.";
  const strengths =
    fields.strengths.value.trim() || "Your key strengths will appear here.";

  return `Dear Hiring Team,

I am writing to express my interest in the ${role} position at ${company}.

${background}

${strengths}

I would welcome the opportunity to discuss how my experience and skills can support your team.

Kind regards,
${name}`;
}

/* -----------------------------
   DEVICE CHECK
----------------------------- */

function initDeviceCheck() {
  const startCamera = document.getElementById("startCamera");
  const stopCamera = document.getElementById("stopCamera");
  const cameraPreview = document.getElementById("cameraPreview");
  const cameraStatus = document.getElementById("cameraStatus");

  const startMic = document.getElementById("startMic");
  const stopMic = document.getElementById("stopMic");
  const micLevel = document.getElementById("micLevel");
  const micStatus = document.getElementById("micStatus");

  const playSound = document.getElementById("playSound");
  const speakerStatus = document.getElementById("speakerStatus");

  const runBrowserCheck = document.getElementById("runBrowserCheck");
  const browserInfo = document.getElementById("browserInfo");

  let cameraStream = null;
  let micStream = null;
  let audioContext = null;
  let micAnimationFrame = null;

  startCamera?.addEventListener("click", async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraStatus.textContent = "Camera API is not supported in this browser.";
      return;
    }

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraPreview.srcObject = cameraStream;
      cameraStatus.textContent = "Camera detected. Looking professional is now your responsibility.";
    } catch (error) {
      cameraStatus.textContent =
        "Camera could not start. Permission may be blocked or no camera was found.";
    }
  });

  stopCamera?.addEventListener("click", () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
      cameraPreview.srcObject = null;
      cameraStatus.textContent = "Camera stopped.";
    }
  });

  startMic?.addEventListener("click", async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      micStatus.textContent = "Microphone API is not supported in this browser.";
      return;
    }

    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new AudioContext();

      const source = audioContext.createMediaStreamSource(micStream);
      const analyser = audioContext.createAnalyser();
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      analyser.fftSize = 256;
      source.connect(analyser);

      function updateMicLevel() {
        analyser.getByteFrequencyData(dataArray);

        const average =
          dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

        const level = Math.min(100, Math.round((average / 128) * 100));
        micLevel.style.width = `${level}%`;

        micAnimationFrame = requestAnimationFrame(updateMicLevel);
      }

      updateMicLevel();
      micStatus.textContent = "Microphone detected. The tiny green bar believes in you.";
    } catch {
      micStatus.textContent =
        "Microphone could not start. Permission may be blocked or no microphone was found.";
    }
  });

  stopMic?.addEventListener("click", () => {
    if (micAnimationFrame) {
      cancelAnimationFrame(micAnimationFrame);
      micAnimationFrame = null;
    }

    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
      micStream = null;
    }

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    micLevel.style.width = "0%";
    micStatus.textContent = "Microphone stopped.";
  });

  playSound?.addEventListener("click", () => {
    try {
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 660;
      gain.gain.value = 0.08;

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();

      setTimeout(() => {
        oscillator.stop();
        context.close();
      }, 450);

      speakerStatus.textContent = "Test sound played. If you heard it, the speaker passed.";
    } catch {
      speakerStatus.textContent = "Could not play test sound in this browser.";
    }
  });

  runBrowserCheck?.addEventListener("click", () => {
    const items = [];

    items.push(`Browser: ${navigator.userAgent}`);
    items.push(`Online: ${navigator.onLine ? "Yes" : "No"}`);
    items.push(`Screen: ${window.screen.width} × ${window.screen.height}`);
    items.push(`Window: ${window.innerWidth} × ${window.innerHeight}`);
    items.push(
      `Camera/Mic support: ${
        navigator.mediaDevices?.getUserMedia ? "Available" : "Not supported"
      }`
    );

    if (navigator.connection) {
      items.push(`Connection type: ${navigator.connection.effectiveType || "Unknown"}`);
    } else {
      items.push("Connection type: Not available in this browser");
    }

    browserInfo.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  });
}

/* -----------------------------
   PRACTICE TABS
----------------------------- */

function initPracticeTabs() {
  const tabs = document.querySelectorAll("[data-practice]");
  const views = document.querySelectorAll(".practice-view");

  if (!tabs.length || !views.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const practice = tab.dataset.practice;

      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");

      views.forEach((view) => {
        view.classList.toggle(
          "active-practice",
          view.id === `practice-${practice}`
        );
      });
    });
  });
}

/* -----------------------------
   TYPING TEST
----------------------------- */

function initTypingTest() {
  const startButton = document.getElementById("startTyping");
  const typingText = document.getElementById("typingText");
  const typingInput = document.getElementById("typingInput");
  const wpm = document.getElementById("typingWpm");
  const accuracy = document.getElementById("typingAccuracy");
  const mistakes = document.getElementById("typingMistakes");

  if (!startButton || !typingInput || !typingText) return;

  const sentences = [
    "Dashboards are only useful when they help people understand what needs attention.",
    "A clean report saves time, reduces confusion, and quietly makes everyone look better.",
    "Spreadsheet chaos is temporary, but a good process can survive Monday morning.",
    "The best tools are simple enough that people actually use them without a training manual."
  ];

  let currentSentence = typingText.textContent.trim();
  let startTime = null;

  function resetTyping() {
    currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
    typingText.textContent = currentSentence;
    typingInput.value = "";
    typingInput.focus();
    startTime = Date.now();

    wpm.textContent = "0";
    accuracy.textContent = "0%";
    mistakes.textContent = "0";
  }

  function updateTypingStats() {
    if (!startTime) {
      startTime = Date.now();
    }

    const typed = typingInput.value;
    const elapsedMinutes = Math.max((Date.now() - startTime) / 60000, 0.01);
    const wordsTyped = typed.trim() ? typed.trim().split(/\s+/).length : 0;

    let mistakeCount = 0;

    for (let i = 0; i < typed.length; i++) {
      if (typed[i] !== currentSentence[i]) {
        mistakeCount++;
      }
    }

    const correctChars = Math.max(typed.length - mistakeCount, 0);
    const accuracyValue = typed.length
      ? Math.max(0, Math.round((correctChars / typed.length) * 100))
      : 0;

    const wpmValue = Math.round(wordsTyped / elapsedMinutes);

    wpm.textContent = String(wpmValue);
    accuracy.textContent = `${accuracyValue}%`;
    mistakes.textContent = String(mistakeCount);
  }

  startButton.addEventListener("click", resetTyping);
  typingInput.addEventListener("input", updateTypingStats);
}

/* -----------------------------
   REACTION TEST
----------------------------- */

function initReactionTest() {
  const startButton = document.getElementById("startReaction");
  const box = document.getElementById("reactionBox");
  const result = document.getElementById("reactionResult");

  if (!startButton || !box || !result) return;

  let timeoutId = null;
  let readyTime = null;
  let waiting = false;
  let ready = false;

  startButton.addEventListener("click", () => {
    clearTimeout(timeoutId);

    waiting = true;
    ready = false;
    readyTime = null;

    box.classList.remove("ready");
    box.classList.add("waiting");
    box.textContent = "Wait for it...";
    result.textContent = "Do not click yet. The website is watching.";

    const delay = 1200 + Math.random() * 2800;

    timeoutId = setTimeout(() => {
      waiting = false;
      ready = true;
      readyTime = Date.now();

      box.classList.remove("waiting");
      box.classList.add("ready");
      box.textContent = "Click!";
      result.textContent = "Now. Click now.";
    }, delay);
  });

  box.addEventListener("click", () => {
    if (waiting) {
      clearTimeout(timeoutId);
      waiting = false;
      ready = false;

      box.classList.remove("waiting", "ready");
      box.textContent = "Too soon";
      result.textContent = "Too early. That was not confidence. That was chaos.";
      return;
    }

    if (ready) {
      const reactionTime = Date.now() - readyTime;
      ready = false;

      box.classList.remove("waiting", "ready");
      box.textContent = `${reactionTime} ms`;
      result.textContent = `Reaction time: ${reactionTime} ms. Not bad, human.`;
      return;
    }

    result.textContent = "Click Start first. We need at least the illusion of process.";
  });
}

/* -----------------------------
   APTITUDE PRACTICE
----------------------------- */

function initAptitudePractice() {
  const question = document.getElementById("aptitudeQuestion");
  const answers = document.getElementById("aptitudeAnswers");
  const newButton = document.getElementById("newAptitude");
  const result = document.getElementById("aptitudeResult");

  if (!question || !answers || !newButton || !result) return;

  const questions = [
    {
      question: "If 40 is 25% of a number, what is the number?",
      options: ["100", "120", "160", "180"],
      answer: "160",
      explanation: "40 ÷ 0.25 = 160."
    },
    {
      question: "A value increases from 80 to 100. What is the percentage increase?",
      options: ["20%", "25%", "30%", "40%"],
      answer: "25%",
      explanation: "Increase is 20. 20 ÷ 80 = 25%."
    },
    {
      question: "Find the next number: 3, 6, 12, 24, ?",
      options: ["30", "36", "48", "60"],
      answer: "48",
      explanation: "Each number doubles."
    },
    {
      question: "If a task takes 5 people 10 days, how many person-days are required?",
      options: ["15", "25", "50", "100"],
      answer: "50",
      explanation: "5 people × 10 days = 50 person-days."
    },
    {
      question: "A target is 200 and current achievement is 150. What percentage is achieved?",
      options: ["65%", "70%", "75%", "80%"],
      answer: "75%",
      explanation: "150 ÷ 200 × 100 = 75%."
    }
  ];

  let currentQuestion = null;

  function loadQuestion() {
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];

    question.textContent = currentQuestion.question;
    result.textContent = "Choose an answer.";

    answers.innerHTML = "";

    currentQuestion.options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option;

      button.addEventListener("click", () => {
        if (option === currentQuestion.answer) {
          result.textContent = `Correct. ${currentQuestion.explanation}`;
        } else {
          result.textContent = `Not quite. Correct answer: ${currentQuestion.answer}. ${currentQuestion.explanation}`;
        }
      });

      answers.appendChild(button);
    });
  }

  newButton.addEventListener("click", loadQuestion);
}

/* -----------------------------
   CHART QUIZ
----------------------------- */

function initChartQuiz() {
  const answerButtons = document.querySelectorAll("[data-chart-answer]");
  const result = document.getElementById("chartQuizResult");

  if (!answerButtons.length || !result) return;

  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const answer = button.dataset.chartAnswer;

      if (answer === "D") {
        result.textContent = "Correct. D is the highest. The chart has been read responsibly.";
      } else {
        result.textContent = "Not quite. D is the highest bar. The chart would like a second chance.";
      }
    });
  });
}

/* -----------------------------
   HELPERS
----------------------------- */

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
