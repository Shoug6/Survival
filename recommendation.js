import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

function getCurrentTime() {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

function isWithinWorkingHours(open, close) {
  const now = getCurrentTime();
  return now >= open && now <= close;
}

document.getElementById("emergencyBtn").addEventListener("click", async () => {
  const bloodType = document.getElementById("bloodType").value;

  const bloodBanksSnapshot = await getDocs(collection(db, "bloodBanks"));
  let bestBank = null;
  let highestScore = -1;

  bloodBanksSnapshot.forEach(doc => {
    const data = doc.data();

    const isAvailable = data.isAvailable;
    const availableTypes = data.availableBloodTypes || [];
    const open = data.workingHours?.open || "00:00";
    const close = data.workingHours?.close || "23:59";
    const inWorkingHours = isWithinWorkingHours(open, close);
    const hasBloodType = !bloodType || availableTypes.includes(bloodType);
    const score = data.responseScore || 0;

    if (isAvailable && inWorkingHours && hasBloodType) {
      if (score > highestScore) {
        highestScore = score;
        bestBank = { id: doc.id, ...doc.data() }; // يحتفظ بكل شيء
      }
    }
  });

  if (bestBank) {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${bestBank.name}`;

    Swal.fire({
      title: 'Best Blood Bank Recommendation',
      html: `
        <b>Name:</b> ${bestBank.name}<br>
        <b>Location:</b> ${bestBank.location}<br>
        <b>Available Blood Types:</b> ${bestBank.availableBloodTypes.join(", ")}<br>
        <b>Response Score:</b> ${bestBank.responseScore}
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Open in Google Maps',
      cancelButtonText: 'Close'
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(mapUrl, "_blank");
      }
    });
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'No suitable blood bank found at the moment.'
  });
  }
});