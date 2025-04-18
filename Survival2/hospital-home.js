import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot, updateDoc, doc, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBz6IaA5XS_-w4XvrGQJaRbMNPy-FLCwMU",
  authDomain: "survivallink-4cfc2.firebaseapp.com",
  projectId: "survivallink-4cfc2",
  storageBucket: "survivallink-4cfc2.appspot.com",
  messagingSenderId: "180630872481",
  appId: "1:180630872481:web:ab093edc5d57733409abe0",
  measurementId: "G-0EYEL52YWR"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// الحصول على العناصر من الواجهة
const requestDonationBtn = document.getElementById('request-donation');
const emergencyReportBtn = document.getElementById('emergency-report');
const manageHospitalBtn = document.getElementById('manage-hospital');
const sentRequestsBtn = document.getElementById('sent-requests');
const searchDonorsInput = document.getElementById('search-donors');
const notificationsDiv = document.getElementById('notifications'); // تأكد أن هذا هو المربع المناسب

// 1. طلب تبرع
requestDonationBtn.addEventListener('click', async () => {
    const donorId = document.getElementById('donor-id').value; 
    const bloodType = document.getElementById('blood-type').value;

    try {
        await addDoc(collection(db, "donation_requests"), {
            donorId: donorId,
            bloodType: bloodType,
            hospitalId: auth.currentUser.uid, 
            status: "pending", 
            timestamp: new Date()
        });
        alert("تم إرسال طلب التبرع!");
    } catch (error) {
        console.error("Error adding donation request:", error);
    }
});

// 2. إرسال تقرير طوارئ
emergencyReportBtn.addEventListener('click', async () => {
    const reportMessage = document.getElementById('emergency-report-message').value;
    
    try {
        await addDoc(collection(db, "emergency_reports"), {
            hospitalId: auth.currentUser.uid, 
            message: reportMessage,
            timestamp: new Date()
        });
        alert("تم إرسال تقرير الطوارئ!");
    } catch (error) {
        console.error("Error sending emergency report:", error);
    }
});

// 3. إدارة المستشفى
manageHospitalBtn.addEventListener('click', () => {
    const hospitalName = document.getElementById('hospital-name').value;
    const hospitalLocation = document.getElementById('hospital-location').value;
    
    const hospitalRef = doc(db, "hospitals", auth.currentUser.uid);
    updateDoc(hospitalRef, {
        name: hospitalName,
        location: hospitalLocation
    })
    .then(() => {
        alert("تم تحديث بيانات المستشفى!");
    })
    .catch((error) => {
        console.error("Error updating hospital data:", error);
    });
});

// 4. عرض الطلبات المرسلة
sentRequestsBtn.addEventListener('click', async () => {
    const requestsQuery = query(collection(db, "donation_requests"), where("hospitalId", "==", auth.currentUser.uid));

    const querySnapshot = await getDocs(requestsQuery);
    querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
    });
});

// تأكد من أن Firebase قد تم تهيئتها في مكان آخر في الكود قبل هذا الجزء
onAuthStateChanged(auth, (user) => {
    if (user) {
        const hospitalId = user.uid; // معرّف المستشفى المسجل دخوله
        const notificationsRef = collection(db, "notifications");
        const q = query(
            collection(db, "notifications"),
            where("recipientId", "in", [hospitalId, "all hospitals"]), // ✅ يجلب إشعارات المستشفى + إشعارات "all hospitals"
            orderBy("timestamp", "desc")
        );

        onSnapshot(q, (snapshot) => {
            const notificationsDiv = document.getElementById("notifications-list");
            const badge = document.getElementById("notification-badge");

            notificationsDiv.innerHTML = "";
            let count = 0;

            snapshot.forEach((doc) => {
                count++;
                const data = doc.data();
                const notificationItem = document.createElement("div");
                notificationItem.classList.add("notification-item");
                notificationItem.textContent = data.message;
                notificationsDiv.appendChild(notificationItem);
            });

            // 
          
        });
    }
});