/* Solvanta Consulting
   Minimal rotary site interactions.
   Browser-only. No backend. No storage. No mysterious data goblin.
*/

document.addEventListener("DOMContentLoaded", () => {
  initRotaryNavigation();
  initJumpButtons();

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
  const rotaryDial = document.getElementById("rotaryDial");
  const dialHome = document.getElementById("dialHome");
  const dialButtons = document.querySelectorAll(".dial-hole");
  const views = document.querySelectorAll(".view");

  if (!rotaryDial || !dialHome || !dialButtons.length || !views.length) return;

  function openSection(sectionName) {
    const target = document.getElementById(`view-${sectionName}`);
    if (!target) return;

    views.forEach((view) => {
      view.classList.remove("active-view");
    });

    target.classList.add("active-view");

    dialButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.section === sectionName);
    });

    rotaryDial.classList.add("open");

    if (sectionName === "home") {
      setTimeout(() => {
        rotaryDial.classList.remove("open");
      }, 420);
    }
  }

  dialHome.addEventListener("click", () => openSection("home"));

  dialButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openSection(button.dataset.section);
    });
  });

  window.solvantaOpenSection = openSection;
}

function initJumpButtons() {
  const jumpButtons = document.querySelectorAll("[data-jump]");

  jumpButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.jump;

      if (window.solvantaOpenSection) {
        window.solvantaOpenSection(target);
      }
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
      const selectedTool = tab.dataset.tool;

      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");

      toolViews.forEach((view) => {
        view.classList.toggle("active-tool", view.id === `tool-${selectedTool}`);
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

    preview.experience.innerHTML = formatExperience(
      fields.experience.value,
      "Your experience will appear here."
    );

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

function formatExperience(value, fallback) {
  const text = value && value.trim() ? value.trim() : fallback;
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return escapeHtml(fallback);

  let html = "";
  let bullets = [];

  lines.forEach((line) => {
    if (line.startsWith("-")) {
      bullets.push(`<li>${escapeHtml(line.replace(/^-/, "").trim())}</li>`);
    } else {
      if (bullets.length) {
        html += `<ul>${bullets.join("")}</ul>`;
        bullets = [];
      }

      html += `<p>${escapeHtml(line)}</p>`;
    }
  });

  if (bullets.length) {
    html += `<ul>${bullets.join("")}</ul>`;
  }

  return html;
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
    const letterText = buildCoverLetterText(fields);

    try {
      await navigator.clipboard.writeText(letterText);
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
  initCameraCheck();
  initMicrophoneCheck();
  initSpeakerCheck();
  initBrowserCheck();
  initInternetSpeedCheck();
}

function initCameraCheck() {
  const startCamera = document.getElementById("startCamera");
  const stopCamera = document.getElementById("stopCamera");
  const cameraPreview = document.getElementById("cameraPreview");
  const cameraStatus = document.getElementById("cameraStatus");

  if (!startCamera || !stopCamera || !cameraPreview || !cameraStatus) return;

  let cameraStream = null;

  startCamera.addEventListener("click", async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraStatus.textContent = "Camera access is not supported in this browser.";
      return;
    }

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraPreview.srcObject = cameraStream;
      cameraStatus.textContent =
        "Camera detected. The lighting is now between you and your life choices.";
    } catch {
      cameraStatus.textContent =
        "Camera could not start. Permission may be blocked, or the camera is unavailable.";
    }
  });

  stopCamera.addEventListener("click", () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
      cameraPreview.srcObject = null;
      cameraStatus.textContent = "Camera stopped.";
    }
  });
}

function initMicrophoneCheck() {
  const startMic = document.getElementById("startMic");
  const stopMic = document.getElementById("stopMic");
  const micLevel = document.getElementById("micLevel");
  const micStatus = document.getElementById("micStatus");

  if (!startMic || !stopMic || !micLevel || !micStatus) return;

  let micStream = null;
  let audioContext = null;
  let animationFrame = null;

  startMic.addEventListener("click", async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      micStatus.textContent = "Microphone access is not supported in this browser.";
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

      function updateLevel() {
        analyser.getByteFrequencyData(dataArray);

        const average =
          dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

        const level = Math.min(100, Math.round((average / 128) * 100));
        micLevel.style.width = `${level}%`;

        animationFrame = requestAnimationFrame(updateLevel);
      }

      updateLevel();

      micStatus.textContent =
        "Microphone detected. The little bar is moving, which is more than some meetings can say.";
    } catch {
      micStatus.textContent =
        "Microphone could not start. Permission may be blocked, or no mic was found.";
    }
  });

  stopMic.addEventListener("click", () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
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
}

function initSpeakerCheck() {
  const playSound = document.getElementById("playSound");
  const speakerStatus = document.getElementById("speakerStatus");

  if (!playSound || !speakerStatus) return;

  playSound.addEventListener("click", () => {
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

      speakerStatus.textContent =
        "Test sound played. If you heard it, your speaker has chosen peace.";
    } catch {
      speakerStatus.textContent =
        "Could not play the test sound. Your browser may be blocking audio.";
    }
  });
}

function initBrowserCheck() {
  const runBrowserCheck = document.getElementById("runBrowserCheck");
  const browserInfo = document.getElementById("browserInfo");

  if (!runBrowserCheck || !browserInfo) return;

  runBrowserCheck.addEventListener("click", () => {
    const info = [];

    info.push(`Online status: ${navigator.onLine ? "Online" : "Offline"}`);
    info.push(`Screen size: ${window.screen.width} × ${window.screen.height}`);
    info.push(`Browser window: ${window.innerWidth} × ${window.innerHeight}`);
    info.push(
      `Camera/microphone API: ${
        navigator.mediaDevices?.getUserMedia ? "Supported" : "Not supported"
      }`
    );
    info.push(`Clipboard API: ${navigator.clipboard ? "Supported" : "Limited"}`);

    if (navigator.connection) {
      info.push(
        `Browser-reported network type: ${
          navigator.connection.effectiveType || "Unknown"
        }`
      );
      info.push(
        `Estimated downlink from browser: ${
          navigator.connection.downlink ? `${navigator.connection.downlink} Mbps` : "Not available"
        }`
      );
    } else {
      info.push("Browser-reported network details: Not available");
    }

    browserInfo.innerHTML = info.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  });
}

function initInternetSpeedCheck() {
  const runSpeedTest = document.getElementById("runSpeedTest");
  const speedResult = document.getElementById("speedResult");

  if (!runSpeedTest || !speedResult) return;

  runSpeedTest.addEventListener("click", async () => {
    runSpeedTest.disabled = true;
    runSpeedTest.textContent = "Checking...";
    speedResult.innerHTML = `
      <strong>Testing connection...</strong>
      <span>Downloading a small test file in the browser. Please wait while the internet considers behaving.</span>
    `;

    try {
      const testUrl =
        "https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg";
      const cacheBuster = `?cacheBust=${Date.now()}`;
      const startTime = performance.now();

      const response = await fetch(testUrl + cacheBuster, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Speed test file could not be downloaded.");
      }

      const blob = await response.blob();
      const endTime = performance.now();

      const durationSeconds = Math.max((endTime - startTime) / 1000, 0.1);
      const bitsLoaded = blob.size * 8;
      const speedMbps = bitsLoaded / durationSeconds / 1024 / 1024;

      const roundedSpeed = Math.round(speedMbps * 10) / 10;
      const interpretation = getSpeedInterpretation(roundedSpeed);

      speedResult.innerHTML = `
        <strong>Approx download speed: ${roundedSpeed} Mbps</strong>
        <span>${interpretation}</span>
        <span class="small-note">This is a browser-based estimate. Good enough for a quick sanity check, not for arguing with your internet provider.</span>
      `;
    } catch {
      speedResult.innerHTML = `
        <strong>Speed check could not complete.</strong>
        <span>Your browser or network may have blocked the test file, which is annoying but not personally surprising. Try again later or use a dedicated speed test if you need exact results.</span>
      `;
    } finally {
      runSpeedTest.disabled = false;
      runSpeedTest.textContent = "Run Speed Check";
    }
  });
}

function getSpeedInterpretation(speedMbps) {
  if (speedMbps >= 50) {
    return "Your connection looks strong enough for video calls, screen sharing, online meetings, downloads, and general work without too much drama. If the call still freezes, blame the meeting platform responsibly.";
  }

  if (speedMbps >= 20) {
    return "Your connection looks suitable for normal office work, browsing, email, and most video calls. If five other apps are also fighting for bandwidth, things may still get spicy.";
  }

  if (speedMbps >= 8) {
    return "Your connection should handle basic browsing and emails, but video calls or screen sharing may feel unstable if other apps are also using the internet. Proceed with cautious optimism.";
  }

  if (speedMbps >= 3) {
    return "Your connection looks weak right now. You may face buffering, dropped audio, slow loading, or the classic meeting phrase: can you hear me now?";
  }

  return "Your connection is struggling. Basic browsing may work, but video calls, uploads, and screen sharing may behave like they have resigned emotionally.";
}

/* -----------------------------
   PRACTICE TABS
----------------------------- */

function initPracticeTabs() {
  const tabs = document.querySelectorAll("[data-practice]");
  const practiceViews = document.querySelectorAll(".practice-view");

  if (!tabs.length || !practiceViews.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const selected = tab.dataset.practice;

      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");

      practiceViews.forEach((view) => {
        view.classList.toggle(
          "active-practice",
          view.id === `practice-${selected}`
        );
      });
    });
  });
}

/* -----------------------------
   TYPING TEST
----------------------------- */

function initTypingTest() {
  const typingText = document.getElementById("typingText");
  const typingInput = document.getElementById("typingInput");
  const startButton = document.getElementById("startTyping");
  const wpm = document.getElementById("typingWpm");
  const accuracy = document.getElementById("typingAccuracy");
  const mistakes = document.getElementById("typingMistakes");

  if (!typingText || !typingInput || !startButton || !wpm || !accuracy || !mistakes) return;

  const typingPassages = [
    "Congratulations, you have voluntarily started a typing test. Somewhere, a spreadsheet just gained confidence. Type this carefully, because your keyboard is about to reveal whether you are a productive professional or just someone who sends emails with alarming confidence and three hidden typos.",

    "A good dashboard should help people understand what changed, what matters, and what needs attention. A bad dashboard looks like someone trapped twenty charts in a room and told them to fight for leadership attention. Please type this before another pie chart applies for emotional support.",

    "Most office chaos does not arrive dramatically. It sneaks in as duplicate trackers, unclear ownership, missing updates, and one file named final version two. If you are typing this calmly, congratulations. You may already be more organized than the folder structure that hurt you.",

    "This typing test is not here to judge you. That would be rude. It is here to quietly measure your speed, accuracy, and ability to survive a paragraph without blaming the keyboard. If mistakes appear, please remember denial is not a valid productivity strategy.",

    "Good reporting is not about adding more slides, more charts, or more words that sound important in a meeting. It is about helping people understand the situation quickly. If your report needs a treasure map, three calls, and a follow-up email to explain it, the report has chosen violence.",

    "Before joining an online meeting, check your camera, microphone, speakers, and internet connection. Future you will appreciate the preparation. Present you may think this is unnecessary, but present you is also the person who once said, can everyone hear me, while clearly muted.",

    "A clean process should survive a busy Monday, a missing team member, and at least three people asking for the same update in different ways. If the process collapses because one person is on leave, that is not a process. That is a group project wearing a business suit.",

    "Your resume should be clear, direct, and easy to scan. It should not look like it was designed during a font emergency. Recruiters do not need a treasure hunt. They need your skills, experience, achievements, and proof that you can use bullet points without starting a graphic design incident.",

    "Not every spreadsheet needs to become a dashboard, but every important decision deserves information that is clean, readable, and slightly less terrifying. If the file has twelve tabs, four colour codes, and no explanation, it is not a report. It is an escape room with formulas.",

    "The best tools are simple enough that people actually use them, useful enough that they save time, and calm enough that nobody needs a training session. If a tool requires three manuals and a motivational speech, congratulations, you have invented another problem.",

    "Typing fast is impressive, but typing accurately is what keeps your email from becoming a screenshot in someone else's group chat. Speed is good. Accuracy is better. Sending dear manger instead of dear manager is how office legends are born for the wrong reasons.",

    "Meetings are not automatically bad. Some meetings are useful, focused, and mercifully short. Others begin with a quick sync and somehow turn into a forty-five-minute documentary about a spreadsheet nobody opened. Type this sentence for everyone who has suffered politely.",

    "A useful update should answer three simple questions: what happened, why it matters, and what needs to happen next. If your update creates more questions than answers, it is not an update. It is a mysterious fog bank with bullet points.",

    "Data cleanup is the part nobody celebrates but everyone needs. Trim the spaces, remove the duplicates, fix the names, and check the dates. Otherwise, your dashboard will confidently display nonsense, and nonsense with a chart is still nonsense, just wearing a tie.",

    "If you are taking this typing test to prove something, wonderful. If you are taking it to avoid doing actual work, also understandable. Either way, the timer does not care about your feelings. It only cares whether your fingers can keep up with your ambition.",

    "A good cover letter should sound like a real person wrote it. Not a robot. Not a motivational poster. Not a corporate brochure that learned to breathe. Keep it simple, relevant, and human. The hiring team already has enough generic enthusiasm to wallpaper a conference room.",

    "Some people say multitasking is a skill. Usually, it means doing five things badly while pretending your browser tabs are a project management system. Focus is underrated. So is closing the seven duplicate files you opened while looking for the right version.",

    "The phrase quick update has done more damage to calendars than anyone wants to admit. A quick update can be useful, but only if it is actually quick and actually an update. Otherwise, it becomes a meeting wearing a fake moustache.",

    "A dashboard should not make people ask what am I looking at. It should guide the eye, explain the priority, and make the next step obvious. If users need a separate dashboard to understand your dashboard, congratulations, you have created a reporting multiverse.",

    "This test may reveal that your typing speed is excellent, average, or powered entirely by panic. All outcomes are valid. The important thing is that you keep going, fix your mistakes, and avoid blaming autocorrect for crimes it clearly did not commit.",

    "Office productivity is mostly the art of making information easier to find, easier to trust, and easier to act on. Everything else is decoration. If the team cannot find the file, understand the metric, or know who owns the action, the process is just vibes in formal clothing.",

    "A well-written email should be polite, clear, and difficult to misunderstand. It should not contain six paragraphs of emotional cushioning before asking one simple question. Respect the reader. Ask the question. Add context. Escape before the email becomes a novel.",

    "When a tracker has too many columns, people stop updating it. When it has too few columns, it becomes useless. The trick is finding the balance between enough information and not making every row feel like a tax declaration with deadlines.",

    "If your internet fails during a meeting, everyone suddenly becomes a technology expert. Someone says switch networks. Someone says restart the browser. Someone says maybe it is your device. Nobody knows. Everyone is guessing. The Wi-Fi, meanwhile, is enjoying the drama.",

    "The goal is not to make work perfect. That would be suspicious and probably require a committee. The goal is to make work clearer, calmer, and less dependent on heroic last-minute effort. If the system needs panic to function, the system needs therapy."
  ];

  let currentPassage = "";
  let startTime = null;

  function startNewTest() {
    currentPassage =
      typingPassages[Math.floor(Math.random() * typingPassages.length)];

    typingText.textContent = currentPassage;
    typingInput.value = "";
    typingInput.disabled = false;
    typingInput.focus();

    startTime = Date.now();

    wpm.textContent = "0";
    accuracy.textContent = "0%";
    mistakes.textContent = "0";
  }

  function updateStats() {
    if (!startTime) startTime = Date.now();

    const typed = typingInput.value;
    const elapsedMinutes = Math.max((Date.now() - startTime) / 60000, 0.01);
    const wordsTyped = typed.trim() ? typed.trim().split(/\s+/).length : 0;

    let mistakeCount = 0;

    for (let i = 0; i < typed.length; i++) {
      if (typed[i] !== currentPassage[i]) {
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

  startButton.addEventListener("click", startNewTest);
  typingInput.addEventListener("input", updateStats);
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

    const delay = 1300 + Math.random() * 3000;

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
    },
    {
      question: "A report has 360 records. If 45 records failed quality checks, what is the failure rate?",
      options: ["10%", "12.5%", "15%", "18%"],
      answer: "12.5%",
      explanation: "45 ÷ 360 × 100 = 12.5%."
    },
    {
      question: "If 18 cases are completed per day, how many days are needed to complete 144 cases?",
      options: ["6", "7", "8", "9"],
      answer: "8",
      explanation: "144 ÷ 18 = 8 days."
    },
    {
      question: "Find the next number: 5, 10, 20, 40, ?",
      options: ["45", "50", "80", "100"],
      answer: "80",
      explanation: "Each number doubles."
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
  const buttons = document.querySelectorAll("[data-chart-answer]");
  const result = document.getElementById("chartQuizResult");

  if (!buttons.length || !result) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const answer = button.dataset.chartAnswer;

      if (answer === "D") {
        result.textContent =
          "Correct. D is the highest. The chart has been read responsibly.";
      } else {
        result.textContent =
          "Not quite. D is the highest bar. The chart would like a second chance.";
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
