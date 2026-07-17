const screens = [...document.querySelectorAll(".screen")];
const stepLabel = document.querySelector("#stepLabel");
const otpTimer = document.querySelector("#otpTimer");
let current = 0;
let otpCountdown = 38;
let otpInterval;

function updateOtpTimer() {
  if (!otpTimer) return;
  otpTimer.textContent = otpCountdown > 0 ? `${otpCountdown} seconds` : "now";
}

function startOtpCountdown() {
  if (!otpTimer || otpInterval) return;
  updateOtpTimer();
  otpInterval = setInterval(() => {
    otpCountdown = Math.max(0, otpCountdown - 1);
    updateOtpTimer();
    if (otpCountdown === 0) {
      clearInterval(otpInterval);
      otpInterval = undefined;
    }
  }, 1000);
}

function showScreen(index, enterAnimation) {
  const previous = current;
  current = Math.max(0, Math.min(index, screens.length - 1));
  screens.forEach((screen, i) => {
    screen.classList.toggle("active", i === current);
    screen.classList.remove("enter-from-right", "enter-from-bottom");
  });
  if (enterAnimation) {
    screens[current].classList.add(enterAnimation);
  } else if (previous === 0 && current === 1) {
    screens[current].classList.add("enter-from-right");
  }
  if (stepLabel) stepLabel.textContent = `${current + 1} / ${screens.length}`;
  if (current === 2) startOtpCountdown();
}

document.querySelector("[data-prev]")?.addEventListener("click", () => showScreen(current - 1));
document.querySelector("[data-next-global]")?.addEventListener("click", () => showScreen(current + 1));
document.querySelectorAll("[data-next]").forEach((button) => {
  button.addEventListener("click", () => showScreen(current + 1));
});

document.querySelectorAll(".chips button").forEach((button) => {
  button.addEventListener("click", () => button.classList.toggle("selected"));
});

document.querySelectorAll(".segment button, .field-select button").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.closest(".segment, .field-select");
    if (!group) return;
    group.querySelectorAll("button").forEach((option) => option.classList.remove("selected"));
    button.classList.add("selected");
  });
});

document.querySelectorAll(".otp-grid input").forEach((input, index, inputs) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, 1);
    if (input.value && inputs[index + 1]) inputs[index + 1].focus();
    const isOtpComplete = [...inputs].every((field) => field.value.length === 1);
    if (isOtpComplete) {
      setTimeout(() => showScreen(3), 180);
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !input.value && inputs[index - 1]) {
      inputs[index - 1].focus();
    }
  });
});

document.querySelectorAll(".range").forEach((range) => {
  const minInput = range.querySelector(".range-input-min");
  const maxInput = range.querySelector(".range-input-max");
  const minHandle = range.querySelector('[data-handle="min"]');
  const maxHandle = range.querySelector('[data-handle="max"]');
  const fill = range.querySelector(".range-fill");
  const labelTargetId = range.dataset.rangeLabelTarget;
  const label = labelTargetId
    ? document.getElementById(labelTargetId)
    : range.closest(".range-row")?.querySelector("[data-range-label]");
  if (!minInput || !maxInput || !minHandle || !maxHandle || !fill || !label) return;

  const min = Number(range.dataset.rangeMin);
  const max = Number(range.dataset.rangeMax);
  const prefix = range.dataset.rangePrefix || "";
  const handleSize = 20;

  function formatValue(value) {
    return prefix ? value.toLocaleString("en-IN") : String(value);
  }

  function setSliderValues(changedInput) {
    let low = Number(minInput.value);
    let high = Number(maxInput.value);

    if (low > high) {
      if (changedInput === minInput) {
        high = low;
        maxInput.value = String(high);
      } else {
        low = high;
        minInput.value = String(low);
      }
    }

    const lowPercent = ((low - min) / (max - min)) * 100;
    const highPercent = ((high - min) / (max - min)) * 100;
    const usableWidth = range.clientWidth - handleSize;
    const lowPx = (lowPercent / 100) * usableWidth;
    const highPx = (highPercent / 100) * usableWidth;

    minHandle.style.left = `${lowPx}px`;
    maxHandle.style.left = `${highPx}px`;
    fill.style.left = `${lowPx + handleSize / 2}px`;
    fill.style.width = `${Math.max(0, highPx - lowPx)}px`;
    label.textContent = `${prefix}${formatValue(low)}-${formatValue(high)}`;
  }

  minInput.addEventListener("input", () => setSliderValues(minInput));
  maxInput.addEventListener("input", () => setSliderValues(maxInput));
  setSliderValues();
});

const HEART_ICON_DEFAULT = "./assets/icons/Property_1_Default.svg";
const HEART_ICON_LIKED = "./assets/icons/Property_1_Variant2.svg";

document.querySelectorAll("[data-like-button]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const isLiked = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!isLiked));
    const icon = button.querySelector("[data-heart-icon]");
    if (icon) icon.src = isLiked ? HEART_ICON_DEFAULT : HEART_ICON_LIKED;
  });
});

document.querySelectorAll("[data-goto]").forEach((el) => {
  el.addEventListener("click", () => showScreen(Number(el.dataset.goto)));
  if (el.getAttribute("role") === "button") {
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showScreen(Number(el.dataset.goto));
      }
    });
  }
});

const phone = document.querySelector(".phone");

function openTray(trayId) {
  document.querySelectorAll(".tray").forEach((tray) => tray.classList.remove("tray-active"));
  const targetTray = document.querySelector(`#${trayId || "trayDharamshala"}`);
  targetTray?.classList.add("tray-active");
  phone.classList.add("tray-open");
}

function closeTray() {
  phone.classList.remove("tray-open");
  document.querySelectorAll(".tray").forEach((tray) => tray.classList.remove("tray-active"));
}

document.querySelectorAll("[data-open-tray]").forEach((card) => {
  card.addEventListener("click", () => openTray(card.dataset.openTray));
});
document.querySelector("[data-tray-overlay]")?.addEventListener("click", closeTray);
document.querySelectorAll("[data-tray-handle]").forEach((handle) => {
  handle.addEventListener("click", closeTray);
});

document.querySelector("[data-dismiss-verify-card]")?.addEventListener("click", () => {
  const verifyCard = document.querySelector("#verifyCard");
  if (!verifyCard) return;
  verifyCard.style.overflow = "hidden";
  verifyCard.style.maxHeight = `${verifyCard.scrollHeight}px`;
  requestAnimationFrame(() => {
    verifyCard.style.transition = "max-height 220ms ease, opacity 220ms ease, margin-bottom 220ms ease";
    verifyCard.style.maxHeight = "0px";
    verifyCard.style.opacity = "0";
    verifyCard.style.marginBottom = "0px";
  });
  verifyCard.addEventListener("transitionend", () => verifyCard.remove(), { once: true });
});

// ---------- Horizontal card row scrolling (mouse drag + wheel) ----------

document.querySelectorAll(".hscroll").forEach((row) => {
  let isDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let moved = false;

  row.addEventListener("mousedown", (event) => {
    isDown = true;
    moved = false;
    row.classList.add("dragging");
    startX = event.pageX;
    startScrollLeft = row.scrollLeft;
  });

  window.addEventListener("mouseup", () => {
    if (!isDown) return;
    isDown = false;
    row.classList.remove("dragging");
  });

  row.addEventListener("mouseleave", () => {
    isDown = false;
    row.classList.remove("dragging");
  });

  row.addEventListener("mousemove", (event) => {
    if (!isDown) return;
    const delta = event.pageX - startX;
    if (Math.abs(delta) > 3) moved = true;
    row.scrollLeft = startScrollLeft - delta;
  });

  // Prevent the click on a card from firing right after a drag
  row.addEventListener(
    "click",
    (event) => {
      if (moved) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true
  );

  row.addEventListener(
    "wheel",
    (event) => {
      if (row.scrollWidth <= row.clientWidth) return;
      row.scrollLeft += event.deltaY !== 0 ? event.deltaY : event.deltaX;
      event.preventDefault();
    },
    { passive: false }
  );
});

const splashVideo = document.querySelector("#splashVideo");

if (splashVideo) {
  const tryPlay = () => {
    const playPromise = splashVideo.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay blocked (common in sandboxed preview environments) —
        // fall back to playing on the first tap anywhere on the splash screen.
        const splashScreen = splashVideo.closest(".splash");
        const resumeOnTap = () => {
          splashVideo.play().catch(() => {});
        };
        splashScreen?.addEventListener("click", resumeOnTap, { once: true });
      });
    }
  };

  if (splashVideo.readyState >= 2) {
    tryPlay();
  } else {
    splashVideo.addEventListener("loadeddata", tryPlay, { once: true });
  }

  splashVideo.addEventListener("ended", () => {
    if (current === 0) showScreen(1);
  });
}

setTimeout(() => {
  if (current === 0) showScreen(1);
}, 2500);

// ---------- Birthdate field ----------

const birthdateInput = document.querySelector("#birthdateInput");
const birthdateError = document.querySelector("#birthdateError");

function formatBirthdate(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  let out = day;
  if (digits.length > 2) out += `/${month}`;
  if (digits.length > 4) out += `/${year}`;
  return out;
}

function validateBirthdate(value) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year <= 1950 || year >= 2026) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return false;
  return true;
}

if (birthdateInput) {
  birthdateInput.addEventListener("input", () => {
    const cursorWasAtEnd = birthdateInput.selectionEnd === birthdateInput.value.length;
    birthdateInput.value = formatBirthdate(birthdateInput.value);
    if (cursorWasAtEnd) {
      birthdateInput.selectionStart = birthdateInput.selectionEnd = birthdateInput.value.length;
    }
    birthdateInput.classList.remove("invalid");
    birthdateError.hidden = true;
    birthdateError.classList.remove("error");
  });

  birthdateInput.addEventListener("blur", () => {
    if (!birthdateInput.value) return;
    const isValid = validateBirthdate(birthdateInput.value);
    birthdateInput.classList.toggle("invalid", !isValid);
    birthdateError.hidden = isValid;
    birthdateError.classList.toggle("error", !isValid);
  });
}

// ---------- Language preference autocomplete ----------

const LANGUAGES = [
  "English", "Hindi", "Spanish", "French", "German", "Italian", "Portuguese",
  "Mandarin", "Japanese", "Korean", "Arabic", "Russian", "Bengali", "Punjabi",
  "Tamil", "Telugu", "Marathi", "Gujarati", "Kannada", "Malayalam", "Urdu",
  "Dutch", "Swedish", "Turkish", "Vietnamese", "Thai", "Indonesian", "Polish",
  "Greek", "Hebrew",
];

const langField = document.querySelector("#langField");
const langInput = document.querySelector("#langInput");
const langChips = document.querySelector("#langChips");
const langSuggestions = document.querySelector("#langSuggestions");
const selectedLanguages = [];

function renderChips() {
  langChips.innerHTML = "";
  selectedLanguages.forEach((language) => {
    const chip = document.createElement("span");
    chip.className = "lang-chip";
    chip.innerHTML = `<span>${language}</span>`;
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "lang-chip-remove";
    removeButton.setAttribute("aria-label", `Remove ${language}`);
    removeButton.textContent = "×";
    removeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const index = selectedLanguages.indexOf(language);
      if (index > -1) selectedLanguages.splice(index, 1);
      renderChips();
    });
    chip.appendChild(removeButton);
    langChips.appendChild(chip);
  });
}

function renderSuggestions() {
  const query = langInput.value.trim().toLowerCase();
  langSuggestions.innerHTML = "";

  if (!query) {
    langSuggestions.hidden = true;
    return;
  }

  const matches = LANGUAGES.filter(
    (language) =>
      language.toLowerCase().includes(query) && !selectedLanguages.includes(language)
  ).slice(0, 6);

  if (matches.length === 0) {
    const empty = document.createElement("li");
    empty.className = "lang-empty";
    empty.textContent = "No matching languages";
    langSuggestions.appendChild(empty);
    langSuggestions.hidden = false;
    return;
  }

  matches.forEach((language) => {
    const item = document.createElement("li");
    item.textContent = language;
    item.addEventListener("click", () => {
      selectedLanguages.push(language);
      renderChips();
      langInput.value = "";
      langSuggestions.hidden = true;
      langInput.focus();
    });
    langSuggestions.appendChild(item);
  });

  langSuggestions.hidden = false;
}

if (langInput) {
  langInput.addEventListener("input", renderSuggestions);
  langInput.addEventListener("focus", renderSuggestions);

  document.addEventListener("click", (event) => {
    if (!langField.contains(event.target)) {
      langSuggestions.hidden = true;
    }
  });

  langInput.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !langInput.value && selectedLanguages.length) {
      selectedLanguages.pop();
      renderChips();
    }
  });
}

// ---------- Filters travel-style chips ----------

document.querySelectorAll(".chip-outline").forEach((button) => {
  button.addEventListener("click", () => button.classList.toggle("selected"));
});

// ---------- Filters calendar ----------

const calendarToggle = document.querySelector("#calendarToggle");
const calendarChevron = document.querySelector("#calendarChevron");
const filtersCalendar = document.querySelector("#filtersCalendar");
const calendarMonthLabel = document.querySelector("#calendarMonthLabel");
const calendarGrid = document.querySelector("#calendarGrid");
const calendarPrev = document.querySelector("#calendarPrev");
const calendarNext = document.querySelector("#calendarNext");

if (calendarToggle && filtersCalendar) {
  let viewYear = 2026;
  let viewMonth = 7; // August (0-indexed)
  let rangeStart = new Date(2026, 7, 11);
  let rangeEnd = new Date(2026, 7, 15);

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function renderCalendar() {
    calendarMonthLabel.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
    calendarGrid.innerHTML = "";

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    // Convert Sunday=0..Saturday=6 to Monday-first index
    const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < leadingBlanks; i += 1) {
      const blank = document.createElement("button");
      blank.className = "calendar-day";
      blank.disabled = true;
      calendarGrid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const cellDate = new Date(viewYear, viewMonth, day);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "calendar-day";
      cell.textContent = String(day);

      if (rangeStart && rangeEnd && cellDate > rangeStart && cellDate < rangeEnd) {
        cell.classList.add("in-range");
      }
      if (sameDay(cellDate, rangeStart)) cell.classList.add("range-start");
      if (sameDay(cellDate, rangeEnd)) cell.classList.add("range-end");

      cell.addEventListener("click", () => {
        if (!rangeStart || (rangeStart && rangeEnd)) {
          rangeStart = cellDate;
          rangeEnd = null;
        } else if (cellDate < rangeStart) {
          rangeEnd = rangeStart;
          rangeStart = cellDate;
        } else {
          rangeEnd = cellDate;
        }
        renderCalendar();
      });

      calendarGrid.appendChild(cell);
    }
  }

  calendarToggle.addEventListener("click", () => {
    const isHidden = filtersCalendar.hidden;
    filtersCalendar.hidden = !isHidden;
    calendarChevron.classList.toggle("expanded", isHidden);
    if (isHidden) renderCalendar();
  });

  calendarPrev?.addEventListener("click", () => {
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    renderCalendar();
  });

  calendarNext?.addEventListener("click", () => {
    viewMonth += 1;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
    renderCalendar();
  });
}

// ---------- Search screen ----------

const LOCATION_SUGGESTIONS = [
  "Jaipur, Rajasthan",
  "Jagatpura, Rajasthan",
  "Jaisalmer, Rajasthan",
  "Vaishali Nagar",
  "Goa",
  "Udupi, Karnataka",
  "Dharamshala, Himachal",
  "Leh, Ladakh",
  "Nainital, Uttarakhand",
  "Agra, Uttar Pradesh",
  "Mussoorie, Uttarakhand",
];

const MAP_PIN_ICON = "./assets/icons/li_map-pin.svg";
const openSearchScreenBtn = document.querySelector("#openSearchScreen");
const locationSearchInput = document.querySelector("#locationSearchInput");
const searchSuggestions = document.querySelector("#searchSuggestions");

function renderSearchSuggestions(query) {
  if (!searchSuggestions) return;
  searchSuggestions.innerHTML = "";

  const trimmed = query.trim().toLowerCase();
  const matches = trimmed
    ? LOCATION_SUGGESTIONS.filter((place) => place.toLowerCase().includes(trimmed))
    : LOCATION_SUGGESTIONS;

  if (matches.length === 0) {
    const empty = document.createElement("p");
    empty.className = "search-empty";
    empty.textContent = "No matching places";
    searchSuggestions.appendChild(empty);
    return;
  }

  matches.forEach((place) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-suggestion";
    button.innerHTML = `<img src="${MAP_PIN_ICON}" alt="" />${place}`;
    button.addEventListener("click", () => showScreen(7));
    searchSuggestions.appendChild(button);
  });
}

openSearchScreenBtn?.addEventListener("click", () => {
  showScreen(8, "enter-from-bottom");
  if (locationSearchInput) {
    locationSearchInput.value = "";
    renderSearchSuggestions("");
    setTimeout(() => locationSearchInput.focus(), 380);
  }
});

locationSearchInput?.addEventListener("input", () => {
  renderSearchSuggestions(locationSearchInput.value);
});

// ---------- Profile screen accordion ----------

document.querySelectorAll(".profile-pencil-icon").forEach((pencil) => {
  pencil.addEventListener("click", (event) => event.stopPropagation());
});

document.querySelectorAll(".profile-card-head").forEach((head) => {
  head.style.cursor = "pointer";
  head.addEventListener("click", () => {
    const card = head.closest(".profile-card");
    card?.classList.toggle("collapsed");
  });
});

// ---------- Identity Verification screen ----------

const VERIFY_SCREEN_INDEX = 10;
let verifyReturnScreen = 6;

document
  .querySelectorAll(".verify-cta, .tray-verify-btn, .profile-verify-pill")
  .forEach((button) => {
    button.addEventListener("click", () => {
      verifyReturnScreen = current;
      closeTray();
      resetVerifyScreen();
      showScreen(VERIFY_SCREEN_INDEX, "enter-from-bottom");
    });
  });

document.querySelector("#verifyBackBtn")?.addEventListener("click", () => {
  showScreen(verifyReturnScreen);
});

// ---------- Identity Verification: simulated file upload ----------

const verifyFilePreview = document.querySelector("#verifyFilePreview");
const verifyCameraBtn = document.querySelector("#verifyCameraBtn");
const verifyUploadBtn = document.querySelector("#verifyUploadBtn");
const verifySubmitBtn = document.querySelector("#verifySubmitBtn");

function markFileUploaded() {
  if (verifyFilePreview) verifyFilePreview.hidden = false;
  if (verifyCameraBtn) verifyCameraBtn.querySelector("span").textContent = "Take another picture";
  if (verifyUploadBtn) verifyUploadBtn.querySelector("span").textContent = "Upload different file";
  if (verifySubmitBtn) verifySubmitBtn.hidden = false;
}

function resetVerifyScreen() {
  if (verifyFilePreview) verifyFilePreview.hidden = true;
  if (verifyCameraBtn) verifyCameraBtn.querySelector("span").textContent = "Take a picture";
  if (verifyUploadBtn) verifyUploadBtn.querySelector("span").textContent = "Upload from device";
  if (verifySubmitBtn) verifySubmitBtn.hidden = true;
}

verifyCameraBtn?.addEventListener("click", markFileUploaded);
verifyUploadBtn?.addEventListener("click", markFileUploaded);

verifySubmitBtn?.addEventListener("click", () => {
  document.querySelectorAll(".profile-verify-pill").forEach((pill) => {
    pill.hidden = true;
  });
  document.querySelectorAll(".profile-verify-complete").forEach((complete) => {
    complete.hidden = false;
  });
  showScreen(verifyReturnScreen);
});

// ---------- Create Trip: date calendar (step 2) ----------

const tripCalendarMonthLabel = document.querySelector("#tripCalendarMonthLabel");
const tripCalendarGrid = document.querySelector("#tripCalendarGrid");
const tripCalendarPrev = document.querySelector("#tripCalendarPrev");
const tripCalendarNext = document.querySelector("#tripCalendarNext");

if (tripCalendarGrid) {
  let tripViewYear = 2026;
  let tripViewMonth = 6; // July (0-indexed)
  let tripRangeStart = null;
  let tripRangeEnd = null;

  const MONTH_NAMES_TRIP = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  function tripSameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function renderTripCalendar() {
    tripCalendarMonthLabel.textContent = `${MONTH_NAMES_TRIP[tripViewMonth]} ${tripViewYear}`;
    tripCalendarGrid.innerHTML = "";

    const firstOfMonth = new Date(tripViewYear, tripViewMonth, 1);
    const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(tripViewYear, tripViewMonth + 1, 0).getDate();

    for (let i = 0; i < leadingBlanks; i += 1) {
      const blank = document.createElement("button");
      blank.className = "calendar-day";
      blank.disabled = true;
      tripCalendarGrid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const cellDate = new Date(tripViewYear, tripViewMonth, day);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "calendar-day";
      cell.textContent = String(day);

      if (tripRangeStart && tripRangeEnd && cellDate > tripRangeStart && cellDate < tripRangeEnd) {
        cell.classList.add("in-range");
      }
      if (tripSameDay(cellDate, tripRangeStart)) cell.classList.add("range-start");
      if (tripSameDay(cellDate, tripRangeEnd)) cell.classList.add("range-end");

      cell.addEventListener("click", () => {
        if (!tripRangeStart || (tripRangeStart && tripRangeEnd)) {
          tripRangeStart = cellDate;
          tripRangeEnd = null;
        } else if (cellDate < tripRangeStart) {
          tripRangeEnd = tripRangeStart;
          tripRangeStart = cellDate;
        } else {
          tripRangeEnd = cellDate;
        }
        renderTripCalendar();
      });

      tripCalendarGrid.appendChild(cell);
    }
  }

  tripCalendarPrev?.addEventListener("click", () => {
    tripViewMonth -= 1;
    if (tripViewMonth < 0) {
      tripViewMonth = 11;
      tripViewYear -= 1;
    }
    renderTripCalendar();
  });

  tripCalendarNext?.addEventListener("click", () => {
    tripViewMonth += 1;
    if (tripViewMonth > 11) {
      tripViewMonth = 0;
      tripViewYear += 1;
    }
    renderTripCalendar();
  });

  renderTripCalendar();
}

// ---------- Create Trip: single-value slider (step 3) ----------

document.querySelectorAll(".single-range").forEach((slider) => {
  const input = slider.querySelector(".range-input");
  const handle = slider.querySelector('[data-handle="single"]');
  const fill = slider.querySelector(".single-range-fill");
  const targetId = slider.dataset.singleRangeTarget;
  const label = targetId ? document.getElementById(targetId) : null;
  if (!input || !handle || !fill) return;

  const min = Number(slider.dataset.singleRangeMin);
  const max = Number(slider.dataset.singleRangeMax);
  const handleSize = 20;

  function updateSingleRange() {
    const value = Number(input.value);
    const percent = ((value - min) / (max - min)) * 100;
    const usableWidth = slider.clientWidth - handleSize;
    const px = (percent / 100) * usableWidth;

    handle.style.left = `${px}px`;
    fill.style.width = `${px + handleSize / 2}px`;
    if (label) label.textContent = String(value);
  }

  input.addEventListener("input", updateSingleRange);
  updateSingleRange();
});

// ---------- Messages screen tabs ----------

document.querySelectorAll(".messages-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetPanel = tab.dataset.messagesTab;

    document.querySelectorAll(".messages-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    document.querySelectorAll(".messages-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.messagesPanel === targetPanel);
    });
  });
});

// ---------- Sent Requests: flip card ----------

const requestFlipInner = document.querySelector("#requestFlipInner");

document.querySelectorAll(".messages-flip-card").forEach((card) => {
  const faces = card.querySelectorAll(".messages-flip-face");
  const tallest = Math.max(...Array.from(faces).map((face) => face.scrollHeight));
  if (tallest > 0) card.style.height = `${tallest}px`;
});

document.querySelectorAll("[data-flip-request]").forEach((button) => {
  button.addEventListener("click", () => {
    requestFlipInner?.classList.toggle("flipped");
  });
});

// ---------- Group Info: places-to-visit voting ----------

const PLACE_VOTER_AVATARS = {
  sameer: "./assets/tray/sameer.png",
  agastya: "./assets/tray/agastya.png",
  jiya: "./assets/tray/jiya.png",
  you: "./assets/icons/li_user-circle-2.svg",
};

const THUMBS_UP_FILLED = "./assets/icons/li_thumbs-up-1.svg";
const THUMBS_UP_OUTLINE = "./assets/icons/li_thumbs-up.svg";

function renderPlaceVoteRow(row) {
  const others = (row.dataset.placeVoters || "").split(",").filter(Boolean);
  const youVoted = row.dataset.placeYouVoted === "true";
  const avatarNames = youVoted ? [...others, "you"] : others;

  const avatarsWrap = row.querySelector(".place-voter-avatars");
  const voteBtn = row.querySelector(".place-vote-btn");

  if (avatarsWrap) {
    avatarsWrap.innerHTML = avatarNames
      .map((name) => `<img src="${PLACE_VOTER_AVATARS[name]}" alt="" />`)
      .join("");
  }

  if (voteBtn) {
    voteBtn.innerHTML = `<img src="${youVoted ? THUMBS_UP_FILLED : THUMBS_UP_OUTLINE}" alt="" />`;
  }
}

document.querySelectorAll("[data-place-voters]").forEach((row) => {
  renderPlaceVoteRow(row);

  const voteBtn = row.querySelector(".place-vote-btn");
  voteBtn?.addEventListener("click", () => {
    const youVoted = row.dataset.placeYouVoted === "true";
    row.dataset.placeYouVoted = String(!youVoted);
    renderPlaceVoteRow(row);
  });
});

// ---------- Report / Leave modal overlay ----------

const modalOverlay = document.querySelector("#modalOverlay");
const reportModalTitle = document.querySelector("#reportModalTitle");

function openModal(modalId, reportTarget) {
  if (!modalOverlay) return;
  modalOverlay.querySelectorAll(".modal-card").forEach((card) => {
    card.hidden = card.id !== modalId;
  });
  if (modalId === "reportModal" && reportModalTitle) {
    reportModalTitle.textContent = `State the reason for reporting ${reportTarget || "group"}`;
  }
  modalOverlay.classList.add("open");
}

function closeModal() {
  modalOverlay?.classList.remove("open");
}

document.querySelectorAll("[data-open-modal]").forEach((button) => {
  button.addEventListener("click", () => openModal(button.dataset.openModal, button.dataset.reportTarget));
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeModal);
});

modalOverlay?.addEventListener("click", (event) => {
  if (event.target === modalOverlay) closeModal();
});

// ---------- Chat: sending messages ----------

const chatScroll = document.querySelector("#chatScroll");
const chatMessageInput = document.querySelector("#chatMessageInput");
const chatSendBtn = document.querySelector("#chatSendBtn");
const chatSendBtnIcon = document.querySelector("#chatSendBtnIcon");

const MIC_ICON_SRC = "./assets/icons/li_mic.svg";
const SEND_ICON_SVG =
  "data:image/svg+xml;base64," +
  btoa(
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.4 20.4l17.45-8.4a1 1 0 000-1.8L3.4 1.8a1 1 0 00-1.4 1.1L4.5 12l-2.5 9.1a1 1 0 001.4 1.1z" fill="#fff"/></svg>'
  );

function formatChatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

function updateChatSendIcon() {
  if (!chatMessageInput || !chatSendBtnIcon) return;
  const hasText = chatMessageInput.value.trim().length > 0;
  chatSendBtnIcon.src = hasText ? SEND_ICON_SVG : MIC_ICON_SRC;
  chatSendBtn?.setAttribute("aria-label", hasText ? "Send message" : "Record voice message");
}

function sendChatMessage() {
  if (!chatMessageInput || !chatScroll) return;
  const text = chatMessageInput.value.trim();
  if (!text) return;

  const row = document.createElement("div");
  row.className = "chat-bubble-row sent";
  row.innerHTML = `
    <div class="chat-bubble-col">
      <div class="chat-bubble chat-bubble-sent"></div>
      <span class="chat-time"></span>
    </div>
  `;
  row.querySelector(".chat-bubble-sent").textContent = text;
  row.querySelector(".chat-time").textContent = formatChatTime(new Date());

  chatScroll.appendChild(row);
  chatScroll.scrollTop = chatScroll.scrollHeight;

  chatMessageInput.value = "";
  updateChatSendIcon();
}

chatMessageInput?.addEventListener("input", updateChatSendIcon);

chatMessageInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendChatMessage();
  }
});

chatSendBtn?.addEventListener("click", () => {
  if (chatMessageInput && chatMessageInput.value.trim().length > 0) {
    sendChatMessage();
  }
});
