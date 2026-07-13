(function () {
  "use strict";

  let scheduleData = [];
  let branchCodes = {};

  const deptSelect = document.getElementById("dept-select");
  const regInput = document.getElementById("reg-input");
  const tabDept = document.getElementById("tab-dept");
  const tabReg = document.getElementById("tab-reg");
  const panelDept = document.getElementById("panel-dept");
  const panelReg = document.getElementById("panel-reg");
  const btnDeptSearch = document.getElementById("btn-dept-search");
  const btnRegSearch = document.getElementById("btn-reg-search");
  const btnReset = document.getElementById("btn-reset");
  const errorMsg = document.getElementById("error-msg");
  const resultsSection = document.getElementById("results");
  const lookupCard = document.getElementById("lookup-card");
  const resultProgramme = document.getElementById("result-programme");
  const ticketStubs = document.getElementById("ticket-stubs");

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove("hidden");
  }
  function clearError() {
    errorMsg.textContent = "";
    errorMsg.classList.add("hidden");
  }

  function switchTab(which) {
    clearError();
    const deptActive = which === "dept";
    tabDept.classList.toggle("active", deptActive);
    tabReg.classList.toggle("active", !deptActive);
    tabDept.setAttribute("aria-selected", String(deptActive));
    tabReg.setAttribute("aria-selected", String(!deptActive));
    panelDept.classList.toggle("hidden", !deptActive);
    panelReg.classList.toggle("hidden", deptActive);
  }
  tabDept.addEventListener("click", () => switchTab("dept"));
  tabReg.addEventListener("click", () => switchTab("reg"));

  function activityClass(activity) {
    const a = activity.toLowerCase();
    if (a.includes("induction")) return "act-induction";
    if (a.includes("ept")) return "act-ept";
    if (a.includes("document")) return "act-document";
    if (a.includes("school")) return "act-school";
    return "act-default";
  }

  function sanitizeRegistrationNumber(regNo) {
    return regNo.toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  function clearSensitiveInput() {
    regInput.value = "";
    regInput.blur();
  }

  function findByRegistrationNumber(regNo) {
    const upper = sanitizeRegistrationNumber(regNo);
    // Build a flat list of {programme, code} sorted by code length desc,
    // so specific codes (e.g. "AIML") are checked before generic ones (e.g. "CSE").
    const flat = [];
    Object.keys(branchCodes).forEach((programme) => {
      if (programme.startsWith("_")) return;
      (branchCodes[programme] || []).forEach((code) => {
        flat.push({ programme, code: code.toUpperCase().replace(/\s+/g, "") });
      });
    });
    flat.sort((a, b) => b.code.length - a.code.length);

    for (const entry of flat) {
      if (upper.includes(entry.code)) {
        return scheduleData.find((p) => p.programme === entry.programme) || null;
      }
    }
    return null;
  }

  function renderResults(programmeData) {
    clearSensitiveInput();
    resultProgramme.textContent = programmeData.programme;
    ticketStubs.innerHTML = "";

    if (!programmeData.schedule || programmeData.schedule.length === 0) {
      const p = document.createElement("p");
      p.className = "no-schedule";
      p.textContent = "No scheduled slots found for this programme yet.";
      ticketStubs.appendChild(p);
    } else {
      programmeData.schedule.forEach((day) => {
        const dateObj = new Date(day.date + "T00:00:00");
        const dayNum = dateObj.getDate();
        const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
        const monthYr = dateObj.toLocaleDateString("en-US", { month: "short", year: "numeric" });

        const stub = document.createElement("div");
        stub.className = "stub";

        const dateCol = document.createElement("div");
        dateCol.className = "stub-date";
        dateCol.innerHTML = `
          <div class="day-num">${dayNum}</div>
          <div class="day-name">${dayName}</div>
          <div class="month-yr">${monthYr}</div>
        `;

        const slotsCol = document.createElement("div");
        slotsCol.className = "stub-slots";
        day.slots.forEach((slot) => {
          const row = document.createElement("div");
          row.className = "slot-row";
          row.innerHTML = `
            <span class="slot-badge">${slot.slot}</span>
            <span class="slot-time">${slot.time}</span>
            <span class="slot-activity ${activityClass(slot.activity)}">${slot.activity}</span>
          `;
          slotsCol.appendChild(row);
        });

        stub.appendChild(dateCol);
        stub.appendChild(slotsCol);
        ticketStubs.appendChild(stub);
      });
    }

    lookupCard.classList.add("hidden");
    resultsSection.classList.remove("hidden");
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  btnDeptSearch.addEventListener("click", () => {
    clearError();
    const val = deptSelect.value;
    if (!val) {
      showError("Please select your department first.");
      return;
    }
    const programmeData = scheduleData.find((p) => p.programme === val);
    if (!programmeData) {
      showError("We couldn't find a schedule for that department.");
      return;
    }
    renderResults(programmeData);
  });

  btnRegSearch.addEventListener("click", () => {
    clearError();
    const val = regInput.value.trim();
    if (!val) {
      showError("Please enter your registration number.");
      return;
    }
    const programmeData = findByRegistrationNumber(val);
    if (!programmeData) {
      showError("We couldn't match that registration number to a department. Try searching by department instead.");
      return;
    }
    renderResults(programmeData);
  });

  regInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btnRegSearch.click();
  });

  btnReset.addEventListener("click", () => {
    resultsSection.classList.add("hidden");
    lookupCard.classList.remove("hidden");
    deptSelect.value = "";
    clearSensitiveInput();
    clearError();
    lookupCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("pagehide", clearSensitiveInput);
  window.addEventListener("beforeunload", clearSensitiveInput);

  function populateDeptSelect() {
    scheduleData
      .slice()
      .sort((a, b) => a.programme.localeCompare(b.programme))
      .forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.programme;
        opt.textContent = p.programme;
        deptSelect.appendChild(opt);
      });
  }

  Promise.all([
    fetch("data.json").then((r) => r.json()),
    fetch("branch-codes.json").then((r) => r.json()),
  ])
    .then(([data, codes]) => {
      scheduleData = data;
      branchCodes = codes;
      populateDeptSelect();
    })
    .catch(() => {
      showError("Couldn't load the schedule data. Please refresh the page.");
    });
})();
