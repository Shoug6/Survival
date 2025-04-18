import { auth, db } from "./firebase-config.js";
import { getDoc, doc, collection, getDocs, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// ✅ التحقق من حالة المستخدم الحالي وجلب بياناته
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            document.getElementById("welcome-message").textContent =` Welcome, ${userData.fullName}!`;
        }

        // ✅ جلب الإشعارات الفعلية من Firestore مع التحقق من recipientId
        const donorId = user.uid;
        const notificationsRef = collection(db, "notifications");
        const q = query(
            notificationsRef,
            where("recipientId", "in", [donorId, "all donors"]), // ✅ يجلب إشعارات المتبرع + إشعارات "all donors"
            orderBy("timestamp", "desc")
        );

        onSnapshot(q, (snapshot) => {
            const notificationsDiv = document.getElementById("notifications-list");

            notificationsDiv.innerHTML = ""; // تنظيف الإشعارات القديمة

            snapshot.forEach((doc) => {
                const data = doc.data();
                const notificationItem = document.createElement("div");
                notificationItem.classList.add("notification-item");
                notificationItem.textContent = data.message; // عرض الرسالة فقط
                notificationsDiv.appendChild(notificationItem); // إضافة الإشعار إلى القائمة
            });
        });
    } else {
        window.location.href = "login.html"; // إعادة التوجيه إلى تسجيل الدخول إذا لم يكن المستخدم مسجلاً
    }
});

// ✅ جلب سجل التبرعات وعرضه عند الضغط على أيقونة Donation History
document.getElementById("donation-history").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (user) {
        const donationsRef = collection(db, "users", user.uid, "donations");
        const donationsSnap = await getDocs(donationsRef);
        
        let historyHTML = "<h3>Your Donation History</h3>";
        donationsSnap.forEach((doc) => {
            const donation = doc.data();
            historyHTML += `
                <div class="notification-item">
                    <p><strong>Hospital:</strong> ${donation.hospital}</p>
                    <p><strong>Date:</strong> ${donation.date}</p>
                    <p><strong>Blood Type:</strong> ${donation.bloodType}</p>
                </div>
            `;
        });

        document.getElementById("notifications-list").innerHTML = historyHTML;
    }
});

// ✅ جلب طلبات التبرع المستلمة وعرضها عند الضغط على Request Donation
document.getElementById("request-donation").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (user) {
        const requestsRef = collection(db, "users", user.uid, "requests");
        const requestsSnap = await getDocs(requestsRef);

        let requestsHTML = "<h3>Pending Donation Requests</h3>";
        requestsSnap.forEach((doc) => {
            const request = doc.data();
            requestsHTML += `
                <div class="notification-item">
                    <p><strong>Hospital:</strong> ${request.hospital}</p>
                    <p><strong>Requested Blood Type:</strong> ${request.bloodType}</p>
                    <p><strong>Urgency:</strong> ${request.urgency}</p>
                    <button onclick="acceptRequest('${doc.id}')">Accept</button>
                    <button onclick="rejectRequest('${doc.id}')">Reject</button>
                </div>
            `;
        });

        document.getElementById("notifications-list").innerHTML = requestsHTML;
    }
});

// ✅ قبول طلب التبرع
async function acceptRequest(requestId) {
    alert("Donation request accepted!");
    // يمكنك تحديث الطلب في قاعدة البيانات إذا أردت
}

// ✅ رفض طلب التبرع
async function rejectRequest(requestId) {
    alert("Donation request rejected!");
    // يمكنك حذف الطلب أو تحديث حالته في قاعدة البيانات
}