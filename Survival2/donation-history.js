import { auth, db } from "./firebase-config.js";
import { collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log("✅ User is logged in:", user.uid);
            loadDonationHistory(user.uid);
        } else {
            console.log("❌ User is not logged in. Redirecting to login...");
            window.location.href = "login.html";  
        }
    });
});

// ✅ جلب سجل التبرعات الخاصة بالمتبرع
async function loadDonationHistory(donorID) {
    const historyList = document.getElementById("donation-history");
    historyList.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

    try {
        console.log("🔹 Fetching donation history for donor ID:", donorID);

        const q = query(
            collection(db, "donationRequests"), 
            where("donorId", "==", donorID), 
            where("status", "==", "Accepted") // ✅ جلب الطلبات المقبولة فقط
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("⚠️ No donation history found.");
            historyList.innerHTML = "<tr><td colspan='4'>No donation history available.</td></tr>";
            return;
        }

        historyList.innerHTML = ""; // ✅ تنظيف الجدول قبل إضافة البيانات الجديدة

        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();
            console.log("📌 Donation Data:", data);

            const donationDate = data.donationDate || "N/A";
            const hospitalID = data.hospitalID || data.hospitalId || "N/A";  // ✅ تأكد من الحقل الصحيح
            const donationType = data.donationType || "Unknown Type";
            const status = data.status || "Pending";

            // ✅ جلب اسم المستشفى من Firestore
            let hospitalName = "Unknown Hospital";
            if (hospitalID !== "N/A") {
                try {
                    console.log("🔹 Fetching hospital name for ID:", hospitalID);
                    const hospitalRef = doc(db, "users", hospitalID); // ✅ تأكد أن المستشفيات مخزنة في مجموعة "users"
                    const hospitalSnap = await getDoc(hospitalRef);
                    if (hospitalSnap.exists()) {
                        hospitalName = hospitalSnap.data().hospitalName || hospitalSnap.data().fullName || "Unknown Hospital";
                        console.log("🏥 Hospital Name Found:", hospitalName);
                    } else {
                        console.log("❌ No hospital data found for ID:", hospitalID);
                    }
                } catch (error) {
                    console.error("⚠️ Error fetching hospital name:", error);
                }
            }

            // ✅ إضافة البيانات إلى الجدول
            const row = `
                <tr>
                    <td>${donationDate}</td>
                    <td>${hospitalName}</td>
                    <td>${donationType}</td>
                    <td class="${status === "Accepted" ? "status-completed" : "status-pending"}">${status}</td>
                </tr>
            `;
            historyList.innerHTML += row;
        }

        console.log("✅ Donation history loaded successfully!");

    } catch (error) {
        console.error("❌ Error fetching donation history:", error);
        historyList.innerHTML = "<tr><td colspan='4'>Failed to load data.</td></tr>";
    }
}