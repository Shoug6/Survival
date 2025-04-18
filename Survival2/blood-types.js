import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const modal = document.getElementById("bloodTypeModal");
const checkboxContainer = document.getElementById("bloodTypesCheckboxes");
const saveBtn = document.getElementById("saveBtn");

let selectedBankId = null;

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function openModal(bankId, existingTypes = []) {
  selectedBankId = bankId;
  modal.style.display = "block";

  // Generate checkboxes
  checkboxContainer.innerHTML = bloodTypes.map(type => {
    const checked = existingTypes.includes(type) ? "checked" : "";
    return `<label><input type="checkbox" value="${type}" ${checked}> ${type}</label>`;
  }).join("");
}

window.closeModal = function () {
  modal.style.display = "none";
  selectedBankId = null;
};

// Save to Firestore
saveBtn.onclick = async function () {
  if (!selectedBankId) return;

  const selectedTypes = Array.from(checkboxContainer.querySelectorAll("input[type='checkbox']:checked"))
    .map(cb => cb.value);

  try {
    const docRef = doc(db, "bloodBanks", selectedBankId);
    await updateDoc(docRef, { availableBloodTypes: selectedTypes });
    alert("Blood types updated.");
    closeModal();
    loadBloodBanks(); // refresh the table
  } catch (error) {
    console.error("Error updating:", error);
    alert("Failed to update blood types.");
  }
};

// Load table
async function loadBloodBanks() {
  const tableBody = document.getElementById("blood-bank-table");
  tableBody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

  try {
    const snapshot = await getDocs(collection(db, "bloodBanks"));
    tableBody.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const bank = docSnap.data();
      const id = docSnap.id;
      const types = bank.availableBloodTypes || [];

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${bank.name || "-"}</td>
        <td>${bank.location || "-"}</td>
        <td>${types.length ? types.join(", ") : "-"}</td>
        <td><button class="edit-btn" data-id="${id}" data-types='${JSON.stringify(types)}'>Edit</button></td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading blood banks:", err);
  }
}

window.editTypes = function (id, currentTypes) {
  openModal(id, currentTypes);
};

loadBloodBanks();
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("edit-btn")) {
    const bankId = e.target.getAttribute("data-id");
    const types = JSON.parse(e.target.getAttribute("data-types"));
    openModal(bankId,types);
  }
});