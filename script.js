/* Solvanta Consulting
   Questionable jokes. Surprisingly useful outcomes.
   Final frontend + Google Workspace backend connection.
*/

const SOLVANTA_BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbzKyDE333KHBXT9lKKCACsbBtndpc3IPirujlbRCJqD4XsYqmCw9LRyZHF823DLGs5k/exec";

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initJumpButtons();

  initBackendStatus();
  initBackendForms();
  initDynamicNotes();
  initAskSolvanta();

  initSurvivalTabs();
  initDeviceCheck();
  initTypingTest();
  initReactionTest();
  initAptitudePractice();
  initChartQuiz();
});

/* -----------------------------
   NAVIGATION
----------------------------- */

function initNavigation() {
  const rotaryDial = document.getElementById("rotaryDial");
  const dialHome = document.getElementById("dialHome");
  const navButtons = document.querySelectorAll("[data-section]");
  const views = document.querySelectorAll(".view");

  if (!navButtons.length || !views.length) return;

  function openSection(sectionName) {
    const target = document.getElementById(`view-${sectionName}`);
    if (!target) return;

    views.forEach((view) => view.classList.remove("active-view"));
    target.classList.add("active-view");

    navButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.section === sectionName);
    });

    if (rotaryDial) {
      rotaryDial.classList.add("open");

      if (sectionName === "home") {
        setTimeout(() => {
          rotaryDial.classList.remove("open");
        }, 450);
      }
    }

    logToolUsage(sectionName, "section_opened", "navigation");

    const contentStage = document.querySelector(".content-stage");
    if (contentStage) {
      contentStage.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openSection(button.dataset.section);
    });
  });

  if (dialHome) {
    dialHome.addEventListener("click", () => openSection("home"));
  }

  window.solvantaOpenSection = openSection;
}

function initJumpButtons() {
  const jumpButtons = document.querySelectorAll("[data-jump]");

  jumpButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (window.solvantaOpenSection) {
        window.solvantaOpenSection(button.dataset.jump);
      }
    });
  });
}

/* -----------------------------
   BACKEND STATUS
----------------------------- */

async function initBackendStatus() {
  const status = document.getElementById("backendStatus");
  if (!status) return;

  try {
    const response = await fetch(`${SOLVANTA_BACKEND_URL}?action=healthCheck`, {
      method: "GET",
      cache: "no-store"
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error("Backend health check failed.");
    }

    status.className = "backend-pill online";
    status.innerHTML = "<span></span>Backend: online";
  } catch (error) {
    console.error("Backend status check failed:", error);

    status.className = "backend-pill offline";
    status.innerHTML = "<span></span>Backend: resting dramatically";
  }
}

/* -----------------------------
   BACKEND FORMS
----------------------------- */

function initBackendForms() {
  initContactForm();
  initFeedbackForm();
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("contactStatus");

  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const honeypot = form.querySelector('[name="website"]')?.value || "";
    if (honeypot.trim()) {
      showFormStatus(status, "Submission blocked.", "error");
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');

    const payload = {
      action: "submitContact",
      name: document.getElementById("contactName")?.value || "",
      email: document.getElementById("contactEmail")?.value || "",
      reason: document.getElementById("contactReason")?.value || "General",
      message: document.getElementById("contactMessage")?.value || "",
      source: "solvanta-website"
    };

    if (!payload.name.trim() || !payload.email.trim() || !payload.message.trim()) {
      showFormStatus(status, "Please fill name, email, and message.", "error");
      return;
    }

    await submitToBackend({
      payload,
      statusElement: status,
      button: submitButton,
      loadingText: "Sending...",
      successText: "Message sent. The imaginary unicorns have been notified.",
      errorText: "Message could not be sent. The backend may be having a dramatic moment."
    });

    if (status.classList.contains("success")) {
      logToolUsage("Contact", "contact_form_submitted", "contact");
      form.reset();
    }
  });
}

function initFeedbackForm() {
  const form = document.getElementById("feedbackForm");
  const status = document.getElementById("feedbackStatus");

  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const honeypot = form.querySelector('[name="website"]')?.value || "";
    if (honeypot.trim()) {
      showFormStatus(status, "Submission blocked.", "error");
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');

    const payload = {
      action: "submitFeedback",
      tool: document.getElementById("feedbackTool")?.value || "General Website",
      feedbackType: document.getElementById("feedbackType")?.value || "Suggestion",
      email: document.getElementById("feedbackEmail")?.value || "",
      message: document.getElementById("feedbackMessage")?.value || "",
      source: "solvanta-website"
    };

    if (!payload.message.trim()) {
      showFormStatus(status, "Please enter your feedback message.", "error");
      return;
    }

    await submitToBackend({
      payload,
      statusElement: status,
      button: submitButton,
      loadingText: "Sending...",
      successText: "Feedback saved. Somewhere, a bug is nervous.",
      errorText: "Feedback could not be sent. The lab may be pretending everything is fine."
    });

    if (status.classList.contains("success")) {
      logToolUsage("Feedback", "feedback_form_submitted", "contact");
      form.reset();
    }
  });
}

async function submitToBackend({
  payload,
  statusElement,
  button,
  loadingText,
  successText,
  errorText
}) {
  const originalButtonText = button ? button.textContent : "";

  try {
    showFormStatus(statusElement, loadingText, "");

    if (button) {
      button.disabled = true;
      button.textContent = loadingText;
    }

    const response = await fetch(SOLVANTA_BACKEND_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error || "Backend rejected the request.");
    }

    showFormStatus(statusElement, data.message || successText, "success");
  } catch (error) {
    console.error("Solvanta backend error:", error);
    showFormStatus(statusElement, errorText, "error");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalButtonText;
    }
  }
}

function showFormStatus(element, message, type) {
  if (!element) return;

  element.textContent = message;
  element.className = "form-status";

  if (type) {
    element.classList.add(type);
  }
}

/* -----------------------------
   TOOL USAGE LOGGING
----------------------------- */

function logToolUsage(tool, toolAction, page) {
  const payload = {
    action: "logToolUsage",
    tool: tool || "Unknown",
    toolAction: toolAction || "unknown_action",
    page: page || "solvanta-website",
    userAgent: navigator.userAgent || "unknown"
  };

  fetch(SOLVANTA_BACKEND_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  }).catch((error) => {
    console.warn("Tool usage log failed:", error);
  });
}

/* -----------------------------
   DYNAMIC CHAOS NOTES
----------------------------- */

async function initDynamicNotes() {
  const notesList = document.getElementById("notesList");
  const notesStatus = document.getElementById("notesStatus");

  if (!notesList) return;

  try {
    const response = await fetch(`${SOLVANTA_BACKEND_URL}?action=getNotes`, {
      method: "GET",
      cache: "no-store"
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("Backend returned non-JSON response:", text);
      throw new Error("Backend response was not valid JSON.");
    }

    if (!data.ok) {
      throw new Error(data.error || "Could not load notes.");
    }

    const notes = Array.isArray(data.notes) ? data.notes : [];

    if (!notes.length) {
      notesList.innerHTML = `
        <article>
          <span>!</span>
          <div>
            <h3>No published Chaos Notes yet.</h3>
            <p>The Notes sheet is connected, but nothing is marked as Published yet.</p>
          </div>
        </article>
      `;

      if (notesStatus) {
        notesStatus.textContent = "";
        notesStatus.className = "form-status";
      }

      return;
    }

    notesList.innerHTML = notes
      .map((note, index) => {
        const number = String(index + 1).padStart(2, "0");
        const title = escapeHtml(note.title || "Untitled note");
        const content = escapeHtml(note.content || "");
        const category = escapeHtml(note.category || "General");

        return `
          <article>
            <span>${number}</span>
            <div>
              <p class="note-category">${category}</p>
              <h3>${title}</h3>
              <p>${content}</p>
            </div>
          </article>
        `;
      })
      .join("");

    if (notesStatus) {
      notesStatus.textContent = `Loaded ${notes.length} Chaos Note${notes.length === 1 ? "" : "s"} from Google Sheets.`;
      notesStatus.className = "form-status success";
    }

    logToolUsage("Chaos Notes", "notes_loaded", "chaos");
  } catch (error) {
    console.error("Could not load Solvanta notes:", error);

    notesList.innerHTML = `
      <article>
        <span>!</span>
        <div>
          <h3>Chaos Notes could not be loaded.</h3>
          <p>The backend may be unavailable, or the spreadsheet may be pretending it is on annual leave.</p>
        </div>
      </article>
    `;

    if (notesStatus) {
      notesStatus.textContent = "Could not load Chaos Notes from Google Sheets.";
      notesStatus.className = "form-status error";
    }
  }
}

/* -----------------------------
   ASK SOLVANTA CHATBOT
----------------------------- */

function initAskSolvanta() {
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const chatWindow = document.getElementById("chatWindow");
  const status = document.getElementById("chatStatus");
  const submitButton = document.getElementById("chatSubmit");
  const clearButton = document.getElementById("clearChat");

  if (!form || !input || !chatWindow || !status || !submitButton) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = input.value.trim();

    if (!question) {
      showFormStatus(status, "Please enter a question first.", "error");
      return;
    }

    appendChatMessage(chatWindow, question, "user");
    input.value = "";

    const originalButtonText = submitButton.textContent;

    try {
      showFormStatus(status, "Asking Solvanta...", "");

      submitButton.disabled = true;
      submitButton.textContent = "Thinking...";

      const response = await fetch(SOLVANTA_BACKEND_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "askSolvanta",
          question,
          source: "solvanta-chatbot"
        })
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || "Chatbot request failed.");
      }

      appendChatMessage(
        chatWindow,
        data.answer || "I responded, but apparently forgot to say anything useful.",
        "bot"
      );

      showFormStatus(status, "Response received.", "success");
      logToolUsage("Ask Solvanta", "chatbot_question_answered", "ask");
    } catch (error) {
      console.error("Ask Solvanta error:", error);

      appendChatMessage(
        chatWindow,
        "I could not answer that right now. The backend may be overthinking its life choices.",
        "bot"
      );

      showFormStatus(status, "Ask Solvanta could not respond.", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  });

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      chatWindow.innerHTML = `
        <div class="chat-message bot">
          <p>
            Hello. I am Ask Solvanta. I can explain the site, suggest workflow ideas,
            help with writing direction, and lightly roast spreadsheet chaos.
          </p>
        </div>
      `;

      showFormStatus(status, "", "");
      logToolUsage("Ask Solvanta", "chat_cleared", "ask");
    });
  }
}

function appendChatMessage(chatWindow, message, type) {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${type}`;

  const paragraph = document.createElement("p");
  paragraph.textContent = message;

  wrapper.appendChild(paragraph);
  chatWindow.appendChild(wrapper);

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* -----------------------------
   SURVIVAL TABS
----------------------------- */

function initSurvivalTabs() {
  const tabs = document.querySelectorAll("[data-survival]");
  const survivalViews = document.querySelectorAll(".survival-view");

  if (!tabs.length || !survivalViews.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const selected = tab.dataset.survival;

      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");

      survivalViews.forEach((view) => {
        view.classList.toggle(
          "active-survival",
          view.id === `survival-${selected}`
        );
      });

      logToolUsage("Survival Kit", `${selected}_tab_opened`, "survival");
    });
  });
}

/* -----------------------------
   DEVICE CHECK
----------------------------- */

function initDeviceCheck() {
  const selectors = {
    camera: document.getElementById("cameraSelect"),
    mic: document.getElementById("micSelect"),
    speaker: document.getElementById("speakerSelect")
  };

  populateDeviceSelectors(selectors);

  if (navigator.mediaDevices?.addEventListener) {
    navigator.mediaDevices.addEventListener("devicechange", () => {
      populateDeviceSelectors(selectors);
    });
  }

  initCameraCheck(selectors.camera);
  initMicrophoneCheck(selectors.mic);
  initSpeakerCheck(selectors.speaker);
}

async function populateDeviceSelectors(selectors) {
  if (!navigator.mediaDevices?.enumerateDevices) {
    setUnavailable(selectors.camera, "Device list not supported");
    setUnavailable(selectors.mic, "Device list not supported");
    setUnavailable(selectors.speaker, "Speaker list not supported");
    return;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();

    fillSelect(
      selectors.camera,
      devices.filter((device) => device.kind === "videoinput"),
      "Default camera",
      "Camera"
    );

    fillSelect(
      selectors.mic,
      devices.filter((device) => device.kind === "audioinput"),
      "Default microphone",
      "Microphone"
    );

    fillSelect(
      selectors.speaker,
      devices.filter((device) => device.kind === "audiooutput"),
      "Default speaker",
      "Speaker"
    );

    if (!HTMLMediaElement.prototype.setSinkId && selectors.speaker) {
      selectors.speaker.innerHTML = "";
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Speaker selection limited in this browser";
      selectors.speaker.appendChild(option);
      selectors.speaker.disabled = true;
    }
  } catch {
    setUnavailable(selectors.camera, "Camera list unavailable");
    setUnavailable(selectors.mic, "Microphone list unavailable");
    setUnavailable(selectors.speaker, "Speaker list unavailable");
  }
}

function fillSelect(select, devices, defaultText, labelPrefix) {
  if (!select) return;

  const previousValue = select.value;
  select.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = defaultText;
  select.appendChild(defaultOption);

  devices.forEach((device, index) => {
    const option = document.createElement("option");
    option.value = device.deviceId;
    option.textContent = device.label || `${labelPrefix} ${index + 1}`;
    select.appendChild(option);
  });

  select.disabled = false;

  if ([...select.options].some((option) => option.value === previousValue)) {
    select.value = previousValue;
  }
}

function setUnavailable(select, message) {
  if (!select) return;

  select.innerHTML = "";
  const option = document.createElement("option");
  option.value = "";
  option.textContent = message;
  select.appendChild(option);
  select.disabled = true;
}

function initCameraCheck(cameraSelect) {
  const startCamera = document.getElementById("startCamera");
  const stopCamera = document.getElementById("stopCamera");
  const cameraPreview = document.getElementById("cameraPreview");
  const cameraStatus = document.getElementById("cameraStatus");

  if (!startCamera || !stopCamera || !cameraPreview || !cameraStatus) return;

  let cameraStream = null;

  async function startSelectedCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraStatus.textContent = "Camera access is not supported in this browser.";
      return;
    }

    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
    }

    const selectedCamera = cameraSelect?.value;

    const constraints = {
      video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true
    };

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
      cameraPreview.srcObject = cameraStream;

      const activeTrack = cameraStream.getVideoTracks()[0];

      cameraStatus.textContent = activeTrack?.label
        ? `Camera running: ${activeTrack.label}. Looking professional is still optional.`
        : "Camera running. Looking professional is still optional.";

      populateDeviceSelectors({
        camera: document.getElementById("cameraSelect"),
        mic: document.getElementById("micSelect"),
        speaker: document.getElementById("speakerSelect")
      });

      logToolUsage("Device Check", "camera_started", "survival");
    } catch {
      cameraStatus.textContent =
        "Camera could not start. Permission may be blocked, or the selected camera is unavailable.";
    }
  }

  startCamera.addEventListener("click", startSelectedCamera);

  cameraSelect?.addEventListener("change", () => {
    if (cameraStream) startSelectedCamera();
  });

  stopCamera.addEventListener("click", () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
      cameraPreview.srcObject = null;
      cameraStatus.textContent = "Camera stopped.";
      logToolUsage("Device Check", "camera_stopped", "survival");
    }
  });
}

function initMicrophoneCheck(micSelect) {
  const startMic = document.getElementById("startMic");
  const stopMic = document.getElementById("stopMic");
  const micLevel = document.getElementById("micLevel");
  const micStatus = document.getElementById("micStatus");

  if (!startMic || !stopMic || !micLevel || !micStatus) return;

  let micStream = null;
  let audioContext = null;
  let animationFrame = null;

  async function startSelectedMic() {
    if (!navigator.mediaDevices?.getUserMedia) {
      micStatus.textContent = "Microphone access is not supported in this browser.";
      return;
    }

    stopMicStream();

    const selectedMic = micSelect?.value;

    const constraints = {
      audio: selectedMic ? { deviceId: { exact: selectedMic } } : true
    };

    try {
      micStream = await navigator.mediaDevices.getUserMedia(constraints);
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

      const activeTrack = micStream.getAudioTracks()[0];

      micStatus.textContent = activeTrack?.label
        ? `Microphone running: ${activeTrack.label}. The little bar is now emotionally invested.`
        : "Microphone running. The little bar is now emotionally invested.";

      populateDeviceSelectors({
        camera: document.getElementById("cameraSelect"),
        mic: document.getElementById("micSelect"),
        speaker: document.getElementById("speakerSelect")
      });

      logToolUsage("Device Check", "microphone_started", "survival");
    } catch {
      micStatus.textContent =
        "Microphone could not start. Permission may be blocked, or the selected mic is unavailable.";
    }
  }

  function stopMicStream() {
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
  }

  startMic.addEventListener("click", startSelectedMic);

  micSelect?.addEventListener("change", () => {
    if (micStream) startSelectedMic();
  });

  stopMic.addEventListener("click", () => {
    stopMicStream();
    micStatus.textContent = "Microphone stopped.";
    logToolUsage("Device Check", "microphone_stopped", "survival");
  });
}

function initSpeakerCheck() {
  const playSound = document.getElementById("playSound");
  const speakerStatus = document.getElementById("speakerStatus");

  if (!playSound || !speakerStatus) return;

  playSound.addEventListener("click", async () => {
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

      logToolUsage("Device Check", "speaker_test_played", "survival");
    } catch {
      speakerStatus.textContent =
        "Could not play the test sound. Your browser may be blocking audio or speaker selection.";
    }
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
    "The best tools are simple enough that people actually use them, useful enough that they save time, and calm enough that nobody needs a training session. If a tool requires three manuals and a motivational speech, congratulations, you have invented another problem."
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

    logToolUsage("Typing Test", "typing_test_started", "survival");
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

    logToolUsage("Reaction Test", "reaction_test_started", "survival");
  });

  box.addEventListener("click", () => {
    if (waiting) {
      clearTimeout(timeoutId);
      waiting = false;
      ready = false;

      box.classList.remove("waiting", "ready");
      box.textContent = "Too soon";
      result.textContent = "Too early. That was not confidence. That was chaos.";
      logToolUsage("Reaction Test", "clicked_too_soon", "survival");
      return;
    }

    if (ready) {
      const reactionTime = Date.now() - readyTime;
      ready = false;

      box.classList.remove("waiting", "ready");
      box.textContent = `${reactionTime} ms`;
      result.textContent = `Reaction time: ${reactionTime} ms. Not bad, human.`;
      logToolUsage("Reaction Test", `reaction_completed_${reactionTime}ms`, "survival");
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
          logToolUsage("Aptitude Practice", "answered_correctly", "survival");
        } else {
          result.textContent = `Not quite. Correct answer: ${currentQuestion.answer}. ${currentQuestion.explanation}`;
          logToolUsage("Aptitude Practice", "answered_incorrectly", "survival");
        }
      });

      answers.appendChild(button);
    });

    logToolUsage("Aptitude Practice", "new_question_loaded", "survival");
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
        logToolUsage("Chart Quiz", "answered_correctly", "survival");
      } else {
        result.textContent =
          "Not quite. D is the highest bar. The chart would like a second chance.";
        logToolUsage("Chart Quiz", "answered_incorrectly", "survival");
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
