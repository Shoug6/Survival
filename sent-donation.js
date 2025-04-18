import { auth, db } from "./firebase-config.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// ✅ التحقق من تسجيل دخول المستشفى
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const hospitalId = user.uid; // ✅ جلب معرف المستشفى
        loadSentRequests(hospitalId);
    } else {
        window.location.href = "login.html"; // ✅ إعادة توجيه غير المسجلين
    }
});

// ✅ تحميل الطلبات المرسلة من المستشفى
async function loadSentRequests(hospitalId) {
    const tableBody = document.getElementById("donationTable");
    tableBody.innerHTML = "<tr><td colspan='4'>Loading requests...</td></tr>";

    try {
        // استعلام لجلب الطلبات الخاصة بالمستشفى حسب hospitalId
        const q = query(collection(db, "donationRequests"), where("hospitalId", "==", hospitalId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            tableBody.innerHTML = "<tr><td colspan='4'>No donation requests sent yet.</td></tr>";
            return;
        }

        tableBody.innerHTML = ""; // تنظيف الجدول قبل عرض البيانات الجديدة

        querySnapshot.forEach((docSnapshot) => {
            const requestData = docSnapshot.data();
            const donorName = requestData.donorName || "Unknown Donor";
            const donationType = requestData.donationType || "Unknown";
            const donationDate = requestData.donationDate ? new Date(requestData.donationDate).toLocaleDateString() : "N/A";
            const status = requestData.status || "Pending";

            let statusClass = "pending";
            if (status === "Accepted") statusClass = "accepted";
            if (status === "Rejected") statusClass = "rejected";

            // ✅ إدراج الصف في الجدول
            const row = `
                <tr>
                    <td>${donorName}</td>
                    <td>${donationType}</td>
                    <td>${donationDate}</td>
                    <td><span class="status ${statusClass}">${status}</span></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("❌ Error fetching donation requests:", error);
        tableBody.innerHTML = "<tr><td colspan='4'>⚠️ Failed to load requests.</td></tr>";
    }
}