function cleanAccountNumber(accountNumber) {
  return String(accountNumber || "").split("-")[0].trim();
}

function getTextValue(id) {
  return document.getElementById(id).value.trim();
}

function getCurrentDateTime() {
  return new Date().toLocaleString();
}

function getCycleFromRoute(route) {
  const routeText = String(route || "").trim();
  const firstNumber = routeText.charAt(0);

  if (firstNumber >= "1" && firstNumber <= "8") {
    return "Cycle " + firstNumber;
  }

  return "INA";
}

function getSelectedImage() {
  const fileInput = document.getElementById("newImage");

  return new Promise(function(resolve) {
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      resolve("");
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
      resolve(event.target.result);
    };

    reader.readAsDataURL(file);
  });
}

const isAdminPage = window.location.pathname.toLowerCase().includes("admin.html");
let recordBeingEdited = "";

let meterRecords = JSON.parse(localStorage.getItem("meterRecords")) || [
  {
    accountNumber: "514000630",
    serviceAddress: "123 Sample Street",
    ecrNumber: "12345678",
    mxuNumber: "87654321",
    meterSize: "5/8",
    meterType: "Radio",
    route: "514",
    cycle: "Cycle 5",
    additionalNotes: "Meter is behind the left gate near the shed.",
    image: "images/sample-meter.jpg",
    lastUpdated: "9/8/2026, 11:45:00 AM"
  },
  {
    accountNumber: "321005227",
    serviceAddress: "456 Demo Road",
    ecrNumber: "22222222",
    mxuNumber: "33333333",
    meterSize: "1 inch",
    meterType: "Manual",
    route: "321",
    cycle: "Cycle 3",
    additionalNotes: "Meter is near the driveway culvert.",
    image: "images/sample-meter.jpg",
    lastUpdated: "9/8/2026, 11:45:00 AM"
  },
  {
    accountNumber: "777000111",
    serviceAddress: "789 Test Lane",
    ecrNumber: "44444444",
    mxuNumber: "55555555",
    meterSize: "2 inch",
    meterType: "Compound",
    route: "777",
    cycle: "Cycle 7",
    additionalNotes: "Meter box is near the front fence line.",
    image: "images/sample-meter.jpg",
    lastUpdated: "9/8/2026, 11:45:00 AM"
  }
];

meterRecords = meterRecords.map(function(record) {
  const cleanedRoute = record.route || "";

  return {
    accountNumber: cleanAccountNumber(record.accountNumber),
    serviceAddress: record.serviceAddress || "",
    ecrNumber: record.ecrNumber || "",
    mxuNumber: record.mxuNumber || "",
    meterSize: record.meterSize || "",
    meterType: record.meterType || "",
    route: cleanedRoute,
    cycle: record.cycle || getCycleFromRoute(cleanedRoute),
    additionalNotes: record.additionalNotes || "",
    image: record.image || "",
    lastUpdated: record.lastUpdated || "Not recorded"
  };
});

localStorage.setItem("meterRecords", JSON.stringify(meterRecords));

function displayRecords(records, searchTerm = "") {
  const resultsDiv = document.getElementById("results");

  resultsDiv.innerHTML = "";

  if (records.length === 0) {
    resultsDiv.innerHTML = `
      <div class="start-message">
        <h2>No matching meter locations found</h2>
        <p>Try searching by account number, service address, ECR number, MXU number, route, meter type, or a keyword from the notes.</p>
      </div>
    `;
    return;
  }

  if (searchTerm !== "") {
    resultsDiv.innerHTML += `
      <p class="result-summary">
        ${records.length} matching meter location record(s) found for: <strong>${searchTerm}</strong>
      </p>
    `;
  }

  records.forEach(function(record) {
    const adminButtons = isAdminPage
      ? `
        <button class="update-button" onclick="editRecord('${record.accountNumber}')">
          Edit Test Record
        </button>

        <button class="delete-button" onclick="deleteRecord('${record.accountNumber}')">
          Delete Test Record
        </button>
      `
      : "";

    resultsDiv.innerHTML += `
      <div class="record-card">
        <h2>${record.serviceAddress || "Service Address Not Added"}</h2>

        <div class="location-note">
          <h3>Additional Notes</h3>
          <p>${record.additionalNotes || "No additional notes added yet."}</p>
        </div>

        <div class="record-grid">
          <p><strong>Account Number:</strong> ${record.accountNumber}</p>
          <p><strong>Route:</strong> ${record.route}</p>
          <p><strong>ECR Number:</strong> ${record.ecrNumber}</p>
          <p><strong>MXU Number:</strong> ${record.mxuNumber}</p>
          <p><strong>Meter Size:</strong> ${record.meterSize}</p>
          <p><strong>Meter Type:</strong> ${record.meterType}</p>
          <p><strong>Last Updated:</strong> ${record.lastUpdated}</p>
        </div>

        <div class="photo-box">
          ${
            record.image
              ? `
                <img 
                  src="${record.image}" 
                  alt="Meter location photo" 
                  class="meter-photo"
                  onclick="openImage(this.src)"
                >
                <p class="photo-help">Click photo to open larger.</p>
              `
              : `<p>No image attached yet.</p>`
          }
        </div>

        <button class="notes-button" onclick="updateAdditionalNotes('${record.accountNumber}')">
  Update Additional Notes
</button>

${adminButtons}
      </div>
    `;
  });
}

function searchRouteBook() {
  const rawSearchValue = document.getElementById("searchInput").value.trim().toLowerCase();

  if (rawSearchValue === "") {
    showStartMessage();
    return;
  }

  const cleanSearchValue = cleanAccountNumber(rawSearchValue).toLowerCase();

  const filteredRecords = meterRecords.filter(function(record) {
    return (
      record.accountNumber.toLowerCase().includes(cleanSearchValue) ||
      record.serviceAddress.toLowerCase().includes(rawSearchValue) ||
      record.ecrNumber.toLowerCase().includes(rawSearchValue) ||
      record.mxuNumber.toLowerCase().includes(rawSearchValue) ||
      record.meterSize.toLowerCase().includes(rawSearchValue) ||
      record.meterType.toLowerCase().includes(rawSearchValue) ||
      record.route.toLowerCase().includes(rawSearchValue) ||
      record.additionalNotes.toLowerCase().includes(rawSearchValue)
    );
  });

  displayRecords(filteredRecords, rawSearchValue);
}

function showStartMessage() {
  const resultsDiv = document.getElementById("results");

  resultsDiv.innerHTML = `
    <div class="start-message">
      <h2>Search for a meter location</h2>
      <p>Enter an account number, service address, ECR number, MXU number, meter size, meter type, route, or note keyword to pull up meter location details.</p>
    </div>
  `;
}

function clearSearch() {
  document.getElementById("searchInput").value = "";
  showStartMessage();
}

document.getElementById("searchInput").addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    searchRouteBook();
  }
});

showStartMessage();

async function addMeterRecord() {
  const accountNumber = cleanAccountNumber(getTextValue("newAccount"));
  const serviceAddress = getTextValue("newAddress");
  const ecrNumber = getTextValue("newEcr");
  const mxuNumber = getTextValue("newMxu");
  const meterSize = getTextValue("newMeterSize");
  const meterType = getTextValue("newMeterType");
  const route = getTextValue("newRoute");
  const cycle = getCycleFromRoute(route);
  const additionalNotes = getTextValue("newNotes");
  const selectedImage = await getSelectedImage();

  const message = document.getElementById("formMessage");

  if (accountNumber === "" || serviceAddress === "" || additionalNotes === "") {
    message.textContent = "Please enter at least an account number, service address, and additional notes.";
    message.className = "error-message";
    return;
  }

  const duplicateRecord = meterRecords.find(function(record) {
    return record.accountNumber === accountNumber;
  });

  if (duplicateRecord) {
    message.textContent = "A record with this account number already exists. Search for it and use Edit Test Record instead.";
    message.className = "error-message";
    return;
  }

  const newRecord = {
    accountNumber: accountNumber,
    serviceAddress: serviceAddress,
    ecrNumber: ecrNumber,
    mxuNumber: mxuNumber,
    meterSize: meterSize,
    meterType: meterType,
    route: route,
    cycle: cycle,
    additionalNotes: additionalNotes,
    image: selectedImage,
    lastUpdated: getCurrentDateTime()
  };

  meterRecords.push(newRecord);

  localStorage.setItem("meterRecords", JSON.stringify(meterRecords));

  clearForm();

  message.textContent = "Meter location record added successfully.";
  message.className = "success-message";

  displayRecords([newRecord]);
}

function editRecord(accountNumber) {
  const record = meterRecords.find(function(record) {
    return record.accountNumber === accountNumber;
  });

  if (!record) {
    alert("Record not found.");
    return;
  }

  recordBeingEdited = accountNumber;

  document.getElementById("newAccount").value = record.accountNumber;
  document.getElementById("newAddress").value = record.serviceAddress;
  document.getElementById("newEcr").value = record.ecrNumber;
  document.getElementById("newMxu").value = record.mxuNumber;
  document.getElementById("newMeterSize").value = record.meterSize;
  document.getElementById("newMeterType").value = record.meterType;
  document.getElementById("newRoute").value = record.route;
  document.getElementById("newNotes").value = record.additionalNotes;

  const message = document.getElementById("formMessage");
  message.textContent = "Editing test record. Make your changes, then click Update Test Record. Choose a new image only if you want to replace the current one.";
  message.className = "success-message";

  const formSection = document.getElementById("addRecordSection");
  const button = document.getElementById("formToggleButton");

  formSection.classList.remove("hidden-section");
  button.textContent = "Hide Add/Edit Form";

  formSection.scrollIntoView({ behavior: "smooth" });
}

async function updateMeterRecord() {
  if (recordBeingEdited === "") {
    alert("Please click Edit Test Record first.");
    return;
  }

  const updatedAccountNumber = cleanAccountNumber(getTextValue("newAccount"));
  const updatedServiceAddress = getTextValue("newAddress");
  const updatedEcrNumber = getTextValue("newEcr");
  const updatedMxuNumber = getTextValue("newMxu");
  const updatedMeterSize = getTextValue("newMeterSize");
  const updatedMeterType = getTextValue("newMeterType");
  const updatedRoute = getTextValue("newRoute");
  const updatedCycle = getCycleFromRoute(updatedRoute);
  const updatedAdditionalNotes = getTextValue("newNotes");
  const updatedImage = await getSelectedImage();

  const message = document.getElementById("formMessage");

  if (updatedAccountNumber === "" || updatedServiceAddress === "" || updatedAdditionalNotes === "") {
    message.textContent = "Please enter at least an account number, service address, and additional notes.";
    message.className = "error-message";
    return;
  }

  const duplicateRecord = meterRecords.find(function(record) {
    return record.accountNumber === updatedAccountNumber && record.accountNumber !== recordBeingEdited;
  });

  if (duplicateRecord) {
    message.textContent = "Another record already uses this account number. Please use a different account number.";
    message.className = "error-message";
    return;
  }

  const record = meterRecords.find(function(record) {
    return record.accountNumber === recordBeingEdited;
  });

  if (!record) {
    alert("Record not found.");
    return;
  }

  record.accountNumber = updatedAccountNumber;
  record.serviceAddress = updatedServiceAddress;
  record.ecrNumber = updatedEcrNumber;
  record.mxuNumber = updatedMxuNumber;
  record.meterSize = updatedMeterSize;
  record.meterType = updatedMeterType;
  record.route = updatedRoute;
  record.cycle = updatedCycle;
  record.additionalNotes = updatedAdditionalNotes;
  record.lastUpdated = getCurrentDateTime();

  if (updatedImage !== "") {
    record.image = updatedImage;
  }

  localStorage.setItem("meterRecords", JSON.stringify(meterRecords));

  recordBeingEdited = "";

  clearForm();

  message.textContent = "Meter location record updated successfully.";
  message.className = "success-message";

  displayRecords([record]);
}

function deleteRecord(accountNumber) {
  const confirmed = confirm("Are you sure you want to delete this test record?");

  if (!confirmed) {
    return;
  }

  meterRecords = meterRecords.filter(function(record) {
    return record.accountNumber !== accountNumber;
  });

  localStorage.setItem("meterRecords", JSON.stringify(meterRecords));

  showStartMessage();
}

function clearForm() {
  document.getElementById("newAccount").value = "";
  document.getElementById("newAddress").value = "";
  document.getElementById("newEcr").value = "";
  document.getElementById("newMxu").value = "";
  document.getElementById("newMeterSize").value = "";
  document.getElementById("newMeterType").value = "";
  document.getElementById("newRoute").value = "";
  document.getElementById("newNotes").value = "";

  const imageInput = document.getElementById("newImage");
  if (imageInput) {
    imageInput.value = "";
  }
}

function cancelEdit() {
  recordBeingEdited = "";

  clearForm();

  const message = document.getElementById("formMessage");
  message.textContent = "Edit cancelled.";
  message.className = "success-message";

  showStartMessage();
}

function exportRecords() {
  const recordsAsText = JSON.stringify(meterRecords, null, 2);

  const file = new Blob([recordsAsText], { type: "application/json" });

  const temporaryLink = document.createElement("a");
  temporaryLink.href = URL.createObjectURL(file);
  temporaryLink.download = "meter-location-list-backup.json";

  temporaryLink.click();

  URL.revokeObjectURL(temporaryLink.href);
}

function importRecords(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const importedRecords = JSON.parse(e.target.result);

      if (!Array.isArray(importedRecords)) {
        alert("This file does not look like a valid meter location backup.");
        return;
      }

      const confirmed = confirm("This will replace your current test records with the imported backup. Continue?");

      if (!confirmed) {
        return;
      }

      meterRecords = importedRecords.map(function(record) {
        const importedRoute = record.route || "";

        return {
          accountNumber: cleanAccountNumber(record.accountNumber),
          serviceAddress: record.serviceAddress || "",
          ecrNumber: record.ecrNumber || "",
          mxuNumber: record.mxuNumber || "",
          meterSize: record.meterSize || "",
          meterType: record.meterType || "",
          route: importedRoute,
          cycle: record.cycle || getCycleFromRoute(importedRoute),
          additionalNotes: record.additionalNotes || "",
          image: record.image || "",
          lastUpdated: record.lastUpdated || "Not recorded"
        };
      });

      localStorage.setItem("meterRecords", JSON.stringify(meterRecords));

      alert("Test data imported successfully.");

      showStartMessage();
    } catch (error) {
      alert("There was a problem importing this file.");
    }
  };

  reader.readAsText(file);
}

function showAllRecords() {
  document.getElementById("searchInput").value = "";
  displayCompactReport(meterRecords, "", "All Meter Locations");
}

function toggleAddForm() {
  const formSection = document.getElementById("addRecordSection");
  const button = document.getElementById("formToggleButton");

  formSection.classList.toggle("hidden-section");

  if (formSection.classList.contains("hidden-section")) {
    button.textContent = "Show Add/Edit Form";
  } else {
    button.textContent = "Hide Add/Edit Form";
  }
}

function openImage(imageSource) {
  window.open(imageSource, "_blank");
}

function parseCsvText(csvText) {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const character = csvText[i];
    const nextCharacter = csvText[i + 1];

    if (character === '"' && insideQuotes && nextCharacter === '"') {
      currentValue += '"';
      i++;
    } else if (character === '"') {
      insideQuotes = !insideQuotes;
    } else if (character === "," && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
    } else if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        i++;
      }

      currentRow.push(currentValue);

      if (currentRow.some(function(value) { return value.trim() !== ""; })) {
        rows.push(currentRow);
      }

      currentRow = [];
      currentValue = "";
    } else {
      currentValue += character;
    }
  }

  currentRow.push(currentValue);

  if (currentRow.some(function(value) { return value.trim() !== ""; })) {
    rows.push(currentRow);
  }

  return rows;
}

function normalizeCsvHeader(header) {
  return String(header || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase();
}

function getCsvValue(rowObject, columnName) {
  return rowObject[normalizeCsvHeader(columnName)] || "";
}

function importCsvAccountUpdates(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const confirmed = confirm(
    "This will update records from the CSV using Account# as the match. It will update Address, Route, Cycle, ECR Number, MXU Number, Meter Size, and Meter Type only. Additional Notes and images will not be changed. Continue?"
  );

  if (!confirmed) {
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const csvText = e.target.result;
      const rows = parseCsvText(csvText);

      if (rows.length < 2) {
        alert("This CSV does not appear to have any data rows.");
        return;
      }

      const headers = rows[0].map(function(header) {
        return normalizeCsvHeader(header);
      });

      const requiredHeaders = [
        "account#",
        "address",
        "meter#",
        "mxu#",
        "line size",
        "manufacturer"
      ];

      const missingHeaders = requiredHeaders.filter(function(requiredHeader) {
        return !headers.includes(requiredHeader);
      });

      if (missingHeaders.length > 0) {
        alert("The CSV is missing required column(s): " + missingHeaders.join(", "));
        return;
      }

      let updatedCount = 0;
      let createdCount = 0;
      let skippedCount = 0;
      let duplicateCount = 0;

      const accountsProcessedFromThisCsv = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const rowObject = {};

        headers.forEach(function(header, index) {
          rowObject[header] = row[index] ? row[index].trim() : "";
        });

        const csvAccountNumber = cleanAccountNumber(getCsvValue(rowObject, "Account#"));

        if (csvAccountNumber === "") {
          skippedCount++;
          continue;
        }

        if (accountsProcessedFromThisCsv.includes(csvAccountNumber)) {
          duplicateCount++;
          continue;
        }

        accountsProcessedFromThisCsv.push(csvAccountNumber);

        const csvAddress = getCsvValue(rowObject, "Address");
        const csvRoute = csvAccountNumber.substring(0, 3);
        const csvCycle = getCycleFromRoute(csvRoute);
        const csvEcrNumber = getCsvValue(rowObject, "Meter#");
        const csvMxuNumber = getCsvValue(rowObject, "MXU#");
        const csvMeterSize = getCsvValue(rowObject, "Line Size");
        const csvMeterType = getCsvValue(rowObject, "Manufacturer");

        const existingRecord = meterRecords.find(function(record) {
          return record.accountNumber === csvAccountNumber;
        });

        if (existingRecord) {
          existingRecord.serviceAddress = csvAddress;
          existingRecord.route = csvRoute;
          existingRecord.cycle = csvCycle;
          existingRecord.ecrNumber = csvEcrNumber;
          existingRecord.mxuNumber = csvMxuNumber;
          existingRecord.meterSize = csvMeterSize;
          existingRecord.meterType = csvMeterType;
          existingRecord.lastUpdated = getCurrentDateTime();

          updatedCount++;
        } else {
          const newRecord = {
            accountNumber: csvAccountNumber,
            serviceAddress: csvAddress,
            ecrNumber: csvEcrNumber,
            mxuNumber: csvMxuNumber,
            meterSize: csvMeterSize,
            meterType: csvMeterType,
            route: csvRoute,
            cycle: csvCycle,
            additionalNotes: "",
            image: "",
            lastUpdated: getCurrentDateTime()
          };

          meterRecords.push(newRecord);

          createdCount++;
        }
      }

      localStorage.setItem("meterRecords", JSON.stringify(meterRecords));

      alert(
        "CSV import complete.\n\n" +
        "Updated records: " + updatedCount + "\n" +
        "Created records: " + createdCount + "\n" +
        "Skipped blank rows: " + skippedCount + "\n" +
        "Skipped duplicate account rows: " + duplicateCount
      );

      showStartMessage();

      event.target.value = "";
    } catch (error) {
      alert("There was a problem importing the CSV file.");
      event.target.value = "";
    }
  };

  reader.readAsText(file);
}
function runRouteCycleReport() {
  const routeInput = document.getElementById("routeReportInput");
  const cycleSelect = document.getElementById("cycleReportSelect");

  if (!routeInput || !cycleSelect) {
    return;
  }

  const selectedRoute = routeInput.value.trim().toLowerCase();
  const selectedCycle = cycleSelect.value.trim();

  if (selectedRoute === "" && selectedCycle === "") {
    alert("Please enter a route or select a cycle first.");
    return;
  }

  const filteredRecords = meterRecords.filter(function(record) {
    const recordRoute = String(record.route || "").toLowerCase();
    const recordCycle = record.cycle || getCycleFromRoute(record.route);

    const routeMatches = selectedRoute === "" || recordRoute === selectedRoute;
    const cycleMatches = selectedCycle === "" || recordCycle === selectedCycle;

    return routeMatches && cycleMatches;
  });

  displayCompactReport(filteredRecords, selectedRoute, selectedCycle);
}

function displayCompactReport(records, selectedRoute, selectedCycle) {
  const resultsDiv = document.getElementById("results");

  if (records.length === 0) {
    resultsDiv.innerHTML = `
      <div class="start-message">
        <h2>No records found</h2>
        <p>No meter locations matched that route/cycle selection.</p>
      </div>
    `;
    return;
  }

  records.sort(function(a, b) {
    return String(a.accountNumber).localeCompare(String(b.accountNumber));
  });

  let reportTitle = "Compact Meter Location Report";

  if (selectedRoute !== "" && selectedCycle !== "") {
    reportTitle = "Route " + selectedRoute + " / " + selectedCycle;
  } else if (selectedRoute !== "") {
    reportTitle = "Route " + selectedRoute;
  } else if (selectedCycle !== "") {
    reportTitle = selectedCycle;
  }

  let tableRows = "";

  records.forEach(function(record) {
    tableRows += `
      <tr>
        <td>${record.accountNumber}</td>
        <td>${record.serviceAddress || ""}</td>
        <td>${record.ecrNumber || ""}</td>
        <td>${record.mxuNumber || ""}</td>
        <td>${record.meterSize || ""}</td>
        <td>${record.meterType || ""}</td>
        <td class="compact-notes">${record.additionalNotes || ""}</td>
      </tr>
    `;
  });

  resultsDiv.innerHTML = `
    <p class="result-summary">
      ${records.length} record(s) found for: <strong>${reportTitle}</strong>
    </p>

    <table class="compact-report-table">
      <thead>
        <tr>
          <th>Account #</th>
          <th>Service Address</th>
          <th>ECR #</th>
          <th>MXU #</th>
          <th>Meter Size</th>
          <th>Meter Type</th>
          <th>Additional Notes</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;
}

function clearRouteCycleReport() {
  const routeInput = document.getElementById("routeReportInput");
  const cycleSelect = document.getElementById("cycleReportSelect");

  if (routeInput) {
    routeInput.value = "";
  }

  if (cycleSelect) {
    cycleSelect.value = "";
  }

  showStartMessage();
}
function exportRouteCycleReportPdf() {
  const compactReport = document.querySelector(".compact-report-table");

  if (!compactReport) {
    alert("Please run a Route / Cycle Review report first.");
    return;
  }

  document.body.classList.add("printing-report");

  window.print();

  setTimeout(function() {
    document.body.classList.remove("printing-report");
  }, 500);
}
function clearEntireDatabase() {
  if (!isAdminPage) {
    alert("This action is only available from the admin page.");
    return;
  }

  const firstConfirm = confirm(
    "WARNING: This will delete ALL meter location records from this browser database. Please export a backup first if you need one. Continue?"
  );

  if (!firstConfirm) {
    return;
  }

  const secondConfirm = confirm(
    "Are you absolutely sure? This cannot be undone unless you have an exported backup file."
  );

  if (!secondConfirm) {
    return;
  }

  meterRecords = [];

  localStorage.setItem("meterRecords", JSON.stringify(meterRecords));

  document.getElementById("searchInput").value = "";

  clearForm();
  showStartMessage();

  const message = document.getElementById("formMessage");

  if (message) {
    message.textContent = "All meter location records have been cleared.";
    message.className = "success-message";
  }

  alert("All meter location records have been cleared.");
}
function updateAdditionalNotes(accountNumber) {
  const record = meterRecords.find(function(record) {
    return record.accountNumber === accountNumber;
  });

  if (!record) {
    alert("Record not found.");
    return;
  }

  const newNotes = prompt(
    "Update Additional Notes for account " + record.accountNumber + ":",
    record.additionalNotes || ""
  );

  if (newNotes === null) {
    return;
  }

  record.additionalNotes = newNotes.trim();
  record.lastUpdated = getCurrentDateTime();

  localStorage.setItem("meterRecords", JSON.stringify(meterRecords));

  alert("Additional Notes updated successfully.");

  displayRecords([record]);
}