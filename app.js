(function () {
  "use strict";

  let scheduleData = [];

  const deptSelect = document.getElementById("dept-select");
  const btnDeptSearch = document.getElementById("btn-dept-search");
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

  function activityClass(activity) {
    const a = activity.toLowerCase();
    if (a.includes("induction")) return "act-induction";
    if (a.includes("ept")) return "act-ept";
    if (a.includes("document")) return "act-document";
    if (a.includes("school")) return "act-school";
    return "act-default";
  }

  function renderResults(programmeData) {
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

  btnReset.addEventListener("click", () => {
    resultsSection.classList.add("hidden");
    lookupCard.classList.remove("hidden");
    deptSelect.value = "";
    clearError();
    lookupCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });

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

  fetch("data.json")
    .then((r) => r.json())
    .then((data) => {
      scheduleData = data;
      populateDeptSelect();
    })
    .catch(() => {
      showError("Couldn't load the schedule data. Please refresh the page.");
    });
})();
