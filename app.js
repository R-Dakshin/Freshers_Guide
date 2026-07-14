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

  function parseScheduleDate(dateValue) {
    if (!dateValue || typeof dateValue !== "string") return null;

    const isoDate = new Date(dateValue + "T00:00:00");
    if (!Number.isNaN(isoDate.valueOf())) return isoDate;

    const dotMatch = dateValue.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
    if (dotMatch) {
      const [, day, month, year] = dotMatch;
      const formatted = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`;
      const parsed = new Date(formatted);
      if (!Number.isNaN(parsed.valueOf())) return parsed;
    }

    return null;
  }

  function formatScheduleDate(dateText) {
    const rawText = dateText && dateText.trim();
    if (!rawText) {
      return { raw: "Date unavailable" };
    }

    const parsedDate = parseScheduleDate(rawText);
    if (parsedDate) {
      return {
        raw: null,
        dayNum: parsedDate.getDate(),
        dayName: parsedDate.toLocaleDateString("en-US", { weekday: "short" }),
        monthYr: parsedDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      };
    }

    const parts = rawText.split("&").map((part) => part.trim()).filter(Boolean);
    const formattedParts = parts.map((part) => {
      const parsed = parseScheduleDate(part);
      if (parsed) {
        return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
      return part;
    });

    return { raw: formattedParts.join(" & ") };
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
        const dateInfo = formatScheduleDate(day.date);

        const stub = document.createElement("div");
        stub.className = "stub";

        const dateCol = document.createElement("div");
        dateCol.className = "stub-date";
        if (dateInfo.raw) {
          const rawDate = document.createElement("div");
          rawDate.className = "day-num";
          rawDate.textContent = dateInfo.raw;
          dateCol.appendChild(rawDate);
        } else {
          dateCol.innerHTML = `
            <div class="day-num">${dateInfo.dayNum}</div>
            <div class="day-name">${dateInfo.dayName}</div>
            <div class="month-yr">${dateInfo.monthYr}</div>
          `;
        }

        const slotsCol = document.createElement("div");
        slotsCol.className = "stub-slots";
        day.slots.forEach((slot) => {
          const row = document.createElement("div");
          row.className = "slot-row";
          const venueText = slot.venue && slot.venue.trim() ? slot.venue : "Venue details pending";
          row.innerHTML = `
            <div class="slot-line">
              <span class="slot-time">${slot.time}</span>
              <span class="slot-activity ${activityClass(slot.activity)}">${slot.activity}</span>
            </div>
            <div class="slot-venue"><span class="slot-venue-label">Venue:</span><span class="slot-venue-value">${venueText}</span></div>
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
      .filter((p) => p.programme !== "B.Tech. Computer Science and Engineering")
      .sort((a, b) => a.programme.localeCompare(b.programme))
      .forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.programme;
        opt.textContent = p.programme;
        deptSelect.appendChild(opt);
      });
  }

  fetch("data-from-xlsx.json")
    .then((r) => r.json())
    .then((data) => {
      scheduleData = data;
      populateDeptSelect();
    })
    .catch(() => {
      showError("Couldn't load the schedule data. Please refresh the page.");
    });
})();
