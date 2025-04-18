import { auth, db } from "./firebase-config.js";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// ✅ التحقق من تسجيل دخول المتبرع
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const donorId = user.uid;  
        loadDonationRequests(donorId);
    } else {
        window.location.href = "login.html";  
    }
});

// ✅ جلب طلبات التبرع الخاصة بالمتبرع
async function loadDonationRequests(donorId) {
    const requestsContainer = document.getElementById("requests-container");
    requestsContainer.innerHTML = "<p>Loading requests...</p>";

    try {
        const q = query(
            collection(db, "donationRequests"),
            where("donorId", "==", donorId),
            where("status", "==","Pending")
          );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            requestsContainer.innerHTML = "<p>No donation requests available.</p>";
            return;
        }

        requestsContainer.innerHTML = ""; 

        querySnapshot.forEach(async (docSnapshot) => {
            const requestData = docSnapshot.data();
            const requestId = docSnapshot.id;
            const hospitalId = requestData.hospitalId || null;
            let hospitalName = requestData.hospitalName || "Unknown Hospital";
            const donationType = requestData.donationType;
            const requestDate = requestData.donationDate ? new Date(requestData.donationDate).toLocaleDateString() : "N/A";
            const status = requestData.status || "Pending";

            // ✅ جلب اسم المستشفى إذا لم يكن موجودًا في الطلب
            if (!requestData.hospitalName && hospitalId) {
                try {
                    const hospitalRef = doc(db, "users", hospitalId);
                    const hospitalSnap = await getDoc(hospitalRef);
                    if (hospitalSnap.exists()) {
                        hospitalName = hospitalSnap.data().fullName || "Unknown Hospital";
                    }
                } catch (error) {
                    console.error("❌ Error fetching hospital:", error);
                }
            }

            console.log("✅ Request from:", hospitalName); // 🔹 تأكيد اسم المستشفى في الـ Console

            // ✅ إنشاء الطلب في الصفحة
            const requestCard = document.createElement("div");
            requestCard.classList.add("request-card");
            requestCard.innerHTML = `
                <h3>${hospitalName}</h3>
                <p><strong>Donation Type:</strong> ${donationType}</p>
                <p><strong>Requested On:</strong> ${requestDate}</p>
                <p><strong>Status:</strong> <span id="status-${requestId}">${status}</span></p>
                <div id="buttons-${requestId}">
                    ${status === "Pending" ? `
                        <button class="accept-btn" onclick="respondToRequest('${requestId}', 'Accepted')">Accept</button>
                        <button class="reject-btn" onclick="respondToRequest('${requestId}', 'Rejected')">Reject</button>
                    ` : ""}
                </div>
            `;

            requestsContainer.appendChild(requestCard);
        });
    } catch (error) {
        console.error("❌ Error fetching requests:", error);
        requestsContainer.innerHTML = "<p>⚠️ Failed to load requests.</p>";
    }
}

// ✅ تحديث حالة الطلب عند القبول أو الرفض
window.respondToRequest = async function (requestId, response) {
    try {
        const requestRef = doc(db, "donationRequests", requestId);
        await updateDoc(requestRef, { status: response });

        alert(`✅ Request ${response} successfully!`);

        const user = auth.currentUser;
        if (user) {
            loadDonationRequests(user.uid); // إعادة تحميل الطلبات لعرض المعلقة فقط
        }

    } catch (error) {
        console.error("❌ Error updating request:", error);
        alert(`⚠ Failed to update request.`);
    }
};